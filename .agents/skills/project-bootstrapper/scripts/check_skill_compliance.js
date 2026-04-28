#!/usr/bin/env node
/**
 * Skill Compliance Checker (JavaScript Edition)
 * Validates that code follows the project's skill rules.
 * 
 * Usage:
 *   node check_skill_compliance.js <source-directory>
 *   node check_skill_compliance.js --staged  # Check git staged files
 *   node check_skill_compliance.js --file path/to/file.ts
 * 
 * Example:
 *   node check_skill_compliance.js src/
 *   node check_skill_compliance.js --staged --strict
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
    return this.violations.filter(v => v.severity === 'CRITICAL').length;
  }

  get highCount() {
    return this.violations.filter(v => v.severity === 'HIGH').length;
  }

  get passed() {
    return this.criticalCount === 0 && this.highCount === 0;
  }
}

function getStagedFiles() {
  try {
    const result = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf-8' });
    return result.trim().split('\n').filter(f => f);
  } catch (e) {
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

  // Language-based skills
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    if (skills['typescript-standards']) relevant.push('typescript-standards');
  } else if (filePath.endsWith('.py')) {
    if (skills['python-standards']) relevant.push('python-standards');
  } else if (filePath.endsWith('.go')) {
    if (skills['go-standards']) relevant.push('go-standards');
  }

  if (skills['error-handling']) relevant.push('error-handling');

  // Location-based skills
  if (filePath.includes('api/') || filePath.includes('routes/')) {
    relevant.push('api-design', 'security-hardening');
  }
  if (filePath.includes('db/') || filePath.includes('models/')) {
    relevant.push('database-design', 'security-hardening');
  }
  if (filePath.includes('components/') || filePath.includes('ui/')) {
    relevant.push('ui-engineering', 'accessibility-standards');
  }
  if (filePath.includes('test/') || filePath.includes('.test.')) {
    relevant.push('testing-strategy');
  }
  if (filePath.includes('auth/')) {
    relevant.push('auth-patterns', 'security-hardening');
  }

  return [...new Set(relevant)];
}

function checkTypeScriptStandards(content, filePath) {
  const violations = [];
  const lines = content.split('\n');

  // Check for 'any' type
  const anyPattern = /:\s*any\b/;
  lines.forEach((line, index) => {
    if (anyPattern.test(line)) {
      violations.push(new Violation(
        filePath,
        index + 1,
        'typescript-standards',
        "No 'any' types",
        'HIGH',
        "Found 'any' type - use specific type or 'unknown'",
        "Replace 'any' with specific type or 'unknown'"
      ));
    }
  });

  // Check for missing return types on exported functions
  const funcPattern = /export\s+(?:async\s+)?function\s+\w+\s*\([^)]*\)(?!\s*:)(?!\s*<)/;
  lines.forEach((line, index) => {
    if (funcPattern.test(line)) {
      violations.push(new Violation(
        filePath,
        index + 1,
        'typescript-standards',
        'Explicit return types',
        'MEDIUM',
        'Exported function missing explicit return type',
        'Add return type annotation'
      ));
    }
  });

  // Check for console.log
  const consolePattern = /console\.(log|warn|error|info)/;
  lines.forEach((line, index) => {
    if (consolePattern.test(line) && !line.includes('//')) {
      violations.push(new Violation(
        filePath,
        index + 1,
        'typescript-standards',
        'No console in production',
        'LOW',
        'console statement found - use proper logging',
        'Replace with structured logger'
      ));
    }
  });

  return violations;
}

function checkSecurityHardening(content, filePath) {
  const violations = [];
  const lines = content.split('\n');

  // Check for SQL injection (string concatenation in queries)
  const sqlPatterns = [
    /query\s*\(\s*[`"'].*?\$\{.*?\}/,
    /execute\s*\(\s*[`"'].*?\+/,
  ];

  lines.forEach((line, index) => {
    for (const pattern of sqlPatterns) {
      if (pattern.test(line)) {
        violations.push(new Violation(
          filePath,
          index + 1,
          'security-hardening',
          'SQL injection prevention',
          'CRITICAL',
          'Possible SQL injection - use parameterized queries',
          'Use parameterized queries or ORM'
        ));
      }
    }
  });

  // Check for localStorage (JWT storage)
  const localstoragePattern = /localStorage\.(set|get)Item\s*\(\s*['"](token|jwt|auth)/i;
  lines.forEach((line, index) => {
    if (localstoragePattern.test(line)) {
      violations.push(new Violation(
        filePath,
        index + 1,
        'security-hardening',
        'JWT storage',
        'CRITICAL',
        'JWT stored in localStorage - use httpOnly cookies',
        'Store JWT in httpOnly secure cookie'
      ));
    }
  });

  // Check for eval
  const evalPattern = /\beval\s*\(/;
  lines.forEach((line, index) => {
    if (evalPattern.test(line)) {
      violations.push(new Violation(
        filePath,
        index + 1,
        'security-hardening',
        'No eval',
        'CRITICAL',
        'eval() detected - major security risk',
        'Remove eval, use safer alternatives'
      ));
    }
  });

  return violations;
}

function checkErrorHandling(content, filePath) {
  const violations = [];
  const lines = content.split('\n');

  // Check for generic Error
  const errorPattern = /throw\s+new\s+Error\s*\(/;
  lines.forEach((line, index) => {
    if (errorPattern.test(line)) {
      violations.push(new Violation(
        filePath,
        index + 1,
        'error-handling',
        'Custom error types',
        'HIGH',
        'Generic Error thrown - use custom error type',
        'Use specific error class (e.g., DatabaseError, ValidationError)'
      ));
    }
  });

  // Check for empty catch blocks
  const emptyCatchPattern = /catch\s*\([^)]*\)\s*\{\s*\}/;
  const contentWithoutNewlines = content.replace(/\n/g, ' ');
  if (emptyCatchPattern.test(contentWithoutNewlines)) {
    // Find approximate line number
    lines.forEach((line, index) => {
      if (line.includes('catch') && lines[index + 1] && lines[index + 1].trim() === '}') {
        violations.push(new Violation(
          filePath,
          index + 1,
          'error-handling',
          'No empty catch blocks',
          'HIGH',
          'Empty catch block - errors are silently swallowed',
          'Handle error or re-throw'
        ));
      }
    });
  }

  return violations;
}

function checkTestingStrategy(content, filePath) {
  const violations = [];
  const lines = content.split('\n');

  // Check for .only in tests
  const onlyPattern = /\.(only|skip)\s*\(/;
  lines.forEach((line, index) => {
    if (onlyPattern.test(line)) {
      violations.push(new Violation(
        filePath,
        index + 1,
        'testing-strategy',
        'No .only/.skip in commits',
        'HIGH',
        'Test has .only or .skip - will skip other tests',
        'Remove .only/.skip before committing'
      ));
    }
  });

  return violations;
}

function checkFile(filePath, skills) {
  const violations = [];

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
  } catch (e) {
    return violations;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const relevantSkills = getRelevantSkills(filePath, skills);

  // Run checks based on file type and relevant skills
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    if (relevantSkills.includes('typescript-standards')) {
      violations.push(...checkTypeScriptStandards(content, filePath));
    }
  }

  if (relevantSkills.includes('security-hardening')) {
    violations.push(...checkSecurityHardening(content, filePath));
  }

  if (relevantSkills.includes('error-handling')) {
    violations.push(...checkErrorHandling(content, filePath));
  }

  if (filePath.includes('.test.') || filePath.includes('.spec.')) {
    if (relevantSkills.includes('testing-strategy')) {
      violations.push(...checkTestingStrategy(content, filePath));
    }
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

    // Group by severity
    const severities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
    const icons = { CRITICAL: '🔴', HIGH: '🟠', MEDIUM: '🟡', LOW: '🟢' };

    for (const severity of severities) {
      const severityViolations = report.violations.filter(v => v.severity === severity);
      if (severityViolations.length > 0) {
        console.log(`\n  ${icons[severity]} ${severity}:`);
        for (const v of severityViolations) {
          console.log(`\n     ${v.file}:${v.line}`);
          console.log(`     Skill: ${v.skill} | Rule: ${v.rule}`);
          console.log(`     Issue: ${v.message}`);
          if (v.fixSuggestion) {
            console.log(`     Fix: ${v.fixSuggestion}`);
          }
        }
      }
    }
  }

  console.log('\n' + '='.repeat(70));
  if (report.passed) {
    console.log('  ✅ ALL CHECKS PASSED');
  } else {
    console.log('  ❌ VIOLATIONS FOUND - Fix before committing');
  }
  console.log('='.repeat(70) + '\n');
}

function main() {
  const args = process.argv.slice(2);
  
  let checkStaged = false;
  let checkFile = null;
  let sourceDir = 'src';
  let strict = false;
  let outputJson = false;

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--staged') {
      checkStaged = true;
    } else if (args[i] === '--file' && i + 1 < args.length) {
      checkFile = args[i + 1];
      i++;
    } else if (args[i] === '--strict') {
      strict = true;
    } else if (args[i] === '--json') {
      outputJson = true;
    } else if (!args[i].startsWith('--')) {
      sourceDir = args[i];
    }
  }

  // Load skills
  const skills = getSkills();
  if (Object.keys(skills).length === 0) {
    console.log('❌ No skills found in .claude/skills/');
    process.exit(1);
  }

  // Get files to check
  let filesToCheck = [];

  if (checkStaged) {
    filesToCheck = getStagedFiles();
  } else if (checkFile) {
    filesToCheck = [checkFile];
  } else {
    // Walk directory
    function walkDir(dir) {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory() && !item.startsWith('.') && !item.startsWith('node_modules')) {
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

  // Filter to code files only
  const codeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs', '.java'];
  filesToCheck = filesToCheck.filter(f => codeExtensions.some(ext => f.endsWith(ext)));

  // Check each file
  let allViolations = [];
  for (const filePath of filesToCheck) {
    if (fs.existsSync(filePath)) {
      const violations = checkFile(filePath, skills);
      allViolations.push(...violations);
    }
  }

  // Generate report
  const report = new ComplianceReport(filesToCheck.length);
  report.violations = allViolations;

  if (outputJson) {
    console.log(JSON.stringify({
      filesChecked: report.filesChecked,
      violationsCount: report.violations.length,
      passed: report.passed,
      violations: report.violations.map(v => ({
        file: v.file,
        line: v.line,
        skill: v.skill,
        rule: v.rule,
        severity: v.severity,
        message: v.message
      }))
    }, null, 2));
  } else {
    printReport(report);
  }

  // Exit with error if violations found
  if (strict && report.violations.length > 0) {
    process.exit(1);
  } else if (!report.passed) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}

module.exports = { Violation, ComplianceReport, checkFile };
