#!/usr/bin/env python3
"""
Compliance Report Generator
Generates detailed compliance reports for project governance.

Usage:
    python generate_compliance_report.py
    python generate_compliance_report.py --week
    python generate_compliance_report.py --output report.md

Example:
    python generate_compliance_report.py --week --output weekly-report.md
"""

import argparse
import json
import subprocess
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional


@dataclass
class ComplianceMetrics:
    date: str
    total_files: int
    compliant_files: int
    violating_files: int
    violations_by_skill: dict = field(default_factory=dict)
    violations_by_severity: dict = field(default_factory=dict)
    trend: str = "stable"  # improving, stable, declining


def get_git_changes(since: str) -> list[dict]:
    """Get git changes since a date."""
    try:
        result = subprocess.run(
            [
                "git",
                "log",
                f"--since={since}",
                "--pretty=format:%H|%an|%ad|%s",
                "--date=short",
            ],
            capture_output=True,
            text=True,
            check=True,
        )

        changes = []
        for line in result.stdout.strip().split("\n"):
            if "|" in line:
                hash_, author, date, message = line.split("|", 3)
                changes.append(
                    {
                        "hash": hash_,
                        "author": author,
                        "date": date,
                        "message": message,
                    }
                )

        return changes
    except subprocess.SubprocessError:
        return []


def run_compliance_check(source_dir: str = "src") -> dict:
    """Run compliance check and parse results."""
    try:
        result = subprocess.run(
            [
                "python",
                "scripts/check_skill_compliance.py",
                source_dir,
                "--json",
            ],
            capture_output=True,
            text=True,
        )

        if result.returncode == 0 or result.stdout:
            return json.loads(result.stdout)
        return {"violations": [], "files_checked": 0}
    except (subprocess.SubprocessError, json.JSONDecodeError):
        return {"violations": [], "files_checked": 0}


def analyze_violations(violations: list) -> dict:
    """Analyze violations by skill and severity."""
    by_skill = {}
    by_severity = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}

    for v in violations:
        skill = v.get("skill", "unknown")
        severity = v.get("severity", "MEDIUM")

        if skill not in by_skill:
            by_skill[skill] = {"count": 0, "severities": {}}

        by_skill[skill]["count"] += 1
        by_skill[skill]["severities"][severity] = (
            by_skill[skill]["severities"].get(severity, 0) + 1
        )

        if severity in by_severity:
            by_severity[severity] += 1

    return {"by_skill": by_skill, "by_severity": by_severity}


