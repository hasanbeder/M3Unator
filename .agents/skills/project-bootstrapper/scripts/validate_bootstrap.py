#!/usr/bin/env python3
"""
Bootstrap Skill Validator v2
Validates generated skills for completeness, consistency, and quality.

Usage:
    python validate_bootstrap.py <skills-directory>

Example:
    python validate_bootstrap.py .claude/skills/
"""

import json
import os
import re
import sys
from pathlib import Path
from dataclasses import dataclass, field


@dataclass
class ValidationResult:
    skill_name: str
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    info: list[str] = field(default_factory=list)
    stats: dict = field(default_factory=dict)

    @property
    def passed(self) -> bool:
        return len(self.errors) == 0


@dataclass
class BootstrapValidation:
    skills_dir: Path
    results: list[ValidationResult] = field(default_factory=list)
    cross_errors: list[str] = field(default_factory=list)
    cross_warnings: list[str] = field(default_factory=list)

    @property
    def total_errors(self) -> int:
        return sum(len(r.errors) for r in self.results) + len(self.cross_errors)

    @property
    def total_warnings(self) -> int:
        return sum(len(r.warnings) for r in self.results) + len(self.cross_warnings)

    @property
    def passed(self) -> bool:
        return self.total_errors == 0


def validate_frontmatter(content: str, result: ValidationResult):
    if not content.startswith("---"):
        result.errors.append("Missing YAML frontmatter (must start with ---)")
        return
    parts = content.split("---", 2)
    if len(parts) < 3:
        result.errors.append("Malformed YAML frontmatter (missing closing ---)")
        return

    fm = parts[1]
    if "name:" not in fm:
        result.errors.append("Frontmatter missing 'name' field")
    if "description:" not in fm:
        result.errors.append("Frontmatter missing 'description' field")
    else:
        # Rough description length check
        desc_lines = []
        in_desc = False
        for line in fm.split("\n"):
            if line.strip().startswith("description:"):
                in_desc = True
                rest = line.split("description:", 1)[1].strip()
                if rest and rest != "|":
                    desc_lines.append(rest)
            elif in_desc:
                if line.startswith("  ") or line.startswith("\t"):
                    desc_lines.append(line.strip())
                else:
                    break
        desc = " ".join(desc_lines)
        if len(desc) < 80:
            result.warnings.append(
                f"Description may be too short ({len(desc)} chars) — aim for 100+"
            )
        result.stats["description_length"] = len(desc)


def validate_sections(content: str, result: ValidationResult):
    required = {
        "Activation": "Missing 'Activation' section — skill won't know when to trigger",
        "Core Rules": "Missing 'Core Rules' or 'Rules' section",
    }
    for section, msg in required.items():
        pattern = rf"##?\s+.*{re.escape(section)}"
        if not re.search(pattern, content, re.IGNORECASE):
            # Try alternate names
            if section == "Core Rules" and re.search(
                r"##?\s+.*Rules?\b", content, re.IGNORECASE
            ):
                continue
            result.errors.append(msg)

    recommended = [
        "Pattern",
        "Anti-Pattern",
        "Security",
        "Performance",
        "Error",
        "Checklist",
        "Edge Case",
    ]
    for section in recommended:
        if not re.search(rf"##?\s+.*{section}", content, re.IGNORECASE):
            result.warnings.append(
                f"No section matching '{section}' — recommended for completeness"
            )


def validate_code_blocks(content: str, result: ValidationResult):
    blocks = re.findall(r"```(\w*)\n(.*?)```", content, re.DOTALL)
    result.stats["code_blocks"] = len(blocks)

    if len(blocks) == 0:
        result.errors.append("No code examples — skills must have concrete code")
    elif len(blocks) < 3:
        result.warnings.append(
            f"Only {len(blocks)} code blocks — aim for 5+ (correct + incorrect)"
        )

    has_good = bool(re.search(r"[✅]|Correct|// Good|# Good|// DO\b|# DO\b", content))
    has_bad = bool(
        re.search(
            r"[❌]|Incorrect|// Bad|# Bad|// DON.T|# DON.T|WRONG",
            content,
            re.IGNORECASE,
        )
    )
    if not has_good:
        result.warnings.append("No clearly marked CORRECT examples (✅)")
    if not has_bad:
        result.warnings.append("No clearly marked INCORRECT examples (❌)")


