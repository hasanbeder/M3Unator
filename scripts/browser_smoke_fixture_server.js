const http = require('node:http');

const HTML_CONTENT_TYPE = 'text/html; charset=utf-8';
const TEXT_CONTENT_TYPE = 'text/plain; charset=utf-8';

const FIXTURE_VARIANTS = {
    apache: {
        mode: 'apache',
        titlePrefix: 'Index of',
        pages: {
            '/apache/': {
                entries: [
                    { href: '../', label: 'Parent Directory' },
                    { href: 'Season%201/', label: 'Season 1/' },
                    { href: 'intro.mp4', label: 'intro.mp4' },
                    { href: 'song%20one.mp3', label: 'song one.mp3' }
                ]
            },
            '/apache/Season 1/': {
                entries: [
                    { href: '../', label: 'Parent Directory' },
                    { href: 'Extras/', label: 'Extras/' },
                    { href: 'Episode%2001.mp4', label: 'Episode 01.mp4' }
                ]
            },
            '/apache/Season 1/Extras/': {
                entries: [
                    { href: '../', label: 'Parent Directory' },
                    { href: 'Behind%20the%20Scenes.mp3', label: 'Behind the Scenes.mp3' },
                    { href: 'Episode%2002.mkv', label: 'Episode 02.mkv' },
                    { href: 'Live%20Set.flac', label: 'Live Set.flac' }
                ]
            }
        }
    },
    litespeed: {
        mode: 'litespeed',
        titlePrefix: 'Index of',
        pages: {
            '/litespeed/': {
                entries: [
                    { href: '../', label: 'Parent Directory' },
                    { href: 'albums/', label: 'albums/' },
                    { href: 'teaser.mkv', label: 'teaser.mkv' }
                ]
            },
            '/litespeed/albums/': {
                entries: [
                    { href: '../', label: 'Parent Directory' },
                    { href: 'Disc%201/', label: 'Disc 1/' },
                    { href: 'Live%20Set.m4a', label: 'Live Set.m4a' }
                ]
            },
            '/litespeed/albums/Disc 1/': {
                entries: [
                    { href: '../', label: 'Parent Directory' },
                    { href: 'Track%2001.mp3', label: 'Track 01.mp3' },
                    { href: 'Video%20Clip.mp4', label: 'Video Clip.mp4' }
                ]
            }
        }
    }
};

const FILE_CONTENT_TYPES = new Map([
    ['mp3', 'audio/mpeg'],
    ['m4a', 'audio/mp4'],
    ['flac', 'audio/flac'],
    ['mp4', 'video/mp4'],
    ['mkv', 'video/x-matroska']
]);

function getVariantNameFromPath(pathname) {
    const normalizedPath = pathname.toLowerCase();

    return (
        Object.keys(FIXTURE_VARIANTS).find(
            variantName => normalizedPath === `/${variantName}/` || normalizedPath.startsWith(`/${variantName}/`)
        ) || null
    );
}

function buildApacheListingHtml(pathname, entries, titlePrefix) {
    const title = `${titlePrefix} ${pathname}`;
    const rows = entries.map(entry => `<a href="${entry.href}">${entry.label}</a>`).join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>${title}</title>
</head>
<body>
    <h1>${title}</h1>
    <pre>${rows}</pre>
</body>
</html>`;
}

function buildLiteSpeedListingHtml(pathname, entries, titlePrefix) {
    const title = `${titlePrefix} ${pathname}`;
    const rows = entries
        .map(
            entry => `
        <tr>
            <td class="name"><a href="${entry.href}">${entry.label}</a></td>
            <td class="size">-</td>
            <td class="modified">2026-04-26 12:00</td>
        </tr>
    `
        )
        .join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>${title}</title>
</head>
<body>
    <h1>${title}</h1>
    <div id="table-list">
        <table id="table-content">
            <tbody>${rows}</tbody>
        </table>
    </div>
</body>
</html>`;
}

function buildIndexHtml() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>M3Unator Smoke Fixtures</title>
</head>
<body>
    <h1>M3Unator Smoke Fixtures</h1>
    <ul>
        <li><a href="/apache/">Apache-style Listing</a></li>
        <li><a href="/litespeed/">LiteSpeed-style Listing</a></li>
    </ul>
</body>
</html>`;
}

function delay(ms) {
    if (!ms) {
        return Promise.resolve();
    }

    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

function writeHtml(response, html) {
    response.writeHead(200, { 'Content-Type': HTML_CONTENT_TYPE });
    response.end(html);
}

function writeText(response, content, contentType = TEXT_CONTENT_TYPE) {
    response.writeHead(200, { 'Content-Type': contentType });
    response.end(content);
}

function writeNotFound(response, pathname) {
    response.writeHead(404, { 'Content-Type': TEXT_CONTENT_TYPE });
    response.end(`Fixture not found: ${pathname}`);
}

function createSmokeFixtureServer(options = {}) {
    const { responseDelayMs = 350 } = options;

    return http.createServer(async (request, response) => {
        const requestUrl = new URL(request.url || '/', 'http://127.0.0.1');
        const decodedPathname = decodeURIComponent(requestUrl.pathname);

        if (decodedPathname === '/') {
            writeHtml(response, buildIndexHtml());
            return;
        }

        const variantName = getVariantNameFromPath(decodedPathname);
        if (!variantName) {
            writeNotFound(response, decodedPathname);
            return;
        }

        const variant = FIXTURE_VARIANTS[variantName];
        const page = variant.pages[decodedPathname];

        if (page) {
            await delay(responseDelayMs);

            const html =
                variant.mode === 'litespeed'
                    ? buildLiteSpeedListingHtml(decodedPathname, page.entries, variant.titlePrefix)
                    : buildApacheListingHtml(decodedPathname, page.entries, variant.titlePrefix);

            writeHtml(response, html);
            return;
        }

        const extension = decodedPathname.split('.').pop()?.toLowerCase() || '';
        const contentType = FILE_CONTENT_TYPES.get(extension);

        if (contentType) {
            writeText(response, `fixture:${decodedPathname}`, contentType);
            return;
        }

        writeNotFound(response, decodedPathname);
    });
}

module.exports = {
    createSmokeFixtureServer
};
