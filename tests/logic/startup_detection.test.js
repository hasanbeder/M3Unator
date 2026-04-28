const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const { loadStartupHelpers } = require('../helpers/load_startup_helpers');

const repoRoot = path.resolve(__dirname, '..', '..');

function readFixture(fileName) {
    return fs.readFileSync(path.join(repoRoot, 'fixtures', 'listings', fileName), 'utf8');
}

function stripHtmlTags(value) {
    return value
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function createTextNode(textContent) {
    return { textContent };
}

function createAnchor(href, textContent) {
    return {
        textContent,
        getAttribute(name) {
            return name === 'href' ? href : null;
        }
    };
}

function extractAnchors(html) {
    const anchorRegex = /<a\b[^>]*href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/gi;
    const anchors = [];

    for (const match of html.matchAll(anchorRegex)) {
        anchors.push(createAnchor(match[1] || match[2] || match[3] || '', stripHtmlTags(match[4] || '')));
    }

    return anchors;
}

function extractTitle(html) {
    const match = html.match(/<title>([\s\S]*?)<\/title>/i);
    return stripHtmlTags(match ? match[1] : '');
}

function extractScopedAnchors(html, selector) {
    const selectors = {
        'pre a[href]': /<pre\b[^>]*>[\s\S]*?<\/pre>/gi,
        '#table-content a[href]': /<table\b[^>]+id=["']table-content["'][^>]*>[\s\S]*?<\/table>/gi,
        'table.listing a[href]': /<table\b[^>]+class=["'][^"']*\blisting\b[^"']*["'][^>]*>[\s\S]*?<\/table>/gi,
        'table#listing a[href]': /<table\b[^>]+id=["']listing["'][^>]*>[\s\S]*?<\/table>/gi,
        'table[summary="Directory Listing"] a[href]':
            /<table\b[^>]+summary=["']Directory Listing["'][^>]*>[\s\S]*?<\/table>/gi
    };

    if (selector === 'a[href]') {
        return extractAnchors(html);
    }

    const pattern = selectors[selector];
    if (!pattern) {
        return [];
    }

    const scopes = html.match(pattern) || [];
    return scopes.flatMap(scopeHtml => extractAnchors(scopeHtml));
}

function matchesSelector(html, selector) {
    switch (selector) {
        case 'div#table-list':
            return /<div[^>]+id=["']table-list["']/i.test(html);
        case 'table#listing':
            return /<table[^>]+id=["']listing["']/i.test(html);
        case 'table.listing':
            return /<table[^>]+class=["'][^"']*\blisting\b[^"']*["']/i.test(html);
        case 'table[summary="Directory Listing"]':
            return /<table[^>]+summary=["']Directory Listing["']/i.test(html);
        case 'nav.breadcrumbs':
            return /<nav[^>]+class=["'][^"']*\bbreadcrumbs\b[^"']*["']/i.test(html);
        case 'pre':
            return /<pre\b/i.test(html);
        default:
            return false;
    }
}

function extractHeading(html, tagName) {
    const match = html.match(new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i'));
    return match ? createTextNode(stripHtmlTags(match[1])) : null;
}

function createStartupDocument(html) {
    const anchors = extractAnchors(html);

    return {
        title: extractTitle(html),
        body: createTextNode(stripHtmlTags(html)),
        querySelector(selector) {
            if (selector === 'h1' || selector === 'h2') {
                return extractHeading(html, selector);
            }

            return matchesSelector(html, selector) ? {} : null;
        },
        querySelectorAll(selector) {
            if (selector === 'a[href]') {
                return anchors;
            }

            return extractScopedAnchors(html, selector);
        }
    };
}

function assertSupportedFixture(fileName) {
    const document = createStartupDocument(readFixture(fileName));
    const { isSupportedDirectoryListingPage } = loadStartupHelpers({ document });

    assert.equal(isSupportedDirectoryListingPage(document), true);
}

test('isSupportedDirectoryListingPage accepts Apache, Nginx, LiteSpeed, Lighttpd, IIS, and Caddy fixtures', () => {
    [
        'apache-index.html',
        'nginx-index.html',
        'litespeed-index.html',
        'lighttpd-index.html',
        'iis-index.html',
        'caddy-index.html'
    ].forEach(assertSupportedFixture);
});

test('isSupportedDirectoryListingPage keeps bare Index Of pages supported for small root listings', () => {
    const html = `<!DOCTYPE html>
<html>
<head><title>Index of /music/</title></head>
<body>
    <h1>Index of /music/</h1>
    <a href="Track%2001.mp3">Track 01.mp3</a>
</body>
</html>`;
    const document = createStartupDocument(html);
    const { isSupportedDirectoryListingPage } = loadStartupHelpers({ document });

    assert.equal(isSupportedDirectoryListingPage(document), true);
});

test('isSupportedDirectoryListingPage accepts Apache-style listings that omit Index Of but keep parent and sort links', () => {
    const html = `<!DOCTYPE html>
<html>
<head><title>Apache Archive Distribution Directory</title></head>
<body>
    <h1>Apache Archive Distribution Directory</h1>
    <a href="?C=N;O=D">Name</a>
    <a href="?C=M;O=A">Last modified</a>
    <a href="/">Parent Directory</a>
    <a href="META/">META/</a>
    <a href="activemq/">activemq/</a>
</body>
</html>`;
    const document = createStartupDocument(html);
    const { isSupportedDirectoryListingPage } = loadStartupHelpers({ document });

    assert.equal(isSupportedDirectoryListingPage(document), true);
});

test('isSupportedDirectoryListingPage accepts IIS-style listings that use localhost titles and To Parent Directory copy', () => {
    const document = createStartupDocument(readFixture('iis-absolute-index.html'));
    const { isSupportedDirectoryListingPage } = loadStartupHelpers({
        document,
        window: {
            location: {
                href: 'https://example.com/downloads/'
            }
        }
    });

    assert.equal(isSupportedDirectoryListingPage(document), true);
});

test('isSupportedDirectoryListingPage rejects directory-listing copy without listing structure', () => {
    const html = `<!DOCTYPE html>
<html>
<head><title>Directory Listing</title></head>
<body>
    <h1>Directory Listing</h1>
    <p>This page documents directory listing options.</p>
    <a href="/docs/">Documentation</a>
</body>
</html>`;
    const document = createStartupDocument(html);
    const { isSupportedDirectoryListingPage } = loadStartupHelpers({ document });

    assert.equal(isSupportedDirectoryListingPage(document), false);
});

test('isSupportedDirectoryListingPage rejects breadcrumb tables without relative listing candidates', () => {
    const html = `<!DOCTYPE html>
<html>
<head><title>archive</title></head>
<body>
    <nav class="breadcrumbs">
        <a href="/">root</a>
        <a href="/archive/">archive</a>
    </nav>
    <table class="listing">
        <tbody>
            <tr>
                <td><a href="/albums/">Albums</a></td>
            </tr>
        </tbody>
    </table>
</body>
</html>`;
    const document = createStartupDocument(html);
    const { isSupportedDirectoryListingPage } = loadStartupHelpers({ document });

    assert.equal(isSupportedDirectoryListingPage(document), false);
});

test('isSupportedDirectoryListingPage rejects LiteSpeed shells without child anchors', () => {
    const html = `<!DOCTYPE html>
<html>
<head><title>Index of /empty/</title></head>
<body>
    <div id="table-list">
        <table id="table-content">
            <tbody></tbody>
        </table>
    </div>
</body>
</html>`;
    const document = createStartupDocument(html);
    const { isSupportedDirectoryListingPage } = loadStartupHelpers({ document });

    assert.equal(isSupportedDirectoryListingPage(document), false);
});

test('isSupportedDirectoryListingPage rejects Index Of pages whose links are mixed with non-listing chrome', () => {
    const html = `<!DOCTYPE html>
<html>
<head><title>Index of project notes</title></head>
<body>
    <header><a href="/home/">Home</a></header>
    <main><a href="contact/">Contact</a></main>
</body>
</html>`;
    const document = createStartupDocument(html);
    const { isSupportedDirectoryListingPage } = loadStartupHelpers({ document });

    assert.equal(isSupportedDirectoryListingPage(document), false);
});

test('isSupportedDirectoryListingPage rejects GitHub repository pages that contain code blocks, query tabs, and same-path links', () => {
    const html = `<!DOCTYPE html>
<html>
<head><title>owner/repo at main · GitHub</title></head>
<body>
    <header>
        <a href="/">GitHub</a>
        <a href="/owner">owner</a>
    </header>
    <main>
        <a href="/owner/repo/tree/main/src/">src/</a>
        <a href="?tab=readme-ov-file">README</a>
        <pre>const example = true;</pre>
    </main>
</body>
</html>`;
    const document = createStartupDocument(html);
    const { isSupportedDirectoryListingPage } = loadStartupHelpers({
        document,
        window: {
            location: {
                href: 'https://github.com/owner/repo/tree/main/'
            }
        }
    });

    assert.equal(isSupportedDirectoryListingPage(document), false);
});

test('getDirectoryLinks ignores Caddy breadcrumbs and parent links while keeping relative media targets', () => {
    const document = createStartupDocument(readFixture('caddy-index.html'));
    const { getDirectoryLinks } = loadStartupHelpers({
        document,
        window: {
            location: {
                href: 'https://example.com/archive/'
            }
        }
    });

    assert.deepEqual(Array.from(getDirectoryLinks()), [
        'https://example.com/archive/Albums/',
        'https://example.com/archive/Concert%20Film.mkv',
        'https://example.com/archive/Set%20List.m4a'
    ]);
});

test('getDirectoryLinks ignores IIS parent and sortable query links while keeping relative entries', () => {
    const document = createStartupDocument(readFixture('iis-index.html'));
    const { getDirectoryLinks } = loadStartupHelpers({
        document,
        window: {
            location: {
                href: 'https://example.com/media/'
            }
        }
    });

    assert.deepEqual(Array.from(getDirectoryLinks()), [
        'https://example.com/media/Shows/',
        'https://example.com/media/Clip%2001.mp4',
        'https://example.com/media/Theme%20Song.mp3',
        'https://example.com/media/notes.txt'
    ]);
});

test('getDirectoryLinks normalizes IIS absolute child links while skipping the site root parent link', () => {
    const document = createStartupDocument(readFixture('iis-absolute-index.html'));
    const { getDirectoryLinks } = loadStartupHelpers({
        document,
        window: {
            location: {
                href: 'https://example.com/downloads/'
            }
        }
    });

    assert.deepEqual(Array.from(getDirectoryLinks()), [
        'https://example.com/downloads/Old/',
        'https://example.com/downloads/meeting.mp4',
        'https://example.com/downloads/sermon.m4a',
        'https://example.com/downloads/notes.txt'
    ]);
});

test('getDirectoryLinks scopes Apache-style extraction to the listing container', () => {
    const document = createStartupDocument(readFixture('apache-noisy-index.html'));
    const { getDirectoryLinks } = loadStartupHelpers({
        document,
        window: {
            location: {
                href: 'https://example.com/mix/'
            }
        }
    });

    assert.deepEqual(Array.from(getDirectoryLinks()), [
        'https://example.com/mix/Series/',
        'https://example.com/mix/Episode%2001.mkv'
    ]);
});
