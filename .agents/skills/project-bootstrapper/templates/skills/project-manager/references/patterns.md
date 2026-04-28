# Approved Patterns — Project Manager

Patterns for enforcing and maintaining skill compliance across the project.

## Pattern: Pre-Task Skill Reading

**Context**: Starting any development task
**Problem**: Developers forget to read skills before coding
**Solution**: Systematic skill reading workflow

```typescript
// Pattern: Always read skills first
async function startDevelopmentTask(task: Task) {
  // 1. Identify affected files
  const affectedFiles = await identifyFiles(task);
  
  // 2. Map files to skills
  const relevantSkills = affectedFiles.flatMap(file => {
    if (file.endsWith('.ts')) return ['typescript-standards', 'error-handling'];
    if (file.includes('api/')) return ['api-design', 'security-hardening'];
    if (file.includes('db/')) return ['database-design', 'privacy-compliance'];
    return ['project-architecture'];
  });
  
  // 3. Read unique skills
  const uniqueSkills = [...new Set(relevantSkills)];
  for (const skill of uniqueSkills) {
    await readSkill(`.claude/skills/${skill}/SKILL.md`);
  }
  
  // 4. Now proceed with task
  return implementTask(task, uniqueSkills);
}
```

**Testing**: Verify all relevant skills are read before implementation

---

## Pattern: Automated Compliance Check

**Context**: Before committing code
**Problem**: Manual compliance checking is error-prone
**Solution**: Automated validation pipeline

```python
# scripts/check_compliance.py
import subprocess
import sys
from pathlib import Path

def check_compliance():
    """Full compliance check before commit."""
    checks = [
        ("Skill Validation", "python scripts/validate_bootstrap.py .claude/skills/"),
        ("Version Check", "python scripts/version_checker.py .claude/skills/"),
        ("Type Check", "npm run typecheck"),
        ("Lint", "npm run lint"),
        ("Tests", "npm run test:ci"),
    ]
    
    for name, command in checks:
        print(f"🔍 {name}...")
        result = subprocess.run(command, shell=True)
        if result.returncode != 0:
            print(f"❌ {name} FAILED")
            return False
        print(f"✅ {name} PASSED")
    
    return True

if __name__ == "__main__":
    sys.exit(0 if check_compliance() else 1)
```

**Gotchas**: 
- Ensure all scripts exist before running
- Handle different languages (npm, pip, etc.)
- Make checks fast (< 30 seconds total)

---

## Pattern: Skill-Aware Code Review

**Context**: Reviewing pull requests
**Problem**: Reviewers miss skill violations
**Solution**: Skill-focused review checklist

```markdown
## PR Review Checklist

### Skill Compliance
- [ ] All modified files follow relevant skills
- [ ] New dependencies approved by dependency-management skill
- [ ] No deprecated patterns used
- [ ] Performance budgets respected
- [ ] Security requirements met

### Specific Skills to Check
- [ ] typescript-standards (for .ts files)
- [ ] api-design (for API routes)
- [ ] security-hardening (for auth/data)
- [ ] testing-strategy (for test files)
- [ ] database-design (for migrations/queries)

### Verification
- [ ] `python scripts/check_skill_compliance.py` passes
- [ ] All CI checks green
- [ ] No new warnings introduced
```

---

## Pattern: Skill Drift Alert

**Context**: Detecting when code diverges from skills
**Problem**: Gradual drift goes unnoticed
**Solution**: Automated drift detection

```python
# scripts/detect_drift.py
import json
from datetime import datetime, timedelta
from pathlib import Path

def detect_drift():
    """Detect skill drift in codebase."""
    drift_indicators = {
        'pattern_pollution': [],
        'library_proliferation': [],
        'style_inconsistency': [],
        'test_erosion': [],
    }
    
    # Check for non-skill patterns
    skills = load_skills()
    codebase = analyze_codebase()
    
    for file in codebase:
        file_patterns = extract_patterns(file)
        for pattern in file_patterns:
            if not is_in_skills(pattern, skills):
                drift_indicators['pattern_pollution'].append({
                    'file': file,
                    'pattern': pattern,
                    'suggestion': find_skill_equivalent(pattern, skills)
                })
    
    return drift_indicators
```

---

## Pattern: Progressive Skill Adoption

**Context**: Introducing skills to existing codebase
**Problem**: Can't fix everything at once
**Solution**: Phased adoption strategy

