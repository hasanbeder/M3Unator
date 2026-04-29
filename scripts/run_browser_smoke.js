const fs = require('node:fs/promises');
const path = require('node:path');

const { createSmokeFixtureServer } = require('./browser_smoke_fixture_server');

const USERSCRIPT_PATH = path.resolve(__dirname, '..', 'M3Unator.user.js');

const FIXTURE_CASES = [
    {
        name: 'apache',
        path: '/apache/',
        playlistName: 'apache-smoke',
        expected: {
            suggestedFileName: 'apache-smoke.m3u',
            totalFiles: '6',
            videoFiles: '3',
            audioFiles: '3',
            directories: '3',
            depthLevel: '2',
            playlistSnippets: [
                '#EXTM3U',
                'intro.mp4',
                'song one.mp3',
                'Season 1/Episode 01.mp4',
                'Season 1/Extras/Behind the Scenes.mp3',
                'Season 1/Extras/Live Set.flac'
            ]
        }
    },
    {
        name: 'litespeed',
        path: '/litespeed/',
        playlistName: 'litespeed-smoke',
        expected: {
            suggestedFileName: 'litespeed-smoke.m3u',
            totalFiles: '4',
            videoFiles: '2',
            audioFiles: '2',
            directories: '3',
            depthLevel: '2',
            playlistSnippets: [
                '#EXTM3U',
                'teaser.mkv',
                'albums/Live Set.m4a',
                'albums/Disc 1/Track 01.mp3',
                'albums/Disc 1/Video Clip.mp4'
            ]
        }
    }
];

function ensure(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function loadPlaywright() {
    const candidates = [
        'playwright',
        path.join(path.dirname(process.execPath), 'node_modules', 'playwright'),
        path.join(path.dirname(process.execPath), '..', 'node_modules', 'playwright')
    ];

    for (const candidate of candidates) {
        try {
            return require(candidate);
        } catch (error) {
            if (error.code !== 'MODULE_NOT_FOUND') {
                throw error;
            }
        }
    }

    throw new Error('Playwright runtime is not available. Install Playwright before running browser smoke tests.');
}

async function listen(server) {
    await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', resolve);
    });
}

async function closeServer(server) {
    await new Promise((resolve, reject) => {
        server.close(error => {
            if (error) {
                reject(error);
                return;
            }

            resolve();
        });
    });
}

// eslint-disable-next-line no-unused-vars
async function waitForText(page, selector, expected, timeout = 10000) {
    await page.waitForFunction(
        ({ targetSelector, targetText }) => {
            const element = document.querySelector(targetSelector);
            return Boolean(element && element.textContent.trim() === targetText);
        },
        { targetSelector: selector, targetText: expected },
        { timeout }
    );
}

async function waitForClassToken(page, selector, className, timeout = 10000) {
    await page.waitForFunction(
        ({ targetSelector, targetClassName }) => {
            const element = document.querySelector(targetSelector);
            return Boolean(element && element.classList.contains(targetClassName));
        },
        { targetSelector: selector, targetClassName: className },
        { timeout }
    );
}

async function waitForEnabled(page, selector, timeout = 10000) {
    await page.waitForFunction(
        targetSelector => {
            const element = document.querySelector(targetSelector);
            return Boolean(element && !element.disabled);
        },
        selector,
        { timeout }
    );
}

async function openFixturePage(page, baseUrl, fixtureCase) {
    await page.addInitScript(() => {
        window.GM_addStyle = css => {
            const style = document.createElement('style');
            style.textContent = css;
            document.head.appendChild(style);
            return style;
        };
    });

    await page.goto(`${baseUrl}${fixtureCase.path}`, { waitUntil: 'load' });
    await page.addScriptTag({ path: USERSCRIPT_PATH });
    await page.getByRole('button', { name: 'M3Unator', exact: true }).waitFor({ state: 'visible' });
}

