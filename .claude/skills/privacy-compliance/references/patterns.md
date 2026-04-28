# Approved Patterns — Privacy Compliance

### Pattern: Memory-only session reset

```javascript
function resetSession() {
  this.entries = [];
  this.seenUrls = new Set();
  this.logCache.clear();
}
```

### Pattern: Redaction reminder in bug reports

```markdown
Before posting logs or screenshots, remove private hostnames, folder names, and access tokens.
```
