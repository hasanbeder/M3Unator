#!/usr/bin/env node
/**
 * Skill Compliance Checker (JavaScript Edition)
 * Validates that code follows the project's skill rules.
 *
 * Usage:
 *   node check_skill_compliance.js <source-directory>
 *   node check_skill_compliance.js --staged
 *   node check_skill_compliance.js --file path/to/file.js
 *
 * Example:
 *   node check_skill_compliance.js .
 *   node check_skill_compliance.js --file M3Unator.user.js --strict
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class Violation {
    constructor(file, line, skill, rule, severity, message, fixSuggestion = null) {
        this.file = file;
        this.line = line;
        this.skill = skill;
        this.rule = rule;
        this.severity = severity;
        this.message = message;
        this.fixSuggestion = fixSuggestion;
    }
}

class ComplianceReport {
    constructor(filesChecked) {
        this.filesChecked = filesChecked;
        this.violations = [];
        this.errors = [];
    }

    get criticalCount() {
        return this.violations.filter(violation => violation.severity === 'CRITICAL').length;
    }

    get highCount() {
        return this.violations.filter(violation => violation.severity === 'HIGH').length;
    }

    get passed() {
        return this.criticalCount === 0 && this.highCount === 0;
    }
}

function getStagedFiles() {
    try {
        const result = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf-8' });
        return result.trim().split('\n').filter(Boolean);
    } catch {
        return [];
    }
}

function getSkills() {
    const skills = {};
    const skillsDir = '.claude/skills';

    if (!fs.existsSync(skillsDir)) {
        return skills;
    }

    const items = fs.readdirSync(skillsDir);
    for (const item of items) {
        const skillPath = path.join(skillsDir, item);
        const stat = fs.statSync(skillPath);

        if (stat.isDirectory() && !item.startsWith('_') && !item.startsWith('.')) {
            const skillMd = path.join(skillPath, 'SKILL.md');
            if (fs.existsSync(skillMd)) {
                skills[item] = {
                    name: item,
                    path: skillPath,
                    content: fs.readFileSync(skillMd, 'utf-8')
                };
            }
        }
    }

    return skills;
}

function getRelevantSkills(filePath, skills) {
    const relevant = [];

    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        if (skills['typescript-standards']) relevant.push('typescript-standards');
    } else if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
        if (skills['javascript-standards']) relevant.push('javascript-standards');
    } else if (filePath.endsWith('.py')) {
        if (skills['python-standards']) relevant.push('python-standards');
    } else if (filePath.endsWith('.go')) {
        if (skills['go-standards']) relevant.push('go-standards');
    }

    if (skills['error-handling']) relevant.push('error-handling');
    if (skills['security-hardening']) relevant.push('security-hardening');

    if (filePath.includes('components/') || filePath.includes('ui/')) {
        relevant.push('ui-engineering');
    }
    if (
        filePath.includes('test/') ||
        filePath.includes('tests/') ||
        filePath.includes('.test.') ||
        filePath.includes('.spec.')
    ) {
        relevant.push('testing-strategy');
    }
    if (filePath.endsWith('.user.js') || filePath.endsWith('.meta.js')) {
        relevant.push('userscript-patterns', 'directory-scanning-engine');
    }

    return [...new Set(relevant)];
}

function checkJavaScriptStandards(content, filePath) {
    const violations = [];
    const lines = content.split('\n');
    const legacyVarPattern = new RegExp(['\\b', 'var', '\\s+'].join(''));
    const legacyWithPattern = new RegExp(['\\b', 'with', '\\s*\\('].join(''));
    const legacyDocumentWritePattern = new RegExp(['document', '\\.', 'write', '\\s*\\('].join(''));

    const checks = [
        {
            pattern: legacyVarPattern,
            rule: 'No legacy function-scoped declarations',
            severity: 'MEDIUM',
            message: "Found 'var' declaration - use 'const' or 'let'",
            fix: "Replace 'var' with 'const' or 'let'"
        },
        {
            pattern: legacyWithPattern,
            rule: 'No with blocks',
            severity: 'HIGH',
            message: 'Legacy scope block detected - scope ambiguity is forbidden',
            fix: 'Refactor to explicit property access'
        },
        {
            pattern: legacyDocumentWritePattern,
            rule: 'No document.write',
            severity: 'HIGH',
            message: 'Legacy DOM stream write detected - unsafe and disruptive in modern pages',
            fix: 'Use DOM APIs to create and insert elements'
        }
    ];

    lines.forEach((line, index) => {
        for (const check of checks) {
            if (check.pattern.test(line)) {
                violations.push(
                    new Violation(
                        filePath,
                        index + 1,
                        'javascript-standards',
                        check.rule,
                        check.severity,
                        check.message,
                        check.fix
                    )
                );
            }
        }
    });

    return violations;
}

function checkTypeScriptStandards(content, filePath) {
    const violations = [];
    const lines = content.split('\n');

    const anyPattern = /:\s*any\b/;
    lines.forEach((line, index) => {
        if (anyPattern.test(line)) {
            violations.push(
                new Violation(
                    filePath,
                    index + 1,
                    'typescript-standards',
                    "No 'any' types",
                    'HIGH',
                    "Found 'any' type - use specific type or 'unknown'",
                    "Replace 'any' with specific type or 'unknown'"
                )
            );
        }
    });

    const funcPattern = /export\s+(?:async\s+)?function\s+\w+\s*\([^)]*\)(?!\s*:)(?!\s*<)/;
    lines.forEach((line, index) => {
        if (funcPattern.test(line)) {
            violations.push(
                new Violation(
                    filePath,
                    index + 1,
                    'typescript-standards',
                    'Explicit return types',
                    'MEDIUM',
                    'Exported function missing explicit return type',
                    'Add return type annotation'
                )
            );
        }
    });

    return violations;
}

function checkSecurityHardening(content, filePath) {
    const violations = [];
    const lines = content.split('\n');

    const sqlPatterns = [/query\s*\(\s*[`"'].*?\$\{.*?\}/, /execute\s*\(\s*[`"'].*?\+/];
    lines.forEach((line, index) => {
        for (const pattern of sqlPatterns) {
            if (pattern.test(line)) {
                violations.push(
                    new Violation(
                        filePath,
                        index + 1,
                        'security-hardening',
                        'SQL injection prevention',
                        'CRITICAL',
                        'Possible SQL injection - use parameterized queries',
                        'Use parameterized queries or ORM'
                    )
                );
            }
        }
    });

    const localstoragePattern = /localStorage\.(set|get)Item\s*\(\s*['"](token|jwt|auth)/i;
    lines.forEach((line, index) => {
        if (localstoragePattern.test(line)) {
            violations.push(
                new Violation(
                    filePath,
                    index + 1,
                    'security-hardening',
                    'JWT storage',
                    'CRITICAL',
                    'JWT stored in localStorage - use httpOnly cookies or avoid tokens in this project',
                    'Use secure cookie/session strategy instead'
                )
            );
        }
    });

    const evalPattern = /\b(eval|new Function)\s*\(/;
    lines.forEach((line, index) => {
        if (evalPattern.test(line)) {
            violations.push(
                new Violation(
                    filePath,
                    index + 1,
                    'security-hardening',
                    'No dynamic code execution',
                    'CRITICAL',
                    'Dynamic code execution detected - major security risk',
                    'Replace eval/new Function with explicit logic'
                )
            );
        }
    });

    return violations;
}

function checkErrorHandling(content, filePath) {
    const violations = [];
    const lines = content.split('\n');

    const errorPattern = /throw\s+new\s+Error\s*\(/;
    lines.forEach((line, index) => {
        if (errorPattern.test(line)) {
            violations.push(
                new Violation(
                    filePath,
                    index + 1,
                    'error-handling',
                    'Structured error context',
                    'MEDIUM',
                    'Generic Error thrown - add a project-specific message or wrapper before surfacing it',
                    'Wrap with a project error helper or enrich the message with operation context'
                )
            );
        }
    });

    const contentWithoutNewlines = content.replace(/\n/g, ' ');
    const emptyCatchPattern = /catch\s*\([^)]*\)\s*\{\s*\}/;
    if (emptyCatchPattern.test(contentWithoutNewlines)) {
        lines.forEach((line, index) => {
            if (line.includes('catch') && lines[index + 1] && lines[index + 1].trim() === '}') {
                violations.push(
                    new Violation(
                        filePath,
                        index + 1,
                        'error-handling',
                        'No empty catch blocks',
                        'HIGH',
                        'Empty catch block - errors are silently swallowed',
                        'Handle the error, log it, or re-throw it'
                    )
                );
            }
        });
    }

    return violations;
}

function checkTestingStrategy(content, filePath) {
    const violations = [];
    const lines = content.split('\n');

    const onlyPattern = /\.(only|skip)\s*\(/;
    lines.forEach((line, index) => {
        if (onlyPattern.test(line)) {
            violations.push(
                new Violation(
                    filePath,
                    index + 1,
                    'testing-strategy',
                    'No .only/.skip in commits',
                    'HIGH',
                    'Test has .only or .skip - it will hide coverage gaps',
                    'Remove .only/.skip before committing'
                )
            );
        }
    });

    return violations;
}

function checkFile(filePath, skills) {
    const violations = [];

    if (!fs.existsSync(filePath)) {
        return violations;
    }

    let content;
    try {
        content = fs.readFileSync(filePath, 'utf-8');
    } catch {
        return violations;
    }

    const relevantSkills = getRelevantSkills(filePath, skills);

    if ((filePath.endsWith('.js') || filePath.endsWith('.jsx')) && relevantSkills.includes('javascript-standards')) {
        violations.push(...checkJavaScriptStandards(content, filePath));
    }

    if ((filePath.endsWith('.ts') || filePath.endsWith('.tsx')) && relevantSkills.includes('typescript-standards')) {
        violations.push(...checkTypeScriptStandards(content, filePath));
    }

    if (relevantSkills.includes('security-hardening')) {
        violations.push(...checkSecurityHardening(content, filePath));
    }

    if (relevantSkills.includes('error-handling')) {
        violations.push(...checkErrorHandling(content, filePath));
    }

    if (relevantSkills.includes('testing-strategy') && (filePath.includes('.test.') || filePath.includes('.spec.'))) {
        violations.push(...checkTestingStrategy(content, filePath));
    }

    return violations;
}

function printReport(report) {
    console.log('\n' + '='.repeat(70));
    console.log('  SKILL COMPLIANCE REPORT');
    console.log('='.repeat(70));
    console.log(`  Files checked: ${report.filesChecked}`);
    console.log(`  Violations: ${report.violations.length}`);
    console.log(`    🔴 Critical: ${report.criticalCount}`);
    console.log(`    🟠 High: ${report.highCount}`);
    console.log(`    🟡 Medium: ${report.violations.filter(v => v.severity === 'MEDIUM').length}`);
    console.log(`    🟢 Low: ${report.violations.filter(v => v.severity === 'LOW').length}`);
    console.log('='.repeat(70));

    if (report.violations.length > 0) {
        console.log('\n  VIOLATIONS:');
        console.log('  ' + '-'.repeat(68));

        const severities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
        const icons = { CRITICAL: '🔴', HIGH: '🟠', MEDIUM: '🟡', LOW: '🟢' };

        for (const severity of severities) {
            const severityViolations = report.violations.filter(violation => violation.severity === severity);
            if (severityViolations.length > 0) {
                console.log(`\n  ${icons[severity]} ${severity}:`);
                for (const violation of severityViolations) {
                    console.log(`\n     ${violation.file}:${violation.line}`);
                    console.log(`     Skill: ${violation.skill} | Rule: ${violation.rule}`);
                    console.log(`     Issue: ${violation.message}`);
                    if (violation.fixSuggestion) {
                        console.log(`     Fix: ${violation.fixSuggestion}`);
                    }
                }
            }
        }
    }

    console.log('\n' + '='.repeat(70));
    console.log(report.passed ? '  ✅ ALL CHECKS PASSED' : '  ❌ VIOLATIONS FOUND - Fix before committing');
    console.log('='.repeat(70) + '\n');
}

function main() {
    const args = process.argv.slice(2);

    let checkStaged = false;
    let checkFileArg = null;
    let sourceDir = '.';
    let strict = false;
    let outputJson = false;

    for (let i = 0; i < args.length; i += 1) {
        if (args[i] === '--staged') {
            checkStaged = true;
        } else if (args[i] === '--file' && i + 1 < args.length) {
            checkFileArg = args[i + 1];
            i += 1;
        } else if (args[i] === '--strict') {
            strict = true;
        } else if (args[i] === '--json') {
            outputJson = true;
        } else if (!args[i].startsWith('--')) {
            sourceDir = args[i];
        }
    }

    const skills = getSkills();
    if (Object.keys(skills).length === 0) {
        console.log('❌ No skills found in .claude/skills/');
        process.exit(1);
    }

    let filesToCheck = [];

    if (checkStaged) {
        filesToCheck = getStagedFiles();
    } else if (checkFileArg) {
        filesToCheck = [checkFileArg];
    } else {
        function walkDir(dir) {
            const items = fs.readdirSync(dir);
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules' && item !== 'screenshots') {
                    walkDir(fullPath);
                } else if (stat.isFile()) {
                    filesToCheck.push(fullPath);
                }
            }
        }

        if (fs.existsSync(sourceDir)) {
            walkDir(sourceDir);
        }
    }

    const codeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs', '.java'];
    filesToCheck = filesToCheck.filter(file => codeExtensions.some(ext => file.endsWith(ext)));

    const allViolations = [];
    for (const filePath of filesToCheck) {
        allViolations.push(...checkFile(filePath, skills));
    }

    const report = new ComplianceReport(filesToCheck.length);
    report.violations = allViolations;

    if (outputJson) {
        console.log(
            JSON.stringify(
                {
                    filesChecked: report.filesChecked,
                    violationsCount: report.violations.length,
                    passed: report.passed,
                    violations: report.violations.map(violation => ({
                        file: violation.file,
                        line: violation.line,
                        skill: violation.skill,
                        rule: violation.rule,
                        severity: violation.severity,
                        message: violation.message
                    }))
                },
                null,
                2
            )
        );
    } else {
        printReport(report);
    }

    if ((strict && report.violations.length > 0) || !report.passed) {
        process.exit(1);
    }

    process.exit(0);
}

if (require.main === module) {
    main();
}

module.exports = { Violation, ComplianceReport, checkFile };
