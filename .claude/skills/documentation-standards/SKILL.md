---
name: documentation-standards
description: |
  Defines how contributor and user documentation is maintained across README.md, DEVELOPMENT.md, CHANGELOG.md, SECURITY.md, wiki/, and tests/manual_testing_guide.md. Trigger this skill for any docs edit, feature addition, workflow change, release note, or request for explanation. Without it, M3Unator gains undocumented scan behavior, stale setup steps, and release notes that no longer match the shipped userscript.
---

# Documentation Standards

> In a lightweight userscript repo, markdown files are the operational control plane.

## Activation

This skill activates when:
- Editing `README.md`, `DEVELOPMENT.md`, `CHANGELOG.md`, `SECURITY.md`, `wiki/`, or `tests/manual_testing_guide.md`.
- Adding or changing user-facing behavior.
- Preparing releases, contributor instructions, or troubleshooting notes.

## Project Context

| Key | Value |
|-----|-------|
| Project | M3Unator |
| Primary Docs | `README.md`, `DEVELOPMENT.md`, `CHANGELOG.md`, `SECURITY.md` |
| Supplemental Docs | `wiki/home.md`, `tests/manual_testing_guide.md` |
| Key Decisions | Root docs are authoritative, manual testing guidance is explicit, changelog is release-facing |

---

## Core Rules

### Rule 1: Update user docs for user-visible behavior

**Rule**: Any change affecting installation, UI controls, scan behavior, supported formats, or release flow must update `README.md`.

**Rationale**: Most users and contributors start at the README. Missing updates create immediate support churn.

### Rule 2: Update developer docs for structural or workflow changes

**Rule**: Changes to repo layout, release steps, validation tooling, or contributor process must update `DEVELOPMENT.md`.

**Rationale**: Contributor instructions become false quickly in a small repo if structural changes are not documented at the source.

### Rule 3: Keep the changelog user-oriented

**Rule**: `CHANGELOG.md` entries must explain user-visible outcomes and notable technical risk, not raw implementation trivia.

**Rationale**: Release notes should help users decide whether to update, not force them to reverse-engineer commit history.

### Rule 4: Testing docs must stay executable

**Rule**: `tests/manual_testing_guide.md` must describe concrete steps, expected observations, and browsers or server variants to check.

**Rationale**: Manual QA is part of the product safety net. Vague checklists are not reproducible.

### Rule 5: Security claims must be narrow and factual

**Rule**: `SECURITY.md`, README, and wiki content must never promise protections that are not actually enforced in code.

**Rationale**: Overstated security language is worse than missing language because it misleads users about risk.

---

## Approved Patterns

### Pattern: Feature doc sync

**Use when**: A new control or scan option is introduced.

**Implementation**:
```markdown
## Usage

1. Open the M3Unator panel
2. Enable "Scan Subdirectories"
3. Set a custom depth if needed
4. Click "Create Playlist"
```

### Pattern: Release changelog entry

**Use when**: Preparing a public version bump.

**Implementation**:
```markdown
## [1.0.3] - 2026-04-26

### Fixed

- Improved duplicate directory detection for recursive scans
- Clarified manual testing steps for LiteSpeed listings
```

---

## Anti-Patterns

### 🔴 Security marketing copy
**Severity**: CRITICAL — blocks merge
**The temptation**: claim the script is "fully secure" or "collects nothing ever" without code backing.
**The danger**: false guarantees erode trust and complicate responsible disclosure.
**The fix**: document only verifiable behavior.

### 🟠 Stale manual QA
**Severity**: HIGH — fix before merge
**The temptation**: land features and defer manual test updates.
**The danger**: future contributors cannot reproduce release confidence.
**The fix**: update test steps in the same PR.

---

## Performance Budgets

| Metric | Target | Hard Limit | How to Measure |
|--------|--------|------------|----------------|
| User-facing feature lag in docs | 0 releases | 1 release | compare merged feature to README/changelog |
| Manual QA step ambiguity | 0 unclear steps | 1 unresolved question per section | read through tests guide |

## Security Checklist

- [ ] Security claims describe actual code behavior only.
- [ ] No screenshots or examples expose personal browsing data.
- [ ] Installation instructions point only to trusted sources.
- [ ] Changelog does not omit security-relevant user impact.
- [ ] Manual test instructions avoid unsafe public-directory suggestions as mandatory input.

## Error Scenarios

| Scenario | Detection | Recovery | User Impact | Severity |
|----------|-----------|----------|-------------|----------|
| README misses new control | Feature diff vs README | Update README in same PR | Users cannot discover feature | High |
| Manual guide stale after scan change | QA reviewer confusion | Rewrite exact steps | Contributor friction | Medium |
| Security policy overclaims behavior | Review against code | Narrow language | False confidence | Critical |

## Edge Cases

### Edge Case: Internal refactor with no user-facing change
**Scenario**: A cleanup does not alter behavior.
**Handling**: Update `DEVELOPMENT.md` only if contributor workflow or structure changed; otherwise changelog can omit it.
**Code**:
```markdown
## Development Notes

- Internal helper extraction for scan-state readability
```

## Integration Points

| Relationship | Skill | Detail |
|-------------|-------|--------|
| Depends on | `project-architecture` | Docs map directly to repo structure |
| Referenced by | `git-workflow` | PRs must include manual verification notes |
| Shares decision | `release-distribution` | Release notes and install steps must stay aligned |

## Pre-Commit Checklist

- [ ] README reflects user-visible behavior changes.
- [ ] DEVELOPMENT reflects tooling or structure changes.
- [ ] CHANGELOG reflects release-facing behavior only.
- [ ] Manual test guide still describes real steps and expected outcomes.
- [ ] Security wording is factual and minimal.
