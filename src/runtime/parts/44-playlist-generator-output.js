        countPathDepth(path) {
            let depth = 0;

            for (const character of path) {
                if (character === '/') {
                    depth++;
                }
            }

            return depth;
        }

        buildDecodedPlaylistEntry(entry) {
            try {
                const title = this.decodeString(entry.title);
                const mediaType = this.isMediaFileOptimized(title);

                return {
                    ...entry,
                    decodedTitle: title,
                    depth: this.countPathDepth(title),
                    isVideo: mediaType === 'video',
                    isAudio: mediaType === 'audio'
                };
            } catch (error) {
                return {
                    ...entry,
                    decodedTitle: entry.title,
                    depth: 0,
                    isVideo: false,
                    isAudio: false
                };
            }
        }

        comparePlaylistEntries(a, b) {
            if (a.depth !== b.depth) {
                return a.depth - b.depth;
            }

            const aStartsWithNumber = /^\d/.test(a.decodedTitle);
            const bStartsWithNumber = /^\d/.test(b.decodedTitle);

            if (aStartsWithNumber !== bStartsWithNumber) {
                return aStartsWithNumber ? -1 : 1;
            }

            return a.decodedTitle.localeCompare(b.decodedTitle, undefined, this.sortOptions);
        }

        partitionPlaylistEntries(decodedEntries) {
            const videoEntries = [];
            const audioEntries = [];

            decodedEntries.forEach(entry => {
                if (entry.isVideo) {
                    videoEntries.push(entry);
                    return;
                }

                if (entry.isAudio) {
                    audioEntries.push(entry);
                }
            });

            return { videoEntries, audioEntries };
        }

        sortPlaylistEntries(decodedEntries) {
            const { videoEntries, audioEntries } = this.partitionPlaylistEntries(decodedEntries);
            const sortedVideoEntries = videoEntries.sort((a, b) => this.comparePlaylistEntries(a, b));
            const sortedAudioEntries = audioEntries.sort((a, b) => this.comparePlaylistEntries(a, b));

            return sortedVideoEntries.concat(sortedAudioEntries);
        }

        serializePlaylistEntries(entries) {
            let serializedEntries = '';

            entries.forEach(entry => {
                serializedEntries += `#EXTINF:-1,${entry.decodedTitle}\n${entry.url}\n`;
            });

            return serializedEntries;
        }

        normalizePlaylistFormat(format = this.state.selectedFormat) {
            return format === 'm3u8' ? 'm3u8' : 'm3u';
        }

        getPlaylistFormatConfig(format = this.state.selectedFormat) {
            const normalizedFormat = this.normalizePlaylistFormat(format);

            if (normalizedFormat === 'm3u8') {
                return {
                    format: 'm3u8',
                    extension: 'm3u8',
                    mimeType: 'application/vnd.apple.mpegurl;charset=utf-8',
                    prependUtf8Bom: true
                };
            }

            return {
                format: 'm3u',
                extension: 'm3u',
                mimeType: 'audio/x-mpegurl;charset=utf-8',
                prependUtf8Bom: false
            };
        }

        createPlaylist(entries) {
            const decodedEntries = entries.map(entry => this.buildDecodedPlaylistEntry(entry));
            const sortedEntries = this.sortPlaylistEntries(decodedEntries);
            return `#EXTM3U\n${this.serializePlaylistEntries(sortedEntries)}`;
        }

        buildPlaylistDownloadPayload(entries, format = this.state.selectedFormat) {
            const formatConfig = this.getPlaylistFormatConfig(format);
            const playlistContent = this.createPlaylist(entries);

            return {
                ...formatConfig,
                content: formatConfig.prependUtf8Bom
                    ? `\uFEFF${playlistContent}`
                    : playlistContent
            };
        }

        shouldSkipLogEntry(type) {
            return (this.state.isPaused || !this.state.isGenerating) && type !== 'final';
        }

        decodeUrlInLogMessage(url) {
            try {
                return decodeURIComponent(url);
            } catch (error) {
                return url;
            }
        }

        decodeLogMessage(message) {
            if (!message.includes('http')) {
                return message;
            }

            const urlRegex = /(https?:\/\/[^\s]+)/g;
            return message.replace(urlRegex, (url) => this.decodeUrlInLogMessage(url));
        }

        shouldRefreshLogUi(type = '') {
            const totalLogs = this.logCache.stats.totalLogs;
            return totalLogs <= 5 || totalLogs % 10 === 0 || type === 'final';
        }

        syncLogCounter() {
            const logCounter = this.domElements.logCounter;
            if (logCounter) {
                const totalLogs = String(this.logCache.stats.totalLogs);
                if (logCounter.textContent !== totalLogs) {
                    logCounter.textContent = totalLogs;
                }
            }
        }

        addLogEntry(message, type = '') {
            if (this.shouldSkipLogEntry(type)) {
                return;
            }

            let decodedMessage = message;
            try {
                decodedMessage = this.decodeLogMessage(message);
            } catch (error) {
                console.warn('Decode error:', error);
            }

            this.logCache.add(decodedMessage, type);
            this.syncLogCounter();

            if (this.shouldRefreshLogUi(type)) {
                this.updateLogUI();
            }
        }

        getRecentLogs() {
            return this.logCache.logs.slice(-50);
        }

        wasLogScrolledToBottom(scanLog) {
            return Math.abs(scanLog.scrollHeight - scanLog.clientHeight - scanLog.scrollTop) < 50;
        }

        createLogEntryNode(log) {
            const div = document.createElement('div');
            div.className = `M3Unator-log-entry ${log.type}`;
            div.dataset.logSequence = String(log.sequence || '');

            const time = document.createElement('span');
            time.className = 'M3Unator-log-time';
            time.textContent = log.timestamp;

            const content = document.createElement('span');
            content.className = 'M3Unator-log-content';
            content.textContent = log.message;

            div.appendChild(time);
            div.appendChild(content);
            return div;
        }

        buildLogFragment(logs) {
            const fragment = document.createDocumentFragment();
            logs.forEach(log => {
                fragment.appendChild(this.createLogEntryNode(log));
            });
            return fragment;
        }

        getRenderedLogSequence(node) {
            if (!node || !node.dataset) {
                return null;
            }

            const parsedSequence = Number(node.dataset.logSequence);
            return Number.isFinite(parsedSequence) ? parsedSequence : null;
        }

        shouldIncrementallyRenderLogs(scanLog, recentLogs) {
            if (!scanLog.firstElementChild || !scanLog.lastElementChild || recentLogs.length === 0) {
                return false;
            }

            if (scanLog.childElementCount > recentLogs.length) {
                return false;
            }

            return this.getRenderedLogSequence(scanLog.firstElementChild) === recentLogs[0].sequence;
        }

        appendRecentLogs(scanLog, recentLogs) {
            const lastRenderedSequence = this.getRenderedLogSequence(scanLog.lastElementChild);
            const missingLogs = recentLogs.filter(log => log.sequence > lastRenderedSequence);

            if (missingLogs.length === 0) {
                return;
            }

            scanLog.appendChild(this.buildLogFragment(missingLogs));

            while (scanLog.childElementCount > recentLogs.length) {
                scanLog.removeChild(scanLog.firstElementChild);
            }
        }

        replaceRecentLogs(scanLog, recentLogs) {
            scanLog.innerHTML = '';
            scanLog.appendChild(this.buildLogFragment(recentLogs));
        }

        renderLogEntries(scanLog) {
            const recentLogs = this.getRecentLogs();
            const wasAtBottom = this.wasLogScrolledToBottom(scanLog);

            if (recentLogs.length === 0) {
                scanLog.innerHTML = '';
                return;
            }

            if (this.shouldIncrementallyRenderLogs(scanLog, recentLogs)) {
                this.appendRecentLogs(scanLog, recentLogs);
            } else {
                this.replaceRecentLogs(scanLog, recentLogs);
            }

            if (wasAtBottom) {
                scanLog.scrollTop = scanLog.scrollHeight;
            }
        }

        updateLogUI() {
            const scanLog = this.domElements.scanLog;
            if (!scanLog) return;

            if (this._updateLogUITimeout) {
                clearTimeout(this._updateLogUITimeout);
            }

            this._updateLogUITimeout = setTimeout(() => {
                requestAnimationFrame(() => {
                    this.renderLogEntries(scanLog);
                });
            }, 100);
        }

        getReportLogIcon(type) {
            switch (type) {
                case 'error':
                    return '❌';
                case 'warning':
                    return '⚠️';
                case 'success':
                    return '✅';
                default:
                    return 'ℹ️';
            }
        }

        buildScanReportLines() {
            const stats = this.state.stats;
            const logCache = this.logCache;

            return [
                '📊 Scan Summary',
                '───────────────',
                `📁 Total Files: ${stats.totalFiles}`,
                `🎥 Video Files: ${stats.files.video.total}`,
                `🎵 Audio Files: ${stats.files.audio.total}`,
                `📂 Directories: ${stats.directories.total}`,
                `↕️ Maximum Depth: ${stats.directories.depth}`,
                stats.errors.total > 0 ? `⚠️ Errors: ${stats.errors.total} (${stats.errors.skipped} skipped)` : null,
                '',
                '📝 Log Statistics',
                '───────────────',
                `Total Logs: ${logCache.stats.totalLogs}`,
                logCache.stats.skippedLogs > 0 ? `Skipped Logs: ${logCache.stats.skippedLogs}` : null,
                '',
                `🔍 Last ${logCache.maxSize} Log Entries`,
                '───────────────',
                ...logCache.logs.map(log => `[${log.timestamp}] ${this.getReportLogIcon(log.type)} ${log.message}`)
            ].filter(Boolean);
        }

        generateScanReport() {
            return this.buildScanReportLines().join('\n');
        }

        formatFullStatValue(value) {
            const numericValue = Number(value);
            if (!Number.isFinite(numericValue)) {
                return String(value);
            }

            return String(numericValue);
        }

        updateStatLabel(statContainer, value) {
            const label = statContainer.dataset.statLabel || 'Value';
            const title = `${label}: ${this.formatFullStatValue(value)}`;

            statContainer.title = title;
            statContainer.setAttribute('aria-label', title);
        }

        buildCounterUpdates(count) {
            return {
                totalFiles: count,
                videoFiles: this.state.stats.files.video.total,
                audioFiles: this.state.stats.files.audio.total,
                directories: this.state.stats.directories.total,
                depthLevel: this.state.stats.directories.depth,
                errors: this.state.stats.errors.total
            };
        }

        applyDepthLevelState(statContainer, value) {
            const maxDepth = this.state.maxDepth || 0;
            const label = statContainer.dataset.statLabel || 'Depth Level';
            if (maxDepth > 0) {
                const progress = (value / maxDepth) * 100;
                statContainer.dataset.progress =
                    progress >= 100 ? 'high' :
                    progress >= 75 ? 'medium' :
                    progress >= 50 ? 'low' : '';
                statContainer.title = `${label}: ${this.formatFullStatValue(value)}/${this.formatFullStatValue(maxDepth)}`;
            } else {
                statContainer.dataset.progress = '';
                statContainer.title = `${label}: ${this.formatFullStatValue(value)}`;
            }

            statContainer.setAttribute('aria-label', statContainer.title);
        }

        applyCounterValue(elements, key, value) {
            const element = elements[key];
            if (!element) {
                return;
            }

            element.dataset.rawValue = String(value);
            element.textContent = this.formatFullStatValue(value);

            const statContainer = element.closest('.M3Unator-stat');
            if (!statContainer) {
                return;
            }

            statContainer.style.opacity = value > 0 ? '1' : '0.5';

            if (key === 'depthLevel') {
                this.applyDepthLevelState(statContainer, value);
                return;
            }

            this.updateStatLabel(statContainer, value);
        }

        updateCounter(count) {
            if (!this.domElements.stats || !this.domElements.statsBar) {
                return;
            }

            this.domElements.statsBar.style.display = 'block';

            const updates = this.buildCounterUpdates(count);
            Object.entries(updates).forEach(([key, value]) => {
                this.applyCounterValue(this.domElements.stats, key, value);
            });
        }

        getNormalizedFileExtension(fileName) {
            const normalizedName = typeof fileName === 'string' ? fileName.toLowerCase() : '';
            const extensionSeparatorIndex = normalizedName.lastIndexOf('.');
            return extensionSeparatorIndex === -1 ? '' : normalizedName.slice(extensionSeparatorIndex + 1);
        }

        isMediaFileOptimized(fileName) {
            return this.extensionMap.get(this.getNormalizedFileExtension(fileName));
        }
    }
