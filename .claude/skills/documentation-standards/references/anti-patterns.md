# Anti-Patterns — Documentation Standards

### 🔴 AP-001: Claims not backed by code

```markdown
M3Unator guarantees perfect compatibility with every web server.
```

**Why it's dangerous**: it overpromises behavior the code cannot verify.

### 🟠 AP-002: Feature merged without README update

```markdown
No README changes for a new UI control.
```

**Why it's dangerous**: users cannot discover the feature and support burden rises.

### 🟡 AP-003: Changelog as commit dump

```markdown
- renamed variable
- moved function
- adjusted whitespace
```

**Why it's dangerous**: users learn nothing about release impact.
