# Approved Patterns — Project Manager

### Pattern: Enforce before commit

```bash
node scripts/validate_bootstrap.js .claude/skills/
node scripts/version_checker.js .claude/skills/
node scripts/check_skill_compliance.js --file M3Unator.user.js
```

### Pattern: Review with explicit skill scope

```markdown
Checked against:
- security-hardening
- directory-scanning-engine
- testing-strategy
```
