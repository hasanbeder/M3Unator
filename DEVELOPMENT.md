# M3Unator Development Documentation (v1.1.0)

## Project Structure

```
M3Unator/
├── M3Unator.user.js           # Installable userscript
├── M3Unator.meta.js           # Userscript metadata
├── screenshots/screenshot.png
├── tests/manual_testing_guide.md
├── wiki/home.md
├── README.md
├── DEVELOPMENT.md             # This file
├── CHANGELOG.md
├── CONTRIBUTING.md
├── SECURITY.md
├── CODE_OF_CONDUCT.md
└── LICENSE
```

## Core Architecture

The userscript runs as a single IIFE containing a `PlaylistGenerator` class with these layers:

1. **Detection** — Analyzes the current page DOM to determine if it is a supported directory listing (Apache, Nginx, LiteSpeed, Lighttpd, IIS, Caddy). Exits immediately if not.

2. **Presentation** — Injects Catppuccin Mocha dark theme CSS via `GM_addStyle`.

3. **UI** — Builds a draggable popup with playlist name input, format selector (.m3u/.m3u8), media toggles (video/audio), subfolder toggle, aggressive mode switch, depth controls, and scan controls (pause/resume/cancel).

4. **Scanning** — Concurrent task scheduler with adaptive concurrency:
   - Normal mode: starts at 4, scales up to 12 parallel requests
   - Aggressive mode: starts at 6, scales up to 20 parallel requests
   - Reacts to rate-limiting (429/503), timeouts, error rates, and event-loop lag

5. **Output** — Generates Extended M3U playlists sorted by depth and natural title order, with video before audio. Supports optional IPTV `group-title` metadata and UTF-8 BOM for .m3u8 exports.

6. **Network** — Fetch-with-retry with exponential backoff. Permanent errors (401/403/404/410) and timeouts are thrown immediately without retry.

## Supported Directory Listings

- Apache `mod_autoindex`
- Nginx autoindex
- LiteSpeed and OpenLiteSpeed
- Lighttpd `mod_dirlisting`
- IIS directory browsing
- Caddy `file_server browse`

## Supported Media Formats

**Video (33):** mp4, mkv, avi, webm, mov, flv, wmv, m4v, mpg, mpeg, 3gp, vob, ts, mts, m2ts, divx, xvid, asf, ogv, rm, rmvb, wtv, qt, hevc, f4v, swf, vro, ogx, drc, gifv, mxf, roq, nsv

**Audio (41):** mp3, m4a, wav, flac, aac, ogg, wma, opus, aiff, ape, mka, ac3, dts, m4b, m4p, m4r, mid, midi, mp2, mpa, mpc, ra, tta, voc, vox, amr, awb, dsf, dff, alac, wv, oga, sln, aif, pcm

## Manual Testing

See `tests/manual_testing_guide.md` for guided QA scenarios covering scan controls, format export, depth limits, and edge cases.

## Privacy

M3Unator runs entirely in the browser. No data is uploaded to any remote service.

## Development Resources

- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
- [DOMParser](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser)
- [Security Best Practices](https://owasp.org/www-project-top-ten/)
