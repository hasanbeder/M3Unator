---
name: git-workflow
description: |
  Controls branches, commits, reviews, and release packaging for M3Unator. Use it for every code change, doc update, release preparation, version bump, and PR discussion. It must trigger whenever the user asks to commit, review, prepare a release, or split work into changesets. Without this skill, metadata, docs, and userscript payloads drift apart and releases become untraceable.
---

# Git Workflow

> Small, reviewable commits are the only safe way to evolve a single-file userscript.

## Activation

This skill activates when:
- Creating branches, commits, pull requests, or releases.
- Updating the userscript version or metadata.
- The user asks for a review, commit, changelog, or release prep.

## Project Context

| Key | Value |
|-----|-------|
| Project | M3Unator |
| Workflow | GitHub-hosted open source repo |
| Relevant Stack | Single runtime file, mirrored metadata, markdown docs, manual test guide |
| Key Decisions | Trunk-based workflow, atomic commits, release commits always include metadata and changelog |

---

## Core Rules

### Rule 1: Use trunk-based branches

**Rule**: Work branches must use `feat/`, `fix/`, `docs/`, `refactor/`, or `chore/` prefixes and merge back to `main`.

**Rationale**: This repo is small and release-oriented. Heavy branch choreography adds no value and hides version-sync mistakes.

### Rule 2: Keep one concern per commit

**Rule**: A commit must change one primary concern only: runtime logic, release metadata, docs, or tooling.

**Rationale**: Single-file runtime changes are already dense. Mixed commits make regressions hard to bisect.

### Rule 3: Release commits are synchronized commits

**Rule**: Any version bump must include `M3Unator.user.js`, `M3Unator.meta.js`, and `CHANGELOG.md`.

**Rationale**: Userscript installers, GitHub readers, and release consumers all depend on those three surfaces agreeing.

### Rule 4: PRs must mention manual verification

**Rule**: Every PR touching runtime behavior must name the directory listing cases or browsers that were checked manually.

**Rationale**: There is no broad automated runtime suite yet; the reviewer needs explicit manual evidence.

### Rule 5: Prefer squash merge for feature branches

**Rule**: Merge feature work with a squash commit unless preserving multiple commits is essential for release forensics.

**Rationale**: Squash merges keep the main history readable while still allowing atomic branch work.

---

## Approved Patterns

### Pattern: Release prep branch

**Use when**: Shipping a public userscript update.

**Implementation**:
```bash
git checkout -b fix/release-1.0.3
# update M3Unator.user.js
# update M3Unator.meta.js
# update CHANGELOG.md
git add M3Unator.user.js M3Unator.meta.js CHANGELOG.md
git commit -m "fix(release): publish 1.0.3"
```

---

## Anti-Patterns

### 🔴 Unsynced release commit
**Severity**: CRITICAL — blocks release
**The temptation**: bump only one version string quickly.
**The danger**: updater metadata and runtime payload diverge.
**The fix**: update all release surfaces together.

### 🟠 Mega-commit
**Severity**: HIGH — split before merge
**The temptation**: land UI, scan, docs, and versioning together.
**The danger**: review quality collapses and regressions are hard to isolate.
**The fix**: split concerns before merging.

---

## Performance Budgets

| Metric | Target | Hard Limit | How to Measure |
|--------|--------|------------|----------------|
| Files changed per routine feature PR | < 8 files | 12 files | `git diff --stat` |
| Runtime changes per release commit | 1 release slice | 1 unsynced version surface | review staged files |

## Security Checklist

- [ ] Release URLs remain trusted GitHub raw endpoints.
- [ ] No secret tokens or private test URLs are committed.
- [ ] PR notes do not expose sensitive browsing data from manual tests.
- [ ] Changelog does not imply unsupported security claims.
- [ ] Version bump commits include the security policy if support status changed.

## Error Scenarios

| Scenario | Detection | Recovery | User Impact | Severity |
|----------|-----------|----------|-------------|----------|
| Version mismatch across files | Review diff | Update missing files before merge | Broken updates | Critical |
| Feature PR lacks manual test note | PR review | Add verification details | Lower reviewer confidence | Medium |
| Mixed mega-commit | Diff too large | Split into smaller commits | Harder review | High |

## Edge Cases

### Edge Case: Docs-only hotfix
**Scenario**: A documentation error must be corrected without a runtime change.
**Handling**: Use a `docs/` branch and avoid version bumps.
**Code**:
```bash
git checkout -b docs/manual-test-clarification
git commit -m "docs(tests): clarify directory listing checks"
```

## Integration Points

| Relationship | Skill | Detail |
|-------------|-------|--------|
| Depends on | `project-architecture` | File roles decide what a release commit must touch |
| Referenced by | `release-distribution` | Public release flow depends on commit hygiene |
| Shares decision | `documentation-standards` | Verification notes must be documented |

## Pre-Commit Checklist

- [ ] Branch name matches the change type.
- [ ] Commit scope is a single concern.
- [ ] Release commits include runtime, metadata, and changelog together.
- [ ] Manual verification notes are ready for the PR body.
- [ ] No unrelated files are staged.
