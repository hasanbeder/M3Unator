# Pre-Commit Checklist — Project Architecture

## Automated

- [ ] `node scripts/validate_bootstrap.js .claude/skills/` passes

## Manual Review

- [ ] `M3Unator.user.js` is still the only shipped runtime artifact
- [ ] `M3Unator.meta.js` matches release-facing metadata
- [ ] New tooling stays under `scripts/`
- [ ] Docs remain in root markdown files or `wiki/`
- [ ] Test notes remain in `tests/`
