# Approved Patterns — Testing Strategy

### Pattern: Structural validation first

```bash
node scripts/validate_bootstrap.js .claude/skills/
node scripts/version_checker.js .claude/skills/
node scripts/check_skill_compliance.js --file M3Unator.user.js
```

### Pattern: Runtime smoke notes

```markdown
Browsers:
- Chrome stable
- Firefox stable

Server types:
- Apache/Nginx-style listing
- LiteSpeed listing
```
