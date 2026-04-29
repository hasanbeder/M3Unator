    class PlaylistGenerator {
        constructor() {
            this.initialStats = this.createInitialStats();
            this.videoFormats = this.createVideoFormats();
            this.audioFormats = this.createAudioFormats();
            this.extensionMap = this.buildExtensionMap(this.videoFormats, this.audioFormats);
            this.scriptVersion = this.resolveScriptVersion();
            this.domElements = {};
            this.state = this.createInitialState(this.initialStats);
            this.sortOptions = { numeric: true, sensitivity: 'base' };
            this.domParser = this.createDomParser();
            this.initializeRuntimeCollections();
            this.icons = this.createIcons();
            this.templates = this.createTemplates();
            this.baseStyles = this.createBaseStyles();
            GM_addStyle(this.baseStyles);
            this.updateActivityIndicator = this.createActivityIndicatorUpdater();
            this.logCache = new LogCache(100);
        }

        resolveScriptVersion() {
            if (typeof GM_info !== 'undefined' && GM_info && GM_info.script && GM_info.script.version) {
                return String(GM_info.script.version);
            }

            return '';
        }

        getAboutDialogTitle() {
            return this.scriptVersion
                ? `About M3Unator v${this.scriptVersion}`
                : 'About M3Unator';
        }

        getBrandTextMarkup() {
            return '<span class="M3Unator-brand-text">M3Unator</span>';
        }

        createDomParser() {
            return typeof DOMParser === 'function' ? new DOMParser() : null;
        }

        createInitialStats() {
            return {
                directories: {
                    total: 0,
                    depth: 0
                },
                files: {
                    video: {
                        total: 0,
                        current: 0
                    },
                    audio: {
                        total: 0,
                        current: 0
                    }
                },
                errors: {
                    total: 0,
                    skipped: 0
                },
                totalFiles: 0
            };
        }

        createVideoFormats() {
            return [
                '.mp4', '.mkv', '.avi', '.webm', '.mov', '.flv', '.wmv',
                '.m4v', '.mpg', '.mpeg', '.3gp', '.vob', '.ts', '.mts',
                '.m2ts', '.divx', '.xvid', '.asf', '.ogv', '.rm', '.rmvb',
                '.wtv', '.qt', '.hevc', '.f4v', '.swf', '.vro', '.ogx',
                '.drc', '.gifv', '.mxf', '.roq', '.nsv'
            ];
        }

        createAudioFormats() {
            return [
                '.mp3', '.m4a', '.wav', '.flac', '.aac', '.ogg', '.wma',
                '.opus', '.aiff', '.ape', '.mka', '.ac3', '.dts', '.m4b',
                '.m4p', '.m4r', '.mid', '.midi', '.mp2', '.mpa', '.mpc',
                '.ra', '.tta', '.voc', '.vox', '.amr', '.awb', '.dsf',
                '.dff', '.alac', '.wv', '.oga', '.sln', '.aif', '.pcm'
            ];
        }

        buildExtensionMap(videoFormats, audioFormats) {
            const extensionMap = new Map();

            videoFormats.forEach(ext => {
                extensionMap.set(ext.slice(1), 'video');
            });

            audioFormats.forEach(ext => {
                extensionMap.set(ext.slice(1), 'audio');
            });

            return extensionMap;
        }

        createInitialState(initialStats) {
            return {
                isGenerating: false,
                isPaused: false,
                selectedFormat: 'm3u',
                includeVideo: false,
                includeAudio: false,
                aggressiveMode: false,
                groupTitle: '',
                maxEntries: 1000000,
                timeoutMs: 12000,
                retryCount: 2,
                maxDepth: 0,
                maxSeenUrls: 5000,
                concurrency: {
                    min: 2,
                    start: 4,
                    max: 12,
                    hardCap: 16
                },
                aggressiveConcurrency: {
                    min: 3,
                    start: 6,
                    max: 20,
                    hardCap: 24
                },
                stats: { ...initialStats }
            };
        }

        initializeRuntimeCollections() {
            this.entries = [];
            this.seenUrls = new Set();
            this.seenUrlOrder = [];
            this.scanAbortController = null;
            this.scanPerformance = this.createInitialScanPerformance();
            this.toastQueue = [];
            this.isProcessingToast = false;
        }

        createInitialScanPerformance() {
            const concurrencyConfig = this.getActiveConcurrencyConfig
                ? this.getActiveConcurrencyConfig()
                : this.state.concurrency;

            return {
                currentConcurrency: concurrencyConfig
                    ? concurrencyConfig.start
                    : 4,
                requestSamples: [],
                sampleWindow: 20,
                lastIncreaseAt: 0,
                increaseCooldownMs: 2500,
                lastEventLoopLag: 0,
                rateLimitedUntil: 0
            };
        }

        getActiveConcurrencyConfig() {
            return this.state.aggressiveMode
                ? this.state.aggressiveConcurrency
                : this.state.concurrency;
        }

        startScanSession() {
            this.scanAbortController = typeof AbortController === 'function'
                ? new AbortController()
                : null;

            this.configureScanSignalMaxListeners();
            this.scanPerformance = this.createInitialScanPerformance();
        }

        configureScanSignalMaxListeners() {
            const signal = this.getScanAbortSignal();
            if (!signal || typeof signal.setMaxListeners !== 'function') {
                return;
            }

            const config = this.getActiveConcurrencyConfig();
            signal.setMaxListeners(config.hardCap + 5);
        }

        abortScanSession() {
            if (this.scanAbortController && !this.scanAbortController.signal.aborted) {
                this.scanAbortController.abort();
            }
        }

        getScanAbortSignal() {
            return this.scanAbortController ? this.scanAbortController.signal : null;
        }

        isScanAborted() {
            const signal = this.getScanAbortSignal();
            return Boolean(signal && signal.aborted);
        }

        createIcons() {
            return {
                video: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="23 7 16 12 23 17 23 7"/>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                </svg>`,
                audio: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 18V5l12-2v13"/>
                    <circle cx="6" cy="18" r="3"/>
                    <circle cx="18" cy="16" r="3"/>
                </svg>`,
                folder: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                </svg>`,
                info: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>`,
                file: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                    <polyline points="13 2 13 9 20 9"/>
                </svg>`,
                download: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>`,
                close: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>`,
                pause: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="6" y="4" width="4" height="16"/>
                    <rect x="14" y="4" width="4" height="16"/>
                </svg>`,
                resume: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>`,
                cancel: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>`,
                success: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>`,
                error: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>`,
                warning: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>`,
                github: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>`,
                twitter: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>`,
                chevronDown: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 12 15 18 9"/>
                </svg>`,
                layers: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                    <polyline points="2 17 12 22 22 17"/>
                    <polyline points="2 12 12 17 22 12"/>
                </svg>`,
                aggressive: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/>
                </svg>`,
                tv: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="6" width="18" height="12" rx="2"/>
                    <path d="M8 20h8"/>
                    <path d="M12 18v2"/>
                    <path d="M8 10h8"/>
                    <path d="M8 14h5"/>
                </svg>`,
                logToggle: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>`,
                tag: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                    <line x1="7" y1="7" x2="7.01" y2="7"/>
                </svg>`
            };
        }

        createTemplates() {
            return {
                toggleButton: (id, title, icon, checked = false, className = '') => `
                    <div class="M3Unator-toggle-container ${className}">
                        <label title="${title}" aria-label="${title}">
                            <input type="checkbox" id="${id}" ${checked ? 'checked' : ''}>
                            <span aria-hidden="true">${icon}</span>
                        </label>
                    </div>
                `,
                controlButton: (type, icon, text) => `
                    <button type="button" class="M3Unator-control-btn ${type}">
                        ${icon}
                        <span>${text}</span>
                    </button>
                `,
                statsItem: (icon, id, title, className = '') => `
                    <span class="M3Unator-stat ${className}" data-stat-label="${title}" title="${title}: 0" aria-label="${title}: 0">
                        <span class="M3Unator-stat-icon" aria-hidden="true">${icon}</span>
                        <span id="${id}" class="M3Unator-stat-value" data-raw-value="0">0</span>
                    </span>
                `
            };
        }

        createBaseStyles() {
            return `
                .M3Unator-btn-base {
                    border: none;
                    border-radius: 8px;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }

                .M3Unator-toggle-base {
                    position: relative;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.2s ease;
                }

                .M3Unator-control-base {
                    padding: 0.75rem 1.5rem;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 0.95rem;
                    min-width: 160px;
                    background: rgba(30, 30, 46, 0.6);
                    backdrop-filter: blur(8px);
                }

                .M3Unator-stat-base {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.382rem;
                    font-size: 0.875rem;
                    cursor: help;
                    min-width: 52px;
                    padding: 0 0.382rem;
                }

                .M3Unator-icon-base {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 24px;
                    height: 24px;
                    transition: all 0.2s ease;
                }
            `;
        }

        createActivityIndicatorUpdater() {
            return (status) => {
                const indicator = this.domElements.activityIndicator;
                if (!indicator) return;

                indicator.classList.remove('active', 'paused', 'cancelled', 'completed');

                if (this.state.isGenerating) {
                    if (this.state.isPaused) {
                        indicator.classList.add('paused');
                    } else {
                        indicator.classList.add('active');
                    }
                } else if (status === 'cancelled') {
                    indicator.classList.add('cancelled');
                } else if (status === 'completed') {
                    indicator.classList.add('completed');
                }
            };
        }

        createComponent(type, props) {
            switch (type) {
                case 'toggle':
                    return this.templates.toggleButton(
                        props.id,
                        props.title,
                        props.icon,
                        props.checked,
                        props.className || ''
                    );
                case 'control':
                    return this.templates.controlButton(
                        props.type,
                        props.icon,
                        props.text
                    );
                case 'stats':
                    return this.templates.statsItem(
                        props.icon,
                        props.id,
                        props.title,
                        props.class
                    );
                default:
                    return '';
            }
        }

