# Pre-Commit Checklist — Project Manager

## Automated

- [ ] `node scripts/validate_bootstrap.js .claude/skills/` passes
- [ ] `node scripts/version_checker.js .claude/skills/` passes
- [ ] `node scripts/check_skill_compliance.js --file M3Unator.user.js` passes or findings are documented

## Manual Review

- [ ] Relevant skills were identified before editing
- [ ] Validator output is recorded or summarized
- [ ] Release tasks include synced metadata and changelog evidence
- [ ] Any skipped checks are explained
