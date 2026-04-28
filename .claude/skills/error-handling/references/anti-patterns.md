# Anti-Patterns — Error Handling

### 🔴 AP-001: Silent catch

```javascript
try {
  risky();
} catch (error) {}
```

**Why it's dangerous**: the scan state may already be wrong and there is no diagnostic trail.

### 🟠 AP-002: Raw exception in UI

```javascript
showToast(error.stack, 'error');
```

**Why it's dangerous**: users see internals instead of a recovery path.

### 🟡 AP-003: Crash on one bad child directory

```javascript
await Promise.all(directories.map((dir) => this.scanDirectory(dir)));
```

**Why it's dangerous**: one failure can abort unrelated work if no boundary recovery exists.
