# Pre-Commit Checklist — JavaScript Standards

## Automated

- [ ] `node scripts/check_skill_compliance.js --file M3Unator.user.js` passes

## Manual Review

- [ ] No `var`, `eval`, or `new Function`
- [ ] Async work uses explicit `async`/`await`
- [ ] `Map`/`Set` are used where lookups need stability
- [ ] New helpers are named and reusable
- [ ] Raw user or server strings are normalized at boundaries
