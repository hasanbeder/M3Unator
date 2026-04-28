#!/usr/bin/env python3
"""
Skill Compliance Checker
Validates that code follows the project's skill rules.

Usage:
    python check_skill_compliance.py <source-directory>
    python check_skill_compliance.py --staged  # Check git staged files
    python check_skill_compliance.py --file path/to/file.ts

Example:
    python check_skill_compliance.py src/
    python check_skill_compliance.py --staged --strict
"""

import argparse
import json
import re
import subprocess
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional


@dataclass
class Violation:
    file: str
    line: int
    skill: str
    rule: str
    severity: str  # CRITICAL, HIGH, MEDIUM, LOW
    message: str
    fix_suggestion: Optional[str] = None


@dataclass
class ComplianceReport:
    files_checked: int
    violations: list[Violation] = field(default_factory=list)
    errors: list[str] = field(default_factory=list)

    @property
    def critical_count(self) -> int:
        return sum(1 for v in self.violations if v.severity == "CRITICAL")

    @property
    def high_count(self) -> int:
        return sum(1 for v in self.violations if v.severity == "HIGH")

    @property
    def passed(self) -> bool:
        return self.critical_count == 0 and self.high_count == 0


def get_staged_files() -> list[str]:
    """Get list of staged files from git."""
    try:
        result = subprocess.run(
            ["git", "diff", "--cached", "--name-only", "--diff-filter=ACM"],
            capture_output=True,
            text=True,
            check=True,
        )
        return [f for f in result.stdout.strip().split("\n") if f]
    except subprocess.SubprocessError:
        return []


def get_skills() -> dict[str, dict]:
    """Load all active skills."""
    skills = {}
    skills_dir = Path(".claude/skills")

    if not skills_dir.exists():
        return skills

    for skill_dir in skills_dir.iterdir():
        if skill_dir.is_dir() and not skill_dir.name.startswith(("_", ".")):
            skill_md = skill_dir / "SKILL.md"
            if skill_md.exists():
                skills[skill_dir.name] = {
                    "name": skill_dir.name,
                    "path": skill_dir,
                    "content": skill_md.read_text(),
                }

    return skills


def get_relevant_skills(file_path: str, skills: dict) -> list[str]:
    """Determine which skills apply to a file."""
    relevant = []

    # Language-based skills
    if file_path.endswith(".ts") or file_path.endswith(".tsx"):
        if "typescript-standards" in skills:
            relevant.append("typescript-standards")
    elif file_path.endswith(".py"):
        if "python-standards" in skills:
            relevant.append("python-standards")
    elif file_path.endswith(".go"):
        if "go-standards" in skills:
            relevant.append("go-standards")

    # Location-based skills
    if "api/" in file_path or "routes/" in file_path:
        relevant.extend(["api-design", "security-hardening"])
    if "db/" in file_path or "models/" in file_path:
        relevant.extend(["database-design", "security-hardening"])
    if "components/" in file_path or "ui/" in file_path:
        relevant.extend(["ui-engineering", "accessibility-standards"])
    if "test/" in file_path or ".test." in file_path:
        relevant.append("testing-strategy")
    if "auth/" in file_path:
        relevant.extend(["auth-patterns", "security-hardening"])

    # Always check these
    relevant.extend(["error-handling", "security-hardening"])

    return list(set(relevant))


def check_typescript_standards(content: str, file_path: str) -> list[Violation]:
    """Check TypeScript-specific violations."""
    violations = []

    # Check for 'any' type
    any_pattern = r":\s*any\b"
    for match in re.finditer(any_pattern, content):
        line_num = content[: match.start()].count("\n") + 1
        violations.append(
            Violation(
                file=file_path,
                line=line_num,
                skill="typescript-standards",
                rule="No 'any' types",
                severity="HIGH",
                message="Found 'any' type - use specific type or 'unknown'",
                fix_suggestion="Replace 'any' with specific type or 'unknown'",
            )
        )

    # Check for missing return types on exported functions
    func_pattern = r"export\s+(?:async\s+)?function\s+\w+\s*\([^)]*\)(?!\s*:)(?!\s*<)"
    for match in re.finditer(func_pattern, content):
        line_num = content[: match.start()].count("\n") + 1
        violations.append(
            Violation(
                file=file_path,
                line=line_num,
                skill="typescript-standards",
                rule="Explicit return types",
                severity="MEDIUM",
                message="Exported function missing explicit return type",
                fix_suggestion="Add return type annotation",
            )
        )

    # Check for console.log
    console_pattern = r"console\.(log|warn|error|info)"
    for match in re.finditer(console_pattern, content):
        line_num = content[: match.start()].count("\n") + 1
        violations.append(
            Violation(
                file=file_path,
                line=line_num,
                skill="typescript-standards",
                rule="No console in production",
                severity="LOW",
                message="console statement found - use proper logging",
                fix_suggestion="Replace with structured logger",
            )
        )

    return violations


