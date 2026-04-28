---
name: javascript-standards
description: |
  Defines how JavaScript is written in M3Unator and must trigger for changes to M3Unator.user.js, M3Unator.meta.js, any new .js file in scripts/, or discussions about style, helpers, async behavior, or browser compatibility. Use it whenever logic is added to scanning, DOM interaction, download flow, or validation tooling. Without this skill, the repo drifts into inconsistent syntax, fragile async code, and browser-hostile patterns.
---

# JavaScript Standards

> Write browser-native JavaScript that is explicit, portable, and safe under userscript constraints.

## Activation

This skill activates when:
- Editing any `*.js` file in the repo.
- Adding async logic, helpers, DOM code, or browser-side data structures.
- The user asks about JavaScript style, refactoring, modern syntax, or compatibility.

## Project Context

| Key | Value |
|-----|-------|
| Project | M3Unator |
| Language | Vanilla JavaScript |
| Framework | None |
| Relevant Stack | Browser DOM APIs, `fetch`, `URL`, `Map`, `Set`, userscript metadata block |
| Key Decisions | Prefer explicit methods over anonymous sprawl, no transpile step, no runtime dependencies |

---

## Core Rules

### Rule 1: Default to `const`, use `let` only for reassignment

**Rule**: `var` is forbidden; `const` is the default, and `let` is only for variables that genuinely change.

**Rationale**: Function-scoped declarations and accidental reassignment are common sources of runtime bugs in large browser scripts.

**Correct** ✅:
```javascript
const batchSize = 100;
let processed = 0;
processed += 1;
```

**Incorrect** ❌:
```javascript
var batchSize = 100;
// -> Consequence: broader scope and hoisting make later refactors risky.
```

### Rule 2: Keep async flow explicit

**Rule**: All asynchronous work must use `async`/`await` with clear retry, cancellation, or loop boundaries.

**Rationale**: The scanner is concurrency-heavy. Promise chains with hidden side effects are hard to pause, resume, or cancel safely.

**Correct** ✅:
```javascript
async function loadHtml(url) {
  const response = await fetch(url);
  return response.text();
}
```

**Incorrect** ❌:
```javascript
function loadHtml(url) {
  return fetch(url).then((response) => response.text()).then(doEverything);
}
// -> Consequence: control flow and failure points are obscured.
```

### Rule 3: Normalize data at boundaries

**Rule**: Raw DOM strings, URLs, and user input must be normalized immediately after entering the system.

**Rationale**: M3Unator deals with encoded paths, server-generated HTML, and user-provided playlist names. Boundary cleanup prevents duplicate special-case logic.

### Rule 4: Prefer named methods over inline anonymous logic

**Rule**: Repeated logic must become a method with a clear name before it appears in a third call site.

**Rationale**: The current single-file runtime stays maintainable only if helpers are reusable and searchable.

### Rule 5: Use stable, browser-native data structures

**Rule**: Use `Map`, `Set`, arrays, and plain objects intentionally; do not emulate sets with arrays or overload DOM state as data storage.

**Rationale**: The scan engine already relies on `Map` and `Set` for performance-sensitive work. Regressing to linear lookups wastes time on large directories.

---

## Approved Patterns

### Pattern: Boundary helper plus pure predicate

**Use when**: A feature needs normalization and then repeated checks.

**Implementation**:
```javascript
function normalizeUrl(url) {
  return url.replace(/([^:]\/)\/+/g, '$1');
}

function isDirectoryHref(href) {
  return href.endsWith('/');
}

const normalized = normalizeUrl('https://example.com//music/');
const shouldRecurse = isDirectoryHref('albums/');
```

### Pattern: Explicit batch loop

**Use when**: Processing many files without blocking the browser longer than necessary.

**Implementation**:
```javascript
async function processInBatches(items, batchSize, worker) {
  for (let index = 0; index < items.length; index += batchSize) {
    const batch = items.slice(index, index + batchSize);
    await Promise.all(batch.map(worker));
  }
}
```

---

## Anti-Patterns

### 🔴 Dynamic runtime evaluation
**Severity**: CRITICAL — merge blocked
**The temptation**: Parse or execute arbitrary strings quickly.
**The danger**: `eval` and `new Function` violate the project security model.
**The fix**: Use explicit branching and data-driven maps.

### 🟠 Anonymous callback sprawl
**Severity**: HIGH — must fix before merge
**The temptation**: Keep all logic inline in one listener or promise.
**The danger**: reviewability and pause/cancel behavior degrade immediately.
**The fix**: extract helpers with names that reflect intent.

---

## Performance Budgets

| Metric | Target | Hard Limit | How to Measure |
|--------|--------|------------|----------------|
| Duplicate linear lookups in hot scan path | 0 new cases | 1 per feature | Review batch/file loops |
| New helper reuse threshold | extract by 3rd use | never exceed 3 call sites inline | Review diff |

## Security Checklist

- [ ] No `eval`, `new Function`, or string-built timers.
- [ ] Input normalization happens at the first trusted boundary.
- [ ] Async code does not hide rejected promises.
- [ ] Reused data structures are `Map`/`Set` when uniqueness or keyed lookups matter.
- [ ] Browser APIs are used directly instead of undocumented globals.

## Error Scenarios

| Scenario | Detection | Recovery | User Impact | Severity |
|----------|-----------|----------|-------------|----------|
| Hidden rejection in a promise chain | Console error during scan | Rewrite as `async`/`await` and catch at boundary | Partial scan or stalled UI | High |
| Reintroduced `var` scope bug | Code review or compliance script | Replace with `const`/`let` | Inconsistent runtime state | Medium |
| Array used as a cache set | Hot path gets slower on large directories | Replace with `Set` | Slower scans | Medium |

## Edge Cases

### Edge Case: Malformed percent encoding
**Scenario**: A server returns filenames with broken `%` sequences.
**Handling**: Catch decode failures and preserve the original string instead of crashing the scan.
**Code**:
```javascript
function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
```

## Integration Points

| Relationship | Skill | Detail |
|-------------|-------|--------|
| Depends on | `project-architecture` | Single-file runtime shapes helper extraction |
| Referenced by | `directory-scanning-engine` | Hot-path code must follow these async and data-structure rules |
| Shares decision | `security-hardening` | Dynamic code execution is banned everywhere |

## Pre-Commit Checklist

- [ ] No `var`, `eval`, or anonymous callback sprawl added.
- [ ] Async work is explicit and cancellation-safe.
- [ ] Boundary helpers normalize raw strings and URLs once.
- [ ] `node scripts/check_skill_compliance.js --file M3Unator.user.js` passes or findings are understood.
- [ ] New helpers have clear names and single responsibilities.
