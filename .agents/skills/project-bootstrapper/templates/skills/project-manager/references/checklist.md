# Pre-Commit Checklist — Project Manager

Run through EVERY item before committing code to ensure skill compliance.

---

## Automated Checks (Must Pass in CI)

- [ ] **Skill Validation**: `python scripts/validate_bootstrap.py .claude/skills/` — zero errors
- [ ] **Version Check**: `python scripts/version_checker.py .claude/skills/` — all versions verified
- [ ] **Skill Compliance**: `python scripts/check_skill_compliance.py --staged` — no violations
- [ ] **Type Check**: `npm run typecheck` (or language equivalent) — passes
- [ ] **Lint**: `npm run lint` — zero errors, zero warnings
- [ ] **Tests**: `npm run test:ci` — passes, coverage maintained
- [ ] **Build**: `npm run build` — succeeds without errors

---

## Skill Reading Verification

### Before Starting Task
- [ ] Identified which files will be modified
- [ ] Listed all relevant skills for those files
- [ ] Read each skill's SKILL.md completely
- [ ] Read references/patterns.md for each skill
- [ ] Read references/anti-patterns.md for each skill
- [ ] Noted any recent skill updates

### During Implementation
- [ ] Referenced skills while coding
- [ ] Checked code against skill examples
- [ ] Verified no anti-patterns used
- [ ] Added skill references in comments where non-obvious

---

## Per-File Compliance

### For TypeScript/JavaScript Files
**Check against**: `typescript-standards`, `error-handling`

- [ ] No `any` types (unless explicitly justified)
- [ ] Explicit return types on exported functions
- [ ] Proper error handling with custom error types
- [ ] No console.log in production code
- [ ] Proper async/await patterns
- [ ] No deprecated APIs

### For API Routes
**Check against**: `api-design`, `security-hardening`, `auth-patterns`

- [ ] Input validation using specified library (Zod/Pydantic/etc.)
- [ ] Authentication check present
- [ ] Authorization check present
- [ ] Rate limiting applied
- [ ] Proper error responses (not stack traces)
- [ ] No sensitive data in logs
- [ ] SQL injection prevention (parameterized queries)

### For Database Code
**Check against**: `database-design`, `security-hardening`, `privacy-compliance`

- [ ] Using parameterized queries/ORM
- [ ] Proper index usage
- [ ] No N+1 queries
- [ ] PII properly handled (encrypted/anonymized)
- [ ] Soft delete if applicable
- [ ] Migration follows naming convention
- [ ] Transaction used for multi-step operations

### For UI Components
**Check against**: `ui-engineering`, `accessibility-standards`, `testing-strategy`

- [ ] Semantic HTML elements used
- [ ] ARIA labels where needed
- [ ] Keyboard navigation works
- [ ] Color contrast sufficient (4.5:1)
- [ ] Loading states handled
- [ ] Error states handled
- [ ] Tests written (unit + accessibility)

### For Test Files
**Check against**: `testing-strategy`

- [ ] Test file naming follows convention
- [ ] Tests are independent (no shared state)
- [ ] Proper mocking (don't mock what's being tested)
- [ ] Test data uses factories/fixtures
- [ ] No skipped tests without reason
- [ ] Coverage maintained or improved

### For Configuration Files
**Check against**: `security-hardening`, `devops-pipeline`

- [ ] No secrets in code (env vars only)
- [ ] Secrets not logged
- [ ] Proper CORS configuration
- [ ] Security headers set
- [ ] CI/CD pipeline steps documented

---

## Security Verification

### Input Handling
- [ ] All user inputs validated
- [ ] All inputs sanitized
- [ ] File uploads validated (type, size, content)
- [ ] URL parameters validated
- [ ] Query parameters validated
- [ ] Request body validated against schema

### Output Handling
- [ ] HTML properly escaped (XSS prevention)
- [ ] JSON properly serialized
- [ ] Error messages don't leak internals
- [ ] No sensitive data in responses

### Authentication & Authorization
- [ ] JWT in httpOnly cookies (not localStorage)
- [ ] Tokens have expiration
- [ ] Refresh token rotation implemented
- [ ] Permission checks on all protected routes
- [ ] Role-based access control enforced

### Dependencies
- [ ] New dependencies approved by skill
- [ ] No known vulnerabilities (`npm audit`)
- [ ] License compatible
- [ ] Version pinned

---

## Performance Verification

- [ ] No N+1 queries detected
- [ ] Database queries < 100ms (p95)
- [ ] API responses < 200ms (p95)
- [ ] Bundle size impact acceptable
- [ ] Images optimized
- [ ] No unnecessary re-renders (React)
- [ ] Lazy loading used where appropriate

---

## Privacy Verification

- [ ] No PII in logs
- [ ] No PII in error messages
- [ ] No PII in URLs
- [ ] Data minimization practiced
- [ ] Consent obtained where required
- [ ] Retention policies followed

---

## Documentation Verification

- [ ] Public functions have JSDoc/docstrings
- [ ] Complex logic has inline comments explaining WHY
- [ ] README updated if behavior changed
- [ ] API documentation updated
- [ ] Changelog updated for breaking changes
- [ ] Architecture Decision Record if significant change

---

## Git Workflow Verification

- [ ] Commit message follows convention
- [ ] Branch naming follows convention
- [ ] Commit is atomic (one concern)
- [ ] No commented-out code
- [ ] No debug code left behind
- [ ] No `console.log` or `print` statements
- [ ] `.only` removed from tests

---

## Pre-Push Verification

- [ ] All pre-commit checks pass
- [ ] Full test suite passes locally
- [ ] Integration tests pass
- [ ] E2E tests pass (if applicable)
- [ ] No merge conflicts
- [ ] PR description filled out
- [ ] Related issue linked

---

## Emergency Bypass Protocol

⚠️ **Only use in true emergencies with approval**

If you MUST bypass checks:

1. **Document the reason**:
   ```bash
   git commit -m "HOTFIX: Emergency security patch
   
   Bypasses: pre-commit hooks (emergency)
   Reason: Critical security vulnerability needs immediate fix
   Approval: @tech-lead via Slack
   Ticket: SEC-1234
   
   Will follow up with proper refactoring in #567"
   ```

2. **Create follow-up ticket immediately**

3. **Schedule refactoring within 24 hours**

4. **Never make bypass a habit**

---

## Quick Reference

### Commands to Run

```bash
# Full validation
python scripts/validate_bootstrap.py .claude/skills/
python scripts/version_checker.py .claude/skills/
python scripts/check_skill_compliance.py --staged

# Language-specific
npm run typecheck
npm run lint
npm run test:ci
npm run build

# Security
npm audit
python scripts/security_scan.py

# Performance
npm run lighthouse:ci
python scripts/performance_check.py
```

### When in Doubt

1. **Re-read the skill** — You probably missed something
2. **Check examples** — See how it's done correctly
3. **Ask for review** — Better safe than sorry
4. **Don't commit** — Fix it first

### Skill Files Location

```
.claude/skills/
├── project-architecture/
├── typescript-standards/
├── security-hardening/
├── error-handling/
├── database-design/
├── api-design/
└── ... (all active skills)
```

---

## Reminder

**This checklist is not optional.**

Every item exists because skipping it has caused problems in the past.

When you think "I'll skip this just once" — remember: that's how technical debt starts.

**Do it right. Do it once.**
