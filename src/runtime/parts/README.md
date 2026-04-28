# Runtime Parts

This directory is the editable source for the shipped userscript.

Order is controlled by `../build-manifest.json`.

Current slices:
- `00-metadata.js`: userscript header
- `10-startup.js`: IIFE start, page gate, top-level directory helpers
- `20-styles.js`: top-level injected style blocks
- `30-log-cache.js`: `LogCache`
- `40-playlist-generator-core.js`: constructor, icons, templates, base state, component factory
- `41-playlist-generator-ui.js`: popup markup, launch button assembly, mount flow, drag behavior
- `41a-playlist-generator-ui-controls.js`: toast flow, popup control wiring, scan action handlers
- `41b-playlist-generator-ui-reset.js`: reset and post-scan UI cleanup helpers
- `42-playlist-generator-errors-network.js`: error mapping, retry fetch, sanitize/decode/path helpers, stat helpers
- `43-playlist-generator-scanner.js`: directory-listing detection, href extraction, scan normalization helpers
- `43a-playlist-generator-scanner-execution.js`: file batching, recursive queueing, scan execution flow
- `44-playlist-generator-output.js`: playlist export, log rendering, reports, stat UI, class close
- `50-bootstrap.js`: runtime bootstrap and final event wiring

Contributor rule:
- Edit the smallest relevant part.
- Run `node scripts/build_userscript.js` after every change.