def check_security_hardening(content: str, file_path: str) -> list[Violation]:
    """Check security violations."""
    violations = []

    # Check for SQL injection (string concatenation in queries)
    sql_patterns = [
        r'query\s*\(\s*[`"\'].*?\$\{.*?\}',
        r'execute\s*\(\s*[`"\'].*?\+',
    ]
    for pattern in sql_patterns:
        for match in re.finditer(pattern, content, re.IGNORECASE):
            line_num = content[: match.start()].count("\n") + 1
            violations.append(
                Violation(
                    file=file_path,
                    line=line_num,
                    skill="security-hardening",
                    rule="SQL injection prevention",
                    severity="CRITICAL",
                    message="Possible SQL injection - use parameterized queries",
                    fix_suggestion="Use parameterized queries or ORM",
                )
            )

    # Check for localStorage (JWT storage)
    localstorage_pattern = r"localStorage\.(set|get)Item\s*\(\s*['\"](token|jwt|auth)"
    for match in re.finditer(localstorage_pattern, content, re.IGNORECASE):
        line_num = content[: match.start()].count("\n") + 1
        violations.append(
            Violation(
                file=file_path,
                line=line_num,
                skill="security-hardening",
                rule="JWT storage",
                severity="CRITICAL",
                message="JWT stored in localStorage - use httpOnly cookies",
                fix_suggestion="Store JWT in httpOnly secure cookie",
            )
        )

    # Check for eval
    eval_pattern = r"\beval\s*\("
    for match in re.finditer(eval_pattern, content):
        line_num = content[: match.start()].count("\n") + 1
        violations.append(
            Violation(
                file=file_path,
                line=line_num,
                skill="security-hardening",
                rule="No eval",
                severity="CRITICAL",
                message="eval() detected - major security risk",
                fix_suggestion="Remove eval, use safer alternatives",
            )
        )

    return violations


def check_error_handling(content: str, file_path: str) -> list[Violation]:
    """Check error handling violations."""
    violations = []

    # Check for generic Error
    error_pattern = r"throw\s+new\s+Error\s*\("
    for match in re.finditer(error_pattern, content):
        line_num = content[: match.start()].count("\n") + 1
        violations.append(
            Violation(
                file=file_path,
                line=line_num,
                skill="error-handling",
                rule="Custom error types",
                severity="HIGH",
                message="Generic Error thrown - use custom error type",
                fix_suggestion="Use specific error class (e.g., DatabaseError, ValidationError)",
            )
        )

    # Check for empty catch blocks
    empty_catch_pattern = r"catch\s*\([^)]*\)\s*\{\s*\}"
    for match in re.finditer(empty_catch_pattern, content):
        line_num = content[: match.start()].count("\n") + 1
        violations.append(
            Violation(
                file=file_path,
                line=line_num,
                skill="error-handling",
                rule="No empty catch blocks",
                severity="HIGH",
                message="Empty catch block - errors are silently swallowed",
                fix_suggestion="Handle error or re-throw",
            )
        )

    return violations


def check_testing_strategy(content: str, file_path: str) -> list[Violation]:
    """Check testing strategy violations."""
    violations = []

    # Check for .only in tests
    only_pattern = r"\.(only|skip)\s*\("
    for match in re.finditer(only_pattern, content):
        line_num = content[: match.start()].count("\n") + 1
        violations.append(
            Violation(
                file=file_path,
                line=line_num,
                skill="testing-strategy",
                rule="No .only/.skip in commits",
                severity="HIGH",
                message="Test has .only or .skip - will skip other tests",
                fix_suggestion="Remove .only/.skip before committing",
            )
        )

    return violations


