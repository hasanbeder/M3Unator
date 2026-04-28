# M3Unator Manual Testing Guide (v1.0.2)

This document outlines the manual testing procedures for the M3Unator userscript version 1.0.2.

## Pre-Flight Checks

Before browser QA:

1. Build the root artifacts from `src/runtime/M3Unator.user.js`
   ```bash
   node scripts/build_userscript.js
   ```
2. Run the local validation triplet
   ```bash
   node scripts/validate_bootstrap.js .claude/skills
   node scripts/version_checker.js .claude/skills
   node scripts/check_skill_compliance.js --file M3Unator.user.js
   ```
3. Run the local logic regression suite before browser QA, especially after parser, scan, or playlist changes
   ```bash
   npm run test:logic
   ```
4. Run the local browser smoke matrix on the fixture server before wider manual QA
   ```bash
   npm run test:e2e
   ```

## Local Browser Smoke Harness

- `npm run test:e2e` starts a local fixture server with nested Apache-style and LiteSpeed-style directory listings.
- The smoke suite covers Chromium and Firefox.
- The automated checks verify launcher mount, recursive scan depth, pause/resume/cancel transitions, log rendering, stats updates, and playlist export.
- Treat this as the fast release gate before moving to broader manual coverage on real hosts.

## Local Logic Regression Matrix

- Apache-style fixture must keep relative directory and file href extraction stable.
- Nginx-style fixture must keep query-link filtering and relative path extraction stable.
- LiteSpeed-style fixture must keep table-row parsing and parent-directory filtering stable.
- Lighttpd-style fixture must keep sortable header links from polluting scan candidates.
- IIS-style fixture must keep parent-navigation and sortable header links out of scan candidates.
- Caddy-style fixture must ignore breadcrumb root links while keeping relative directory and media hrefs.
- Startup detection must mount on Apache, Nginx, LiteSpeed, Lighttpd, IIS, and Caddy fixtures while still rejecting non-listing breadcrumb/table pages.
- Startup detection must also mount on real Apache archive pages without `Index of` in the title and on IIS listings that use `localhost - /path/` style titles with `[To Parent Directory]`.
- Startup detection must not mount on non-listing host pages such as GitHub repository views that happen to contain code blocks, query tabs, or same-path child links.
- Apache/Nginx `pre` listings must ignore nav/footer anchors outside the actual listing container.
- Recursive fetches must skip non-listing HTML pages even when they contain incidental relative links.
- Playlist/export helpers must keep decoded titles, ordering, and extension classification stable.
- `.m3u` exports must remain plain extended M3U, while `.m3u8` exports must prepend a UTF-8 BOM and use the UTF-8/HLS MIME path.
- Recursive scans must preserve decoded subdirectory names in both exported playlist titles and activity log entries.
- Short scans with fewer than ten log events must still populate the `Recent Activity` panel, including LiteSpeed listings.
- Large single-directory scans with 2000+ files must stay responsive, avoid console crashes tied to forced GC paths, and still honor pause/cancel between file batches.

## Release Coverage Matrix

Minimum release-family matrix:
- Apache `mod_autoindex`
- Nginx autoindex
- LiteSpeed or OpenLiteSpeed directory listing
- Lighttpd `mod_dirlisting`
- IIS directory browsing
- Caddy `file_server browse`

Optional extended matrix:
- Python `http.server`
- Express `serve-index`

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
- Verify Lighttpd directory support
- Verify IIS directory browsing support
- Verify Caddy directory browsing support
- Verify the M3Unator launcher mounts on each supported listing family before scan actions begin
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
- Verify the floating launcher hides while the panel is open and reappears on close
- Verify background scroll/click lock stays active while the panel is open, including after opening and closing `About`
- Verify focus moves to `Playlist Name` when the panel opens and returns to the launcher when it closes
- Verify `Escape` closes `About` first and closes the main panel when idle
- Check all UI elements
- Test close button functionality
- Verify drag-and-drop movement

### 2. Enhanced UI Features
- Verify the format selector stays hidden until a playlist name is entered
- Verify each main toggle shows a visible label and helper text without relying on hover tooltips
- Verify toast notifications
- Check colored log categories
- Test depth level indicator
- Monitor real-time statistics
- Verify large stat totals stay readable as full raw values and do not make the stat icons shift horizontally while counts change
- Verify activity indicators
- Verify `Recent Activity` shows its counter badge and status dot even on short successful scans
- Verify `Recent Activity` renders on short scans and does not stay empty after successful completion

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
- Verify nested directory scans keep readable relative path labels in exported `#EXTINF` titles

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
- Test with 2000+ files in a single directory and verify the browser stays responsive while the scan is active
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
- Check Lighttpd integration
- Check IIS integration
- Check Caddy integration
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
