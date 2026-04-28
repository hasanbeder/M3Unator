# Approved Patterns — Performance Optimization

### Pattern: Seen URL dedupe

```javascript
if (this.seenUrls.has(url)) return;
this.seenUrls.add(url);
```

### Pattern: Bounded active request set

```javascript
const active = new Set();
if (active.size > 0) await Promise.race(active);
```