def validate_rules(content: str, result: ValidationResult):
    rule_pattern = r"###\s+Rule\s+\d+"
    rules = re.findall(rule_pattern, content, re.IGNORECASE)
    result.stats["rules_count"] = len(rules)

    if len(rules) == 0:
        # Check for numbered rules in other formats
        alt_rules = re.findall(r"###\s+\d+[\.\):]", content)
        if alt_rules:
            result.stats["rules_count"] = len(alt_rules)
        else:
            result.warnings.append(
                "No numbered rules found — rules should be explicit and numbered"
            )
    elif len(rules) < 5:
        result.warnings.append(f"Only {len(rules)} rules — most skills need 15-40")


def validate_anti_patterns(content: str, result: ValidationResult):
    severity_markers = re.findall(r"[🔴🟠🟡🟢]", content)
    result.stats["anti_patterns_with_severity"] = len(severity_markers)

    if not re.search(r"anti.?pattern", content, re.IGNORECASE):
        result.warnings.append("No anti-patterns section — document what NOT to do")


def validate_references(skill_dir: Path, result: ValidationResult):
    refs_dir = skill_dir / "references"
    if not refs_dir.exists():
        result.warnings.append(
            "No references/ directory — add patterns.md, anti-patterns.md, checklist.md"
        )
        return

    expected = {
        "patterns.md": 500,
        "anti-patterns.md": 500,
        "checklist.md": 200,
    }
    for fname, min_size in expected.items():
        fpath = refs_dir / fname
        if not fpath.exists():
            result.warnings.append(f"Missing references/{fname}")
        elif fpath.stat().st_size < min_size:
            result.warnings.append(
                f"references/{fname} seems short ({fpath.stat().st_size} bytes, expect ≥{min_size})"
            )


def validate_content_quality(content: str, result: ValidationResult):
    # Check for vague performance language
    vague_perf = re.findall(
        r"\b(should be fast|keep it efficient|optimize where possible|be performant|as fast as possible)\b",
        content,
        re.IGNORECASE,
    )
    if vague_perf:
        result.warnings.append(
            f"Vague performance language detected: '{vague_perf[0]}' — use concrete numbers"
        )

    # Check for weak security language
    weak_security = re.findall(
        r"\bshould\b.*\b(validate|sanitize|encrypt|authenticate|authorize)\b",
        content,
        re.IGNORECASE,
    )
    if weak_security:
        result.warnings.append(
            "Security rules use 'should' instead of 'must'/'never' — strengthen language"
        )

    # Check for generic advice
    generic = re.findall(
        r"\b(follow best practices|use industry standards|implement proper|ensure adequate)\b",
        content,
        re.IGNORECASE,
    )
    if generic:
        result.warnings.append(
            f"Generic advice detected: '{generic[0]}' — be specific about WHAT to do"
        )

    # Check for version verification markers
    validate_version_references(content, result)

    # Count total lines
    lines = content.split("\n")
    result.stats["total_lines"] = len(lines)
    if len(lines) > 500:
        result.warnings.append(
            f"SKILL.md is {len(lines)} lines — consider moving detail to references/"
        )


def validate_version_references(content: str, result: ValidationResult):
    """Check that version references are verified, not memorized."""

    # Look for unverified version warnings
    unverified_pattern = r"⚠️.*version.*unverified|version.*unverified.*⚠️"
    if re.search(unverified_pattern, content, re.IGNORECASE):
        result.warnings.append(
            "Contains unverified version references — MUST verify before production"
        )

    # Check for version patterns that should have verification
    version_patterns = [
        r"\b\d+\.\d+\.\d+\b",  # semantic versions
        r"\b\d+\.\d+\b",  # major.minor
    ]

    has_versions = any(re.search(p, content) for p in version_patterns)
    has_verification = bool(
        re.search(
            r"verified|verification|latest stable|release date", content, re.IGNORECASE
        )
    )

    if has_versions and not has_verification:
        result.warnings.append(
            "Contains version numbers without verification documentation — "
            "MUST document how versions were verified"
        )

    # Check for outdated version references (red flags)
    outdated_indicators = [
        (r"\bNode\.js\s+(14|16|18|20)\b", "Outdated Node.js version (< 22 LTS)"),
        (r"\bPython\s+(2\.|3\.[0-9])\b", "Outdated Python version (< 3.12)"),
        (r"\bGo\s+1\.(1[0-9]|2[0-3])\b", "Outdated Go version (< 1.24)"),
        (r"\bJava\s+(8|11|17)\b(?!.*LTS)", "Consider Java 21 LTS"),
    ]

    for pattern, message in outdated_indicators:
        if re.search(pattern, content):
            result.warnings.append(f"{message} — consider upgrading to latest stable")


