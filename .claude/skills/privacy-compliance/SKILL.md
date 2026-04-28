---
name: privacy-compliance
description: |
  Protects M3Unator’s local-only privacy model across scanning, logging, downloads, screenshots, docs, and future settings work. Trigger it for any change that stores data, sends requests beyond the scanned origin, adds analytics, updates SECURITY.md, or changes manual testing guidance. Without it, the project can quietly drift from a local utility into something that exposes browsing behavior or misleading privacy claims.
---

# Privacy Compliance

> M3Unator exists to inspect a page locally, not to collect anything about the person using it.

## Activation

This skill activates when:
- Editing network behavior, logging, storage, screenshots, or docs about privacy.
- Adding settings persistence or reporting.
- Changing release notes or security policy language.

## Project Context

| Key | Value |
|-----|-------|
| Project | M3Unator |
| Data Surface | Directory URLs, filenames, user-chosen playlist names, local activity log |
| Relevant Stack | Browser memory only, no backend, downloaded playlist files, public issue reports |
| Key Decisions | No telemetry, no account system, no personal data persistence, public docs must state limits honestly |

---

## Core Rules

### Rule 1: Keep processing local-only

**Rule**: The userscript must not send analytics, telemetry, or diagnostic payloads to third parties.

**Rationale**: Users install M3Unator because it works entirely in-browser against the page they are already visiting.

### Rule 2: Do not persist browsing-derived data

**Rule**: Directory URLs, discovered filenames, and scan logs must stay in memory unless the user explicitly exports a playlist file.

**Rationale**: Local-only processing is the project’s strongest privacy guarantee.

### Rule 3: Keep visible logs ephemeral

**Rule**: Activity logs, stats, and toasts must be session-scoped and cleared on reset or page reload.

**Rationale**: Retaining browsing history inside storage is unnecessary and surprising.

### Rule 4: Be careful with screenshots and issue templates

**Rule**: Screenshots, docs, and bug reports must avoid exposing personal or sensitive directory contents unless deliberately redacted.

**Rationale**: Public repositories make accidental exposure permanent.

### Rule 5: Document privacy truthfully

**Rule**: README and SECURITY text must describe the exact local-only behavior and any future persistence decisions plainly.

**Rationale**: Privacy claims are part of the product contract, not marketing filler.

---

## Approved Patterns

### Pattern: Session-only scan state

**Use when**: Tracking entries, stats, or logs during one page session.

**Implementation**:
```javascript
this.entries = [];
this.seenUrls = new Set();
this.logCache.clear();
```

### Pattern: Redacted troubleshooting request

**Use when**: Asking a user for debugging evidence publicly.

**Implementation**:
```markdown
Please redact private hostnames, personal folder names, and tokens before posting screenshots or logs.
```

---

## Anti-Patterns

### 🔴 Hidden analytics
**Severity**: CRITICAL — blocks merge
**The temptation**: add usage tracking "just for diagnostics."
**The danger**: browsing behavior leaves the browser without explicit consent.
**The fix**: keep diagnostics local and user-initiated.

### 🟠 Persistent scan history
**Severity**: HIGH — must fix before merge
**The temptation**: cache directory history in storage for convenience.
**The danger**: sensitive browsing context outlives the session.
**The fix**: keep state in memory only unless a new privacy review approves otherwise.

---

## Performance Budgets

| Metric | Target | Hard Limit | How to Measure |
|--------|--------|------------|----------------|
| Third-party telemetry requests | 0 | 0 | inspect network-related diff |
| Session data persisted automatically | 0 keys | 0 keys | inspect storage usage |

## Security Checklist

- [ ] No analytics or telemetry endpoints were added.
- [ ] Browsing-derived data stays in memory only.
- [ ] Public docs ask contributors to redact sensitive evidence.
- [ ] Playlist export writes only what the user requested.
- [ ] Privacy claims remain narrow and factual.

## Error Scenarios

| Scenario | Detection | Recovery | User Impact | Severity |
|----------|-----------|----------|-------------|----------|
| Sensitive directory shown in screenshot | Review issue content | request redaction | Accidental disclosure | High |
| New storage use captures scan history | Code review | move to memory-only state | Privacy regression | Critical |
| README overstates privacy behavior | Docs review | correct wording immediately | Misleading expectations | High |

## Edge Cases

### Edge Case: Future settings persistence request
**Scenario**: A feature proposal wants saved defaults between sessions.
**Handling**: require a separate privacy review, explicit opt-in, minimal fields, and updated docs before storage is introduced.
**Code**:
```javascript
const DEFAULTS = { includeVideo: true, includeAudio: true };
// Do not persist without explicit review and opt-in.
```

## Integration Points

| Relationship | Skill | Detail |
|-------------|-------|--------|
| Depends on | `security-hardening` | No hidden outbound data paths |
| Referenced by | `release-distribution` | Release notes and issue templates must preserve privacy |
| Shares decision | `documentation-standards` | Privacy wording must remain factual |

## Pre-Commit Checklist

- [ ] No new outbound analytics or reporting endpoints exist.
- [ ] Scan state remains memory-only by default.
- [ ] Screenshots and issue guidance mention redaction where appropriate.
- [ ] Exported files contain only user-requested playlist content.
- [ ] Docs still match the real privacy model.
