#!/usr/bin/env node
/**
 * Compliance Report Generator (JavaScript Edition)
 * Generates detailed compliance reports for project governance.
 * 
 * Usage:
 *   node generate_compliance_report.js
 *   node generate_compliance_report.js --week
 *   node generate_compliance_report.js --output report.md
 * 
 * Example:
 *   node generate_compliance_report.js --week --output weekly-report.md
 */

const fs = require('fs');
const { execSync } = require('child_process');

function getGitChanges(since) {
  try {
    const result = execSync(
      `git log --since="${since}" --pretty=format:"%H|%an|%ad|%s" --date=short`,
      { encoding: 'utf-8' }
    );

    return result.trim().split('\n').map(line => {
      const parts = line.split('|');
      if (parts.length >= 4) {
        return {
          hash: parts[0],
          author: parts[1],
          date: parts[2],
          message: parts[3]
        };
      }
      return null;
    }).filter(Boolean);
  } catch (e) {
    return [];
  }
}

function runComplianceCheck(sourceDir = 'src') {
  try {
    const result = execSync(
      `node scripts/check_skill_compliance.js ${sourceDir} --json`,
      { encoding: 'utf-8' }
    );
    return JSON.parse(result);
  } catch (e) {
    // If it exits with error, it might still have output
    try {
      return JSON.parse(e.stdout);
    } catch {
      return { violations: [], filesChecked: 0 };
    }
  }
}

function analyzeViolations(violations) {
  const bySkill = {};
  const bySeverity = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };

  for (const v of violations) {
    const skill = v.skill || 'unknown';
    const severity = v.severity || 'MEDIUM';

    if (!bySkill[skill]) {
      bySkill[skill] = { count: 0, severities: {} };
    }

    bySkill[skill].count++;
    bySkill[skill].severities[severity] = (bySkill[skill].severities[severity] || 0) + 1;
    bySeverity[severity]++;
  }

  return { bySkill, bySeverity };
}

