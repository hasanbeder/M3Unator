# Anti-Patterns — Project Architecture

## Severity Guide

- 🔴 CRITICAL: breaks installability or release integrity
- 🟠 HIGH: hides important change scope
- 🟡 MEDIUM: raises maintenance cost

### 🔴 AP-001: Unbundled runtime imports

```javascript
import { helper } from './helper.js';
```

**Why it's dangerous**: raw userscript distribution cannot execute repo-local imports.

**Fix**:
```javascript
function helper() {
  return true;
}
```

### 🟠 AP-002: Metadata changed alone

```javascript
// M3Unator.meta.js version bumped, M3Unator.user.js unchanged
```

**Why it's dangerous**: users receive mismatched update metadata and cannot trust release state.

### 🟡 AP-003: Docs mixed with runtime code

```javascript
// 200 lines of contributor notes inside init()
```

**Why it's dangerous**: reviewers lose the actual runtime diff and future edits become slower.
