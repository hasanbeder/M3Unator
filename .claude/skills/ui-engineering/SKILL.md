---
name: ui-engineering
description: |
  Governs the M3Unator interface, including injected styling, layout, controls, feedback states, keyboard affordances, and host-page coexistence. Trigger it for any change to HTML templates, CSS injected with GM_addStyle, toasts, drag behavior, overlays, focus handling, or visible copy. Without this skill, the panel becomes inconsistent, inaccessible, and more likely to interfere with host-page interaction.
---

# UI Engineering

> The panel must feel deliberate and lightweight while remaining a polite guest on someone else’s page.

## Activation

This skill activates when:
- Editing UI templates, CSS strings, controls, overlays, or toasts.
- Changing copy, feedback, drag behavior, or layout.
- Discussing keyboard access, contrast, or host-page interference.

## Project Context

| Key | Value |
|-----|-------|
| Project | M3Unator |
| UI Surface | Floating launcher, modal panel, activity log, toasts, drag handle |
| Relevant Stack | `GM_addStyle`, direct DOM creation, namespaced selectors |
| Key Decisions | One floating UI, high-contrast dark surface, text-first status messages, reduced host-page interference |

---

## Core Rules

### Rule 1: Keep all visual hooks namespaced

**Rule**: Every injected UI selector, animation name, and helper class must stay under the `M3Unator-` prefix or a clearly local inline style.

**Rationale**: Host pages have arbitrary CSS. Namespacing preserves isolation.

### Rule 2: Feedback must be visible in one place

**Rule**: A state change should update one primary UI surface first: toast, stat counter, or activity log, not all three at once unless the action is critical.

**Rationale**: Too much simultaneous feedback turns a simple utility into notification noise.

### Rule 3: Block the background only when necessary

**Rule**: Overlays and `body.modal-open` behavior must be enabled only while the panel is visible, then removed immediately on close.

**Rationale**: The host page remains the user’s main context. Blocking it longer than necessary feels broken.

### Rule 4: Keep controls readable and reachable

**Rule**: Buttons, toggles, and inputs must maintain visible labels, consistent spacing, and practical hit areas in both desktop mouse and touch use.

**Rationale**: The script is often used inside file indexes with cramped layouts and mixed pointer modes.

### Rule 5: Visible state must mirror scan state

**Rule**: Pause, resume, cancel, activity indicators, and counters must always match `this.state` and current scan progress.

**Rationale**: UI trust disappears when the panel claims one thing while the scanner is doing another.

---

## Approved Patterns

### Pattern: Counter update from state

**Use when**: Reflecting current scan totals or errors.

**Implementation**:
```javascript
function updateCounter(node, value) {
  node.textContent = String(value);
}
```

### Pattern: One-shot toast

**Use when**: A user needs a short, temporary status update.

**Implementation**:
```javascript
function showToast(container, message) {
  const toast = document.createElement('div');
  toast.className = 'M3Unator-toast';
  toast.textContent = message;
  container.appendChild(toast);
}
```

---

## Anti-Patterns

### 🔴 Host-page takeover
**Severity**: CRITICAL — blocks merge
**The temptation**: use generic selectors or permanent body locks.
**The danger**: the directory page becomes unusable outside the panel.
**The fix**: scope styles tightly and tear down overlays immediately.

### 🟠 State mismatch UI
**Severity**: HIGH — must fix before merge
**The temptation**: update copy or indicators separately from actual scan state.
**The danger**: users distrust pause/cancel/reporting behavior.
**The fix**: derive feedback from `this.state` and scan stats only.

---

## Performance Budgets

| Metric | Target | Hard Limit | How to Measure |
|--------|--------|------------|----------------|
| Simultaneous feedback surfaces per routine event | 1 | 2 | manual interaction review |
| Orphaned overlay/backdrop nodes after close | 0 | 0 | open/close smoke test |

## Security Checklist

- [ ] UI text from untrusted inputs uses text nodes, not HTML interpolation.
- [ ] Overlay and body locks are removed on close.
- [ ] New links use `rel="noopener noreferrer"` when opening external pages.
- [ ] Buttons and controls remain namespaced and isolated from host CSS.
- [ ] Visible copy does not overstate success or security guarantees.

## Error Scenarios

| Scenario | Detection | Recovery | User Impact | Severity |
|----------|-----------|----------|-------------|----------|
| Overlay persists after close | host page remains blocked | remove overlay and body class | page feels broken | High |
| Pause icon/state mismatch | user sees wrong indicator | sync indicator from state | confusing scan control | High |
| Toast flood on repeated errors | multiple toasts stack rapidly | collapse to one message path | noisy UI | Medium |

## Edge Cases

### Edge Case: Narrow viewport or zoomed page
**Scenario**: The floating panel opens on a small or zoomed browser viewport.
**Handling**: Center within viewport bounds and keep controls reachable without off-screen drag.
**Code**:
```javascript
const left = Math.max(0, (window.innerWidth - popup.offsetWidth) / 2);
popup.style.left = `${left}px`;
```

## Integration Points

| Relationship | Skill | Detail |
|-------------|-------|--------|
| Depends on | `userscript-patterns` | UI mount roots and teardown rules live there |
| Referenced by | `testing-strategy` | Manual UI checks validate these behaviors |
| Shares decision | `error-handling` | Toasts and logs are the visible failure surfaces |

## Pre-Commit Checklist

- [ ] UI feedback is concise and not duplicated unnecessarily.
- [ ] Overlay/body lock behavior cleans up completely.
- [ ] Controls remain readable and reachable.
- [ ] Visible state mirrors real scan state.
- [ ] External links stay safe and isolated.
