---
name: release-distribution
description: |
  Controls public delivery of M3Unator through GitHub raw files, GitHub releases, and Greasy Fork style distribution. Trigger it for version bumps, changelog edits, metadata updates, install/update URL changes, release notes, and browser/userscript-manager support statements. Without this skill, the project ships mismatched artifacts, stale compatibility claims, or unverified release instructions.
---

# Release Distribution

> Public userscript releases are only trustworthy when runtime, metadata, docs, and compatibility claims all move together.

## Activation

This skill activates when:
- Bumping versions or changing install/update URLs.
- Updating compatibility statements, release notes, or metadata files.
- Preparing a public release or release checklist.

## Project Context

| Key | Value |
|-----|-------|
| Project | M3Unator |
| Distribution | GitHub raw install/update URLs plus public release notes |
| Verified Runtime Baselines | Chrome 147 stable, Firefox 150, Tampermonkey 5.5.6235 stable, Violentmonkey 2.35.0 latest stable (verified 2026-04-26 from official sources) |
| Key Decisions | Publish one synchronized version, smoke-test latest stable browser/manager paths, keep compatibility claims current |

---

## Core Rules

### Rule 1: Version surfaces move together

**Rule**: A public release must update `M3Unator.user.js`, `M3Unator.meta.js`, `CHANGELOG.md`, and any compatibility docs that changed.

**Rationale**: Userscript installers and GitHub readers rely on these surfaces agreeing on one release state.

### Rule 2: Release compatibility claims must be verified, not assumed

**Rule**: Browser and userscript-manager support notes must be based on the latest verified stable release lines, not memory.

**Rationale**: Compatibility statements go stale quickly and directly influence installation trust.

### Rule 3: Public install URLs stay stable and trusted

**Rule**: `@downloadURL`, `@updateURL`, `@homepageURL`, and `@supportURL` must continue to point to trusted repository or issue endpoints only.

**Rationale**: Users install directly from these URLs. They are part of the project’s security boundary.

### Rule 4: Release smoke always includes real install/update flow

**Rule**: Before publishing, verify that the released metadata points to the intended raw userscript artifact and that the script still loads on supported managers.

**Rationale**: A correct code change with broken metadata is still a broken release.

### Rule 5: Changelog entries must map to actual shipped behavior

**Rule**: Release notes must describe what the published script now does, not what a future branch might do.

**Rationale**: Public changelogs are a release contract.

---

## Approved Patterns

### Pattern: Synchronized release checklist

**Use when**: Preparing a public version bump.

**Implementation**:
```markdown
1. Update version in `M3Unator.user.js`
2. Mirror version in `M3Unator.meta.js`
3. Update `CHANGELOG.md`
4. Run validator scripts
5. Smoke in latest stable Chrome and Firefox with supported managers
```

### Pattern: Trusted URL review

**Use when**: Inspecting the metadata block before publishing.

**Implementation**:
```javascript
// @downloadURL  https://raw.githubusercontent.com/hasanbeder/M3Unator/main/M3Unator.user.js
// @updateURL    https://raw.githubusercontent.com/hasanbeder/M3Unator/main/M3Unator.meta.js
```

---

## Anti-Patterns

### 🔴 Broken metadata release
**Severity**: CRITICAL — blocks release
**The temptation**: publish after updating only the main userscript file.
**The danger**: users get a broken install/update flow.
**The fix**: sync all release surfaces and smoke the install path.

### 🟠 Stale compatibility statement
**Severity**: HIGH — fix before release
**The temptation**: leave browser or manager support text untouched for months.
**The danger**: users rely on compatibility claims that no longer reflect current stable platforms.
**The fix**: verify against current official release channels.

---

## Performance Budgets

| Metric | Target | Hard Limit | How to Measure |
|--------|--------|------------|----------------|
| Unsynced release files | 0 | 0 | inspect staged release files |
| Supported runtime matrix skipped before release | 0 paths | 1 skipped path | release checklist review |

## Security Checklist

- [ ] All public URLs remain trusted and intentional.
- [ ] Compatibility claims were verified on 2026-04-26 or later before release.
- [ ] Release notes do not overstate security or privacy behavior.
- [ ] Metadata and runtime version numbers match exactly.
- [ ] Validator scripts and manual smoke both passed before publishing.

## Error Scenarios

| Scenario | Detection | Recovery | User Impact | Severity |
|----------|-----------|----------|-------------|----------|
| Raw update URL points to wrong file | metadata smoke test | fix URL before release | auto-update fails | Critical |
| Browser support note is stale | docs review against official sources | update compatibility text | failed installs or support churn | High |
| Changelog promises unshipped behavior | compare diff to notes | rewrite release notes | user confusion | Medium |

## Edge Cases

### Edge Case: Metadata-only hotfix after release
**Scenario**: A release ships with correct runtime behavior but broken metadata URLs or support text.
**Handling**: publish a patch release and note that the change fixes distribution integrity, not runtime behavior.
**Code**:
```markdown
### Fixed
- Corrected update metadata so userscript managers receive the intended artifact
```

## Integration Points

| Relationship | Skill | Detail |
|-------------|-------|--------|
| Depends on | `git-workflow` | Release commits must be synchronized and reviewable |
| Referenced by | `documentation-standards` | README and changelog reflect real release state |
| Shares decision | `testing-strategy` | Release smoke coverage defines compatibility confidence |

## Pre-Commit Checklist

- [ ] Userscript, metadata, and changelog versions match.
- [ ] Trusted raw GitHub URLs remain correct.
- [ ] Compatibility claims were re-verified against official stable channels.
- [ ] Validator scripts passed.
- [ ] Release smoke covered the intended browser/manager paths.
