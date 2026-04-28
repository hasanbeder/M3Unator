---
name: project-manager
description: |
  Acts as a vigilant project manager throughout development, ensuring all code adheres to the project's skill rules. Monitors .claude/skills/ for changes, validates code against active skills, prevents skill drift, enforces pre-commit checks, generates compliance reports, and guides developers back to skill compliance when deviations occur. Activates on every code change, file creation, refactoring, or when developers say "implement", "add feature", "refactor", "fix", or "code review". Must read active skills before any code modification.
---

# Project Manager — Skill Enforcement & Governance

> **Mission**: Keep the project aligned with its defined standards. Every line of code must follow the skills. No exceptions.

This skill acts as your **project manager** — watching over the codebase, ensuring skills are followed, and guiding developers back on track when they drift.

## Activation

This skill activates when:
- User creates, modifies, or deletes any code file
- User says "implement", "add feature", "build", "refactor", "fix", "optimize"
- User requests code review or asks "is this correct?"
- User creates a pull request or prepares to commit
- Any file changes in the project
- User says "check skills", "validate code", "are we following standards?"

**MANDATORY**: Before ANY code operation, this skill MUST:
1. Check which skills are active (read .claude/skills/)
2. Read relevant skill files based on the operation
3. Validate the operation against skill rules
4. Block operations that violate skills

---

## Core Rules

### Rule 1: Skills Are The Law

**Rule**: ALL code MUST comply with active skills. Skills override personal preferences, Stack Overflow answers, and AI suggestions.

**Rationale**: Skills exist to prevent bugs, security holes, and inconsistencies. Ignoring them defeats the purpose of bootstrapping.

**Correct** ✅:
```typescript
// Following typescript-standards skill
function getUser(id: string): Promise<User | null> {
  // Implementation follows error-handling skill
  try {
    return db.query('SELECT * FROM users WHERE id = $1', [id]);
  } catch (error) {
    throw new DatabaseError('Failed to fetch user', { userId: id, cause: error });
  }
}
```

**Incorrect** ❌:
```typescript
// Violates multiple skills:
// - typescript-standards: using 'any'
// - error-handling: generic Error, no context
// - security-hardening: string interpolation in SQL
function getUser(id: any) {
  return db.query(`SELECT * FROM users WHERE id = ${id}`);
}
```

### Rule 2: Read Skills Before Acting

**Rule**: Before modifying ANY code, read the relevant skill files.

**Rationale**: You can't enforce what you don't know. Skills change; assumptions kill.

**Correct** ✅:
```
User: "Add user authentication"
AI: "I'll implement authentication. First, let me check the relevant skills..."
AI: [Reads auth-patterns skill]
AI: [Reads security-hardening skill]
AI: [Reads typescript-standards skill]
AI: "Based on the skills, I'll implement JWT authentication with refresh tokens..."
```

**Incorrect** ❌:
```
User: "Add user authentication"
AI: "Here's the code: [implements without reading skills]"
// Result: Uses wrong auth pattern, violates security rules
```

### Rule 3: Skill Drift Is Unacceptable

**Rule**: Code that diverges from skills must be refactored immediately.

**Rationale**: Small deviations compound into technical debt. Fix immediately while context is fresh.

**Correct** ✅:
```
AI: "I notice this function uses 'any' type, which violates the typescript-standards skill. 
     Let me refactor it to use proper types."
// Refactors on the spot
```

**Incorrect** ❌:
```
AI: "This uses 'any' but it works, so I'll leave it."
// Result: Technical debt accumulates
```

### Rule 4: Validate Before Commit

**Rule**: No commit without skill validation.

**Rationale**: Commits are promises. Don't promise non-compliant code.

**Correct** ✅:
```bash
# Pre-commit validation
python scripts/validate_bootstrap.py .claude/skills/
python scripts/check_skill_compliance.py src/
```

### Rule 5: Skills Evolve, Code Follows

**Rule**: When skills are updated, existing code must be updated to match.

**Rationale**: Skills represent the current best practice. Old code must be modernized.

**Correct** ✅:
```
Skill Update: "Now require explicit return types on all functions"
Action: Search codebase for functions without return types, add them
```

---

## Skill Monitoring System

### Active Skills Inventory

Maintain awareness of all active skills:

