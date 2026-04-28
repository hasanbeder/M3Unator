# Pre-Commit Checklist — Release Distribution

## Automated

- [ ] `node scripts/validate_bootstrap.js .claude/skills/` passes
- [ ] `node scripts/version_checker.js .claude/skills/` passes

## Manual Review

- [ ] Version numbers match across runtime, metadata, and changelog
- [ ] Raw GitHub URLs are correct
- [ ] Compatibility claims were re-verified
- [ ] Release smoke covered intended browser/manager paths
- [ ] Notes describe shipped behavior only
