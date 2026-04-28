# Approved Patterns — Userscript Patterns

### Pattern: Namespaced launcher

```javascript
const launcher = document.createElement('button');
launcher.className = 'M3Unator-launcher';
launcher.textContent = 'M3Unator';
```

### Pattern: Idempotent overlay cleanup

```javascript
function removeOverlay() {
  const overlay = document.querySelector('.M3Unator-overlay');
  if (overlay) overlay.remove();
}
```
