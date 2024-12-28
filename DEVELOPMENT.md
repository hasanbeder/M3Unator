# M3Unator Development Documentation (v1.0.2)

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

## 🔧 Core System Architecture

### 1. Ultrafast Scanning System
- Parallel request processing (15 concurrent requests)
- Batch operations (20 requests/batch)
- Memory optimization system
- Enhanced caching mechanism
- Request queue management

### 2. Memory Management
- Target memory usage: 50MB - 200MB
- Garbage collection optimization
- Cache cleanup strategies
- Memory leak prevention
- Resource pooling

### 3. Web Server Integration
- Apache/Nginx parser optimization
- LiteSpeed directory support
- Protocol-specific optimizations
- Header management
- Connection pooling

## 🎯 Implementation Details

### 1. PlaylistGenerator Class
```javascript
class PlaylistGenerator {
  constructor(options) {
    this.concurrentRequests = 15;
    this.batchSize = 20;
    this.cacheSize = '100MB';
    this.setupMemoryManagement();
  }

  async scanDirectory() {
    // Implement parallel scanning
    // Handle batch processing
    // Manage memory usage
  }

  setupMemoryManagement() {
    // Configure garbage collection
    // Initialize cache system
    // Set up memory monitoring
  }
}
```

### 2. Performance Optimization
```javascript
const performanceConfig = {
  scanning: {
    parallel: 15,
    batchSize: 20,
    retryAttempts: 3,
    timeout: 30000
  },
  memory: {
    minUsage: '50MB',
    maxUsage: '200MB',
    gcInterval: 1000
  },
  cache: {
    size: '100MB',
    cleanupThreshold: '80%'
  }
};
```

### 3. Security Implementation
```javascript
const securityConfig = {
  rateLimit: {
    requests: 100,
    period: '1m',
    backoff: 'exponential'
  },
  validation: {
    xss: true,
    paths: true,
    ssl: true
  },
  headers: {
    security: true,
    cors: true
  }
};
```

## 🚀 Feature Implementation Guide

### 1. UI Components
- Toast notification system
- Colored log categories
- Real-time statistics
- Progress indicators
- Activity monitoring

### 2. File Processing
- Enhanced file type detection
- Improved character encoding
- Metadata extraction
- URL normalization
- Path validation

### 3. Error Handling
- Advanced error capture
- Detailed logging
- Recovery mechanisms
- User notifications
- State management

## 📊 Performance Guidelines

### 1. Memory Optimization
- Keep memory usage below 200MB
- Implement regular garbage collection
- Use efficient data structures
- Monitor memory patterns
- Cache responsively

### 2. Speed Optimization
- Maintain 15 concurrent requests
- Process in 20-request batches
- Optimize network calls
- Minimize DOM operations
- Use efficient algorithms

### 3. Resource Management
- Monitor CPU usage
- Optimize network bandwidth
- Manage cache size
- Handle concurrent operations
- Control resource allocation

## 🔒 Security Implementation

### 1. Input Validation
```javascript
function validateInput(input) {
  // XSS prevention
  // Path traversal protection
  // Character encoding
  return sanitizedInput;
}
```

### 2. Rate Limiting
```javascript
function rateLimit(request) {
  // Request counting
  // Time window management
  // Backoff implementation
  return allowRequest;
}
```

### 3. Error Handling
```javascript
function handleError(error) {
  // Error categorization
  // User notification
  // Logging
  // Recovery attempt
}
```

## 🧪 Testing Guidelines

### 1. Performance Testing
- Verify concurrent request handling
- Test batch processing
- Monitor memory usage
- Check response times
- Validate cache efficiency

### 2. Security Testing
- Test XSS prevention
- Verify rate limiting
- Check input validation
- Test error handling
- Validate SSL/TLS

### 3. Integration Testing
- Test server compatibility
- Verify protocol handling
- Check file processing
- Validate UI updates
- Test error recovery

## 📚 Development Resources

- [JavaScript Performance Guide](https://developer.mozilla.org/en-US/docs/Web/Performance)
- [Security Best Practices](https://owasp.org/www-project-top-ten/)
- [Memory Management](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_Management)
- [Web Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

## 🔄 Version Control

### Release Process
1. Update version numbers
2. Run comprehensive tests
3. Update documentation
4. Create release notes
5. Tag release

### Version Scheme
- MAJOR: Breaking changes
- MINOR: New features
- PATCH: Bug fixes

*Note: This document is continuously updated with new features and improvements.*