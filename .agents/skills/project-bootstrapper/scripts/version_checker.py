#!/usr/bin/env python3
"""
Version Checker for Project Bootstrapper
Verifies that all technology versions in generated skills are up-to-date.

Usage:
    python version_checker.py <skills-directory>
    python version_checker.py --verify-tech typescript react nextjs

Example:
    python version_checker.py .claude/skills/
    python version_checker.py --check-manifest .claude/skills/_bootstrap-manifest.json
"""

import json
import re
import subprocess
import sys
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Optional
import urllib.request
import urllib.error


@dataclass
class VersionCheck:
    technology: str
    found_version: str
    latest_version: Optional[str] = None
    is_outdated: bool = False
    is_verified: bool = False
    source: str = ""
    error: Optional[str] = None


@dataclass
class VersionReport:
    skills_dir: Path
    checks: list[VersionCheck] = field(default_factory=list)
    errors: list[str] = field(default_factory=list)

    @property
    def all_verified(self) -> bool:
        return all(c.is_verified for c in self.checks)

    @property
    def outdated_count(self) -> int:
        return sum(1 for c in self.checks if c.is_outdated)


# Version requirements per technology (minimum supported versions)
VERSION_REQUIREMENTS = {
    # JavaScript/TypeScript
    "node": {"min": "22.0.0", "lts": "22.x", "check_cmd": "node --version"},
    "npm": {"min": "10.0.0", "check_cmd": "npm --version"},
    "typescript": {"min": "5.7.0", "check_cmd": "npx tsc --version"},
    "nextjs": {"min": "16.0.0", "npm": "next"},
    "react": {"min": "19.0.0", "npm": "react"},
    "vue": {"min": "3.5.0", "npm": "vue"},
    "vite": {"min": "6.0.0", "npm": "vite"},
    # Python
    "python": {"min": "3.12.0", "check_cmd": "python --version"},
    "pip": {"min": "24.0.0", "check_cmd": "pip --version"},
    "fastapi": {"min": "0.115.0", "pypi": "fastapi"},
    "pydantic": {"min": "2.10.0", "pypi": "pydantic"},
    "django": {"min": "5.0.0", "pypi": "Django"},
    "flask": {"min": "3.0.0", "pypi": "Flask"},
    # Go
    "go": {"min": "1.24.0", "check_cmd": "go version"},
    "gin": {"min": "1.10.0", "go": "github.com/gin-gonic/gin"},
    "echo": {"min": "4.13.0", "go": "github.com/labstack/echo/v4"},
    # Rust
    "rust": {"min": "1.85.0", "check_cmd": "rustc --version"},
    "cargo": {"min": "1.85.0", "check_cmd": "cargo --version"},
    "tokio": {"min": "1.43.0", "crate": "tokio"},
    "axum": {"min": "0.8.0", "crate": "axum"},
    # Java
    "java": {"min": "21.0.0", "check_cmd": "java --version"},
    "spring": {"min": "3.3.0", "maven": "org.springframework.boot:spring-boot"},
    # Kotlin
    "kotlin": {"min": "2.1.0", "check_cmd": "kotlin -version"},
    # C#
    "dotnet": {"min": "9.0.0", "check_cmd": "dotnet --version"},
    # Swift
    "swift": {"min": "6.0.0", "check_cmd": "swift --version"},
    # PHP
    "php": {"min": "8.4.0", "check_cmd": "php --version"},
    "composer": {"min": "2.8.0", "check_cmd": "composer --version"},
    "laravel": {"min": "11.0.0", "packagist": "laravel/framework"},
    # Ruby
    "ruby": {"min": "3.4.0", "check_cmd": "ruby --version"},
    "rails": {"min": "8.0.0", "rubygems": "rails"},
    # Databases
    "postgresql": {"min": "17.0", "check_cmd": "psql --version"},
    "mysql": {"min": "9.0", "check_cmd": "mysql --version"},
    "mongodb": {"min": "8.0", "check_cmd": "mongod --version"},
    "redis": {"min": "7.4", "check_cmd": "redis-server --version"},
    # Tools
    "docker": {"min": "27.0.0", "check_cmd": "docker --version"},
    "kubernetes": {"min": "1.32.0", "check_cmd": "kubectl version"},
    "terraform": {"min": "1.10.0", "check_cmd": "terraform version"},
    "git": {"min": "2.47.0", "check_cmd": "git --version"},
}


