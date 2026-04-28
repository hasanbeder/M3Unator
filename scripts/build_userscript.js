#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const runtimeDir = path.join(repoRoot, 'src', 'runtime');
const manifestPath = path.join(runtimeDir, 'build-manifest.json');
const runtimeSourcePath = path.join(runtimeDir, 'M3Unator.user.js');
const runtimeArtifactPath = path.join(repoRoot, 'M3Unator.user.js');
const metadataArtifactPath = path.join(repoRoot, 'M3Unator.meta.js');

function fail(message) {
    console.error(`Build failed: ${message}`);
    process.exit(1);
}

function extractMetadataBlock(source) {
    const metadataMatch = source.match(/^\/\/ ==UserScript==[\s\S]*?^\/\/ ==\/UserScript==\s*$/m);

    if (!metadataMatch) {
        fail('Missing valid userscript metadata block in src/runtime/M3Unator.user.js');
    }

    return `${metadataMatch[0].trimEnd()}\n`;
}

function loadRuntimeSource() {
    if (fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

        if (!Array.isArray(manifest.files) || manifest.files.length === 0) {
            fail('src/runtime/build-manifest.json must define a non-empty "files" array');
        }

        const chunks = manifest.files.map(relativePath => {
            const partPath = path.join(runtimeDir, relativePath);

            if (!fs.existsSync(partPath)) {
                fail(`Runtime part not found at ${path.relative(repoRoot, partPath)}`);
            }

            return fs.readFileSync(partPath, 'utf8').trimEnd();
        });

        return `${chunks.join('\n\n')}\n`;
    }

    if (fs.existsSync(runtimeSourcePath)) {
        return fs.readFileSync(runtimeSourcePath, 'utf8');
    }

    fail(`Runtime source not found at ${path.relative(repoRoot, runtimeSourcePath)}`);
}

const runtimeSource = loadRuntimeSource();
const metadataBlock = extractMetadataBlock(runtimeSource);

fs.writeFileSync(runtimeSourcePath, runtimeSource, 'utf8');
fs.writeFileSync(runtimeArtifactPath, runtimeSource, 'utf8');
fs.writeFileSync(metadataArtifactPath, metadataBlock, 'utf8');

console.log('Built userscript artifacts:');
console.log(`- ${path.relative(repoRoot, runtimeSourcePath)}`);
console.log(`- ${path.relative(repoRoot, runtimeArtifactPath)}`);
console.log(`- ${path.relative(repoRoot, metadataArtifactPath)}`);