function generateWeeklyReport() {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const since = oneWeekAgo.toISOString().split('T')[0];

  // Get compliance data
  const complianceData = runComplianceCheck();

  // Get git activity
  const changes = getGitChanges(since);

  // Analyze violations
  const violationAnalysis = analyzeViolations(complianceData.violations || []);

  // Calculate metrics
  const totalFiles = complianceData.filesChecked || 0;
  const totalViolations = (complianceData.violations || []).length;
  const violatingFiles = Math.min(totalViolations, totalFiles);
  const compliantFiles = Math.max(0, totalFiles - violatingFiles);
  const complianceRate = totalFiles > 0 ? Math.round((compliantFiles / totalFiles) * 1000) / 10 : 0;

  // Generate report
  let report = `# Weekly Skill Compliance Report

**Week of:** ${new Date().toISOString().split('T')[0]}  
**Generated:** ${new Date().toISOString().replace('T', ' ').split('.')[0]}

---

## Executive Summary

| Metric | Value | Status |
|--------|-------|--------|
| **Compliance Rate** | ${complianceRate}% | ${complianceRate >= 90 ? '✅ Good' : complianceRate >= 70 ? '⚠️ Needs Attention' : '❌ Critical'} |
| **Files Analyzed** | ${totalFiles} | - |
| **Compliant Files** | ${compliantFiles} | - |
| **Files with Violations** | ${violatingFiles} | - |
| **Total Violations** | ${totalViolations} | - |
| **Git Commits** | ${changes.length} | - |

---

## Violations by Severity

| Severity | Count | Trend |
|----------|-------|-------|
| 🔴 **CRITICAL** | ${violationAnalysis.bySeverity.CRITICAL} | → |
| 🟠 **HIGH** | ${violationAnalysis.bySeverity.HIGH} | → |
| 🟡 **MEDIUM** | ${violationAnalysis.bySeverity.MEDIUM} | → |
| 🟢 **LOW** | ${violationAnalysis.bySeverity.LOW} | → |

---

## Violations by Skill

`;

  // Add skill breakdown
  if (Object.keys(violationAnalysis.bySkill).length > 0) {
    const sortedSkills = Object.entries(violationAnalysis.bySkill)
      .sort((a, b) => b[1].count - a[1].count);

    for (const [skill, data] of sortedSkills) {
      report += `\n### ${skill}\n\n`;
      report += `**Total Violations:** ${data.count}\n\n`;
      report += `**Breakdown:**\n`;
      for (const [sev, count] of Object.entries(data.severities)) {
        const icon = { CRITICAL: '🔴', HIGH: '🟠', MEDIUM: '🟡', LOW: '🟢' }[sev] || '⚪';
        report += `- ${icon} ${sev}: ${count}\n`;
      }
      report += '\n';
    }
  } else {
    report += '\n✅ No violations found!\n\n';
  }

  // Add recent activity
  report += `---

## Recent Activity

### Git Commits (Last 7 Days)

`;

  if (changes.length > 0) {
    for (const change of changes.slice(0, 10)) {
      report += `- **${change.date}** - ${change.author}: ${change.message.slice(0, 50)}\n`;
    }
  } else {
    report += 'No commits in the last 7 days.\n';
  }

  // Add action items
  report += `
---

## Action Items

`;

  const criticalViolations = (complianceData.violations || [])
    .filter(v => v.severity === 'CRITICAL');
  
  if (criticalViolations.length > 0) {
    report += `### 🔴 CRITICAL (Fix Immediately)\n\n`;
    report += `CRITICAL violations must be fixed before any new features:\n\n`;
    for (const v of criticalViolations.slice(0, 5)) {
      report += `- **${v.file}:${v.line}** - ${v.skill}: ${v.message}\n`;
    }
    report += '\n';
  }

  const highViolations = (complianceData.violations || [])
    .filter(v => v.severity === 'HIGH');
  
  if (highViolations.length > 0) {
    report += `### 🟠 HIGH (Fix This Week)\n\n`;
    report += `Schedule time to fix HIGH severity violations:\n\n`;
    for (const v of highViolations.slice(0, 5)) {
      report += `- **${v.file}:${v.line}** - ${v.skill}: ${v.message}\n`;
    }
    report += '\n';
  }

  if (violationAnalysis.bySeverity.MEDIUM > 0) {
    report += `### 🟡 MEDIUM (Fix When Convenient)\n\n`;
    report += `${violationAnalysis.bySeverity.MEDIUM} MEDIUM violations to address.\n\n`;
  }

  // Add recommendations
  report += `---

## Recommendations

`;

  if (complianceRate < 70) {
    report += `### 🚨 Critical Priority

The compliance rate is critically low. Immediate action required:

1. **Stop all new features** until compliance improves
2. **Schedule emergency refactoring sprint**
3. **Review and update skill training** for team
4. **Enforce pre-commit hooks** strictly

`;
  } else if (complianceRate < 90) {
    report += `### ⚠️ High Priority

Compliance needs improvement:

1. **Dedicate 20% of next sprint** to fixing violations
2. **Increase code review rigor** on skill compliance
3. **Pair programming** for developers with frequent violations
4. **Weekly compliance checks** in team meetings

`;
  } else {
    report += `### ✅ Good Standing

Compliance is at a healthy level:

1. **Maintain current practices**
2. **Celebrate team adherence** to skills
3. **Share success patterns** with other teams
4. **Continuously improve** skills based on learnings

`;
  }

  // Add footer
  report += `---

## How to Use This Report

1. **Review violations** with your team
2. **Assign fixes** to developers
3. **Track progress** in your project management tool
4. **Re-run report** weekly to track improvement

### Quick Commands

\`\`\`bash
# Check compliance
node scripts/check_skill_compliance.js src/

# See detailed violations
node scripts/check_skill_compliance.js --json src/

# Check specific file
node scripts/check_skill_compliance.js --file src/auth/login.ts
\`\`\`

---

*Report generated by Project Manager skill compliance system*
`;

  return report;
}

