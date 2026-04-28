```
 ██████╗ ██████╗  ██████╗      ██╗███████╗ ██████╗████████╗
 ██╔══██╗██╔══██╗██╔═══██╗     ██║██╔════╝██╔════╝╚══██╔══╝
 ██████╔╝██████╔╝██║   ██║     ██║█████╗  ██║        ██║   
 ██╔═══╝ ██╔══██╗██║   ██║██   ██║██╔══╝  ██║        ██║   
 ██║     ██║  ██║╚██████╔╝╚█████╔╝███████╗╚██████╗   ██║   
 ╚═╝     ╚═╝  ╚═╝ ╚═════╝  ╚════╝ ╚══════╝ ╚═════╝   ╚═╝   

 ██████╗  ██████╗  ██████╗ ████████╗███████╗████████╗██████╗  █████╗ ██████╗ ███████╗
 ██╔══██╗██╔═══██╗██╔═══██╗╚══██╔══╝██╔════╝╚══██╔══╝██╔══██╗██╔══██╗██╔══██╗██╔════╝
 ██████╔╝██║   ██║██║   ██║   ██║   ███████╗   ██║   ██████╔╝███████║██████╔╝███████╗
 ██╔══██╗██║   ██║██║   ██║   ██║   ╚════██║   ██║   ██╔══██╗██╔══██║██╔═══╝ ╚════██║
 ██████╔╝╚██████╔╝╚██████╔╝   ██║   ███████║   ██║   ██████╔╝██║  ██║██║     ███████║
 ╚═════╝  ╚═════╝  ╚═════╝    ╚═╝   ╚══════╝   ╚═╝   ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚══════╝
```

<div align="center">

### Define how code must be written — before writing any code.

