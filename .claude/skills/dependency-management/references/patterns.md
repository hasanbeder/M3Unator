# Approved Patterns — Dependency Management

### Pattern: Native browser capability first

```javascript
const doc = new DOMParser().parseFromString(html, 'text/html');
const absolute = new URL(href, baseUrl);
```

### Pattern: Local contributor tooling

```bash
node scripts/validate_bootstrap.js .claude/skills/
node scripts/check_skill_compliance.js --file M3Unator.user.js
```
