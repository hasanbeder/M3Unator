# Source Layout

`src/runtime/parts/` is the source of truth for the shipped userscript.

Current state:
- The runtime is still shipped as one installable userscript.
- `src/runtime/build-manifest.json` defines the assembly order.
- `src/runtime/M3Unator.user.js`, root `M3Unator.user.js`, and root `M3Unator.meta.js` are generated artifacts.

Contributor flow:
1. Edit the relevant file under `src/runtime/parts/`
2. Run `node scripts/build_userscript.js`
3. Run the validator scripts before commit

Planned next step:
- Promote additional listing families such as Lighttpd, IIS, and Caddy into the browser smoke matrix so the runtime e2e surface catches the same parser classes covered by the logic suite.