def validate_skill(skill_dir: Path) -> ValidationResult:
    result = ValidationResult(skill_name=skill_dir.name)

    skill_md = skill_dir / "SKILL.md"
    if not skill_md.exists():
        result.errors.append("SKILL.md not found!")
        return result

    content = skill_md.read_text(encoding="utf-8")
    result.stats["size_bytes"] = len(content)

    if len(content) < 500:
        result.errors.append(
            f"SKILL.md too short ({len(content)} bytes) — likely incomplete"
        )

    validate_frontmatter(content, result)
    validate_sections(content, result)
    validate_code_blocks(content, result)
    validate_rules(content, result)
    validate_anti_patterns(content, result)
    validate_references(skill_dir, result)
    validate_content_quality(content, result)

    return result


def validate_cross_skill(skills_dir: Path, results: list[ValidationResult]):
    errors = []
    warnings = []

    # Check manifest
    manifest_path = skills_dir / "_bootstrap-manifest.json"
    if not manifest_path.exists():
        errors.append("Missing _bootstrap-manifest.json")
    else:
        try:
            manifest = json.loads(manifest_path.read_text())
            declared = {s["name"] for s in manifest.get("skills_generated", [])}
            actual = {r.skill_name for r in results}
            for name in declared - actual:
                errors.append(f"Manifest declares '{name}' but directory not found")
            for name in actual - declared - {"project-bootstrapper"}:
                warnings.append(f"Skill '{name}' exists but not in manifest")
        except (json.JSONDecodeError, KeyError) as e:
            errors.append(f"Invalid _bootstrap-manifest.json: {e}")

    # Check required domains exist
    required_domains = ["security", "error", "test", "architecture", "valid"]
    skill_names = [r.skill_name.lower() for r in results]
    for domain in required_domains:
        if not any(domain in name for name in skill_names):
            warnings.append(f"No skill covering '{domain}' — usually critical")

    # Check for tech consistency across skills
    all_contents = {}
    for result in results:
        path = skills_dir / result.skill_name / "SKILL.md"
        if path.exists():
            all_contents[result.skill_name] = path.read_text()

    # Basic contradiction detection: look for conflicting tech mentions
    tech_mentions = {}
    patterns_to_check = [
        (r"\b(Zod|Joi|Yup|Valibot|ArkType)\b", "validation library"),
        (r"\b(Jest|Vitest|Mocha|Ava|pytest|go test)\b", "test runner"),
        (r"\b(Tailwind|styled-components|CSS Modules|Sass|emotion)\b", "CSS approach"),
        (r"\b(REST|GraphQL|gRPC|tRPC)\b", "API style"),
        (r"\b(Zustand|Redux|Jotai|Recoil|Pinia|Vuex|MobX)\b", "state management"),
    ]
    for pattern, category in patterns_to_check:
        found = set()
        for skill_name, content in all_contents.items():
            matches = set(re.findall(pattern, content, re.IGNORECASE))
            found.update(matches)
        if len(found) > 1:
            warnings.append(
                f"Multiple {category} options mentioned across skills: {', '.join(found)} — pick ONE"
            )

    # Check for version consistency across skills
    version_patterns = [
        (r"\b(?:Next\.js|Next)\s+v?(\d+\.\d+(?:\.\d+)?)", "Next.js"),
        (r"\b(?:React)\s+v?(\d+\.\d+(?:\.\d+)?)", "React"),
        (r"\b(?:TypeScript|TS)\s+v?(\d+\.\d+(?:\.\d+)?)", "TypeScript"),
        (r"\b(?:Node\.js|Node)\s+v?(\d+\.\d+(?:\.\d+)?)", "Node.js"),
        (r"\bPython\s+(\d+\.\d+(?:\.\d+)?)", "Python"),
        (r"\bGo\s+(\d+\.\d+(?:\.\d+)?)", "Go"),
        (r"\bRust\s+(\d+\.\d+(?:\.\d+)?)", "Rust"),
        (r"\bJava\s+(\d+\.?\d*)", "Java"),
        (r"\b(?:PostgreSQL|Postgres)\s+(\d+\.?\d*)", "PostgreSQL"),
    ]

    for pattern, tech_name in version_patterns:
        versions_found = {}
        for skill_name, content in all_contents.items():
            matches = re.findall(pattern, content, re.IGNORECASE)
            if matches:
                versions_found[skill_name] = matches[0]

        if len(set(versions_found.values())) > 1:
            warnings.append(
                f"Version inconsistency for {tech_name}: "
                f"{', '.join(f'{skill}={ver}' for skill, ver in versions_found.items())}"
            )

    # Check for version verification documentation
    unverified_skills = []
    for skill_name, content in all_contents.items():
        has_versions = bool(re.search(r"\b\d+\.\d+\.?\d*\b", content))
        has_verification = bool(
            re.search(r"verified|verification|latest stable", content, re.IGNORECASE)
        )

        if has_versions and not has_verification:
            unverified_skills.append(skill_name)

    if unverified_skills:
        warnings.append(
            f"Skills missing version verification documentation: {', '.join(unverified_skills)}"
        )

    return errors, warnings


