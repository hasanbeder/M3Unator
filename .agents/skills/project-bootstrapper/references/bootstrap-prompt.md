# Bootstrap Prompt

Copy the prompt below into Claude Code (or Claude.ai) and fill in the `{...}` placeholders.

---

## Full Prompt

```
I want to bootstrap a new project. Read the bootstrap skill at `.claude/skills/project-bootstrapper/SKILL.md` and follow its instructions.

## My Project Idea

{Describe your project here. The more detail you give, the better the generated skills will be.

Examples:

Detailed: "A SaaS platform called 'TaskFlow' for freelancer project management. 
Features: Kanban boards, time tracking, invoice generation, client portal. 
Tech: Next.js 16, React 19, PostgreSQL 17, Stripe for payments.
Scale: 1000 users in 3 months. Solo developer. GDPR compliant."

Medium: "A CLI-based database migration tool in Go. Supports PostgreSQL and MySQL.
Zero dependencies. Published as a single binary. Open-source MIT license."

Minimal: "An AI-powered customer support chatbot SaaS."}

## My Priorities (optional)

{List your priorities in order. Examples:
- "Security is my top priority — enterprise customers"
- "Performance is critical — every millisecond counts"  
- "Fast MVP — ship in 2 weeks, refactor later"
- "Open-source — contributor-friendly, well-documented"
- "Compliance: HIPAA, SOC2"
- "Offline-first mobile app"}

## Constraints (optional)

{Technical constraints:
- "Must use Python/Django"
- "Deploy on AWS with Terraform"
- "Monorepo with pnpm workspaces"
- "Must support React Native mobile"
- "Budget: free tier services only"}

---

Please follow these steps:

1. Read `.claude/skills/project-bootstrapper/SKILL.md`
2. Read all files in `references/` directory
3. Ask me clarifying questions if needed
4. Propose a tech stack and wait for my approval
5. Generate the skill map and wait for my approval
6. Generate ALL skills in dependency order
7. Each skill must have: SKILL.md + references/patterns.md + references/anti-patterns.md + references/checklist.md
8. Run validation (scripts/validate_bootstrap.py)
9. Show the summary report
10. Confirm we're ready to code
```

---

## Quick Prompt (One-Liner)

If you already know what you want:

```
Bootstrap project: {one-sentence description}. Tech: {stack}. Generate all skills, then let's code.
```

---

## For Existing Projects

To generate skills for a project that already has code:

```
I have an existing project at {path}. Read the codebase structure, understand the tech stack, 
and bootstrap a complete skill suite for it. Read .claude/skills/project-bootstrapper/SKILL.md first.
```

---

## Tips

1. **More detail = better skills**: A paragraph beats a sentence. Include features, tech, scale, team size.
2. **State your tech stack**: If you already decided on technologies, say so. Otherwise the bootstrapper will recommend.
3. **Rank your priorities**: "Security > Performance > Speed" helps the bootstrapper weight its rules.
4. **Works for any language**: TypeScript, Python, Go, Rust, Java, C#, Swift, PHP, Ruby, or polyglot.
5. **Works for any project type**: Web app, mobile, desktop, CLI, library, API service, microservices, data pipeline, ML platform.
6. **Skills are editable**: You can always modify generated skills after bootstrap.
7. **Incremental**: You can add new skills later without re-bootstrapping everything.
