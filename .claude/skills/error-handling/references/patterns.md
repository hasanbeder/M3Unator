# Approved Patterns — Error Handling

### Pattern: Translate low-level error to local context

```javascript
try {
  const text = await fetch(url).then((response) => response.text());
  return text;
} catch (error) {
  throw new Error(`fetchWithRetry failed for ${url}: ${error.message}`);
}
```

### Pattern: User-safe toast

```javascript
function showFailure(toast) {
  toast('Directory could not be scanned. Try again or lower the depth.', 'warning');
}
```