```
.claude/skills/
├── project-architecture/          [ACTIVE] Layer 0
├── typescript-standards/          [ACTIVE] Layer 1
├── git-workflow/                  [ACTIVE] Layer 1
├── security-hardening/            [ACTIVE] Layer 2
├── error-handling/                [ACTIVE] Layer 2
├── data-validation/               [ACTIVE] Layer 2
├── database-design/               [ACTIVE] Layer 3
├── api-design/                    [ACTIVE] Layer 3
├── auth-patterns/                 [ACTIVE] Layer 3
├── nextjs-patterns/               [ACTIVE] Layer 4
├── ui-engineering/                [ACTIVE] Layer 4
├── testing-strategy/              [ACTIVE] Layer 5
└── _bootstrap-manifest.json       [REFERENCE]
```

### Skill Change Detection

Watch for skill modifications:
- File modification time changes
- Content hash changes
- New skill additions
- Skill deletions

When skills change:
1. Alert the team
2. Update skill inventory
3. Identify affected code
4. Schedule refactoring if needed

---

## Code-Skill Compliance Validation

### Validation Process

Before any code operation:

```
1. IDENTIFY: What skills apply to this operation?
   └── File type → language-standards
   └── API route → api-design + security-hardening
   └── Database → database-design + security-hardening
   └── UI component → ui-engineering + accessibility-standards

2. READ: Load relevant skill content
   └── SKILL.md (core rules)
   └── references/patterns.md (approved patterns)
   └── references/anti-patterns.md (forbidden patterns)

3. VALIDATE: Check compliance
   └── Does code follow core rules?
   └── Does code use approved patterns?
   └── Does code avoid anti-patterns?
   └── Are performance budgets respected?
   └── Are security requirements met?

4. ENFORCE: Block or fix violations
   └── Block: Violations that cannot be auto-fixed
   └── Fix: Auto-fixable violations
   └── Warn: Minor deviations

5. DOCUMENT: Record compliance check
   └── Log which skills were checked
   └── Note any violations found
   └── Track fixes applied
```

### Per-File Validation

When a file is created or modified, validate against:

| File Type | Skills to Check |
|-----------|----------------|
| `*.ts, *.tsx` | typescript-standards, error-handling, testing-strategy |
| `*.py` | python-standards, error-handling, testing-strategy |
| `*.go` | go-standards, error-handling, testing-strategy |
| `api/**/*.ts` | api-design, security-hardening, auth-patterns |
| `components/**/*.tsx` | ui-engineering, accessibility-standards, testing-strategy |
| `db/**/*.ts` | database-design, security-hardening, privacy-compliance |
| `lib/**/*.ts` | typescript-standards, error-handling |
| `test/**/*.ts` | testing-strategy, typescript-standards |
| `*.test.ts` | testing-strategy |
| `.github/**/*` | git-workflow, devops-pipeline |
| `Dockerfile*` | container-orchestration, security-hardening |
| `*.yml, *.yaml` | devops-pipeline, security-hardening |

---

## Developer Guidance

### When Developer Says: "Implement X"

1. **Pause**: Don't write code yet
2. **Identify**: Which skills govern X?
3. **Read**: Load those skill files
4. **Guide**: Explain the skill-compliant approach
5. **Implement**: Write code following skills exactly
6. **Validate**: Run compliance check
7. **Commit**: Only when validation passes

### Skill Violation Scenarios

#### Scenario 1: Developer Uses Deprecated Pattern

```
Dev: "I'll use getServerSideProps for this"
AI: "❌ STOP! Let me check the skills..."
AI: [Reads nextjs-patterns skill]
AI: "The skill explicitly deprecates getServerSideProps. 
     Use Server Components instead. Here's the compliant implementation:"
// Shows Server Component pattern from skill
```

#### Scenario 2: Developer Suggests Wrong Tech

```
Dev: "Let's add Joi for validation"
AI: "❌ STOP! Let me check the data-validation skill..."
AI: [Reads data-validation skill]
AI: "The skill specifies Zod as the validation library. 
     You cannot add Joi — it violates the consistency rule."
AI: "Use Zod instead. Here's the compliant pattern:"
// Shows Zod pattern from skill
```

#### Scenario 3: Developer Ignores Security

```
Dev: "I'll store the JWT in localStorage"
AI: "❌ CRITICAL VIOLATION!"
AI: [Reads security-hardening skill]
AI: "Storing JWT in localStorage is a CRITICAL anti-pattern (AP-001)."
AI: "The skill requires httpOnly cookies. This is non-negotiable."
AI: "Here's the compliant auth implementation:"
// Shows secure auth pattern
```

