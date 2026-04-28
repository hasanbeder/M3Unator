---
name: testing-strategy
description: |
  Defines the test mix for M3Unator, including manual browser QA, skill validation scripts, targeted regression checks for parsing and scan flow, and release smoke expectations. Trigger it for any feature, bug fix, refactor, release prep, or discussion about coverage and regression risk. Without this skill, the project ships scan regressions that only appear on specific directory listing variants or browsers.
---

# Testing Strategy

> Because the runtime is a userscript on third-party pages, every release needs both structural validation and realistic browser checks.

## Activation

This skill activates when:
- Changing scan logic, UI behavior, metadata, or release flow.
- Updating `tests/manual_testing_guide.md`.
- The user asks about testing, smoke checks, coverage, or regression prevention.

## Project Context

| Key | Value |
|-----|-------|
| Project | M3Unator |
| Test Surfaces | Userscript header, directory parsing, recursion flow, UI interactions, export behavior |
| Relevant Stack | Manual browser checks, Node validator scripts, markdown QA guide |
| Key Decisions | Manual runtime QA remains primary, local script validators run on every contributor change |

---

## Core Rules

### Rule 1: Run structural validators before runtime QA

**Rule**: Every non-trivial change must run `validate_bootstrap`, `version_checker`, and targeted compliance checks before manual browser testing begins.

**Rationale**: Structural errors and obvious policy violations are cheaper to catch locally than during browser debugging.

### Rule 2: Test the actual host-page variants

**Rule**: Runtime changes must be checked against at least Apache/Nginx-style listings and LiteSpeed-style listings when the parser or scan logic changes.

**Rationale**: The core feature depends on host markup differences, not just internal logic.

### Rule 3: Verify control-state transitions manually

**Rule**: Any change to pause, resume, cancel, close, overlay, or activity indicators must include a manual UI state-transition check.

**Rationale**: These behaviors are interaction-heavy and easy to regress silently.

### Rule 4: Treat release smoke as a browser matrix

**Rule**: Releases must be smoke-tested in the latest stable Chrome and Firefox, and ideally on the active userscript managers documented for the project.

**Rationale**: Userscript execution differs by browser and manager, so one-browser confidence is insufficient.

### Rule 5: Update the manual guide with every new regression class

**Rule**: When a bug is fixed, `tests/manual_testing_guide.md` must gain the scenario that would have caught it earlier.

**Rationale**: Manual QA only improves if it learns from escaped regressions.

---

## Approved Patterns

### Pattern: Local validator triplet

**Use when**: Preparing a feature branch or release candidate.

**Implementation**:
```bash
node scripts/validate_bootstrap.js .claude/skills/
node scripts/version_checker.js .claude/skills/
node scripts/check_skill_compliance.js --file M3Unator.user.js
```

### Pattern: Parser smoke matrix

**Use when**: Changing scan, parsing, or href filtering behavior.

**Implementation**:
```markdown
- Apache/Nginx listing: recursive scan and playlist export
- LiteSpeed listing: recursive scan and duplicate filtering
- Browser check: latest Chrome and latest Firefox
```

---

## Anti-Patterns

### 🔴 Runtime change with docs-only validation
**Severity**: CRITICAL — blocks merge
**The temptation**: assume a simple scan change is too small to test.
**The danger**: directory listing variants break in production immediately.
**The fix**: run validators and manual host-page checks.

### 🟠 Untracked escaped bug
**Severity**: HIGH — must fix before merge
**The temptation**: fix a bug without adding it to the manual guide.
**The danger**: the same class of regression returns later.
**The fix**: add the exact scenario to `tests/manual_testing_guide.md`.

---

## Performance Budgets

| Metric | Target | Hard Limit | How to Measure |
|--------|--------|------------|----------------|
| Structural validator omissions per PR | 0 | 1 | PR checklist |
| New runtime bug classes missing from manual guide | 0 | 1 | compare fix to tests guide |

## Security Checklist

- [ ] Validation scripts run locally before release prep.
- [ ] Manual tests do not require posting unredacted private directory URLs publicly.
- [ ] Browser matrix includes supported userscript-manager paths where relevant.
- [ ] Scan cancellations and retries are tested, not assumed.
- [ ] Release notes reflect the actual tested scope.

## Error Scenarios

| Scenario | Detection | Recovery | User Impact | Severity |
|----------|-----------|----------|-------------|----------|
| Parser fix works only on one server type | manual matrix run | add missing server variant check | broken scans on some hosts | High |
| UI control regression escapes | smoke test omitted | add pause/resume/cancel scenario | control confusion | High |
| Validation scripts skipped | release checklist gap | rerun scripts before merge | policy drift | Medium |

## Edge Cases

### Edge Case: Fix changes only contributor tooling
**Scenario**: A PR modifies only validator scripts or docs.
**Handling**: Run the changed script locally and document the outcome; browser smoke is optional if runtime files are untouched.
**Code**:
```bash
node scripts/validate_bootstrap.js .claude/skills/
```

## Integration Points

| Relationship | Skill | Detail |
|-------------|-------|--------|
| Depends on | `documentation-standards` | Manual QA guidance must stay current |
| Referenced by | `release-distribution` | Release smoke steps come from this skill |
| Shares decision | `directory-scanning-engine` | Parser and recursion changes define the test matrix |

## Pre-Commit Checklist

- [ ] Structural validator triplet ran successfully.
- [ ] Parser or scan changes were checked on relevant directory listing variants.
- [ ] UI state transitions were verified if controls changed.
- [ ] Latest stable Chrome and Firefox smoke were considered for release-facing changes.
- [ ] New regression classes were added to the manual guide.
