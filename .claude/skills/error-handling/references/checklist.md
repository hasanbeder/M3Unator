# Pre-Commit Checklist — Error Handling

## Automated

- [ ] `node scripts/check_skill_compliance.js --file M3Unator.user.js` passes

## Manual Review

- [ ] Failures are caught at UI or scan boundaries
- [ ] Toasts contain actionable wording
- [ ] Activity log has one meaningful entry per failure
- [ ] Cancel and pause flows remain clean
- [ ] Partial failure recovery is used where safe
