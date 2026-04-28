# Anti-Patterns — Project Manager

Patterns that undermine skill governance and project consistency.

## Severity Guide

- 🔴 **CRITICAL**: Breaks skill system, introduces chaos — block immediately
- 🟠 **HIGH**: Significant compliance risk — fix within 24 hours
- 🟡 **MEDIUM**: Degrades skill effectiveness — fix within 1 week
- 🟢 **LOW**: Minor inconsistency — fix when convenient

---

### 🔴 AP-001: Coding Without Reading Skills

**What it looks like**:
```
Dev: "I'll just implement this feature..."
[Writes 200 lines of code]
AI: "Let me review..."
[Finds 15 skill violations]
```

**Why it's dangerous**:
- Accumulates massive technical debt
- Violations compound over time
- Retrofitting costs 10x more than doing it right
- Team loses trust in skill system

**What happens in production**:
```
Week 1: Quick feature delivered
Week 4: Security audit finds SQL injection
Week 6: Performance issues from N+1 queries
Week 8: Full refactor needed, 3 sprints lost
```

**Fix**:
```
Dev: "I'll implement this feature"
AI: "First, let me identify the relevant skills..."
[Reads 3 skill files, 5 minutes]
AI: "Now I'll implement following these rules..."
[Writes 180 lines of compliant code]
```

**Detection**:
- Code reviews find multiple skill violations
- Pre-commit hooks fail repeatedly
- Developer asks "why can't I use X?" (X is anti-pattern in skill)

---

### 🔴 AP-002: Selective Skill Adherence

**What it looks like**:
```typescript
// Developer follows skill partially
// Skill: "Always use explicit return types"
function getUser(id: string) {  // ❌ Missing return type
  return db.query(...);
}

function getPosts(): Promise<Post[]> {  // ✅ Return type present
  return db.query(...);
}
```

**Why it's dangerous**:
- Creates inconsistency across codebase
- "I follow the skill when it's convenient"
- Undermines skill authority
- Other developers get confused

**What happens in production**:
- Some modules well-structured, others chaotic
- New team members can't rely on patterns
- Refactoring becomes unpredictable

**Fix**:
```typescript
// Follow skill completely
function getUser(id: string): Promise<User | null> {
  return db.query(...);
}

function getPosts(): Promise<Post[]> {
  return db.query(...);
}
```

**Detection**:
- Inconsistent code style within same file
- Some functions follow patterns, others don't
- Developer says "I didn't think that rule applied here"

---

### 🔴 AP-003: Skill Shopping

**What it looks like**:
```
Dev: "The skill says to use Zod, but I prefer Joi. 
      Let me check if there's any skill that mentions Joi..."
[Finds unrelated skill mentioning Joi in deprecated section]
Dev: "See! The skill mentions Joi, so I can use it!"
```

**Why it's dangerous**:
- Deliberate misinterpretation of skills
- Breaks consistency
- Sets precedent for ignoring skills
- Other developers follow bad example

**What happens in production**:
- Multiple validation libraries in same project
- Inconsistent validation patterns
- Security gaps from deprecated libraries

**Fix**:
```
Dev: "I prefer Joi, but the skill specifies Zod."
AI: "Skills are non-negotiable. Use Zod."
Dev: "But..."
AI: "Use Zod. If you want to discuss changing the skill, 
     propose an update to the skill file, not the code."
```

**Detection**:
- Developer searches skills for justification
- Uses out-of-context skill quotes
- Argues about skill interpretation

---

### 🟠 AP-004: "I'll Fix It Later"

**What it looks like**:
```typescript
// Developer knows this violates skill
function processData(data: any) {  // ❌ Shouldn't use 'any'
  // TODO: Fix types later
  return transform(data);
}
```

**Why it's dangerous**:
- "Later" never comes
- TODOs accumulate
- Technical debt compounds
- Eventually requires massive refactor

**What happens in production**:
```
Sprint 1: 5 TODOs added
Sprint 5: 47 TODOs, team overwhelmed
Sprint 10: "We need a refactoring sprint"
Sprint 11-13: No features, only debt repayment
```

**Fix**:
```typescript
// Fix immediately
interface DataInput {
  id: string;
  value: number;
}

function processData(data: DataInput): ProcessedData {
  return transform(data);
}
```

**Detection**:
- TODO comments about skill violations
- Developer says "I know it's wrong but..."
- "Let's merge and fix later"

---

### 🟠 AP-005: Skill Workarounds

**What it looks like**:
```typescript
// Skill says: "Don't use global state"
// Developer workaround:
const __globalStore = {};  // Not "global", just "module-level"

export function getState() {
  return __globalStore;  // ❌ Still global state!
}
```

**Why it's dangerous**:
- Violates skill spirit while technically complying
- Creates fragile, hard-to-maintain code
- Other developers copy the workaround
- Skill becomes meaningless

**What happens in production**:
- Hidden dependencies
- Unpredictable behavior
- Testing becomes impossible
- Refactoring breaks everything

**Fix**:
```typescript
// Follow skill properly
// Use dependency injection or explicit state passing
function processWithState(data: Input, state: AppState) {
  // Explicit, testable, clear
}
```

**Detection**:
- Code that "technically" follows skill but violates spirit
- Convoluted workarounds
- Developer proud of "clever" solution

---

### 🟠 AP-006: Skill File Modification Without Review

**What it looks like**:
```bash
# Developer changes skill file directly
vim .claude/skills/typescript-standards/SKILL.md
# Changes "never use any" to "avoid using any when possible"
git add .claude/skills/typescript-standards/SKILL.md
git commit -m "relax type requirements"
```