def print_report(v: BootstrapValidation):
    print("\n" + "═" * 65)
    print("  PROJECT BOOTSTRAPPER — VALIDATION REPORT")
    print("═" * 65)

    total_rules = 0
    total_code_blocks = 0
    total_lines = 0

    for r in v.results:
        status = "✅" if r.passed else "❌"
        stats_str = f"[{r.stats.get('total_lines', '?')} lines, {r.stats.get('rules_count', '?')} rules, {r.stats.get('code_blocks', '?')} code blocks]"
        print(f"\n{status} {r.skill_name}  {stats_str}")
        for e in r.errors:
            print(f"   🔴 {e}")
        for w in r.warnings:
            print(f"   🟡 {w}")
        for i in r.info:
            print(f"   🔵 {i}")
        total_rules += r.stats.get("rules_count", 0)
        total_code_blocks += r.stats.get("code_blocks", 0)
        total_lines += r.stats.get("total_lines", 0)

    if v.cross_errors or v.cross_warnings:
        print(f"\n{'─' * 65}")
        print("  CROSS-SKILL CHECKS")
        print(f"{'─' * 65}")
        for e in v.cross_errors:
            print(f"   🔴 {e}")
        for w in v.cross_warnings:
            print(f"   🟡 {w}")

    print(f"\n{'═' * 65}")
    print(f"  SUMMARY")
    print(f"{'═' * 65}")
    print(f"  Skills:          {len(v.results)}")
    print(f"  Total lines:     {total_lines}")
    print(f"  Total rules:     {total_rules}")
    print(f"  Code blocks:     {total_code_blocks}")
    print(f"  Errors:          {v.total_errors}")
    print(f"  Warnings:        {v.total_warnings}")
    print(f"  Status:          {'✅ PASSED' if v.passed else '❌ FAILED'}")
    print(f"{'═' * 65}\n")


def main():
    if len(sys.argv) < 2:
        print("Usage: python validate_bootstrap.py <skills-directory>")
        print("Example: python validate_bootstrap.py .claude/skills/")
        sys.exit(1)

    skills_dir = Path(sys.argv[1])
    if not skills_dir.exists():
        print(f"Error: {skills_dir} not found")
        sys.exit(1)

    v = BootstrapValidation(skills_dir=skills_dir)

    for item in sorted(skills_dir.iterdir()):
        if item.is_dir() and not item.name.startswith(("_", ".")):
            v.results.append(validate_skill(item))

    v.cross_errors, v.cross_warnings = validate_cross_skill(skills_dir, v.results)
    print_report(v)
    sys.exit(0 if v.passed else 1)


if __name__ == "__main__":
    main()
