(function() {
    'use strict';

    function normalizeListingText(value) {
        return typeof value === 'string' ? value.trim().toLowerCase() : '';
    }

    function getSelectorText(doc, selector) {
        if (!doc || typeof doc.querySelector !== 'function') {
            return '';
        }

        const element = doc.querySelector(selector);
        return element && typeof element.textContent === 'string' ? element.textContent : '';
    }

    function hasSelector(doc, selector) {
        return Boolean(doc && typeof doc.querySelector === 'function' && doc.querySelector(selector));
    }

    function getAnchorElements(doc, selector = 'a[href]') {
        if (!doc || typeof doc.querySelectorAll !== 'function') {
            return [];
        }

        return Array.from(doc.querySelectorAll(selector));
    }

    function getDocumentText(doc = document) {
        return normalizeListingText(
            doc && doc.body && typeof doc.body.textContent === 'string'
                ? doc.body.textContent
                : ''
        );
    }

    function getDirectoryListingTitleMarkers(doc = document) {
        const candidates = [
            doc && doc.title,
            getSelectorText(doc, 'h1'),
            getSelectorText(doc, 'h2')
        ];

        return candidates.reduce((markers, value) => {
            const normalizedValue = normalizeListingText(value);

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

    function getAnchorHref(anchor) {
        if (!anchor || typeof anchor.getAttribute !== 'function') {
            return '';
        }

        return anchor.getAttribute('href') || '';
    }

    function getAnchorText(anchor) {
        return normalizeListingText(anchor && typeof anchor.textContent === 'string' ? anchor.textContent : '');
    }

    function isSortableDirectoryQueryHref(href) {
        return /^\?(?:C=[^#]+|sort=[^#]+|order=[^#]+)/i.test(href);
    }

    function isParentDirectoryAnchor(anchor) {
        const href = getAnchorHref(anchor).trim();
        const text = getAnchorText(anchor);

        return href === '../' ||
            text === '../' ||
            text.includes('parent directory') ||
            text.includes('[to parent directory]') ||
            text.includes('[parentdir]');
    }

    function normalizeDirectoryCandidateHref(
        href,
        baseHref = window.location && window.location.href ? window.location.href : ''
    ) {
        const normalizedHref = typeof href === 'string' ? href.trim() : '';

        return Boolean(normalizedHref) &&
            normalizedHref !== '../' &&
            !normalizedHref.startsWith('?') &&
            !normalizedHref.startsWith('#') &&
            !normalizedHref.startsWith('//') &&
            !/^[a-z]+:/i.test(normalizedHref)
            ? (() => {
                if (!normalizedHref.startsWith('/')) {
                    return normalizedHref;
                }

                try {
                    const baseUrl = new URL(baseHref);
                    const candidateUrl = new URL(normalizedHref, baseUrl.href);
                    const basePath = baseUrl.pathname.endsWith('/') ? baseUrl.pathname : `${baseUrl.pathname}/`;

                    if (candidateUrl.origin !== baseUrl.origin || !candidateUrl.pathname.startsWith(basePath)) {
                        return '';
                    }

                    return candidateUrl.pathname.slice(basePath.length);
                } catch (error) {
                    return '';
                }
            })()
            : '';
    }

    function isRelativeDirectoryCandidateHref(
        href,
        baseHref = window.location && window.location.href ? window.location.href : ''
    ) {
        return Boolean(normalizeDirectoryCandidateHref(href, baseHref));
    }

    function getPreferredListingAnchorSelector(doc = document) {
        if (hasSelector(doc, 'div#table-list')) {
            return '#table-content a[href]';
        }

        if (hasSelector(doc, 'nav.breadcrumbs') && hasSelector(doc, 'table.listing')) {
            return 'table.listing a[href]';
        }

        if (hasSelector(doc, 'table#listing')) {
            return 'table#listing a[href]';
        }

        if (hasSelector(doc, 'table[summary="Directory Listing"]')) {
            return 'table[summary="Directory Listing"] a[href]';
        }

        if (hasSelector(doc, 'pre')) {
            return 'pre a[href]';
        }

        return 'a[href]';
    }

    function getDirectoryListingAnchors(doc = document) {
        const anchors = getAnchorElements(doc, getPreferredListingAnchorSelector(doc));
        return anchors.length > 0 ? anchors : getAnchorElements(doc, 'a[href]');
    }

    function getDirectoryListingSignalCounts(
        doc = document,
        baseHref = window.location && window.location.href ? window.location.href : ''
    ) {
        const counts = {
            anchorCount: 0,
            relativeCandidateCount: 0,
            directoryCandidateCount: 0,
            fileCandidateCount: 0,
            parentLinkCount: 0,
            sortableQueryCount: 0
        };

        const anchors = getDirectoryListingAnchors(doc);
        counts.anchorCount = anchors.length;

        anchors.forEach(anchor => {
            const href = getAnchorHref(anchor).trim();

            if (isParentDirectoryAnchor(anchor)) {
                counts.parentLinkCount++;
                return;
            }

            if (isSortableDirectoryQueryHref(href)) {
                counts.sortableQueryCount++;
                return;
            }

            const normalizedHref = normalizeDirectoryCandidateHref(href, baseHref);
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

    function hasDirectoryListingLinkStructure(
        doc = document,
        baseHref = window.location && window.location.href ? window.location.href : ''
    ) {
        const signalCounts = getDirectoryListingSignalCounts(doc, baseHref);

        return signalCounts.relativeCandidateCount >= 1 && (
            signalCounts.parentLinkCount > 0 ||
            signalCounts.sortableQueryCount > 0 ||
            signalCounts.directoryCandidateCount > 0
        );
    }

    function hasGenericDirectoryListingMarkers(doc = document) {
        const documentText = getDocumentText(doc);

        return documentText.includes('parent directory') ||
            documentText.includes('[to parent directory]') ||
            documentText.includes('[parentdir]');
    }

    function hasExplicitDirectoryListingSignals(titleMarkers, signalCounts, hasGenericMarkers) {
        return titleMarkers.hasIndexOf ||
            hasGenericMarkers ||
            signalCounts.parentLinkCount > 0 ||
            signalCounts.sortableQueryCount > 0;
    }

    function getDirectoryListingSupport(
        doc = document,
        baseHref = window.location && window.location.href ? window.location.href : ''
    ) {
        if (!doc || typeof doc.querySelector !== 'function') {
            return {
                supported: false,
                score: 0
            };
        }

        const titleMarkers = getDirectoryListingTitleMarkers(doc);
        const signalCounts = getDirectoryListingSignalCounts(doc, baseHref);
        const hasGenericMarkers = hasGenericDirectoryListingMarkers(doc);
        const hasLiteSpeedStructure = hasSelector(doc, 'div#table-list') && signalCounts.relativeCandidateCount >= 1;
        const hasCaddyStructure = hasSelector(doc, 'nav.breadcrumbs') &&
            hasSelector(doc, 'table.listing') &&
            signalCounts.relativeCandidateCount >= 1;
        const hasStructuredTable = (
            hasSelector(doc, 'table#listing') ||
            hasSelector(doc, 'table[summary="Directory Listing"]')
        ) && signalCounts.relativeCandidateCount >= 1;
        const hasLinkStructure = hasDirectoryListingLinkStructure(doc, baseHref);
        const hasExplicitSignals = hasExplicitDirectoryListingSignals(
            titleMarkers,
            signalCounts,
            hasGenericMarkers
        );
        const hasPreListing = hasSelector(doc, 'pre') &&
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
            score,
            signalCounts,
            titleMarkers
        };
    }

    function isSupportedDirectoryListingPage(doc = document) {
        return getDirectoryListingSupport(doc).supported;
    }

    if (!isSupportedDirectoryListingPage()) {
        console.log('This page is not an Index page, M3Unator disabled.');
        return;
    }

    function parseLiteSpeedDirectory() {
        const links = [];
        const anchors = getAnchorElements(document, '#table-content a[href]');
        
        anchors.forEach(anchor => {
            const href = normalizeDirectoryCandidateHref(getAnchorHref(anchor));
            if (!isParentDirectoryAnchor(anchor) && href) {
                links.push(new URL(href, window.location.href).href);
            }
        });
        
        return links;
    }

    // Add LiteSpeed support to the existing getDirectoryLinks function
    function getDirectoryLinks() {
        const links = [];
        
        // LiteSpeed directory listing
        if (document.querySelector('div#table-list')) {
            return parseLiteSpeedDirectory();
        }
        
        // Apache/Nginx style directory listing
        const anchors = getDirectoryListingAnchors(document);
        anchors.forEach(anchor => {
            const href = normalizeDirectoryCandidateHref(getAnchorHref(anchor));
            if (!isParentDirectoryAnchor(anchor) && href) {
                links.push(new URL(href, window.location.href).href);
            }
        });
        
        return links;
    }

