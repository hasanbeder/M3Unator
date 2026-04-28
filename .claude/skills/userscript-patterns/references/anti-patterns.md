# Anti-Patterns — Userscript Patterns

### 🔴 AP-001: Generic selectors

```javascript
document.querySelector('.modal');
```

**Why it's dangerous**: arbitrary host pages can collide with generic selectors immediately.

### 🟠 AP-002: UI state read directly in deep logic

```javascript
if (document.querySelector('#includeVideo').checked) {}
```

**Why it's dangerous**: the scan engine depends on mutable DOM instead of explicit state.

### 🟡 AP-003: Non-idempotent teardown

```javascript
document.querySelector('.M3Unator-overlay').remove();
```

**Why it's dangerous**: repeated calls can throw or leave inconsistent state when the node is already gone.
