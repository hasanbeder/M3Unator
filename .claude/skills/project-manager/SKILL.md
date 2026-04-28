---
name: project-manager
description: |
  Acts as the enforcement layer for the generated M3Unator skill suite. Trigger it for every code change, docs update with workflow impact, commit preparation, review request, release prep, or validation run. It must load the active skills in .claude/skills/, decide which ones apply, and require the local Node validators before high-risk changes are considered complete. Without this skill, the suite becomes static documentation instead of an active guardrail.
---

# Project Manager

> Skills are only useful if every change is forced back through them before it becomes part of the repo.

## Activation

This skill activates when:
- Editing code, docs, metadata, or tooling in this repo.
- Preparing a commit, PR, or release.
- The user asks for review, validation, compliance, or “are we following the skills?”

## Project Context

| Key | Value |
|-----|-------|
| Project | M3Unator |
| Active Skills Root | `.claude/skills/` |
| Enforcement Tooling | `scripts/validate_bootstrap.js`, `scripts/version_checker.js`, `scripts/check_skill_compliance.js` |
| Key Decisions | Read relevant skills first, use Node validators locally, block risky drift before commit or release |

---

## Core Rules

### Rule 1: Read relevant skills before touching code

**Rule**: Any implementation or review task must identify and consult the matching active skills before edits are finalized.

**Rationale**: The suite is the project constitution; coding first and checking later defeats the point.

### Rule 2: Run structural validation after skill edits

**Rule**: Any change inside `.claude/skills/` must run the bootstrap validator and version checker before handoff.

**Rationale**: Skills themselves are part of the product workflow and can drift or contradict each other.

### Rule 3: Run code compliance on runtime changes

**Rule**: Changes to `M3Unator.user.js`, `M3Unator.meta.js`, or new JavaScript files must run the compliance checker on the touched file or repo scope.

**Rationale**: Runtime policy needs an executable guardrail, not just prose.

### Rule 4: Block releases on unsynced evidence

**Rule**: A release is not complete unless metadata, changelog, validators, and smoke notes all agree.

**Rationale**: Public userscript releases fail most often from drift between these surfaces, not from pure syntax errors.

### Rule 5: Surface drift explicitly

**Rule**: If a change cannot satisfy an active skill, record the gap plainly instead of silently working around it.

**Rationale**: Honest drift is manageable; hidden drift compounds.

---

## Approved Patterns

### Pattern: Skill-aware runtime change

**Use when**: Editing the scan engine or UI.

**Implementation**:
```bash
node scripts/check_skill_compliance.js --file M3Unator.user.js
node scripts/validate_bootstrap.js .claude/skills/
node scripts/version_checker.js .claude/skills/
```

### Pattern: Skill-aware review

**Use when**: Reviewing a feature or release prep.

**Implementation**:
```markdown
Relevant skills:
- userscript-patterns
- directory-scanning-engine
- testing-strategy

Validation:
- compliance checker on touched runtime file
- bootstrap validator on skill suite
```

---

## Anti-Patterns

### 🔴 Coding without consulting the suite
**Severity**: CRITICAL — blocks completion
**The temptation**: jump straight into a fix because the repo is small.
**The danger**: behavior drifts away from the chosen rules immediately.
**The fix**: identify and read relevant skills first.

### 🟠 Silent validation skip
**Severity**: HIGH — must fix before merge
**The temptation**: assume validators are unnecessary for small changes.
**The danger**: structure, versioning, or compliance regressions accumulate invisibly.
**The fix**: run the validators and record the result.

---

## Performance Budgets

| Metric | Target | Hard Limit | How to Measure |
|--------|--------|------------|----------------|
| Skill edits without validator run | 0 | 0 | command history / task notes |
| Runtime changes without compliance check | 0 | 0 | command history / task notes |

## Security Checklist

- [ ] Relevant skills were read before implementation or review.
- [ ] Skill edits were validated structurally.
- [ ] Runtime edits were checked for compliance.
- [ ] Release tasks include synced metadata and smoke evidence.
- [ ] Any unresolved drift is stated explicitly.

## Error Scenarios

| Scenario | Detection | Recovery | User Impact | Severity |
|----------|-----------|----------|-------------|----------|
| Skill edited without validation | missing validator output | rerun validators and fix findings | weak governance | High |
| Runtime change bypasses compliance | no checker evidence | run checker and address findings | policy drift | High |
| Release prepared without synced evidence | version/doc mismatch | stop and sync release surfaces | broken release | Critical |

## Edge Cases

### Edge Case: Docs-only wording fix
**Scenario**: A PR changes only prose with no workflow impact.
**Handling**: Skip compliance on runtime files, but still note which skills were relevant and why runtime checks were unnecessary.
**Code**:
```markdown
Relevant skill: documentation-standards
Runtime compliance: not required, no code files changed
```

## Integration Points

| Relationship | Skill | Detail |
|-------------|-------|--------|
| Depends on | `project-architecture` | Needs the project map to identify affected areas |
| Referenced by | `git-workflow` | Commit and release readiness depend on this enforcement |
| Shares decision | `testing-strategy` | Validator and smoke evidence are part of completion |

## Pre-Commit Checklist

- [ ] Relevant skills were identified and applied.
- [ ] `node scripts/validate_bootstrap.js .claude/skills/` passed after skill edits.
- [ ] `node scripts/version_checker.js .claude/skills/` passed after skill edits.
- [ ] `node scripts/check_skill_compliance.js --file M3Unator.user.js` ran for runtime edits.
- [ ] Any residual drift or skipped checks is explained.
