# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.1.0   | :white_check_mark: |
| 1.0.2   | :x:                |

## Security Features

- URL validation and normalization before scanning
- HTML entity and percent-encoding decode with malformed-input fallback
- TextContent-based DOM creation (no innerHTML injection)
- Input sanitization for playlist names
- Playlist metadata escaping for safer output

## Reporting a Vulnerability

We take the security of M3Unator seriously. If you believe you have found a security vulnerability, please follow these steps:

1. **Do Not** report security vulnerabilities through public GitHub issues
2. Go to the Security tab of the repository
3. Click "Report a vulnerability" to create a private security advisory
4. Provide detailed information about the vulnerability

### Required Information

Please include:
- Type of vulnerability
- Steps to reproduce
- Affected components
- Potential impact
- Suggested fixes (if any)

### Response Timeline

- Initial response: Within 48 hours
- Assessment update: Within 7 days
- Fix implementation: Based on severity
- Public disclosure: After fix is deployed

## Security Best Practices

### For Users
- Only install M3Unator from the official GitHub repository
- Keep your userscript manager up to date
- Review permissions before granting access
- Report suspicious behavior immediately

### Technical Details
- All operations are performed client-side in the browser
- No external data transmission — playlists and scanned URLs never leave the browser
- No sensitive data is collected or stored

## Contact

For security matters, please use GitHub's private security advisory feature only.
Do not use other communication channels for security issues. 