const fs = require('fs');
const path = require('path');
const vm = require('vm');

const { createDomParser } = require('./fake_dom_parser');

const repoRoot = path.resolve(__dirname, '..', '..');
const runtimeDir = path.join(repoRoot, 'src', 'runtime');
const runtimeManifestPath = path.join(runtimeDir, 'build-manifest.json');
const excludedRuntimeParts = new Set([
    'parts/00-metadata.js',
    'parts/10-startup.js',
    'parts/20-styles.js',
    'parts/50-bootstrap.js'
]);

function createHarnessError(message) {
    const error = new Error(message);
    error.name = 'LogicTestHarnessError';
    error.code = 'LOGIC_TEST_FETCH_NOT_STUBBED';
    return error;
}

function buildRuntimeSource() {
    const runtimeManifest = JSON.parse(fs.readFileSync(runtimeManifestPath, 'utf8'));
    const runtimeParts = runtimeManifest.files.filter(relativePath => !excludedRuntimeParts.has(relativePath));

    return runtimeParts
        .map(relativePath =>
            fs.readFileSync(path.join(runtimeDir, relativePath.replace(/^parts[\\/]/, 'parts/')), 'utf8').trimEnd()
        )
        .join('\n\n');
}

function createContext(overrides = {}) {
    const context = {
        module: { exports: {} },
        exports: {},
        console,
        setTimeout,
        clearTimeout,
        URL,
        requestAnimationFrame(callback) {
            return callback();
        },
        cancelAnimationFrame() {},
        fetch: async () => {
            throw createHarnessError('Logic test harness requires an explicit fetch stub');
        },
        GM_addStyle() {},
        DOMParser: createDomParser(),
        document: {},
        window: {
            location: {
                href: 'https://example.com/archive/'
            }
        },
        global: {},
        ...overrides
    };

    context.globalThis = context;
    context.global = context.global || {};

    return vm.createContext(context);
}

function loadPlaylistGenerator(overrides = {}) {
    const runtimeSource = `${buildRuntimeSource()}\nmodule.exports = { PlaylistGenerator, LogCache };`;
    const context = createContext(overrides);
    const script = new vm.Script(runtimeSource, {
        filename: 'playlist-generator-test-runtime.js'
    });

    script.runInContext(context);

    return {
        ...context.module.exports,
        context
    };
}

module.exports = {
    loadPlaylistGenerator
};
