# Approved Patterns — UI Engineering

### Pattern: Namespaced toast

```javascript
const toast = document.createElement('div');
toast.className = 'M3Unator-toast success';
toast.textContent = 'Playlist created';
```

### Pattern: Center-on-open modal

```javascript
const centerX = (window.innerWidth - popup.offsetWidth) / 2;
const centerY = (window.innerHeight - popup.offsetHeight) / 2;
popup.style.left = `${Math.max(0, centerX)}px`;
popup.style.top = `${Math.max(0, centerY)}px`;
```
