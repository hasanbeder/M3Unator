const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repoRoot = path.resolve(__dirname, '..', '..');
const startupPath = path.join(repoRoot, 'src', 'runtime', 'parts', '10-startup.js');

function buildStartupHelperSource() {
    const startupSource = fs.readFileSync(startupPath, 'utf8');
    const withoutIifeOpen = startupSource.replace(/^\(function\(\)\s*\{\s*\r?\n/, '');
    const withoutEarlyReturn = withoutIifeOpen.replace(
        /if\s*\(!isSupportedDirectoryListingPage\(\)\)\s*\{\s*console\.log\('This page is not an Index page, M3Unator disabled\.'\);\s*return;\s*\}\s*/m,
        ''
    );

    return `${withoutEarlyReturn}
module.exports = {
    getDirectoryListingTitleMarkers,
    getDirectoryListingSupport,
    hasDirectoryListingLinkStructure,
    isSupportedDirectoryListingPage,
    isParentDirectoryAnchor,
    isRelativeDirectoryCandidateHref,
    parseLiteSpeedDirectory,
    getDirectoryLinks
};`;
}

function loadStartupHelpers(overrides = {}) {
    const context = vm.createContext({
        module: { exports: {} },
        exports: {},
        console,
        URL,
        window: {
            location: {
                href: 'https://example.com/archive/'
            }
        },
        document: {},
        ...overrides
    });

    const script = new vm.Script(buildStartupHelperSource(), {
        filename: 'startup-helpers-test-runtime.js'
    });

    script.runInContext(context);

    return {
        ...context.module.exports,
        context
    };
}

module.exports = {
    loadStartupHelpers
};
