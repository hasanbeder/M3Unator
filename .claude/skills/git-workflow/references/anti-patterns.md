# Anti-Patterns — Git Workflow

### 🔴 AP-001: Version bump in one file only

```bash
git add M3Unator.user.js
git commit -m "bump version"
```

**Why it's dangerous**: auto-update metadata and changelog become inaccurate immediately.

### 🟠 AP-002: Runtime change hidden in docs branch

```bash
git checkout -b docs/readme-cleanup
```

**Why it's dangerous**: branch names mislead reviewers about risk.

### 🟡 AP-003: Unexplained manual QA

Manual tests were run but not described in the PR.

**Why it's dangerous**: reviewers cannot tell whether Apache, Nginx, or LiteSpeed behavior was checked.