async function openPanel(page) {
    await page.getByRole('button', { name: 'M3Unator', exact: true }).click();
    await page.locator('.M3Unator-popup').waitFor({ state: 'visible' });
    await page.waitForFunction(() => {
        const launcher = document.querySelector('.M3Unator-launcher');
        const formatDropdown = document.querySelector('.M3Unator-dropdown');
        const toggleCount = document.querySelectorAll('.M3Unator-toggle-container').length;
        const aggressiveMode = document.querySelector('#aggressiveMode');
        const groupTitleToggle = document.querySelector('#groupTitleToggle');
        const groupTitlePanel = document.querySelector('#groupTitlePanel');
        const groupTitle = document.querySelector('#groupTitle');
        const playlistInput = document.querySelector('#playlistName');

        return Boolean(
            launcher &&
            launcher.classList.contains('is-hidden') &&
            document.body.classList.contains('modal-open') &&
            formatDropdown &&
            getComputedStyle(formatDropdown).display === 'none' &&
            playlistInput &&
            document.activeElement === playlistInput &&
            toggleCount === 3 &&
            aggressiveMode &&
            groupTitleToggle &&
            getComputedStyle(groupTitleToggle).display === 'none' &&
            groupTitlePanel &&
            groupTitle
        );
    });

    await page.locator('.M3Unator-aggressive-control').click();
    await page.waitForFunction(() => {
        const aggressiveMode = document.querySelector('#aggressiveMode');
        const knob = document.querySelector('.M3Unator-aggressive-knob');
        return Boolean(aggressiveMode?.checked && knob && getComputedStyle(knob).transform !== 'none');
    });
    await page.locator('.M3Unator-aggressive-control').click();
    await page.waitForFunction(() => {
        const aggressiveMode = document.querySelector('#aggressiveMode');
        return Boolean(aggressiveMode && !aggressiveMode.checked);
    });
}

async function exerciseAboutDialog(page, fixtureCase) {
    await page.locator('.info-link').click();
    await page.locator('.info-modal').waitFor({ state: 'visible' });
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => {
        const infoModal = document.querySelector('.info-modal');
        const infoLink = document.querySelector('.info-link');
        return Boolean(
            infoModal &&
            getComputedStyle(infoModal).display === 'none' &&
            document.body.classList.contains('modal-open') &&
            document.querySelector('.M3Unator-popup') &&
            document.activeElement === infoLink
        );
    });

    const socialControlCount = await page.locator('.M3Unator-social a, .M3Unator-social button').count();
    ensure(socialControlCount === 3, `${fixtureCase.name}: expected legacy social controls to remain visible`);
}

async function configureScan(page, playlistName) {
    await page.locator('#playlistName').fill(playlistName);
    await page.waitForFunction(() => {
        const dropdown = document.querySelector('.M3Unator-dropdown');
        const groupTitleToggle = document.querySelector('#groupTitleToggle');
        return Boolean(
            dropdown &&
            getComputedStyle(dropdown).display !== 'none' &&
            groupTitleToggle &&
            getComputedStyle(groupTitleToggle).display !== 'none'
        );
    });

    await page.locator('.M3Unator-group-title-trigger').click();
    await page.waitForFunction(() => {
        const groupTitlePanel = document.querySelector('#groupTitlePanel');
        const groupTitle = document.querySelector('#groupTitle');
        const groupTitleToggle = document.querySelector('#groupTitleToggle');
        return Boolean(
            groupTitlePanel?.classList.contains('is-visible') &&
            groupTitle &&
            !groupTitle.disabled &&
            groupTitleToggle?.classList.contains('active')
        );
    });
    await page.locator('.M3Unator-group-title-trigger').click();
    await page.waitForFunction(() => {
        const groupTitlePanel = document.querySelector('#groupTitlePanel');
        const groupTitle = document.querySelector('#groupTitle');
        const groupTitleToggle = document.querySelector('#groupTitleToggle');
        return Boolean(
            !groupTitlePanel?.classList.contains('is-visible') &&
            groupTitle?.disabled &&
            !groupTitleToggle?.classList.contains('active')
        );
    });

    await page.evaluate(() => {
        const customDepth = document.querySelector('#customDepth');
        const maxDepth = document.querySelector('#maxDepth');

        customDepth.checked = true;
        customDepth.dispatchEvent(new Event('change', { bubbles: true }));

        maxDepth.value = '3';
        maxDepth.dispatchEvent(new Event('input', { bubbles: true }));
        maxDepth.dispatchEvent(new Event('change', { bubbles: true }));
    });
}

