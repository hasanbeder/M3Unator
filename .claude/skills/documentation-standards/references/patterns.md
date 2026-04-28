# Approved Patterns — Documentation Standards

### Pattern: Root doc plus manual test update

```markdown
README.md
- Add new control description under Usage

tests/manual_testing_guide.md
- Add validation steps for the new control in Chrome and Firefox
```

### Pattern: Focused changelog entry

```markdown
### Fixed

- Reduced duplicate scan retries on malformed links
- Clarified LiteSpeed manual verification steps
```

**Gotchas**:
- Do not bury user-visible changes inside `DEVELOPMENT.md`
- Do not put contributor-only notes in `CHANGELOG.md`
