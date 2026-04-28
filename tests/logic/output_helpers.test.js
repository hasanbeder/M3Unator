const test = require('node:test');
const assert = require('node:assert/strict');

const { loadPlaylistGenerator } = require('../helpers/load_playlist_generator');

function createGenerator(options = {}) {
    const { stubAddLogEntry = true, overrides = {} } = options;
    const { PlaylistGenerator } = loadPlaylistGenerator(overrides);
    const generator = new PlaylistGenerator();
    if (stubAddLogEntry) {
        generator.addLogEntry = () => {};
    }
    generator.updateCounter = () => {};
    return generator;
}

function toPlainObject(value) {
    return JSON.parse(JSON.stringify(value));
}

function toPlainArray(values) {
    return Array.from(values);
}

function createMockScanLog() {
    const children = [];
    let clearCount = 0;

    const syncRefs = scanLog => {
        scanLog.firstElementChild = children[0] || null;
        scanLog.lastElementChild = children[children.length - 1] || null;
        scanLog.childElementCount = children.length;
    };

    const scanLog = {
        scrollTop: 0,
        scrollHeight: 100,
        clientHeight: 100,
        appendChild(fragment) {
            const nodes = Array.isArray(fragment) ? fragment : [];
            nodes.forEach(node => {
                children.push(node);
            });
            syncRefs(this);
        },
        removeChild(node) {
            const index = children.indexOf(node);
            if (index >= 0) {
                children.splice(index, 1);
            }
            syncRefs(this);
        },
        getRenderedSequences() {
            return children.map(node => node.dataset.logSequence);
        },
        getClearCount() {
            return clearCount;
        }
    };

    Object.defineProperty(scanLog, 'innerHTML', {
        get() {
            return children.length > 0 ? 'rendered' : '';
        },
        set(value) {
            if (value === '') {
                children.length = 0;
                clearCount++;
                syncRefs(scanLog);
            }
        }
    });

    syncRefs(scanLog);
    return scanLog;
}

function createMockClassList(initialTokens = []) {
    const tokens = new Set(initialTokens);

    return {
        add(...nextTokens) {
            nextTokens.forEach(token => tokens.add(token));
        },
        remove(...nextTokens) {
            nextTokens.forEach(token => tokens.delete(token));
        },
        contains(token) {
            return tokens.has(token);
        },
        toggle(token, force) {
            if (typeof force === 'boolean') {
                if (force) {
                    tokens.add(token);
                    return true;
                }

                tokens.delete(token);
                return false;
            }

            if (tokens.has(token)) {
                tokens.delete(token);
                return false;
            }

            tokens.add(token);
            return true;
        }
    };
}

function createMockEventTarget(overrides = {}) {
    const listeners = new Map();

    return {
        ...overrides,
        addEventListener(type, listener) {
            listeners.set(type, listener);
        },
        dispatch(type, event = {}) {
            const listener = listeners.get(type);
            if (listener) {
                listener(event);
            }
        }
    };
}

function createMockDropdownButton(label = '.m3u') {
    const labelNode = { textContent: label };

    return createMockEventTarget({
        disabled: false,
        labelNode,
        querySelector(selector) {
            return selector === 'span' ? labelNode : null;
        },
        setAttribute(name, value) {
            this[name] = value;
        }
    });
}

function createMockDropdownItem(value, label, selected = false) {
    return createMockEventTarget({
        dataset: {
            value,
            buttonLabel: label
        },
        textContent: label,
        classList: createMockClassList(selected ? ['selected'] : []),
        setAttribute(name, nextValue) {
            this[name] = nextValue;
        }
    });
}

function createMockAttributeNode(initialAttributes = {}) {
    const attributes = { ...initialAttributes };

    return {
        ...attributes,
        setAttribute(name, value) {
            attributes[name] = value;
            this[name] = value;
        },
        getAttribute(name) {
            return attributes[name];
        },
        removeAttribute(name) {
            delete attributes[name];
            delete this[name];
        }
    };
}

test('decodeString resolves HTML entities and percent-encoding together', () => {
    const generator = createGenerator();

    assert.equal(generator.decodeString('Artist%20&amp;%20Band'), 'Artist & Band');
});

