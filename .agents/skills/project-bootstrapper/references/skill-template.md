# Skill Template

Every generated skill MUST follow this structure. Replace `{placeholders}` with project-specific values. Adapt code examples to the project's actual language and framework.

---

## Required: SKILL.md

```markdown
---
name: {skill-name}
description: |
  {3-5 sentences. What the skill does + all activation contexts. Be aggressive about
  triggering — include file types, directory patterns, user phrases, and related concepts.
  Claude under-triggers skills, so cast a wide net. Include the WHY: what goes wrong without
  this skill. Max 1024 characters.}
---

# {Skill Title}

> {One-line philosophy — the fundamental WHY behind every rule in this skill.}

## Activation

This skill activates when:
- {Specific trigger 1: file types, directories, commands}
- {Specific trigger 2: user phrases, topics, requests}
- {Specific trigger 3: related concepts or adjacent domains}

## Project Context

| Key | Value |
|-----|-------|
| Project | {project-name} |
| Language | {language + version} |
| Framework | {framework + version} |
| Relevant Stack | {only the tech this skill touches} |
| Key Decisions | {architectural decisions affecting this skill} |

---

## Core Rules

Every rule is numbered, has a rationale, and shows both correct and incorrect usage.

### Rule 1: {Clear Rule Name}

**Rule**: {Unambiguous statement. Use "must", "never", "always" for hard rules.}

**Rationale**: {WHY this rule exists. What specific bug, vulnerability, performance issue,
or maintenance nightmare it prevents. Be concrete — "prevents SQL injection via parameter
binding" not "improves security".}

**Correct** ✅:
```{language}
// Good: explain what makes this correct
{compilable, copy-pasteable code}
```

**Incorrect** ❌:
```{language}
// Bad: explain what goes wrong
{code showing the anti-pattern}
// → Consequence: {what specifically breaks — "allows SQL injection", "leaks PII to logs", "O(n²) on every request"}
```

### Rule 2: {Clear Rule Name}
{...same structure}

### Rule N: ...
{Target: 15-40 rules per skill. More for security, fewer for git-workflow.}

---

## Approved Patterns

Larger patterns that combine multiple rules. Full reference in `references/patterns.md`.

### Pattern: {Name}

**Use when**: {specific scenario or decision point}

**Implementation**:
```{language}
{Full, production-ready code. 15-60 lines typical.
Include error handling, edge cases, types.
This code should work if copy-pasted into the project.}
```

**Variations**:
- {Variation A}: {when and how to adapt}
- {Variation B}: {when and how to adapt}

{3-8 patterns in SKILL.md, full catalog in references/patterns.md}

---

## Anti-Patterns

Patterns that are BANNED in this project. Full reference in `references/anti-patterns.md`.

### 🔴 {CRITICAL Anti-Pattern Name}
**Severity**: CRITICAL — blocks merge, security/data-loss risk
**The temptation**: {Why someone might write this}
**The danger**: {Concrete consequence, not vague "bad practice"}
**The fix**: {What to do instead, with code}

### 🟠 {HIGH Anti-Pattern Name}
**Severity**: HIGH — must fix before merge, reliability/performance risk
{...same structure}

### 🟡 {MEDIUM Anti-Pattern Name}
**Severity**: MEDIUM — fix in same sprint, maintainability risk
{...same structure}

{3-6 in SKILL.md, full catalog in references/anti-patterns.md}

---

## Performance Budgets

| Metric | Target | Hard Limit | How to Measure |
|--------|--------|------------|----------------|
| {metric name} | {ideal value} | {never exceed} | {command, tool, or code to check} |

{Only include metrics relevant to this skill's domain.}

---

## Security Checklist

Before any commit touching this domain:

- [ ] {Specific, actionable check — not "validate input" but "all request bodies validated against Zod schema before processing"}
- [ ] {Another check}
- [ ] {Another check}

{5-15 items, domain-specific.}

---

## Error Scenarios

| Scenario | Detection | Recovery | User Impact | Severity |
|----------|-----------|----------|-------------|----------|
| {What fails} | {How to detect} | {How to recover} | {What user sees} | {Critical/High/Medium/Low} |

---

## Edge Cases

### Edge Case: {Name}
**Scenario**: {Describe the unusual situation}
**Handling**: {Exact approach}
**Code**:
```{language}
{implementation}
```

{Document 3-10 edge cases per skill}

---

## Integration Points

| Relationship | Skill | Detail |
|-------------|-------|--------|
| Depends on | `{skill-name}` | {what this skill needs from it} |
| Referenced by | `{skill-name}` | {what references this skill} |
| Shares decision | `{skill-name}` | {shared cross-cutting decision} |

---

## Pre-Commit Checklist

Quick verification before committing code in this domain. Full checklist in `references/checklist.md`.

- [ ] All core rules followed
- [ ] No anti-patterns present (run: `{lint/check command}`)
- [ ] Performance budgets met (run: `{benchmark command}`)
- [ ] Security checklist passed
- [ ] Tests written and passing (run: `{test command}`)
- [ ] Documentation updated
```

