# Pre-Commit Checklist — Security Hardening

## Automated

- [ ] `node scripts/check_skill_compliance.js --file M3Unator.user.js` passes

## Manual Review

- [ ] Metadata grants remain minimal
- [ ] No untrusted strings are inserted into HTML markup
- [ ] Only `http:` and `https:` links are followed
- [ ] No telemetry or credential persistence was added
- [ ] Install/update URLs remain trusted