**A universal meta-skill for [Claude Code](https://docs.anthropic.com/en/docs/claude-code) that generates an entire suite of project-specific coding skills, standards, and guardrails in minutes.**

---

`40+ skill domains` | `15-40 rules per skill` | `10+ languages` | `any framework` | `latest versions only` | `zero bugs by design`

---

**🚀 Language Agnostic**: TypeScript, Python, Go, Rust, Java, Kotlin, C#, Swift, PHP, Ruby, and more  
**⚡ Version Enforcement**: Every technology verified for latest stable — never outdated  
**🔒 Zero Tolerance**: Stale versions and deprecated APIs automatically rejected

---

</div>

## Table of Contents

- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [How It Works](#how-it-works)
  - [Phase 1: Intelligence Gathering](#phase-1-intelligence-gathering)
  - [Phase 2: Skill Generation Engine](#phase-2-skill-generation-engine)
  - [Phase 3: Output](#phase-3-output)
  - [Phase 4: Validation](#phase-4-validation)
  - [Phase 5: Continuous Compliance](#phase-5-continuous-compliance-project-manager-skill)
- [Quick Start](#quick-start)
- [What Gets Generated](#what-gets-generated)
- [Version Verification System](#version-verification-system)
- [Cross-Cutting Guarantees](#cross-cutting-guarantees)
- [Project Structure](#project-structure)
- [Supported Tech Stacks](#supported-tech-stacks)
- [Writing Principles](#writing-principles)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)
- [Philosophy](#philosophy)

---

## The Problem

You start a new project. You write code. Weeks later, you discover:
- Authentication tokens stored in localStorage (XSS vulnerability)
- N+1 queries on every dashboard load (performance disaster)
- PII logged in plaintext (GDPR violation)
- No error hierarchy (every error returns 500)
- Tests mock everything including the thing being tested
- Three different validation libraries in the same codebase

**Bugs are cheaper to prevent at design time than to discover at runtime.**

## The Solution

Project Bootstrapper analyzes your project idea, determines the optimal tech stack, and generates **15-30+ hyper-detailed coding skills** — complete with rules, code examples, anti-patterns, performance budgets, and security checklists — all before a single line of application code is written.

```
[Your Idea] --> [Interview] --> [Tech Stack] --> [Skill Map] --> [Generate Skills] --> [Validate] --> [Code]
```

Every file created afterward is governed by these skills automatically.

## How It Works

### Phase 1: Intelligence Gathering

The bootstrapper interviews you (or extracts from your description):

| Category | Questions |
|----------|-----------|
| **Product** | What does it do? What type? Who uses it? Revenue model? |
| **Scale** | Users at launch? Data volume? Geographic scope? Uptime SLA? |
| **Constraints** | Required tech? Team size? Timeline? Budget? Compliance? |

Then **searches the web in real-time** to verify the latest stable version of every technology before proposing:

```
+-----------------+-------------------+----------------------------------+
| TECH STACK PROPOSAL (versions verified: 2026-03-09)                    |
+-----------------+-------------------+----------------------------------+
| Category        | Choice            | Rationale                        |
+-----------------+-------------------+----------------------------------+
| Language        | TypeScript 5.8    | Full-stack unification           |
| Framework       | Next.js 16.1      | SSR + API routes + RSC           |
| Database        | PostgreSQL 17.2   | ACID + JSON + FTS                |
| ORM             | Drizzle 0.40      | Type-safe, lightweight           |
| Auth            | Lucia 4.0         | Self-hosted, flexible            |
| Styling         | Tailwind CSS 4.1  | Utility-first, fast              |
| Validation      | Zod 4.0           | Runtime + static, composable     |
| Testing         | Vitest 3.1        | Fast + HMR + native TS           |
| ...             | ...               | ...                              |
+-----------------+-------------------+----------------------------------+
  * Every version above was looked up via web search, not memorized
```

> **No stale versions.** The bootstrapper uses web search, package registries, and documentation tools to verify every version at generation time. AI knowledge cutoffs don't matter -- you always get the latest stable.

### Phase 2: Skill Generation Engine

Skills are generated in strict dependency order across 8 layers:

```
Layer 0  project-architecture
         |
Layer 1  {language}-standards, git-workflow, documentation-standards
         |
Layer 2  security-hardening, error-handling, data-validation, privacy-compliance
         |
Layer 3  database-design, api-design, auth-patterns, caching-strategy
         |
Layer 4  {framework}-patterns, ui-engineering, state-management, accessibility
         |
Layer 5  testing-strategy, performance-optimization
         |
Layer 6  devops-pipeline, observability, container-orchestration
         |
Layer 7  Domain-specific (payments, i18n, email, search, realtime, AI, ...)
```

### Phase 3: Output

Every generated skill produces:

```
{skill-name}/
+-- SKILL.md              # Main instructions (< 500 lines)
+-- references/
|   +-- patterns.md       # Approved patterns with full code examples
|   +-- anti-patterns.md  # Forbidden patterns with severity + explanation
|   +-- checklist.md      # Pre-commit/pre-merge verification checklist
+-- templates/            # (optional) Code templates, configs
```

All placed under `.claude/skills/` in your project root, picked up automatically by Claude Code.

### Phase 4: Validation

Built-in validators (available in both **JavaScript/Node.js** and **Python**) check every generated skill for:

- YAML frontmatter completeness
- Required sections (Activation, Core Rules, Anti-Patterns, ...)
- Code example count and quality
- Vague language detection
- Weak security language
- Cross-skill consistency
- Version verification documentation
- Manifest integrity

```bash
# JavaScript/Node.js (default)
npm run validate

# Python (alternative)
python scripts/validate_bootstrap.py .claude/skills/
```

### Phase 5: Continuous Compliance (Project Manager Skill)

The `project-manager` skill **actively monitors** your codebase throughout development:

**Real-time Enforcement:**
- ✅ Validates every code change against active skills
- 🚨 Blocks commits with skill violations  
- 📊 Generates compliance reports
- 🔍 Detects skill drift automatically
- 📋 Enforces pre-commit checklists
- 🎯 Guides developers back to compliance

**Automated Tools:**
```bash
# Check code compliance
npm run check-compliance
# or: node scripts/check_skill_compliance.js src/

# Analyze skill coverage
npm run analyze-coverage

# Generate weekly reports
npm run report
```

**Result:** Skills aren't just documentation — they're **active guardrails** enforced at every step.

- YAML frontmatter completeness
- Required sections (Activation, Core Rules, Anti-Patterns, ...)
- Code example count and quality
- Vague language detection ("should be fast" --> use concrete numbers)
- Weak security language ("should validate" --> must be "must validate")
- Cross-skill consistency (same validation library, same error format, ...)
- Manifest integrity

```
=================================================================
  PROJECT BOOTSTRAPPER -- VALIDATION REPORT
=================================================================

  project-architecture  [187 lines, 22 rules, 12 code blocks]
  typescript-standards  [245 lines, 35 rules, 18 code blocks]
  security-hardening    [312 lines, 40 rules, 24 code blocks]
  ...

  SUMMARY
=================================================================
  Skills:          23
  Total lines:     4,892
  Total rules:     487
  Code blocks:     312
  Errors:          0
  Warnings:        3
  Status:          PASSED
=================================================================
```

## What Gets Generated

### Tier 1 -- Always Generated (Every Project)

| # | Skill | What It Enforces |
|---|-------|-----------------|
| 1 | `project-architecture` | Folder structure, module boundaries, naming conventions, dependency flow |
| 2 | `{language}-standards` | Type safety, idioms, banned patterns, compiler strictness |
| 3 | `security-hardening` | Input/output security matrix, headers, crypto, CORS, CSP, dependency audit |
| 4 | `error-handling` | Error hierarchy, propagation rules, retry strategy, circuit breakers |
| 5 | `data-validation` | Schema validation, sanitization, coercion policy, boundary enforcement |
| 6 | `testing-strategy` | Test pyramid, mock decision matrix, coverage thresholds, CI pipeline |
| 7 | `performance-optimization` | LCP/INP/CLS budgets, API p95 targets, DB query limits, memory ceilings |
| 8 | `git-workflow` | Branch strategy, commit format, PR template, merge policy, hooks |
| 9 | `documentation-standards` | Code docs, API docs, ADRs, changelogs, onboarding guides |
| 10 | `privacy-compliance` | PII classification, data lifecycle, GDPR/CCPA, retention, breach response |
| 11 | `dependency-management` | Lockfile policy, audit, license whitelist, supply chain security |

### Tier 2-5 -- Conditional (Generated When Needed)

<details>
<summary><b>29 additional skill domains</b> (click to expand)</summary>

| Skill | When Generated |
|-------|---------------|
| `database-design` | Any form of persistence |
| `api-design` | Exposes or consumes APIs |
| `auth-patterns` | User authentication/authorization |
| `{framework}-patterns` | Specific framework used |
| `ui-engineering` | Visual user interface |
| `state-management` | Complex frontend state |
| `accessibility-standards` | Any user-facing interface |
| `devops-pipeline` | Deployable project |
| `observability` | Production service |
| `payment-integration` | Handles money |
| `internationalization` | Multi-language support |
| `file-handling` | File upload/download |
| `realtime-system` | Live updates, chat |
| `email-system` | Transactional emails |
| `search-implementation` | Search functionality |
| `background-jobs` | Async processing, queues |
| `caching-strategy` | Performance-critical caching |
| `rate-limiting` | Public API / abuse prevention |
| `feature-flags` | Gradual rollout, A/B testing |
| `mobile-patterns` | React Native / Flutter / native |
| `desktop-patterns` | Electron / Tauri / native |
| `cli-design` | Command-line tool |
| `monorepo-management` | Multiple packages in one repo |
| `ai-integration` | LLM/ML features |
| `container-orchestration` | Docker / Kubernetes |
| `infrastructure-as-code` | Terraform / Pulumi / CDK |
| `event-driven-architecture` | Event sourcing, CQRS |
| `graphql-patterns` | GraphQL API |
| `microservice-patterns` | Distributed services |

### Special Skill — Always Generated

| # | Skill | What It Does |
|---|-------|--------------|
| 40 | `project-manager` | **Skill enforcement** — Monitors codebase, validates compliance, prevents drift, generates reports. Acts as project manager ensuring all code follows skills. |

</details>

## What Makes Each Skill "Hyper-Detailed"

Every generated skill contains:

| Section | Purpose |
|---------|---------|
| **YAML Frontmatter** | Aggressive description for reliable auto-triggering |
| **Activation Conditions** | Exact file types, directories, and phrases that trigger it |
| **Project Context** | References to YOUR tech, paths, and decisions |
| **15-40 Numbered Rules** | Each with rationale + correct/incorrect code examples |
| **Approved Patterns** | Copy-pasteable, production-ready code (10-25 per skill) |
| **Anti-Patterns with Severity** | What NOT to do, rated CRITICAL/HIGH/MEDIUM/LOW |
| **Performance Budgets** | Concrete numbers with measurement commands |
| **Security Checklist** | Domain-specific verification items |
| **Error Scenarios Table** | What fails, detection, recovery, user impact |
| **Edge Cases** | Boundary conditions with handling code |
| **Integration Points** | How skills connect and reference each other |
| **Pre-Commit Checklist** | Automated + manual verification items |

## Prerequisites

### Required
- **Node.js 18+** (for validation scripts and running the bootstrapper)
- **Git** (for version control)

### Optional (choose one)
- **Python 3.12+** (alternative for validation scripts if you prefer Python)
- **Claude Code** or **Claude.ai** (to run the bootstrapper skill)

### System Requirements
- Any OS (Windows, macOS, Linux)
- 100MB free disk space
- Internet connection (for version verification during bootstrap)

---

## Quick Start

### 1. Install the Skill

The fastest way -- one command, done:

```bash
npx skills add ersinkoc/project-bootstrap
```

This automatically clones the skill into your project's `.claude/skills/` directory and makes it available to Claude Code immediately.

<details>
<summary><b>Alternative: Manual installation</b></summary>

Clone and copy into your Claude Code skills directory:

```bash
git clone https://github.com/ersinkoc/project-bootstrap.git
cp -r project-bootstrap/ your-project/.claude/skills/project-bootstrapper/
```

Or install globally for all projects:

```bash
cp -r project-bootstrap/ ~/.claude/skills/project-bootstrapper/
```

</details>

### 2. Bootstrap a New Project

Open Claude Code and say:

```
I want to bootstrap a new project. Read the bootstrap skill and follow its instructions.

## My Project Idea

A SaaS platform called "TaskFlow" for freelancer project management.
Features: Kanban boards, time tracking, invoice generation, client portal.
Tech: Next.js 16, PostgreSQL 17, Stripe. Scale: 1000 users in 3 months.
Solo developer. GDPR compliant.
```

Or use the quick one-liner:

```
Bootstrap project: AI-powered customer support chatbot SaaS. Tech: Next.js, Python FastAPI. Generate all skills.
```

### 3. For Existing Projects

```
I have an existing project. Read the codebase structure, understand the tech stack,
and bootstrap a complete skill suite for it.
```

### 4. Validate

We provide scripts in both **JavaScript (Node.js)** and **Python** — use whichever is available in your environment:

#### Option A: JavaScript/Node.js (Recommended)
```bash
# Full validation
npm run validate
# or: node scripts/validate_bootstrap.js .claude/skills/

# Check version consistency across all skills
npm run check-versions
# or: node scripts/version_checker.js .claude/skills/

# Check versions in manifest
node scripts/version_checker.js --check-manifest .claude/skills/_bootstrap-manifest.json

# Check skill compliance
npm run check-compliance
# or: node scripts/check_skill_compliance.js src/

# Analyze skill coverage
npm run analyze-coverage
# or: node scripts/analyze_skill_coverage.js src/

# Generate compliance report
npm run report
# or: node scripts/generate_compliance_report.js --week
```

#### Option B: Python
```bash
# Full validation
python scripts/validate_bootstrap.py .claude/skills/

# Check version consistency
python scripts/version_checker.py .claude/skills/

# Check skill compliance
python scripts/check_skill_compliance.py src/

# Analyze coverage
python scripts/analyze_skill_coverage.py src/

# Generate report
python scripts/generate_compliance_report.py --week
```

## Version Verification System

This bootstrapper has **zero tolerance for outdated versions**. Every technology version is verified in real-time during generation.

### How It Works

1. **Real-time Verification**: Every technology version is looked up using:
   - Official documentation sites
   - Package registries (npm, PyPI, crates.io, Maven)
   - GitHub releases
   - Web search as fallback

2. **Automatic Detection**: The `version_checker.py` script:
   - Extracts all version references from generated skills
   - Compares against minimum required versions
   - Flags outdated or unverified versions
   - Checks version consistency across all skills

3. **Hard Rules**:
   - ❌ Never use memorized versions
   - ❌ Never skip verification for "well-known" packages
   - ✅ Always document verification source and date
   - ✅ Always use latest API syntax in code examples

### Verification Matrix

| Language | Minimum Version | Package Manager | Status Check |
|----------|----------------|-----------------|--------------|
| **TypeScript** | Node 22 LTS, TS 5.7+ | npm 10+ | ✅ Verified |
| **Python** | 3.12+ | pip 24+ / uv | ✅ Verified |
| **Go** | 1.24+ | Go modules | ✅ Verified |
| **Rust** | 1.85+ | Cargo | ✅ Verified |
| **Java** | 21 LTS | Maven/Gradle | ✅ Verified |
| **Kotlin** | 2.1+ | Gradle | ✅ Verified |
| **C#** | .NET 9+ | NuGet | ✅ Verified |
| **Swift** | 6.0+ | SwiftPM | ✅ Verified |
| **PHP** | 8.4+ | Composer 2+ | ✅ Verified |
| **Ruby** | 3.4+ | Bundler | ✅ Verified |

### Running Version Checks

```bash
# Check all versions in generated skills
python scripts/version_checker.py .claude/skills/

# Example output:
# ✅ VERIFIED VERSIONS
#    Node.js              22.14.0
#    TypeScript           5.7.3
#    Next.js              16.1.0
#    React                19.0.0
#
# ⚠️  OUTDATED VERSIONS
#    Python               3.11.0         Version 3.11.0 is below minimum 3.12.0
#
# ❌ VERSION ERRORS
#    PostgreSQL           14.0           Local version (17.2) is newer
```

---

## Cross-Cutting Guarantees

These rules are enforced across **every** generated skill:

| Concern | Guarantee |
|---------|-----------|
| **Defense in Depth** | Every skill embeds security thinking, not just the security skill |
| **Error Uniformity** | Same error shape, codes, and propagation rules everywhere |
| **Logging Contract** | Same structured JSON format, same level semantics, never log PII |
| **Validation Boundary** | Validate at boundaries, trust types internally |
| **Naming Consistency** | One convention per context, enforced across all skills |
| **Async Safety** | Timeouts on all external calls, cancellation, graceful shutdown |
| **Backward Compatibility** | Add fields safely, deprecate before removing, version on break |
| **Observability** | Every domain emits logs, metrics, and traces |
| **Graceful Degradation** | Data integrity > Security > Privacy > Core features > Polish |
| **Latest Version Enforcement** | Every tech version verified via real-time web search, never memorized |

## Project Structure

```
project-bootstrap/
+-- SKILL.md                              # Main meta-skill instructions
+-- references/
|   +-- skill-catalog.md                  # 40+ skill domain definitions
|   +-- skill-template.md                 # Universal template every skill must follow
|   +-- generation-guide.md               # Domain-specific generation rules + code
|   +-- quality-standards.md              # Quality checklist and red flags
|   +-- cross-cutting-concerns.md         # Rules that span all skills
|   +-- bootstrap-prompt.md               # Ready-to-use prompts
+-- scripts/
|   +-- validate_bootstrap.py             # Post-generation validator
|   +-- version_checker.py                # Version verification tool
+-- examples/                             # Example generated skill suites
|   +-- typescript-nextjs/                # Full example: TypeScript + Next.js
|   +-- python-fastapi/                   # Full example: Python + FastAPI
|   +-- minimal-project/                  # Minimal example: Simple project
```

## Supported Tech Stacks

The bootstrapper is **language and framework agnostic**. It adapts to:

| Languages | Frameworks | Databases | Infra |
|-----------|-----------|-----------|-------|
| TypeScript | Next.js, React, Vue, Svelte, Angular, Astro | PostgreSQL, MySQL, MongoDB | AWS, GCP, Azure |
| Python | Django, FastAPI, Flask | Redis, DynamoDB | Docker, K8s |
| Go | Gin, Echo, Fiber, stdlib | SQLite, CockroachDB | Terraform, Pulumi |
| Rust | Actix, Axum, Rocket | Supabase, PlanetScale | Vercel, Fly.io |
| Java/Kotlin | Spring Boot, Ktor, Quarkus | Elasticsearch | Cloudflare |
| Swift | Vapor, SwiftUI | Cassandra | Railway |
| C# | ASP.NET, Blazor | Neo4j | Render |
| PHP | Laravel, Symfony | ClickHouse | DigitalOcean |
| Ruby | Rails, Sinatra | Meilisearch | Heroku |

For polyglot projects, per-language skills are generated automatically.

---

## Troubleshooting

### Common Issues

**Issue**: Scripts won't run
```bash
# For JavaScript/Node.js:
node --version  # Should be 18+
npm run validate

# For Python (alternative):
python --version  # Should be 3.12+
python scripts/validate_bootstrap.py .claude/skills/
```

**Issue**: Version checker shows outdated versions
```bash
# JavaScript:
npm run check-versions

# Python:
python scripts/version_checker.py .claude/skills/
```

**Issue**: Skills not being picked up by Claude Code
```bash
# Solution: Ensure skills are in correct location
ls -la .claude/skills/

# Verify SKILL.md exists in each skill directory
ls .claude/skills/*/SKILL.md
```

**Issue**: Generated code uses deprecated APIs
```bash
# JavaScript:
node scripts/version_checker.js --check-manifest .claude/skills/_bootstrap-manifest.json

# Python:
python scripts/version_checker.py --check-manifest .claude/skills/_bootstrap-manifest.json
```

**Issue**: Compliance check fails
```bash
# Check which skills are violated:
npm run check-compliance
# or: node scripts/check_skill_compliance.js --staged

# Fix violations and re-check
```

### Getting Help

- **Documentation**: Check `references/` directory for detailed guides
- **Examples**: See `examples/` directory for sample projects
- **Issues**: Report bugs at https://github.com/ersinkoc/project-bootstrap/issues

---

## Contributing

Contributions are welcome! Here's how to help:

### Adding New Examples
1. Create `examples/your-example/` directory
2. Add `README.md` with project description
3. Include skill structure or detailed description
4. Submit PR with clear description

### Improving Documentation
- Fix typos or unclear sections
- Add more code examples
- Translate to other languages

### Reporting Bugs
- Include your tech stack
- Provide minimal reproduction steps
- Include validator output

### Code Changes
- Run validator before submitting: `python scripts/validate_bootstrap.py .`
- Ensure version checker passes: `python scripts/version_checker.py .`
- Update relevant documentation

---

## License

MIT License - see LICENSE file for details.

This project is open source and free to use for personal and commercial projects.

---

## Writing Principles

Every generated skill follows these non-negotiable principles:

1. **Explain the WHY** -- Reasoning over rigid commands
2. **Concrete over abstract** -- Real code examples over descriptions
3. **Project-specific** -- References actual tech, paths, decisions
4. **Opinionated** -- One best approach enforced, no menus
5. **Testable** -- Every rule verifiable via lint, test, or review
6. **Examples compile** -- All code works if copy-pasted
7. **Both sides** -- Correct AND incorrect for every critical rule

## Philosophy

> Bugs are prevented at design time, not discovered at runtime.

This skill does not write application code. It generates the **rules, patterns, guardrails, and quality standards** that govern all code written afterward -- by any developer or AI assistant.

The result: a project where every contributor (human or AI) writes code that is secure, performant, accessible, tested, and consistent from day one.

---

<div align="center">

**Built for [Claude Code](https://docs.anthropic.com/en/docs/claude-code)** | Works with any language | Works with any project type

</div>
