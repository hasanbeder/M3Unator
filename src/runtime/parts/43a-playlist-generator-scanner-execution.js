        createBatchProgress(total) {
            return {
                total,
                processed: 0,
                success: 0,
                errors: 0
            };
        }

        updateBatchProgress(batchProgress) {
            batchProgress.processed++;

            if (batchProgress.processed % 20 === 0 || batchProgress.processed === batchProgress.total) {
                const progress = Math.floor((batchProgress.processed / batchProgress.total) * 100);
                this.addLogEntry(
                    `Batch Processing: ${progress}% (${batchProgress.processed}/${batchProgress.total}, ` +
                    `Success: ${batchProgress.success}, Error: ${batchProgress.errors})`,
                    'info'
                );
            }
        }

        processFileHref(href, normalizedUrl, currentPath, processedUrls, batchProgress) {
            try {
                const fullUrl = new URL(href, normalizedUrl).toString();
                if (processedUrls.has(fullUrl)) {
                    return;
                }

                processedUrls.add(fullUrl);

                const { fileName, dirPath } = this.extractFileInfo(href);
                const fullPath = this.joinRelativePath(currentPath, dirPath, fileName);

                this.state.stats.totalFiles = (this.state.stats.totalFiles || 0) + 1;

                const mediaType = this.isMediaFileOptimized(fileName);
                const shouldIncludeMedia = mediaType && (
                    (mediaType === 'video' && this.state.includeVideo) ||
                    (mediaType === 'audio' && this.state.includeAudio)
                );

                if (shouldIncludeMedia) {
                    if (mediaType === 'video') {
                        this.updateFileStats('video');
                    } else {
                        this.updateFileStats('audio');
                    }

                    this.entries.push({
                        title: fullPath || fileName,
                        url: fullUrl
                    });
                    batchProgress.success++;
                }
            } catch (error) {
                console.error('URL processing error:', error);
                this.state.stats.errors.total++;
                batchProgress.errors++;
            } finally {
                this.updateBatchProgress(batchProgress);
            }
        }

        processFileBatch(files, startIndex, batchSize, normalizedUrl, currentPath) {
            const endIndex = Math.min(startIndex + batchSize, files.length);
            const batchProgress = this.createBatchProgress(endIndex - startIndex);
            const processedUrls = new Set();

            for (let fileIndex = startIndex; fileIndex < endIndex; fileIndex++) {
                this.processFileHref(files[fileIndex], normalizedUrl, currentPath, processedUrls, batchProgress);
            }
        }

        shouldYieldAfterFileBatch(processedCount, totalFiles) {
            return processedCount < totalFiles && processedCount % 500 === 0;
        }

        async yieldToScanLoop() {
            await new Promise(resolve => setTimeout(resolve, 0));
        }

        async processFileHrefs(files, normalizedUrl, currentPath) {
            const batchSize = 100;

            for (let index = 0; index < files.length; index += batchSize) {
                await this.waitForScanResume();

                if (this.shouldStopScanning()) {
                    break;
                }

                this.processFileBatch(files, index, batchSize, normalizedUrl, currentPath);

                const processedCount = Math.min(index + batchSize, files.length);
                if (this.shouldYieldAfterFileBatch(processedCount, files.length)) {
                    await this.yieldToScanLoop();
                }
            }
        }

        shouldScanSubdirectories(depth) {
            return this.state.maxDepth === -1 ||
                (this.state.maxDepth > 0 && depth < this.state.maxDepth);
        }

        queueSubdirectoryScan(dir, normalizedUrl, currentPath, depth, activeRequests) {
            try {
                const fullUrl = new URL(dir, normalizedUrl).toString();
                const { fileName, dirPath } = this.extractDirectoryInfo(dir);
                const fullPath = this.joinRelativePath(currentPath, dirPath, fileName);

                let trackedPromise;
                trackedPromise = this.scanDirectory(fullUrl, fullPath, depth + 1)
                    .finally(() => {
                        activeRequests.delete(trackedPromise);
                    });

                activeRequests.add(trackedPromise);
                this.addLogEntry(`Entering subdirectory: ${fullPath || this.decodeString(dir).replace(/\/+$/, '')}`);
            } catch (error) {
                console.error('Directory scanning error:', error);
                this.state.stats.errors.total++;
            }
        }

        async scanSubdirectoryQueue(directories, normalizedUrl, currentPath, depth) {
            const parallelLimit = 15;
            const activeRequests = new Set();
            let queueIndex = 0;

            while (queueIndex < directories.length || activeRequests.size > 0) {
                while (queueIndex < directories.length && activeRequests.size < parallelLimit) {
                    const dir = directories[queueIndex];
                    queueIndex++;
                    this.queueSubdirectoryScan(dir, normalizedUrl, currentPath, depth, activeRequests);
                }

                if (activeRequests.size > 0) {
                    await Promise.race(activeRequests);
                }
            }
        }

        async scanDirectory(url, currentPath = '', depth = 0) {
            try {
                this.resetCurrentStats();

                if (this.shouldStopScanning()) {
                    return this.entries;
                }

                await this.waitForScanResume();

                const normalizedUrl = this.buildNormalizedScanUrl(url);
                this.updateDirectoryScanStats(normalizedUrl, depth);

                if (this.shouldSkipSeenDirectory(normalizedUrl)) {
                    return this.entries;
                }

                this.trackSeenDirectory(normalizedUrl);

                const response = await this.fetchDirectoryResponse(normalizedUrl);
                if (!response) {
                    return this.entries;
                }

                const doc = this.parseDirectoryDocument(response.decodedText);
                const listingSupport = this.getDirectoryListingSupport(doc, normalizedUrl);
                if (!listingSupport.supported) {
                    this.addLogEntry(`Skipped non-listing page: ${decodeURIComponent(normalizedUrl)}`, 'warning');
                    return this.entries;
                }

                const hrefs = this.hasListingSelector(doc, 'div#table-list')
                    ? this.extractLiteSpeedHrefs(doc, normalizedUrl)
                    : this.extractGenericListingHrefs(doc, normalizedUrl);
                const { directories, files } = this.splitDirectoryAndFileHrefs(hrefs);

                await this.processFileHrefs(files, normalizedUrl, currentPath);

                if (this.shouldScanSubdirectories(depth) && directories.length > 0) {
                    await this.scanSubdirectoryQueue(directories, normalizedUrl, currentPath, depth);
                }

                this.updateCounter(this.state.stats.totalFiles);
                return this.entries;
            } catch (error) {
                this.state.stats.errors.total++;
                this.addLogEntry(`Scan error (${currentPath || url}): ${error.message}`, 'error');
                return this.entries;
            }
        }
