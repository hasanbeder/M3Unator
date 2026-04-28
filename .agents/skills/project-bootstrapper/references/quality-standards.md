# Quality Standards for Generated Skills

This document defines the quality bar every generated skill must meet. Use it as a checklist after generating each skill and before declaring bootstrap complete.

---

## The Quality Spectrum

### Excellent Skill (target)
- A developer reads it in 5 minutes and knows exactly what's expected
- Every rule is testable (can write a lint rule, test, or code review check for it)
- Code examples compile and run without modification in the project
- Anti-patterns include real consequences, not just "this is bad practice"
- Performance budgets have concrete numbers with measurement commands
- Security checklists are actionable and domain-specific
- The skill references actual project tech, paths, and decisions
- Edge cases are documented with handling code
- Cross-references to other skills are accurate and useful

### Acceptable Skill (minimum)
- Rules are clear and unambiguous
- Code examples are syntactically correct for the target language
- Anti-patterns explain WHY, not just "don't do this"
- Performance targets exist even if approximate
- Security section exists and is relevant to the domain
- Project tech stack is referenced

### Unacceptable Skill (must rewrite)
- Rules use "should" for critical requirements (use "must" or "never")
- Code examples are pseudocode or won't compile
- Anti-patterns don't explain consequences
- Performance targets are vague ("be efficient", "keep it fast")
- Security advice is generic ("validate input", "sanitize output")
- Could apply to any project without modification (not project-specific)
- Contradicts another generated skill
- Missing required sections from the template
- No code examples at all
- Contains outdated API usage or deprecated patterns

---

## Per-Section Quality Checks

### Frontmatter Description
- [ ] 3-5 sentences minimum
- [ ] Lists specific file types/directories that trigger it
- [ ] Lists user phrases that trigger it
- [ ] Explains what goes wrong WITHOUT the skill
- [ ] Under 1024 characters
- [ ] Slightly "pushy" — errs on the side of triggering

### Core Rules
- [ ] 15-40 rules (fewer for simple domains, more for security/testing)
- [ ] Every rule has a rationale explaining WHY
- [ ] Every critical rule has both ✅ correct and ❌ incorrect code
- [ ] Rules use precise language ("must", "never", "always", not "should", "try to")
- [ ] No two rules contradict each other
- [ ] Rules are ordered by importance (most critical first)
- [ ] Each rule addresses ONE concern (not compound rules)

### Code Examples
- [ ] Minimum 5 code blocks per SKILL.md
- [ ] All examples use the project's actual language and framework
- [ ] All examples are syntactically valid (would pass a parser)
- [ ] Examples include imports and type annotations
- [ ] Examples handle error cases, not just happy path
- [ ] Incorrect examples show realistic mistakes (not strawmen)
- [ ] Each incorrect example explains the specific consequence

### Anti-Patterns
- [ ] At least 3 in SKILL.md, full list in references/anti-patterns.md
- [ ] Each has a severity level (🔴/🟠/🟡/🟢)
- [ ] Each explains what it looks like (code)
- [ ] Each explains WHY it's dangerous (consequence)
- [ ] Each provides the correct alternative (code)
- [ ] At least one explains a real-world scenario

### Performance Budgets
- [ ] Concrete numbers, not relative terms
- [ ] Units specified (ms, KB, %, req/s)
- [ ] Measurement method specified (tool, command, or code)
- [ ] Targets are realistic for the project type
- [ ] Hard limits defined for the most critical metrics

### Security Checklist
- [ ] Domain-specific, not generic
- [ ] Each item is a yes/no verification (not a paragraph)
- [ ] Items reference specific code patterns or tools
- [ ] Critical items listed first
- [ ] Covers the OWASP Top 10 relevant to this domain

### Error Scenarios Table
- [ ] At least 3 scenarios per skill
- [ ] Detection method is concrete (log pattern, metric threshold, health check)
- [ ] Recovery method is actionable (retry, fallback, alert)
- [ ] User impact is described from the user's perspective
- [ ] Severity assigned to each scenario

### Edge Cases
- [ ] At least 3 per skill
- [ ] Each has handling code (not just a description)
- [ ] Includes boundary conditions (empty input, max size, unicode, concurrent access)
- [ ] Includes failure modes (timeout, partial success, network partition)

