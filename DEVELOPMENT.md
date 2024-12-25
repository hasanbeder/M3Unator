# M3Unator Development Documentation

## 🛠️ Development Environment Setup

### Requirements

* A modern web browser (Chrome, Firefox, Edge, Safari)
* A text editor or IDE (VS Code recommended)
* Git
* Tampermonkey or Violentmonkey

### Setup Steps

1. Clone the project:
   ```bash
   git clone https://github.com/hasanbeder/M3Unator.git
   cd M3Unator
   ```

2. Enable developer mode in your browser:
   * Chrome/Edge: Extensions > Developer mode
   * Firefox: about:debugging > This Firefox > Load Temporary Add-on

3. Set file permissions in your userscript manager:
   * File system access
   * GM_* APIs
   * Cross-origin requests

## 📁 Project Structure

```
M3Unator/
├── .github/                    # GitHub configurations
├── screenshots/                # Screenshots and UI examples
├── tests/                     # Manual testing guide
├── wiki/                      # Documentation wiki
├── M3Unator.user.js           # Main script file
├── M3Unator.meta.js           # Metadata file
├── README.md                  # Project documentation
├── DEVELOPMENT.md             # Development guide
├── CONTRIBUTING.md            # Contribution guide
├── CHANGELOG.md               # Version history
├── SECURITY.md                # Security policy
└── LICENSE                    # License file
```

## 🔧 Code Structure

### Main Components

1. **UI Management**
   * Modal window creation
   * Form elements
   * Progress indicators
   * Status messages

2. **File System Operations**
   * Directory scanning
   * File filtering
   * M3U creation

3. **State Management**
   * Scanning status
   * Statistics
   * Error handling

### Important Functions

* `initializeUI()` - Initializes user interface
* `scanDirectory()` - Performs directory scanning
* `createM3U()` - Creates M3U file
* `handleError()` - Handles errors

## 🧪 Testing

### Manual Testing

1. Install userscript in your browser
2. Follow the testing guide in `/tests/manual_testing_guide.md`
3. Test all features systematically
4. Document any issues found

### Test Categories

* UI Elements
* File Operations
* Error Handling
* Settings Management
* Performance
* Internationalization
* User Experience

## 📝 Coding Standards

### JavaScript

* Use ES6+ features
* Prefer async/await
* Use class-based structure
* Document with JSDoc

### Style Rules

* 2 spaces for indentation
* Use semicolons
* Prefer single quotes
* Use camelCase naming

### Example Code

```javascript
class MediaScanner {
  constructor(options) {
    this.options = options;
    this.stats = {
      files: 0,
      directories: 0
    };
  }

  async scan() {
    try {
      // Implementation
    } catch (error) {
      this.handleError(error);
    }
  }
}
```

## 🚀 Deployment

### Version Numbering

* Semantic Versioning (MAJOR.MINOR.PATCH)
* CHANGELOG.md updates
* Git tags

### Release Checklist

1. Run manual tests
2. Update version number
3. Update CHANGELOG.md
4. Update meta file
5. Create commit and tag
6. Push to GitHub

## 🐛 Debugging

### Browser Developer Tools

* Console messages
* Network requests
* Performance profiling
* Memory leaks

### Common Issues

1. File system permissions
2. Cross-origin requests
3. Memory usage
4. Performance bottlenecks

## 🔒 Security

### Checklist

* Validate user data
* XSS protection
* File system restrictions
* API security

### Best Practices

* Input validation
* Output encoding
* Error handling
* Secure defaults

## 📚 Resources

* [JavaScript MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
* [Tampermonkey Docs](https://www.tampermonkey.net/documentation.php)
* [M3U Format Guide](https://github.com/hasanbeder/M3Unator/wiki/Playlist-Formats)

## 🤝 Contact

* [GitHub Issues](https://github.com/hasanbeder/M3Unator/issues)
* [GitHub Discussions](https://github.com/hasanbeder/M3Unator/discussions)
* [@hasanbeder on X](https://x.com/hasanbeder)