test('extractFileInfo returns decoded path segments while preserving original path data', () => {
    const generator = createGenerator();
    const fileInfo = toPlainObject(generator.extractFileInfo('Albums/Best%20Of/Track%2001.mp3'));

    assert.deepEqual(fileInfo, {
        fileName: 'Track 01.mp3',
        dirPath: 'Albums/Best Of',
        original: {
            fileName: 'Track%2001.mp3',
            dirPath: 'Albums/Best%20Of'
        }
    });
});

test('extractDirectoryInfo trims trailing slashes while preserving decoded directory names', () => {
    const generator = createGenerator();
    const directoryInfo = toPlainObject(generator.extractDirectoryInfo('Albums/Best%20Of/'));

    assert.deepEqual(directoryInfo, {
        fileName: 'Best Of',
        dirPath: 'Albums',
        original: {
            fileName: 'Best%20Of',
            dirPath: 'Albums'
        }
    });
});

test('createPlaylist keeps decoded titles readable and preserves video-before-audio ordering', () => {
    const generator = createGenerator();
    const playlist = generator.createPlaylist([
        {
            title: 'Season%202/Episode%2010.mp4',
            url: 'https://example.com/Season%202/Episode%2010.mp4'
        },
        {
            title: '01%20-%20Intro.mp3',
            url: 'https://example.com/01%20-%20Intro.mp3'
        },
        {
            title: 'Episode%202.mp4',
            url: 'https://example.com/Episode%202.mp4'
        },
        {
            title: '02%20-%20Outro.mp3',
            url: 'https://example.com/02%20-%20Outro.mp3'
        }
    ]);

    assert.equal(
        playlist,
        '#EXTM3U\n' +
            '#EXTINF:-1,Episode 2.mp4\n' +
            'https://example.com/Episode%202.mp4\n' +
            '#EXTINF:-1,Season 2/Episode 10.mp4\n' +
            'https://example.com/Season%202/Episode%2010.mp4\n' +
            '#EXTINF:-1,01 - Intro.mp3\n' +
            'https://example.com/01%20-%20Intro.mp3\n' +
            '#EXTINF:-1,02 - Outro.mp3\n' +
            'https://example.com/02%20-%20Outro.mp3\n'
    );
});

test('buildPlaylistDownloadPayload keeps .m3u plain and emits UTF-8 BOM for .m3u8', () => {
    const generator = createGenerator();
    const entries = [
        {
            title: 'Episode%202.mp4',
            url: 'https://example.com/Episode%202.mp4'
        }
    ];

    const m3uPayload = toPlainObject(generator.buildPlaylistDownloadPayload(entries, 'm3u'));
    const m3u8Payload = toPlainObject(generator.buildPlaylistDownloadPayload(entries, 'm3u8'));

    assert.equal(m3uPayload.extension, 'm3u');
    assert.equal(m3uPayload.mimeType, 'audio/x-mpegurl;charset=utf-8');
    assert.equal(m3uPayload.prependUtf8Bom, false);
    assert.equal(m3uPayload.content.startsWith('\uFEFF'), false);

    assert.equal(m3u8Payload.extension, 'm3u8');
    assert.equal(m3u8Payload.mimeType, 'application/vnd.apple.mpegurl;charset=utf-8');
    assert.equal(m3u8Payload.prependUtf8Bom, true);
    assert.equal(m3u8Payload.content.startsWith('\uFEFF'), true);
    assert.equal(m3u8Payload.content.slice(1), m3uPayload.content);
});

test('getPlaylistFormatConfig falls back to .m3u for unknown format values', () => {
    const generator = createGenerator();
    const formatConfig = toPlainObject(generator.getPlaylistFormatConfig('unknown'));

    assert.deepEqual(formatConfig, {
        format: 'm3u',
        extension: 'm3u',
        mimeType: 'audio/x-mpegurl;charset=utf-8',
        prependUtf8Bom: false
    });
});

