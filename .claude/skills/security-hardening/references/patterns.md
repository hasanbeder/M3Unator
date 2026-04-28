# Approved Patterns — Security Hardening

### Pattern: Safe protocol gate

```javascript
function toSafeUrl(href, baseUrl) {
  const absolute = new URL(href, baseUrl);
  if (!['http:', 'https:'].includes(absolute.protocol)) return null;
  return absolute.toString();
}
```

### Pattern: Text-only log rendering

```javascript
function appendLog(container, message) {
  const line = document.createElement('div');
  line.textContent = message;
  container.appendChild(line);
}
```
