# Example: Minimal Project

A lightweight skill suite for a simple project — demonstrates the essentials without complexity.

## Project Details

- **Name**: Personal Blog
- **Type**: Static website
- **Tech Stack**:
  - TypeScript 5.7.3
  - Astro 5.3.0
  - Tailwind CSS 4.0.0
  - Markdown (content)
  - Vercel (hosting)

## Generated Skills (Minimal Set)

### Essential Skills Only (7 skills)

Instead of 20+ skills, this minimal project uses only the essentials:

1. **`project-architecture`**
   - Simple folder structure
   - Content vs components separation
   - Static export configuration

2. **`typescript-standards`**
   - Strict mode enabled
   - Type inference preferred
   - No `any` types

3. **`security-hardening`**
   - CSP for static sites
   - No user input (read-only)
   - Dependency auditing

4. **`performance-optimization`**
   - Image optimization
   - Lazy loading
   - Bundle size: < 100KB

5. **`git-workflow`**
   - Main branch only
   - Conventional commits
   - Simple PR process

6. **`documentation-standards`**
   - README template
   - Inline comments for complex logic
   - Component docs

7. **`accessibility-standards`**
   - Semantic HTML
   - Alt text for images
   - Keyboard navigation

## Why Minimal?

### When to Use Minimal Skills

✅ **Use minimal when**:
- Solo project or side project
- Simple static site or landing page
- Tight deadline (launch in days)
- No user authentication
- No database required
- Learning/prototyping

❌ **Use full suite when**:
- Team project (2+ developers)
- User authentication required
- Database or state management needed
- Production SaaS
- Compliance requirements (GDPR, etc.)
- Complex business logic

## Directory Structure

```
.claude/skills/
├── project-architecture/
│   ├── SKILL.md              # ~200 lines (vs 400+ for full)
│   └── references/
│       ├── patterns.md       # 5 patterns (vs 15+)
│       ├── anti-patterns.md  # 5 anti-patterns (vs 20+)
│       └── checklist.md      # Simple checklist
├── typescript-standards/
│   ├── SKILL.md              # TypeScript basics
│   └── references/
├── security-hardening/
│   ├── SKILL.md              # Static site security only
│   └── references/
├── performance-optimization/
│   ├── SKILL.md              # Core web vitals only
│   └── references/
├── git-workflow/
│   ├── SKILL.md              # Simple trunk-based workflow
│   └── references/
├── documentation-standards/
│   ├── SKILL.md              # README + comments
│   └── references/
├── accessibility-standards/
│   ├── SKILL.md              # Essential a11y only
│   └── references/
└── _bootstrap-manifest.json
```

## Key Differences from Full Suite

| Aspect | Minimal | Full Suite |
|--------|---------|------------|
| **Skill count** | 7 | 20-30+ |
| **Rules per skill** | 10-20 | 20-40 |
| **Patterns** | 5-10 | 15-25 |
| **Anti-patterns** | 5-10 | 15-30 |
| **Security depth** | Basic | Defense in depth |
| **Testing** | Optional | Mandatory 80%+ |
| **CI/CD** | Manual deploy | Automated pipeline |
| **Observability** | Basic analytics | Full monitoring |

## Quick Start

```bash
# 1. Install the bootstrapper skill
npx skills add ersinkoc/project-bootstrap

# 2. Bootstrap with minimal flag
claude

# Then say:
"Bootstrap a minimal static blog with Astro and Tailwind. 
Generate only essential skills — no auth, no database, simple static site."

# 3. Validate
python scripts/validate_bootstrap.py .claude/skills/

# 4. Start coding
npm install
npm run dev
```

## Validation Output

```
=================================================================
  PROJECT BOOTSTRAPPER — VALIDATION REPORT
=================================================================

  project-architecture  [187 lines, 12 rules, 8 code blocks]
  typescript-standards  [145 lines, 15 rules, 10 code blocks]
  security-hardening    [156 lines, 10 rules, 6 code blocks]
  performance-opt       [134 lines, 8 rules, 8 code blocks]
  git-workflow          [98 lines, 8 rules, 4 code blocks]
  documentation-std     [112 lines, 10 rules, 5 code blocks]
  accessibility-std     [167 lines, 12 rules, 9 code blocks]

  SUMMARY
=================================================================
  Skills:          7
  Total lines:     999
  Total rules:     75
  Code blocks:     50
  Errors:          0
  Warnings:        1
  Status:          ✅ PASSED
=================================================================
```

## When to Expand

Start minimal, add skills as needed:

1. **Adding user accounts?** → Add `auth-patterns`
2. **Adding comments/likes?** → Add `database-design`, `api-design`
3. **Adding payments?** → Add `payment-integration`, `security-hardening` (full)
4. **Team growing?** → Add `testing-strategy`, `error-handling`, `observability`
5. **Going to production?** → Add `devops-pipeline`, `privacy-compliance`

## Philosophy

> "Start simple, add complexity only when justified."

Minimal skills give you:
- ✅ Guardrails for clean code
- ✅ Security basics
- ✅ Performance awareness
- ✅ Documentation habits
- ❌ Without unnecessary ceremony

---

**Note**: This is an example structure. Generate actual skills using the bootstrapper for your real project.
