#!/usr/bin/env node
/**
 * Version Checker for Project Bootstrapper (JavaScript Edition)
 * Verifies that all technology versions in generated skills are up-to-date.
 * 
 * Usage:
 *   node version_checker.js <skills-directory>
 *   node version_checker.js --verify-tech typescript react nextjs
 * 
 * Example:
 *   node version_checker.js .claude/skills/
 *   node version_checker.js --check-manifest .claude/skills/_bootstrap-manifest.json
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Version requirements per technology (minimum supported versions)
const VERSION_REQUIREMENTS = {
  // JavaScript/TypeScript
  node: { min: '22.0.0', lts: '22.x', checkCmd: 'node --version' },
  npm: { min: '10.0.0', checkCmd: 'npm --version' },
  typescript: { min: '5.7.0', checkCmd: 'npx tsc --version' },
  nextjs: { min: '16.0.0', npm: 'next' },
  react: { min: '19.0.0', npm: 'react' },
  vue: { min: '3.5.0', npm: 'vue' },
  vite: { min: '6.0.0', npm: 'vite' },
  
  // Python
  python: { min: '3.12.0', checkCmd: 'python --version' },
  pip: { min: '24.0.0', checkCmd: 'pip --version' },
  fastapi: { min: '0.115.0', pypi: 'fastapi' },
  pydantic: { min: '2.10.0', pypi: 'pydantic' },
  django: { min: '5.0.0', pypi: 'Django' },
  flask: { min: '3.0.0', pypi: 'Flask' },
  
  // Go
  go: { min: '1.24.0', checkCmd: 'go version' },
  gin: { min: '1.10.0', go: 'github.com/gin-gonic/gin' },
  echo: { min: '4.13.0', go: 'github.com/labstack/echo/v4' },
  
  // Rust
  rust: { min: '1.85.0', checkCmd: 'rustc --version' },
  cargo: { min: '1.85.0', checkCmd: 'cargo --version' },
  tokio: { min: '1.43.0', crate: 'tokio' },
  axum: { min: '0.8.0', crate: 'axum' },
  
  // Java
  java: { min: '21.0.0', checkCmd: 'java --version' },
  spring: { min: '3.3.0', maven: 'org.springframework.boot:spring-boot' },
  
  // Kotlin
  kotlin: { min: '2.1.0', checkCmd: 'kotlin -version' },
  
  // C#
  dotnet: { min: '9.0.0', checkCmd: 'dotnet --version' },
  
  // Swift
  swift: { min: '6.0.0', checkCmd: 'swift --version' },
  
  // PHP
  php: { min: '8.4.0', checkCmd: 'php --version' },
  composer: { min: '2.8.0', checkCmd: 'composer --version' },
  laravel: { min: '11.0.0', packagist: 'laravel/framework' },
  
  // Ruby
  ruby: { min: '3.4.0', checkCmd: 'ruby --version' },
  rails: { min: '8.0.0', rubygems: 'rails' },
  
  // Databases
  postgresql: { min: '17.0', checkCmd: 'psql --version' },
  mysql: { min: '9.0', checkCmd: 'mysql --version' },
  mongodb: { min: '8.0', checkCmd: 'mongod --version' },
  redis: { min: '7.4', checkCmd: 'redis-server --version' },
  
  // Tools
  docker: { min: '27.0.0', checkCmd: 'docker --version' },
  kubernetes: { min: '1.32.0', checkCmd: 'kubectl version' },
  terraform: { min: '1.10.0', checkCmd: 'terraform version' },
  git: { min: '2.47.0', checkCmd: 'git --version' },
};

function parseVersion(versionStr) {
  const match = versionStr.match(/(\d+)\.(\d+)\.(\d+)/);
  if (match) {
    return {
      major: parseInt(match[1]),
      minor: parseInt(match[2]),
      patch: parseInt(match[3]),
      toString() { return `${this.major}.${this.minor}.${this.patch}`; }
    };
  }
  const match2 = versionStr.match(/(\d+)\.(\d+)/);
  if (match2) {
    return {
      major: parseInt(match2[1]),
      minor: parseInt(match2[2]),
      patch: 0,
      toString() { return `${this.major}.${this.minor}`; }
    };
  }
  return null;
}

function compareVersions(v1, v2) {
  if (v1.major !== v2.major) return v1.major - v2.major;
  if (v1.minor !== v2.minor) return v1.minor - v2.minor;
  return v1.patch - v2.patch;
}

function versionIsNewer(version, minVersion) {
  const v1 = parseVersion(version);
  const v2 = parseVersion(minVersion);
  if (!v1 || !v2) return false;
  return compareVersions(v1, v2) >= 0;
}

function extractVersionsFromSkill(skillPath) {
  const checks = [];
  const content = fs.readFileSync(skillPath, 'utf-8');
  
  const versionPatterns = [
    { pattern: /\bNode\.js\s+v?(\d+\.\d+(?:\.\d+)?)\b/gi, techKey: 'node', displayName: 'Node.js' },
    { pattern: /\bTypeScript\s+v?(\d+\.\d+(?:\.\d+)?)\b/gi, techKey: 'typescript', displayName: 'TypeScript' },
    { pattern: /\bReact\s+v?(\d+\.\d+(?:\.\d+)?)\b/gi, techKey: 'react', displayName: 'React' },
    { pattern: /\bNext\.js\s+v?(\d+\.\d+(?:\.\d+)?)\b/gi, techKey: 'nextjs', displayName: 'Next.js' },
    { pattern: /\bVue\.js\s+v?(\d+\.\d+(?:\.\d+)?)\b/gi, techKey: 'vue', displayName: 'Vue.js' },
    { pattern: /\bPython\s+v?(\d+\.\d+(?:\.\d+)?)\b/gi, techKey: 'python', displayName: 'Python' },
    { pattern: /\bGo\s+v?(\d+\.\d+(?:\.\d+)?)\b/gi, techKey: 'go', displayName: 'Go' },
    { pattern: /\bRust\s+v?(\d+\.\d+(?:\.\d+)?)\b/gi, techKey: 'rust', displayName: 'Rust' },
    { pattern: /\bJava\s+(\d+\.?\d*)\b/gi, techKey: 'java', displayName: 'Java' },
    { pattern: /\bKotlin\s+v?(\d+\.\d+(?:\.\d+)?)\b/gi, techKey: 'kotlin', displayName: 'Kotlin' },
    { pattern: /\.NET\s+(\d+\.\d+)\b/gi, techKey: 'dotnet', displayName: '.NET' },
    { pattern: /\bSwift\s+v?(\d+\.\d+(?:\.\d+)?)\b/gi, techKey: 'swift', displayName: 'Swift' },
    { pattern: /\bPHP\s+v?(\d+\.\d+(?:\.\d+)?)\b/gi, techKey: 'php', displayName: 'PHP' },
    { pattern: /\bRuby\s+v?(\d+\.\d+(?:\.\d+)?)\b/gi, techKey: 'ruby', displayName: 'Ruby' },
    { pattern: /\bPostgreSQL\s+(\d+\.?\d*)\b/gi, techKey: 'postgresql', displayName: 'PostgreSQL' },
    { pattern: /\bMySQL\s+(\d+\.\d+)\b/gi, techKey: 'mysql', displayName: 'MySQL' },
    { pattern: /\bMongoDB\s+(\d+\.\d+)\b/gi, techKey: 'mongodb', displayName: 'MongoDB' },
    { pattern: /\bRedis\s+v?(\d+\.\d+)\b/gi, techKey: 'redis', displayName: 'Redis' },
    { pattern: /\bDocker\s+v?(\d+\.\d+(?:\.\d+)?)\b/gi, techKey: 'docker', displayName: 'Docker' },
    { pattern: /\bKubernetes\s+v?(\d+\.\d+)\b/gi, techKey: 'kubernetes', displayName: 'Kubernetes' },
    { pattern: /\bTerraform\s+v?(\d+\.\d+(?:\.\d+)?)\b/gi, techKey: 'terraform', displayName: 'Terraform' },
  ];

  for (const { pattern, techKey, displayName } of versionPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      checks.push({
        technology: displayName,
        techKey,
        foundVersion: match[1],
        source: skillPath,
        latestVersion: null,
        isOutdated: false,
        isVerified: false,
        error: null
      });
    }
  }

  return checks;
}

function verifyVersions(checks) {
  for (const check of checks) {
    const req = VERSION_REQUIREMENTS[check.techKey];
    
    if (req) {
      const minVer = req.min || '0.0.0';
      
      if (versionIsNewer(check.foundVersion, minVer)) {
        check.isVerified = true;
      } else {
        check.isOutdated = true;
        check.error = `Version ${check.foundVersion} is below minimum ${minVer}`;
      }
    }
  }

  return checks;
}

function checkManifestVersions(manifestPath) {
  const checks = [];
  
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const techStack = manifest.tech_stack || {};
    
    for (const [tech, info] of Object.entries(techStack)) {
      if (info && info.version) {
        checks.push({
          technology: tech,
          techKey: tech.toLowerCase(),
          foundVersion: info.version,
          isVerified: info.verified || false,
          source: `manifest:${tech}`
        });
      }
    }
  } catch (e) {
    console.error(`Error reading manifest: ${e.message}`);
  }
  
  return checks;
}

function printVersionReport(report) {
  console.log('\n' + '='.repeat(70));
  console.log('  VERSION VERIFICATION REPORT');
  console.log('='.repeat(70));
  console.log(`  Skills Directory: ${report.skillsDir}`);
  console.log(`  Check Date: ${new Date().toISOString()}`);
  console.log('='.repeat(70));
  
  if (report.checks.length === 0) {
    console.log('\n  No version references found in skills.');
    return;
  }
  
  const verified = report.checks.filter(c => c.isVerified && !c.isOutdated);
  const outdated = report.checks.filter(c => c.isOutdated);
  const unknown = report.checks.filter(c => !c.isVerified && !c.error);
  const errors = report.checks.filter(c => c.error);
  
  if (verified.length > 0) {
    console.log('\n  ✅ VERIFIED VERSIONS');
    console.log('  ' + '-'.repeat(66));
    for (const check of verified) {
      console.log(`     ${check.technology.padEnd(20)} ${check.foundVersion.padEnd(15)}`);
    }
  }
  
  if (outdated.length > 0) {
    console.log('\n  ⚠️  OUTDATED VERSIONS');
    console.log('  ' + '-'.repeat(66));
    for (const check of outdated) {
      console.log(`     ${check.technology.padEnd(20)} ${check.foundVersion.padEnd(15)} ${check.error}`);
    }
  }
  
  if (errors.length > 0) {
    console.log('\n  ❌ VERSION ERRORS');
    console.log('  ' + '-'.repeat(66));
    for (const check of errors) {
      console.log(`     ${check.technology.padEnd(20)} ${check.foundVersion.padEnd(15)}`);
      console.log(`     Error: ${check.error}`);
    }
  }
  
  if (unknown.length > 0) {
    console.log('\n  ❓ UNVERIFIED VERSIONS');
    console.log('  ' + '-'.repeat(66));
    for (const check of unknown) {
      console.log(`     ${check.technology.padEnd(20)} ${check.foundVersion.padEnd(15)}`);
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('  SUMMARY');
  console.log('='.repeat(70));
  console.log(`  Total versions found:  ${report.checks.length}`);
  console.log(`  Verified & current:    ${verified.length}`);
  console.log(`  Outdated:              ${outdated.length}`);
  console.log(`  Errors:                ${errors.length}`);
  console.log(`  Unverified:            ${unknown.length}`);
  console.log('='.repeat(70));
  
  if (outdated.length > 0 || errors.length > 0) {
    console.log('\n  ⚠️  ACTION REQUIRED: Update outdated versions before production use');
    return 1;
  } else if (unknown.length > 0) {
    console.log('\n  ⚠️  WARNING: Some versions not verified — document verification sources');
    return 0;
  } else {
    console.log('\n  ✅ ALL VERSIONS VERIFIED AND CURRENT');
    return 0;
  }
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log('Usage: node version_checker.js <skills-directory>');
    console.log('       node version_checker.js --check-manifest <manifest.json>');
    console.log('Example: node version_checker.js .claude/skills/');
    process.exit(1);
  }

  let allChecks = [];
  let skillsDir;

  if (args[0] === '--check-manifest') {
    if (args.length < 2) {
      console.log('Usage: node version_checker.js --check-manifest <manifest.json>');
      process.exit(1);
    }
    const manifestPath = args[1];
    allChecks = checkManifestVersions(manifestPath);
    skillsDir = path.dirname(manifestPath);
  } else {
    skillsDir = args[0];
    if (!fs.existsSync(skillsDir)) {
      console.log(`Error: ${skillsDir} not found`);
      process.exit(1);
    }

    // Check manifest first
    const manifestPath = path.join(skillsDir, '_bootstrap-manifest.json');
    if (fs.existsSync(manifestPath)) {
      allChecks.push(...checkManifestVersions(manifestPath));
    }

    // Check all skill files
    const items = fs.readdirSync(skillsDir)
      .map(name => path.join(skillsDir, name))
      .filter(item => {
        const stat = fs.statSync(item);
        const basename = path.basename(item);
        return stat.isDirectory() && !basename.startsWith('_') && !basename.startsWith('.');
      });

    for (const skillDir of items) {
      const skillMd = path.join(skillDir, 'SKILL.md');
      if (fs.existsSync(skillMd)) {
        allChecks.push(...extractVersionsFromSkill(skillMd));
      }

      const refsDir = path.join(skillDir, 'references');
      if (fs.existsSync(refsDir)) {
        const refFiles = fs.readdirSync(refsDir).filter(f => f.endsWith('.md'));
        for (const refFile of refFiles) {
          allChecks.push(...extractVersionsFromSkill(path.join(refsDir, refFile)));
        }
      }
    }
  }

  // Remove duplicates based on technology + version
  const seen = new Set();
  allChecks = allChecks.filter(check => {
    const key = `${check.technology}:${check.foundVersion}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Verify all versions
  allChecks = verifyVersions(allChecks);

  // Generate report
  const report = {
    skillsDir,
    checks: allChecks
  };

  const exitCode = printVersionReport(report);
  process.exit(exitCode);
}

if (require.main === module) {
  main();
}

module.exports = { extractVersionsFromSkill, verifyVersions, parseVersion, compareVersions };
