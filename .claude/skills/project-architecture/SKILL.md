---
name: project-architecture
description: |
  Governs how code is organized in M3Unator and must trigger for any change to M3Unator.user.js, M3Unator.meta.js, docs, tests, or new project files. Use it for refactors, file moves, new helpers, release tooling, and any discussion about splitting the single userscript into safer logical sections. Without this skill, contributors will keep adding ad hoc globals, duplicate parsing logic, and repo sprawl that make the userscript harder to review and publish.
---

# Project Architecture

> The shipped userscript is one artifact, but the architecture must still be modular in intent.

## Activation

This skill activates when:
- Editing `M3Unator.user.js`, `M3Unator.meta.js`, `README.md`, `DEVELOPMENT.md`, `tests/`, `wiki/`, or release tooling.
- Adding helpers, UI features, parsers, exporters, or validation scripts.
- The user asks about structure, refactoring, cleanup, modularization, or file layout.

## Project Context

| Key | Value |
|-----|-------|
| Project | M3Unator |
| Language | Vanilla JavaScript in a browser userscript runtime |
| Framework | None; direct DOM APIs plus `GM_addStyle` |
| Relevant Stack | `fetch`, `DOMParser`, `URL`, `Set`, `Map`, manual docs, raw script distribution |
| Key Decisions | Ship `M3Unator.user.js` as the only runtime artifact, keep `M3Unator.meta.js` synchronized, keep tests and docs outside the runtime file |

---

## Core Rules

### Rule 1: Keep one shipped runtime entrypoint

**Rule**: `M3Unator.user.js` must remain the only executable runtime artifact until a build step is introduced deliberately.

**Rationale**: Userscript installation and raw GitHub delivery depend on a single installable file. Splitting runtime code without a build pipeline breaks installation and review.

**Correct** ✅:
```javascript
// Keep runtime logic inside the shipped file, grouped by concern.
class PlaylistGenerator {
  scanDirectory(url, currentPath = '', depth = 0) {
    return this.entries;
  }
}
```

**Incorrect** ❌:
```javascript
// Bad: the userscript now depends on an unbundled local import.
import { scanDirectory } from './scanner.js';
// -> Consequence: browser userscript managers cannot install or execute this as-is.
```

### Rule 2: Separate repo concerns by top-level path

**Rule**: Runtime code lives in `M3Unator.user.js`, metadata lives in `M3Unator.meta.js`, contributor docs stay in root markdown files, exploratory docs stay in `wiki/`, and manual test material stays in `tests/`.

**Rationale**: This repo is intentionally flat. Mixing runtime code into docs or test folders hides release-critical changes and makes reviews noisy.

### Rule 3: Introduce logical modules before physical modules

**Rule**: New behavior inside `M3Unator.user.js` must be grouped into clearly named methods or helper classes before any file split is proposed.

**Rationale**: The current delivery model is single-file. Clear logical seams reduce risk now and make a future build-based split tractable later.

**Correct** ✅:
```javascript
class PlaylistGenerator {
  sanitizeInput(input) { return input.trim(); }
  normalizeUrl(url) { return url.endsWith('/') ? url : `${url}/`; }
}
```

**Incorrect** ❌:
```javascript
class PlaylistGenerator {
  init() {
    // 300 unrelated lines for DOM, parsing, download, and retries.
  }
}
// -> Consequence: regressions become impossible to isolate.
```

### Rule 4: Keep metadata synchronized with runtime releases

**Rule**: Any release-facing change to the userscript version, support URL, update URL, or install URL must update both `M3Unator.user.js` and `M3Unator.meta.js` in the same commit.

**Rationale**: Unsynchronized metadata causes stale update prompts and broken install flows.

### Rule 5: New tooling must be local and optional

**Rule**: Governance tooling belongs in `scripts/` and must never be required at browser runtime.

**Rationale**: Validator scripts help contributors, but the end user only installs the userscript. Runtime code must stay self-contained.