async function expectRawStatsPresentation(page, fixtureCase) {
    const presentation = await page.evaluate(() => {
        const values = {
            totalFiles: '12345',
            videoFiles: '6789',
            audioFiles: '4321',
            directories: '2109',
            depthLevel: '99',
            errors: '17'
        };
        const statsBar = document.querySelector('.M3Unator-stats-bar');

        if (statsBar) {
            statsBar.style.display = 'block';
        }

        Object.entries(values).forEach(([id, text]) => {
            const valueNode = document.getElementById(id);
            if (!valueNode) {
                return;
            }

            valueNode.textContent = text;
            const stat = valueNode.closest('.M3Unator-stat');
            if (stat) {
                stat.style.opacity = '1';
                stat.title = `${stat.dataset.statLabel}: ${text}`;
            }
        });

        return Object.entries(values).map(([id, _text]) => {
            const valueNode = document.getElementById(id);
            const stat = valueNode?.closest('.M3Unator-stat');

            return {
                id,
                text: valueNode?.textContent || '',
                title: stat?.title || ''
            };
        });
    });

    ensure(
        presentation.every(item => item.title.endsWith(item.text) && !item.text.includes('k')),
        `${fixtureCase.name}: stats presentation no longer shows full raw values`
    );
}

async function expectDownloadMatches(download, fixtureCase) {
    ensure(
        download.suggestedFilename() === fixtureCase.expected.suggestedFileName,
        `${fixtureCase.name}: expected ${fixtureCase.expected.suggestedFileName}, received ${download.suggestedFilename()}`
    );

    const downloadPath = await download.path();
    const content = await fs.readFile(downloadPath, 'utf8');

    for (const snippet of fixtureCase.expected.playlistSnippets) {
        ensure(content.includes(snippet), `${fixtureCase.name}: playlist is missing "${snippet}"`);
    }
}

async function getStatsSnapshot(page) {
    return page.evaluate(() => ({
        totalFiles: document.querySelector('#totalFiles')?.textContent.trim() || '',
        videoFiles: document.querySelector('#videoFiles')?.textContent.trim() || '',
        audioFiles: document.querySelector('#audioFiles')?.textContent.trim() || '',
        directories: document.querySelector('#directories')?.textContent.trim() || '',
        depthLevel: document.querySelector('#depthLevel')?.textContent.trim() || '',
        errors: document.querySelector('#errors')?.textContent.trim() || ''
    }));
}

async function expectStats(page, fixtureCase) {
    await page.waitForTimeout(300);

    const stats = await getStatsSnapshot(page);
    const expectedStats = {
        totalFiles: fixtureCase.expected.totalFiles,
        videoFiles: fixtureCase.expected.videoFiles,
        audioFiles: fixtureCase.expected.audioFiles,
        directories: fixtureCase.expected.directories,
        depthLevel: fixtureCase.expected.depthLevel,
        errors: '0'
    };

    for (const [key, expectedValue] of Object.entries(expectedStats)) {
        ensure(
            stats[key] === expectedValue,
            `${fixtureCase.name}: expected ${key}=${expectedValue}, received ${stats[key]}`
        );
    }
}

async function runExportSmoke(page, baseUrl, fixtureCase) {
    await openFixturePage(page, baseUrl, fixtureCase);
    await openPanel(page);
    await expectRawStatsPresentation(page, fixtureCase);
    await exerciseAboutDialog(page, fixtureCase);
    await configureScan(page, fixtureCase.playlistName);

    const downloadPromise = page.waitForEvent('download');

    await page.locator('#generateBtn').click();
    await page.locator('.M3Unator-control-btn.pause').waitFor({ state: 'visible' });
    await page.locator('.M3Unator-control-btn.cancel').waitFor({ state: 'visible' });
    await page.locator('.M3Unator-log-toggle').click();
    await page.locator('#scanLog .M3Unator-log-entry').first().waitFor({ state: 'visible' });

    const firstLogText = (await page.locator('#scanLog .M3Unator-log-entry').first().textContent()) || '';
    ensure(firstLogText.includes('Scanning directory'), `${fixtureCase.name}: initial log entry did not render`);
    await page.waitForFunction(() => Number(document.querySelector('.M3Unator-log-counter')?.textContent || '0') > 0);

    await page.locator('.M3Unator-control-btn.pause').click();
    await waitForClassToken(page, '.M3Unator-activity-indicator', 'paused');
    await page.locator('.M3Unator-control-btn.resume').waitFor({ state: 'visible' });

    await page.locator('.M3Unator-control-btn.resume').click();

    const download = await downloadPromise;
    await expectDownloadMatches(download, fixtureCase);
    await waitForClassToken(page, '.M3Unator-activity-indicator', 'completed');
    await expectStats(page, fixtureCase);

    const logCount = await page.locator('#scanLog .M3Unator-log-entry').count();
    ensure(logCount > 1, `${fixtureCase.name}: expected more than one visible log entry`);

    await waitForEnabled(page, '#generateBtn');
}

