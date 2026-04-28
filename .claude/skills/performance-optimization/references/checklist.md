# Pre-Commit Checklist — Performance Optimization

## Automated

- [ ] `node scripts/check_skill_compliance.js --file M3Unator.user.js` passes

## Manual Review

- [ ] Concurrency remains bounded
- [ ] UI updates are coalesced
- [ ] Cache limits still exist
- [ ] Hot-path lookups stay constant-time
- [ ] Retry logic avoids permanent-failure storms
