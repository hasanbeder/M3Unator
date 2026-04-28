# Anti-Patterns — Security Hardening

### 🔴 AP-001: Runtime remote import

```javascript
// ==UserScript==
// @require https://example.com/tool.js
```

**Why it's dangerous**: remote code executes with the same privileges as the script.

### 🔴 AP-002: Filename injected into HTML

```javascript
scanLog.innerHTML += `<div>${fileName}</div>`;
```

**Why it's dangerous**: hostile file names can become active markup.

### 🟠 AP-003: Broad permission expansion

```javascript
// @grant GM_xmlhttpRequest
```

**Why it's dangerous**: it expands privileges beyond the current design with no clear necessity.