### Rule 6: Document every structural decision near the repo root

**Rule**: Structural changes require updates to `DEVELOPMENT.md` and, when user-visible, `README.md`.

**Rationale**: This project has no generated docs site. Root docs are the canonical contributor map.

---

## Approved Patterns

### Pattern: Single-file layered sections

**Use when**: Adding new capability without introducing a bundler.

**Implementation**:
```javascript
class PlaylistGenerator {
  constructor() {
    this.state = { isGenerating: false, selectedFormat: 'm3u' };
  }

  // State and configuration helpers
  resetCurrentStats() {
    this.state.isGenerating = false;
  }

  // Network and parsing helpers
  normalizeUrl(url) {
    return url.endsWith('/') ? url : `${url}/`;
  }

  // UI integration helpers
  updateCounter(count) {
    if (this.domElements.stats?.totalFiles) {
      this.domElements.stats.totalFiles.textContent = String(count);
    }
  }
}
```

---

## Anti-Patterns

### 🔴 Hidden runtime dependency
**Severity**: CRITICAL — blocks merge, release/install risk
**The temptation**: Split code quickly into ad hoc local files.
**The danger**: The published userscript stops working outside the repo.
**The fix**: Keep new logic self-contained until a deliberate build pipeline exists.

### 🟠 Repo sprawl
**Severity**: HIGH — must fix before merge
**The temptation**: Drop helper notes, scripts, and screenshots anywhere.
**The danger**: Reviewers cannot tell what affects runtime, docs, or manual QA.
**The fix**: Use the existing top-level paths consistently.

---

## Performance Budgets

| Metric | Target | Hard Limit | How to Measure |
|--------|--------|------------|----------------|
| Runtime artifact count | 1 shipped script | 1 shipped script | Inspect repo root before release |
| Structural churn per feature | 1 concern per commit | 3 mixed concerns per commit | Review `git diff --stat` |

## Security Checklist

- [ ] No new runtime dependency requires remote code execution or dynamic imports.
- [ ] Metadata URLs still point to trusted GitHub raw endpoints.
- [ ] New tooling lives in `scripts/` and is not loaded by the userscript.
- [ ] Structural edits did not widen the userscript `@match` or grants accidentally.
- [ ] Docs do not encourage unsafe installation channels.

## Error Scenarios

| Scenario | Detection | Recovery | User Impact | Severity |
|----------|-----------|----------|-------------|----------|
| Metadata drift | Version mismatch between `.user.js` and `.meta.js` | Update both files in one commit | Broken auto-update path | High |
| Runtime split without bundle | Userscript install fails | Revert to single-file runtime or add build step explicitly | Script does not run | Critical |
| Docs point to stale flow | Manual review of README/wiki | Update docs in same PR | Confusing contributor workflow | Medium |

## Edge Cases

### Edge Case: Adding a new automation script
**Scenario**: A new validation helper is needed for contributors.
**Handling**: Place it in `scripts/`, invoke it from docs, and keep browser runtime untouched.
**Code**:
```javascript
// scripts/example.js
console.log('Contributor-only tooling belongs here, not in M3Unator.user.js');
```

## Integration Points

| Relationship | Skill | Detail |
|-------------|-------|--------|
| Depends on | `git-workflow` | Structural changes must be atomic and reviewable |
| Referenced by | `userscript-patterns` | Runtime design follows the single-file constraint |
| Shares decision | `documentation-standards` | Root docs are the source of truth |

## Pre-Commit Checklist

- [ ] Runtime changes are limited to `M3Unator.user.js` and matching metadata/doc updates.
- [ ] No accidental new runtime files were introduced.
- [ ] Structural notes in `DEVELOPMENT.md` and `README.md` are current.
- [ ] `node scripts/validate_bootstrap.js .claude/skills/` still passes.
- [ ] Release-facing paths and URLs remain correct.
