# Anti-Patterns — UI Engineering

### 🔴 AP-001: Permanent body lock

```javascript
document.body.classList.add('modal-open');
```

**Why it's dangerous**: if cleanup fails, the host page stays blocked until refresh.

### 🟠 AP-002: Generic class names

```javascript
toast.className = 'toast';
```

**Why it's dangerous**: host-page CSS may restyle or break the UI.

### 🟡 AP-003: Triple-feedback spam

One minor event triggers a toast, log line, and modal text update simultaneously.

**Why it's dangerous**: the UI becomes noisy instead of helpful.
