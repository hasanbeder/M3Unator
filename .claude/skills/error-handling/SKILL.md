---
name: error-handling
description: |
  Defines how M3Unator classifies, logs, surfaces, and recovers from errors in scanning, parsing, UI operations, and release tooling. Use it whenever touching fetch retries, directory recursion, DOM updates, validation helpers, toasts, or contributor scripts. Without this skill, user-facing errors become noisy, internal errors leak raw details, and partial scans fail unpredictably.
---

# Error Handling

> Catch at the browser boundary, preserve context, and tell the user only what helps them recover.

## Activation

This skill activates when:
- Editing retry logic, scanning loops, parsing helpers, UI actions, or download flow.
- Changing log entries, toast messages, or cancellation behavior.
- The user asks about failures, crashes, retries, or resilience.

## Project Context

| Key | Value |
|-----|-------|
| Project | M3Unator |
| Error Surfaces | Network requests, malformed directory HTML, decode failures, user cancellation, DOM state |
| Relevant Stack | `fetch`, recursive scan loop, toast UI, scan log, manual QA |
| Key Decisions | Log detailed context locally, show short recovery-oriented messages, keep scans resumable when possible |

---

## Core Rules

### Rule 1: Catch at scan and UI boundaries

**Rule**: Network, parsing, download, and UI event boundaries must wrap failures and convert them into structured local handling.

**Rationale**: Boundary catches let the script recover, increment stats, and show a useful toast instead of crashing the whole interaction.

### Rule 2: User messages stay short and actionable

**Rule**: Toasts and visible messages must describe what failed and what the user can do next, without raw stack traces.

**Rationale**: End users need recovery guidance, not browser-internal details.

### Rule 3: Log context once, not everywhere

**Rule**: Enrich an error with operation context at the boundary and write one meaningful log entry instead of repeated nested logs.

**Rationale**: Repeated logging makes the activity panel noisy and hides the actual failure source.

### Rule 4: Cancellation is not an error

**Rule**: Pause and cancel paths must update UI state cleanly and must not be counted as generic failures unless the cleanup itself fails.

**Rationale**: Users intentionally cancel scans. Treating that as a crash corrupts stats and trust.

### Rule 5: Recover from partial failure when safe

**Rule**: A single bad directory or file must not abort the entire playlist build if the remaining scan state is still trustworthy.

**Rationale**: Public directory listings are messy. Graceful degradation preserves the useful part of the result set.

---

## Approved Patterns

### Pattern: Context-rich boundary catch

**Use when**: A network or parsing operation can fail without invalidating the whole session.

**Implementation**:
```javascript
async function loadDirectory(url) {
  try {
    const response = await fetch(url);
    return await response.text();
  } catch (error) {
    throw new Error(`scan-directory failed for ${url}: ${error.message}`);
  }
}
```

### Pattern: Recovery-first toast

**Use when**: Reporting a visible problem to the user.

**Implementation**:
```javascript
function showNetworkError(showToast) {
  showToast('Connection failed. Try the scan again or reduce depth.', 'warning');
}
```

---

## Anti-Patterns

### 🔴 Empty catch block
**Severity**: CRITICAL — blocks merge
**The temptation**: swallow a flaky failure and move on.
**The danger**: state corrupts silently and later failures become impossible to explain.
**The fix**: log once with context and recover or rethrow.

### 🟠 Raw exception dump to the user
**Severity**: HIGH — must fix before merge
**The temptation**: display `error.message` directly in UI everywhere.
**The danger**: browser and server internals leak into user-facing messaging.
**The fix**: translate to a short recovery-oriented toast.

---

## Performance Budgets

| Metric | Target | Hard Limit | How to Measure |
|--------|--------|------------|----------------|
| Visible toast count per single failure | 1 | 2 | observe failed scan once |
| Duplicate log lines per failure | 0 | 1 duplicate | inspect activity log |

## Security Checklist

- [ ] User-facing errors do not expose stack traces or private URLs unnecessarily.
- [ ] Failure logging stays local to the browser session.
- [ ] Cancellation does not masquerade as a crash.
- [ ] Retry logic does not ignore repeated unsafe failures.
- [ ] Boundary catches preserve enough context for debugging.

## Error Scenarios

| Scenario | Detection | Recovery | User Impact | Severity |
|----------|-----------|----------|-------------|----------|
| Fetch timeout | timeout or retry exhaustion | show warning, continue with remaining entries | Partial playlist | High |
| Malformed encoded filename | decode helper throws | preserve original string and log warning | Slightly messy title | Medium |
| User cancel mid-scan | cancel action triggered | reset UI state without crash count inflation | Intentional stop | Low |

## Edge Cases

### Edge Case: One subdirectory loops or fails repeatedly
**Scenario**: Recursive scan hits a problematic child directory while others remain healthy.
**Handling**: log the specific directory failure and continue the broader scan.
**Code**:
```javascript
try {
  await this.scanDirectory(childUrl, childPath, depth + 1);
} catch (error) {
  this.addLogEntry(`Subdirectory failed: ${childPath}`, 'warning');
}
```

## Integration Points

| Relationship | Skill | Detail |
|-------------|-------|--------|
| Depends on | `security-hardening` | Visible errors must not leak unsafe detail |
| Referenced by | `directory-scanning-engine` | Scan retries and recursion follow these rules |
| Shares decision | `ui-engineering` | Toasts and log panes expose failures consistently |

## Pre-Commit Checklist

- [ ] New failure paths are caught at a clear boundary.
- [ ] User-facing messages are short and actionable.
- [ ] Cancellation and pause behavior do not count as generic crashes.
- [ ] A single bad directory does not abort the entire scan without cause.
- [ ] Failure logging is concise and local.