---

## Required: references/patterns.md

```markdown
# Approved Patterns — {Skill Name}

Complete pattern catalog. Each pattern is production-proven for {project-tech-stack}.

## {Category Name}

### Pattern: {Name}

**Context**: {When to use}
**Problem**: {What it solves}

```{language}
// Full implementation with inline comments explaining decisions
// 20-80 lines typical
// Must compile/run without modification
{code}
```

**Testing this pattern**:
```{language}
{test code showing how to verify this pattern works}
```

**Gotchas**:
- {Common mistake #1}
- {Edge case to handle}

**Related rules**: Rule {N}, Rule {M}
```

Target: 10-25 patterns per skill, organized by category.

---

## Required: references/anti-patterns.md

```markdown
# Anti-Patterns — {Skill Name}

Banned patterns. Each explains severity, what it looks like, why it's dangerous,
and what to do instead.

## Severity Guide

- 🔴 **CRITICAL**: Security vulnerability, data loss, or privacy violation — PR blocked
- 🟠 **HIGH**: Performance degradation, reliability issue, or data integrity risk — fix before merge
- 🟡 **MEDIUM**: Maintainability, readability, or consistency issue — fix in same sprint
- 🟢 **LOW**: Style/convention deviation — fix when touching the file

---

### 🔴 AP-001: {Name}

**What it looks like**:
```{language}
{realistic bad code — the kind someone would actually write}
```

**Why it's dangerous**: {Concrete consequence. Not "it's bad practice" but "this allows
an attacker to X" or "this causes Y under Z conditions".}

**What happens in production**: {Brief real-world scenario. "A user submits a name
containing `<script>`, which renders unescaped in the admin dashboard, executing
arbitrary JS in every admin's browser."}

**Fix**:
```{language}
{corrected code}
```

**Detection**: {How to catch this: lint rule, test, code review pattern}
```

Target: 15-30 anti-patterns per skill.

---

## Required: references/checklist.md

```markdown
# Pre-Commit Checklist — {Skill Name}

Run through EVERY item before committing code that touches {domain}.

## Automated (must pass in CI)

- [ ] `{exact lint command}` — zero errors, zero warnings
- [ ] `{exact type check command}` — passes
- [ ] `{exact test command}` — passes, coverage ≥ {X}%
- [ ] `{exact security scan command}` — no new vulnerabilities
- [ ] `{exact build command}` — succeeds

## Manual Review

### Security
- [ ] {Specific check with concrete criteria}
- [ ] {Another check}

### Performance
- [ ] {Specific check with concrete criteria}
- [ ] {Another check}

### Privacy
- [ ] No PII in logs, errors, or URLs
- [ ] Data minimization: only collecting/storing what's needed
- [ ] {Additional domain-specific privacy check}

### Quality
- [ ] {Specific check}
- [ ] {Another check}

### Documentation
- [ ] Public APIs have complete doc comments
- [ ] Changed behavior documented in relevant docs
- [ ] Breaking changes noted in changelog
```
