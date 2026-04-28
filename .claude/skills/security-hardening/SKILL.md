---
name: security-hardening
description: |
  Enforces browser-side security rules for M3Unator across userscript metadata, DOM injection, directory parsing, URL handling, and release distribution. Trigger this skill for any change to fetch logic, HTML parsing, UI templating, metadata grants, external links, or installation instructions. Without it, the project can overreach permissions, trust hostile directory listings, or turn untrusted text into executable markup.
---

# Security Hardening

> Treat every directory listing as hostile input and every userscript permission as a security contract.

## Activation

This skill activates when:
- Editing `M3Unator.user.js` or `M3Unator.meta.js`.
- Changing `@match`, `@grant`, fetch behavior, HTML parsing, or UI templating.
- Updating install, release, or security documentation.

## Project Context

| Key | Value |
|-----|-------|
| Project | M3Unator |
| Runtime | Browser userscript on arbitrary directory listing pages |
| Relevant Stack | Metadata grants, `fetch`, `DOMParser`, `innerHTML`, raw GitHub update URLs |
| Key Decisions | Minimum grants, no credential collection, no dynamic code execution, no remote script imports |

---

## Core Rules

### Rule 1: Keep userscript permissions minimal

**Rule**: New `@grant`, `@require`, `@connect`, or broader `@match` directives are forbidden unless the change is essential and documented.

**Rationale**: Userscript permissions define the project’s blast radius. Unnecessary scope expansion raises user risk immediately.

### Rule 2: Never execute untrusted content

**Rule**: Directory listing HTML, URLs, filenames, and user input must never flow into `eval`, `new Function`, event-handler attributes, or string-built timers.

**Rationale**: M3Unator runs on arbitrary servers. Any dynamic execution path becomes a trivial code injection vector.

### Rule 3: Keep template markup static

**Rule**: `innerHTML` is allowed only for static, code-authored templates; untrusted directory or input text must be assigned through `textContent` or sanitized attributes.

**Rationale**: The current UI is template-heavy. Static markup is manageable, but mixing runtime strings into HTML will create XSS risk on hostile directory pages.

**Correct** ✅:
```javascript
const entry = document.createElement('div');
entry.textContent = fileName;
```

**Incorrect** ❌:
```javascript
log.innerHTML += `<div>${fileName}</div>`;
// -> Consequence: hostile filenames can inject markup into the panel.
```

### Rule 4: Only follow safe, normalized URLs

**Rule**: Every discovered link must be resolved with `new URL(...)`, normalized, and filtered before recursive scanning.

**Rationale**: Directory listings may contain odd relative links, parent traversals, query links, or malformed paths that can cause loops or unsafe navigation.

### Rule 5: Never add telemetry or credential storage

**Rule**: The userscript must not transmit browsing data to third parties or persist auth tokens, cookies, or personal data in storage.

**Rationale**: The project promise is local-only playlist generation. Telemetry or token storage would violate that trust boundary.

---

## Approved Patterns

### Pattern: Static UI shell plus text nodes

**Use when**: Displaying scan results or logs from server-derived strings.

**Implementation**:
```javascript
const row = document.createElement('div');
row.className = 'M3Unator-log-entry';
row.textContent = `${type.toUpperCase()}: ${message}`;
scanLog.appendChild(row);
```

### Pattern: Safe discovered URL resolution

**Use when**: Converting href values from directory listings into scan candidates.

**Implementation**:
```javascript
function toAbsoluteHref(href, baseUrl) {
  if (!href || href.startsWith('?') || href === '../') return null;
  return new URL(href, baseUrl).toString();
}
```

---

## Anti-Patterns

### 🔴 Remote runtime dependency
**Severity**: CRITICAL — merge blocked
**The temptation**: add `@require` or a remote script for speed.
**The danger**: the runtime trust boundary expands to code you do not ship or review locally.
**The fix**: keep logic inside the audited userscript payload.

### 🔴 Untrusted HTML interpolation
**Severity**: CRITICAL — merge blocked
**The temptation**: drop filenames or server text into `innerHTML`.
**The danger**: hostile directory listings can inject active markup.
**The fix**: use `textContent` and explicit attributes.

### 🟠 Permission creep
**Severity**: HIGH — must fix before merge
**The temptation**: widen `@match` or add storage/network grants preemptively.
**The danger**: install-time trust no longer matches actual need.
**The fix**: keep metadata minimal and documented.

---

## Performance Budgets

| Metric | Target | Hard Limit | How to Measure |
|--------|--------|------------|----------------|
| Added metadata grants per feature | 0 | 1 without documented need | review header block |
| Untrusted strings inserted via HTML APIs | 0 | 0 | grep diff for `innerHTML` plus dynamic interpolation |

## Security Checklist

- [ ] No new `@grant`, `@require`, or broader `@match` without explicit justification.
- [ ] No untrusted text is interpolated into `innerHTML`.
- [ ] URL candidates are normalized and filtered before recursion.
- [ ] No tokens, cookies, or personal browsing data are persisted.
- [ ] Update/install URLs still point to trusted GitHub raw sources only.

## Error Scenarios

| Scenario | Detection | Recovery | User Impact | Severity |
|----------|-----------|----------|-------------|----------|
| Malicious filename rendered as HTML | Review or UI glitch | Replace with `textContent` path | UI compromise risk | Critical |
| Permission creep in metadata | Diff on userscript header | Remove unnecessary grant | Overbroad install permissions | High |
| Recursive scan follows malformed link | Loop or repeated error entries | tighten href filter | Slow or broken scans | High |

## Edge Cases

### Edge Case: Hostile directory includes JavaScript pseudo-link
**Scenario**: A listing exposes `javascript:` or malformed URLs.
**Handling**: Reject unsupported protocols before recursion or playlist export.
**Code**:
```javascript
function isSafeProtocol(url) {
  return url.protocol === 'http:' || url.protocol === 'https:';
}
```

## Integration Points

| Relationship | Skill | Detail |
|-------------|-------|--------|
| Depends on | `data-validation` | Boundary normalization supports safe filtering |
| Referenced by | `userscript-patterns` | UI templating must follow static-markup rules |
| Shares decision | `privacy-compliance` | No telemetry or credential storage anywhere |

## Pre-Commit Checklist

- [ ] Userscript header permissions still match real behavior.
- [ ] No dynamic code execution path was introduced.
- [ ] Untrusted strings are rendered safely.
- [ ] Discovered URLs are filtered and normalized before use.
- [ ] Public docs still describe the actual privacy/security posture.
