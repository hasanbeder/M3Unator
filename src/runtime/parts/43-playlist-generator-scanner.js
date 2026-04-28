        shouldStopScanning() {
            return !this.state.isGenerating || this.entries.length >= this.state.maxEntries;
        }

        async waitForScanResume() {
            while (this.state.isPaused && this.state.isGenerating) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        buildNormalizedScanUrl(url) {
            return this.normalizeUrl(url).replace(/#/g, '%23')
                .replace(/\s+/g, '%20')
                .replace(/\[/g, '%5B')
                .replace(/\]/g, '%5D')
                .replace(/'/g, '%27')
                .replace(/"/g, '%22');
        }

        updateDirectoryScanStats(normalizedUrl, depth) {
            if (depth > this.state.stats.directories.depth) {
                this.state.stats.directories.depth = depth;
            }

            this.state.stats.directories.total++;
            this.addLogEntry(`Scanning directory (level ${depth}): ${decodeURIComponent(normalizedUrl)}`);
        }

        shouldSkipSeenDirectory(normalizedUrl) {
            if (!this.seenUrls.has(normalizedUrl)) {
                return false;
            }

            this.addLogEntry(`This directory was previously scanned: ${decodeURIComponent(normalizedUrl)}`);
            return true;
        }

        resetSeenUrlCache() {
            this.seenUrls.clear();
            this.seenUrlOrder = [];
        }

        trimSeenDirectoryCache() {
            const previousCount = this.seenUrlOrder.length;
            const keepCount = Math.floor(this.state.maxSeenUrls * 0.75);
            const trimCount = previousCount - keepCount;

            if (trimCount <= 0) {
                return;
            }

            const trimmedUrls = this.seenUrlOrder.slice(0, trimCount);
            this.seenUrlOrder = this.seenUrlOrder.slice(trimCount);

            trimmedUrls.forEach(url => {
                this.seenUrls.delete(url);
            });

            this.addLogEntry(
                `Cache cleared (${previousCount} -> ${this.seenUrlOrder.length})`,
                'info'
            );
        }

        trackSeenDirectory(normalizedUrl) {
            this.seenUrls.add(normalizedUrl);
            this.seenUrlOrder.push(normalizedUrl);

            if (this.seenUrlOrder.length > this.state.maxSeenUrls) {
                this.trimSeenDirectoryCache();
            }
        }

        async fetchDirectoryResponse(normalizedUrl) {
            try {
                return await this.fetchWithRetry(normalizedUrl, {
                    signal: null,
                    timeout: 30000
                });
            } catch (error) {
                if (error.name === 'AbortError') {
                    this.addLogEntry(`Request cancelled: ${decodeURIComponent(normalizedUrl)}`, 'warning');
                } else if (error.message.includes('404')) {
                    this.addLogEntry(`Directory not found: ${decodeURIComponent(normalizedUrl)}`, 'warning');
                } else {
                    this.addLogEntry(`Connection error: ${error.message}`, 'error');
                }

                return null;
            }
        }

        normalizeListingText(value) {
            return typeof value === 'string' ? value.trim().toLowerCase() : '';
        }

        getListingSelectorText(doc, selector) {
            if (!doc || typeof doc.querySelector !== 'function') {
                return '';
            }

            const element = doc.querySelector(selector);
            return element && typeof element.textContent === 'string' ? element.textContent : '';
        }

        hasListingSelector(doc, selector) {
            return Boolean(doc && typeof doc.querySelector === 'function' && doc.querySelector(selector));
        }

        getListingDocumentText(doc) {
            return this.normalizeListingText(
                doc && doc.body && typeof doc.body.textContent === 'string'
                    ? doc.body.textContent
                    : ''
            );
        }

        getListingAnchorHref(anchor) {
            if (!anchor || typeof anchor.getAttribute !== 'function') {
                return '';
            }

            return anchor.getAttribute('href') || '';
        }

        getListingAnchorText(anchor) {
            return this.normalizeListingText(anchor && typeof anchor.textContent === 'string' ? anchor.textContent : '');
        }

        isSortableDirectoryQueryHref(href) {
            return /^\?(?:C=[^#]+|sort=[^#]+|order=[^#]+)/i.test(href);
        }

        isParentDirectoryListingAnchor(anchor) {
            const href = this.getListingAnchorHref(anchor).trim();
            const text = this.getListingAnchorText(anchor);

            return href === '../' ||
                text === '../' ||
                text.includes('parent directory') ||
                text.includes('[to parent directory]') ||
                text.includes('[parentdir]');
        }

        getPreferredListingAnchorSelector(doc) {
            if (this.hasListingSelector(doc, 'div#table-list')) {
                return '#table-content a[href]';
            }

            if (this.hasListingSelector(doc, 'nav.breadcrumbs') && this.hasListingSelector(doc, 'table.listing')) {
                return 'table.listing a[href]';
            }

            if (this.hasListingSelector(doc, 'table#listing')) {
                return 'table#listing a[href]';
            }

            if (this.hasListingSelector(doc, 'table[summary="Directory Listing"]')) {
                return 'table[summary="Directory Listing"] a[href]';
            }

            if (this.hasListingSelector(doc, 'pre')) {
                return 'pre a[href]';
            }

            return 'a[href]';
        }

        getListingAnchorElements(doc) {
            if (!doc || typeof doc.querySelectorAll !== 'function') {
                return [];
            }

            const anchors = Array.from(doc.querySelectorAll(this.getPreferredListingAnchorSelector(doc)));
            return anchors.length > 0 ? anchors : Array.from(doc.querySelectorAll('a[href]'));
        }

        getDirectoryListingTitleMarkers(doc) {
            const candidates = [
                doc && doc.title,
                this.getListingSelectorText(doc, 'h1'),
                this.getListingSelectorText(doc, 'h2')
            ];

            return candidates.reduce((markers, value) => {
                const normalizedValue = this.normalizeListingText(value);

                if (normalizedValue.includes('index of')) {
                    markers.hasIndexOf = true;
                }

                if (normalizedValue.includes('directory listing')) {
                    markers.hasDirectoryListing = true;
                }

                return markers;
            }, {
                hasIndexOf: false,
                hasDirectoryListing: false
            });
        }

        getDirectoryListingSignalCounts(
            doc,
            baseUrl = window.location && window.location.href ? window.location.href : ''
        ) {
            const counts = {
                anchorCount: 0,
                relativeCandidateCount: 0,
                directoryCandidateCount: 0,
                fileCandidateCount: 0,
                parentLinkCount: 0,
                sortableQueryCount: 0
            };

            const anchors = this.getListingAnchorElements(doc);
            counts.anchorCount = anchors.length;

            anchors.forEach(anchor => {
                const href = this.getListingAnchorHref(anchor).trim();

                if (this.isParentDirectoryListingAnchor(anchor)) {
                    counts.parentLinkCount++;
                    return;
                }

                if (this.isSortableDirectoryQueryHref(href)) {
                    counts.sortableQueryCount++;
                    return;
                }

                const normalizedHref = this.normalizeListingCandidateHref(href, baseUrl);
                if (!normalizedHref) {
                    return;
                }

                counts.relativeCandidateCount++;

                if (normalizedHref.endsWith('/')) {
                    counts.directoryCandidateCount++;
                    return;
                }

                counts.fileCandidateCount++;
            });

            return counts;
        }

        hasGenericDirectoryListingMarkers(doc) {
            const documentText = this.getListingDocumentText(doc);

            return documentText.includes('parent directory') ||
                documentText.includes('[to parent directory]') ||
                documentText.includes('[parentdir]');
        }

        hasExplicitDirectoryListingSignals(titleMarkers, signalCounts, hasGenericMarkers) {
            return titleMarkers.hasIndexOf ||
                hasGenericMarkers ||
                signalCounts.parentLinkCount > 0 ||
                signalCounts.sortableQueryCount > 0;
        }

        getDirectoryListingSupport(
            doc,
            baseUrl = window.location && window.location.href ? window.location.href : ''
        ) {
            const titleMarkers = this.getDirectoryListingTitleMarkers(doc);
            const signalCounts = this.getDirectoryListingSignalCounts(doc, baseUrl);
            const hasGenericMarkers = this.hasGenericDirectoryListingMarkers(doc);
            const hasLiteSpeedStructure = this.hasListingSelector(doc, 'div#table-list') &&
                signalCounts.relativeCandidateCount >= 1;
            const hasCaddyStructure = this.hasListingSelector(doc, 'nav.breadcrumbs') &&
                this.hasListingSelector(doc, 'table.listing') &&
                signalCounts.relativeCandidateCount >= 1;
            const hasStructuredTable = (
                this.hasListingSelector(doc, 'table#listing') ||
                this.hasListingSelector(doc, 'table[summary="Directory Listing"]')
            ) && signalCounts.relativeCandidateCount >= 1;
            const hasLinkStructure = signalCounts.relativeCandidateCount >= 1 && (
                signalCounts.parentLinkCount > 0 ||
                signalCounts.sortableQueryCount > 0 ||
                signalCounts.directoryCandidateCount > 0
            );
            const hasExplicitSignals = this.hasExplicitDirectoryListingSignals(
                titleMarkers,
                signalCounts,
                hasGenericMarkers
            );
            const hasPreListing = this.hasListingSelector(doc, 'pre') &&
                signalCounts.relativeCandidateCount >= 1 &&
                hasExplicitSignals;

            let score = 0;

            if (titleMarkers.hasIndexOf) {
                score += 3;
            }

            if (titleMarkers.hasDirectoryListing) {
                score += 2;
            }

            if (hasGenericMarkers) {
                score += 2;
            }

            if (signalCounts.parentLinkCount > 0) {
                score += 2;
            }

            if (signalCounts.sortableQueryCount > 0) {
                score += 1;
            }

            if (signalCounts.relativeCandidateCount >= 2) {
                score += 2;
            } else if (signalCounts.relativeCandidateCount === 1) {
                score += 1;
            }

            if (signalCounts.directoryCandidateCount > 0) {
                score += 1;
            }

            if (signalCounts.fileCandidateCount > 0) {
                score += 1;
            }

            if (hasPreListing) {
                score += 2;
            }

            const isSmallBareIndex = titleMarkers.hasIndexOf &&
                signalCounts.relativeCandidateCount >= 1 &&
                signalCounts.anchorCount === signalCounts.relativeCandidateCount &&
                signalCounts.anchorCount <= 5;

            return {
                supported: hasLiteSpeedStructure ||
                    hasCaddyStructure ||
                    hasStructuredTable ||
                    (
                        signalCounts.relativeCandidateCount >= 1 && (
                            (
                                hasExplicitSignals &&
                                score >= 6
                            ) ||
                            (hasGenericMarkers && hasLinkStructure) ||
                            isSmallBareIndex
                        )
                    ),
                score
            };
        }

        normalizeListingCandidateHref(
            href,
            baseUrl = window.location && window.location.href ? window.location.href : ''
        ) {
            const normalizedHref = typeof href === 'string' ? href.trim() : '';

            if (
                !normalizedHref ||
                normalizedHref === '../' ||
                normalizedHref.startsWith('?') ||
                normalizedHref.startsWith('#') ||
                normalizedHref.startsWith('//') ||
                /^[a-z]+:/i.test(normalizedHref)
            ) {
                return '';
            }

            if (!normalizedHref.startsWith('/') || !baseUrl) {
                return normalizedHref;
            }

            try {
                const directoryUrl = new URL(baseUrl);
                const candidateUrl = new URL(normalizedHref, directoryUrl.href);
                const directoryPath = directoryUrl.pathname.endsWith('/') ? directoryUrl.pathname : `${directoryUrl.pathname}/`;

                if (candidateUrl.origin !== directoryUrl.origin || !candidateUrl.pathname.startsWith(directoryPath)) {
                    return '';
                }

                return candidateUrl.pathname.slice(directoryPath.length);
            } catch (error) {
                return '';
            }
        }

        parseDirectoryDocument(html) {
            const parser = this.domParser || new DOMParser();
            return parser.parseFromString(html, 'text/html');
        }

        extractCandidateHrefsFromAnchors(
            anchors,
            baseUrl = window.location && window.location.href ? window.location.href : ''
        ) {
            const hrefs = [];
            const seenHrefs = new Set();

            anchors.forEach(anchor => {
                if (this.isParentDirectoryListingAnchor(anchor)) {
                    return;
                }

                const href = this.normalizeListingCandidateHref(this.getListingAnchorHref(anchor), baseUrl);
                if (!href || seenHrefs.has(href)) {
                    return;
                }

                seenHrefs.add(href);
                hrefs.push(href);
            });

            return hrefs;
        }

        extractLiteSpeedHrefs(doc, baseUrl = window.location && window.location.href ? window.location.href : '') {
            return this.extractCandidateHrefsFromAnchors(
                Array.from(doc.querySelectorAll('#table-content a[href]')),
                baseUrl
            );
        }

        extractGenericListingHrefs(doc, baseUrl = window.location && window.location.href ? window.location.href : '') {
            return this.extractCandidateHrefsFromAnchors(this.getListingAnchorElements(doc), baseUrl);
        }

        extractDirectoryHrefsFromDocument(
            doc,
            baseUrl = window.location && window.location.href ? window.location.href : ''
        ) {
            const listingSupport = this.getDirectoryListingSupport(doc, baseUrl);
            if (!listingSupport.supported) {
                return [];
            }

            if (this.hasListingSelector(doc, 'div#table-list')) {
                return this.extractLiteSpeedHrefs(doc, baseUrl);
            }

            return this.extractGenericListingHrefs(doc, baseUrl);
        }

        extractDirectoryHrefs(html, baseUrl = window.location && window.location.href ? window.location.href : '') {
            return this.extractDirectoryHrefsFromDocument(this.parseDirectoryDocument(html), baseUrl);
        }

        splitDirectoryAndFileHrefs(hrefs) {
            const directories = [];
            const files = [];

            for (const href of hrefs) {
                if (href.endsWith('/')) {
                    directories.push(href);
                } else {
                    files.push(href);
                }
            }

            return { directories, files };
        }