def generate_weekly_report() -> str:
    """Generate weekly compliance report."""
    one_week_ago = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")

    # Get compliance data
    compliance_data = run_compliance_check()

    # Get git activity
    changes = get_git_changes(one_week_ago)

    # Analyze violations
    violation_analysis = analyze_violations(compliance_data.get("violations", []))

    # Calculate metrics
    total_files = compliance_data.get("files_checked", 0)
    total_violations = len(compliance_data.get("violations", []))

    # Estimate compliant files (this is approximate)
    # In reality, you'd track which files have violations
    violating_files = min(total_violations, total_files)  # Conservative estimate
    compliant_files = max(0, total_files - violating_files)
    compliance_rate = (
        round(compliant_files / total_files * 100, 1) if total_files > 0 else 0
    )

    # Generate report
    report = f"""# Weekly Skill Compliance Report

**Week of:** {datetime.now().strftime("%Y-%m-%d")}  
**Generated:** {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

---

## Executive Summary

| Metric | Value | Status |
|--------|-------|--------|
| **Compliance Rate** | {compliance_rate}% | {"✅ Good" if compliance_rate >= 90 else "⚠️ Needs Attention" if compliance_rate >= 70 else "❌ Critical"} |
| **Files Analyzed** | {total_files} | - |
| **Compliant Files** | {compliant_files} | - |
| **Files with Violations** | {violating_files} | - |
| **Total Violations** | {total_violations} | - |
| **Git Commits** | {len(changes)} | - |

---

## Violations by Severity

| Severity | Count | Trend |
|----------|-------|-------|
| 🔴 **CRITICAL** | {violation_analysis["by_severity"]["CRITICAL"]} | {"→"} |
| 🟠 **HIGH** | {violation_analysis["by_severity"]["HIGH"]} | {"→"} |
| 🟡 **MEDIUM** | {violation_analysis["by_severity"]["MEDIUM"]} | {"→"} |
| 🟢 **LOW** | {violation_analysis["by_severity"]["LOW"]} | {"→"} |

---

## Violations by Skill

"""

    # Add skill breakdown
    if violation_analysis["by_skill"]:
        for skill, data in sorted(
            violation_analysis["by_skill"].items(),
            key=lambda x: x[1]["count"],
            reverse=True,
        ):
            report += f"\n### {skill}\n\n"
            report += f"**Total Violations:** {data['count']}\n\n"
            report += "**Breakdown:**\n"
            for sev, count in data["severities"].items():
                icon = {
                    "CRITICAL": "🔴",
                    "HIGH": "🟠",
                    "MEDIUM": "🟡",
                    "LOW": "🟢",
                }.get(sev, "⚪")
                report += f"- {icon} {sev}: {count}\n"
            report += "\n"
    else:
        report += "\n✅ No violations found!\n\n"

    # Add recent activity
    report += """---

## Recent Activity

### Git Commits (Last 7 Days)

"""

    if changes:
        for change in changes[:10]:  # Show last 10
            report += f"- **{change['date']}** - {change['author']}: {change['message'][:50]}\n"
    else:
        report += "No commits in the last 7 days.\n"

    # Add action items
    report += """
---

## Action Items

"""

    if violation_analysis["by_severity"]["CRITICAL"] > 0:
        report += "### 🔴 CRITICAL (Fix Immediately)\n\n"
        report += "CRITICAL violations must be fixed before any new features:\n\n"
        # List critical violations
        critical_violations = [
            v
            for v in compliance_data.get("violations", [])
            if v.get("severity") == "CRITICAL"
        ]
        for v in critical_violations[:5]:
            report += f"- **{v['file']}:{v['line']}** - {v['skill']}: {v['message']}\n"
        report += "\n"

    if violation_analysis["by_severity"]["HIGH"] > 0:
        report += "### 🟠 HIGH (Fix This Week)\n\n"
        report += "Schedule time to fix HIGH severity violations:\n\n"
        high_violations = [
            v
            for v in compliance_data.get("violations", [])
            if v.get("severity") == "HIGH"
        ]
        for v in high_violations[:5]:
            report += f"- **{v['file']}:{v['line']}** - {v['skill']}: {v['message']}\n"
        report += "\n"

    if violation_analysis["by_severity"]["MEDIUM"] > 0:
        report += "### 🟡 MEDIUM (Fix When Convenient)\n\n"
        report += f"{violation_analysis['by_severity']['MEDIUM']} MEDIUM violations to address.\n\n"

    # Add recommendations
    report += """---

## Recommendations

"""

    if compliance_rate < 70:
        report += """### 🚨 Critical Priority

The compliance rate is critically low. Immediate action required:

1. **Stop all new features** until compliance improves
2. **Schedule emergency refactoring sprint**
3. **Review and update skill training** for team
4. **Enforce pre-commit hooks** strictly

"""
    elif compliance_rate < 90:
        report += """### ⚠️ High Priority

Compliance needs improvement:

1. **Dedicate 20% of next sprint** to fixing violations
2. **Increase code review rigor** on skill compliance
3. **Pair programming** for developers with frequent violations
4. **Weekly compliance checks** in team meetings

"""
    else:
        report += """### ✅ Good Standing

Compliance is at a healthy level:

1. **Maintain current practices**
2. **Celebrate team adherence** to skills
3. **Share success patterns** with other teams
4. **Continuously improve** skills based on learnings

"""

    # Add footer
    report += f"""---

## How to Use This Report

1. **Review violations** with your team
2. **Assign fixes** to developers
3. **Track progress** in your project management tool
4. **Re-run report** weekly to track improvement

### Quick Commands

```bash
# Check compliance
python scripts/check_skill_compliance.py src/

# See detailed violations
python scripts/check_skill_compliance.py --json src/

# Check specific file
python scripts/check_skill_compliance.py --file src/auth/login.ts
```

---

*Report generated by Project Manager skill compliance system*
"""

    return report


