# Pre-Commit Checklist — Testing Strategy

## Automated

- [ ] `node scripts/validate_bootstrap.js .claude/skills/` passes
- [ ] `node scripts/version_checker.js .claude/skills/` passes
- [ ] `node scripts/check_skill_compliance.js --file M3Unator.user.js` passes or findings are reviewed

## Manual Review

- [ ] Relevant directory listing variants were checked
- [ ] UI state transitions were tested if affected
- [ ] Release-facing changes considered Chrome and Firefox smoke
- [ ] Manual guide learned from new bug classes