test('trackSeenDirectory trims the seen-url cache while keeping the newest entries', () => {
    const generator = createGenerator();
    const logs = [];

    generator.state.maxSeenUrls = 4;
    generator.addLogEntry = (message, type = '') => {
        logs.push({ message, type });
    };

    generator.trackSeenDirectory('https://example.com/1/');
    generator.trackSeenDirectory('https://example.com/2/');
    generator.trackSeenDirectory('https://example.com/3/');
    generator.trackSeenDirectory('https://example.com/4/');
    generator.trackSeenDirectory('https://example.com/5/');

    assert.deepEqual(toPlainArray(generator.seenUrlOrder), [
        'https://example.com/3/',
        'https://example.com/4/',
        'https://example.com/5/'
    ]);
    assert.deepEqual(toPlainArray(generator.seenUrls), [
        'https://example.com/3/',
        'https://example.com/4/',
        'https://example.com/5/'
    ]);
    assert.deepEqual(logs.at(-1), {
        message: 'Cache cleared (5 -> 3)',
        type: 'info'
    });
});

test('syncDropdownVisibility hides the format selector until a playlist name is entered', () => {
    const generator = createGenerator();
    const dropdown = {
        classList: createMockClassList(),
        setAttribute(name, value) {
            this[name] = value;
        }
    };
    const dropdownButton = createMockDropdownButton();

    generator.syncDropdownVisibility({ value: '' }, dropdown, dropdownButton);

    assert.equal(dropdown.classList.contains('is-visible'), false);
    assert.equal(dropdown['aria-hidden'], 'true');
});

test('prepareScanRunUi locks the playlist format selector until controls are restored', () => {
    const generator = createGenerator();
    const dropdown = {
        classList: createMockClassList(['active'])
    };
    const dropdownButton = createMockDropdownButton();

    generator.showToast = () => {};
    generator.updateActivityIndicator = () => {};
    generator.renderGeneratingButton = () => {};
    generator.centerPopupInViewport = () => {};
    generator.domElements = {
        includeVideo: { disabled: false },
        includeAudio: { disabled: false },
        recursiveSearch: { disabled: false },
        currentDepth: { disabled: false },
        customDepth: { disabled: false },
        maxDepth: { disabled: false },
        dropdown,
        dropdownButton,
        statsBar: {
            style: {},
            classList: createMockClassList()
        }
    };

    generator.prepareScanRunUi(
        { disabled: false },
        { style: {}, classList: createMockClassList() },
        { style: {} },
        { style: {} },
        { style: {} }
    );

    assert.equal(dropdownButton.disabled, true);
    assert.equal(dropdownButton['aria-disabled'], 'true');
    assert.equal(dropdownButton['aria-expanded'], 'false');
    assert.equal(dropdown.classList.contains('active'), false);

    generator.restoreToggleAvailability(generator.domElements);

    assert.equal(dropdownButton.disabled, false);
    assert.equal(dropdownButton['aria-disabled'], 'false');
});

test('openPanel focuses the playlist input and closePanel returns focus to the launcher', () => {
    const generator = createGenerator({
        overrides: {
            document: {
                body: {
                    classList: createMockClassList()
                }
            }
        }
    });
    const container = createMockAttributeNode();
    const launcher = {
        classList: createMockClassList(),
        focusCount: 0,
        setAttribute(name, value) {
            this[name] = value;
        },
        focus() {
            this.focusCount++;
        }
    };
    const playlistInput = {
        value: '',
        focusCount: 0,
        focus() {
            this.focusCount++;
        }
    };
    const dropdownButton = createMockDropdownButton();
    const infoModal = {
        style: {
            display: 'block'
        }
    };

    generator.centerPopupInViewport = () => {};
    generator.domElements = {
        container,
        launcher,
        playlistInput,
        dropdown: {
            classList: createMockClassList(),
            setAttribute(name, value) {
                this[name] = value;
            },
            querySelector() {
                return dropdownButton;
            }
        },
        infoModal
    };

    generator.openPanel();

    assert.equal(container.getAttribute('data-visible'), 'true');
    assert.equal(launcher.classList.contains('is-hidden'), true);
    assert.equal(playlistInput.focusCount, 1);
    assert.equal(generator.domElements.dropdown['aria-hidden'], 'true');
    assert.equal(generator.domElements.dropdown.classList.contains('is-visible'), false);

    generator.closePanel();

    assert.equal(container.getAttribute('data-visible'), undefined);
    assert.equal(launcher.classList.contains('is-hidden'), false);
    assert.equal(launcher.focusCount, 1);
    assert.equal(infoModal.style.display, 'none');
});