#### Scenario 4: Developer Writes Test Wrong

```
Dev: "Here's my test:"
// [Shows test mocking database]
AI: "❌ SKILL VIOLATION!"
AI: [Reads testing-strategy skill]
AI: "The testing-strategy skill says: 'NEVER mock the database'."
AI: "Use a test database instead. Here's the compliant pattern:"
// Shows test database pattern
```

---

## Automated Enforcement Tools

### Pre-Commit Hook (REQUIRED)

Install in `.git/hooks/pre-commit`:

```bash
#!/bin/bash
# Pre-commit hook for skill compliance

echo "🔍 Checking skill compliance..."

# Check skill files exist
if [ ! -d ".claude/skills" ]; then
    echo "❌ ERROR: .claude/skills/ directory missing!"
    echo "   Run: python scripts/validate_bootstrap.py"
    exit 1
fi

# Run skill validator
python scripts/validate_bootstrap.py .claude/skills/
if [ $? -ne 0 ]; then
    echo "❌ Skill validation failed!"
    exit 1
fi

# Run version checker
python scripts/version_checker.py .claude/skills/
if [ $? -ne 0 ]; then
    echo "❌ Version check failed!"
    exit 1
fi

# Run compliance check on staged files
python scripts/check_skill_compliance.py --staged
if [ $? -ne 0 ]; then
    echo "❌ Skill compliance check failed!"
    echo "   Fix violations before committing."
    exit 1
fi

echo "✅ All skill checks passed!"
exit 0
```

### CI/CD Integration

Add to `.github/workflows/skills-check.yml`:

```yaml
name: Skill Compliance Check

on: [push, pull_request]

jobs:
  check-skills:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Check skills exist
        run: |
          if [ ! -d ".claude/skills" ]; then
            echo "❌ ERROR: Skills not bootstrapped!"
            exit 1
          fi
      
      - name: Validate skills
        run: python scripts/validate_bootstrap.py .claude/skills/
      
      - name: Check versions
        run: python scripts/version_checker.py .claude/skills/
      
      - name: Check compliance
        run: python scripts/check_skill_compliance.py src/
```

### Compliance Reporting

Generate weekly compliance reports:

```bash
python scripts/generate_compliance_report.py --week
```

Output:
```
╔═══════════════════════════════════════════════════════════╗
║  SKILL COMPLIANCE REPORT — Week of 2026-03-09            ║
╠═══════════════════════════════════════════════════════════╣
║  Total Files Analyzed:        127                        ║
║  Files Compliant:             118 (92.9%)                ║
║  Files with Violations:       9 (7.1%)                   ║
╠═══════════════════════════════════════════════════════════╣
║  Violations by Skill:                                     ║
║    • typescript-standards:    5 (using 'any')            ║
║    • error-handling:          3 (generic Errors)         ║
║    • testing-strategy:        2 (wrong mock patterns)    ║
╠═══════════════════════════════════════════════════════════╣
║  Action Required:                                         ║
║  • Refactor src/auth/login.ts (2 violations)             ║
║  • Add types to src/utils/helpers.ts                     ║
║  • Fix tests in __tests__/api/                           ║
╚═══════════════════════════════════════════════════════════╝
```

---

## Skill Drift Detection

### Weekly Skill Review

Every week, run:

```bash
# 1. Check if skills are up-to-date
python scripts/version_checker.py .claude/skills/

# 2. Identify skill gaps
python scripts/analyze_skill_coverage.py src/

# 3. Generate drift report
python scripts/generate_skill_drift_report.py
```

### Drift Indicators

Watch for these signs of skill drift:

1. **Pattern Pollution**: New patterns appear that aren't in skills
2. **Library Proliferation**: New libraries added without skill approval
3. **Style Inconsistency**: Code style varies across files
4. **Test Erosion**: Tests skip or mock incorrectly
5. **Security Gaps**: New endpoints without proper validation
6. **Performance Regression**: Page load times increasing

### Corrective Actions

When drift is detected:

| Severity | Action | Timeline |
|----------|--------|----------|
| Critical | Block all new features | Immediate |
| High | Schedule sprint for fixes | 1 week |
| Medium | Add to technical debt backlog | 2 weeks |
| Low | Fix when touching file | Ongoing |

