# Anti-Patterns — Dependency Management

### 🔴 AP-001: Remote runtime code dependency

```javascript
// @require https://cdn.example.com/helper.js
```

**Why it's dangerous**: shipped behavior now depends on third-party code outside the repo.

### 🟠 AP-002: Silent external asset expansion

```css
@import url('https://fonts.example.com/new-font.css');
```

**Why it's dangerous**: it adds performance, privacy, and availability cost without review.

### 🟡 AP-003: Tooling mixed into runtime

```javascript
// validator logic pasted into M3Unator.user.js
```

**Why it's dangerous**: contributor helpers should never bloat the shipped userscript.