test('processFileHrefs yields between large file batches instead of forcing garbage collection', async () => {
    const generator = createGenerator();
    const files = Array.from({ length: 550 }, (_, index) => `Episode-${index + 1}.mkv`);
    let yieldCount = 0;
    let processedCount = 0;

    generator.state.isGenerating = true;
    generator.processFileHref = () => {
        processedCount++;
    };
    generator.yieldToScanLoop = async () => {
        yieldCount++;
    };

    await generator.processFileHrefs(files, 'https://example.com/Series/', 'Series');

    assert.equal(processedCount, 550);
    assert.equal(yieldCount, 1);
});

test('bindKeyboardHandlers closes the info modal first and only closes the panel when idle', () => {
    let keydownHandler;
    const generator = createGenerator({
        overrides: {
            document: {
                body: {
                    classList: createMockClassList()
                },
                addEventListener(type, listener) {
                    if (type === 'keydown') {
                        keydownHandler = listener;
                    }
                }
            }
        }
    });
    let infoModalClosed = 0;
    let panelClosed = 0;

    generator.domElements = {
        container: createMockAttributeNode({ 'data-visible': 'true' }),
        infoModal: {
            style: {
                display: 'block'
            }
        }
    };
    generator.closeInfoModal = () => {
        infoModalClosed++;
        generator.domElements.infoModal.style.display = 'none';
    };
    generator.closePanel = () => {
        panelClosed++;
    };

    generator.bindKeyboardHandlers();

    let prevented = false;
    keydownHandler({
        key: 'Escape',
        preventDefault() {
            prevented = true;
        }
    });

    assert.equal(prevented, true);
    assert.equal(infoModalClosed, 1);
    assert.equal(panelClosed, 0);

    prevented = false;
    keydownHandler({
        key: 'Escape',
        preventDefault() {
            prevented = true;
        }
    });

    assert.equal(prevented, true);
    assert.equal(panelClosed, 1);

    generator.state.isGenerating = true;
    prevented = false;
    keydownHandler({
        key: 'Escape',
        preventDefault() {
            prevented = true;
        }
    });

    assert.equal(prevented, false);
    assert.equal(panelClosed, 1);
});

test('bindDropdownHandlers ignores format changes while the selector is locked', () => {
    const generator = createGenerator({
        overrides: {
            document: {
                addEventListener() {}
            }
        }
    });
    const dropdown = {
        classList: createMockClassList(),
        contains() {
            return false;
        }
    };
    const dropdownButton = createMockDropdownButton('.m3u');
    const selectedItem = createMockDropdownItem('m3u', '.m3u', true);
    const lockedItem = createMockDropdownItem('m3u8', '.m3u8');

    generator.state.selectedFormat = 'm3u';
    generator.bindDropdownHandlers(dropdown, dropdownButton, [selectedItem, lockedItem]);

    dropdownButton.disabled = true;
    dropdownButton.setAttribute('aria-disabled', 'true');
    dropdownButton.dispatch('click');
    lockedItem.dispatch('click');

    assert.equal(dropdown.classList.contains('active'), false);
    assert.equal(generator.state.selectedFormat, 'm3u');
    assert.equal(dropdownButton.labelNode.textContent, '.m3u');
    assert.equal(selectedItem.classList.contains('selected'), true);
    assert.equal(lockedItem.classList.contains('selected'), false);
});

test('formatFullStatValue keeps stat totals unabridged', () => {
    const generator = createGenerator();

    assert.equal(generator.formatFullStatValue(999), '999');
    assert.equal(generator.formatFullStatValue(1234), '1234');
    assert.equal(generator.formatFullStatValue(12345), '12345');
});

test('getAboutDialogTitle uses GM_info script version when available', () => {
    const generator = createGenerator({
        overrides: {
            GM_info: {
                script: {
                    version: '9.9.9'
                }
            }
        }
    });

    assert.equal(generator.getAboutDialogTitle(), 'About M3Unator v9.9.9');
});

test('getAboutDialogTitle falls back cleanly when GM_info is unavailable', () => {
    const generator = createGenerator();

    assert.equal(generator.getAboutDialogTitle(), 'About M3Unator');
});