**Why it's dangerous**:
- Skills are project constitution
- Can't be changed unilaterally
- Breaks consistency
- Undermines skill authority

**What happens in production**:
- Skills drift over time
- No longer reliable
- Team argues about "real" rules
- Project loses direction

**Fix**:
```bash
# Skill changes require review process
git checkout -b proposal/relax-any-rule
# Edit skill file
git add .claude/skills/typescript-standards/SKILL.md
git commit -m "Proposal: Relax 'never any' to 'avoid any'"
# Open PR, discuss with team
# If approved, merge
# If rejected, abandon
```

**Detection**:
- Skill files modified in feature branches
- Commit messages mentioning skill changes
- Skill drift over time

---

### 🟡 AP-007: Ignoring Skill Updates

**What it looks like**:
```
Week 1: Skill updated to require new error format
Week 3: Developer still using old error format
Week 5: PR rejected for non-compliant errors
Dev: "I didn't know the skill changed!"
```

**Why it's dangerous**:
- Old patterns persist
- Inconsistency between old and new code
- Skill improvements don't take effect

**What happens in production**:
- Two error formats in same codebase
- Confusion about which to use
- Refactoring never completes

**Fix**:
```
# Automated skill update notifications
# When skill changes:
1. Post to team chat
2. Create GitHub issue
3. Add to sprint board
4. Update affected code within 1 week
```

**Detection**:
- Code reviews mention "skill was updated"
- Developer uses deprecated patterns
- Skill modification time is recent, but code is old style

---

### 🟡 AP-008: Partial Skill File Reading

**What it looks like**:
```
AI: "I'll implement user authentication"
[Skims security-hardening skill]
AI: "I see we need JWT tokens, I'll implement that"
[Misses section on httpOnly cookies]
[Misses section on refresh token rotation]
[Misses section on brute force protection]
```

**Why it's dangerous**:
- Misses critical requirements
- Partial compliance is non-compliance
- Creates security gaps

**What happens in production**:
- JWT stored in localStorage (XSS vulnerability)
- No refresh token rotation
- Account takeover possible

**Fix**:
```
AI: "I'll implement user authentication"
[Reads ENTIRE security-hardening skill]
[Reads ENTIRE auth-patterns skill]
[Takes notes on all requirements]
AI: "The skills require:
     1. httpOnly cookies
     2. Refresh token rotation
     3. Rate limiting
     4. etc..."
[Implements all requirements]
```

**Detection**:
- Some security requirements met, others missing
- Developer says "I didn't see that part"
- Inconsistent implementation

---

### 🟡 AP-009: Skill Version Confusion

**What it looks like**:
```typescript
// Developer uses skill from 3 months ago
// Skill was updated since then
function oldPattern() {  // ❌ Deprecated
  // ...
}

// Newer code uses updated skill
function newPattern() {  // ✅ Current
  // ...
}
```

**Why it's dangerous**:
- Inconsistency across codebase
- Old bugs persist
- New improvements not adopted

**What happens in production**:
- Multiple patterns for same thing
- Developer confusion
- Refactoring never ends

**Fix**:
```bash
# Check skill modification dates
ls -la .claude/skills/*/SKILL.md

# Read skills before every task
# Use skill management tool to track updates
python scripts/check_skill_updates.py
```

**Detection**:
- Mix of old and new patterns
- Skill file modified recently
- Developer references outdated rules

---

### 🟢 AP-010: Not Documenting Skill References

**What it looks like**:
```typescript
// Why is this written this way?
// New developer has no idea
function complexFunction() {
  // Complex implementation
  // But why?
}
```

**Why it's dangerous**:
- Future developers don't know rationale
- Refactoring removes "weird" code that's actually required
- Knowledge is lost

**Fix**:
```typescript
// Skill: security-hardening Rule 12
// Must validate input before processing
function complexFunction(data: Input) {
  // Validation required by skill
  validateInput(data);
  // ...
}
```

**Detection**:
- Non-obvious code without comments
- Developer asks "why is it done this way?"
- Refactoring breaks things

---

### 🔴 AP-011: Disabling Skill Checks

**What it looks like**:
```bash
# Developer bypasses pre-commit hook
git commit -m "feature" --no-verify

# Or removes checks from CI
# .github/workflows/ci.yml
# - name: Skill Check
#   run: python scripts/check_compliance.py  # Commented out!
```

**Why it's dangerous**:
- Circumvents entire skill system
- No safety net
- Bad code gets committed
- Skills become meaningless

**What happens in production**:
- Codebase rapidly deteriorates
- Skills ignored
- Project chaos

**Fix**:
```bash
# Never bypass checks
# If checks are failing, FIX THE CODE

# If check is wrong, fix the check
# Don't disable it

# Require admin approval to disable
```

**Detection**:
- `--no-verify` flags in git log
- Commented out CI checks
- Developer complains "checks are too strict"

---

### 🟠 AP-012: Secretly Adding Dependencies

**What it looks like**:
```bash
# Developer adds library without checking dependency-management skill
npm install cool-new-library
# Doesn't update skill approval list
# Doesn't document why
```

**Why it's dangerous**:
- Violates dependency governance
- Security risk (unvetted library)
- Consistency broken
- License compliance risk

**Fix**:
```bash
# Check dependency-management skill first
# Follow approval process
# Document in skill if approved
```

**Detection**:
- New dependencies in package.json without skill update
- Developer says "it's just a small library"
- No documentation for why library was chosen
