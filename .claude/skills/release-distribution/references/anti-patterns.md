# Anti-Patterns — Release Distribution

### 🔴 AP-001: Publish with mismatched version surfaces

```markdown
M3Unator.user.js = 1.0.3
M3Unator.meta.js = 1.0.2
```

**Why it's dangerous**: install/update behavior becomes untrustworthy.

### 🟠 AP-002: Stale compatibility text

README claims support without checking current stable browsers or managers.

**Why it's dangerous**: users make install decisions on outdated information.

### 🟡 AP-003: Release notes describe branch intent, not shipped reality

**Why it's dangerous**: users and maintainers cannot trust the changelog as a release contract.
