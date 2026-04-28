#!/usr/bin/env node
/**
 * Bootstrap Skill Validator v2 (JavaScript Edition)
 * Validates generated skills for completeness, consistency, and quality.
 * 
 * Usage:
 *   node validate_bootstrap.js <skills-directory>
 * 
 * Example:
 *   node validate_bootstrap.js .claude/skills/
 */

const fs = require('fs');
const path = require('path');

class ValidationResult {
  constructor(skillName) {
    this.skillName = skillName;
    this.errors = [];
    this.warnings = [];
    this.info = [];
    this.stats = {};
  }

  get passed() {
    return this.errors.length === 0;
  }
}

class BootstrapValidation {
  constructor(skillsDir) {
    this.skillsDir = skillsDir;
    this.results = [];
    this.crossErrors = [];
    this.crossWarnings = [];
  }

  get totalErrors() {
    return this.results.reduce((sum, r) => sum + r.errors.length, 0) + this.crossErrors.length;
  }

  get totalWarnings() {
    return this.results.reduce((sum, r) => sum + r.warnings.length, 0) + this.crossWarnings.length;
  }

  get passed() {
    return this.totalErrors === 0;
  }
}

function validateFrontmatter(content, result) {
  if (!content.startsWith('---')) {
    result.errors.push("Missing YAML frontmatter (must start with ---)");
    return;
  }

  const parts = content.split('---');
  if (parts.length < 3) {
    result.errors.push("Malformed YAML frontmatter (missing closing ---)");
    return;
  }

  const fm = parts[1];
  if (!fm.includes('name:')) {
    result.errors.push("Frontmatter missing 'name' field");
  }
  if (!fm.includes('description:')) {
    result.errors.push("Frontmatter missing 'description' field");
  } else {
    // Rough description length check
    const descMatch = fm.match(/description:\s*([\s\S]*?)(?=\n\w|$)/);
    if (descMatch) {
      const desc = descMatch[1].replace(/\s+/g, ' ').trim();
      if (desc.length < 80) {
        result.warnings.push(`Description may be too short (${desc.length} chars) — aim for 100+`);
      }
      result.stats.descriptionLength = desc.length;
    }
  }
}

function validateSections(content, result) {
  const required = {
    'Activation': "Missing 'Activation' section — skill won't know when to trigger",
    'Core Rules': "Missing 'Core Rules' or 'Rules' section",
  };

  for (const [section, msg] of Object.entries(required)) {
    const pattern = new RegExp(`##?\\s+.*${section}`, 'i');
    if (!pattern.test(content)) {
      if (section === 'Core Rules' && /##?\s+.*Rules?\b/i.test(content)) {
        continue;
      }
      result.errors.push(msg);
    }
  }

  const recommended = ['Pattern', 'Anti-Pattern', 'Security', 'Performance', 'Error', 'Checklist', 'Edge Case'];
  for (const section of recommended) {
    const pattern = new RegExp(`##?\\s+.*${section}`, 'i');
    if (!pattern.test(content)) {
      result.warnings.push(`No section matching '${section}' — recommended for completeness`);
    }
  }
}

function validateCodeBlocks(content, result) {
  const blocks = [...content.matchAll(/```(\w*)\n([\s\S]*?)```/g)];
  result.stats.codeBlocks = blocks.length;

  if (blocks.length === 0) {
    result.errors.push("No code examples — skills must have concrete code");
  } else if (blocks.length < 3) {
    result.warnings.push(`Only ${blocks.length} code blocks — aim for 5+ (correct + incorrect)`);
  }

  const hasGood = /[✅]|Correct|\/\/ Good|# Good/.test(content);
  const hasBad = /[❌]|Incorrect|\/\/ Bad|# Bad/i.test(content);

  if (!hasGood) {
    result.warnings.push("No clearly marked CORRECT examples (✅)");
  }
  if (!hasBad) {
    result.warnings.push("No clearly marked INCORRECT examples (❌)");
  }
}