def check_file(file_path: str, skills: dict) -> list[Violation]:
    """Check a single file for skill violations."""
    violations = []

    try:
        content = Path(file_path).read_text()
    except (FileNotFoundError, UnicodeDecodeError):
        return violations

    relevant_skills = get_relevant_skills(file_path, skills)

    # Run checks based on file type and relevant skills
    if file_path.endswith(".ts") or file_path.endswith(".tsx"):
        if "typescript-standards" in relevant_skills:
            violations.extend(check_typescript_standards(content, file_path))

    if "security-hardening" in relevant_skills:
        violations.extend(check_security_hardening(content, file_path))

    if "error-handling" in relevant_skills:
        violations.extend(check_error_handling(content, file_path))

    if ".test." in file_path or ".spec." in file_path:
        if "testing-strategy" in relevant_skills:
            violations.extend(check_testing_strategy(content, file_path))

    return violations


def print_report(report: ComplianceReport):
    """Print formatted compliance report."""
    print("\n" + "=" * 70)
    print("  SKILL COMPLIANCE REPORT")
    print("=" * 70)
    print(f"  Files checked: {report.files_checked}")
    print(f"  Violations: {len(report.violations)}")
    print(f"    🔴 Critical: {report.critical_count}")
    print(f"    🟠 High: {report.high_count}")
    print(
        f"    🟡 Medium: {sum(1 for v in report.violations if v.severity == 'MEDIUM')}"
    )
    print(f"    🟢 Low: {sum(1 for v in report.violations if v.severity == 'LOW')}")
    print("=" * 70)

    if report.violations:
        print("\n  VIOLATIONS:")
        print("  " + "-" * 68)

        # Group by severity
        for severity in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]:
            severity_violations = [
                v for v in report.violations if v.severity == severity
            ]
            if severity_violations:
                icon = {"CRITICAL": "🔴", "HIGH": "🟠", "MEDIUM": "🟡", "LOW": "🟢"}[
                    severity
                ]
                print(f"\n  {icon} {severity}:")
                for v in severity_violations:
                    print(f"\n     {v.file}:{v.line}")
                    print(f"     Skill: {v.skill} | Rule: {v.rule}")
                    print(f"     Issue: {v.message}")
                    if v.fix_suggestion:
                        print(f"     Fix: {v.fix_suggestion}")

    print("\n" + "=" * 70)
    if report.passed:
        print("  ✅ ALL CHECKS PASSED")
    else:
        print("  ❌ VIOLATIONS FOUND - Fix before committing")
    print("=" * 70 + "\n")


def main():
    parser = argparse.ArgumentParser(
        description="Check code compliance with project skills"
    )
    parser.add_argument(
        "path",
        nargs="?",
        help="Directory or file to check",
    )
    parser.add_argument(
        "--staged",
        action="store_true",
        help="Check only git staged files",
    )
    parser.add_argument(
        "--file",
        help="Check specific file",
    )
    parser.add_argument(
        "--strict",
        action="store_true",
        help="Fail on any violation (including LOW)",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output as JSON",
    )

    args = parser.parse_args()

    # Load skills
    skills = get_skills()
    if not skills:
        print("❌ No skills found in .claude/skills/")
        sys.exit(1)

    # Get files to check
    files_to_check = []

    if args.staged:
        files_to_check = get_staged_files()
    elif args.file:
        files_to_check = [args.file]
    elif args.path:
        path = Path(args.path)
        if path.is_file():
            files_to_check = [str(path)]
        elif path.is_dir():
            files_to_check = [str(f) for f in path.rglob("*") if f.is_file()]
    else:
        # Check current directory
        files_to_check = [str(f) for f in Path(".").rglob("*") if f.is_file()]

    # Filter to code files only
    code_extensions = {".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".rs", ".java"}
    files_to_check = [
        f for f in files_to_check if any(f.endswith(ext) for ext in code_extensions)
    ]

    # Check each file
    all_violations = []
    for file_path in files_to_check:
        if Path(file_path).exists():
            violations = check_file(file_path, skills)
            all_violations.extend(violations)

    # Generate report
    report = ComplianceReport(
        files_checked=len(files_to_check),
        violations=all_violations,
    )

    if args.json:
        print(
            json.dumps(
                {
                    "files_checked": report.files_checked,
                    "violations_count": len(report.violations),
                    "passed": report.passed,
                    "violations": [
                        {
                            "file": v.file,
                            "line": v.line,
                            "skill": v.skill,
                            "rule": v.rule,
                            "severity": v.severity,
                            "message": v.message,
                        }
                        for v in report.violations
                    ],
                },
                indent=2,
            )
        )
    else:
        print_report(report)

    # Exit with error if violations found
    if args.strict and report.violations:
        sys.exit(1)
    elif not report.passed:
        sys.exit(1)
    else:
        sys.exit(0)


if __name__ == "__main__":
    main()
