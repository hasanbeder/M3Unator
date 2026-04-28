# Approved Patterns — Directory Scanning Engine

### Pattern: Branch by markup family

```javascript
if (doc.querySelector('div#table-list')) {
  // LiteSpeed table parsing
} else {
  // Generic anchor parsing
}
```

### Pattern: Directory/file split

```javascript
const directories = hrefs.filter((href) => href.endsWith('/'));
const files = hrefs.filter((href) => !href.endsWith('/'));
```
