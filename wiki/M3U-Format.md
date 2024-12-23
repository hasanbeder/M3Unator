# M3U Format Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Technical Overview](#technical-overview)
3. [Basic Structure](#basic-structure)
4. [Extended Format (M3U8)](#extended-format-m3u8)
5. [Directives](#directives)
6. [Examples](#examples)
7. [Best Practices](#best-practices)
8. [Compatibility](#compatibility)
9. [Common Issues](#common-issues)

## Introduction

M3U (Moving Picture Experts Group Audio Layer 3 Uniform Resource Locator) is a computer file format for multimedia playlists. Originally developed for audio playlists, it's now widely used for both audio and video content.

### Key Features
- Plain text format
- UTF-8 encoding support (M3U8)
- Cross-platform compatibility
- Supports both local and remote media
- Extended metadata support

## Technical Overview

### File Format Specifications
- **File Extension**: `.m3u` or `.m3u8` (UTF-8 encoded)
- **MIME Type**: `application/vnd.apple.mpegurl` or `audio/mpegurl`
- **Line Endings**: CR (\\r), LF (\\n), or CRLF (\\r\\n)
- **Character Encoding**: 
  - `.m3u`: ASCII or system default
  - `.m3u8`: UTF-8 required

### Protocol Support
1. **Local Files**
   - Absolute paths: `/full/path/to/file.mp4`
   - Relative paths: `./relative/path/file.mp3`
   - Windows paths: `C:/path/to/file.mp4`

2. **Network Protocols**
   - HTTP/HTTPS: `http://example.com/stream.mp4`
   - FTP: `ftp://server/media/file.mp3`
   - RTSP: `rtsp://stream.example.com/live`
   - UDP: `udp://239.0.0.1:1234`

### Streaming Capabilities
1. **Video Streaming**
   - HLS (HTTP Live Streaming)
   - DASH (Dynamic Adaptive Streaming over HTTP)
   - Smooth Streaming
   - Progressive Download

2. **Audio Streaming**
   - Internet Radio
   - Audio-only HLS
   - Shoutcast/Icecast
   - Podcast Episodes

### Media Format Support
1. **Video Formats**
   - MP4 (H.264/H.265)
   - MKV
   - AVI
   - MOV
   - WMV
   - FLV
   - WebM
   - TS/M2TS

2. **Audio Formats**
   - MP3
   - AAC
   - WAV
   - FLAC
   - OGG
   - WMA
   - M4A
   - OPUS

### Extended Features
1. **Metadata Support**
   - Track duration
   - Title information
   - Artist/album data
   - Custom grouping
   - Cover art URLs
   - Stream quality
   - Bandwidth information

2. **Playlist Control**
   - Random playback
   - Loop control
   - Segment duration
   - Discontinuity handling
   - Alternative streams
   - Bandwidth selection

3. **Security Features**
   - Stream encryption
   - Token authentication
   - DRM integration
   - Access control
   - Geo-restriction support

## Basic Structure

### Simple Format
```m3u
/path/to/media1.mp4
/path/to/media2.mp3
http://example.com/stream.mp4
```

### With Comments
```m3u
#EXTM3U
# This is a comment
/path/to/media1.mp4
# Another comment
/path/to/media2.mp3
```

## Extended Format (M3U8)

M3U8 is an extended version of M3U that supports:
- UTF-8 character encoding
- Additional metadata
- Streaming information

### Extended Information
```m3u
#EXTM3U
#EXTINF:123,Artist Name - Song Title
/path/to/song.mp3
#EXTINF:-1,Example Movie
/path/to/movie.mp4
```

### Metadata Fields
- `#EXTINF`: Duration and title information
- `#EXTGRP`: Grouping information
- `#PLAYLIST`: Playlist name
- `#EXTIMG`: Album/cover art

## Directives

### Basic Directives
- `#EXTM3U`: Marks the file as an extended M3U file
- `#EXTINF:<duration>,<title>`: Specifies length and title
- `#PLAYLIST:<name>`: Sets playlist name
- `#EXTGRP:<group>`: Groups items together

### Advanced Directives
- `#EXT-X-VERSION`: Protocol version
- `#EXT-X-TARGETDURATION`: Maximum media segment duration
- `#EXT-X-MEDIA-SEQUENCE`: Media sequence number
- `#EXT-X-DISCONTINUITY`: Timeline discontinuity

## Examples

### Basic Audio Playlist
```m3u
#EXTM3U
#PLAYLIST:My Music Collection

#EXTINF:180,Artist1 - Song1
/Music/song1.mp3

#EXTINF:240,Artist2 - Song2
/Music/song2.mp3
```

### Video Playlist with Groups
```m3u
#EXTM3U
#PLAYLIST:My Movie Collection

#EXTGRP:Action Movies
#EXTINF:-1,Movie1
/Movies/movie1.mp4

#EXTGRP:Comedy
#EXTINF:-1,Movie2
/Movies/movie2.mp4
```

### Mixed Media Playlist
```m3u
#EXTM3U
#PLAYLIST:Mixed Media

#EXTGRP:Music
#EXTINF:180,Song1
/Music/song1.mp3

#EXTGRP:Videos
#EXTINF:-1,Video1
/Videos/video1.mp4
```

## Best Practices

### File Organization
1. Start with `#EXTM3U`
2. Group similar content together
3. Use consistent naming conventions
4. Include relevant metadata
5. Use absolute paths when possible

### Metadata Management
1. Always include duration information
2. Add descriptive titles
3. Use grouping for organization
4. Include relevant comments
5. Maintain consistent formatting

### Path Handling
1. Use forward slashes (/) for all paths
2. Convert backslashes to forward slashes
3. Use relative paths for portable playlists
4. Handle special characters properly
5. Validate URLs for remote content

## Compatibility

### Media Players
- VLC Media Player
- Windows Media Player
- MPC-HC
- PotPlayer
- GOM Player
- IINA (macOS)
- MPV Player

### Devices
- Smart TVs
- Mobile devices
- Gaming consoles
- Media centers
- Streaming devices

### Operating Systems
- Windows
- macOS
- Linux
- Android
- iOS

## Common Issues

### Troubleshooting
1. **File Not Found**
   - Check path accuracy
   - Verify file permissions
   - Ensure media exists

2. **Character Encoding**
   - Use UTF-8 for M3U8
   - Handle special characters
   - Check file encoding

3. **Playback Issues**
   - Verify media codec support
   - Check file permissions
   - Validate media files

4. **Path Problems**
   - Use correct path separators
   - Handle spaces in paths
   - Consider case sensitivity

### Tips
1. Always validate playlist files
2. Test on target devices
3. Keep backups of playlists
4. Use consistent formatting
5. Document any special requirements 