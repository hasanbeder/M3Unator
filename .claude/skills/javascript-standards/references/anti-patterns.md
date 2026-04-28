# Anti-Patterns — JavaScript Standards

### 🔴 AP-001: Runtime evaluation

```javascript
eval(userSuppliedCode);
```

**Why it's dangerous**: userscript code executes in a sensitive browser context and must never evaluate arbitrary strings.

### 🟠 AP-002: Function-scoped declarations

```javascript
var seen = [];
```

**Why it's dangerous**: `var` makes later refactors and nested callback behavior harder to reason about.

### 🟡 AP-003: Promise chain soup

```javascript
fetch(url).then(a).then(b).then(c);
```

**Why it's dangerous**: it hides failure boundaries and pause/cancel behavior in the scan pipeline.
