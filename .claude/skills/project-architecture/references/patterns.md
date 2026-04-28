# Approved Patterns — Project Architecture

## Runtime Boundary

### Pattern: Root artifact plus contributor tooling

**Context**: M3Unator ships as a raw userscript and cannot depend on a bundler yet.
**Problem**: Contributors still need validators and governance scripts.

```javascript
// Runtime artifact
// M3Unator.user.js
(function () {
  'use strict';
  class PlaylistGenerator {}
})();

// Contributor tooling
// scripts/validate_bootstrap.js
console.log('Validate skill suite locally');
```

**Testing this pattern**:
```bash
node scripts/validate_bootstrap.js .claude/skills/
```

**Gotchas**:
- Do not import `scripts/` code from the userscript.
- Do not add a second shipped runtime file without a bundling plan.

## Logical Sections

### Pattern: Concern-based method grouping

**Context**: A single-file runtime needs maintainable internal seams.
**Problem**: Large features become unreadable when helpers are scattered randomly.

```javascript
class PlaylistGenerator {
  // Parsing helpers
  normalizeUrl(url) {
    return url.endsWith('/') ? url : `${url}/`;
  }

  // UI helpers
  updateCounter(count) {
    this.domElements.stats.totalFiles.textContent = String(count);
  }

  // Scan workflow
  async scanDirectory(url, currentPath = '', depth = 0) {
    return [];
  }
}
```

**Testing this pattern**:
```bash
rg -n "normalizeUrl|updateCounter|scanDirectory" M3Unator.user.js
```
