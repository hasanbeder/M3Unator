        updateResetActivityState(isCancelled, wasPaused, wasGenerating) {
            if (isCancelled || wasPaused) {
                this.updateActivityIndicator('cancelled');
            } else if (wasGenerating) {
                this.updateActivityIndicator('completed');
            } else {
                this.updateActivityIndicator(null);
            }
        }

        clearScanSessionData(keepLogs) {
            this.entries = [];
            this.resetSeenUrlCache();

            if (!keepLogs) {
                this.clearLogSessionState();
            }
        }

        appendCompletionSummary() {
            const stats = this.state.stats;
            const summary = [
                'Scan completed:',
                `• Video files: ${this.formatFullStatValue(stats.files.video.total)}`,
                `• Audio files: ${this.formatFullStatValue(stats.files.audio.total)}`,
                `• Scanned directories: ${this.formatFullStatValue(stats.directories.total)}`,
                `• Maximum depth: ${this.formatFullStatValue(stats.directories.depth)}`,
                stats.errors.total > 0 ? `• Errors: ${this.formatFullStatValue(stats.errors.total)} (${this.formatFullStatValue(stats.errors.skipped)} skipped)` : null
            ].filter(Boolean).join('\n');

            this.addLogEntry(summary, 'final');
        }

        resetGenerateButtonUi(elements) {
            if (elements.generateBtn) {
                elements.generateBtn.disabled = false;
                elements.generateBtn.innerHTML = `${this.icons.download}<span>Create Playlist</span>`;
            }
        }

        resetControlButtonsUi(elements) {
            if (elements.controls) {
                elements.controls.style.display = 'none';
                elements.controls.classList.remove('active');

                const { pauseBtn, resumeBtn, cancelBtn } = this.getControlButtons(elements.controls);
                if (pauseBtn) pauseBtn.style.display = 'none';
                if (resumeBtn) resumeBtn.style.display = 'none';
                if (cancelBtn) cancelBtn.style.display = 'none';
            }
        }

        restoreToggleAvailability(elements) {
            if (elements.includeVideo) elements.includeVideo.disabled = false;
            if (elements.includeAudio) elements.includeAudio.disabled = false;
            if (elements.recursiveSearch) elements.recursiveSearch.disabled = false;
            if (elements.currentDepth) elements.currentDepth.disabled = false;
            if (elements.customDepth) elements.customDepth.disabled = false;
            if (elements.maxDepth) elements.maxDepth.disabled = elements.customDepth ? !elements.customDepth.checked : true;
            if (elements.dropdownButton) {
                elements.dropdownButton.disabled = false;
                elements.dropdownButton.setAttribute('aria-disabled', 'false');
            }
        }

        resetCancelledStatsUi(elements, keepLogs) {
            this.state.stats = JSON.parse(JSON.stringify(this.initialStats));

            if (!keepLogs) {
                if (elements.statsBar) {
                    elements.statsBar.style.display = 'none';
                    elements.statsBar.classList.remove('active');
                }

                if (elements.scanLog) {
                    elements.scanLog.innerHTML = '';
                    elements.scanLog.classList.add('collapsed');
                }

                if (elements.logToggle) {
                    elements.logToggle.classList.remove('active');
                }

                if (this.domElements.stats) {
                    Object.entries(this.domElements.stats).forEach(([key, element]) => {
                        if (element) {
                            this.applyCounterValue(this.domElements.stats, key, 0);
                        }
                    });
                }
            }
        }

        resetDepthControlsUi(elements) {
            if (elements.recursiveSearch) {
                elements.recursiveSearch.checked = true;
                this.state.recursiveSearch = true;
                this.state.maxDepth = -1;
            }

            if (elements.currentDepth) {
                elements.currentDepth.checked = false;
            }

            if (elements.customDepth) {
                elements.customDepth.checked = false;
            }

            if (elements.maxDepth) {
                elements.maxDepth.disabled = true;
                elements.maxDepth.value = '1';
            }

            if (elements.depthControls) {
                elements.depthControls.classList.remove('active');
            }
        }

        reset(options = {}) {
            const {
                isCancelled = false,
                uiOnly = false,
                keepLogs = false,
                keepUI = false,
                enableToggles = false,
                wasGenerating = this.state.isGenerating
            } = options;

            const wasPaused = this.state.isPaused;

            this.state.isGenerating = false;
            this.state.isPaused = false;
            this.updateResetActivityState(isCancelled, wasPaused, wasGenerating);

            if (!uiOnly) {
                this.clearScanSessionData(keepLogs);

                if (wasGenerating && !isCancelled) {
                    this.appendCompletionSummary();
                }
            }

            const elements = this.domElements;
            this.resetGenerateButtonUi(elements);
            this.resetControlButtonsUi(elements);

            if (enableToggles) {
                this.restoreToggleAvailability(elements);
            }

            if (uiOnly) {
                return;
            }

            if (isCancelled) {
                this.resetCancelledStatsUi(elements, keepLogs);
            }

            this.resetDepthControlsUi(elements);
        }
