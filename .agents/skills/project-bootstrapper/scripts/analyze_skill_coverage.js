#!/usr/bin/env node
/**
 * Skill Coverage Analyzer (JavaScript Edition)
 * Analyzes which skills apply to which parts of the codebase.
 * 
 * Usage:
 *   node analyze_skill_coverage.js <source-directory>
 *   node analyze_skill_coverage.js --report
 * 
 * Example:
 *   node analyze_skill_coverage.js src/
 *   node analyze_skill_coverage.js --report --output coverage.json
 */

const fs = require('fs');
const path = require('path');

function getFileSkills(filePath) {
  const skills = [];

  // Language-based
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    skills.push('typescript-standards', 'error-handling');
  } else if (filePath.endsWith('.py')) {
    skills.push('python-standards', 'error-handling');
  } else if (filePath.endsWith('.go')) {
    skills.push('go-standards', 'error-handling');
  }

  // Location-based
  if (filePath.includes('api/') || filePath.includes('routes/') || filePath.includes('endpoint')) {
    skills.push('api-design', 'security-hardening', 'auth-patterns');
  }

  if (filePath.includes('db/') || filePath.includes('models/') || filePath.includes('schema')) {
    skills.push('database-design', 'security-hardening', 'privacy-compliance');
  }

  if (filePath.includes('components/') || filePath.includes('ui/') || filePath.includes('pages/')) {
    skills.push('ui-engineering', 'accessibility-standards');
  }

  if (filePath.includes('test/') || filePath.includes('.test.') || filePath.includes('.spec.') || filePath.includes('__tests__/')) {
    skills.push('testing-strategy');
  }

  if (filePath.includes('auth/') || filePath.includes('login') || filePath.includes('session')) {
    skills.push('auth-patterns', 'security-hardening');
  }

  if (filePath.includes('lib/') || filePath.includes('utils/') || filePath.includes('helpers/')) {
    skills.push('typescript-standards', 'error-handling');
  }

  if (filePath.includes('worker/') || filePath.includes('job/') || filePath.includes('queue/')) {
    skills.push('background-jobs', 'error-handling');
  }

  // Configuration files
  if (filePath.endsWith('.yml') || filePath.endsWith('.yaml') || filePath.endsWith('.json')) {
    if (filePath.includes('.github/') || filePath.includes('ci/') || filePath.includes('cd/')) {
      skills.push('devops-pipeline', 'git-workflow');
    }
  }

  if (filePath.includes('Dockerfile') || filePath.endsWith('.dockerfile')) {
    skills.push('container-orchestration', 'security-hardening');
  }

  // Documentation
  if (filePath.endsWith('.md')) {
    skills.push('documentation-standards');
  }

  return [...new Set(skills)];
}

function analyzeCoverage(sourceDir) {
  const sourcePath = path.resolve(sourceDir);

  if (!fs.existsSync(sourcePath)) {
    return { error: `Directory ${sourceDir} not found` };
  }

  // Get all source files
  const allFiles = [];
  const extensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs', '.java', '.md'];

  function walkDir(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      const relativePath = path.relative(sourcePath, fullPath);

      if (stat.isDirectory() && !item.startsWith('.') && !item.startsWith('node_modules')) {
        walkDir(fullPath);
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        allFiles.push(relativePath);
      }
    }
  }

  walkDir(sourcePath);

  // Map files to skills
  const skillCoverage = {};

  for (const filePath of allFiles) {
    const applicableSkills = getFileSkills(filePath);

    for (const skill of applicableSkills) {
      if (!skillCoverage[skill]) {
        skillCoverage[skill] = {
          skill,
          filesApplicable: [],
          filesCompliant: [],
          filesViolating: [],
          coveragePercentage: 0
        };
      }
      skillCoverage[skill].filesApplicable.push(filePath);
    }
  }

  // Calculate coverage stats
  const totalFiles = allFiles.length;
  const coverageStats = {
    totalFiles,
    totalSkills: Object.keys(skillCoverage).length,
    skills: {},
    uncoveredFiles: [],
  };

  for (const [skill, info] of Object.entries(skillCoverage)) {
    coverageStats.skills[skill] = {
      applicableCount: info.filesApplicable.length,
      applicablePercentage: Math.round((info.filesApplicable.length / totalFiles) * 100 * 100) / 100,
      sampleFiles: info.filesApplicable.slice(0, 5)
    };
  }

  // Find files with no skill coverage
  const coveredFiles = new Set();
  for (const info of Object.values(skillCoverage)) {
    info.filesApplicable.forEach(f => coveredFiles.add(f));
  }

  const uncovered = allFiles.filter(f => !coveredFiles.has(f));
  coverageStats.uncoveredFiles = uncovered;
  coverageStats.uncoveredCount = uncovered.length;
  coverageStats.coveragePercentage = Math.round(((totalFiles - uncovered.length) / totalFiles) * 100 * 100) / 100;

  return coverageStats;
}

