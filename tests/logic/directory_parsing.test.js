const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const { loadPlaylistGenerator } = require('../helpers/load_playlist_generator');

const repoRoot = path.resolve(__dirname, '..', '..');

function readFixture(fileName) {
    return fs.readFileSync(path.join(repoRoot, 'fixtures', 'listings', fileName), 'utf8');
}

function createGenerator(overrides = {}) {
    const { PlaylistGenerator } = loadPlaylistGenerator(overrides);
    const generator = new PlaylistGenerator();
    generator.addLogEntry = () => {};
    generator.updateCounter = () => {};
    return generator;
}

function toPlainArray(values) {
    return Array.from(values);
}

function toPlainObject(value) {
    return JSON.parse(JSON.stringify(value));
}

function assertFixtureHrefs(fileName, expected, overrides = {}) {
    const generator = createGenerator(overrides);
    const hrefs = toPlainArray(generator.extractDirectoryHrefs(readFixture(fileName)));

    assert.deepEqual(hrefs, expected);
}

test('extractDirectoryHrefs parses Apache-style listings and skips navigation links', () => {
    assertFixtureHrefs('apache-index.html', ['Movies/', 'Concert%20Clip.mp4', 'Soundtrack.flac', 'notes.txt']);
});

test('extractDirectoryHrefs scopes Apache pre listings so footer links do not become scan candidates', () => {
    assertFixtureHrefs('apache-noisy-index.html', ['Series/', 'Episode%2001.mkv'], {
        window: {
            location: {
                href: 'https://example.com/mix/'
            }
        }
    });
});

test('extractDirectoryHrefs parses Nginx-style listings and keeps relative scan targets', () => {
    assertFixtureHrefs('nginx-index.html', ['Albums/', 'Track%2001.mp3', 'Track%2002.mp3', 'cover.jpg']);
});

test('extractDirectoryHrefs parses LiteSpeed table listings and ignores parent rows', () => {
    assertFixtureHrefs('litespeed-index.html', ['Series/', 'Episode%201.mkv', 'Poster.jpg']);
});

test('extractDirectoryHrefs parses Lighttpd mod_dirlisting listings and skips sortable query links', () => {
    assertFixtureHrefs('lighttpd-index.html', ['Films/', 'Live%20Set.flac', 'Trailer%20Cut.mp4', 'cover.jpg']);
});

test('extractDirectoryHrefs parses IIS directory browsing listings and keeps relative file links', () => {
    assertFixtureHrefs('iis-index.html', ['Shows/', 'Clip%2001.mp4', 'Theme%20Song.mp3', 'notes.txt']);
});

test('extractDirectoryHrefs normalizes IIS absolute child links into directory-relative scan targets', () => {
    assertFixtureHrefs('iis-absolute-index.html', ['Old/', 'meeting.mp4', 'sermon.m4a', 'notes.txt'], {
        window: {
            location: {
                href: 'https://example.com/downloads/'
            }
        }
    });
});

test('extractDirectoryHrefs parses Caddy browse listings while ignoring breadcrumb root links', () => {
    assertFixtureHrefs('caddy-index.html', ['Albums/', 'Concert%20Film.mkv', 'Set%20List.m4a']);
});

test('extractDirectoryHrefs returns an empty set for non-listing pages with incidental links', () => {
    const generator = createGenerator({
        window: {
            location: {
                href: 'https://example.com/archive/'
            }
        }
    });
    const html = `<!DOCTYPE html>
<html>
<head><title>Library Notes</title></head>
<body>
    <nav><a href="/archive/">Archive</a></nav>
    <main><a href="contact/">Contact</a></main>
</body>
</html>`;

    assert.deepEqual(toPlainArray(generator.extractDirectoryHrefs(html)), []);
});

test('extractDirectoryHrefs returns an empty set for GitHub repository pages that resemble listings', () => {
    const generator = createGenerator({
        window: {
            location: {
                href: 'https://github.com/owner/repo/tree/main/'
            }
        }
    });
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

    assert.deepEqual(toPlainArray(generator.extractDirectoryHrefs(html)), []);
});

test('splitDirectoryAndFileHrefs separates recursive targets from file candidates', () => {
    const generator = createGenerator();
    const { directories, files } = generator.splitDirectoryAndFileHrefs(['Series/', 'Episode%201.mkv', 'Poster.jpg']);

    assert.deepEqual(toPlainArray(directories), ['Series/']);
    assert.deepEqual(toPlainArray(files), ['Episode%201.mkv', 'Poster.jpg']);
});

test('buildNormalizedScanUrl keeps scan URLs stable for whitespace and bracket characters', () => {
    const generator = createGenerator();
    const normalizedUrl = generator.buildNormalizedScanUrl('https://example.com//Media Library/Season [1]/');

    assert.equal(normalizedUrl, 'https://example.com/Media%20Library/Season%20%5B1%5D/');
});

test('processFileHref keeps decoded nested path segments in playlist entries', () => {
    const generator = createGenerator();
    generator.state.includeVideo = true;

    generator.processFileHref(
        'Episode%203.mkv',
        'https://example.com/Series/Season%201/',
        'Series/Season 1',
        new Set(),
        generator.createBatchProgress(1)
    );

    assert.deepEqual(toPlainObject(generator.entries), [
        {
            title: 'Series/Season 1/Episode 3.mkv',
            url: 'https://example.com/Series/Season%201/Episode%203.mkv'
        }
    ]);
});

test('queueSubdirectoryScan keeps decoded directory names in recursive log entries', async () => {
    const generator = createGenerator();
    const logs = [];
    const activeRequests = new Set();

    generator.addLogEntry = message => {
        logs.push(message);
    };
    generator.scanDirectory = async () => generator.entries;

    generator.queueSubdirectoryScan('Season%201/', 'https://example.com/Series/', 'Series', 0, activeRequests);

    await Promise.all(Array.from(activeRequests));

    assert.equal(logs.at(-1), 'Entering subdirectory: Series/Season 1');
});

test('scanDirectory skips fetched pages that are not directory listings', async () => {
    const generator = createGenerator({
        window: {
            location: {
                href: 'https://example.com/archive/'
            }
        }
    });
    const logs = [];

    generator.state.isGenerating = true;
    generator.addLogEntry = (message, type = '') => {
        logs.push({ message, type });
    };
    generator.fetchWithRetry = async () => ({
        decodedText: `<!DOCTYPE html>
<html>
<head><title>Library Notes</title></head>
<body>
    <nav><a href="/archive/">Archive</a></nav>
    <main><a href="contact/">Contact</a></main>
</body>
</html>`
    });

    await generator.scanDirectory('https://example.com/archive/');

    assert.deepEqual(toPlainObject(generator.entries), []);
    assert.equal(logs.at(-1).message, 'Skipped non-listing page: https://example.com/archive/');
    assert.equal(logs.at(-1).type, 'warning');
});
