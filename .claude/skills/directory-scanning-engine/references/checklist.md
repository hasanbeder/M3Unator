# Pre-Commit Checklist — Directory Scanning Engine

## Automated

- [ ] `node scripts/check_skill_compliance.js --file M3Unator.user.js` passes

## Manual Review

- [ ] Generic and LiteSpeed parsing remain explicit
- [ ] Hrefs are filtered and normalized
- [ ] Recursive scans dedupe by normalized URL
- [ ] File and directory candidates split early
- [ ] Exported titles remain readable
