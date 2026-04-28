# Approved Patterns — Git Workflow

### Pattern: Atomic runtime fix

```bash
git checkout -b fix/litespeed-link-filter
git add M3Unator.user.js tests/manual_testing_guide.md
git commit -m "fix(scan): tighten LiteSpeed link filtering"
```

**Why it works**:
- Runtime change and validation note ship together
- Metadata stays untouched because version is unchanged

### Pattern: Release sync commit

```bash
git add M3Unator.user.js M3Unator.meta.js CHANGELOG.md
git commit -m "fix(release): publish 1.0.3"
```