test('applyCounterValue keeps raw totals in metadata while showing full stat text', () => {
    const generator = createGenerator();
    const statContainer = {
        dataset: {
            statLabel: 'Total Files'
        },
        style: {},
        title: '',
        setAttribute(name, value) {
            this[name] = value;
        }
    };
    const element = {
        dataset: {},
        textContent: '',
        closest(selector) {
            return selector === '.M3Unator-stat' ? statContainer : null;
        }
    };

    generator.applyCounterValue({ totalFiles: element }, 'totalFiles', 12345);

    assert.equal(element.textContent, '12345');
    assert.equal(element.dataset.rawValue, '12345');
    assert.equal(statContainer.title, 'Total Files: 12345');
    assert.equal(statContainer['aria-label'], 'Total Files: 12345');
    assert.equal(statContainer.style.opacity, '1');
});

test('isMediaFileOptimized classifies supported media extensions through the shared extension map', () => {
    const generator = createGenerator();

    assert.equal(generator.isMediaFileOptimized('movie.MKV'), 'video');
    assert.equal(generator.isMediaFileOptimized('track.flac'), 'audio');
    assert.equal(generator.isMediaFileOptimized('notes.txt'), undefined);
});

test('addLogEntry refreshes the log UI for the first few entries so short scans render activity', () => {
    const generator = createGenerator({ stubAddLogEntry: false });
    const refreshes = [];

    generator.updateLogUI = () => {
        refreshes.push(generator.logCache.stats.totalLogs);
    };

    generator.state.isGenerating = true;
    generator.addLogEntry('Scanning directory');
    generator.addLogEntry('Entering subdirectory');
    generator.addLogEntry('Batch Processing: 100%');

    assert.deepEqual(refreshes, [1, 2, 3]);
});

test('renderLogEntries incrementally appends new logs when the visible log window stays aligned', () => {
    const generator = createGenerator();
    const scanLog = createMockScanLog();

    generator.wasLogScrolledToBottom = () => false;
    generator.buildLogFragment = logs =>
        logs.map(log => ({
            dataset: {
                logSequence: String(log.sequence)
            }
        }));

    generator.logCache.logs = [
        { message: 'one', type: 'info', timestamp: '10:00:00', sequence: 1 },
        { message: 'two', type: 'info', timestamp: '10:00:01', sequence: 2 }
    ];
    generator.logCache.stats.totalLogs = 2;

    generator.renderLogEntries(scanLog);

    assert.equal(scanLog.getClearCount(), 1);
    assert.deepEqual(scanLog.getRenderedSequences(), ['1', '2']);

    generator.logCache.logs.push({
        message: 'three',
        type: 'info',
        timestamp: '10:00:02',
        sequence: 3
    });
    generator.logCache.stats.totalLogs = 3;

    generator.renderLogEntries(scanLog);

    assert.equal(scanLog.getClearCount(), 1);
    assert.deepEqual(scanLog.getRenderedSequences(), ['1', '2', '3']);
});

test('resetScanSessionState clears cached logs between scan runs', () => {
    const generator = createGenerator();

    generator.logCache.add('stale log', 'info');
    generator._updateLogUITimeout = setTimeout(() => {}, 1000);
    generator.domElements.scanLog = { innerHTML: 'stale' };
    generator.domElements.logCounter = { textContent: '1' };

    generator.resetScanSessionState();

    assert.equal(generator.logCache.stats.totalLogs, 0);
    assert.deepEqual(toPlainObject(generator.logCache.logs), []);
    assert.equal(generator._updateLogUITimeout, null);
    assert.equal(generator.domElements.scanLog.innerHTML, '');
    assert.equal(generator.domElements.logCounter.textContent, '0');
});

test('appendCompletionSummary logs full counts instead of compact UI text', () => {
    const generator = createGenerator();
    const captured = [];

    generator.addLogEntry = (message, type) => {
        captured.push({ message, type });
    };
    generator.state.stats.files.video.total = 12345;
    generator.state.stats.files.audio.total = 6789;
    generator.state.stats.directories.total = 4321;
    generator.state.stats.directories.depth = 12;
    generator.state.stats.errors.total = 34;
    generator.state.stats.errors.skipped = 5;

    generator.appendCompletionSummary();

    assert.equal(captured.length, 1);
    assert.equal(captured[0].type, 'final');
    assert.match(captured[0].message, /12345/);
    assert.match(captured[0].message, /6789/);
    assert.doesNotMatch(captured[0].message, /12\.3k|6\.8k|12,345|6,789/);
});
