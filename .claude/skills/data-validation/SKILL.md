---
name: data-validation
description: |
  Defines how M3Unator validates user input, discovered links, scan depth values, supported file names, and runtime configuration before those values influence recursion or export. Trigger it for playlist naming, URL parsing, checkbox/radio state, depth controls, parser updates, or any new configuration surface. Without this skill, malformed paths and UI input leak deep into the scanner and create broken playlists or unsafe loops.
---

# Data Validation

> Validate early at browser boundaries so the scan core can trust its own state.

## Activation

This skill activates when:
- Editing playlist input handling, scan depth controls, or parser filters.
- Changing how discovered links become absolute URLs.
- Introducing new toggles, options, or configuration values.

## Project Context

| Key | Value |
|-----|-------|
| Project | M3Unator |
| Inputs | Playlist name, include/exclude toggles, depth values, hrefs from directory listings |
| Relevant Stack | DOM form controls, `URL`, filename sanitization, recursive scan state |
| Key Decisions | Validate at input and parser boundaries, trust internal state after normalization, reject malformed links early |

---

## Core Rules

### Rule 1: Sanitize playlist names at input time

**Rule**: User-provided playlist names must be normalized, stripped of unsafe characters, trimmed, and length-limited before export.

**Rationale**: Export names influence downloads and visible UI. Unsafe characters create broken files or confusing output.

### Rule 2: Clamp numeric controls

**Rule**: Depth, retry, timeout, and concurrency-style numeric options must be clamped to explicit min/max ranges before use.

**Rationale**: Unbounded numeric inputs are a fast path to runaway scans or unusable UI.

### Rule 3: Filter hrefs before resolving them

**Rule**: Ignore query-only links, root redirects, parent directory markers, and unsupported protocols before constructing recursion candidates.

**Rationale**: Directory listings contain many links that are not recursive scan targets.

### Rule 4: Validate toggles into booleans once

**Rule**: Checkbox and radio values must be converted into explicit booleans or mode strings at the event boundary.

**Rationale**: DOM form state is mutable and string-heavy. Internal scan logic should not keep re-reading raw elements.

### Rule 5: Preserve undecodable values safely

**Rule**: If a string cannot be decoded cleanly, retain the original value and mark the event as a warning instead of crashing.

**Rationale**: Public directory listings often contain inconsistent encodings. The safe fallback is resilience, not abort.

---

## Approved Patterns

### Pattern: Clamp numeric depth

**Use when**: Reading a custom depth input.

**Implementation**:
```javascript
function clampDepth(value) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return 1;
  return Math.min(99, Math.max(1, parsed));
}
```

### Pattern: Early href rejection

**Use when**: Turning parsed href strings into scan work.

**Implementation**:
```javascript
function isScanCandidate(href) {
  return Boolean(href) && href !== '../' && !href.startsWith('?') && !href.startsWith('/');
}
```

---

## Anti-Patterns

### 🔴 Blind trust in DOM input
**Severity**: CRITICAL — blocks merge
**The temptation**: read raw input values directly inside deep scan logic.
**The danger**: invalid values spread across state and are harder to recover from.
**The fix**: normalize once at the boundary.

### 🟠 Recursive scan from unchecked href
**Severity**: HIGH — must fix before merge
**The temptation**: recurse on every `<a href>` quickly.
**The danger**: loops, parent traversals, or malformed targets waste scan time and break results.
**The fix**: reject unsupported hrefs before resolution.

---

## Performance Budgets

| Metric | Target | Hard Limit | How to Measure |
|--------|--------|------------|----------------|
| Invalid hrefs reaching recursion | 0 | 1 per parser change | inspect scan candidate filter |
| Numeric inputs parsed without clamp | 0 | 1 | review form handlers |

## Security Checklist

- [ ] Playlist names are sanitized before export.
- [ ] Numeric controls are clamped to documented ranges.
- [ ] Unsupported protocols and parent-directory hrefs are rejected early.
- [ ] Raw DOM values are not read repeatedly in deep logic.
- [ ] Decode failures fall back safely instead of crashing.

## Error Scenarios

| Scenario | Detection | Recovery | User Impact | Severity |
|----------|-----------|----------|-------------|----------|
| Invalid depth input | NaN or out-of-range value | clamp to safe default | Slightly different scan scope | Medium |
| Malformed href | URL constructor or filter rejects it | skip and log warning | One entry skipped | Medium |
| Unsafe playlist name | sanitization strips everything | fallback to `playlist` | Generic filename | Low |

## Edge Cases

### Edge Case: Zero-width or control characters in filename
**Scenario**: A path contains invisible characters that would create confusing output.
**Handling**: strip invisible/control characters and keep the readable remainder.
**Code**:
```javascript
function sanitizeName(name) {
  return name.replace(/[\x00-\x1F\x7F\u200B-\u200D\uFEFF]/g, '').trim();
}
```

## Integration Points

| Relationship | Skill | Detail |
|-------------|-------|--------|
| Depends on | `javascript-standards` | Boundary helpers stay small and explicit |
| Referenced by | `directory-scanning-engine` | Scan recursion trusts validated inputs |
| Shares decision | `security-hardening` | Unsafe hrefs are rejected before they can do harm |

## Pre-Commit Checklist

- [ ] User input is sanitized or clamped at the boundary.
- [ ] Hrefs are filtered before recursion.
- [ ] Raw DOM values are converted to booleans or explicit mode strings.
- [ ] Decode failures preserve original values safely.
- [ ] New configuration ranges are documented in README and tests if user-facing.