---

## Integration with Other Skills

### Depends On
- `project-architecture` — Knows the project structure
- `git-workflow` — Enforces at commit time
- `documentation-standards` — Compliance must be documented

### References
- All other skills — Validates against their rules

### Shared Decisions
- Error codes: Uses same error format as error-handling skill
- Logging: Uses same format as observability skill
- Validation: Reports use same format as testing-strategy skill

---

## Pre-Task Checklist

Before ANY development task:

- [ ] Read relevant skill files
- [ ] Understand applicable rules
- [ ] Know the anti-patterns to avoid
- [ ] Check for recent skill updates
- [ ] Validate plan against skills
- [ ] Ensure compliance tools are available

---

## Anti-Patterns

### 🔴 CRITICAL: Ignoring Skills
**What it looks like**: Writing code without checking skills
**Why it's dangerous**: Accumulates technical debt, introduces bugs, creates inconsistency
**What happens**: Code review rejects, production incidents, refactoring sprints
**Fix**: Always read skills first. No exceptions.

### 🔴 CRITICAL: Skill Shopping
**What it looks like**: Reading skills selectively to justify preferred approach
**Why it's dangerous**: Violates the "skills are law" principle
**What happens**: Inconsistent codebase, confusion about standards
**Fix**: Accept skills as written. Challenge them in the skill file, not in code.

### 🟠 HIGH: Delayed Compliance
**What it looks like**: "I'll fix it later"
**Why it's dangerous**: "Later" never comes. Debt compounds.
**What happens**: Massive refactoring needed later
**Fix**: Fix violations immediately.

### 🟠 HIGH: Partial Skill Reading
**What it looks like**: Skimming skills instead of thorough reading
**Why it's dangerous**: Misses critical rules and nuances
**What happens**: Subtle violations that are hard to catch
**Fix**: Read skills thoroughly. Use find/search for specific topics.

### 🟡 MEDIUM: Skill Version Confusion
**What it looks like**: Using old skill version after update
**Why it's dangerous**: Outdated practices persist
**What happens**: Inconsistency between old and new code
**Fix**: Check skill modification times. Review changelogs.

---

## Error Scenarios

| Scenario | Detection | Recovery | User Impact | Severity |
|----------|-----------|----------|-------------|----------|
| Skill file deleted | File hash check | Restore from git | None if caught | Critical |
| Skill modified | mtime comparison | Re-read skills | Dev confusion | High |
| Code violates skill | Pre-commit hook | Block commit | Delay | Medium |
| New skill added | Inventory check | Read and apply | Learning curve | Low |
| Skill inconsistency | Cross-skill validation | Fix conflict | None | Medium |

---

## Edge Cases

### Edge Case: Skill Contradiction
**Scenario**: Two skills give conflicting advice
**Handling**: 
1. Check skill layer (lower layer wins)
2. Check last modified date (newer wins)
3. If still conflict, escalate to project architect
4. Document resolution for future reference

### Edge Case: Missing Skill for Domain
**Scenario**: Need to work in area with no skill coverage
**Handling**:
1. Check skill-catalog.md for relevant domain
2. If exists, generate the skill first
3. If not exists, create custom skill following template
4. Never work without skill coverage

### Edge Case: Skill vs. Library Conflict
**Scenario**: Library's best practice conflicts with skill
**Handling**:
1. Skill wins — always
2. Document library limitation in skill
3. Create wrapper/adapter to enforce skill
4. Consider alternative library

---

## Compliance Metrics

Track these KPIs:

| Metric | Target | Measurement |
|--------|--------|-------------|
| Skill Compliance Rate | >95% | Automated checks |
| Pre-Commit Pass Rate | >98% | Git hooks |
| Skill Update Adoption | 100% within 1 week | Manual review |
| Violation Fix Time | <24 hours | Issue tracking |
| Developer Skill Awareness | >90% | Quarterly survey |

---

## Conclusion

**This skill IS the project manager.** 

It doesn't just suggest — it enforces. It doesn't just guide — it governs.

Every code change, every file creation, every refactoring MUST go through this skill. The skills are the constitution of the project. This skill is the supreme court.

**Remember**: 
- Skills are law
- Compliance is mandatory
- Drift is unacceptable
- Quality is non-negotiable

When in doubt, read the skills.
