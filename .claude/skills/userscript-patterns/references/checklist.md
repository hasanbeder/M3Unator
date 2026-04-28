# Pre-Commit Checklist — Userscript Patterns

## Automated

- [ ] `node scripts/check_skill_compliance.js --file M3Unator.user.js` passes

## Manual Review

- [ ] Early page gate still works
- [ ] Only one launcher and one root container are created
- [ ] All selectors remain namespaced
- [ ] Reset/close removes overlays cleanly
- [ ] Internal state remains the source of truth
