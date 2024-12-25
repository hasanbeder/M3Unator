# M3Unator 🎬 🎵

<div align="center">

![M3Unator Banner](https://raw.githubusercontent.com/hasanbeder/M3Unator/main/screenshots/screenshot.png)

<p align="center">
  <a href="https://github.com/hasanbeder/M3Unator/releases"><img src="https://img.shields.io/badge/version-1.0.1-blue.svg?style=flat-square" alt="Version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-GPL--3.0-green.svg?style=flat-square" alt="License"></a>
  <a href="https://github.com/hasanbeder/M3Unator/stargazers"><img src="https://img.shields.io/github/stars/hasanbeder/M3Unator?style=flat-square&color=yellow" alt="GitHub stars"></a>
  <a href="https://greasyfork.org/en/scripts/521593-m3unator-web-directory-playlist-creator"><img src="https://img.shields.io/badge/Greasyfork-Install-red.svg?style=flat-square" alt="Greasyfork"></a>
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

## ✨ Features

### 🎯 Core Functionality
- Automatic playlist creation from directory listings
- Smart detection of video and audio files
- Support for Apache, Nginx, Lighttpd, LiteSpeed, and other web servers
- Configurable directory scanning depth
- Fault-tolerant design with retry mechanism
- Real-time progress tracking

### 🎨 User Interface
- Modern and intuitive dark theme design
- Pause/Resume scanning capability
- Live progress indicators
- Toast notifications
- Detailed logging system

## 🚀 Installation

1. Install a userscript manager:
   - [Tampermonkey](https://www.tampermonkey.net/) (Recommended)
   - [Violentmonkey](https://violentmonkey.github.io/)

2. Install M3Unator:
   - [Click here to install](https://raw.githubusercontent.com/hasanbeder/M3Unator/main/M3Unator.user.js)
   - Click "Install" in the userscript manager popup

> **Note for Tampermonkey v5.0+**:  
> Enable developer mode in your browser's extensions settings.

## 📁 Supported Formats

### 🎬 Video Files
mp4, mkv, avi, webm, mov, flv, wmv, m4v, mpg, mpeg, 
3gp, vob, ts, mts, m2ts, divx, xvid, asf, ogv, rm, 
rmvb, qt, hevc, f4v

### 🎵 Audio Files
mp3, m4a, wav, flac, aac, ogg, wma, opus, aiff, ape, 
mka, ac3, dts, m4b, mp2, mpa, mpc, ra, tta, voc

## 💡 Usage

1. Navigate to any directory listing page
2. Click the M3Unator button in the top-right corner
3. Configure your preferences (or use defaults):
   - Select media types (video/audio) - Default: both enabled
   - Set scanning depth - Default: recursive (unlimited)
   - Choose output format (M3U/M3U8) - Default: M3U
4. Click "Create Playlist"
5. Wait for the scan to complete
6. Save your playlist file

### ⚙️ Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| Media Types | Choose video and/or audio files | Both enabled |
| Scan Depth | Set directory scanning depth (0-99) | Recursive (unlimited) |
| Format | Choose between M3U and M3U8 | M3U |
| Timeout | Request timeout duration | 5000ms |
| Retry Count | Number of retry attempts | 2 |

## 🔍 Browser Compatibility

| Browser | Support | Minimum Version |
|---------|---------|----------------|
| Chrome | ✅ | 88+ |
| Firefox | ✅ | 78+ |
| Edge | ✅ | 88+ |
| Safari | ⚠️ | 14+ |
| Opera | ✅ | 74+ |

## ❓ FAQ

<details>
<summary><b>Why isn't the M3Unator button appearing?</b></summary>
Ensure you're on a directory listing page and your userscript manager is enabled.
</details>

<details>
<summary><b>Why are some files skipped?</b></summary>
Files might be unsupported formats or inaccessible. Check the log for details.
</details>

<details>
<summary><b>How do I scan subdirectories?</b></summary>
Enable recursive scanning and set your desired depth in the settings.
</details>

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting pull requests.

### Additional Resources
- [Development Guide](DEVELOPMENT.md) - Detailed information for developers
- [Security Policy](SECURITY.md) - Security vulnerability reporting
- [Code of Conduct](CODE_OF_CONDUCT.md) - Community guidelines

## 📄 License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- All our [contributors](https://github.com/hasanbeder/M3Unator/graphs/contributors)
- The open-source community
- Users who provide valuable feedback

## 📬 Contact

- GitHub: [@hasanbeder](https://github.com/hasanbeder)
- Twitter/X: [@hasanbeder](https://twitter.com/hasanbeder)
- Issues: [Bug Reports](https://github.com/hasanbeder/M3Unator/issues)

## 📚 Resources

- [GitHub Wiki](https://github.com/hasanbeder/M3Unator/wiki) - Detailed guides and documentation
- [GitHub Discussions](https://github.com/hasanbeder/M3Unator/discussions) - Community discussions and Q&A
- [Release Notes](CHANGELOG.md) - Version history and changes
- [Security Policy](SECURITY.md) - Security guidelines and reporting

---

<div align="center">
Made with ❤️ by <a href="https://github.com/hasanbeder">Hasan Beder</a>

If you find M3Unator helpful, please consider giving it a ⭐
</div> 