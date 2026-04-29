// ==UserScript==
// @name         M3Unator - Web Directory Playlist Creator
// @namespace    https://github.com/hasanbeder/M3Unator
// @version      1.1.0
// @description  Create M3U/M3U8 playlists from directory listing pages. Automatically finds video and audio files in web server indexes with optional IPTV group titles.
// @author       Hasan Beder
// @license      GPL-3.0
// @match        *://*/*
// @grant        GM_addStyle
// @icon         data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmNWMyZTciIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWdvbiBwb2ludHM9IjIzIDcgMTYgMTIgMjMgMTcgMjMgNyIvPjxyZWN0IHg9IjEiIHk9IjUiIHdpZHRoPSIxNSIgaGVpZ2h0PSIxNCIgcng9IjIiIHJ5PSIyIi8+PC9zdmc+
// @homepageURL  https://github.com/hasanbeder/M3Unator
// @supportURL   https://github.com/hasanbeder/M3Unator/issues
// @downloadURL  https://raw.githubusercontent.com/hasanbeder/M3Unator/main/M3Unator.user.js
// @updateURL    https://raw.githubusercontent.com/hasanbeder/M3Unator/main/M3Unator.meta.js
// @run-at       document-end
// @noframes     true
// ==/UserScript==

(function () {
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
            doc && doc.body && typeof doc.body.textContent === 'string' ? doc.body.textContent : ''
        );
    }

    function getDirectoryListingTitleMarkers(doc = document) {
        const candidates = [doc && doc.title, getSelectorText(doc, 'h1'), getSelectorText(doc, 'h2')];

        return candidates.reduce(
            (markers, value) => {
                const normalizedValue = normalizeListingText(value);

                if (normalizedValue.includes('index of')) {
                    markers.hasIndexOf = true;
                }

                if (normalizedValue.includes('directory listing')) {
                    markers.hasDirectoryListing = true;
                }

                return markers;
            },
            {
                hasIndexOf: false,
                hasDirectoryListing: false
            }
        );
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

        return (
            href === '../' ||
            text === '../' ||
            text.includes('parent directory') ||
            text.includes('[to parent directory]') ||
            text.includes('[parentdir]')
        );
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
                  } catch (_error) {
                      return '';
                  }
              })()
            : '';
    }

    // eslint-disable-next-line no-unused-vars -- exported by the startup helper test harness
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

        return (
            signalCounts.relativeCandidateCount >= 1 &&
            (signalCounts.parentLinkCount > 0 ||
                signalCounts.sortableQueryCount > 0 ||
                signalCounts.directoryCandidateCount > 0)
        );
    }

    function hasGenericDirectoryListingMarkers(doc = document) {
        const documentText = getDocumentText(doc);

        return (
            documentText.includes('parent directory') ||
            documentText.includes('[to parent directory]') ||
            documentText.includes('[parentdir]')
        );
    }

    function hasExplicitDirectoryListingSignals(titleMarkers, signalCounts, hasGenericMarkers) {
        return (
            titleMarkers.hasIndexOf ||
            hasGenericMarkers ||
            signalCounts.parentLinkCount > 0 ||
            signalCounts.sortableQueryCount > 0
        );
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
        const hasCaddyStructure =
            hasSelector(doc, 'nav.breadcrumbs') &&
            hasSelector(doc, 'table.listing') &&
            signalCounts.relativeCandidateCount >= 1;
        const hasStructuredTable =
            (hasSelector(doc, 'table#listing') || hasSelector(doc, 'table[summary="Directory Listing"]')) &&
            signalCounts.relativeCandidateCount >= 1;
        const hasLinkStructure = hasDirectoryListingLinkStructure(doc, baseHref);
        const hasExplicitSignals = hasExplicitDirectoryListingSignals(titleMarkers, signalCounts, hasGenericMarkers);
        const hasPreListing = hasSelector(doc, 'pre') && signalCounts.relativeCandidateCount >= 1 && hasExplicitSignals;

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

        const isSmallBareIndex =
            titleMarkers.hasIndexOf &&
            signalCounts.relativeCandidateCount >= 1 &&
            signalCounts.anchorCount === signalCounts.relativeCandidateCount &&
            signalCounts.anchorCount <= 5;

        return {
            supported:
                hasLiteSpeedStructure ||
                hasCaddyStructure ||
                hasStructuredTable ||
                (signalCounts.relativeCandidateCount >= 1 &&
                    ((hasExplicitSignals && score >= 6) ||
                        (hasGenericMarkers && hasLinkStructure) ||
                        isSmallBareIndex)),
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

    // eslint-disable-next-line no-unused-vars -- exported by the startup helper test harness
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

    GM_addStyle(`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        [class^="M3Unator"] {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
        }

        .M3Unator-title {
            font-weight: 700;
            letter-spacing: -0.02em;
        }

        .M3Unator-input-group label {
            font-weight: 500;
            letter-spacing: -0.01em;
        }

        .M3Unator-input {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
            font-size: 0.9375rem;
            letter-spacing: -0.01em;
        }

        .M3Unator-button {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
            font-weight: 600;
            letter-spacing: -0.01em;
        }

        .M3Unator-control-btn {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
            font-weight: 500;
            letter-spacing: -0.01em;
        }

        .M3Unator-log {
            font-family: 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;
            font-size: 0.8125rem;
            letter-spacing: -0.01em;
            line-height: 1.5;
        }

        .M3Unator-log-counter {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
            font-weight: 600;
            letter-spacing: -0.01em;
        }

        .M3Unator-container {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.75);
            backdrop-filter: blur(8px);
            display: none;
            place-items: center;
            padding: 1rem;
            z-index: 9999;
        }

        .M3Unator-container[data-visible="true"] {
            display: grid;
        }

        .M3Unator-overlay {
            position: fixed;
            inset: 0;
            background: transparent;
            z-index: 9998;
        }

        body.modal-open {
            overflow: hidden;
            pointer-events: none; /* Prevent background clicks */
        }

        body.modal-open .M3Unator-container,
        body.modal-open .M3Unator-popup {
            pointer-events: all; /* Allow clicks on modal content */
        }

        .M3Unator-popup {
            background: #1e1e2e;
            color: #cdd6f4;
            width: 100%;
            max-width: 480px;
            max-height: calc(100vh - 2rem);
            border-radius: 12px;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(69, 71, 90, 0.6);
            overflow-x: hidden;
            overflow-y: auto;
            animation: slideUp 0.3s ease;
            position: absolute;
        }

        .M3Unator-header {
            padding: 0.75rem;
            background: none;
            color: #cdd6f4;
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: move;
            user-select: none;
            gap: 0.75rem;
            border-bottom: 1px solid rgba(69, 71, 90, 0.6);
        }

        .M3Unator-title {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin: 0;
            font-size: 1.25rem;
            font-weight: 600;
            line-height: 1;
            flex-shrink: 0;
        }

        .M3Unator-title svg {
            width: 24px;
            height: 24px;
            color: #f5c2e7;
            filter: drop-shadow(0 0 8px rgba(245, 194, 231, 0.4));
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-top: 1px;
        }

        .M3Unator-brand-text {
            display: flex;
            align-items: center;
            white-space: nowrap;
            background: linear-gradient(90deg,
                #f5c2e7,
                #cba6f7,
                #89b4fa,
                #a6e3a1,
                #f5c2e7
            );
            background-size: 300% auto;
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: gradient 3s linear infinite;
        }

        .M3Unator-title .M3Unator-brand-text {
            line-height: 24px;
            position: relative;
            padding: 0 0.25rem;
        }

        .M3Unator-close {
            background: rgba(203, 166, 247, 0.1);
            border: none;
            color: #cba6f7;
            width: 32px;
            height: 32px;
            border-radius: 8px;
            display: grid;
            place-items: center;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .M3Unator-close:hover {
            background: rgba(203, 166, 247, 0.2);
            transform: rotate(360deg);
        }

        .M3Unator-close svg {
            width: 18px;
            height: 18px;
        }

        .M3Unator-content {
            padding: 0.75rem;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            max-width: 100%;
            overflow: hidden;
        }

        .M3Unator-input-group {
            margin-bottom: 0;
        }

        .M3Unator-input-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: #bac2de;
        }

        .M3Unator-visually-hidden {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }

        .M3Unator-input {
            width: 100%;
            height: 42px;
            padding: 8px 80px 8px 12px;
            border: 1px solid rgba(69, 71, 90, 0.6);
            border-radius: 6px;
            background: rgba(30, 30, 46, 0.6);
            color: #f5c2e7;
            font-size: 14px;
            transition: all 0.2s ease;
            box-sizing: border-box;
        }

        .M3Unator-input:focus {
            outline: none;
            border-color: #f5c2e7;
            box-shadow: 0 0 0 2px rgba(245, 194, 231, 0.1);
        }

        .M3Unator-popup button:focus-visible,
        .M3Unator-popup label.M3Unator-inline-switch:focus-visible,
        .M3Unator-social a:focus-visible,
        .M3Unator-social button:focus-visible,
        .M3Unator-launcher:focus-visible {
            outline: none;
            box-shadow: 0 0 0 2px rgba(137, 180, 250, 0.4);
        }

        .M3Unator-popup button:focus:not(:focus-visible),
        .M3Unator-social a:focus:not(:focus-visible),
        .M3Unator-social button:focus:not(:focus-visible),
        .M3Unator-launcher:focus:not(:focus-visible) {
            outline: none;
        }

        .M3Unator-input::placeholder {
            color: #6c7086;
            opacity: 1;
        }

        .M3Unator-toggle-container {
            position: relative;
            display: flex;
            align-items: center;
        }

        .M3Unator-toggle-container label {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
        }

        .M3Unator-toggle-container input[type="checkbox"] {
            position: absolute;
            opacity: 0;
            pointer-events: none;
        }

        .M3Unator-toggle-container span {
            width: 64px;
            height: 64px;
            background: #1e1e2e;
            border: 2px solid #45475a;
            border-radius: 16px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .M3Unator-toggle-container span:hover {
            background: #313244;
            border-color: #585b70;
            transform: translateY(-2px);
        }

        .M3Unator-toggle-container span:active {
            transform: translateY(0);
        }

        .M3Unator-toggle-container svg {
            width: 32px;
            height: 32px;
            opacity: 0.7;
            transition: all 0.3s ease;
        }

        .M3Unator-toggle-container input[type="checkbox"]:checked + span {
            background: rgba(203, 166, 247, 0.1);
            border-color: #cba6f7;
            box-shadow: 0 0 20px rgba(203, 166, 247, 0.2);
            transform: translateY(-2px);
        }

        .M3Unator-toggle-container input[type="checkbox"]:checked + span:hover {
            background: rgba(203, 166, 247, 0.16);
        }

        .M3Unator-toggle-container input[type="checkbox"]:checked + span svg {
            opacity: 1;
            color: #cba6f7;
        }

        .M3Unator-toggle-container input[type="checkbox"]:focus-visible + span {
            box-shadow: 0 0 0 2px rgba(137, 180, 250, 0.28), 0 0 20px rgba(203, 166, 247, 0.12);
        }

        .M3Unator-toggle-group {
            margin: 0;
            display: flex;
            gap: 0.75rem;
            justify-content: center;
            background: rgba(30, 30, 46, 0.4);
            padding: 0.75rem;
            border-radius: 12px;
            backdrop-filter: blur(8px);
            position: relative;
        }

        .M3Unator-group-title-trigger {
            flex: 0 0 auto;
            align-self: center;
            width: 32px;
            height: 32px;
            border: none;
            border-radius: 6px;
            background: transparent;
            color: #6c7086;
            cursor: pointer;
            display: none;
            place-items: center;
            padding: 0;
            margin-left: 4px;
            transition: color 0.18s ease, background 0.18s ease;
            z-index: 10;
        }

        .M3Unator-group-title-trigger.is-visible {
            display: grid;
        }

        .M3Unator-group-title-trigger svg {
            width: 16px;
            height: 16px;
        }

        .M3Unator-group-title-trigger:hover {
            color: #cdd6f4;
            background: rgba(205, 214, 244, 0.08);
        }

        .M3Unator-group-title-trigger.active {
            color: #89d8eb;
            background: rgba(137, 220, 235, 0.12);
        }

        .M3Unator-group-title-inline {
            flex: 0 0 auto;
            max-width: 0;
            opacity: 0;
            overflow: hidden;
            transition: max-width 0.25s ease, opacity 0.2s ease, margin 0.25s ease;
            margin-left: 0;
        }

        .M3Unator-group-title-inline.is-visible {
            max-width: 180px;
            opacity: 1;
            margin-left: 6px;
        }

        .M3Unator-group-title-inline .M3Unator-group-title-input {
            height: 36px;
            min-height: 36px;
            font-size: 0.82rem;
        }

        .M3Unator-generate-row {
            position: relative;
        }

        .M3Unator-generate-row .M3Unator-button {
            padding-right: 60px;
        }

        .M3Unator-toggle-aggressive input[type="checkbox"]:checked + span {
            background: rgba(243, 139, 168, 0.12);
            border-color: #f38ba8;
            box-shadow: 0 0 20px rgba(243, 139, 168, 0.2);
        }

        .M3Unator-toggle-aggressive input[type="checkbox"]:checked + span:hover {
            background: rgba(243, 139, 168, 0.18);
        }

        .M3Unator-toggle-aggressive input[type="checkbox"]:checked + span svg {
            color: #f38ba8;
        }

        .M3Unator-button:hover {
            background: #f7cee9;
            transform: translateY(-1px);
        }

        .M3Unator-button:active {
            transform: translateY(0);
        }

        .M3Unator-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .M3Unator-launcher {
            position: fixed;
            top: 1rem;
            right: 1.618rem;
            height: 48px;
            padding: 0 1rem;
            border-radius: 12px;
            background: rgba(30, 30, 46, 0.85);
            border: 1px solid rgba(245, 194, 231, 0.15);
            cursor: pointer;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
            display: flex;
            align-items: center;
            gap: 0.625rem;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 9998;
            backdrop-filter: blur(8px);
        }

        .M3Unator-launcher:hover {
            background: rgba(30, 30, 46, 0.95);
            border-color: rgba(245, 194, 231, 0.3);
            transform: translateY(-1px);
        }

        .M3Unator-launcher.is-hidden {
            opacity: 0;
            pointer-events: none;
            transform: translateY(-8px);
        }

        .M3Unator-launcher svg {
            width: 20px;
            height: 20px;
            color: #f5c2e7;
        }

        .M3Unator-launcher .M3Unator-brand-text {
            font-weight: 600;
            font-size: 0.95rem;
            line-height: 1;
        }

        .M3Unator-dropdown {
            position: absolute;
            right: 8px;
            top: 50%;
            transform: translateY(-50%);
            width: 70px;
            z-index: 9999;
            display: none;
        }

        .M3Unator-dropdown.is-visible {
            display: block;
        }

        .M3Unator-dropdown-button {
            width: 100%;
            padding: 4px 8px;
            background: rgba(30, 30, 46, 0.8);
            border: 1px solid rgba(69, 71, 90, 0.6);
            border-radius: 6px;
            color: #f5c2e7;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 4px;
            box-sizing: border-box;
        }

        .M3Unator-dropdown-button span {
            min-width: 40px;
            text-align: left;
        }

        .M3Unator-dropdown-button:hover {
            background: rgba(30, 30, 46, 0.9);
            border-color: rgba(69, 71, 90, 0.8);
        }

        .M3Unator-dropdown-button:disabled,
        .M3Unator-dropdown-button:disabled:hover {
            cursor: not-allowed;
            opacity: 0.58;
            background: rgba(30, 30, 46, 0.72);
            border-color: rgba(69, 71, 90, 0.45);
        }

        .M3Unator-dropdown-button svg {
            width: 16px;
            height: 16px;
            min-width: 16px;
            min-height: 16px;
            transition: transform 0.2s ease;
        }

        .M3Unator-dropdown.active .M3Unator-dropdown-button {
            border-color: rgba(69, 71, 90, 0.8);
        }

        .M3Unator-dropdown.active .M3Unator-dropdown-button svg {
            transform: rotate(180deg);
        }

        .M3Unator-dropdown-menu {
            position: absolute;
            top: 100%;
            right: 0;
            width: 100%;
            margin-top: 4px;
            background: rgba(30, 30, 46, 0.95);
            border: 1px solid rgba(69, 71, 90, 0.6);
            border-radius: 6px;
            padding: 4px;
            box-sizing: border-box;
            z-index: 9999;
            display: none;
            user-select: none;
        }

        .M3Unator-dropdown.active .M3Unator-dropdown-menu {
            display: block;
        }

        .M3Unator-dropdown-item {
            padding: 8px 12px;
            color: #cdd6f4;
            cursor: pointer;
            border-radius: 4px;
            transition: all 0.2s ease;
            user-select: none;
            text-align: center;
            font-size: 14px;
            font-family: monospace;
        }

        .M3Unator-dropdown-item:hover {
            background: rgba(203, 166, 247, 0.1);
        }

        .M3Unator-dropdown-item.selected {
            background: rgba(203, 166, 247, 0.1);
            color: #cba6f7;
        }

        .M3Unator-dropdown-divider {
            height: 1px;
            background: rgba(69, 71, 90, 0.6);
            margin: 6px 0;
        }

        @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }

        .M3Unator-log:empty {
            display: none;
        }

        .M3Unator-log-entry.success {
            color: #94e2d5;
        }

        .M3Unator-log-entry.error {
            color: #f38ba8;
        }

        .M3Unator-log-entry.warning {
            color: #fab387;
        }

        .M3Unator-log-counter {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: rgba(245, 194, 231, 0.1);
            color: #f5c2e7;
            padding: 0.25rem 0.75rem;
            border-radius: 8px;
            font-size: 0.875rem;
            font-weight: 500;
            margin-left: 0.75rem;
            min-width: 3rem;
            text-align: center;
        }

        @keyframes gradient {
            0% { background-position: 0% 50%; filter: hue-rotate(0deg); }
            50% { background-position: 100% 50%; filter: hue-rotate(180deg); }
            100% { background-position: 0% 50%; filter: hue-rotate(360deg); }
        }

        .M3Unator-title.scanning .M3Unator-brand-text {
            font-weight: 700;
            letter-spacing: 0.5px;
        }

        .M3Unator-title.scanning .M3Unator-brand-text::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 100%;
            height: 2px;
            background: inherit;
            animation: gradient 3s linear infinite;
        }

        .M3Unator-title.scanning svg {
            animation: morphAnimation 2s ease-in-out infinite;
            filter: drop-shadow(0 0 8px rgba(203, 166, 247, 0.5));
        }

        @keyframes morphAnimation {
            0% {
                transform: scale(1);
                opacity: 1;
            }
            50% {
                transform: scale(1.2);
                opacity: 0.7;
            }
            100% {
                transform: scale(1);
                opacity: 1;
            }
        }

        .M3Unator-control-btn:hover {
            background: #313244;
            transform: translateY(-1px);
        }

        .M3Unator-control-btn:active {
            transform: translateY(1px);
        }

        .M3Unator-control-btn.pause {
            border-color: #fab387;
            color: #fab387;
        }

        .M3Unator-control-btn.pause:hover {
            background: rgba(250, 179, 135, 0.1);
        }

        .M3Unator-control-btn.resume {
            border-color: #94e2d5;
            color: #94e2d5;
        }

        .M3Unator-control-btn.resume:hover {
            background: rgba(148, 226, 213, 0.1);
        }

        .M3Unator-control-btn.cancel {
            border-color: #f38ba8;
            color: #f38ba8;
        }

        .M3Unator-control-btn.cancel:hover {
            background: rgba(243, 139, 168, 0.1);
        }

        .M3Unator-control-btn svg {
            width: 14px;
            height: 14px;
        }

        .M3Unator-button {
            width: 100%;
            padding: 0 1rem;
            background: #f5c2e7;
            color: #11111b;
            border: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 0.875rem;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.375rem;
            height: 48px;
            min-height: 48px;
            line-height: 1;
        }

        .M3Unator-toast-container {
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 999999;
            pointer-events: none;
            display: flex;
            flex-direction: column;
            align-items: center;
            width: auto;
        }

        .M3Unator-toast {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 24px;
            border-radius: 12px;
            margin-bottom: 12px;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            background: rgba(17, 17, 27, 0.95);
            border: 2px solid;
            pointer-events: all;
            min-width: 300px;
            max-width: 500px;
            backdrop-filter: blur(16px);
            will-change: transform, opacity;
            animation: none;
            transform-origin: center bottom;
        }

        .M3Unator-toast.show {
            animation: toastBounceIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }

        .M3Unator-toast.removing {
            animation: toastBounceOut 0.5s cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards;
        }

        @keyframes toastBounceIn {
            0% {
                opacity: 0;
                transform: scale(0.3) translateY(2000px);
            }
            60% {
                opacity: 1;
                transform: scale(1.1) translateY(-20px);
            }
            75% {
                transform: scale(0.95) translateY(10px);
            }
            90% {
                transform: scale(1.02) translateY(-5px);
            }
            100% {
                transform: scale(1) translateY(0);
            }
        }

        @keyframes toastBounceOut {
            0% {
                transform: scale(1) translateY(0);
                opacity: 1;
            }
            20% {
                transform: scale(1.1) translateY(-20px);
                opacity: 0.8;
            }
            100% {
                transform: scale(0.3) translateY(2000px);
                opacity: 0;
            }
        }

        .M3Unator-toast svg {
            width: 20px;
            height: 20px;
            flex-shrink: 0;
            filter: drop-shadow(0 0 4px currentColor);
            animation: iconPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            opacity: 0;
            transform: scale(0.5);
        }

        @keyframes iconPop {
            0% {
                opacity: 0;
                transform: scale(0.5) rotate(-180deg);
            }
            100% {
                opacity: 1;
                transform: scale(1) rotate(0deg);
            }
        }

        .M3Unator-toast span {
            opacity: 0;
            transform: translateX(-10px);
            animation: textSlide 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            animation-delay: 0.15s;
        }

        @keyframes textSlide {
            0% {
                opacity: 0;
                transform: translateX(-10px);
            }
            100% {
                opacity: 1;
                transform: translateX(0);
            }
        }

        .M3Unator-input-row {
            display: flex;
            width: 100%;
            position: relative;
            max-width: 100%;
            overflow: visible;
            margin-bottom: 0;
        }

        .M3Unator-input-row .M3Unator-input-group {
            flex: 1;
            min-width: 0;
            position: relative;
            margin-bottom: 0;
        }

        .M3Unator-format-group {
            min-width: 0;
            max-width: none;
        }

        .M3Unator-social {
            display: flex;
            gap: 8px;
            margin-right: 8px;
        }

        .M3Unator-social a,
        .M3Unator-social button {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            display: grid;
            place-items: center;
            color: #cdd6f4;
            background: rgba(205, 214, 244, 0.1);
            border: none;
            padding: 0;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .M3Unator-social a:hover,
        .M3Unator-social button:hover {
            background: rgba(205, 214, 244, 0.2);
            transform: rotate(360deg);
        }

        .M3Unator-social svg {
            width: 18px;
            height: 18px;
        }

        .M3Unator-header-actions {
            display: flex;
            align-items: center;
            gap: 0;
            flex-shrink: 0;
        }

        .M3Unator-header-link {
            height: 32px;
            padding: 0 0.75rem;
            border-radius: 8px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: #bac2de;
            background: rgba(148, 163, 184, 0.08);
            border: 1px solid rgba(69, 71, 90, 0.7);
            text-decoration: none;
            font-size: 0.75rem;
            font-weight: 600;
            transition: all 0.2s ease;
        }

        .M3Unator-header-link:hover {
            color: #f5f7ff;
            background: rgba(137, 180, 250, 0.1);
            border-color: rgba(137, 180, 250, 0.28);
        }

        .M3Unator-header-link.info-link {
            border: 1px solid rgba(69, 71, 90, 0.7);
            cursor: pointer;
            font-family: inherit;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .M3Unator-depth-input {
            position: relative;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-top: 0.5rem;
        }

        .M3Unator-depth-input input[type="number"] {
            width: 64px;
            padding: 0.25rem 0.375rem;
            border: 1px solid #45475a;
            border-radius: 4px;
            background: rgba(30, 30, 46, 0.8);
            color: #cdd6f4;
            font-size: 0.875rem;
            text-align: center;
            margin: 0 0 0 0.5rem;
        }

        .M3Unator-depth-input input[type="number"]:focus {
            outline: none;
            border-color: #cba6f7;
            box-shadow: 0 0 0 2px rgba(203, 166, 247, 0.2);
        }

        .M3Unator-depth-input input[type="number"]::-webkit-inner-spin-button {
            opacity: 1;
            background: #313244;
            border-left: 1px solid #45475a;
            border-radius: 0 4px 4px 0;
            cursor: pointer;
        }

        .M3Unator-depth-toggle {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem;
            background: #1e1e2e;
            border: 1px solid #45475a;
            border-radius: 6px;
            color: #cdd6f4;
            font-size: 0.875rem;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .M3Unator-depth-toggle:hover {
            background: #313244;
            border-color: #cba6f7;
        }

        .M3Unator-depth-toggle.active {
            background: rgba(203, 166, 247, 0.1);
            border-color: #cba6f7;
            color: #cba6f7;
        }

        .M3Unator-stats-bar {
            margin: 0;
            padding: 0.5rem;
            background: rgba(30, 30, 46, 0.5);
            border: 1px solid #313244;
            border-radius: 8px;
            display: none;
        }

        .M3Unator-stats-bar.active {
            display: block;
        }

        .M3Unator-stats {
            display: flex;
            align-items: center;
            justify-content: space-around;
            gap: 0.382rem;
            padding: 0.25rem;
        }

        .M3Unator-stat {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            font-size: 0.75rem;
            color: #cdd6f4;
            cursor: help;
            min-width: 40px;
            justify-content: flex-start;
            padding: 0 0.25rem;
            line-height: 1;
        }

        .M3Unator-stat svg {
            opacity: 0.8;
            width: 14px;
            height: 14px;
            flex-shrink: 0;
        }

        .M3Unator-stat-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 14px;
            flex: 0 0 14px;
        }

        .M3Unator-stat-value {
            font-variant-numeric: tabular-nums;
            line-height: 1;
            font-size: 0.7rem;
            font-weight: 500;
            min-width: 16px;
            display: block;
            text-align: right;
            white-space: nowrap;
        }

        .M3Unator-stat-icon svg {
            width: 14px;
            height: 14px;
        }

        .M3Unator-stat.video {
            color: #94e2d5;
        }

        .M3Unator-stat.audio {
            color: #89b4fa;
        }

        .M3Unator-stat.dir {
            color: #cba6f7;
        }

        .M3Unator-stat.error {
            color: #f38ba8;
        }

        .M3Unator-stat.depth {
            color: #a6e3a1;
            transition: color 0.3s ease;
        }

        .M3Unator-stat.depth[data-progress="high"] {
            color: #f38ba8;
        }

        .M3Unator-stat.depth[data-progress="medium"] {
            color: #fab387;
        }

        .M3Unator-stat.depth[data-progress="low"] {
            color: #f9e2af;
        }

        .M3Unator-stat:hover::after {
            content: attr(title);
            position: absolute;
            bottom: calc(100% + 5px);
            left: 50%;
            transform: translateX(-50%);
            padding: 0.5rem 0.75rem;
            background: rgba(30, 30, 46, 0.95);
            color: #cdd6f4;
            font-size: 0.875rem;
            white-space: nowrap;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            border: 1px solid #313244;
            text-align: center;
            backdrop-filter: blur(8px);
            pointer-events: none;
        }

        .M3Unator-spinner {
            width: 20px;
            height: 20px;
            border: 2px solid rgba(17, 17, 27, 0.3);
            border-radius: 50%;
            border-top-color: #11111b;
            animation: spin 0.6s linear infinite;
            margin-right: 0;
            flex-shrink: 0;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .M3Unator-toast {
            animation: toastSlideUp 0.2s ease forwards;
        }

        .M3Unator-toast.removing {
            animation: toastSlideDown 0.2s ease forwards;
        }

        .M3Unator-popup {
            animation: slideUp 0.2s ease;
        }

        .M3Unator-stats-bar {
            animation: fadeIn 0.2s ease;
        }

        .M3Unator-log {
            transition: max-height 0.3s ease;
        }

        .M3Unator-log.collapsed {
            max-height: 0;
            overflow: hidden;
        }

        .M3Unator-toggle-container span svg .infinity-icon {
            opacity: 0.5;
            transition: opacity 0.2s ease;
            transform: scale(0.6) translateY(4px);
            transform-origin: center;
            stroke-width: 1.5;
        }

        .M3Unator-toggle-container input[type="checkbox"]:checked + span svg .infinity-icon {
            opacity: 1;
        }

        .M3Unator-depth-controls {
            background: rgba(30, 30, 46, 0.4);
            backdrop-filter: blur(8px);
            border: 1px solid #313244;
            border-radius: 8px;
            padding: 0.618rem;
            margin-top: 1rem;
            display: none;
        }

        .M3Unator-depth-controls.active {
            display: block;
        }

        .M3Unator-radio-group {
            display: flex;
            gap: 0.75rem;
            justify-content: center;
            background: rgba(30, 30, 46, 0.6);
            padding: 0.5rem;
            border-radius: 6px;
        }

        .M3Unator-radio {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 4px;
            transition: all 0.2s ease;
            background: transparent;
            border: 1px solid transparent;
        }

        .M3Unator-radio:hover {
            background: rgba(203, 166, 247, 0.1);
        }

        .M3Unator-radio input[type="radio"] {
            display: none;
        }

        .M3Unator-radio .radio-mark {
            width: 16px;
            height: 16px;
            border: 1.5px solid #45475a;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            flex-shrink: 0;
            background: rgba(30, 30, 46, 0.6);
            position: relative;
        }

        .M3Unator-radio input[type="radio"]:checked + .radio-mark {
            border-color: #cba6f7;
            background: rgba(203, 166, 247, 0.1);
        }

        .M3Unator-radio input[type="radio"]:checked + .radio-mark::after {
            content: '';
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #cba6f7;
            position: absolute;
        }

        .M3Unator-depth-input {
            width: 64px;
            padding: 0.25rem 0.375rem;
            border: 1px solid #45475a;
            border-radius: 4px;
            background: rgba(30, 30, 46, 0.8);
            color: #cdd6f4;
            font-size: 0.875rem;
            text-align: center;
            transition: all 0.2s ease;
            -moz-appearance: textfield;
            margin-top: -1px;
            display: inline-flex;
            align-items: center;
            height: 28px;
        }

        .M3Unator-depth-input::-webkit-outer-spin-button,
        .M3Unator-depth-input::-webkit-inner-spin-button {
            -webkit-appearance: inner-spin-button;
            opacity: 1;
            background: #313244;
            border-left: 1px solid #45475a;
            border-radius: 0 4px 4px 0;
            cursor: pointer;
            height: 100%;
            position: absolute;
            right: 0;
            top: 0;
        }

        .M3Unator-depth-input:focus {
            outline: none;
            border-color: #cba6f7;
            box-shadow: 0 0 0 2px rgba(203, 166, 247, 0.2);
        }

        .M3Unator-depth-input:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            background: rgba(30, 30, 46, 0.4);
        }

        .M3Unator-radio .radio-label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #cdd6f4;
            font-size: 0.875rem;
            user-select: none;
        }

        .M3Unator-url-container {
            display: flex;
            align-items: center;
            background: rgba(30, 30, 46, 0.6);
            border: 1px solid #313244;
            border-radius: 6px;
            padding: 0.618rem;
            margin-bottom: 1rem;
            transition: all 0.2s ease;
        }

        .M3Unator-url-container:hover {
            border-color: #45475a;
        }

        .M3Unator-url-icon {
            color: #6c7086;
            margin-right: 0.618rem;
            flex-shrink: 0;
        }

        .M3Unator-url-input {
            flex: 1;
            background: transparent;
            border: none;
            color: #cdd6f4;
            font-size: 0.875rem;
            padding: 0;
            margin: 0;
            width: 100%;
        }

        .M3Unator-url-input:focus {
            outline: none;
        }

        .M3Unator-url-copy {
            background: transparent;
            border: none;
            color: #6c7086;
            padding: 0.382rem;
            margin-left: 0.618rem;
            cursor: pointer;
            border-radius: 4px;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .M3Unator-url-copy:hover {
            color: #cdd6f4;
            background: rgba(205, 214, 244, 0.1);
        }

        .M3Unator-url-copy.copied {
            color: #a6e3a1;
            animation: copyPulse 0.3s ease;
        }

        @keyframes copyPulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
        }

        .M3Unator-progress {
            background: rgba(30, 30, 46, 0.6);
            border-radius: 12px;
            padding: 1rem;
            margin: 1rem 0;
            backdrop-filter: blur(8px);
            border: 1px solid rgba(203, 166, 247, 0.2);
        }

        .M3Unator-progress-text {
            color: #f5c2e7;
            font-weight: 600;
            text-align: center;
            margin-bottom: 0.5rem;
            font-size: 1.1rem;
        }

        .M3Unator-progress-spinner {
            width: 24px;
            height: 24px;
            border: 3px solid rgba(245, 194, 231, 0.1);
            border-top-color: #f5c2e7;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto;
        }

        .M3Unator-controls {
            display: flex;
            gap: 0.75rem;
            margin: 0.75rem 0;
            justify-content: center;
        }

        .M3Unator-control-btn {
            display: none;
            padding: 0.75rem 1.5rem;
            border-radius: 12px;
            font-weight: 600;
            font-size: 0.95rem;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            align-items: center;
            gap: 0.75rem;
            min-width: 160px;
            justify-content: center;
            background: rgba(30, 30, 46, 0.6);
            backdrop-filter: blur(8px);
            width: 160px;
        }

        .M3Unator-control-btn.pause {
            background: rgba(250, 179, 135, 0.1);
            border: 2px solid #fab387;
            color: #fab387;
        }

        .M3Unator-control-btn.resume {
            background: rgba(148, 226, 213, 0.1);
            border: 2px solid #94e2d5;
            color: #94e2d5;
        }

        .M3Unator-control-btn.cancel {
            background: rgba(243, 139, 168, 0.1);
            border: 2px solid #f38ba8;
            color: #f38ba8;
        }

        .M3Unator-control-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }

        .M3Unator-control-btn svg {
            width: 20px;
            height: 20px;
        }

        .M3Unator-layers-icon {
            width: 20px;
            height: 20px;
            margin-right: 0.5rem;
        }

        .M3Unator-input:-webkit-autofill,
        .M3Unator-input:-webkit-autofill:hover,
        .M3Unator-input:-webkit-autofill:focus,
        .M3Unator-input:-webkit-autofill:active {
            -webkit-text-fill-color: #cdd6f4 !important;
            -webkit-box-shadow: 0 0 0 30px #1e1e2e inset !important;
            box-shadow: 0 0 0 30px #1e1e2e inset !important;
            background-color: #1e1e2e !important;
            color: #cdd6f4 !important;
            caret-color: #cdd6f4 !important;
            transition: background-color 5000s ease-in-out 0s !important;
            text-decoration: none !important;
            -webkit-text-decoration: none !important;
        }

        .M3Unator-input:-moz-autofill,
        .M3Unator-input:-moz-autofill-preview {
            background-color: #1e1e2e !important;
            color: #cdd6f4 !important;
            text-decoration: none !important;
        }

        .M3Unator-input:-ms-input-placeholder {
            background-color: #1e1e2e !important;
            color: #cdd6f4 !important;
            text-decoration: none !important;
        }

        .M3Unator-log-container {
            margin: 0;
        }

        .M3Unator-log-toggle {
            width: 100%;
            padding: 0.5rem 0.75rem;
            background: rgba(203, 166, 247, 0.05);
            border: none;
            color: #cdd6f4;
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
            font-size: 0.875rem;
            font-weight: 500;
            border-radius: 6px;
        }

        .M3Unator-log-toggle:hover {
            background: rgba(203, 166, 247, 0.1);
        }

        .M3Unator-activity-indicator {
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: #45475a;  /* Darker gray */
            margin-left: auto;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .M3Unator-activity-indicator.active {
            background: #89dceb;  /* Brighter blue */
            box-shadow: 0 0 0 3px rgba(137, 220, 235, 0.2);
            animation: pulseActive 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .M3Unator-activity-indicator.paused {
            background: #f9e2af;  /* More visible yellow */
            box-shadow: 0 0 0 3px rgba(249, 226, 175, 0.2);
        }

        .M3Unator-activity-indicator.error {
            background: #f38ba8;  /* Current red is good */
            box-shadow: 0 0 0 3px rgba(243, 139, 168, 0.2);
        }

        .M3Unator-activity-indicator.completed {
            background: #94e2d5;  /* Brighter green-turquoise */
            box-shadow: 0 0 0 3px rgba(148, 226, 213, 0.2);
        }

        @keyframes pulseActive {
            0% {
                box-shadow: 0 0 0 0 rgba(137, 220, 235, 0.4);
            }
            70% {
                box-shadow: 0 0 0 8px rgba(137, 220, 235, 0);
            }
            100% {
                box-shadow: 0 0 0 0 rgba(137, 220, 235, 0);
            }
        }

        @keyframes pulsePaused {
            0% {
                box-shadow: 0 0 0 0 rgba(249, 226, 175, 0.4);
            }
            70% {
                box-shadow: 0 0 0 8px rgba(249, 226, 175, 0);
            }
            100% {
                box-shadow: 0 0 0 0 rgba(249, 226, 175, 0);
            }
        }

        @keyframes completeScale {
            0% {
                transform: scale(0.8);
                opacity: 0.5;
            }
            50% {
                transform: scale(1.2);
            }
            100% {
                transform: scale(1);
                opacity: 1;
            }
        }

        .M3Unator-log-toggle:hover .M3Unator-activity-indicator {
            transform: scale(1.05);
        }

        .M3Unator-log-toggle.active .M3Unator-activity-indicator {
            transform: scale(1.05);
        }

        .M3Unator-log-toggle .toggle-text {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .M3Unator-log-status {
            display: flex;
            align-items: center;
            gap: 0;
        }

        .M3Unator-log {
            height: 0;
            max-height: 0;
            overflow: hidden;
            transition: all 0.3s ease;
            background: #11111b;
            padding: 0;
            border-top: none;
            margin: 0;
        }

        .M3Unator-log.expanded {
            height: auto;
            max-height: 300px;
            padding: 0.75rem;
            border-top: 1px solid #313244;
            overflow-y: auto;
        }

        .M3Unator-log-entry {
            padding: 0.25rem 0.5rem;
            border-bottom: 1px solid rgba(49, 50, 68, 0.5);
            font-size: 0.875rem;
        }

        .M3Unator-log-entry:last-child {
            border-bottom: none;
        }

        .M3Unator-log-time {
            color: #6c7086;
            margin-right: 0.5rem;
        }

        .M3Unator-log-entry.success {
            color: #94e2d5;
        }

        .M3Unator-log-entry.error {
            color: #f38ba8;
        }

        .M3Unator-log-entry.warning {
            color: #fab387;
        }

        .M3Unator-log-entry.info {
            color: #89b4fa;
        }

        .M3Unator-log-entry.final {
            color: #a6e3a1;
            font-weight: 500;
        }

        .M3Unator-log {
            margin-top: 0.75rem;
            max-height: calc(100vh - 70vh);
            font-size: 0.8125rem;
            line-height: 1.4;
        }

        .M3Unator-log-entry {
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
        }

        .M3Unator-log-toggle {
            padding: 10px 12px;
            height: 42px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .M3Unator-log-counter {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 24px;
            height: 22px;
            padding: 0 6px;
            border-radius: 999px;
            background: rgba(203, 166, 247, 0.14);
            color: #cba6f7;
            font-size: 0.75rem;
        }

        .M3Unator-log-time {
            font-size: 0.75rem;
            opacity: 0.7;
            margin-right: 0.5rem;
        }

        .M3Unator-activity-indicator {
            display: none !important;
        }

        @media (max-width: 560px) {
            .M3Unator-container {
                padding: 0.75rem;
            }

            .M3Unator-popup {
                width: 100%;
                max-width: none;
            }

            .M3Unator-header {
                align-items: center;
            }

            .M3Unator-input-row {
                margin-bottom: 0;
            }

            .M3Unator-stats {
                justify-content: center;
            }

            .M3Unator-toggle-container span {
                width: 48px;
                height: 48px;
                border-radius: 12px;
            }

            .M3Unator-toggle-container svg {
                width: 24px;
                height: 24px;
            }
        }
    `);

    GM_addStyle(`
        /* Info Modal Styles */
        .M3Unator-info-modal {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.75);
            backdrop-filter: blur(8px);
            z-index: 10000;
        }

        .M3Unator-info-modal-content {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #1e1e2e;
            border: 1px solid rgba(69, 71, 90, 0.6);
            border-radius: 12px;
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            color: #cdd6f4;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .M3Unator-info-modal-header {
            padding: 1rem 1.5rem;
            border-bottom: 1px solid #45475a;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .M3Unator-info-modal-header h3 {
            margin: 0;
            color: #f5c2e7;
            font-size: 1.25rem;
        }

        .M3Unator-info-modal-body {
            padding: 2rem;
            line-height: 1.55;
        }

        .M3Unator-info-modal-body p {
            margin: 0 0 1rem;
        }

        .M3Unator-info-modal-body h4 {
            margin: 1.5rem 0 0.75rem;
            color: #f5c2e7;
        }

        .M3Unator-info-modal-body ul {
            margin: 0.75rem 0;
            padding-left: 1.5rem;
        }

        .M3Unator-info-modal-body li {
            margin: 0.5rem 0;
        }

        .M3Unator-info-modal-body a {
            color: #89b4fa;
            text-decoration: none;
        }

        .M3Unator-info-modal-body a:hover {
            text-decoration: underline;
        }

        .M3Unator-info-close {
            background: transparent;
            border: none;
            padding: 0;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: #6c7086;
            transition: color 0.2s ease;
        }

        .info-close:hover {
            color: #f5c2e7;
        }
    `);

    GM_addStyle(`
        .M3Unator-toast.success {
            color: #a6e3a1;
            border-color: #a6e3a1;
            background: linear-gradient(rgba(17, 17, 27, 0.95), rgba(17, 17, 27, 0.95)), rgba(166, 227, 161, 0.1);
        }

        .M3Unator-toast.error {
            color: #f38ba8;
            border-color: #f38ba8;
            background: linear-gradient(rgba(17, 17, 27, 0.95), rgba(17, 17, 27, 0.95)), rgba(243, 139, 168, 0.1);
        }

        .M3Unator-toast.warning {
            color: #fab387;
            border-color: #fab387;
            background: linear-gradient(rgba(17, 17, 27, 0.95), rgba(17, 17, 27, 0.95)), rgba(250, 179, 135, 0.1);
        }
    `);

    class LogCache {
        constructor(maxSize = 100) {
            this.maxSize = maxSize;
            this.logs = [];
            this.stats = {
                nextSequence: 0,
                skippedLogs: 0
            };
        }

        add(message, type = '') {
            const sequence = this.stats.nextSequence + 1;
            const timestamp = new Date().toLocaleTimeString();
            this.logs.push({ message, type, timestamp, sequence });
            this.stats.nextSequence = sequence;

            if (this.logs.length > this.maxSize) {
                this.logs.shift();
                this.stats.skippedLogs++;
            }
        }

        getSummary() {
            return {
                logs: [...this.logs],
                stats: { ...this.stats }
            };
        }

        clear() {
            this.logs = [];
            this.stats.nextSequence = 0;
            this.stats.skippedLogs = 0;
        }
    }

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
            return this.scriptVersion ? `About M3Unator v${this.scriptVersion}` : 'About M3Unator';
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
                '.mp4',
                '.mkv',
                '.avi',
                '.webm',
                '.mov',
                '.flv',
                '.wmv',
                '.m4v',
                '.mpg',
                '.mpeg',
                '.3gp',
                '.vob',
                '.ts',
                '.mts',
                '.m2ts',
                '.divx',
                '.xvid',
                '.asf',
                '.ogv',
                '.rm',
                '.rmvb',
                '.wtv',
                '.qt',
                '.hevc',
                '.f4v',
                '.swf',
                '.vro',
                '.ogx',
                '.drc',
                '.gifv',
                '.mxf',
                '.roq',
                '.nsv'
            ];
        }

        createAudioFormats() {
            return [
                '.mp3',
                '.m4a',
                '.wav',
                '.flac',
                '.aac',
                '.ogg',
                '.wma',
                '.opus',
                '.aiff',
                '.ape',
                '.mka',
                '.ac3',
                '.dts',
                '.m4b',
                '.m4p',
                '.m4r',
                '.mid',
                '.midi',
                '.mp2',
                '.mpa',
                '.mpc',
                '.ra',
                '.tta',
                '.voc',
                '.vox',
                '.amr',
                '.awb',
                '.dsf',
                '.dff',
                '.alac',
                '.wv',
                '.oga',
                '.sln',
                '.aif',
                '.pcm'
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
            this.activeScanPromise = null;
            this.toastQueue = [];
            this.isProcessingToast = false;
        }

        createInitialScanPerformance() {
            const concurrencyConfig = this.getActiveConcurrencyConfig
                ? this.getActiveConcurrencyConfig()
                : this.state.concurrency;

            return {
                currentConcurrency: concurrencyConfig ? concurrencyConfig.start : 4,
                requestSamples: [],
                sampleWindow: 20,
                lastIncreaseAt: 0,
                increaseCooldownMs: 2500,
                lastEventLoopLag: 0,
                rateLimitedUntil: 0
            };
        }

        getActiveConcurrencyConfig() {
            return this.state.aggressiveMode ? this.state.aggressiveConcurrency : this.state.concurrency;
        }

        startScanSession() {
            this.scanAbortController = typeof AbortController === 'function' ? new AbortController() : null;

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
            return status => {
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
                    return this.templates.controlButton(props.type, props.icon, props.text);
                case 'stats':
                    return this.templates.statsItem(props.icon, props.id, props.title, props.class);
                default:
                    return '';
            }
        }

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
                    <div class="M3Unator-info-modal">
                        <div class="M3Unator-info-modal-content">
                            <div class="M3Unator-info-modal-header">
                                <h3>${this.getAboutDialogTitle()}</h3>
                                <button type="button" class="M3Unator-info-close" aria-label="Close About">${this.icons.close}</button>
                            </div>
                            <div class="M3Unator-info-modal-body">
                                <p><strong>Web Directory Playlist Creator</strong></p>
                                <p>Scan supported directory listings for video and audio files, then export <code>.m3u</code> or <code>.m3u8</code> playlists.</p>
                                <h4>Playlist Generation</h4>
                                <ul>
                                    <li>Extended M3U and UTF-8 M3U8 export</li>
                                    <li>Optional IPTV <code>group-title</code> metadata</li>
                                    <li>Readable nested path labels in titles</li>
                                    <li>Duplicate entry prevention across batches</li>
                                </ul>
                                <h4>Media Detection</h4>
                                <ul>
                                    <li>33 video formats (MP4, MKV, MOV, ...)</li>
                                    <li>41 audio formats (MP3, FLAC, M4A, ...)</li>
                                    <li>International filename support via URL decoding</li>
                                </ul>
                                <h4>Directory Scanning</h4>
                                <ul>
                                    <li>Current directory or recursive (depth 1-99)</li>
                                    <li>Adaptive concurrency: 4-12 normal, 6-20 aggressive</li>
                                    <li>Seen-URL deduplication cache</li>
                                    <li>Pause, resume, and cancel controls</li>
                                </ul>
                                <h4>Supported Servers</h4>
                                <ul>
                                    <li>Apache, Nginx, LiteSpeed, Lighttpd, IIS, Caddy</li>
                                </ul>
                                <p>Runs locally in your browser. No data uploaded.</p>
                                <p><a href="https://github.com/hasanbeder/M3Unator" target="_blank" rel="noopener noreferrer">GitHub</a> | <a href="https://greasyfork.org/en/scripts/521593-m3unator-web-directory-playlist-creator" target="_blank" rel="noopener noreferrer">Greasy Fork</a></p>
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
                            <button type="button" class="M3Unator-group-title-trigger" id="groupTitleToggle" title="Add group-title metadata for IPTV players" aria-label="Toggle group title" aria-expanded="false" aria-controls="groupTitlePanel">
                                ${this.icons.tag}
                            </button>
                            <div class="M3Unator-group-title-inline" id="groupTitlePanel" role="region" aria-labelledby="groupTitleToggle" aria-hidden="true">
                                <label for="groupTitle" class="M3Unator-visually-hidden">Group title</label>
                                <input type="text"
                                    id="groupTitle"
                                    class="M3Unator-input M3Unator-group-title-input"
                                    placeholder="Group title"
                                    spellcheck="false"
                                    autocomplete="off"
                                    autocorrect="off"
                                    autocapitalize="off">
                            </div>
                        </div>

                        <div class="M3Unator-toggle-group">
                            ${toggleButtons}
                        </div>

                        <div class="M3Unator-depth-controls">
                            <div class="M3Unator-radio-group">
                                <label class="M3Unator-radio" for="currentDepth">
                                    <input type="radio" name="depthType" value="current" id="currentDepth" aria-label="Current directory only">
                                    <span class="radio-mark"></span>
                                    <span class="radio-label">Current directory</span>
                                </label>
                                <label class="M3Unator-radio" for="customDepth">
                                    <input type="radio" name="depthType" value="custom" id="customDepth" aria-label="Custom scan depth">
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
                                        pattern="[0-9]*"
                                        aria-label="Subdirectory scan depth">
                                </label>
                            </div>
                        </div>

                        <div class="M3Unator-generate-row">
                            <button type="button" class="M3Unator-button" id="generateBtn">
                                ${this.icons.download}
                                <span>Create Playlist</span>
                            </button>
                        </div>

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
                },
                {
                    id: 'aggressiveMode',
                    title: 'Fast mode: up to 20 parallel requests (Safe: up to 12)',
                    label: 'Fast',
                    meta: 'Aggressive scan',
                    icon: this.icons.aggressive,
                    checked: false,
                    className: 'M3Unator-toggle-aggressive'
                }
            ]
                .map(props => this.createComponent('toggle', props))
                .join('');
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
            ]
                .map(props => this.createComponent('control', props))
                .join('');
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
            ]
                .map(props => this.createComponent('stats', props))
                .join('');
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
                infoClose: container.querySelector('.M3Unator-info-close'),
                infoModal: container.querySelector('.M3Unator-info-modal'),
                generateBtn: container.querySelector('#generateBtn'),
                playlistInput: container.querySelector('#playlistName'),
                includeVideo: container.querySelector('#includeVideo'),
                includeAudio: container.querySelector('#includeAudio'),
                recursiveSearch: container.querySelector('#recursiveSearch'),
                aggressiveMode: container.querySelector('#aggressiveMode'),
                groupTitleToggle: container.querySelector('#groupTitleToggle'),
                groupTitlePanel: container.querySelector('#groupTitlePanel'),
                groupTitle: container.querySelector('#groupTitle'),
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
                activityIndicator: container.querySelector('.M3Unator-activity-indicator')
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
            document.addEventListener('keydown', event => {
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
                    this.cancelScheduledLogUiUpdate();
                } else {
                    log.classList.add('expanded');
                    toggle.classList.add('active');
                    this.renderLogEntries(log);
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

            const getPosition = e => {
                return {
                    x: e.type.includes('touch') ? e.touches[0].clientX : e.clientX,
                    y: e.type.includes('touch') ? e.touches[0].clientY : e.clientY
                };
            };

            const dragStart = e => {
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
                    document.addEventListener('mousemove', drag);
                    document.addEventListener('mouseup', dragEnd);
                    document.addEventListener('touchmove', drag, { passive: false });
                    document.addEventListener('touchend', dragEnd);
                }
            };

            const drag = e => {
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
                    document.removeEventListener('mousemove', drag);
                    document.removeEventListener('mouseup', dragEnd);
                    document.removeEventListener('touchmove', drag);
                    document.removeEventListener('touchend', dragEnd);
                }
            };

            handle.addEventListener('mousedown', dragStart);
            handle.addEventListener('touchstart', dragStart, { passive: false });

            window.addEventListener('resize', () => {
                if (!isDragging && element.isConnected) {
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
            const iconSpan = document.createElement('span');
            const safeIcon = Object.prototype.hasOwnProperty.call(this.icons, type)
                ? this.icons[type]
                : this.icons.info;
            iconSpan.innerHTML = safeIcon;
            const messageSpan = document.createElement('span');
            messageSpan.textContent = message;
            toast.appendChild(iconSpan);
            toast.appendChild(messageSpan);
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

            document.addEventListener('click', event => {
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
                    dropdownButton.querySelector('span').textContent =
                        item.dataset.buttonLabel || item.textContent.trim();
                    this.state.selectedFormat = item.dataset.value;
                    this.collapseFormatDropdown(dropdown, dropdownButton);
                });
            });
        }

        bindMediaToggleHandlers(includeVideo, includeAudio) {
            includeVideo.addEventListener('change', event => {
                this.state.includeVideo = event.target.checked;
                this.addLogEntry(
                    event.target.checked ? 'Video files will be included' : 'Video files will not be included',
                    'info'
                );
            });

            includeAudio.addEventListener('change', event => {
                this.state.includeAudio = event.target.checked;
                this.addLogEntry(
                    event.target.checked ? 'Audio files will be included' : 'Audio files will not be included',
                    'info'
                );
            });
        }

        bindAggressiveModeHandler(aggressiveMode) {
            if (!aggressiveMode) {
                return;
            }

            aggressiveMode.addEventListener('change', event => {
                this.state.aggressiveMode = event.target.checked;
                this.addLogEntry(
                    event.target.checked
                        ? 'Aggressive mode enabled: higher parallel scanning with adaptive throttling'
                        : 'Aggressive mode disabled: standard parallel scanning restored',
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
                    isOpen ? 'Group title enabled for single-category exports' : 'Group title disabled',
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
            recursiveSearch.addEventListener('change', event => {
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

            currentDepth.addEventListener('change', event => {
                if (event.target.checked && !recursiveSearch.checked) {
                    this.state.maxDepth = 0;
                    maxDepth.disabled = true;
                    this.addLogEntry('Only current directory will be scanned', 'info');
                }
            });

            customDepth.addEventListener('change', event => {
                if (event.target.checked && !recursiveSearch.checked) {
                    const rawValue = parseInt(maxDepth.value) || 1;
                    const depthValue = Math.min(99, Math.max(1, rawValue));
                    maxDepth.value = depthValue;
                    this.state.maxDepth = depthValue;
                    maxDepth.disabled = false;
                    this.addLogEntry(
                        `Directory scanning depth: ${depthValue} ` + `(current directory + ${depthValue} sublevels)`,
                        'info'
                    );
                }
            });

            maxDepth.addEventListener('input', event => {
                if (customDepth.checked && !recursiveSearch.checked) {
                    const value = Math.min(99, Math.max(1, parseInt(event.target.value) || 1));
                    event.target.value = value;
                    this.state.maxDepth = value;
                    this.addLogEntry(
                        `Directory scanning depth updated: ${value} ` + `(current directory + ${value} sublevels)`,
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
            this.resolveAllWaitingScanners();
            this.updateActivityIndicator('active');
            resumeBtn.style.display = 'none';
            pauseBtn.style.display = 'flex';
            this.renderGeneratingButton(generateBtn, false);
            this.showToast('Scan resumed', 'success');
            this.addLogEntry('Scan in progress...', 'success');
        }

        handleCancelScan() {
            const wasGenerating = this.state.isGenerating;
            this.state.isGenerating = false;
            this.state.isPaused = false;
            this.resolveAllWaitingScanners();
            this.abortScanSession();
            this.updateActivityIndicator('cancelled');

            if (!wasGenerating) return;
            if (this._isResetting) return;

            const settleAndReset = () => {
                if (this._isResetting) return;
                this._isResetting = true;
                this.reset({ isCancelled: true, enableToggles: true });
                this._isResetting = false;
                this.showToast('Scan cancelled', 'warning');
            };

            if (this.activeScanPromise) {
                const scanPromise = this.activeScanPromise;
                this.activeScanPromise = null;
                Promise.race([scanPromise.catch(() => {}), new Promise(resolve => setTimeout(resolve, 2000))]).finally(
                    settleAndReset
                );
            } else {
                settleAndReset();
            }
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

                this.activeScanPromise = this.scanDirectory(window.location.href, '', 0);
                const entries = await this.activeScanPromise;
                this.activeScanPromise = null;

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
                if (this._isResetting) return;
                this._isResetting = true;
                this.state.isGenerating = false;
                this.state.isPaused = false;
                this.updateActivityIndicator('cancelled');
                console.error('Error creating playlist:', error);
                this.addLogEntry(`Error: ${error.message}`, 'error');
                this.showToast('Error creating playlist', 'error');
                this.reset({ isCancelled: true });
                this._isResetting = false;
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
                await this.handleGenerateRequest(generateBtn, controls, pauseBtn, resumeBtn, cancelBtn, playlistInput);
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
            this.bindGroupTitleToggleHandler(
                this.domElements.groupTitleToggle,
                this.domElements.groupTitlePanel,
                groupTitle
            );
            this.initializeDepthControls(currentDepth, customDepth, maxDepth, depthControls);
            this.bindDepthControlHandlers(recursiveSearch, currentDepth, customDepth, maxDepth, depthControls);
            this.bindScanControlHandlers(generateBtn, controls, pauseBtn, resumeBtn, cancelBtn, playlistInput);
        }

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
                stats.errors.total > 0
                    ? `• Errors: ${this.formatFullStatValue(stats.errors.total)} (${this.formatFullStatValue(stats.errors.skipped)} skipped)`
                    : null
            ]
                .filter(Boolean)
                .join('\n');

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
            if (elements.includeVideo) {
                elements.includeVideo.disabled = false;
            }

            if (elements.includeAudio) {
                elements.includeAudio.disabled = false;
            }

            if (elements.recursiveSearch) {
                elements.recursiveSearch.disabled = false;
            }

            if (elements.aggressiveMode) {
                elements.aggressiveMode.disabled = false;
            }

            if (elements.groupTitle) {
                const isPanelOpen =
                    elements.groupTitlePanel && elements.groupTitlePanel.classList.contains('is-visible');
                elements.groupTitle.disabled = !isPanelOpen;
            }

            if (elements.currentDepth) {
                elements.currentDepth.disabled = false;
            }

            if (elements.customDepth) {
                elements.customDepth.disabled = false;
            }

            if (elements.maxDepth) {
                elements.maxDepth.disabled = elements.customDepth ? !elements.customDepth.checked : true;
            }
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

        getHttpStatusFromError(error) {
            return error.message.match(/\b\d{3}\b/)?.[0] || null;
        }

        getHttpErrorUserMessage(status) {
            switch (status) {
                case '403':
                    return 'Access denied to this directory';
                case '404':
                    return 'Directory or file not found';
                case '429':
                    return 'Too many requests, please wait a while';
                case '500':
                case '502':
                case '503':
                    return 'Server is currently unable to respond, please try again later';
                default:
                    return 'Error communicating with server';
            }
        }

        buildHttpErrorPresentation(error, context) {
            return {
                userMessage: this.getHttpErrorUserMessage(this.getHttpStatusFromError(error)),
                logMessage: `${error.message} (${context})`,
                type: 'error'
            };
        }

        buildDecodeErrorPresentation(error, context) {
            return {
                userMessage: 'Filename or path could not be read',
                logMessage: `Decode error: ${context} - ${error.message}`,
                type: 'warning'
            };
        }

        buildNetworkErrorPresentation(context) {
            return {
                userMessage: 'Network connection error, please check your connection',
                logMessage: `Network error: ${context}`,
                type: 'error'
            };
        }

        buildSecurityErrorPresentation(context) {
            return {
                userMessage: 'Operation not allowed due to security restrictions',
                logMessage: `Security error: ${context}`,
                type: 'error'
            };
        }

        buildAbortErrorPresentation(context) {
            return {
                userMessage: 'Server not responding, operation timed out',
                logMessage: `Timeout: ${context}`,
                type: 'warning'
            };
        }

        buildDefaultErrorPresentation(error, context) {
            return {
                userMessage: 'Unexpected error occurred',
                logMessage: `${error.name}: ${error.message} (${context})`,
                type: 'error'
            };
        }

        getErrorPresentation(error, context) {
            if (error.name === 'AbortError') {
                return this.buildAbortErrorPresentation(context);
            }

            if (error.message.includes('HTTP error')) {
                return this.buildHttpErrorPresentation(error, context);
            }

            if (error.message.includes('decode')) {
                return this.buildDecodeErrorPresentation(error, context);
            }

            if (error.message.includes('NetworkError')) {
                return this.buildNetworkErrorPresentation(context);
            }

            if (error.message.includes('SecurityError')) {
                return this.buildSecurityErrorPresentation(context);
            }

            return this.buildDefaultErrorPresentation(error, context);
        }

        handleError(error, context = '') {
            const { userMessage, logMessage, type } = this.getErrorPresentation(error, context);

            console.error(`[${context}]`, error);
            this.showToast(userMessage, type);
            this.addLogEntry(logMessage, type);
            this.state.stats.errors.total++;
        }

        createOperationError(code, message, context = {}, cause = null) {
            const error = new Error(message);
            error.name = 'M3UnatorError';
            error.code = code;
            error.context = context;
            if (cause) {
                error.cause = cause;
            }
            return error;
        }

        getFetchHeaders() {
            return {
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                Connection: 'keep-alive',
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            };
        }

        buildFetchOptions(options) {
            const fetchOptions = { ...options };
            delete fetchOptions.timeout;

            return {
                ...fetchOptions,
                headers: this.getFetchHeaders(),
                signal: options.signal
            };
        }

        createAbortError(message = 'Operation aborted') {
            if (typeof DOMException === 'function') {
                return new DOMException(message, 'AbortError');
            }

            const error = new Error(message);
            error.name = 'AbortError';
            return error;
        }

        createLinkedAbortController(parentSignal, timeoutMs) {
            if (typeof AbortController !== 'function') {
                return {
                    signal: parentSignal || null,
                    cleanup() {}
                };
            }

            const controller = new AbortController();
            let timeoutId = null;

            const abortFromParent = () => {
                controller.abort();
            };

            if (parentSignal) {
                if (parentSignal.aborted) {
                    controller.abort();
                } else {
                    parentSignal.addEventListener('abort', abortFromParent, { once: true });
                }
            }

            if (timeoutMs > 0) {
                timeoutId = setTimeout(() => {
                    controller.abort();
                }, timeoutMs);
            }

            return {
                signal: controller.signal,
                cleanup() {
                    if (timeoutId) {
                        clearTimeout(timeoutId);
                    }

                    if (parentSignal) {
                        parentSignal.removeEventListener('abort', abortFromParent);
                    }
                }
            };
        }

        createFetchFailureError(response, url, retryAttempt) {
            return this.createOperationError('HTTP_FETCH_FAILED', `HTTP error! Status: ${response.status}`, {
                url,
                status: response.status,
                retryAttempt
            });
        }

        async parseFetchResponse(response) {
            const text = await response.text();
            return {
                decodedText: text,
                status: response.status,
                ok: response.ok
            };
        }

        getHttpStatusCode(error) {
            if (error && error.context && error.context.status) {
                return Number(error.context.status);
            }

            const status = error && typeof error.message === 'string' ? error.message.match(/\b\d{3}\b/) : null;
            return status ? Number(status[0]) : null;
        }

        shouldThrowFetchErrorImmediately(error) {
            const status = this.getHttpStatusCode(error);
            return status === 401 || status === 403 || status === 404 || status === 410;
        }

        waitForRetryDelay(attemptIndex, signal = null) {
            const delayMs = Math.pow(2, attemptIndex) * 1000;

            return new Promise((resolve, reject) => {
                if (signal && signal.aborted) {
                    reject(this.createAbortError());
                    return;
                }

                const timeoutId = setTimeout(() => {
                    if (signal) {
                        signal.removeEventListener('abort', abort);
                    }

                    resolve();
                }, delayMs);

                const abort = () => {
                    clearTimeout(timeoutId);
                    reject(this.createAbortError());
                };

                if (signal) {
                    signal.addEventListener('abort', abort, { once: true });
                }
            });
        }

        getFetchRetryCount(retries) {
            return Number.isFinite(retries) ? retries : this.state.retryCount;
        }

        getFetchTimeoutMs(options) {
            return Number.isFinite(options.timeout) ? options.timeout : this.state.timeoutMs;
        }

        async fetchWithRetry(url, options = {}, retries = null) {
            let lastError;
            const retryCount = this.getFetchRetryCount(retries);
            const timeoutMs = this.getFetchTimeoutMs(options);

            for (let attemptIndex = 0; attemptIndex <= retryCount; attemptIndex++) {
                const linkedAbort = this.createLinkedAbortController(options.signal, timeoutMs);

                try {
                    const response = await fetch(
                        url,
                        this.buildFetchOptions({
                            ...options,
                            signal: linkedAbort.signal
                        })
                    );

                    if (!response.ok) {
                        throw this.createFetchFailureError(response, url, attemptIndex + 1);
                    }

                    return await this.parseFetchResponse(response);
                } catch (error) {
                    lastError = error;

                    if (error.name === 'AbortError') {
                        throw error;
                    }

                    if (this.shouldThrowFetchErrorImmediately(error)) {
                        throw error;
                    }

                    if (attemptIndex < retryCount) {
                        await this.waitForRetryDelay(attemptIndex, options.signal);
                    }
                } finally {
                    linkedAbort.cleanup();
                }
            }

            throw lastError;
        }

        stripUnsafeFilenameCharacters(input) {
            return input
                .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
                .trim()
                .replace(/[\x00-\x1F\x7F]/g, '')
                .replace(/[\u200B-\u200D\uFEFF]/g, '')
                .replace(/[^\w\s\-_.()[\]{}#@!$%^&+=]/g, '');
        }

        finalizeSanitizedName(sanitized) {
            if (!sanitized) {
                return 'playlist';
            }

            if (sanitized.length > 255) {
                return sanitized.slice(0, 255);
            }

            return sanitized;
        }

        sanitizeInput(input) {
            if (!input || typeof input !== 'string') {
                return '';
            }

            const sanitized = this.stripUnsafeFilenameCharacters(input);
            return this.finalizeSanitizedName(sanitized);
        }

        shouldDecodeHtml(type) {
            return type === 'html' || type === 'both';
        }

        shouldDecodeUrl(type) {
            return type === 'url' || type === 'both';
        }

        decodeHtmlEntities(value) {
            return value
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#039;/g, "'")
                .replace(/&#x27;/g, "'")
                .replace(/&#x2F;/g, '/');
        }

        fallbackDecodeUrlComponent(value) {
            try {
                return decodeURIComponent(value.replace(/%(?![0-9A-F]{2})/gi, '%25'));
            } catch {
                return value.replace(/%([0-9A-F]{2})/gi, (match, hex) => {
                    try {
                        return String.fromCharCode(parseInt(hex, 16));
                    } catch {
                        return match;
                    }
                });
            }
        }

        decodeUrlComponentSafely(value) {
            try {
                return decodeURIComponent(value);
            } catch {
                return this.fallbackDecodeUrlComponent(value);
            }
        }

        decodeString(str, type = 'both') {
            if (!str) {
                return str;
            }

            try {
                let decoded = str;

                if (this.shouldDecodeHtml(type)) {
                    decoded = this.decodeHtmlEntities(decoded);
                }

                if (this.shouldDecodeUrl(type)) {
                    decoded = this.decodeUrlComponentSafely(decoded);
                }

                return decoded;
            } catch (error) {
                console.warn('Decode error:', error);
                return str;
            }
        }

        splitPathSegments(path) {
            return path.split('/');
        }

        normalizePathForExtraction(path, trimTrailingSlash = false) {
            if (!path || !trimTrailingSlash) {
                return path;
            }

            return path.replace(/\/+$/, '');
        }

        buildOriginalPathInfo(path, trimTrailingSlash = false) {
            const normalizedPath = this.normalizePathForExtraction(path, trimTrailingSlash);
            const originalParts = this.splitPathSegments(normalizedPath);
            return {
                fileName: originalParts[originalParts.length - 1] || '',
                dirPath: originalParts.slice(0, -1).join('/')
            };
        }

        buildDecodedPathInfo(path, trimTrailingSlash = false) {
            const normalizedPath = this.normalizePathForExtraction(path, trimTrailingSlash);
            const decodedPath = this.decodeString(normalizedPath);
            const parts = this.splitPathSegments(decodedPath);
            const fileName = parts.pop() || '';
            const dirPath = parts.join('/');

            return {
                fileName,
                dirPath,
                original: this.buildOriginalPathInfo(path, trimTrailingSlash)
            };
        }

        buildFallbackPathInfo(path, trimTrailingSlash = false) {
            const normalizedPath = this.normalizePathForExtraction(path, trimTrailingSlash);
            const parts = this.splitPathSegments(normalizedPath);
            const fileName = parts.pop() || '';
            const dirPath = parts.join('/');

            return {
                fileName,
                dirPath,
                original: this.buildOriginalPathInfo(path, trimTrailingSlash)
            };
        }

        extractPathInfo(path, trimTrailingSlash = false) {
            try {
                return this.buildDecodedPathInfo(path, trimTrailingSlash);
            } catch (error) {
                this.handleError(error, `Path decode error: ${path}`);
                return this.buildFallbackPathInfo(path, trimTrailingSlash);
            }
        }

        extractFileInfo(path) {
            return this.extractPathInfo(path);
        }

        extractDirectoryInfo(path) {
            return this.extractPathInfo(path, true);
        }

        joinRelativePath(...segments) {
            return segments.filter(Boolean).join('/');
        }

        normalizeUrl(url) {
            const trimmed = url.trimEnd();
            const normalized = trimmed.replace(/([^:]\/)\/+/g, '$1');
            return normalized.endsWith('/') ? normalized : `${normalized}/`;
        }

        resetCurrentStats() {
            this.state.stats.files.video.current = 0;
            this.state.stats.files.audio.current = 0;
        }

        updateFileStats(type) {
            this.state.stats.files[type].total++;
            this.state.stats.files[type].current++;
        }

        getCurrentStatsText() {
            const { video, audio } = this.state.stats.files;
            const details = [];

            if (video.current > 0) details.push(`${video.current} video`);
            if (audio.current > 0) details.push(`${audio.current} audio`);

            return details.join(' and ');
        }

        shouldStopScanning() {
            return !this.state.isGenerating || this.isScanAborted() || this.entries.length >= this.state.maxEntries;
        }

        tryReserveEntrySlot() {
            if (this.entries.length >= this.state.maxEntries) {
                return false;
            }
            this._reservedEntryCount = (this._reservedEntryCount || 0) + 1;
            return true;
        }

        commitReservedEntry(entry) {
            this.entries.push(entry);
            this._reservedEntryCount = (this._reservedEntryCount || 0) - 1;
        }

        async waitForScanResume() {
            if (!this.state.isPaused || !this.state.isGenerating) {
                return;
            }

            return new Promise(resolve => {
                if (!this._resumeResolvers) {
                    this._resumeResolvers = [];
                }
                this._resumeResolvers.push(resolve);
            });
        }

        resolveAllWaitingScanners() {
            if (this._resumeResolvers) {
                this._resumeResolvers.forEach(resolve => resolve());
                this._resumeResolvers = [];
            }
        }

        buildNormalizedScanUrl(url) {
            return this.normalizeUrl(url)
                .replace(/#/g, '%23')
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

            this.addLogEntry(`Cache cleared (${previousCount} -> ${this.seenUrlOrder.length})`, 'info');
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
                return await this.fetchWithRetry(
                    normalizedUrl,
                    {
                        signal: this.getScanAbortSignal(),
                        timeout: this.state.timeoutMs
                    },
                    this.state.retryCount
                );
            } catch (error) {
                if (this.isScanAborted()) {
                    return null;
                }

                if (error.name === 'AbortError') {
                    this.addLogEntry(`Request timed out: ${decodeURIComponent(normalizedUrl)}`, 'warning');
                } else if (error.message.includes('404')) {
                    this.addLogEntry(`Directory not found: ${decodeURIComponent(normalizedUrl)}`, 'warning');
                } else {
                    this.addLogEntry(`Connection error: ${error.message}`, 'error');
                }

                return null;
            }
        }

        async fetchDirectoryForScheduler(scanTask) {
            const requestStartedAt = this.getPerformanceNow();

            try {
                const response = await this.fetchWithRetry(
                    scanTask.normalizedUrl,
                    {
                        signal: this.getScanAbortSignal(),
                        timeout: this.state.timeoutMs
                    },
                    this.state.retryCount
                );
                this.recordScanRequestSample({
                    duration: this.getPerformanceNow() - requestStartedAt,
                    status: response.status,
                    ok: true,
                    timedOut: false
                });
                return response;
            } catch (error) {
                this.recordScanRequestSample({
                    duration: this.getPerformanceNow() - requestStartedAt,
                    status: this.getHttpStatusCode(error),
                    ok: false,
                    timedOut: error.name === 'AbortError'
                });

                if (this.isScanAborted()) {
                    return null;
                }

                if (error.name === 'AbortError') {
                    this.addLogEntry(`Request timed out: ${decodeURIComponent(scanTask.normalizedUrl)}`, 'warning');
                } else if (error.message.includes('404')) {
                    this.addLogEntry(`Directory not found: ${decodeURIComponent(scanTask.normalizedUrl)}`, 'warning');
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
                doc && doc.body && typeof doc.body.textContent === 'string' ? doc.body.textContent : ''
            );
        }

        getListingAnchorHref(anchor) {
            if (!anchor || typeof anchor.getAttribute !== 'function') {
                return '';
            }

            return anchor.getAttribute('href') || '';
        }

        getListingAnchorText(anchor) {
            return this.normalizeListingText(
                anchor && typeof anchor.textContent === 'string' ? anchor.textContent : ''
            );
        }

        isSortableDirectoryQueryHref(href) {
            return /^\?(?:C=[^#]+|sort=[^#]+|order=[^#]+)/i.test(href);
        }

        isParentDirectoryListingAnchor(anchor) {
            const href = this.getListingAnchorHref(anchor).trim();
            const text = this.getListingAnchorText(anchor);

            return (
                href === '../' ||
                text === '../' ||
                text.includes('parent directory') ||
                text.includes('[to parent directory]') ||
                text.includes('[parentdir]')
            );
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

            return candidates.reduce(
                (markers, value) => {
                    const normalizedValue = this.normalizeListingText(value);

                    if (normalizedValue.includes('index of')) {
                        markers.hasIndexOf = true;
                    }

                    if (normalizedValue.includes('directory listing')) {
                        markers.hasDirectoryListing = true;
                    }

                    return markers;
                },
                {
                    hasIndexOf: false,
                    hasDirectoryListing: false
                }
            );
        }

        getDirectoryListingSignalCounts(
            doc,
            baseUrl = window.location && window.location.href ? window.location.href : ''
        ) {
            return this.collectDirectoryListingSignals(this.getListingAnchorElements(doc), baseUrl).counts;
        }

        collectDirectoryListingSignals(
            anchors,
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
            const hrefs = [];
            const seenHrefs = new Set();

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
                if (!seenHrefs.has(normalizedHref)) {
                    seenHrefs.add(normalizedHref);
                    hrefs.push(normalizedHref);
                }

                if (normalizedHref.endsWith('/')) {
                    counts.directoryCandidateCount++;
                    return;
                }

                counts.fileCandidateCount++;
            });

            return { counts, hrefs };
        }

        hasGenericDirectoryListingMarkers(doc) {
            const documentText = this.getListingDocumentText(doc);

            return (
                documentText.includes('parent directory') ||
                documentText.includes('[to parent directory]') ||
                documentText.includes('[parentdir]')
            );
        }

        hasExplicitDirectoryListingSignals(titleMarkers, signalCounts, hasGenericMarkers) {
            return (
                titleMarkers.hasIndexOf ||
                hasGenericMarkers ||
                signalCounts.parentLinkCount > 0 ||
                signalCounts.sortableQueryCount > 0
            );
        }

        getDirectoryListingSupport(doc, baseUrl = window.location && window.location.href ? window.location.href : '') {
            const titleMarkers = this.getDirectoryListingTitleMarkers(doc);
            const signalCounts = this.getDirectoryListingSignalCounts(doc, baseUrl);
            return this.buildDirectoryListingSupport(doc, titleMarkers, signalCounts);
        }

        buildDirectoryListingSupport(doc, titleMarkers, signalCounts) {
            const hasGenericMarkers = this.hasGenericDirectoryListingMarkers(doc);
            const hasLiteSpeedStructure =
                this.hasListingSelector(doc, 'div#table-list') && signalCounts.relativeCandidateCount >= 1;
            const hasCaddyStructure =
                this.hasListingSelector(doc, 'nav.breadcrumbs') &&
                this.hasListingSelector(doc, 'table.listing') &&
                signalCounts.relativeCandidateCount >= 1;
            const hasStructuredTable =
                (this.hasListingSelector(doc, 'table#listing') ||
                    this.hasListingSelector(doc, 'table[summary="Directory Listing"]')) &&
                signalCounts.relativeCandidateCount >= 1;
            const hasLinkStructure =
                signalCounts.relativeCandidateCount >= 1 &&
                (signalCounts.parentLinkCount > 0 ||
                    signalCounts.sortableQueryCount > 0 ||
                    signalCounts.directoryCandidateCount > 0);
            const hasExplicitSignals = this.hasExplicitDirectoryListingSignals(
                titleMarkers,
                signalCounts,
                hasGenericMarkers
            );
            const hasPreListing =
                this.hasListingSelector(doc, 'pre') && signalCounts.relativeCandidateCount >= 1 && hasExplicitSignals;

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

            const isSmallBareIndex =
                titleMarkers.hasIndexOf &&
                signalCounts.relativeCandidateCount >= 1 &&
                signalCounts.anchorCount === signalCounts.relativeCandidateCount &&
                signalCounts.anchorCount <= 5;

            return {
                supported:
                    hasLiteSpeedStructure ||
                    hasCaddyStructure ||
                    hasStructuredTable ||
                    (signalCounts.relativeCandidateCount >= 1 &&
                        ((hasExplicitSignals && score >= 6) ||
                            (hasGenericMarkers && hasLinkStructure) ||
                            isSmallBareIndex)),
                score
            };
        }

        analyzeDirectoryDocument(doc, baseUrl = window.location && window.location.href ? window.location.href : '') {
            const anchors = this.getListingAnchorElements(doc);
            const { counts, hrefs } = this.collectDirectoryListingSignals(anchors, baseUrl);
            const titleMarkers = this.getDirectoryListingTitleMarkers(doc);
            const listingSupport = this.buildDirectoryListingSupport(doc, titleMarkers, counts);

            return {
                ...listingSupport,
                counts,
                hrefs: listingSupport.supported ? hrefs : []
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
                const directoryPath = directoryUrl.pathname.endsWith('/')
                    ? directoryUrl.pathname
                    : `${directoryUrl.pathname}/`;

                if (candidateUrl.origin !== directoryUrl.origin || !candidateUrl.pathname.startsWith(directoryPath)) {
                    return '';
                }

                return candidateUrl.pathname.slice(directoryPath.length);
            } catch (_error) {
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

            if (this.shouldLogBatchProgress(batchProgress)) {
                const progress = Math.floor((batchProgress.processed / batchProgress.total) * 100);
                this.addLogEntry(
                    `Batch Processing: ${progress}% (${batchProgress.processed}/${batchProgress.total}, ` +
                        `Success: ${batchProgress.success}, Error: ${batchProgress.errors})`,
                    'info'
                );
            }
        }

        getBatchProgressStep(total) {
            if (total > 2000) {
                return 250;
            }

            if (total > 200) {
                return 100;
            }

            return 20;
        }

        shouldLogBatchProgress(batchProgress) {
            const step = this.getBatchProgressStep(batchProgress.total);
            return batchProgress.processed % step === 0 || batchProgress.processed === batchProgress.total;
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
                const shouldIncludeMedia =
                    mediaType &&
                    ((mediaType === 'video' && this.state.includeVideo) ||
                        (mediaType === 'audio' && this.state.includeAudio));

                if (shouldIncludeMedia) {
                    if (!this.tryReserveEntrySlot()) {
                        return;
                    }

                    if (mediaType === 'video') {
                        this.updateFileStats('video');
                    } else {
                        this.updateFileStats('audio');
                    }

                    this.commitReservedEntry({
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

        processFileBatch(files, startIndex, batchSize, normalizedUrl, currentPath, processedUrls) {
            const endIndex = Math.min(startIndex + batchSize, files.length);
            const batchProgress = this.createBatchProgress(endIndex - startIndex);

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
            const processedUrls = new Set();

            for (let index = 0; index < files.length; index += batchSize) {
                await this.waitForScanResume();

                if (this.shouldStopScanning()) {
                    break;
                }

                this.processFileBatch(files, index, batchSize, normalizedUrl, currentPath, processedUrls);

                const processedCount = Math.min(index + batchSize, files.length);
                if (this.shouldYieldAfterFileBatch(processedCount, files.length)) {
                    await this.yieldToScanLoop();
                }
            }
        }

        shouldScanSubdirectories(depth) {
            return this.state.maxDepth === -1 || (this.state.maxDepth > 0 && depth < this.state.maxDepth);
        }

        getPerformanceNow() {
            return typeof performance !== 'undefined' && typeof performance.now === 'function'
                ? performance.now()
                : Date.now();
        }

        clampScanConcurrency(value) {
            const config = this.getActiveConcurrencyConfig();
            const hardMax = Math.min(config.max, config.hardCap);
            return Math.max(config.min, Math.min(hardMax, value));
        }

        getCurrentScanConcurrency() {
            if (!this.scanPerformance) {
                this.scanPerformance = this.createInitialScanPerformance();
            }

            return this.clampScanConcurrency(this.scanPerformance.currentConcurrency);
        }

        async sampleEventLoopLag() {
            const startedAt = this.getPerformanceNow();
            await new Promise(resolve => setTimeout(resolve, 0));
            this.recordEventLoopLagSample(this.getPerformanceNow() - startedAt);
        }

        recordEventLoopLagSample(lagMs) {
            if (!this.scanPerformance) {
                return;
            }

            const lag = Math.max(0, lagMs);
            this.scanPerformance.lastEventLoopLag = lag;

            if (lag > 300) {
                this.scanPerformance.currentConcurrency = this.state.concurrency.min;
                return;
            }

            if (lag > 150) {
                this.scanPerformance.currentConcurrency = this.clampScanConcurrency(
                    Math.floor(this.scanPerformance.currentConcurrency / 2)
                );
            }
        }

        recordScanRequestSample(sample) {
            if (!this.scanPerformance) {
                this.scanPerformance = this.createInitialScanPerformance();
            }

            const performanceState = this.scanPerformance;
            performanceState.requestSamples.push(sample);

            while (performanceState.requestSamples.length > performanceState.sampleWindow) {
                performanceState.requestSamples.shift();
            }

            this.adjustScanConcurrency(sample);
        }

        adjustScanConcurrency(sample) {
            const performanceState = this.scanPerformance;
            const config = this.getActiveConcurrencyConfig();
            const now = this.getPerformanceNow();
            const status = Number(sample.status || 0);

            if (status === 429 || status === 503) {
                performanceState.rateLimitedUntil = now + 10000;
                performanceState.currentConcurrency = this.clampScanConcurrency(
                    Math.floor(performanceState.currentConcurrency / 2)
                );
                return;
            }

            const samples = performanceState.requestSamples;
            if (samples.length === 0) return;
            const failedSamples = samples.filter(entry => !entry.ok || entry.timedOut);
            const averageLatency = samples.reduce((total, entry) => total + entry.duration, 0) / samples.length;
            const errorRate = failedSamples.length / samples.length;

            if (sample.timedOut || errorRate > 0.15 || averageLatency > 2500) {
                performanceState.currentConcurrency = this.clampScanConcurrency(
                    Math.floor(performanceState.currentConcurrency / 2)
                );
                return;
            }

            const canIncrease =
                samples.length >= Math.min(5, performanceState.sampleWindow) &&
                errorRate === 0 &&
                averageLatency < 600 &&
                now - performanceState.lastIncreaseAt >= performanceState.increaseCooldownMs &&
                now > performanceState.rateLimitedUntil &&
                performanceState.currentConcurrency < config.max;

            if (canIncrease) {
                performanceState.currentConcurrency = this.clampScanConcurrency(
                    performanceState.currentConcurrency + 1
                );
                performanceState.lastIncreaseAt = now;
            }
        }

        createScanTask(url, currentPath = '', depth = 0) {
            return {
                url,
                currentPath,
                depth,
                normalizedUrl: this.buildNormalizedScanUrl(url)
            };
        }

        queueSubdirectoryTask(dir, parentTask, pendingTasks) {
            try {
                const fullUrl = new URL(dir, parentTask.normalizedUrl).toString();
                const { fileName, dirPath } = this.extractDirectoryInfo(dir);
                const fullPath = this.joinRelativePath(parentTask.currentPath, dirPath, fileName);
                pendingTasks.push(this.createScanTask(fullUrl, fullPath, parentTask.depth + 1));
                this.addLogEntry(`Entering subdirectory: ${fullPath || this.decodeString(dir).replace(/\/+$/, '')}`);
            } catch (error) {
                console.error('Directory scanning error:', error);
                this.state.stats.errors.total++;
            }
        }

        async processScanTask(scanTask, pendingTasks) {
            try {
                this.resetCurrentStats();

                if (this.shouldStopScanning()) {
                    return this.entries;
                }

                await this.waitForScanResume();

                this.updateDirectoryScanStats(scanTask.normalizedUrl, scanTask.depth);

                if (this.shouldSkipSeenDirectory(scanTask.normalizedUrl)) {
                    return this.entries;
                }

                this.trackSeenDirectory(scanTask.normalizedUrl);

                const response = await this.fetchDirectoryForScheduler(scanTask);
                if (!response) {
                    return this.entries;
                }

                const doc = this.parseDirectoryDocument(response.decodedText);
                const listingAnalysis = this.analyzeDirectoryDocument(doc, scanTask.normalizedUrl);
                if (!listingAnalysis.supported) {
                    this.addLogEntry(
                        `Skipped non-listing page: ${decodeURIComponent(scanTask.normalizedUrl)}`,
                        'warning'
                    );
                    return this.entries;
                }

                const { directories, files } = this.splitDirectoryAndFileHrefs(listingAnalysis.hrefs);

                await this.processFileHrefs(files, scanTask.normalizedUrl, scanTask.currentPath);

                if (this.shouldScanSubdirectories(scanTask.depth) && directories.length > 0) {
                    directories.forEach(dir => {
                        this.queueSubdirectoryTask(dir, scanTask, pendingTasks);
                    });
                }

                this.updateCounter(this.state.stats.totalFiles);
                return this.entries;
            } catch (error) {
                this.state.stats.errors.total++;
                this.addLogEntry(`Scan error (${scanTask.currentPath || scanTask.url}): ${error.message}`, 'error');
                return this.entries;
            }
        }

        async runScanScheduler(initialTask) {
            const pendingTasks = [initialTask];
            const activeTasks = new Set();

            while ((pendingTasks.length > 0 || activeTasks.size > 0) && !this.shouldStopScanning()) {
                await this.waitForScanResume();

                while (
                    pendingTasks.length > 0 &&
                    activeTasks.size < this.getCurrentScanConcurrency() &&
                    !this.shouldStopScanning()
                ) {
                    const scanTask = pendingTasks.shift();
                    const trackedTask = this.processScanTask(scanTask, pendingTasks).finally(() => {
                        activeTasks.delete(trackedTask);
                    });
                    activeTasks.add(trackedTask);
                }

                if (activeTasks.size > 0) {
                    await Promise.race(activeTasks);
                    await this.sampleEventLoopLag();
                }
            }

            return this.entries;
        }

        async scanDirectory(url, currentPath = '', depth = 0) {
            return this.runScanScheduler(this.createScanTask(url, currentPath, depth));
        }

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
            } catch (_error) {
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

        getNormalizedGroupTitle() {
            return typeof this.state.groupTitle === 'string' ? this.state.groupTitle.trim() : '';
        }

        escapeM3uAttribute(value) {
            return String(value)
                .replace(/\\/g, '\\\\')
                .replace(/"/g, '\\"')
                .replace(/[\r\n]+/g, ' ')
                .trim();
        }

        buildExtinfLine(entry) {
            const groupTitle = this.getNormalizedGroupTitle();
            if (!groupTitle) {
                return `#EXTINF:-1,${entry.decodedTitle}`;
            }

            return `#EXTINF:-1 group-title="${this.escapeM3uAttribute(groupTitle)}",${entry.decodedTitle}`;
        }

        serializePlaylistEntries(entries) {
            const serializedEntries = [];

            entries.forEach(entry => {
                serializedEntries.push(`${this.buildExtinfLine(entry)}\n${entry.url}\n`);
            });

            return serializedEntries.join('');
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
                content: formatConfig.prependUtf8Bom ? `\uFEFF${playlistContent}` : playlistContent
            };
        }

        shouldSkipLogEntry(type) {
            if (type === 'final' || type === 'error') {
                return false;
            }
            return this.state.isPaused || !this.state.isGenerating;
        }

        decodeUrlInLogMessage(url) {
            try {
                return decodeURIComponent(url);
            } catch (_error) {
                return url;
            }
        }

        decodeLogMessage(message) {
            if (!message.includes('http')) {
                return message;
            }

            const urlRegex = /(https?:\/\/[^\s.,;:)\]>}]+)/g;
            return message.replace(urlRegex, url => this.decodeUrlInLogMessage(url));
        }

        isLogPanelExpanded() {
            const scanLog = this.domElements.scanLog;
            return Boolean(scanLog && scanLog.classList && scanLog.classList.contains('expanded'));
        }

        cancelScheduledLogUiUpdate() {
            if (this._updateLogUITimeout) {
                clearTimeout(this._updateLogUITimeout);
                this._updateLogUITimeout = null;
            }

            if (this._updateLogUIFrame) {
                cancelAnimationFrame(this._updateLogUIFrame);
                this._updateLogUIFrame = null;
            }
        }

        shouldRefreshLogUi() {
            return this.isLogPanelExpanded();
        }

        syncLogCounter() {
            const logCounter = this.domElements.logCounter;
            if (logCounter) {
                const totalLogs = String(this.logCache.stats.nextSequence);
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

            if (!this.isLogPanelExpanded()) {
                this.cancelScheduledLogUiUpdate();
                return;
            }

            if (this._updateLogUIFrame) {
                return;
            }

            this._updateLogUIFrame = requestAnimationFrame(() => {
                this.renderLogEntries(scanLog);
                this._updateLogUIFrame = null;
            });
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
                `Total Logs: ${logCache.stats.nextSequence}`,
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
                    progress >= 100 ? 'high' : progress >= 75 ? 'medium' : progress >= 50 ? 'low' : '';
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

    const generator = new PlaylistGenerator();
    generator.init();

    const { infoLink, infoClose, infoModal } = generator.domElements;

    // Event listeners for info modal
    infoLink.addEventListener('click', () => {
        generator.openInfoModal();
    });

    infoClose.addEventListener('click', () => {
        generator.closeInfoModal({ restoreFocus: true });
    });

    window.addEventListener('click', event => {
        if (event.target === infoModal) {
            generator.closeInfoModal({ restoreFocus: true });
        }
    });
})();
