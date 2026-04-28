---
name: dependency-management
description: |
  Controls runtime and contributor dependencies for M3Unator, including userscript metadata, remote assets, validator tooling, and any future package manager adoption. Trigger it for new libraries, external URLs, metadata grants, validator updates, and tooling additions under scripts/. Without it, the repo can drift from a zero-runtime-dependency userscript into a harder-to-audit bundle with hidden update and supply-chain risk.
---

# Dependency Management

> The safest dependency is the one the userscript does not need.

## Activation

This skill activates when:
- Adding libraries, external assets, metadata directives, or contributor tooling.
- Changing install/update URLs or remote documentation references.
- Discussing package managers, bundlers, or validator script upgrades.

## Project Context

| Key | Value |
|-----|-------|
| Project | M3Unator |
| Runtime Dependency Model | No package manifest and no runtime npm dependencies |
| Tooling Dependency Model | Local Node-based validator scripts under `scripts/` |
| Key Decisions | Keep runtime self-contained, avoid `@require`, treat remote assets as exceptions that need review |

---

## Core Rules

### Rule 1: Default to zero new runtime dependencies

**Rule**: Do not add runtime libraries, `@require` directives, or remote helper scripts unless the feature is impossible with native browser APIs.

**Rationale**: Runtime dependencies are hardest to audit in a raw userscript delivery model.

### Rule 2: New external assets require explicit review

**Rule**: Any new remote font, image, stylesheet, or install/update endpoint must document why it is needed and what fallback exists.

**Rationale**: External assets are still dependencies, even when they are not JavaScript.

### Rule 3: Contributor tooling belongs in `scripts/`

**Rule**: Validation, reporting, and compliance utilities must live under `scripts/` and stay separate from runtime code.

**Rationale**: Tooling helps contributors without increasing the end-user trust surface.

### Rule 4: Pin documented toolchain baselines

**Rule**: Contributor documentation must point to verified stable baselines for Node.js and Python when those tools are referenced.

**Rationale**: The repo now includes governance scripts; documented baselines prevent “works on my machine” drift.

### Rule 5: Prefer removal over layering

**Rule**: If a proposed dependency duplicates native browser functionality already in use, reject it and simplify the existing code instead.

**Rationale**: A small userscript benefits more from fewer moving parts than from abstraction for abstraction’s sake.

---

## Approved Patterns

### Pattern: Native API before library

**Use when**: A contributor wants helper behavior for URLs or HTML parsing.

**Implementation**:
```javascript
const absolute = new URL(href, baseUrl).toString();
const doc = new DOMParser().parseFromString(html, 'text/html');
```

### Pattern: Tooling stays local

**Use when**: Adding validators or governance scripts.

**Implementation**:
```bash
node scripts/validate_bootstrap.js .claude/skills/
node scripts/version_checker.js .claude/skills/
```

---

## Anti-Patterns

### 🔴 Runtime remote code
**Severity**: CRITICAL — blocks merge
**The temptation**: add a CDN helper or `@require`.
**The danger**: the runtime trust boundary now includes code outside the repo.
**The fix**: keep logic local or do not ship it.

### 🟠 Hidden remote asset growth
**Severity**: HIGH — must fix before merge
**The temptation**: add one more remote font or stylesheet without review.
**The danger**: performance and privacy costs grow silently.
**The fix**: document the dependency and justify the fallback story.

---

## Performance Budgets

| Metric | Target | Hard Limit | How to Measure |
|--------|--------|------------|----------------|
| New runtime libraries | 0 | 0 without explicit approval | inspect metadata and runtime code |
| New contributor tool entrypoints | ≤ 1 per new workflow | 2 overlapping scripts | inspect `scripts/` additions |

## Security Checklist

- [ ] No runtime remote code or `@require` was introduced.
- [ ] External asset additions are documented and justified.
- [ ] Validator scripts stay local and browser-inactive.
- [ ] Install/update URLs remain trusted.
- [ ] Toolchain baselines are documented with verified sources.

## Error Scenarios

| Scenario | Detection | Recovery | User Impact | Severity |
|----------|-----------|----------|-------------|----------|
| Runtime dependency added casually | diff or metadata review | remove it or justify formally | expanded trust surface | Critical |
| External asset slows or breaks UI | manual smoke test | provide fallback or remove asset | degraded UI | Medium |
| Tooling script placed in runtime file | review | move into `scripts/` | larger runtime and harder auditing | High |

## Edge Cases

### Edge Case: Future bundler proposal
**Scenario**: The project eventually wants multi-file source code.
**Handling**: require a separate architectural decision, a committed lockfile, and a reproducible build path before adopting package-managed runtime dependencies.
**Code**:
```markdown
Decision required:
- bundler choice
- lockfile policy
- release artifact verification
```

## Integration Points

| Relationship | Skill | Detail |
|-------------|-------|--------|
| Depends on | `project-architecture` | Tooling and runtime stay in separate paths |
| Referenced by | `release-distribution` | Release flow must ship trusted URLs only |
| Shares decision | `security-hardening` | Remote runtime code is banned |

## Pre-Commit Checklist

- [ ] No new runtime dependency was added casually.
- [ ] External assets, if any, are documented and justified.
- [ ] New tooling lives only in `scripts/`.
- [ ] Install/update URLs remain trusted and intentional.
- [ ] Contributor docs reference the current validated toolchain.