function validateRules(content, result) {
  const rules = [...content.matchAll(/###\s+Rule\s+\d+/gi)];
  result.stats.rulesCount = rules.length;

  if (rules.length === 0) {
    const altRules = [...content.matchAll(/###\s+\d+[\.\):]/g)];
    if (altRules.length > 0) {
      result.stats.rulesCount = altRules.length;
    } else {
      result.warnings.push("No numbered rules found — rules should be explicit and numbered");
    }
  } else if (rules.length < 5) {
    result.warnings.push(`Only ${rules.length} rules — most skills need 15-40`);
  }
}

function validateAntiPatterns(content, result) {
  const severityMarkers = [...content.matchAll(/[🔴🟠🟡🟢]/g)];
  result.stats.antiPatternsWithSeverity = severityMarkers.length;

  if (!/anti.?pattern/i.test(content)) {
    result.warnings.push("No anti-patterns section — document what NOT to do");
  }
}

function validateReferences(skillDir, result) {
  const refsDir = path.join(skillDir, 'references');
  if (!fs.existsSync(refsDir)) {
    result.warnings.push("No references/ directory — add patterns.md, anti-patterns.md, checklist.md");
    return;
  }

  const expected = {
    'patterns.md': 500,
    'anti-patterns.md': 500,
    'checklist.md': 200,
  };

  for (const [fname, minSize] of Object.entries(expected)) {
    const fpath = path.join(refsDir, fname);
    if (!fs.existsSync(fpath)) {
      result.warnings.push(`Missing references/${fname}`);
    } else {
      const stats = fs.statSync(fpath);
      if (stats.size < minSize) {
        result.warnings.push(`references/${fname} seems short (${stats.size} bytes, expect ≥${minSize})`);
      }
    }
  }
}

function validateVersionReferences(content, result) {
  // Check for unverified version warnings
  const unverifiedPattern = /⚠️.*version.*unverified|version.*unverified.*⚠️/i;
  if (unverifiedPattern.test(content)) {
    result.warnings.push("Contains unverified version references — MUST verify before production");
  }

  // Check for version patterns that should have verification
  const versionPatterns = [/\b\d+\.\d+\.\d+\b/g, /\b\d+\.\d+\b/g];
  const hasVersions = versionPatterns.some(p => p.test(content));
  const hasVerification = /verified|verification|latest stable|release date/i.test(content);

  if (hasVersions && !hasVerification) {
    result.warnings.push(
      "Contains version numbers without verification documentation — MUST document how versions were verified"
    );
  }

  // Check for outdated version references
  const outdatedIndicators = [
    { pattern: /\bNode\.js\s+(14|16|18|20)\b/, message: "Outdated Node.js version (< 22 LTS)" },
    { pattern: /\bPython\s+(2\.|3\.[0-9])\b/, message: "Outdated Python version (< 3.12)" },
    { pattern: /\bGo\s+1\.(1[0-9]|2[0-3])\b/, message: "Outdated Go version (< 1.24)" },
  ];

  for (const { pattern, message } of outdatedIndicators) {
    if (pattern.test(content)) {
      result.warnings.push(`${message} — consider upgrading to latest stable`);
    }
  }
}

function validateContentQuality(content, result) {
  // Check for vague performance language
  const vaguePerf = /\b(should be fast|keep it efficient|optimize where possible|be performant)\b/i;
  if (vaguePerf.test(content)) {
    const match = content.match(vaguePerf);
    result.warnings.push(`Vague performance language detected: '${match[0]}' — use concrete numbers`);
  }

  // Check for weak security language
  const weakSecurity = /\bshould\b.*\b(validate|sanitize|encrypt|authenticate|authorize)\b/i;
  if (weakSecurity.test(content)) {
    result.warnings.push("Security rules use 'should' instead of 'must'/'never' — strengthen language");
  }

  // Check for generic advice
  const generic = /\b(follow best practices|use industry standards|implement proper|ensure adequate)\b/i;
  if (generic.test(content)) {
    const match = content.match(generic);
    result.warnings.push(`Generic advice detected: '${match[0]}' — be specific about WHAT to do`);
  }

  // Count total lines
  const lines = content.split('\n');
  result.stats.totalLines = lines.length;
  if (lines.length > 500) {
    result.warnings.push(`SKILL.md is ${lines.length} lines — consider moving detail to references/`);
  }

  validateVersionReferences(content, result);
}

function validateSkill(skillDir) {
  const result = new ValidationResult(path.basename(skillDir));

  const skillMd = path.join(skillDir, 'SKILL.md');
  if (!fs.existsSync(skillMd)) {
    result.errors.push("SKILL.md not found!");
    return result;
  }

  const content = fs.readFileSync(skillMd, 'utf-8');
  result.stats.sizeBytes = content.length;

  if (content.length < 500) {
    result.errors.push(`SKILL.md too short (${content.length} bytes) — likely incomplete`);
  }

  validateFrontmatter(content, result);
  validateSections(content, result);
  validateCodeBlocks(content, result);
  validateRules(content, result);
  validateAntiPatterns(content, result);
  validateReferences(skillDir, result);
  validateContentQuality(content, result);

  return result;
}

function validateCrossSkill(skillsDir, results) {
  const errors = [];
  const warnings = [];

  // Check manifest
  const manifestPath = path.join(skillsDir, '_bootstrap-manifest.json');
  if (!fs.existsSync(manifestPath)) {
    errors.push("Missing _bootstrap-manifest.json");
  } else {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      const declared = new Set(manifest.skills_generated?.map(s => s.name) || []);
      const actual = new Set(results.map(r => r.skillName));

      for (const name of declared) {
        if (!actual.has(name)) {
          errors.push(`Manifest declares '${name}' but directory not found`);
        }
      }

      for (const name of actual) {
        if (!declared.has(name) && name !== 'project-bootstrapper') {
          warnings.push(`Skill '${name}' exists but not in manifest`);
        }
      }
    } catch (e) {
      errors.push(`Invalid _bootstrap-manifest.json: ${e.message}`);
    }
  }

  // Check required domains exist
  const requiredDomains = ['security', 'error', 'test', 'architecture', 'valid'];
  const skillNames = results.map(r => r.skillName.toLowerCase());
  for (const domain of requiredDomains) {
    if (!skillNames.some(name => name.includes(domain))) {
      warnings.push(`No skill covering '${domain}' — usually critical`);
    }
  }

  // Check for tech consistency across skills
  const allContents = {};
  for (const result of results) {
    const skillPath = path.join(skillsDir, result.skillName, 'SKILL.md');
    if (fs.existsSync(skillPath)) {
      allContents[result.skillName] = fs.readFileSync(skillPath, 'utf-8');
    }
  }

  // Basic contradiction detection
  const patternsToCheck = [
    { pattern: /\b(Zod|Joi|Yup|Valibot|ArkType)\b/gi, category: "validation library" },
    { pattern: /\b(Jest|Vitest|Mocha|Ava|pytest|go test)\b/gi, category: "test runner" },
    { pattern: /\b(Tailwind|styled-components|CSS Modules|Sass|emotion)\b/gi, category: "CSS approach" },
    { pattern: /\b(REST|GraphQL|gRPC|tRPC)\b/gi, category: "API style" },
    { pattern: /\b(Zustand|Redux|Jotai|Recoil|Pinia|Vuex|MobX)\b/gi, category: "state management" },
  ];

  for (const { pattern, category } of patternsToCheck) {
    const found = new Set();
    for (const [skillName, content] of Object.entries(allContents)) {
      const matches = [...content.matchAll(pattern)];
      matches.forEach(m => found.add(m[0]));
    }
    if (found.size > 1) {
      warnings.push(`Multiple ${category} options mentioned across skills: ${[...found].join(', ')} — pick ONE`);
    }
  }

  // Check for version consistency across skills
  const versionPatterns = [
    { pattern: /\b(?:Next\.js|Next)\s+v?(\d+\.\d+(?:\.\d+)?)/gi, name: "Next.js" },
    { pattern: /\b(?:React)\s+v?(\d+\.\d+(?:\.\d+)?)/gi, name: "React" },
    { pattern: /\b(?:TypeScript|TS)\s+v?(\d+\.\d+(?:\.\d+)?)/gi, name: "TypeScript" },
    { pattern: /\b(?:Node\.js|Node)\s+v?(\d+\.\d+(?:\.\d+)?)/gi, name: "Node.js" },
    { pattern: /\bPython\s+(\d+\.\d+(?:\.\d+)?)/gi, name: "Python" },
  ];

  for (const { pattern, name } of versionPatterns) {
    const versionsFound = {};
    for (const [skillName, content] of Object.entries(allContents)) {
      const matches = [...content.matchAll(pattern)];
      if (matches.length > 0) {
        versionsFound[skillName] = matches[0][1];
      }
    }

    const uniqueVersions = [...new Set(Object.values(versionsFound))];
    if (uniqueVersions.length > 1) {
      const versionStr = Object.entries(versionsFound)
        .map(([skill, ver]) => `${skill}=${ver}`)
        .join(', ');
      warnings.push(`Version inconsistency for ${name}: ${versionStr}`);
    }
  }

  // Check for version verification documentation
  const unverifiedSkills = [];
  for (const [skillName, content] of Object.entries(allContents)) {
    const hasVersions = /\b\d+\.\d+\.?\d*\b/.test(content);
    const hasVerification = /verified|verification|latest stable/i.test(content);

    if (hasVersions && !hasVerification) {
      unverifiedSkills.push(skillName);
    }
  }

  if (unverifiedSkills.length > 0) {
    warnings.push(`Skills missing version verification documentation: ${unverifiedSkills.join(', ')}`);
  }

  return { errors, warnings };
}

function printReport(v) {
  console.log('\n' + '═'.repeat(65));
  console.log('  PROJECT BOOTSTRAPPER — VALIDATION REPORT');
  console.log('═'.repeat(65));

  let totalRules = 0;
  let totalCodeBlocks = 0;
  let totalLines = 0;

  for (const r of v.results) {
    const status = r.passed ? '✅' : '❌';
    const statsStr = `[${r.stats.totalLines || '?'} lines, ${r.stats.rulesCount || '?'} rules, ${r.stats.codeBlocks || '?'} code blocks]`;
    console.log(`\n${status} ${r.skillName}  ${statsStr}`);
    for (const e of r.errors) {
      console.log(`   🔴 ${e}`);
    }
    for (const w of r.warnings) {
      console.log(`   🟡 ${w}`);
    }
    for (const i of r.info) {
      console.log(`   🔵 ${i}`);
    }
    totalRules += r.stats.rulesCount || 0;
    totalCodeBlocks += r.stats.codeBlocks || 0;
    totalLines += r.stats.totalLines || 0;
  }

  if (v.crossErrors.length > 0 || v.crossWarnings.length > 0) {
    console.log(`\n${'─'.repeat(65)}`);
    console.log('  CROSS-SKILL CHECKS');
    console.log(`${'─'.repeat(65)}`);
    for (const e of v.crossErrors) {
      console.log(`   🔴 ${e}`);
    }
    for (const w of v.crossWarnings) {
      console.log(`   🟡 ${w}`);
    }
  }

  console.log(`\n${'═'.repeat(65)}`);
  console.log('  SUMMARY');
  console.log(`${'═'.repeat(65)}`);
  console.log(`  Skills:          ${v.results.length}`);
  console.log(`  Total lines:     ${totalLines}`);
  console.log(`  Total rules:     ${totalRules}`);
  console.log(`  Code blocks:     ${totalCodeBlocks}`);
  console.log(`  Errors:          ${v.totalErrors}`);
  console.log(`  Warnings:        ${v.totalWarnings}`);
  console.log(`  Status:          ${v.passed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`${'═'.repeat(65)}\n`);
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log('Usage: node validate_bootstrap.js <skills-directory>');
    console.log('Example: node validate_bootstrap.js .claude/skills/');
    process.exit(1);
  }

  const skillsDir = args[0];
  if (!fs.existsSync(skillsDir)) {
    console.log(`Error: ${skillsDir} not found`);
    process.exit(1);
  }

  const v = new BootstrapValidation(skillsDir);

  const items = fs.readdirSync(skillsDir)
    .map(name => path.join(skillsDir, name))
    .filter(item => {
      const stat = fs.statSync(item);
      const basename = path.basename(item);
      return stat.isDirectory() && !basename.startsWith('_') && !basename.startsWith('.');
    })
    .sort();

  for (const item of items) {
    v.results.push(validateSkill(item));
  }

  const crossValidation = validateCrossSkill(skillsDir, v.results);
  v.crossErrors = crossValidation.errors;
  v.crossWarnings = crossValidation.warnings;

  printReport(v);
  process.exit(v.passed ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = { ValidationResult, BootstrapValidation, validateSkill };
