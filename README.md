# M3Unator - Web Directory Playlist Creator

<div align="center">

![M3Unator Banner](https://raw.githubusercontent.com/hasanbeder/M3Unator/main/screenshots/screenshot.png)

<p align="center">
  <a href="https://github.com/hasanbeder/M3Unator/releases"><img src="https://img.shields.io/badge/version-1.0.2-blue.svg?style=for-the-badge" alt="Version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-GPL--3.0-green.svg?style=for-the-badge" alt="License"></a>
  <a href="https://github.com/hasanbeder/M3Unator/stargazers"><img src="https://img.shields.io/github/stars/hasanbeder/M3Unator?style=for-the-badge&color=yellow" alt="GitHub stars"></a>
  <a href="https://greasyfork.org/en/scripts/521593-m3unator-web-directory-playlist-creator"><img src="https://img.shields.io/badge/Greasyfork-Install-red.svg?style=for-the-badge" alt="Greasyfork"></a>
</p>

<h3>
  <p align="center">🎯 Create M3U/M3U8 playlists from web directory listings with ease!</p>
</h3>

<p align="center"><i>Browse through Apache, Nginx, or any other web server's directory listing and let M3Unator generate a playlist of all media files. It recognizes popular formats like MP4 and MP3, as well as specialized ones like MKV and FLAC. With its clean dark interface and real-time scanning status, creating playlists has never been simpler.</i></p>

<p align="center">
  <a href="#-installation"><img src="https://img.shields.io/badge/-Installation-2ea44f?style=for-the-badge" alt="Installation"></a>
  <a href="#-features"><img src="https://img.shields.io/badge/-Features-blue?style=for-the-badge" alt="Features"></a>
  <a href="#-usage"><img src="https://img.shields.io/badge/-Usage-orange?style=for-the-badge" alt="Usage"></a>
  <a href="#-supported-formats"><img src="https://img.shields.io/badge/-Formats-red?style=for-the-badge" alt="Formats"></a>
  <a href="#-faq"><img src="https://img.shields.io/badge/-FAQ-purple?style=for-the-badge" alt="FAQ"></a>
  <a href="#-contributing"><img src="https://img.shields.io/badge/-Contributing-yellow?style=for-the-badge" alt="Contributing"></a>
  <a href="https://github.com/hasanbeder/M3Unator/wiki"><img src="https://img.shields.io/badge/-Documentation-gray?style=for-the-badge" alt="Documentation"></a>
</p>

</div>

## ✨ What's New in v1.0.2

### 🚀 Performance Enhancements
- Ultrafast scanning system with lightning-quick directory processing
- Optimized memory management for better resource utilization
- Enhanced caching system for improved performance
- Parallel request limit increased to 15 for faster scanning

### 🌐 Web Server Support
- Improved Apache/Nginx directory listings support
- Added LiteSpeed directory support
- Optimized link extraction and processing
- Enhanced URL validation and handling

### 🛡️ Security & Stability
- Smart retry mechanism with exponential backoff
- Advanced error handling with detailed reporting
- Enhanced security features and validations
- Improved character encoding support

### 📊 UI/UX Improvements
- Beautiful toast notifications system
- Real-time progress tracking with detailed stats
- Colored log categories for better visibility
- Activity indicator for real-time operation status

## 🎯 Installation

1. Install a userscript manager:
   - [Tampermonkey](https://www.tampermonkey.net/) (Recommended)
   - [Violentmonkey](https://violentmonkey.github.io/)

2. Install M3Unator:
   - [Install from Greasy Fork](https://greasyfork.org/en/scripts/521593-m3unator-web-directory-playlist-creator) (Recommended)
   - [Install from GitHub](https://raw.githubusercontent.com/hasanbeder/M3Unator/main/M3Unator.user.js)

> **Note**: For Tampermonkey v5.0+, enable developer mode in your browser's extensions settings.

## ⚡ Quick Start

1. Install Tampermonkey & M3Unator
2. Visit any directory listing page
3. Click M3Unator button (top-right)
4. Hit "Create Playlist" - Done! 🎉

[Need more details? Check the full usage guide →](#-usage)

## 🎯 Core Features

### 🎬 Media Support
- Comprehensive support for 40+ media formats
- Smart file type detection using Map structure
- Enhanced character encoding for international files
- Automatic media file filtering

### 🔍 Directory Scanning
- Configurable scanning depth
- Smart subdirectory handling
- Efficient file discovery
- Progress tracking and statistics

### 🎨 User Interface
- Modern dark theme design
- Intuitive controls and settings
- Real-time status updates
- Clean and responsive layout

## 📖 What are Open Directories?

Open Directories are publicly accessible web server directories with directory listing enabled. These are web pages that display a list of files and folders, similar to how you view files on your computer. They are commonly found on Apache, Nginx, Lighttpd, LiteSpeed, and other web servers where directory indexing is enabled. These directories allow direct access to browse and download files through your web browser.

Example directory structure:
```plaintext
Index of /movies/
[DIR] Action/
[DIR] Comedy/
[FILE] movie1.mp4
[FILE] movie2.mkv
```

M3Unator is designed to work with these directory listings, automatically detecting media files and creating organized playlists.

## 🔍 Finding Open Directories

<details>
<summary><b>Click to expand search techniques</b></summary>

### Basic Search Syntax
```
intitle:"index of" "parent directory"
```

### For Video Content
```
intitle:"index of" (mp4|mkv|avi|mov) -inurl:(jsp|pl|php|html|aspx)
```

### For Audio Content
```
intitle:"index of" (mp3|flac|m4a|wav) -html -htm -php -asp
```

### For Specific Content
```
intitle:"index of" "your search term" (mp4|mkv) -html
```

**Understanding the Search Operators:**
- `intitle:"index of"` - Finds pages with "index of" in their title
- `"parent directory"` - Common text found on directory listing pages
- `-inurl:(jsp|pl|php|html|aspx)` - Excludes dynamic pages
- `(mp4|mkv|avi|mov)` - Searches for specific file types

</details>

## 📁 Supported Formats

### 🎬 Video Files
`mp4` `mkv` `avi` `webm` `mov` `flv` `wmv` `m4v` `mpg` `mpeg` 
`3gp` `vob` `ts` `mts` `m2ts` `divx` `xvid` `asf` `ogv` `rm` 
`rmvb` `qt` `hevc` `f4v`

### 🎵 Audio Files
`mp3` `m4a` `wav` `flac` `aac` `ogg` `wma` `opus` `aiff` `ape` 
`mka` `ac3` `dts` `m4b` `mp2` `mpa` `mpc` `ra` `tta` `voc`

## 💡 Usage

1. Navigate to any directory listing page
2. Click the M3Unator button in the top-right corner
3. Configure your preferences:
   - Select media types (video/audio)
   - Set scanning depth
   - Choose output format (M3U/M3U8)
4. Click "Create Playlist"
5. Monitor real-time progress
6. Save your playlist file

### ⚙️ Configuration Options

| Option | Description | Default | Range |
|--------|-------------|---------|--------|
| Media Types | Choose video and/or audio files | Both enabled | - |
| Scan Depth | Set directory scanning depth | Unlimited | 0-99 |
| Format | Choose between M3U and M3U8 | M3U | - |
| Parallel Requests | Number of concurrent requests | 15 | 1-20 |
| Timeout | Request timeout duration | 10000ms | 5000-30000ms |
| Retry Count | Number of retry attempts | 3 | 0-5 |
| Retry Delay | Initial retry delay (doubles each retry) | 1000ms | 500-5000ms |

## 🔍 Browser Compatibility

| Browser | Support | Minimum Version | Notes |
|---------|---------|----------------|--------|
| Chrome | ✅ | 88+ | Fully supported |
| Firefox | ✅ | 78+ | Fully supported |
| Edge | ✅ | 88+ | Fully supported |
| Safari | ⚠️ | 14+ | Limited support |
| Opera | ✅ | 74+ | Fully supported |

## ❓ FAQ

<details>
<summary><b>Why isn't the M3Unator button appearing?</b></summary>
Ensure you're on a directory listing page and your userscript manager is properly installed and enabled.
</details>

<details>
<summary><b>Why are some files skipped during scanning?</b></summary>
Files might be in unsupported formats, inaccessible, or blocked. Check the colored log for detailed information.
</details>

<details>
<summary><b>How do I scan subdirectories efficiently?</b></summary>
Enable recursive scanning in settings. Use the depth level indicator to monitor progress in deep directory structures.
</details>

<details>
<summary><b>What's the best way to handle large directories?</b></summary>
The new ultrafast scanning system handles large directories efficiently. You can also use the depth setting to limit scanning scope.
</details>

## 🤝 Contributing

We welcome contributions! Please check our [Contributing Guidelines](CONTRIBUTING.md) before submitting pull requests.

### Development Resources
- [Development Guide](DEVELOPMENT.md) - Setup and coding standards
- [Security Policy](SECURITY.md) - Security practices and reporting
- [Code of Conduct](CODE_OF_CONDUCT.md) - Community guidelines

## 📄 License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Our amazing [contributors](https://github.com/hasanbeder/M3Unator/graphs/contributors)
- The open-source community
- Users providing valuable feedback and suggestions

## 📬 Contact & Support

- GitHub: [@hasanbeder](https://github.com/hasanbeder)
- X: [@hasanbeder](https://x.com/hasanbeder)
- Issues: [Bug Reports & Feature Requests](https://github.com/hasanbeder/M3Unator/issues)
- Discussions: [Community Forum](https://github.com/hasanbeder/M3Unator/discussions)

## 📚 Additional Resources

- [Documentation](https://github.com/hasanbeder/M3Unator/wiki)
- [Version History](CHANGELOG.md)
- [Security Guidelines](SECURITY.md)
- [Community Discussions](https://github.com/hasanbeder/M3Unator/discussions)

---

<div align="center">

<p align="center">
  <img src="https://img.shields.io/badge/Made_with_❤️_by-Hasan_Beder-blue.svg?style=for-the-badge" alt="Author">
</p>

<p align="center">
  <a href="https://github.com/hasanbeder/M3Unator/stargazers">
    <img src="https://img.shields.io/github/stars/hasanbeder/M3Unator?style=for-the-badge&color=yellow" alt="Stars">
  </a>
  <a href="https://github.com/hasanbeder/M3Unator/network/members">
    <img src="https://img.shields.io/github/forks/hasanbeder/M3Unator?style=for-the-badge&color=orange" alt="Forks">
  </a>
  <a href="https://github.com/hasanbeder/M3Unator/issues">
    <img src="https://img.shields.io/github/issues/hasanbeder/M3Unator?style=for-the-badge&color=red" alt="Issues">
  </a>
</p>

<p align="center">
  <b>Support the Project</b><br>
  ⭐ Star the repository<br>
  🔄 Share with the community<br>
  🛠️ Submit issues and contribute
</p>

<p align="center">
  <a href="https://github.com/hasanbeder">
    <img src="https://img.shields.io/badge/Follow-hasanbeder-1da1f2?style=for-the-badge&logo=github" alt="Follow on GitHub">
  </a>
  <a href="https://x.com/hasanbeder">
    <img src="https://img.shields.io/badge/Follow-hasanbeder-000000?style=for-the-badge&logo=x" alt="Follow on X">
  </a>
</p>

</div> 