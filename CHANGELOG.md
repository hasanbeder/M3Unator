# Changelog

## [1.1.0] - 2026-04-29

### Added

* Added optional IPTV `group-title` export for single-category directories.
* Added an optional group-title control beside the playlist format selector for single-category exports.

### Changed

* Moved aggressive scanning into the Create Playlist action as a compact switch.
* Updated README and manual QA guidance to match adaptive concurrency and batch behavior.

### Fixed

* Prevented duplicate playlist entries when repeated file URLs cross large file batch boundaries.

## [1.0.2] - 2024-12-29

### Performance Improvements

* Adaptive directory request concurrency (normal mode starts at 4, scales up to 12; aggressive mode starts at 6, scales up to 20)
* File processing batches of 100 entries with yield every 500 files
* Seen-URL deduplication cache with automatic trimming
* O(1) extension lookup via Map for media file classification

### Web Server Support

* LiteSpeed directory listing support
* Caddy `file_server browse` detection
* IIS directory browsing with absolute-path normalization
* Lighttpd `mod_dirlisting` support
* Multi-signal scoring system for listing page detection

### Error Handling & Security

* Categorized error presentation (HTTP, decode, network, security, abort, default)
* Fetch-with-retry with exponential backoff
* Permanent error short-circuit for 401/403/404/410 responses
* Input sanitization for playlist names
* URL and HTML entity decoding with malformed-percent-encoding fallback

### UI/UX Improvements

* Catppuccin Mocha dark theme
* Toast notification system with bounce animations
* Categorized log entries (success, error, warning, info, final)
* Real-time stats bar with 6 counters (total files, video, audio, folders, depth, errors)
* Collapsible Recent Activity panel
* Draggable popup with viewport clamping

### Code Structure

* PlaylistGenerator class with ordered runtime parts
* LogCache class (ring buffer, max 100 entries)

## [1.0.1] - 2024-12-14

### Added

* Version number display in info modal

### Changed

* UI Improvements: Playlist name field and Create Playlist button heights aligned
* UI Improvements: M3U/M3U8 selector dropdown positioning fixed
* UI Improvements: Background interaction blocked when modal is open
* Enhancement: LiteSpeed directory listing support improved

## [1.0.0] - 2024-12-13

### Added

* Initial release
* Create M3U/M3U8 playlists from directory listing pages
* Support for video and audio file formats
* Recursive directory scanning
* Progress tracking and logging
* Dark theme UI
