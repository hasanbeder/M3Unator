# Pre-Commit Checklist — Dependency Management

## Automated

- [ ] `node scripts/validate_bootstrap.js .claude/skills/` passes

## Manual Review

- [ ] No new runtime libraries or `@require` directives were added
- [ ] External assets are intentional and documented
- [ ] Tooling stays under `scripts/`
- [ ] Trusted release/install URLs remain intact
- [ ] Toolchain notes are current in documentation