function printCoverageReport(coverage) {
  console.log('\n' + '='.repeat(70));
  console.log('  SKILL COVERAGE ANALYSIS');
  console.log('='.repeat(70));

  if (coverage.error) {
    console.log(`\n  ❌ Error: ${coverage.error}`);
    return;
  }

  console.log(`\n  Total Files Analyzed: ${coverage.totalFiles}`);
  console.log(`  Total Skills Active: ${coverage.totalSkills}`);
  console.log(`  Overall Coverage: ${coverage.coveragePercentage}%`);
  console.log(`  Uncovered Files: ${coverage.uncoveredCount}`);

  console.log('\n' + '-'.repeat(70));
  console.log('  COVERAGE BY SKILL:');
  console.log('-'.repeat(70));

  // Sort by applicable count
  const sortedSkills = Object.entries(coverage.skills)
    .sort((a, b) => b[1].applicableCount - a[1].applicableCount);

  for (const [skill, stats] of sortedSkills) {
    const barLength = Math.floor(stats.applicablePercentage / 2);
    const bar = '█'.repeat(barLength) + '░'.repeat(50 - barLength);
    console.log(`\n  ${skill.padEnd(30)} ${String(stats.applicableCount).padStart(4)} files (${String(stats.applicablePercentage).padStart(5)}%)`);
    console.log(`  ${bar}`);
    if (stats.sampleFiles.length > 0) {
      console.log(`    Examples: ${stats.sampleFiles.slice(0, 3).join(', ')}`);
    }
  }

  if (coverage.uncoveredFiles.length > 0) {
    console.log('\n' + '-'.repeat(70));
    console.log('  UNCOVERED FILES (No skills apply):');
    console.log('-'.repeat(70));
    for (const f of coverage.uncoveredFiles.slice(0, 10)) {
      console.log(`    • ${f}`);
    }
    if (coverage.uncoveredFiles.length > 10) {
      console.log(`    ... and ${coverage.uncoveredFiles.length - 10} more`);
    }
  }

  console.log('\n' + '='.repeat(70));

  // Recommendations
  console.log('\n  RECOMMENDATIONS:');
  if (coverage.uncoveredCount > 0) {
    console.log('  ⚠️  Some files have no skill coverage - consider adding relevant skills');
  }

  const lowCoverageSkills = Object.entries(coverage.skills)
    .filter(([skill, stats]) => stats.applicableCount < 5);
  
  if (lowCoverageSkills.length > 0) {
    console.log('  ⚠️  Low coverage skills:');
    for (const [skill, stats] of lowCoverageSkills) {
      console.log(`     • ${skill}: only ${stats.applicableCount} files`);
    }
  }

  console.log('='.repeat(70) + '\n');
}

function main() {
  const args = process.argv.slice(2);
  
  let sourceDir = 'src';
  let outputFile = null;
  let specificSkill = null;
  let generateReport = false;

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--report') {
      generateReport = true;
    } else if (args[i] === '--output' && i + 1 < args.length) {
      outputFile = args[i + 1];
      i++;
    } else if (args[i] === '--skill' && i + 1 < args.length) {
      specificSkill = args[i + 1];
      i++;
    } else if (!args[i].startsWith('--')) {
      sourceDir = args[i];
    }
  }

  console.log(`🔍 Analyzing skill coverage in ${sourceDir}...`);

  const coverage = analyzeCoverage(sourceDir);

  if (specificSkill) {
    if (coverage.skills && coverage.skills[specificSkill]) {
      const skillData = coverage.skills[specificSkill];
      console.log(`\n📊 Coverage for ${specificSkill}:`);
      console.log(`   Applicable to: ${skillData.applicableCount} files`);
      console.log(`   Percentage: ${skillData.applicablePercentage}%`);
      console.log(`\n   Sample files:`);
      for (const f of skillData.sampleFiles.slice(0, 10)) {
        console.log(`     • ${f}`);
      }
    } else {
      console.log(`\n❌ Skill '${specificSkill}' not found or has no coverage`);
    }
  } else if (outputFile) {
    fs.writeFileSync(outputFile, JSON.stringify(coverage, null, 2));
    console.log(`\n✅ Coverage report saved to ${outputFile}`);
  } else {
    printCoverageReport(coverage);
  }
}

if (require.main === module) {
  main();
}

module.exports = { analyzeCoverage, getFileSkills };