def extract_versions_from_skill(skill_path: Path) -> list[VersionCheck]:
    """Extract all version references from a skill file."""
    checks = []
    content = skill_path.read_text(encoding="utf-8")

    # Pattern: Technology X.Y.Z
    version_patterns = [
        (r"\bNode\.js\s+v?(\d+\.\d+(?:\.\d+)?)\b", "node", "Node.js"),
        (r"\bTypeScript\s+v?(\d+\.\d+(?:\.\d+)?)\b", "typescript", "TypeScript"),
        (r"\bReact\s+v?(\d+\.\d+(?:\.\d+)?)\b", "react", "React"),
        (r"\bNext\.js\s+v?(\d+\.\d+(?:\.\d+)?)\b", "nextjs", "Next.js"),
        (r"\bVue\.js\s+v?(\d+\.\d+(?:\.\d+)?)\b", "vue", "Vue.js"),
        (r"\bPython\s+v?(\d+\.\d+(?:\.\d+)?)\b", "python", "Python"),
        (r"\bGo\s+v?(\d+\.\d+(?:\.\d+)?)\b", "go", "Go"),
        (r"\bRust\s+v?(\d+\.\d+(?:\.\d+)?)\b", "rust", "Rust"),
        (r"\bJava\s+(\d+\.?\d*)\b", "java", "Java"),
        (r"\bKotlin\s+v?(\d+\.\d+(?:\.\d+)?)\b", "kotlin", "Kotlin"),
        (r"\.NET\s+(\d+\.\d+)\b", "dotnet", ".NET"),
        (r"\bSwift\s+v?(\d+\.\d+(?:\.\d+)?)\b", "swift", "Swift"),
        (r"\bPHP\s+v?(\d+\.\d+(?:\.\d+)?)\b", "php", "PHP"),
        (r"\bRuby\s+v?(\d+\.\d+(?:\.\d+)?)\b", "ruby", "Ruby"),
        (r"\bPostgreSQL\s+(\d+\.?\d*)\b", "postgresql", "PostgreSQL"),
        (r"\bMySQL\s+(\d+\.\d+)\b", "mysql", "MySQL"),
        (r"\bMongoDB\s+(\d+\.\d+)\b", "mongodb", "MongoDB"),
        (r"\bRedis\s+v?(\d+\.\d+)\b", "redis", "Redis"),
        (r"\bDocker\s+v?(\d+\.\d+(?:\.\d+)?)\b", "docker", "Docker"),
        (r"\bKubernetes\s+v?(\d+\.\d+)\b", "kubernetes", "Kubernetes"),
        (r"\bTerraform\s+v?(\d+\.\d+(?:\.\d+)?)\b", "terraform", "Terraform"),
    ]

    for pattern, tech_key, display_name in version_patterns:
        matches = re.findall(pattern, content, re.IGNORECASE)
        for version in matches:
            checks.append(
                VersionCheck(
                    technology=display_name,
                    found_version=version,
                    source=str(skill_path),
                )
            )

    return checks


def check_local_version(tech_key: str, check_cmd: str) -> Optional[str]:
    """Check locally installed version of a tool."""
    try:
        result = subprocess.run(
            check_cmd.split(), capture_output=True, text=True, timeout=10
        )
        if result.returncode == 0:
            # Extract version from output
            version_match = re.search(r"(\d+\.\d+(?:\.\d+)?)", result.stdout)
            if version_match:
                return version_match.group(1)
    except (subprocess.SubprocessError, FileNotFoundError):
        pass
    return None


def version_is_newer(version: str, min_version: str) -> bool:
    """Compare two version strings."""

    def parse_ver(v: str) -> tuple:
        parts = v.split(".")
        return tuple(int(p) if p.isdigit() else 0 for p in parts[:3])

    return parse_ver(version) >= parse_ver(min_version)


def verify_versions(checks: list[VersionCheck]) -> list[VersionCheck]:
    """Verify all extracted versions against requirements."""
    for check in checks:
        tech_key = check.technology.lower().replace(".", "").replace(" ", "")

        if tech_key in VERSION_REQUIREMENTS:
            req = VERSION_REQUIREMENTS[tech_key]
            min_ver = req.get("min", "0.0.0")

            # Check if version meets minimum
            if version_is_newer(check.found_version, min_ver):
                check.is_verified = True
            else:
                check.is_outdated = True
                check.error = (
                    f"Version {check.found_version} is below minimum {min_ver}"
                )

            # Try to check local version if available
            if "check_cmd" in req:
                local_ver = check_local_version(tech_key, req["check_cmd"])
                if local_ver and version_is_newer(local_ver, check.found_version):
                    check.error = f"Local version ({local_ver}) is newer than skill version ({check.found_version})"

    return checks


