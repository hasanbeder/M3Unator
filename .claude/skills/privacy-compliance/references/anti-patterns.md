# Anti-Patterns — Privacy Compliance

### 🔴 AP-001: Hidden usage beacon

```javascript
fetch('https://analytics.example.com/ping', { method: 'POST' });
```

**Why it's dangerous**: it sends browsing-derived information away from the user’s device.

### 🟠 AP-002: Persistent scan cache

```javascript
localStorage.setItem('seenUrls', JSON.stringify([...this.seenUrls]));
```

**Why it's dangerous**: it preserves browsing context beyond the session for no approved reason.

### 🟡 AP-003: Unredacted support screenshot

Public screenshots reveal personal directory names.

**Why it's dangerous**: repository artifacts can expose user browsing content permanently.
