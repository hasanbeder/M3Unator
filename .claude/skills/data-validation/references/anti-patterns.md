# Anti-Patterns — Data Validation

### 🔴 AP-001: Raw input used in export path

```javascript
const filename = playlistInput.value;
```

**Why it's dangerous**: illegal or confusing characters propagate directly into the downloaded file name.

### 🟠 AP-002: Unchecked href recursion

```javascript
await this.scanDirectory(href);
```

**Why it's dangerous**: malformed or parent-directory links can create loops and bad results.

### 🟡 AP-003: Re-reading DOM form values in deep logic

```javascript
if (document.querySelector('#includeVideo').checked) {}
```

**Why it's dangerous**: internal logic becomes coupled to mutable DOM state.