```
Phase 1: Stop the bleeding (Week 1)
└── Enforce skills on all NEW code only
└── Legacy code grandfathered temporarily

Phase 2: Critical path (Weeks 2-4)
└── Refactor security-critical code
└── Fix error-handling violations
└── Update authentication patterns

Phase 3: Systematic cleanup (Months 2-3)
└── Refactor by module/feature
└── Update tests to match skills
└── Remove deprecated patterns

Phase 4: Full compliance (Ongoing)
└── 100% skill compliance
└── Automated enforcement
└── Regular drift detection
```

---

## Pattern: Skill Update Notification

**Context**: Skills are updated
**Problem**: Developers don't know skills changed
**Solution**: Automated notification system

```python
# scripts/notify_skill_update.py
import json
from pathlib import Path

def notify_skill_update(skill_name: str, changes: list):
    """Notify team of skill updates."""
    notification = {
        'skill': skill_name,
        'changes': changes,
        'action_required': identify_affected_code(skill_name),
        'migration_guide': generate_migration_guide(skill_name, changes),
    }
    
    # Post to Slack/Discord
    post_to_chat(notification)
    
    # Create GitHub issue
    create_tracking_issue(notification)
    
    # Update project board
    add_to_project_board(notification)
```

---

## Pattern: Skill-Based Refactoring

**Context**: Refactoring legacy code
**Problem**: Unsure which skills apply
**Solution**: Skill-guided refactoring

```typescript
// Before refactoring:
// 1. Identify which skills apply to this module
const applicableSkills = [
  'typescript-standards',
  'error-handling',
  'database-design',
];

// 2. Read skill anti-patterns
const antiPatterns = applicableSkills.flatMap(skill => 
  readAntiPatterns(skill)
);

// 3. Check current code for anti-patterns
const violations = findViolations(code, antiPatterns);

// 4. Refactor using skill patterns
const refactored = applicableSkills.reduce((code, skill) => {
  const patterns = readPatterns(skill);
  return applyPatterns(code, patterns);
}, originalCode);

// 5. Verify no anti-patterns remain
assertNoViolations(refactored, antiPatterns);
```

---

## Pattern: Skill Documentation in Code

**Context**: Explaining why code is written a certain way
**Problem**: Developers don't know which skill requires pattern
**Solution**: Reference skills in comments

```typescript
// Skill: typescript-standards Rule 12
// Always use explicit return types for public functions
export async function getUser(id: string): Promise<User | null> {
  // ...
}

// Skill: security-hardening Rule 8
// Never construct SQL with string interpolation
const result = await db.query(
  'SELECT * FROM users WHERE id = $1',
  [id] // Parameterized query
);

// Skill: error-handling Rule 3
// Wrap external errors with context
throw new DatabaseError('Failed to fetch user', {
  userId: id,
  cause: error, // Preserve original error
});
```

---

## Pattern: Skill Coverage Analysis

**Context**: Understanding which skills apply where
**Problem**: Unclear skill coverage gaps
**Solution**: Coverage mapping

```python
# scripts/analyze_coverage.py
def analyze_skill_coverage():
    """Map skills to codebase coverage."""
    coverage = {}
    
    for skill in get_all_skills():
        coverage[skill] = {
            'applies_to': get_file_patterns(skill),
            'files_covered': [],
            'files_violating': [],
            'files_not_checked': [],
        }
    
    for file in get_all_source_files():
        applicable = get_applicable_skills(file)
        for skill in applicable:
            if is_compliant(file, skill):
                coverage[skill]['files_covered'].append(file)
            else:
                coverage[skill]['files_violating'].append(file)
    
    return coverage
```

---

## Pattern: Compliance Dashboard

**Context**: Visualizing project health
**Problem**: Hard to see compliance at a glance
**Solution**: Dashboard with key metrics

```
╔═══════════════════════════════════════════════════════════╗
║  SKILL COMPLIANCE DASHBOARD                               ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  Overall Compliance: 94% ████████████████████░░           ║
║                                                           ║
║  By Skill:                                                ║
║  • typescript-standards     98% ████████████████████░     ║
║  • security-hardening       95% ███████████████████░░     ║
║  • error-handling           92% ██████████████████░░░     ║
║  • testing-strategy         88% █████████████████░░░░     ║
║                                                           ║
║  Recent Violations:                                       ║
║  • src/auth/login.ts (2 issues) → Fix by Friday           ║
║  • src/utils/helpers.ts (1 issue) → Fix by Friday         ║
║                                                           ║
║  Trend: ↗️ Improving (+3% this week)                      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```
