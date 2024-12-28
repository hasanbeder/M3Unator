# M3Unator Manual Testing Guide (v1.0.2)

This document outlines the manual testing procedures for the M3Unator userscript version 1.0.2.

## Core System Tests

### 1. Ultrafast Scanning System
- Verify 15 concurrent requests are working
- Check batch processing (20 requests/batch)
- Monitor memory optimization
- Test cache system performance
- Verify scanning speed improvements

### 2. Web Server Support
- Test Apache directory listings
- Test Nginx directory listings
- Verify LiteSpeed directory support
- Check different directory structures
- Validate URL handling

### 3. Memory Management
- Monitor minimum memory usage (50MB target)
- Monitor maximum memory usage (200MB limit)
- Verify garbage collection optimization
- Check for memory leaks
- Test cache cleanup

## UI Tests

### 1. Modal Window
- Click the M3Unator button
- Verify modal window appearance
- Check all UI elements
- Test close button functionality
- Verify drag-and-drop movement

### 2. Enhanced UI Features
- Verify toast notifications
- Check colored log categories
- Test depth level indicator
- Monitor real-time statistics
- Verify activity indicators

### 3. Progress Tracking
- Monitor scanning progress
- Verify batch processing indicators
- Check directory depth display
- Test pause/resume functionality
- Verify cancel operation

## File Operations Tests

### 1. Directory Scanning
- Test recursive scanning
- Verify depth limitations
- Check file type detection
- Monitor parallel processing
- Test scan resumption

### 2. Media File Processing
- Test video format support
- Verify audio format support
- Check metadata extraction
- Test character encoding
- Verify file size handling

### 3. Playlist Generation
- Test M3U format creation
- Verify M3U8 format creation
- Check UTF-8 encoding
- Verify file path handling
- Test playlist organization

## Security Tests

### 1. Input Validation
- Test path traversal protection
- Verify XSS prevention
- Check input sanitization
- Test URL validation
- Verify file type validation

### 2. Rate Limiting
- Test request rate limits
- Verify concurrent request limits
- Check retry mechanism
- Test exponential backoff
- Monitor request queuing

### 3. SSL/Security
- Verify SSL certificate validation
- Test secure connections
- Check error handling
- Verify secure data handling
- Test access controls

## Performance Tests

### 1. Large Scale Testing
- Test with 1000+ files
- Verify directory tree handling
- Check memory usage patterns
- Monitor CPU utilization
- Test network optimization

### 2. Resource Management
- Monitor cache effectiveness
- Verify memory cleanup
- Test parallel processing
- Check response handling
- Monitor system resources

### 3. Speed Optimization
- Verify scanning speed
- Test batch processing
- Check concurrent operations
- Monitor request handling
- Verify overall performance

## Error Handling Tests

### 1. Network Errors
- Test connection timeouts
- Verify retry mechanism
- Check error messages
- Test recovery process
- Verify state management

### 2. File System Errors
- Test invalid paths
- Check permission errors
- Verify file access issues
- Test corrupt files
- Monitor error logging

### 3. User Interface Errors
- Test input validation
- Verify error displays
- Check toast notifications
- Test recovery options
- Verify user guidance

## Browser Compatibility Tests

### 1. Modern Browsers
- Test in Chrome (latest)
- Verify in Firefox (latest)
- Check in Edge (latest)
- Test in Safari (latest)
- Verify mobile browsers

### 2. Feature Support
- Check JavaScript APIs
- Verify DOM operations
- Test CSS compatibility
- Verify storage methods
- Check async operations

## Integration Tests

### 1. Server Integration
- Test Apache compatibility
- Verify Nginx support
- Check LiteSpeed integration
- Test custom server setups
- Verify protocol handling

### 2. External Systems
- Test media players
- Verify streaming services
- Check playlist readers
- Test file managers
- Verify system integration

## Documentation Tests

### 1. User Guide
- Verify feature documentation
- Check example accuracy
- Test tutorial steps
- Verify error solutions
- Check update notes

### 2. Technical Documentation
- Verify API documentation
- Check code examples
- Test configuration guides
- Verify troubleshooting steps
- Check version details

## Test Execution Guidelines

1. Follow each test category systematically
2. Document any issues found
3. Verify fixes for reported issues
4. Update test cases as needed
5. Monitor performance metrics

## Performance Metrics

- Scanning Speed: < 100ms per directory
- Memory Usage: 50MB - 200MB range
- CPU Usage: < 50% during scanning
- Response Time: < 200ms for UI updates
- Success Rate: > 99% for operations

*Note: This is a living document - update test cases as new features are added* 