def check_manifest_versions(manifest_path: Path) -> list[VersionCheck]:
    """Check versions documented in bootstrap manifest."""
    checks = []

    try:
        manifest = json.loads(manifest_path.read_text())
        tech_stack = manifest.get("tech_stack", {})

        for tech, info in tech_stack.items():
            if isinstance(info, dict) and "version" in info:
                checks.append(
                    VersionCheck(
                        technology=tech,
                        found_version=info["version"],
                        is_verified=info.get("verified", False),
                        source=f"manifest:{tech}",
                    )
                )
    except (json.JSONDecodeError, FileNotFoundError) as e:
        print(f"Error reading manifest: {e}")

    return checks


def print_version_report(report: VersionReport):
    """Print formatted version report."""
    print("\n" + "=" * 70)
    print("  VERSION VERIFICATION REPORT")
    print("=" * 70)
    print(f"  Skills Directory: {report.skills_dir}")
    print(f"  Check Date: {datetime.now().isoformat()}")
    print("=" * 70)

    if not report.checks:
        print("\n  No version references found in skills.")
        return

    verified = [c for c in report.checks if c.is_verified and not c.is_outdated]
    outdated = [c for c in report.checks if c.is_outdated]
    unknown = [c for c in report.checks if not c.is_verified and not c.error]
    errors = [c for c in report.checks if c.error]

    if verified:
        print("\n  ✅ VERIFIED VERSIONS")
        print("  " + "-" * 66)
        for check in verified:
            print(f"     {check.technology:20s} {check.found_version:15s}")

    if outdated:
        print("\n  ⚠️  OUTDATED VERSIONS")
        print("  " + "-" * 66)
        for check in outdated:
            print(
                f"     {check.technology:20s} {check.found_version:15s} {check.error}"
            )

    if errors:
        print("\n  ❌ VERSION ERRORS")
        print("  " + "-" * 66)
        for check in errors:
            print(f"     {check.technology:20s} {check.found_version:15s}")
            print(f"     Error: {check.error}")

    if unknown:
        print("\n  ❓ UNVERIFIED VERSIONS")
        print("  " + "-" * 66)
        for check in unknown:
            print(f"     {check.technology:20s} {check.found_version:15s}")

    print("\n" + "=" * 70)
    print("  SUMMARY")
    print("=" * 70)
    print(f"  Total versions found:  {len(report.checks)}")
    print(f"  Verified & current:    {len(verified)}")
    print(f"  Outdated:              {len(outdated)}")
    print(f"  Errors:                {len(errors)}")
    print(f"  Unverified:            {len(unknown)}")
    print("=" * 70)

    if outdated or errors:
        print("\n  ⚠️  ACTION REQUIRED: Update outdated versions before production use")
        return 1
    elif unknown:
        print(
            "\n  ⚠️  WARNING: Some versions not verified — document verification sources"
        )
        return 0
    else:
        print("\n  ✅ ALL VERSIONS VERIFIED AND CURRENT")
        return 0


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    if sys.argv[1] == "--check-manifest":
        if len(sys.argv) < 3:
            print("Usage: python version_checker.py --check-manifest <manifest.json>")
            sys.exit(1)
        manifest_path = Path(sys.argv[2])
        checks = check_manifest_versions(manifest_path)
        checks = verify_versions(checks)
        report = VersionReport(skills_dir=manifest_path.parent, checks=checks)
        exit_code = print_version_report(report)
        sys.exit(exit_code)

    skills_dir = Path(sys.argv[1])
    if not skills_dir.exists():
        print(f"Error: {skills_dir} not found")
        sys.exit(1)

    # Collect all version references
    all_checks = []

    # Check manifest first
    manifest_path = skills_dir / "_bootstrap-manifest.json"
    if manifest_path.exists():
        all_checks.extend(check_manifest_versions(manifest_path))

    # Check all skill files
    for skill_dir in skills_dir.iterdir():
        if skill_dir.is_dir() and not skill_dir.name.startswith(("_", ".")):
            skill_md = skill_dir / "SKILL.md"
            if skill_md.exists():
                all_checks.extend(extract_versions_from_skill(skill_md))

            # Check references too
            refs_dir = skill_dir / "references"
            if refs_dir.exists():
                for ref_file in refs_dir.glob("*.md"):
                    all_checks.extend(extract_versions_from_skill(ref_file))

    # Verify all versions
    all_checks = verify_versions(all_checks)

    # Generate report
    report = VersionReport(skills_dir=skills_dir, checks=all_checks)
    exit_code = print_version_report(report)
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
