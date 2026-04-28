# Fixtures

This directory stores parser and scan regression fixtures used by `npm run test:logic`.

Current contents:
- `listings/apache-index.html`: Apache-style directory listing with query and parent-navigation noise
- `listings/nginx-index.html`: Nginx-style directory listing with relative directories and media files
- `listings/litespeed-index.html`: LiteSpeed table listing with parent-directory row filtering
- `listings/lighttpd-index.html`: Lighttpd `mod_dirlisting` table listing with sortable query links
- `listings/iis-index.html`: IIS directory browsing table with parent-navigation and sortable headers
- `listings/caddy-index.html`: Caddy `file_server browse` style listing with breadcrumb noise and mixed media links

Release-family baseline for parser coverage:
- Apache `mod_autoindex`
- Nginx autoindex
- LiteSpeed / OpenLiteSpeed table listings
- Lighttpd `mod_dirlisting`
- IIS directory browsing
- Caddy `file_server browse`
