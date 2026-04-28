# Example Skill Suites

This directory contains example generated skill suites for different project types and tech stacks.

## Available Examples

### 1. [TypeScript + Next.js](./typescript-nextjs/) — Full-Stack Web App
Complete 22-skill suite for a modern SaaS application.

**Tech Stack**:
- TypeScript 5.7.3 + Next.js 16.1.0
- React 19.0.0 + Tailwind CSS 4.0
- PostgreSQL 17.2 + Drizzle ORM
- Full authentication, testing, CI/CD

**Best for**: Production SaaS, team projects, complex applications

[View Example →](./typescript-nextjs/)

---

### 2. [Python + FastAPI](./python-fastapi/) — API Service
18-skill suite for a Python-based REST API.

**Tech Stack**:
- Python 3.12.0 + FastAPI 0.115.0
- Pydantic 2.10.0 + SQLAlchemy 2.0
- PostgreSQL 17.2 + Redis
- JWT auth, background jobs, monitoring

**Best for**: API services, microservices, data processing

[View Example →](./python-fastapi/)

---

### 3. [Minimal Project](./minimal-project/) — Static Site
7-skill essential suite for a simple project.

**Tech Stack**:
- TypeScript 5.7.3 + Astro 5.3.0
- Tailwind CSS 4.0.0
- Static export, no database
- Essential security + performance only

**Best for**: Landing pages, blogs, prototypes, side projects

[View Example →](./minimal-project/)

---

## Using These Examples

### Option 1: Reference Only
Read through examples to understand:
- What skills are generated for each project type
- How skills are structured
- What patterns and anti-patterns look like
- Version verification requirements

### Option 2: As Templates
Copy an example and modify:
```bash
# Copy example structure
cp -r examples/typescript-nextjs my-project/.claude/skills/

# Then customize SKILL.md files for your project
cd my-project/.claude/skills/project-architecture/
vim SKILL.md  # Edit project-specific details
```

### Option 3: Generate Fresh (Recommended)
Use the bootstrapper to generate skills tailored to your exact project:

```bash
# Install bootstrapper
npx skills add ersinkoc/project-bootstrap

# Generate for your project
claude
# Then: "Bootstrap a new project with [your tech stack]"
```

## Example Comparison

| Feature | TypeScript/Next.js | Python/FastAPI | Minimal |
|---------|-------------------|----------------|---------|
| **Skill Count** | 22 | 18 | 7 |
| **Total Rules** | ~450 | ~380 | ~75 |
| **Code Examples** | ~280 | ~220 | ~50 |
| **Setup Time** | 30 min | 25 min | 10 min |
| **Complexity** | High | Medium | Low |
| **Team Size** | 2-10 | 2-10 | 1-3 |
| **Database** | PostgreSQL | PostgreSQL | None |
| **Auth** | NextAuth + RBAC | JWT + OAuth2 | None |
| **Testing** | Vitest + E2E | pytest 85%+ | Optional |
| **CI/CD** | Full pipeline | Docker + cloud | Manual |

## Version Verification

All examples include version verification:

```bash
# Check versions in any example
python ../scripts/version_checker.py ./typescript-nextjs/.claude/skills/

# Output shows:
# ✅ All versions verified
# ⚠️ Any outdated versions
# ❌ Version conflicts between skills
```

## Adding Your Own Example

To add a new example:

1. Create directory: `examples/your-example/`
2. Add `README.md` with:
   - Project description
   - Tech stack (with verified versions)
   - Generated skills list
   - Key features
   - Validation commands
3. Include `.claude/skills/` structure (or describe it)
4. Submit PR with description

## Questions?

- **Which example should I use?** → Start with the one closest to your tech stack
- **Can I mix examples?** → Yes, skills are modular
- **Are examples production-ready?** → They're templates — customize for your needs
- **How do I update versions?** → Run bootstrapper again with latest versions

---

**See main [README](../README.md) for full bootstrapper documentation.**
