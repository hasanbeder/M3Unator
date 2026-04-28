# Approved Patterns — Data Validation

### Pattern: Safe filename fallback

```javascript
function normalizePlaylistName(value) {
  const cleaned = value.replace(/[<>:"/\\|?*\x00-\x1F]/g, '').trim();
  return cleaned || 'playlist';
}
```

### Pattern: Scan candidate filter

```javascript
function isCandidateHref(href) {
  return Boolean(href) && href !== '../' && !href.startsWith('?') && !href.startsWith('/');
}
```
