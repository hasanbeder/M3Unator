        ensureToastContainer() {
            let toastContainer = document.querySelector('.M3Unator-toast-container');
            if (!toastContainer) {
                toastContainer = document.createElement('div');
                toastContainer.className = 'M3Unator-toast-container';
                document.body.appendChild(toastContainer);
            }

            return toastContainer;
        }

        clearExistingToasts(toastContainer) {
            const existingToasts = toastContainer.querySelectorAll('.M3Unator-toast');
            existingToasts.forEach(toast => {
                toast.classList.add('removing');
                setTimeout(() => toast.remove(), 300);
            });
        }

        createToastElement(message, type) {
            const toast = document.createElement('div');
            toast.className = `M3Unator-toast ${type}`;
            const icon = this.icons[type] || this.icons.info;
            toast.innerHTML = `${icon}<span>${message}</span>`;
            return toast;
        }

        scheduleToastRemoval(toast, toastContainer, duration) {
            setTimeout(() => {
                toast.classList.add('removing');
                toast.classList.remove('show');

                setTimeout(() => {
                    if (toast.parentNode === toastContainer) {
                        toast.remove();
                    }

                    if (toastContainer.children.length === 0) {
                        toastContainer.remove();
                    }
                }, 300);
            }, duration);
        }

        showToast(message, type = 'success', duration = 3000) {
            const toastContainer = this.ensureToastContainer();
            this.clearExistingToasts(toastContainer);

            const toast = this.createToastElement(message, type);
            toastContainer.appendChild(toast);

            void toast.offsetWidth;

            requestAnimationFrame(() => {
                toast.classList.add('show');
            });

            this.scheduleToastRemoval(toast, toastContainer, duration);
        }

        getControlButtons(controls) {
            const controlButtons = controls.querySelectorAll('.M3Unator-control-btn');
            return {
                pauseBtn: controlButtons[0],
                resumeBtn: controlButtons[1],
                cancelBtn: controlButtons[2]
            };
        }

        initializePopupSelections(includeVideo, includeAudio, recursiveSearch, aggressiveMode) {
            recursiveSearch.checked = true;
            includeVideo.checked = true;
            includeAudio.checked = true;
            if (aggressiveMode) {
                aggressiveMode.checked = false;
            }
            this.state.recursiveSearch = true;
            this.state.includeVideo = true;
            this.state.includeAudio = true;
            this.state.aggressiveMode = false;
            this.state.groupTitle = '';

            const { groupTitle, groupTitleToggle, groupTitlePanel } = this.domElements;
            if (groupTitle) {
                groupTitle.disabled = true;
                groupTitle.value = '';
            }
            if (groupTitleToggle) {
                groupTitleToggle.classList.remove('active');
                groupTitleToggle.setAttribute('aria-expanded', 'false');
            }
            if (groupTitlePanel) {
                groupTitlePanel.classList.remove('is-visible');
                groupTitlePanel.setAttribute('aria-hidden', 'true');
            }
        }

        syncDropdownVisibility(playlistInput, dropdown, dropdownButton) {
            const isVisible = Boolean(playlistInput && playlistInput.value.trim());

            dropdown.classList.toggle('is-visible', isVisible);
            dropdown.setAttribute('aria-hidden', isVisible ? 'false' : 'true');

            if (!isVisible || (dropdownButton && dropdownButton.disabled)) {
                dropdown.classList.remove('active');
                if (dropdownButton) {
                    dropdownButton.setAttribute('aria-expanded', 'false');
                }
            }

            const groupTitleToggle = this.domElements.groupTitleToggle;
            if (groupTitleToggle) {
                groupTitleToggle.classList.toggle('is-visible', isVisible);
                if (!isVisible) {
                    const groupTitlePanel = this.domElements.groupTitlePanel;
                    const groupTitle = this.domElements.groupTitle;
                    if (groupTitlePanel && groupTitlePanel.classList.contains('is-visible')) {
                        groupTitlePanel.classList.remove('is-visible');
                        groupTitlePanel.setAttribute('aria-hidden', 'true');
                    }
                    if (groupTitle) {
                        groupTitle.value = '';
                        groupTitle.disabled = true;
                        this.state.groupTitle = '';
                    }
                    groupTitleToggle.classList.remove('active');
                    groupTitleToggle.setAttribute('aria-expanded', 'false');
                }
            }
        }

        bindPlaylistInputHandlers(playlistInput, dropdown, dropdownButton) {
            const syncVisibility = () => {
                this.syncDropdownVisibility(playlistInput, dropdown, dropdownButton);
            };

            playlistInput.addEventListener('input', syncVisibility);
            playlistInput.addEventListener('change', syncVisibility);
            syncVisibility();
        }

        collapseFormatDropdown(dropdown, dropdownButton) {
            if (dropdown) {
                dropdown.classList.remove('active');
            }

            if (dropdownButton) {
                dropdownButton.setAttribute('aria-expanded', 'false');
            }
        }

        setFormatSelectionLocked(isLocked) {
            const { dropdown, dropdownButton } = this.domElements;
            if (!dropdownButton) return;

            this.collapseFormatDropdown(dropdown, dropdownButton);
            dropdownButton.disabled = isLocked;
            dropdownButton.setAttribute('aria-disabled', isLocked ? 'true' : 'false');
        }

        bindDropdownHandlers(dropdown, dropdownButton, dropdownItems) {
            dropdownButton.addEventListener('click', () => {
                if (dropdownButton.disabled) {
                    return;
                }

                dropdown.classList.toggle('active');
                dropdownButton.setAttribute('aria-expanded', dropdown.classList.contains('active') ? 'true' : 'false');
            });

            document.addEventListener('click', (event) => {
                if (!dropdown.contains(event.target)) {
                    this.collapseFormatDropdown(dropdown, dropdownButton);
                }
            });

            dropdownItems.forEach(item => {
                item.addEventListener('click', () => {
                    if (dropdownButton.disabled || this.state.isGenerating) {
                        return;
                    }

                    dropdownItems.forEach(dropdownItem => {
                        dropdownItem.classList.remove('selected');
                        dropdownItem.setAttribute('aria-selected', 'false');
                    });
                    item.classList.add('selected');
                    item.setAttribute('aria-selected', 'true');
                    dropdownButton.querySelector('span').textContent = item.dataset.buttonLabel || item.textContent.trim();
                    this.state.selectedFormat = item.dataset.value;
                    this.collapseFormatDropdown(dropdown, dropdownButton);
                });
            });
        }

        bindMediaToggleHandlers(includeVideo, includeAudio) {
            includeVideo.addEventListener('change', (event) => {
                this.state.includeVideo = event.target.checked;
                this.addLogEntry(
                    event.target.checked ?
                    'Video files will be included' :
                    'Video files will not be included',
                    'info'
                );
            });

            includeAudio.addEventListener('change', (event) => {
                this.state.includeAudio = event.target.checked;
                this.addLogEntry(
                    event.target.checked ?
                    'Audio files will be included' :
                    'Audio files will not be included',
                    'info'
                );
            });
        }

        bindAggressiveModeHandler(aggressiveMode) {
            if (!aggressiveMode) {
                return;
            }

            aggressiveMode.addEventListener('change', (event) => {
                this.state.aggressiveMode = event.target.checked;
                this.addLogEntry(
                    event.target.checked ?
                    'Aggressive mode enabled: higher parallel scanning with adaptive throttling' :
                    'Aggressive mode disabled: standard parallel scanning restored',
                    event.target.checked ? 'warning' : 'info'
                );
            });
        }

        bindGroupTitleHandler(groupTitle) {
            if (!groupTitle) {
                return;
            }

            const syncGroupTitle = () => {
                this.state.groupTitle = groupTitle.value.trim();
            };

            groupTitle.addEventListener('input', syncGroupTitle);
            groupTitle.addEventListener('change', syncGroupTitle);
            syncGroupTitle();
        }

        bindGroupTitleToggleHandler(groupTitleToggle, groupTitlePanel, groupTitle) {
            if (!groupTitleToggle || !groupTitlePanel) {
                return;
            }

            groupTitleToggle.addEventListener('click', () => {
                const isOpen = groupTitlePanel.classList.toggle('is-visible');
                groupTitlePanel.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
                groupTitleToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
                groupTitleToggle.classList.toggle('active', isOpen);

                if (isOpen && groupTitle) {
                    groupTitle.disabled = false;
                    groupTitle.focus();
                } else if (!isOpen && groupTitle) {
                    groupTitle.value = '';
                    groupTitle.disabled = true;
                    this.state.groupTitle = '';
                }

                this.addLogEntry(
                    isOpen
                        ? 'Group title enabled for single-category exports'
                        : 'Group title disabled',
                    'info'
                );
            });
        }

        initializeDepthControls(currentDepth, customDepth, maxDepth, depthControls) {
            depthControls.style.display = 'none';
            depthControls.classList.remove('active');
            this.state.maxDepth = -1;

            currentDepth.checked = true;
            customDepth.checked = false;
            maxDepth.disabled = true;
            maxDepth.value = '1';
        }

        bindDepthControlHandlers(recursiveSearch, currentDepth, customDepth, maxDepth, depthControls) {
            recursiveSearch.addEventListener('change', (event) => {
                if (!event.target.checked) {
                    depthControls.style.display = 'block';
                    depthControls.classList.add('active');
                    currentDepth.checked = true;
                    customDepth.checked = false;
                    maxDepth.disabled = true;
                    this.state.maxDepth = 0;
                    this.addLogEntry('Directory scanning disabled, only current directory will be scanned', 'info');
                } else {
                    depthControls.style.display = 'none';
                    depthControls.classList.remove('active');
                    this.state.maxDepth = -1;
                    this.state.recursiveSearch = true;
                    this.addLogEntry('Directory scanning active, all directories will be scanned', 'info');
                }
            });

            currentDepth.addEventListener('change', (event) => {
                if (event.target.checked && !recursiveSearch.checked) {
                    this.state.maxDepth = 0;
                    maxDepth.disabled = true;
                    this.addLogEntry('Only current directory will be scanned', 'info');
                }
            });

            customDepth.addEventListener('change', (event) => {
                if (event.target.checked && !recursiveSearch.checked) {
                    const depthValue = parseInt(maxDepth.value) || 1;
                    this.state.maxDepth = depthValue;
                    maxDepth.disabled = false;
                    this.addLogEntry(
                        `Directory scanning depth: ${depthValue} ` +
                        `(current directory + ${depthValue} sublevels)`,
                        'info'
                    );
                }
            });

            maxDepth.addEventListener('input', (event) => {
                if (customDepth.checked && !recursiveSearch.checked) {
                    const value = Math.min(99, Math.max(1, parseInt(event.target.value) || 1));
                    event.target.value = value;
                    this.state.maxDepth = value;
                    this.addLogEntry(
                        `Directory scanning depth updated: ${value} ` +
                        `(current directory + ${value} sublevels)`,
                        'info'
                    );
                }
            });
        }

        renderGeneratingButton(generateBtn, isPaused = false) {
            generateBtn.innerHTML = isPaused
                ? `
                    <div class="M3Unator-spinner" style="animation-play-state: paused;"></div>
                    <span>Scan paused</span>
                `
                : `
                    <div class="M3Unator-spinner"></div>
                    <span>Creating...</span>
                `;
        }

        handlePauseScan(pauseBtn, resumeBtn, generateBtn) {
            this.state.isPaused = true;
            this.updateActivityIndicator('paused');
            pauseBtn.style.display = 'none';
            resumeBtn.style.display = 'flex';
            this.renderGeneratingButton(generateBtn, true);
            this.showToast('Scan paused', 'warning');
            this.addLogEntry('Scan paused...', 'warning');
        }

        handleResumeScan(pauseBtn, resumeBtn, generateBtn) {
            this.state.isPaused = false;
            this.updateActivityIndicator('active');
            resumeBtn.style.display = 'none';
            pauseBtn.style.display = 'flex';
            this.renderGeneratingButton(generateBtn, false);
            this.showToast('Scan resumed', 'success');
            this.addLogEntry('Scan in progress...', 'success');
        }

        handleCancelScan() {
            this.state.isGenerating = false;
            this.state.isPaused = false;
            this.abortScanSession();
            this.updateActivityIndicator('cancelled');

            setTimeout(() => {
                this.reset({ isCancelled: true, enableToggles: true });
                this.showToast('Scan cancelled', 'warning');
            }, 100);
        }

        clearLogSessionState() {
            this.logCount = 0;
            this.cancelScheduledLogUiUpdate();

            if (this.logCache) {
                this.logCache.clear();
            }

            if (this.domElements.scanLog) {
                this.domElements.scanLog.innerHTML = '';
            }

            if (this.domElements.logCounter) {
                this.domElements.logCounter.textContent = '0';
            }
        }

        resetScanSessionState() {
            this.entries = [];
            this.resetSeenUrlCache();
            this.clearLogSessionState();

            this.state.stats = JSON.parse(JSON.stringify(this.initialStats));
        }

        prepareScanRunUi(generateBtn, controls, pauseBtn, resumeBtn, cancelBtn) {
            this.state.isGenerating = true;
            this.state.isPaused = false;
            this.updateActivityIndicator('active');
            this.showToast('Scan started', 'success');

            generateBtn.disabled = true;
            this.renderGeneratingButton(generateBtn, false);

            this.domElements.includeVideo.disabled = true;
            this.domElements.includeAudio.disabled = true;
            this.domElements.recursiveSearch.disabled = true;
            if (this.domElements.aggressiveMode) {
                this.domElements.aggressiveMode.disabled = true;
            }
            if (this.domElements.groupTitle) {
                this.domElements.groupTitle.disabled = true;
            }
            this.domElements.currentDepth.disabled = true;
            this.domElements.customDepth.disabled = true;
            this.domElements.maxDepth.disabled = true;
            this.setFormatSelectionLocked(true);

            controls.style.display = 'flex';
            controls.classList.add('active');

            if (pauseBtn) {
                pauseBtn.style.display = 'flex';
                resumeBtn.style.display = 'none';
                cancelBtn.style.display = 'flex';
            }

            this.domElements.statsBar.style.display = 'block';
            this.domElements.statsBar.classList.add('active');
            this.centerPopupInViewport();
        }

        downloadPlaylistFile(content, fileName, mimeType = 'text/plain;charset=utf-8') {
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }

        async handleGenerateRequest(generateBtn, controls, pauseBtn, resumeBtn, cancelBtn, playlistInput) {
            const playlistName = this.sanitizeInput(playlistInput.value.trim());

            if (!playlistName) {
                this.showToast('Please enter a valid playlist name', 'warning');
                playlistInput.focus();
                return;
            }

            if (!this.state.includeVideo && !this.state.includeAudio) {
                this.showToast('Please select at least one media type', 'warning');
                return;
            }

            try {
                this.resetScanSessionState();
                this.startScanSession();
                this.prepareScanRunUi(generateBtn, controls, pauseBtn, resumeBtn, cancelBtn);

                const entries = await this.scanDirectory(window.location.href, '', 0);

                if (!this.state.isGenerating) {
                    return;
                }

                if (entries.length === 0) {
                    this.state.isGenerating = false;
                    this.updateActivityIndicator('cancelled');
                    this.showToast('No media files found', 'error');
                    this.reset({ isCancelled: true });
                    return;
                }

                this.addLogEntry(`Total ${entries.length} files found.`, 'success');
                this.updateCounter(entries.length);

                const downloadPayload = this.buildPlaylistDownloadPayload(entries, this.state.selectedFormat);
                const fileName = `${playlistName}.${downloadPayload.extension}`;
                this.downloadPlaylistFile(downloadPayload.content, fileName, downloadPayload.mimeType);

                this.showToast(`Playlist "${fileName}" created successfully`, 'success');
                this.updateActivityIndicator('completed');
                this.reset({ keepLogs: true, enableToggles: true });
            } catch (error) {
                this.state.isGenerating = false;
                this.state.isPaused = false;
                this.updateActivityIndicator('cancelled');
                console.error('Error creating playlist:', error);
                this.addLogEntry(`Error: ${error.message}`, 'error');
                this.showToast('Error creating playlist', 'error');
                this.reset({ isCancelled: true });
            }
        }

        bindScanControlHandlers(generateBtn, controls, pauseBtn, resumeBtn, cancelBtn, playlistInput) {
            pauseBtn.addEventListener('click', () => {
                this.handlePauseScan(pauseBtn, resumeBtn, generateBtn);
            });

            resumeBtn.addEventListener('click', () => {
                this.handleResumeScan(pauseBtn, resumeBtn, generateBtn);
            });

            cancelBtn.addEventListener('click', () => {
                this.handleCancelScan();
            });

            generateBtn.addEventListener('click', async () => {
                await this.handleGenerateRequest(
                    generateBtn,
                    controls,
                    pauseBtn,
                    resumeBtn,
                    cancelBtn,
                    playlistInput
                );
            });
        }

        setupPopupHandlers() {
            const {
                generateBtn,
                playlistInput,
                includeVideo,
                includeAudio,
                recursiveSearch,
                aggressiveMode,
                groupTitle,
                controls,
                dropdown,
                currentDepth,
                customDepth,
                maxDepth,
                depthControls
            } = this.domElements;

            const dropdownButton = dropdown.querySelector('.M3Unator-dropdown-button');
            const dropdownItems = dropdown.querySelectorAll('.M3Unator-dropdown-item');
            const { pauseBtn, resumeBtn, cancelBtn } = this.getControlButtons(controls);

            this.bindPlaylistInputHandlers(playlistInput, dropdown, dropdownButton);
            this.bindDropdownHandlers(dropdown, dropdownButton, dropdownItems);
            this.initializePopupSelections(includeVideo, includeAudio, recursiveSearch, aggressiveMode);
            this.bindMediaToggleHandlers(includeVideo, includeAudio);
            this.bindAggressiveModeHandler(aggressiveMode);
            this.bindGroupTitleHandler(groupTitle);
            this.bindGroupTitleToggleHandler(this.domElements.groupTitleToggle, this.domElements.groupTitlePanel, groupTitle);
            this.initializeDepthControls(currentDepth, customDepth, maxDepth, depthControls);
            this.bindDepthControlHandlers(recursiveSearch, currentDepth, customDepth, maxDepth, depthControls);
            this.bindScanControlHandlers(generateBtn, controls, pauseBtn, resumeBtn, cancelBtn, playlistInput);
        }
