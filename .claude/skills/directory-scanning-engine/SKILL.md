---
name: directory-scanning-engine
description: |
  Owns the core M3Unator scan engine: directory discovery, href parsing, server-variant handling, recursion, dedupe, export entry creation, and scan-state transitions. Trigger it for any change to fetchWithRetry, scanDirectory, parser heuristics, file type detection, batch flow, or playlist entry generation. Without this skill, the project loses correctness on Apache/Nginx/LiteSpeed listings or regresses on deep-directory behavior.
---

# Directory Scanning Engine

> Correctness comes first: discover the right files once, classify them once, and recurse only where it is safe and useful.

## Activation

This skill activates when:
- Editing `fetchWithRetry`, `scanDirectory`, `getDirectoryLinks`, `parseLiteSpeedDirectory`, or file-type helpers.
- Changing recursion, queueing, href filters, or playlist entry generation.
- The user asks about scanning bugs, parser behavior, or duplicate results.

## Project Context

| Key | Value |
|-----|-------|
| Project | M3Unator |
| Core Workflow | Fetch directory HTML → parse links → filter → classify → recurse → export entries |
| Relevant Stack | `fetch`, `DOMParser`, href regex fallback, `Map`, `Set`, batched async queues |
| Key Decisions | Support Apache/Nginx-style and LiteSpeed-style listings, skip unsupported links early, dedupe by normalized URL |

---

## Core Rules

### Rule 1: Resolve before classifying

**Rule**: Always turn discovered hrefs into normalized absolute URLs before dedupe, recursion, or playlist export decisions.

**Rationale**: Relative paths and duplicate slash variants are common in directory listings; classification on raw hrefs creates duplicate and inconsistent results.

### Rule 2: Separate parser strategy by server markup

**Rule**: LiteSpeed-style table listings and generic anchor listings must be handled through explicit branches, not one fragile parser path.

**Rationale**: The markup differs materially. Clear parser branches are easier to debug and test.

### Rule 3: Directories and files diverge early

**Rule**: After href filtering, split directory candidates from file candidates before processing.

**Rationale**: File classification and recursive traversal have different correctness and performance constraints.

### Rule 4: Entry titles come from decoded, normalized paths

**Rule**: Playlist entry titles must be derived from decoded, user-readable relative paths, while the entry URL stays absolute.

**Rationale**: Users download playlists for readability as much as correctness; raw encoded titles are poor output.

### Rule 5: Dedupe recursive work by normalized directory URL

**Rule**: The scan engine must never recurse into the same normalized directory twice within one session.

**Rationale**: Duplicate directory links and loop-like listings are normal on public indexes.

---

## Approved Patterns

### Pattern: Split directory and file candidates

**Use when**: Turning parsed hrefs into scan work.

**Implementation**:
```javascript
const directories = [];
const files = [];
for (const href of hrefs) {
  if (href.endsWith('/')) {
    directories.push(href);
  } else {
    files.push(href);
  }
}
```

### Pattern: Media type lookup map

**Use when**: Classifying a file name by extension.

**Implementation**:
```javascript
function isMediaFileOptimized(fileName, extensionMap) {
  const ext = fileName.toLowerCase().split('.').pop();
  return extensionMap.get(ext) || null;
}
```

---

## Anti-Patterns

### 🔴 Recursive scan without dedupe
**Severity**: CRITICAL — blocks merge
**The temptation**: assume directory listings are tree-perfect.
**The danger**: repeated or looping traversal explodes runtime and duplicates output.
**The fix**: dedupe on normalized URL before recursion.

### 🟠 One-parser-for-everything
**Severity**: HIGH — must fix before merge
**The temptation**: rely on one brittle regex or selector for all server types.
**The danger**: one server family breaks every time parsing changes.
**The fix**: keep explicit parser branches by markup family.

---

## Performance Budgets

| Metric | Target | Hard Limit | How to Measure |
|--------|--------|------------|----------------|
| Duplicate recursive directory visits | 0 | 0 | inspect `seenUrls` logic and smoke test |
| Parser branches for supported markup families | 2 explicit branches | 1 mixed branch | inspect scan parser code |
| File processing batch size | 50-100 | 100 | inspect scan batch constant |

## Security Checklist

- [ ] Href candidates are filtered before resolution and recursion.
- [ ] Only safe protocols become recursive targets.
- [ ] Deduplication happens before recursive fetches.
- [ ] Entry titles use decoded readable text without unsafe HTML insertion.
- [ ] Parser changes were tested against both generic and LiteSpeed listings.

## Error Scenarios

| Scenario | Detection | Recovery | User Impact | Severity |
|----------|-----------|----------|-------------|----------|
| Duplicate directory links create loops | repeated scan log entries | skip via normalized URL dedupe | slow or incomplete scan | High |
| Parser misses LiteSpeed rows | empty or partial results on LiteSpeed | restore branch-specific parsing | missing files | High |
| Encoded file names look broken in playlist | unreadable exported titles | decode and preserve safe fallback | messy output | Medium |

## Edge Cases

### Edge Case: Directory contains query links and parent-directory markers
**Scenario**: A listing mixes real children with navigational links.
**Handling**: reject non-scan candidates before building the recursion queue.
**Code**:
```javascript
const filtered = hrefs.filter((href) => href && href !== '../' && !href.startsWith('?') && !href.startsWith('/'));
```

## Integration Points

| Relationship | Skill | Detail |
|-------------|-------|--------|
| Depends on | `data-validation` | Href and depth inputs must be normalized before scan work |
| Referenced by | `performance-optimization` | Queue limits and batching tune this engine |
| Shares decision | `testing-strategy` | Parser changes define the required smoke matrix |

## Pre-Commit Checklist

- [ ] Hrefs are resolved and normalized before use.
- [ ] LiteSpeed and generic listing parsing remain explicit.
- [ ] Directory and file candidates split early.
- [ ] Recursive work dedupes by normalized URL.
- [ ] Export titles stay readable and stable.
