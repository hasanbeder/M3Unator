# Anti-Patterns — Directory Scanning Engine

### 🔴 AP-001: Recursing before dedupe

```javascript
await this.scanDirectory(fullUrl, fullPath, depth + 1);
```

**Why it's dangerous**: duplicate links or loop-like listings can explode traversal immediately.

### 🟠 AP-002: Single fragile parser

```javascript
const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
```

**Why it's dangerous**: it ignores server-specific structure and breaks easily on markup variation.

### 🟡 AP-003: Raw encoded title export

```javascript
entries.push({ title: href, url: fullUrl });
```

**Why it's dangerous**: exported playlists become hard to read and inconsistent across encodings.
