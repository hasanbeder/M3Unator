        async init() {
            const container = document.createElement('div');
            container.className = 'M3Unator-container';

            const toggleButtons = this.buildToggleButtonsMarkup();
            const controlButtons = this.buildControlButtonsMarkup();
            const statsItems = this.buildStatsItemsMarkup();

            container.innerHTML = `
                    <div class="M3Unator-popup">
                        <div class="M3Unator-header">
                        <h3 class="M3Unator-title">
                            ${this.icons.video}
                            ${this.getBrandTextMarkup()}
                        </h3>
                        <div class="M3Unator-header-actions">
                            <div class="M3Unator-social">
                                <button type="button" class="info-link" aria-label="About M3Unator">
                                    ${this.icons.info}
                                </button>
                                <a href="https://github.com/hasanbeder/M3Unator" target="_blank" rel="noopener noreferrer" class="github-icon" aria-label="GitHub">
                                    ${this.icons.github}
                                </a>
                                <a href="https://x.com/hasanbeder" target="_blank" rel="noopener noreferrer" aria-label="X">
                                    ${this.icons.twitter}
                                </a>
                            </div>
                            <button type="button" class="M3Unator-close" aria-label="Close M3Unator">${this.icons.close}</button>
                        </div>
                    </div>
                    <div class="info-modal">
                        <div class="info-modal-content">
                            <div class="info-modal-header">
                                <h3>${this.getAboutDialogTitle()}</h3>
                                <button type="button" class="info-close" aria-label="Close About">${this.icons.close}</button>
                            </div>
                            <div class="info-modal-body">
                                <p><strong>🎬 Web Directory Playlist Creator</strong></p>
                                <p>📂 Scan supported directory listings for video and audio files, then export clean <code>.m3u</code> or <code>.m3u8</code> playlists.</p>
                                <h4>Features</h4>
                                <ul>
                                    <li>🎥 Video and 🎵 audio detection</li>
                                    <li>🗂️ Recursive scan with depth control</li>
                                    <li>⏯️ Pause, resume, and cancel controls</li>
                                    <li>🌐 Apache, Nginx, LiteSpeed, Lighttpd, IIS, and Caddy support</li>
                                </ul>
                                <p>🔒 Runs locally in your browser. No upload.</p>
                                <p>🔗 <a href="https://github.com/hasanbeder/M3Unator" target="_blank" rel="noopener noreferrer">GitHub repo</a></p>
                            </div>
                        </div>
                    </div>
                    <div class="M3Unator-content">
                        <div class="M3Unator-input-row">
                            <div class="M3Unator-input-group M3Unator-format-group">
                                <label for="playlistName" class="M3Unator-visually-hidden">Playlist name</label>
                                <input type="text" 
                                    id="playlistName" 
                                    class="M3Unator-input"
                                    placeholder="Playlist Name" 
                                    required
                                    spellcheck="false"
                                    autocomplete="off"
                                    autocorrect="off"
                                    autocapitalize="off">
                                <label for="playlistFormat" class="M3Unator-visually-hidden">Format</label>
                                <div class="M3Unator-dropdown">
                                    <button type="button" class="M3Unator-dropdown-button" id="playlistFormat" aria-haspopup="listbox" aria-expanded="false">
                                        <span>.m3u</span>
                                        ${this.icons.chevronDown}
                                    </button>
                                    <div class="M3Unator-dropdown-menu" role="listbox" aria-label="Playlist format">
                                        <div class="M3Unator-dropdown-item selected" data-value="m3u" data-button-label=".m3u" role="option" aria-selected="true">.m3u</div>
                                        <div class="M3Unator-dropdown-divider"></div>
                                        <div class="M3Unator-dropdown-item" data-value="m3u8" data-button-label=".m3u8" title="UTF-8 M3U export with BOM for wider player compatibility" role="option" aria-selected="false">.m3u8</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="M3Unator-toggle-group">
                            ${toggleButtons}
                        </div>

                        <div class="M3Unator-depth-controls">
                            <div class="M3Unator-radio-group">
                                <label class="M3Unator-radio">
                                    <input type="radio" name="depthType" value="current" id="currentDepth">
                                    <span class="radio-mark"></span>
                                    <span class="radio-label">Current directory</span>
                                </label>
                                <label class="M3Unator-radio">
                                    <input type="radio" name="depthType" value="custom" id="customDepth">
                                    <span class="radio-mark"></span>
                                    <span class="radio-label">Custom depth:</span>
                                    <input type="number" 
                                        id="maxDepth" 
                                        value="1" 
                                        min="1" 
                                        max="99" 
                                        class="M3Unator-depth-input"
                                        title="Subdirectory scan depth" 
                                        style="width: 64px;"
                                        inputmode="numeric"
                                        pattern="[0-9]*">
                                </label>
                            </div>
                        </div>

                        <button type="button" class="M3Unator-button" id="generateBtn">
                            ${this.icons.download}
                            <span>Create Playlist</span>
                        </button>

                        <div class="M3Unator-controls">
                            ${controlButtons}
                        </div>

                        <div class="M3Unator-stats-bar">
                            <div class="M3Unator-stats">
                                ${statsItems}
                            </div>
                        </div>

                        <div class="M3Unator-log-container">
                            <button type="button" class="M3Unator-log-toggle">
                                <div class="toggle-text">
                                    ${this.icons.logToggle}
                                    <span>Recent Activity</span>
                                </div>
                                <div class="M3Unator-log-status">
                                    <span class="M3Unator-log-counter">0</span>
                                    <div class="M3Unator-activity-indicator"></div>
                                </div>
                            </button>
                            <div id="scanLog" class="M3Unator-log collapsed"></div>
                        </div>
                    </div>
                </div>
            `;

            const launcher = this.createLauncherButton();
            this.mountUiNodes(container, launcher);
            this.initializeMountedUi(container);
            this.cacheDomElements(container, launcher);
            this.bindVisibilityHandlers();
            this.setupPopupHandlers();
            this.initializeLogUi();
        }

        buildToggleButtonsMarkup() {
            return [
                {
                    id: 'includeVideo',
                    title: 'Video (.mp4, .mkv)',
                    label: 'Video',
                    meta: 'MP4, MKV, MOV',
                    icon: this.icons.video,
                    checked: true
                },
                {
                    id: 'includeAudio',
                    title: 'Audio (.mp3, .m4a)',
                    label: 'Audio',
                    meta: 'MP3, FLAC, M4A',
                    icon: this.icons.audio,
                    checked: true
                },
                {
                    id: 'recursiveSearch',
                    title: 'Scan Subdirectories',
                    label: 'Subfolders',
                    meta: 'Recursive scan',
                    icon: this.icons.folder,
                    checked: true
                }
            ].map(props => this.createComponent('toggle', props)).join('');
        }

        buildControlButtonsMarkup() {
            return [
                {
                    type: 'pause',
                    icon: this.icons.pause,
                    text: 'Pause'
                },
                {
                    type: 'resume',
                    icon: this.icons.resume,
                    text: 'Resume'
                },
                {
                    type: 'cancel',
                    icon: this.icons.cancel,
                    text: 'Cancel'
                }
            ].map(props => this.createComponent('control', props)).join('');
        }

        buildStatsItemsMarkup() {
            return [
                {
                    icon: this.icons.file,
                    id: 'totalFiles',
                    title: 'Total Files',
                    label: 'Total',
                    class: ''
                },
                {
                    icon: this.icons.video,
                    id: 'videoFiles',
                    title: 'Video (.mp4, .mkv)',
                    label: 'Video',
                    class: 'video'
                },
                {
                    icon: this.icons.audio,
                    id: 'audioFiles',
                    title: 'Audio (.mp3, .m4a)',
                    label: 'Audio',
                    class: 'audio'
                },
                {
                    icon: this.icons.folder,
                    id: 'directories',
                    title: 'Subdirectories',
                    label: 'Folders',
                    class: 'dir'
                },
                {
                    icon: this.icons.layers,
                    id: 'depthLevel',
                    title: 'Depth Level',
                    label: 'Depth',
                    class: 'depth'
                },
                {
                    icon: this.icons.error,
                    id: 'errors',
                    title: 'Error',
                    label: 'Errors',
                    class: 'error'
                }
            ].map(props => this.createComponent('stats', props)).join('');
        }

        createLauncherButton() {
            const launcher = document.createElement('button');
            launcher.className = 'M3Unator-launcher';
            launcher.type = 'button';
            launcher.setAttribute('aria-haspopup', 'dialog');
            launcher.setAttribute('aria-expanded', 'false');
            launcher.innerHTML = `
                ${this.icons.video}
                ${this.getBrandTextMarkup()}
            `;

            return launcher;
        }

        mountUiNodes(container, launcher) {
            document.body.appendChild(container);
            document.body.appendChild(launcher);
        }

        initializeMountedUi(container) {
            const popup = container.querySelector('.M3Unator-popup');
            const header = container.querySelector('.M3Unator-header');

            this.makeDraggable(popup, header);
        }

        cacheDomElements(container, launcher) {
            this.domElements = {
                container,
                popup: container.querySelector('.M3Unator-popup'),
                header: container.querySelector('.M3Unator-header'),
                closeBtn: container.querySelector('.M3Unator-close'),
                infoLink: container.querySelector('.info-link'),
                infoClose: container.querySelector('.info-close'),
                infoModal: container.querySelector('.info-modal'),
                generateBtn: container.querySelector('#generateBtn'),
                playlistInput: container.querySelector('#playlistName'),
                includeVideo: container.querySelector('#includeVideo'),
                includeAudio: container.querySelector('#includeAudio'),
                recursiveSearch: container.querySelector('#recursiveSearch'),
                controls: container.querySelector('.M3Unator-controls'),
                scanLog: container.querySelector('#scanLog'),
                statsBar: container.querySelector('.M3Unator-stats-bar'),
                dropdown: container.querySelector('.M3Unator-dropdown'),
                dropdownButton: container.querySelector('.M3Unator-dropdown-button'),
                launcher,
                stats: {
                    totalFiles: container.querySelector('#totalFiles'),
                    videoFiles: container.querySelector('#videoFiles'),
                    audioFiles: container.querySelector('#audioFiles'),
                    directories: container.querySelector('#directories'),
                    depthLevel: container.querySelector('#depthLevel'),
                    errors: container.querySelector('#errors')
                },
                depthControls: container.querySelector('.M3Unator-depth-controls'),
                currentDepth: container.querySelector('#currentDepth'),
                customDepth: container.querySelector('#customDepth'),
                maxDepth: container.querySelector('#maxDepth'),
                logToggle: container.querySelector('.M3Unator-log-toggle'),
                logCounter: container.querySelector('.M3Unator-log-counter'),
                activityIndicator: container.querySelector('.M3Unator-activity-indicator'),
            };
        }

        centerPopupInViewport() {
            const popup = this.domElements.popup;
            const rect = popup.getBoundingClientRect();
            const centerX = Math.max(0, (window.innerWidth - rect.width) / 2);
            const centerY = Math.max(0, (window.innerHeight - rect.height) / 2);
            popup.style.left = `${centerX}px`;
            popup.style.top = `${centerY}px`;
        }

        focusPrimaryInput() {
            const playlistInput = this.domElements.playlistInput;
            if (playlistInput && typeof playlistInput.focus === 'function') {
                playlistInput.focus();
            }
        }

        focusLauncher() {
            const launcher = this.domElements.launcher;
            if (launcher && typeof launcher.focus === 'function') {
                launcher.focus();
            }
        }

        isPanelOpen() {
            return this.domElements.container?.getAttribute('data-visible') === 'true';
        }

        isInfoModalOpen() {
            const infoModal = this.domElements.infoModal;
            return Boolean(infoModal && infoModal.style.display === 'block');
        }

        openInfoModal() {
            const { infoModal, infoClose } = this.domElements;
            if (!infoModal) {
                return;
            }

            infoModal.style.display = 'block';
            if (infoClose && typeof infoClose.focus === 'function') {
                infoClose.focus();
            }
        }

        closeInfoModal({ restoreFocus = false } = {}) {
            const { infoModal, infoLink } = this.domElements;
            if (!infoModal) {
                return;
            }

            infoModal.style.display = 'none';
            if (restoreFocus && infoLink && typeof infoLink.focus === 'function') {
                infoLink.focus();
            }
        }

        openPanel() {
            this.domElements.container.setAttribute('data-visible', 'true');
            this.domElements.launcher.classList.add('is-hidden');
            this.domElements.launcher.setAttribute('aria-expanded', 'true');
            document.body.classList.add('modal-open');
            this.centerPopupInViewport();
            if (typeof this.syncDropdownVisibility === 'function') {
                const dropdownButton = this.domElements.dropdown?.querySelector('.M3Unator-dropdown-button');
                this.syncDropdownVisibility(this.domElements.playlistInput, this.domElements.dropdown, dropdownButton);
            }

            this.focusPrimaryInput();
        }

        closePanel() {
            this.domElements.container.removeAttribute('data-visible');
            this.domElements.launcher.classList.remove('is-hidden');
            this.domElements.launcher.setAttribute('aria-expanded', 'false');
            this.closeInfoModal();

            document.body.classList.remove('modal-open');
            this.focusLauncher();
        }

        bindVisibilityHandlers() {
            this.domElements.launcher.onclick = () => {
                this.openPanel();
            };

            this.domElements.closeBtn.onclick = () => {
                if (this.state.isGenerating) {
                    this.state.isGenerating = false;
                    this.state.isPaused = false;
                    this.reset({ isCancelled: true, enableToggles: true });
                    this.showToast('Scan cancelled', 'warning');
                }

                this.closePanel();
            };
        }

        bindKeyboardHandlers() {
            document.addEventListener('keydown', (event) => {
                if (event.key !== 'Escape') {
                    return;
                }

                if (this.isInfoModalOpen()) {
                    event.preventDefault();
                    this.closeInfoModal({ restoreFocus: true });
                    return;
                }

                if (this.isPanelOpen() && !this.state.isGenerating) {
                    event.preventDefault();
                    this.closePanel();
                }
            });
        }

        bindLogToggleHandler() {
            this.domElements.logToggle.addEventListener('click', () => {
                const log = this.domElements.scanLog;
                const toggle = this.domElements.logToggle;

                if (log.classList.contains('expanded')) {
                    log.classList.remove('expanded');
                    toggle.classList.remove('active');
                } else {
                    log.classList.add('expanded');
                    toggle.classList.add('active');
                    log.scrollTop = log.scrollHeight;
                }
            });
        }

        initializeLogUi() {
            this.updateCounter(0);
            this.bindLogToggleHandler();
            this.bindKeyboardHandlers();
            this.domElements.scanLog.classList.remove('expanded');
            this.domElements.logToggle.classList.remove('active');
            this.logCount = 0;
        }

        makeDraggable(element, handle) {
            let isDragging = false;
            let currentX;
            let currentY;
            let initialX;
            let initialY;
            let xOffset = 0;
            let yOffset = 0;

            const centerWindow = () => {
                const rect = element.getBoundingClientRect();
                const centerX = (window.innerWidth - rect.width) / 2;
                const centerY = (window.innerHeight - rect.height) / 2;
                
                element.style.left = `${centerX}px`;
                element.style.top = `${centerY}px`;
                
                xOffset = centerX;
                yOffset = centerY;
                
                element.style.transform = 'none';
            };

            centerWindow();

            const getPosition = (e) => {
                return {
                    x: e.type.includes('touch') ? e.touches[0].clientX : e.clientX,
                    y: e.type.includes('touch') ? e.touches[0].clientY : e.clientY
                };
            };

            const dragStart = (e) => {
                if (e.target === handle || handle.contains(e.target)) {
                    e.preventDefault();
                    const pos = getPosition(e);
                    
                    isDragging = true;
                    
                    const rect = element.getBoundingClientRect();
                    xOffset = rect.left;
                    yOffset = rect.top;
                    
                    initialX = pos.x - xOffset;
                    initialY = pos.y - yOffset;

                    handle.style.cursor = 'grabbing';
                }
            };

            const drag = (e) => {
                if (isDragging) {
                    e.preventDefault();
                    const pos = getPosition(e);

                    currentX = pos.x - initialX;
                    currentY = pos.y - initialY;

                    const rect = element.getBoundingClientRect();
                    const maxX = window.innerWidth - rect.width;
                    const maxY = window.innerHeight - rect.height;

                    currentX = Math.min(Math.max(0, currentX), maxX);
                    currentY = Math.min(Math.max(0, currentY), maxY);

                    element.style.left = `${currentX}px`;
                    element.style.top = `${currentY}px`;
                    
                    xOffset = currentX;
                    yOffset = currentY;
                }
            };

            const dragEnd = () => {
                if (isDragging) {
                    isDragging = false;
                    handle.style.cursor = 'grab';
                }
            };

            handle.addEventListener('mousedown', dragStart);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);

            handle.addEventListener('touchstart', dragStart, { passive: false });
            document.addEventListener('touchmove', drag, { passive: false });
            document.addEventListener('touchend', dragEnd);

            window.addEventListener('resize', () => {
                if (!isDragging) {
                    centerWindow();
                }
            });

            handle.style.cursor = 'grab';
            handle.style.userSelect = 'none';
            handle.style.touchAction = 'none';

            element.style.position = 'fixed';
            element.style.margin = '0';
            element.style.touchAction = 'none';
            element.style.transition = 'none';
        }

