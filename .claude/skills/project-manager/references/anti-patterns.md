# Anti-Patterns — Project Manager

### 🔴 AP-001: Implement first, validate never

No skills consulted, no validators run.

**Why it's dangerous**: the entire suite becomes inert documentation.

### 🟠 AP-002: Partial enforcement

Only one validator is run even though skill and runtime files both changed.

**Why it's dangerous**: drift hides in the unchecked layer.

### 🟡 AP-003: Unexplained skipped checks

Checks were skipped but not documented.

**Why it's dangerous**: reviewers cannot judge residual risk.
