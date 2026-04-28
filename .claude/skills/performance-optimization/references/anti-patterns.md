# Anti-Patterns — Performance Optimization

### 🔴 AP-001: Unbounded Promise fan-out

```javascript
await Promise.all(directories.map((dir) => this.scanDirectory(dir)));
```

**Why it's dangerous**: unknown directory trees can overwhelm browser and network resources immediately.

### 🟠 AP-002: DOM update on every file

```javascript
this.addLogEntry(fileName, 'info');
```

**Why it's dangerous**: the page can freeze from UI churn before the scan itself is done.

### 🟡 AP-003: Cache without a cap

```javascript
this.seenUrls.add(url);
```

**Why it's dangerous**: long-running sessions can grow memory indefinitely.
