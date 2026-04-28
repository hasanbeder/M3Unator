# Anti-Patterns — Testing Strategy

### 🔴 AP-001: No runtime smoke after scan change

Only structural scripts were run for a parser or recursion change.

**Why it's dangerous**: host-page differences are the core runtime risk.

### 🟠 AP-002: Bug fix without guide update

```markdown
No change to tests/manual_testing_guide.md
```

**Why it's dangerous**: manual QA does not learn from escaped regressions.

### 🟡 AP-003: Single-browser confidence

Only one browser was checked before release.

**Why it's dangerous**: userscript manager behavior differs across environments.
