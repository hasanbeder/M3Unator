#!/usr/bin/env python3
"""
Skill Coverage Analyzer
Analyzes which skills apply to which parts of the codebase.

Usage:
    python analyze_skill_coverage.py <source-directory>
    python analyze_skill_coverage.py --report

Example:
    python analyze_skill_coverage.py src/
    python analyze_skill_coverage.py --report --output coverage.json
"""

import argparse
import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional


@dataclass
class CoverageInfo:
    skill: str
    files_applicable: list[str] = field(default_factory=list)
    files_compliant: list[str] = field(default_factory=list)
    files_violating: list[str] = field(default_factory=list)
    coverage_percentage: float = 0.0


def get_file_skills(file_path: str) -> list[str]:
    """Determine which skills apply to a file."""
    skills = []

    # Language-based
    if file_path.endswith((".ts", ".tsx")):
        skills.extend(["typescript-standards", "error-handling"])
    elif file_path.endswith(".py"):
        skills.extend(["python-standards", "error-handling"])
    elif file_path.endswith(".go"):
        skills.extend(["go-standards", "error-handling"])

    # Location-based
    if any(x in file_path for x in ["api/", "routes/", "endpoint"]):
        skills.extend(["api-design", "security-hardening", "auth-patterns"])

    if any(x in file_path for x in ["db/", "models/", "schema"]):
        skills.extend(["database-design", "security-hardening", "privacy-compliance"])

    if any(x in file_path for x in ["components/", "ui/", "pages/"]):
        skills.extend(["ui-engineering", "accessibility-standards"])

    if any(x in file_path for x in ["test/", ".test.", ".spec.", "__tests__/"]):
        skills.append("testing-strategy")

    if any(x in file_path for x in ["auth/", "login", "session"]):
        skills.extend(["auth-patterns", "security-hardening"])

    if any(x in file_path for x in ["lib/", "utils/", "helpers/"]):
        skills.extend(["typescript-standards", "error-handling"])

    if any(x in file_path for x in ["worker/", "job/", "queue/"]):
        skills.extend(["background-jobs", "error-handling"])

    # Configuration files
    if file_path.endswith((".yml", ".yaml", ".json")):
        if any(x in file_path for x in [".github/", "ci/", "cd/"]):
            skills.extend(["devops-pipeline", "git-workflow"])

    if "Dockerfile" in file_path or file_path.endswith(".dockerfile"):
        skills.extend(["container-orchestration", "security-hardening"])

    # Documentation
    if file_path.endswith(".md"):
        skills.append("documentation-standards")

    return list(set(skills))


