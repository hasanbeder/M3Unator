# Pre-Commit Checklist — Data Validation

## Automated

- [ ] `node scripts/check_skill_compliance.js --file M3Unator.user.js` passes

## Manual Review

- [ ] Playlist names sanitize to a safe fallback
- [ ] Numeric inputs are clamped
- [ ] Href filters reject unsupported scan targets
- [ ] Raw DOM values are converted once at the boundary
- [ ] Decode failures do not crash the scan