### Integration Points
- [ ] Lists all skills this skill depends on
- [ ] Lists all skills that reference this skill
- [ ] Shared decisions are identified and consistent
- [ ] No orphaned references (referencing skills that don't exist)

### References
- [ ] patterns.md has 10-25 patterns with full code
- [ ] anti-patterns.md has 15-30 entries with severity
- [ ] checklist.md has both automated and manual checks
- [ ] All reference files are under 500 lines each

---

## Cross-Skill Quality Checks

After ALL skills are generated, verify:

1. **No contradictions**: Scan all skills for conflicting rules
2. **Terminology consistency**: Same concept uses same name everywhere
3. **Version consistency**: All tech versions match across skills AND were verified via web search (not memorized)
4. **Version freshness**: Every version referenced was looked up in real-time during this bootstrap session
5. **Error format consistency**: Same error shape/codes everywhere
6. **Logging consistency**: Same structured log format everywhere
7. **Validation consistency**: Same validation library/approach everywhere
8. **Import consistency**: Same import style/organization everywhere
9. **Test consistency**: Same test patterns/naming everywhere
10. **Completeness**: Every tech stack component covered by at least one skill
11. **No gaps**: No domain that affects code quality is unaddressed

---

## Red Flags (auto-fail)

If any of these are true, the skill MUST be rewritten:

- Contains the word "should" for a security rule (use "must" or "never")
- References a tech/library not in the project's stack
- Contains a code example with syntax errors
- Missing YAML frontmatter
- Missing Activation section
- Missing Core Rules section
- No code examples at all
- Anti-patterns don't explain consequences
- Performance budgets use words like "fast", "efficient", "minimal"
- Identical content to another generated skill (copy-paste)
- Generic advice that applies to any project unchanged
- **Tech versions were not verified via real-time lookup** (used memorized/hardcoded versions instead)
- Code examples use deprecated APIs from older versions instead of the verified latest stable

---

## Version Verification Checklist — MANDATORY

**Every generated skill MUST pass this checklist before being considered complete:**

### Per-Technology Verification
- [ ] **Core language version** verified via official site/registry
- [ ] **Runtime version** verified (Node, Python, JVM, .NET, etc.)
- [ ] **Framework version** verified via docs + registry
- [ ] **Database version** verified via official site
- [ ] **Every dependency** in package manifest has verified version
- [ ] **Linter/formatter** version verified
- [ ] **Testing framework** version verified
- [ ] **CI/CD tool** versions verified

### Documentation Requirements
- [ ] **Verification source** documented for each technology
- [ ] **Verification date** recorded (ISO-8601 format)
- [ ] **Release date** checked (reject if >6 months old)
- [ ] **Breaking changes** documented
- [ ] **Deprecated APIs** identified and avoided

### Code Quality Requirements
- [ ] **All code examples** use latest API syntax only
- [ ] **No deprecated patterns** in any example
- [ ] **Version pragmas** included where applicable (`// @ts-check`, `python3.12`, etc.)
- [ ] **Import statements** show verified package versions

### Manifest Requirements
- [ ] `_bootstrap-manifest.json` includes verification records
- [ ] Each technology has verification metadata
- [ ] Unverified technologies marked with ⚠️ warning

### Language-Specific Checks

**TypeScript/JavaScript:**
- [ ] Node.js >= 22 LTS verified
- [ ] TypeScript >= 5.7 verified
- [ ] All npm packages pinned to exact versions
- [ ] No usage of deprecated Node.js APIs

**Python:**
- [ ] Python >= 3.12 verified
- [ ] pip >= 24.0 verified
- [ ] All packages pinned in requirements.txt
- [ ] Using modern syntax (type params, improved f-strings)

**Go:**
- [ ] Go >= 1.24 verified
- [ ] go.mod uses latest directives
- [ ] No deprecated standard library packages

**Rust:**
- [ ] Rust >= 1.85 verified
- [ ] Cargo.toml uses latest edition
- [ ] No deprecated language features

**Java:**
- [ ] Java >= 21 LTS verified
- [ ] Maven/Gradle using latest plugin versions
- [ ] Using modern features (records, virtual threads)

**Other languages** — apply same rigor for version verification.

---

## Language-Agnostic Quality Bar

These standards apply regardless of programming language:

| Aspect | Requirement | Verification |
|--------|-------------|--------------|
| **Type Safety** | Maximum strictness enabled | Compiler/linter config |
| **Error Handling** | Custom error hierarchy | Code review |
| **Testing** | >80% coverage, all critical paths | CI pipeline |
| **Security** | All OWASP Top 10 addressed | Security scan |
| **Performance** | Concrete budgets defined | Benchmarks |
| **Documentation** | Every public API documented | Doc generation |
| **Versioning** | All deps pinned to verified versions | Manifest audit |
