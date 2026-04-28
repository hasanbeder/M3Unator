# Example: TypeScript + Next.js Project

This example demonstrates a complete skill suite generated for a modern TypeScript/Next.js web application.

## Project Details

- **Name**: SaaS Dashboard Platform
- **Type**: Full-stack web application
- **Tech Stack**:
  - TypeScript 5.7.3
  - Next.js 16.1.0 (App Router)
  - React 19.0.0
  - PostgreSQL 17.2
  - Drizzle ORM 0.40.0
  - Tailwind CSS 4.0.0
  - Zod 3.24.0

## Generated Skills

### Tier 1 — Core (11 skills)
1. `project-architecture` — Folder structure, module boundaries
2. `typescript-standards` — Strict TS config, type safety rules
3. `security-hardening` — XSS, CSRF, CSP, secrets management
4. `error-handling` — AppError hierarchy, error boundaries
5. `data-validation` — Zod schemas, input sanitization
6. `testing-strategy` — Vitest, Playwright, coverage 80%+
7. `performance-optimization` — LCP <2.5s, bundle budgets
8. `git-workflow` — Conventional commits, trunk-based
9. `documentation-standards` — JSDoc, ADRs, changelogs
10. `privacy-compliance` — GDPR, PII handling, consent
11. `dependency-management` — Lockfiles, audit, updates

### Tier 2 — Data & API (4 skills)
12. `database-design` — Schema, migrations, indexing
13. `api-design` — REST conventions, pagination, rate limiting
14. `auth-patterns` — NextAuth, sessions, RBAC
15. `caching-strategy` — SWR, Redis, CDN

### Tier 3 — Frontend (4 skills)
16. `nextjs-patterns` — App Router, Server Components
17. `ui-engineering` — Tailwind, shadcn/ui, responsive
18. `state-management` — Server state (SWR), URL state
19. `accessibility-standards` — WCAG 2.2 AA, keyboard nav

### Tier 4 — Operations (3 skills)
20. `devops-pipeline` — GitHub Actions, Vercel deploy
21. `observability` — Vercel Analytics, structured logs
22. `internationalization` — i18n, RTL, formatters

## Directory Structure

```
.claude/skills/
├── project-architecture/
│   ├── SKILL.md
│   └── references/
│       ├── patterns.md
│       ├── anti-patterns.md
│       └── checklist.md
├── typescript-standards/
│   ├── SKILL.md
│   ├── references/
│   └── templates/
│       └── tsconfig.template.json
├── nextjs-patterns/
│   ├── SKILL.md
│   └── references/
├── ... (all 22 skills)
└── _bootstrap-manifest.json
```

## Key Features

### Version Verification
All versions verified on 2026-03-09:
- Node.js 22.14.0 LTS
- TypeScript 5.7.3
- Next.js 16.1.0
- React 19.0.0

### Security Highlights
- CSP headers configured
- CSRF tokens on all mutations
- XSS prevention via escaping
- Secrets in env vars only
- Dependency audit in CI

### Performance Budgets
- LCP: < 2.0s (target), < 2.5s (hard limit)
- JS bundle initial: < 80KB gzipped
- Total page weight: < 500KB

## Running Validation

```bash
# Validate all skills
python ../../scripts/validate_bootstrap.py .claude/skills/

# Check versions
python ../../scripts/version_checker.py .claude/skills/

# Check manifest
python ../../scripts/version_checker.py --check-manifest .claude/skills/_bootstrap-manifest.json
```

## Next Steps

1. Review each generated skill
2. Customize project-specific paths and names
3. Add any missing domain-specific skills
4. Start writing application code

---

**Note**: This is an example structure. Generate actual skills using the bootstrapper for your real project.