def generate_dashboard_html() -> str:
    """Generate HTML dashboard."""
    compliance_data = run_compliance_check()
    violation_analysis = analyze_violations(compliance_data.get("violations", []))

    total_files = compliance_data.get("files_checked", 0)
    total_violations = len(compliance_data.get("violations", []))
    compliance_rate = (
        round((total_files - total_violations) / total_files * 100, 1)
        if total_files > 0
        else 0
    )

    html = f"""
<!DOCTYPE html>
<html>
<head>
    <title>Skill Compliance Dashboard</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; background: #f5f5f5; }}
        .container {{ max-width: 1200px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
        h1 {{ color: #333; border-bottom: 3px solid #007acc; padding-bottom: 10px; }}
        .metrics {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }}
        .metric {{ background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }}
        .metric-value {{ font-size: 36px; font-weight: bold; color: #007acc; }}
        .metric-label {{ color: #666; margin-top: 5px; }}
        .status-good {{ color: #28a745; }}
        .status-warning {{ color: #ffc107; }}
        .status-critical {{ color: #dc3545; }}
        .violations {{ margin-top: 30px; }}
        table {{ width: 100%; border-collapse: collapse; margin-top: 20px; }}
        th, td {{ padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }}
        th {{ background: #f8f9fa; font-weight: 600; }}
        .severity-critical {{ color: #dc3545; font-weight: bold; }}
        .severity-high {{ color: #fd7e14; }}
        .severity-medium {{ color: #ffc107; }}
        .severity-low {{ color: #6c757d; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>🎯 Skill Compliance Dashboard</h1>
        <p>Last updated: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}</p>
        
        <div class="metrics">
            <div class="metric">
                <div class="metric-value {"status-good" if compliance_rate >= 90 else "status-warning" if compliance_rate >= 70 else "status-critical"}">
                    {compliance_rate}%
                </div>
                <div class="metric-label">Compliance Rate</div>
            </div>
            
            <div class="metric">
                <div class="metric-value">{total_files}</div>
                <div class="metric-label">Files Checked</div>
            </div>
            
            <div class="metric">
                <div class="metric-value {"status-critical" if total_violations > 0 else "status-good"}">
                    {total_violations}
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
                    <td>{violation_analysis["by_severity"]["CRITICAL"]}</td>
                    <td>{round(violation_analysis["by_severity"]["CRITICAL"] / total_violations * 100, 1) if total_violations > 0 else 0}%</td>
                </tr>
                <tr>
                    <td class="severity-high">🟠 HIGH</td>
                    <td>{violation_analysis["by_severity"]["HIGH"]}</td>
                    <td>{round(violation_analysis["by_severity"]["HIGH"] / total_violations * 100, 1) if total_violations > 0 else 0}%</td>
                </tr>
                <tr>
                    <td class="severity-medium">🟡 MEDIUM</td>
                    <td>{violation_analysis["by_severity"]["MEDIUM"]}</td>
                    <td>{round(violation_analysis["by_severity"]["MEDIUM"] / total_violations * 100, 1) if total_violations > 0 else 0}%</td>
                </tr>
                <tr>
                    <td class="severity-low">🟢 LOW</td>
                    <td>{violation_analysis["by_severity"]["LOW"]}</td>
                    <td>{round(violation_analysis["by_severity"]["LOW"] / total_violations * 100, 1) if total_violations > 0 else 0}%</td>
                </tr>
            </table>
        </div>
    </div>
</body>
</html>
"""

    return html


def main():
    parser = argparse.ArgumentParser(description="Generate skill compliance reports")
    parser.add_argument(
        "--week",
        action="store_true",
        help="Generate weekly report",
    )
    parser.add_argument(
        "--dashboard",
        action="store_true",
        help="Generate HTML dashboard",
    )
    parser.add_argument(
        "--output",
        "-o",
        help="Output file (default: stdout)",
    )
    parser.add_argument(
        "--format",
        choices=["markdown", "html", "json"],
        default="markdown",
        help="Output format",
    )

    args = parser.parse_args()

    print("📊 Generating compliance report...")

    if args.dashboard or args.format == "html":
        report = generate_dashboard_html()
    elif args.week or args.format == "markdown":
        report = generate_weekly_report()
    else:
        # Default to JSON
        compliance_data = run_compliance_check()
        report = json.dumps(compliance_data, indent=2)

    if args.output:
        with open(args.output, "w") as f:
            f.write(report)
        print(f"✅ Report saved to {args.output}")
    else:
        print("\n" + "=" * 70)
        print(report)


if __name__ == "__main__":
    main()