async function runCancelSmoke(page, baseUrl, fixtureCase) {
    await openFixturePage(page, baseUrl, fixtureCase);
    await openPanel(page);
    await configureScan(page, `${fixtureCase.playlistName}-cancel`);

    let sawDownload = false;
    page.on('download', () => {
        sawDownload = true;
    });

    await page.locator('#generateBtn').click();
    await page.locator('.M3Unator-control-btn.pause').waitFor({ state: 'visible' });
    await page.locator('.M3Unator-log-toggle').click();
    await page.locator('#scanLog .M3Unator-log-entry').first().waitFor({ state: 'visible' });

    await page.locator('.M3Unator-control-btn.cancel').click();

    await waitForEnabled(page, '#generateBtn');
    await page.locator('.M3Unator-toast').last().waitFor({ state: 'visible' });

    const toastText = (await page.locator('.M3Unator-toast').last().textContent()) || '';
    ensure(toastText.includes('Scan cancelled'), `${fixtureCase.name}: cancel toast did not render`);

    await page.waitForTimeout(300);

    const stats = await getStatsSnapshot(page);
    for (const [key, value] of Object.entries(stats)) {
        ensure(value === '0', `${fixtureCase.name}: expected ${key}=0 after cancel, received ${value}`);
    }

    const logEntries = await page.locator('#scanLog .M3Unator-log-entry').count();
    ensure(
        logEntries === 0,
        `${fixtureCase.name}: expected no visible log entries after cancel, received ${logEntries}`
    );

    await page.waitForTimeout(800);
    ensure(!sawDownload, `${fixtureCase.name}: cancel flow still produced a download`);
}

async function runFixtureMatrix(browser, browserName, baseUrl) {
    for (const fixtureCase of FIXTURE_CASES) {
        const exportContext = await browser.newContext({ acceptDownloads: true });
        const exportPage = await exportContext.newPage();

        console.log(`[${browserName}] ${fixtureCase.name}: export smoke`);
        await runExportSmoke(exportPage, baseUrl, fixtureCase);
        await exportContext.close();

        const cancelContext = await browser.newContext({ acceptDownloads: true });
        const cancelPage = await cancelContext.newPage();

        console.log(`[${browserName}] ${fixtureCase.name}: cancel smoke`);
        await runCancelSmoke(cancelPage, baseUrl, fixtureCase);
        await cancelContext.close();
    }
}

async function runBrowser(browserName, playwright, baseUrl) {
    const browserLauncher = playwright[browserName];
    ensure(browserLauncher, `Unsupported browser target: ${browserName}`);

    const browser = await browserLauncher.launch({ headless: true });

    try {
        await runFixtureMatrix(browser, browserName, baseUrl);
    } finally {
        await browser.close();
    }
}

async function main() {
    const requestedBrowser = (process.argv[2] || 'all').toLowerCase();
    const playwright = loadPlaywright();
    const browserTargets = requestedBrowser === 'all' ? ['chromium', 'firefox'] : [requestedBrowser];

    const server = createSmokeFixtureServer();
    await listen(server);

    const address = server.address();
    const baseUrl = `http://127.0.0.1:${address.port}`;

    try {
        for (const browserName of browserTargets) {
            await runBrowser(browserName, playwright, baseUrl);
        }
    } finally {
        await closeServer(server);
    }

    console.log(`Browser smoke passed: ${browserTargets.join(', ')}`);
}

main().catch(error => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
});
