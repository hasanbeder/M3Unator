---
name: userscript-patterns
description: |
  Defines how M3Unator behaves as a browser userscript, including metadata discipline, DOM attachment, lifecycle, teardown, state ownership, and compatibility with Tampermonkey and Violentmonkey. Trigger this skill for any change to the metadata block, page detection, panel mounting, event listeners, or teardown/reset behavior. Without it, the script becomes brittle across host pages and userscript managers.
---

# Userscript Patterns

> A userscript must be self-contained, polite to the host page, and easy to remove from the page lifecycle.

## Activation

This skill activates when:
- Editing the metadata block in `M3Unator.user.js` or `M3Unator.meta.js`.
- Changing page detection, panel mount/unmount, event listeners, or reset logic.
- Discussing userscript manager behavior or browser extension compatibility.

## Project Context

| Key | Value |
|-----|-------|
| Project | M3Unator |
| Runtime | Browser userscript on arbitrary directory listings |
| Relevant Stack | Userscript metadata, `GM_addStyle`, direct DOM injection, session-only state |
| Key Decisions | Self-contained IIFE, minimal grants, one launcher, full cleanup on reset/close |

---

## Core Rules

### Rule 1: Guard execution early

**Rule**: The userscript must detect unsupported pages immediately and return before creating UI or listeners.

**Rationale**: M3Unator runs on a broad `@match`; page guards prevent needless DOM work and strange behavior on unrelated pages.

### Rule 2: Mount one controlled UI root

**Rule**: The script must create one container/launcher pair and own every descendant element it injects.

**Rationale**: A single owned root makes cleanup predictable and avoids page-level collisions.

### Rule 3: Namespace every class and selector

**Rule**: Injected classes, IDs, and DOM hooks must stay under the `M3Unator-` namespace.

**Rationale**: The host page may use arbitrary HTML and CSS. Namespacing prevents accidental styling and selector conflicts.

### Rule 4: Keep state in JavaScript, not the DOM

**Rule**: DOM elements reflect `this.state`; they must not become the source of truth for scan flow.

**Rationale**: Pause, cancel, and recursive scan behavior become unstable when logic keeps re-reading mutable DOM instead of internal state.

### Rule 5: Teardown must be idempotent

**Rule**: Close, cancel, and reset flows must be safe to call repeatedly without leaking overlays, listeners, or stale state.

**Rationale**: Users may open and close the panel frequently. Idempotent teardown prevents accumulating UI debris.

---

## Approved Patterns

### Pattern: Early page gate

**Use when**: Determining whether to mount the script UI.

**Implementation**:
```javascript
if (!document.title.includes('Index of') && !document.querySelector('div#table-list')) {
  return;
}
```

### Pattern: Namespaced mount root

**Use when**: Injecting M3Unator UI into an arbitrary page.

**Implementation**:
```javascript
const container = document.createElement('div');
container.className = 'M3Unator-container';
document.body.appendChild(container);
```

---

## Anti-Patterns

### 🔴 Global collision
**Severity**: CRITICAL — blocks merge
**The temptation**: add generic classes or ids like `.modal` or `#close`.
**The danger**: host-page CSS or JS can break the userscript instantly.
**The fix**: keep the `M3Unator-` namespace everywhere.

### 🟠 DOM as state store
**Severity**: HIGH — must fix before merge
**The temptation**: read checkboxes or styles deep inside scan logic.
**The danger**: scan behavior becomes coupled to mutable UI state and hard to test.
**The fix**: sync DOM to `this.state` once at the event boundary.

---

## Performance Budgets

| Metric | Target | Hard Limit | How to Measure |
|--------|--------|------------|----------------|
| Injected UI roots | 1 | 1 | inspect DOM after launch |
| Leftover overlays after close/reset | 0 | 0 | open/close cycle manual test |

## Security Checklist

- [ ] Metadata block remains minimal and intentional.
- [ ] UI selectors stay namespaced.
- [ ] Unsupported pages bail out before UI creation.
- [ ] Reset/close removes temporary overlays and session state.
- [ ] No host-page globals are overwritten.

## Error Scenarios

| Scenario | Detection | Recovery | User Impact | Severity |
|----------|-----------|----------|-------------|----------|
| UI mounts twice | two launchers/containers seen | dedupe mount and reset | broken UI | High |
| Overlay not removed on close | page remains blocked | cleanup overlay idempotently | page unusable until refresh | High |
| Unsupported page still mounts | button appears on wrong pages | tighten gate condition | confusing behavior | Medium |

## Edge Cases

### Edge Case: Repeated open/close cycles
**Scenario**: A user opens and closes the panel several times without reloading the page.
**Handling**: Reuse or cleanly reset namespaced UI elements and state each cycle.
**Code**:
```javascript
if (document.querySelector('.M3Unator-overlay')) {
  document.querySelector('.M3Unator-overlay').remove();
}
```

## Integration Points

| Relationship | Skill | Detail |
|-------------|-------|--------|
| Depends on | `project-architecture` | Single-file runtime shapes lifecycle organization |
| Referenced by | `ui-engineering` | UI behaviors rely on namespaced mount roots |
| Shares decision | `security-hardening` | Metadata permissions and DOM safety stay aligned |

## Pre-Commit Checklist

- [ ] Unsupported pages still bail out early.
- [ ] All injected selectors remain namespaced.
- [ ] UI state syncs through `this.state`, not ad hoc DOM reads.
- [ ] Close/reset flows remove overlays and stale session state.
- [ ] Metadata changes are mirrored into `.meta.js` if needed.