function generateDashboardHtml() {
  const complianceData = runComplianceCheck();
  const violationAnalysis = analyzeViolations(complianceData.violations || []);

  const totalFiles = complianceData.filesChecked || 0;
  const totalViolations = (complianceData.violations || []).length;
  const complianceRate = totalFiles > 0 
    ? Math.round(((totalFiles - totalViolations) / totalFiles) * 1000) / 10 
    : 0;

  return `<!DOCTYPE html>
<html>
<head>
    <title>Skill Compliance Dashboard</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #333; border-bottom: 3px solid #007acc; padding-bottom: 10px; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
        .metric { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .metric-value { font-size: 36px; font-weight: bold; }
        .status-good { color: #28a745; }
        .status-warning { color: #ffc107; }
        .status-critical { color: #dc3545; }
        .violations { margin-top: 30px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f8f9fa; font-weight: 600; }
        .severity-critical { color: #dc3545; font-weight: bold; }
        .severity-high { color: #fd7e14; }
        .severity-medium { color: #ffc107; }
        .severity-low { color: #6c757d; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎯 Skill Compliance Dashboard</h1>
        <p>Last updated: ${new Date().toISOString().replace('T', ' ').split('.')[0]}</p>
        
        <div class="metrics">
            <div class="metric">
                <div class="metric-value ${complianceRate >= 90 ? 'status-good' : complianceRate >= 70 ? 'status-warning' : 'status-critical'}">
                    ${complianceRate}%
                </div>
                <div class="metric-label">Compliance Rate</div>
            </div>
            
            <div class="metric">
                <div class="metric-value">${totalFiles}</div>
                <div class="metric-label">Files Checked</div>
            </div>
            
            <div class="metric">
                <div class="metric-value ${totalViolations > 0 ? 'status-critical' : 'status-good'}">
                    ${totalViolations}
                </div>
                <div class="metric-label">Total Violations</div>
            </div>
        </div>
        
        <div class="violations">
            <h2>Violations by Severity</h2>
            <table>
                <tr>
                    <th>Severity</th>
                    <th>Count</th>
                    <th>Percentage</th>
                </tr>
                <tr>
                    <td class="severity-critical">🔴 CRITICAL</td>
                    <td>${violationAnalysis.bySeverity.CRITICAL}</td>
                    <td>${totalViolations > 0 ? Math.round((violationAnalysis.bySeverity.CRITICAL / totalViolations) * 1000) / 10 : 0}%</td>
                </tr>
                <tr>
                    <td class="severity-high">🟠 HIGH</td>
                    <td>${violationAnalysis.bySeverity.HIGH}</td>
                    <td>${totalViolations > 0 ? Math.round((violationAnalysis.bySeverity.HIGH / totalViolations) * 1000) / 10 : 0}%</td>
                </tr>
                <tr>
                    <td class="severity-medium">🟡 MEDIUM</td>
                    <td>${violationAnalysis.bySeverity.MEDIUM}</td>
                    <td>${totalViolations > 0 ? Math.round((violationAnalysis.bySeverity.MEDIUM / totalViolations) * 1000) / 10 : 0}%</td>
                </tr>
                <tr>
                    <td class="severity-low">🟢 LOW</td>
                    <td>${violationAnalysis.bySeverity.LOW}</td>
                    <td>${totalViolations > 0 ? Math.round((violationAnalysis.bySeverity.LOW / totalViolations) * 1000) / 10 : 0}%</td>
                </tr>
            </table>
        </div>
    </div>
</body>
</html>`;
}

function main() {
  const args = process.argv.slice(2);
  
  let isWeek = false;
  let isDashboard = false;
  let outputFile = null;
  let format = 'markdown';

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--week') {
      isWeek = true;
    } else if (args[i] === '--dashboard') {
      isDashboard = true;
    } else if (args[i] === '--output' || args[i] === '-o') {
      outputFile = args[i + 1];
      i++;
    } else if (args[i] === '--format') {
      format = args[i + 1];
      i++;
    }
  }

  console.log('📊 Generating compliance report...');

  let report;
  if (isDashboard || format === 'html') {
    report = generateDashboardHtml();
  } else if (isWeek || format === 'markdown') {
    report = generateWeeklyReport();
  } else {
    // Default to JSON
    const complianceData = runComplianceCheck();
    report = JSON.stringify(complianceData, null, 2);
  }

  if (outputFile) {
    fs.writeFileSync(outputFile, report);
    console.log(`✅ Report saved to ${outputFile}`);
  } else {
    console.log('\n' + '='.repeat(70));
    console.log(report);
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateWeeklyReport, generateDashboardHtml, analyzeViolations };
