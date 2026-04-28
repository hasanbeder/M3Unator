# Approved Patterns — JavaScript Standards

## Normalization Helpers

### Pattern: Safe decode helper

**Context**: Directory listings often contain mixed URL and HTML encoding.

```javascript
function decodeString(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
```

**Testing this pattern**:
```javascript
console.assert(decodeString('album%20name') === 'album name');
console.assert(decodeString('%E0%A4%A') === '%E0%A4%A');
```

## Batch Processing

### Pattern: Promise batch gate

**Context**: Limit fan-out while still using parallel file processing.

```javascript
async function runBatch(items, worker, size = 20) {
  for (let i = 0; i < items.length; i += size) {
    await Promise.all(items.slice(i, i + size).map(worker));
  }
}
```
