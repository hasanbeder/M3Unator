---
name: performance-optimization
description: |
  Sets scan, UI, and memory budgets for M3Unator and must trigger for any change to recursion, batching, caching, DOM update frequency, supported format handling, or retry behavior. Use it for performance tuning, large-directory work, or when the user reports slowness. Without this skill, the userscript regresses from a responsive browser utility into a memory-heavy long-running page script.
---

# Performance Optimization

> Fast scans matter, but responsiveness and bounded memory matter more than raw fan-out.

## Activation

This skill activates when:
- Editing batching, concurrency, retries, caching, or log update frequency.
- Changing file type detection or recursive directory traversal.
- Investigating slow scans or browser jank.

## Project Context

| Key | Value |
|-----|-------|
| Project | M3Unator |
| Hot Paths | href parsing, file classification, recursive scan queue, log updates |
| Relevant Stack | `Map`, `Set`, batched `Promise.all`, incremental UI counters |
| Key Decisions | Deduplicate aggressively, update UI in batches, favor bounded concurrency over maximal concurrency |

---

## Core Rules

### Rule 1: Keep lookups constant-time on hot paths

**Rule**: File type classification and seen-URL deduplication must use `Map` or `Set`, not repeated array scans.

**Rationale**: Large open directories turn small lookup inefficiencies into noticeable browser lag.

### Rule 2: Batch work before touching the DOM

**Rule**: File processing may happen frequently, but visible log or counter updates must be coalesced instead of firing on every item.

**Rationale**: DOM churn is one of the fastest ways to freeze the page during deep scans.

### Rule 3: Concurrency must be bounded

**Rule**: Directory recursion and file processing must have explicit caps; never fan out unbounded `Promise.all` across unknown directory trees.

**Rationale**: Unbounded concurrency can lock the browser or trigger server throttling.

### Rule 4: Cache only what reduces real repeat work

**Rule**: Caches such as `seenUrls` and log buffers must have size limits and cleanup paths.

**Rationale**: Unbounded caches trade one performance issue for another: runaway memory growth.

### Rule 5: Retry only transient failures

**Rule**: Retry logic must stop on permanent failures like cancellation or obvious missing paths, and back off on transient fetch errors.

**Rationale**: Retrying permanent failure wastes time and creates noisy logs.

---

## Approved Patterns

### Pattern: Bounded queue

**Use when**: Recursing through many directories.

**Implementation**:
```javascript
const queue = [...directories];
const active = new Set();
while (queue.length > 0 || active.size > 0) {
  while (queue.length > 0 && active.size < 15) {
    const promise = this.scanDirectory(queue.shift()).finally(() => active.delete(promise));
    active.add(promise);
  }
  if (active.size > 0) await Promise.race(active);
}
```

### Pattern: Coalesced progress update

**Use when**: Reporting progress from a large batch.

**Implementation**:
```javascript
if (processed % 20 === 0 || processed === total) {
  this.addLogEntry(`Batch progress: ${processed}/${total}`, 'info');
}
```

---

## Anti-Patterns

### 🔴 Unbounded recursion fan-out
**Severity**: CRITICAL — blocks merge
**The temptation**: recurse on every directory immediately.
**The danger**: browser memory and network usage spike uncontrollably.
**The fix**: keep a bounded active request set.

### 🟠 Per-item DOM update
**Severity**: HIGH — must fix before merge
**The temptation**: update logs or counters on every processed file.
**The danger**: the UI becomes the bottleneck instead of the network.
**The fix**: coalesce visible updates.

---

## Performance Budgets

| Metric | Target | Hard Limit | How to Measure |
|--------|--------|------------|----------------|
| Parallel directory scans | 10-15 | 15 | inspect active queue limit |
| File batch size | 50-100 | 100 | inspect batch constant |
| Visible progress updates | every 20 items or batch end | every item | inspect progress log logic |
| Seen URL cache size | ≤ 5000 entries | 5000 entries | inspect cache cap |

## Security Checklist

- [ ] Concurrency limits do not bypass URL validation or safety checks.
- [ ] Retry logic stops on permanent failures and cancellations.
- [ ] Cache cleanup does not retain sensitive data longer than needed.
- [ ] Performance shortcuts do not reintroduce unsafe HTML parsing or storage.
- [ ] UI updates remain bounded and local-only.

## Error Scenarios

| Scenario | Detection | Recovery | User Impact | Severity |
|----------|-----------|----------|-------------|----------|
| Browser jank during large scan | visible stutter | reduce DOM updates, keep queue bounded | sluggish page | High |
| Memory growth from unbounded cache | repeated long scans | trim cache and clear logs | degraded browser session | High |
| Retry storm on permanent failures | repeated same warnings | stop retrying those cases | slower scans | Medium |

## Edge Cases

### Edge Case: Deep directory tree with many duplicates
**Scenario**: A scan sees repeated directory links or loops.
**Handling**: use `seenUrls` with a size cap and skip duplicates before recursion.
**Code**:
```javascript
if (this.seenUrls.has(normalizedUrl)) {
  return this.entries;
}
this.seenUrls.add(normalizedUrl);
```

## Integration Points

| Relationship | Skill | Detail |
|-------------|-------|--------|
| Depends on | `directory-scanning-engine` | Queue and cache rules apply to the scan core |
| Referenced by | `testing-strategy` | Large-directory smoke checks validate these budgets |
| Shares decision | `javascript-standards` | `Map`/`Set` are the preferred hot-path structures |

## Pre-Commit Checklist

- [ ] New hot-path lookups stay constant-time.
- [ ] Concurrency remains explicitly bounded.
- [ ] UI updates are batched instead of per-item.
- [ ] Caches have limits and cleanup.
- [ ] Retry logic distinguishes transient vs permanent failures.
