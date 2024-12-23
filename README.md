# 📚 M3Unator - Web Directory Playlist Creator

> 🎵 M3Unator is a powerful userscript that automatically creates M3U/M3U8 playlists from web directory listings (Apache, Nginx, Lighttpd, and other web servers). It intelligently detects video and audio files, scans subdirectories, and generates ready-to-use playlists with a single click. With its modern and user-friendly interface, progress tracking, statistics, and customizable settings, it makes organizing your media files effortless. Supporting over 40 video and audio formats, it operates reliably with fault-tolerant design and retry mechanisms.

![M3Unator](https://raw.githubusercontent.com/hasanbeder/M3Unator/main/screenshots/screenshot.png)

## ✨ Features

### Main Features
- 🎯 Automatic playlist creation from web directory listings (Apache, Nginx, Lighttpd, etc.)
- 📝 Support for M3U and M3U8 formats
- 🔍 Automatic detection of video and audio files
- 🌲 Adjustable directory depth limit
- 📊 Maximum file number limit
- ⏱️ Timeout settings
- 🔄 Retry count
- 📈 Progress tracking and statistics

### User Interface
- 🎨 Modern and user-friendly design
- ⏯️ Pause/resume control
- 📊 Progress indicator
- 🔔 Error and success notifications
- 🔢 File counter
- 📜 Log viewer

## 📁 Supported Formats and Use Cases

### 🎥 Video Formats
- `.mp4`, `.mkv`, `.avi`, `.webm`, `.mov`, `.flv`, `.wmv`
- `.m4v`, `.mpg`, `.mpeg`, `.3gp`, `.vob`, `.ts`, `.mts`
- `.m2ts`, `.divx`, `.xvid`, `.asf`, `.ogv`, `.rm`, `.rmvb`
- `.wtv`, `.qt`, `.hevc`, `.f4v`, `.swf`, `.vro`, `.ogx`
- `.drc`, `.gifv`, `.mxf`, `.roq`, `.nsv`

### 🎵 Audio Formats
- `.mp3`, `.m4a`, `.wav`, `.flac`, `.aac`, `.ogg`, `.wma`
- `.opus`, `.aiff`, `.ape`, `.mka`, `.ac3`, `.dts`, `.m4b`
- `.m4p`, `.m4r`, `.mid`, `.midi`, `.mp2`, `.mpa`, `.mpc`
- `.ra`, `.tta`, `.voc`, `.vox`, `.amr`, `.awb`, `.dsf`
- `.dff`, `.alac`, `.wv`, `.oga`, `.sln`, `.aif`, `.pcm`

## 📁 Playlist Files

### M3U Format
- Standard M3U playlist format
- Compatible with most media players
- Supports local and remote media files
- UTF-8 encoding for international characters

### M3U8 Format
- Extended M3U playlist format
- Enhanced metadata support
- Better character encoding handling
- Streaming media support

### Example M3U Content
```m3u
#EXTM3U
#EXTINF:-1,Example Video
/path/to/video.mp4
#EXTINF:-1,Example Audio
/path/to/audio.mp3
```

### Example M3U8 Content
```m3u8
#EXTM3U
#EXT-X-VERSION:3
#EXTINF:-1,Example Video
http://example.com/video.mp4
#EXTINF:-1,Example Audio
http://example.com/audio.mp3
```

## 💡 Use Cases

### 🎬 Media Centers
- Create playlists for Kodi, Plex, or VLC
- Organize movie and TV show collections
- Build music libraries
- Stream content from web servers
- Manage media archives

### 🎵 Music Organization
- Create playlists from music directories
- Organize audio collections
- Build streaming playlists
- Archive audio content
- Share music collections

### 📺 Video Management
- Organize video libraries
- Create movie marathons
- Build TV show playlists
- Manage video archives
- Share video collections

### 🌐 Web Server Integration
- Index media on web servers
- Create streaming playlists
- Share media directories
- Build content catalogs
- Manage online archives

## 🔧 Technical Requirements

### Supported Browsers
- Google Chrome (v88+)
- Mozilla Firefox (v78+)
- Microsoft Edge (v88+)
- Safari (v14+)
- Opera (v74+)

### Userscript Manager Requirements
- Tampermonkey (v4.13+)
- Violentmonkey (v2.13+)
- ~~Greasemonkey~~ (Not supported)

### System Requirements
- Modern web browser with JavaScript enabled
- Active internet connection
- Sufficient permissions to access directory listings

## 🔒 Security

### Data Privacy
- M3Unator operates entirely in your browser
- No data is collected or transmitted to external servers
- All generated playlists are stored locally
- No personal information is required or stored

### Permissions
- Only requires access to directory listing pages
- No additional browser permissions needed
- No external API calls or third-party services used

### Best Practices
- Always verify the URLs in generated playlists
- Be cautious when scanning unknown directories
- Keep your browser and userscript manager updated
- Report any security concerns via GitHub Issues

## ❓ Frequently Asked Questions

### General Questions
1. **What is M3Unator?**
   - A userscript that creates M3U playlists from web directory listings

2. **Is it free to use?**
   - Yes, M3Unator is completely free and open source

3. **Does it work offline?**
   - No, an internet connection is required to scan directories

### Technical Questions
1. **Why isn't the M3Unator button appearing?**
   - Ensure you're on a directory listing page
   - Check if your userscript manager is enabled
   - Verify that JavaScript is enabled

2. **Why are some files skipped?**
   - Files might not be in supported formats
   - Files might be inaccessible
   - URL might be malformed

3. **Can I customize the scan depth?**
   - Yes, through the settings panel
   - Default depth is 1 (current directory only)
   - Maximum depth is 10

### Troubleshooting
1. **Scanning is slow**
   - Reduce scan depth
   - Limit maximum entries
   - Check your internet connection
   - Try disabling other extensions

2. **Playlist won't generate**
   - Check browser console for errors
   - Verify file permissions
   - Ensure sufficient storage space
   - Try clearing browser cache

3. **Files not detected**
   - Verify file extensions
   - Check file accessibility
   - Ensure proper URL formatting

## 📊 Project Status

### Current Version
- Version: 1.0.0
- Status: Stable
- Last Updated: December 2023

### Known Issues
- Some Apache directory listings may not be detected
- Very large directories might cause performance issues
- Certain special characters in filenames may cause issues

### Browser Compatibility
- Chrome: ✅ Fully Compatible
- Firefox: ✅ Fully Compatible
- Edge: ✅ Fully Compatible
- Safari: ⚠️ Minor Issues
- Opera: ✅ Fully Compatible

## 🎯 Feature Requests

Have an idea for a new feature? Here's how to submit it:

1. **Check Existing Requests**
   - Search the [Issues](https://github.com/hasanbeder/M3Unator/issues) page
   - Look for similar feature requests
   - Check the roadmap for planned features

2. **Submit Your Request**
   - Use the "Feature Request" template
   - Provide a clear description
   - Explain the use case
   - Add examples if possible

3. **Track Your Request**
   - Subscribe to updates
   - Participate in discussions
   - Help test when implemented

## 🐛 Bug Reporting

Found a bug? Help us fix it:

1. **Before Reporting**
   - Check if the bug is already reported
   - Verify it's not a known issue
   - Test with the latest version

2. **Report Details**
   - Browser and version
   - Userscript manager and version
   - Steps to reproduce
   - Expected vs actual behavior
   - Error messages if any
   - Screenshots if applicable

3. **Submit Report**
   - Use the "Bug Report" template
   - Include all necessary details
   - Add relevant labels
   - Follow up on questions

## 🗺️ Roadmap

### Upcoming Features
1. **Version 1.1.0** (Q1 2024)
   - Custom playlist naming patterns
   - Enhanced error handling
   - Performance improvements
   - Additional file format support

2. **Version 1.2.0** (Q2 2024)
   - Playlist categories
   - Custom metadata support
   - Batch processing
   - Export/Import settings

3. **Version 2.0.0** (Q3 2024)
   - Complete UI redesign
   - Advanced filtering options
   - Cloud storage integration
   - Playlist sharing features

### Long-term Goals
- Cross-platform desktop application
- Mobile companion app
- API integration capabilities
- Extended format support

## 📊 Acknowledgments

### Contributors
- [Hasan Beder](https://github.com/hasanbeder) - Creator and maintainer
- [List of Contributors](https://github.com/hasanbeder/M3Unator/graphs/contributors)

### Tools and Libraries
- [Tampermonkey](https://www.tampermonkey.net/)
- [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [CSS3](https://developer.mozilla.org/en-US/docs/Web/CSS)

### Special Thanks
- The open-source community
- All users who provided feedback
- Everyone who reported bugs
- Contributors to documentation

## ⚙️ Installation

1. Install a userscript manager in your browser:
   - [Tampermonkey](https://www.tampermonkey.net/) (Chrome, Firefox, Safari, Edge) (**Recommended**)
   - [Violentmonkey](https://violentmonkey.github.io/) (Chrome, Firefox, Edge)
   - ~~[Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) (Firefox)~~ (Not currently supported)
2. [Click here](https://raw.githubusercontent.com/hasanbeder/M3Unator/main/M3Unator.user.js) to install the script
3. Click "Install" in the extension installation window

> ### ⚠️ **IMPORTANT NOTE! (For Tampermonkey Users)** ⚠️
> **For Tampermonkey version 5.0 and above, developer mode must be enabled for userscripts to work.**
> 
> To enable developer mode in your browser:
> - **Chrome**: Three dots menu > More Tools > Extensions > Enable "Developer mode"
> - **Firefox**: Menu > Add-ons and Themes > Settings icon > Debug Add-ons
> - **Edge**: Three dots menu > Extensions > Manage Extensions > Developer mode
> - **Opera**: Extensions > Manage Extensions > Developer mode

## 🚀 Usage

1. **Basic Usage**
   - Navigate to any directory listing page
   - Click the M3Unator button in the top right
   - Configure scan settings
   - Click "Generate" to create your playlist

2. **Configuration Options**
   - **Media Types**: Choose video and/or audio files
   - **Scan Depth**: Set how deep to scan subdirectories
   - **Maximum Entries**: Limit the number of files
   - **Timeout**: Set request timeout duration
   - **Retry Count**: Set number of retries for failed requests

3. **Advanced Features**
   - **Pause/Resume**: Control the scanning process
   - **Cancel**: Stop the current operation
   - **Progress Log**: View detailed operation logs
   - **Statistics**: Monitor scanning progress

## 🔧 Development

For development setup and guidelines, see [DEVELOPMENT.md](DEVELOPMENT.md)

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## 📄 License

This project is licensed under GNU General Public License v3.0 (GPLv3). This license:

- Allows you to use the code for any purpose
- Allows you to modify the code and create derivative works
- Allows you to distribute original or modified code
- Requires you to:
  - Include the license and copyright notice
  - State changes made to the code
  - Disclose the source code
  - Use the same license for derivative works

For more details, see the [LICENSE](LICENSE) file.

## 📬 Communication & Support

### Connect With Us
- **GitHub**: [@hasanbeder](https://github.com/hasanbeder)
- **Twitter/X**: [@hasanbeder](https://twitter.com/hasanbeder)
- **Email**: Contact through GitHub issues
- **Discord**: Join our community (Coming Soon)

### Get Help
- **Documentation**: [Local Wiki](wiki/README.md)
- **Bug Reports**: [GitHub Issues](https://github.com/hasanbeder/M3Unator/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/hasanbeder/M3Unator/discussions)
- **Security Reports**: See [SECURITY.md](SECURITY.md)

### Community Resources
- **Discussions**: Join our [GitHub Discussions](https://github.com/hasanbeder/M3Unator/discussions)
- **Contributing**: Read our [Contributing Guide](CONTRIBUTING.md)
- **Code of Conduct**: Review our [Code of Conduct](CODE_OF_CONDUCT.md)
- **Release Notes**: Check [CHANGELOG.md](CHANGELOG.md)

### Stay Updated
- Watch the repository for updates
- Star the project to show support
- Follow [@hasanbeder](https://twitter.com/hasanbeder) for announcements
- Subscribe to our newsletter (Coming Soon)

## 🔗 Links

- [GitHub Repository](https://github.com/hasanbeder/M3Unator)
- [Report Issues](https://github.com/hasanbeder/M3Unator/issues)
- [Changelog](CHANGELOG.md)
- [Contributing Guide](CONTRIBUTING.md)
- [Security Policy](SECURITY.md)

## 🧪 Testing

The project includes automated tests to ensure reliability. To run the tests:

1. Clone the repository
2. Navigate to the `tests` directory
3. Run the test suite

For more information about testing, see the [Development Guide](DEVELOPMENT.md).

## 📚 Documentation

- [Development Guide](DEVELOPMENT.md)
- [Contributing Guidelines](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security Policy](SECURITY.md)
- [Change Log](CHANGELOG.md)
- [Local Wiki](wiki/README.md)