def analyze_coverage(source_dir: str) -> dict:
    """Analyze skill coverage for a codebase."""
    source_path = Path(source_dir)

    if not source_path.exists():
        return {"error": f"Directory {source_dir} not found"}

    # Get all source files
    all_files = []
    for ext in [".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".rs", ".java", ".md"]:
        all_files.extend(source_path.rglob(f"*{ext}"))

    # Map files to skills
    skill_coverage = {}

    for file_path in all_files:
        file_str = str(file_path.relative_to(source_path))
        applicable_skills = get_file_skills(file_str)

        for skill in applicable_skills:
            if skill not in skill_coverage:
                skill_coverage[skill] = CoverageInfo(skill=skill)
            skill_coverage[skill].files_applicable.append(file_str)

    # Calculate coverage stats
    total_files = len(all_files)
    coverage_stats = {
        "total_files": total_files,
        "total_skills": len(skill_coverage),
        "skills": {},
        "uncovered_files": [],
    }

    for skill, info in skill_coverage.items():
        coverage_stats["skills"][skill] = {
            "applicable_count": len(info.files_applicable),
            "applicable_percentage": round(
                len(info.files_applicable) / total_files * 100, 2
            ),
            "sample_files": info.files_applicable[:5],  # First 5 examples
        }

    # Find files with no skill coverage
    covered_files = set()
    for info in skill_coverage.values():
        covered_files.update(info.files_applicable)

    all_file_strs = {str(f.relative_to(source_path)) for f in all_files}
    uncovered = all_file_strs - covered_files
    coverage_stats["uncovered_files"] = list(uncovered)
    coverage_stats["uncovered_count"] = len(uncovered)
    coverage_stats["coverage_percentage"] = round(
        (total_files - len(uncovered)) / total_files * 100, 2
    )

    return coverage_stats


def print_coverage_report(coverage: dict):
    """Print formatted coverage report."""
    print("\n" + "=" * 70)
    print("  SKILL COVERAGE ANALYSIS")
    print("=" * 70)

    if "error" in coverage:
        print(f"\n  ❌ Error: {coverage['error']}")
        return

    print(f"\n  Total Files Analyzed: {coverage['total_files']}")
    print(f"  Total Skills Active: {coverage['total_skills']}")
    print(f"  Overall Coverage: {coverage['coverage_percentage']}%")
    print(f"  Uncovered Files: {coverage['uncovered_count']}")

    print("\n" + "-" * 70)
    print("  COVERAGE BY SKILL:")
    print("-" * 70)

    # Sort by applicable count
    sorted_skills = sorted(
        coverage["skills"].items(),
        key=lambda x: x[1]["applicable_count"],
        reverse=True,
    )

    for skill, stats in sorted_skills:
        bar_length = int(stats["applicable_percentage"] / 2)
        bar = "█" * bar_length + "░" * (50 - bar_length)
        print(
            f"\n  {skill:30s} {stats['applicable_count']:4d} files ({stats['applicable_percentage']:5.1f}%)"
        )
        print(f"  {bar}")
        if stats["sample_files"]:
            print(f"    Examples: {', '.join(stats['sample_files'][:3])}")

    if coverage["uncovered_files"]:
        print("\n" + "-" * 70)
        print("  UNCOVERED FILES (No skills apply):")
        print("-" * 70)
        for f in coverage["uncovered_files"][:10]:  # Show first 10
            print(f"    • {f}")
        if len(coverage["uncovered_files"]) > 10:
            print(f"    ... and {len(coverage['uncovered_files']) - 10} more")

    print("\n" + "=" * 70)

    # Recommendations
    print("\n  RECOMMENDATIONS:")
    if coverage["uncovered_count"] > 0:
        print(
            "  ⚠️  Some files have no skill coverage - consider adding relevant skills"
        )

    low_coverage_skills = [
        (skill, stats)
        for skill, stats in coverage["skills"].items()
        if stats["applicable_count"] < 5
    ]
    if low_coverage_skills:
        print("  ⚠️  Low coverage skills:")
        for skill, stats in low_coverage_skills:
            print(f"     • {skill}: only {stats['applicable_count']} files")

    print("=" * 70 + "\n")


def main():
    parser = argparse.ArgumentParser(description="Analyze skill coverage in codebase")
    parser.add_argument(
        "source_dir",
        nargs="?",
        default="src",
        help="Source directory to analyze (default: src)",
    )
    parser.add_argument(
        "--report",
        action="store_true",
        help="Generate coverage report",
    )
    parser.add_argument(
        "--output",
        help="Save report to JSON file",
    )
    parser.add_argument(
        "--skill",
        help="Analyze coverage for specific skill only",
    )

    args = parser.parse_args()

    print(f"🔍 Analyzing skill coverage in {args.source_dir}...")

    coverage = analyze_coverage(args.source_dir)

    if args.skill:
        if args.skill in coverage.get("skills", {}):
            skill_data = coverage["skills"][args.skill]
            print(f"\n📊 Coverage for {args.skill}:")
            print(f"   Applicable to: {skill_data['applicable_count']} files")
            print(f"   Percentage: {skill_data['applicable_percentage']}%")
            print(f"\n   Sample files:")
            for f in skill_data["sample_files"][:10]:
                print(f"     • {f}")
        else:
            print(f"\n❌ Skill '{args.skill}' not found or has no coverage")
    elif args.output:
        with open(args.output, "w") as f:
            json.dump(coverage, f, indent=2)
        print(f"\n✅ Coverage report saved to {args.output}")
    else:
        print_coverage_report(coverage)


if __name__ == "__main__":
    main()
