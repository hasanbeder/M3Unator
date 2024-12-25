// ==UserScript==
// @name         M3Unator - Web Directory Playlist Creator
// @namespace    https://github.com/hasanbeder/M3Unator
// @version      1.0.1
// @description  Create M3U/M3U8 playlists from directory listing pages. Automatically finds video and audio files in web server indexes.
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

(function() {
    'use strict';

    if (!document.title.includes('Index of') && !document.querySelector('div#table-list')) {
        console.log('This page is not an Index page, M3Unator disabled.');
        return;
    }

    function parseLiteSpeedDirectory() {
        const links = [];
        const rows = document.querySelectorAll('#table-content tr');
        
        rows.forEach(row => {
            const linkElement = row.querySelector('a');
            if (linkElement && !linkElement.textContent.includes('Parent Directory')) {
                const href = linkElement.getAttribute('href');
                if (href) {
                    links.push(new URL(href, window.location.href).href);
                }
            }
        });
        
        return links;
    }

    // Add LiteSpeed support to the existing getDirectoryLinks function
    function getDirectoryLinks() {
        const links = [];
        
        // LiteSpeed directory listing
        if (document.querySelector('div#table-list')) {
            const rows = document.querySelectorAll('#table-content tr');
            rows.forEach(row => {
                const linkElement = row.querySelector('a');
                if (linkElement && !linkElement.textContent.includes('Parent Directory')) {
                    const href = link.getAttribute('href');
                    if (href) {
                        links.push(new URL(href, window.location.href).href);
                    }
                }
            });
            return links;
        }
        
        // Apache/Nginx style directory listing
        const anchors = document.querySelectorAll('a');
        anchors.forEach(anchor => {
            if (!anchor.textContent.includes('Parent Directory')) {
                const href = anchor.getAttribute('href');
                if (href && !href.startsWith('?') && !href.startsWith('/')) {
                    links.push(new URL(href, window.location.href).href);
                }
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
            pointer-events: none; /* Arka plan tıklamalarını engelle */
        }

        body.modal-open .M3Unator-container,
        body.modal-open .M3Unator-popup {
            pointer-events: all; /* Modal içeriğine tıklamaya izin ver */
        }

        .M3Unator-popup {
            background: #11111b;
            color: #cdd6f4;
            width: 100%;
            max-width: 480px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
            overflow: hidden;
            animation: slideUp 0.3s ease;
            position: absolute;
        }

        .M3Unator-header {
            padding: 1.25rem 1.618rem;
            background: #1e1e2e;
            color: #cdd6f4;
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: move;
            user-select: none;
            border-bottom: 1px solid #313244;
        }

        .M3Unator-title {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin: 0;
            font-size: 1.25rem;
            font-weight: 600;
            line-height: 1;
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

        .M3Unator-title span {
            display: flex;
            align-items: center;
            line-height: 24px;
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

        .M3Unator-input {
            width: 100%;
            height: 42px; /* Create Playlist butonu ile aynı yükseklik */
            padding: 0 12px;
            border: 1px solid #45475a;
            border-radius: 8px;
            background: #1e1e2e;
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

        .M3Unator-input::placeholder {
            color: #6c7086;
            opacity: 1;
        }

        .M3Unator-toggle-container {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .M3Unator-toggle-container input[type="checkbox"] {
            display: none;
        }

        .M3Unator-toggle-container span {
            width: 48px;
            height: 48px;
            background: #1e1e2e;
            border: 2px solid #45475a;
            border-radius: 12px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
        }

        .M3Unator-toggle-container svg {
            width: 24px;
            height: 24px;
            opacity: 0.7;
            transition: all 0.3s ease;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }

        .M3Unator-toggle-container input[type="checkbox"]:checked + span {
            background: rgba(203, 166, 247, 0.1);
            border-color: #cba6f7;
            box-shadow: 0 0 20px rgba(203, 166, 247, 0.2);
        }

        .M3Unator-toggle-container input[type="checkbox"]:checked + span svg {
            opacity: 1;
            color: #cba6f7;
            filter: drop-shadow(0 0 8px rgba(203, 166, 247, 0.4));
        }

        .M3Unator-toggle-container span:hover {
            background: #313244;
            transform: translateY(-2px);
        }

        .M3Unator-toggle-container span:active {
            transform: translateY(1px);
        }

        .M3Unator-toggle-container input[type="checkbox"]:checked + span:hover {
            background: rgba(203, 166, 247, 0.2);
        }

        .M3Unator-toggle-container span:active {
            transform: translateY(1px);
        }

        .M3Unator-toggle-container svg {
            width: 24px;
            height: 24px;
            opacity: 0.8;
            transition: all 0.2s ease;
        }

        .M3Unator-toggle-container input[type="checkbox"]:checked + span svg {
            opacity: 1;
            color: #cba6f7;
        }

        .M3Unator-toggle-group {
            display: flex;
            gap: 0.75rem;
            margin: 0.75rem 0;
            justify-content: center;
            background: rgba(30, 30, 46, 0.4);
            padding: 0.75rem;
            border-radius: 12px;
            backdrop-filter: blur(8px);
        }

        [title]:hover::after {
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

        .M3Unator-button {
            width: 100%;
            height: 42px;
            padding: 0 16px;
            border: none;
            border-radius: 8px;
            background: #f5c2e7;
            color: #1e1e2e;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        .M3Unator-button:hover {
            background: #f5c2e7;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(245, 194, 231, 0.2);
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
            padding: 0 1.25rem;
            border-radius: 12px;
            background: rgba(30, 30, 46, 0.95);
            border: 2px solid #313244;
            cursor: pointer;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
            display: flex;
            align-items: center;
            gap: 0.75rem;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 9998;
            backdrop-filter: blur(12px);
        }

        .M3Unator-launcher:hover {
            background: rgba(30, 30, 46, 0.98);
            border-color: #45475a;
            transform: translateY(-2px);
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
        }

        .M3Unator-launcher svg {
            width: 24px;
            height: 24px;
            color: #f5c2e7;
            filter: drop-shadow(0 0 8px rgba(245, 194, 231, 0.4));
        }

        .M3Unator-launcher span {
            font-weight: 600;
            font-size: 0.95rem;
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

        @keyframes gradient {
            0% { background-position: 0% 50%; filter: hue-rotate(0deg); }
            50% { background-position: 100% 50%; filter: hue-rotate(180deg); }
            100% { background-position: 0% 50%; filter: hue-rotate(360deg); }
        }

        .M3Unator-dropdown {
            position: relative;
            width: 100%;
        }

        .M3Unator-dropdown-button {
            width: 100%;
            padding: 0.618rem;
            background: #1e1e2e;
            border: 1px solid #313244;
            border-radius: 8px;
            color: #cdd6f4;
            font-size: 0.875rem;
            text-align: left;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .M3Unator-dropdown-button:hover {
            border-color: #45475a;
            background: rgba(30, 30, 46, 0.8);
        }

        .M3Unator-dropdown-button svg {
            width: 16px;
            height: 16px;
            min-width: 16px;
            min-height: 16px;
            transition: transform 0.2s ease;
        }

        .M3Unator-dropdown.active .M3Unator-dropdown-button {
            border-color: #cba6f7;
            border-radius: 8px 8px 0 0;
        }

        .M3Unator-dropdown.active .M3Unator-dropdown-button svg {
            transform: rotate(180deg);
        }

        .M3Unator-dropdown-menu {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: #1e1e2e;
            border: 1px solid #cba6f7;
            border-top: none;
            border-radius: 0 0 8px 8px;
            overflow: hidden;
            z-index: 1000;
            display: none;
            animation: dropdownSlide 0.2s ease;
            user-select: none;
        }

        .M3Unator-dropdown.active .M3Unator-dropdown-menu {
            display: block;
        }

        .M3Unator-dropdown-item {
            padding: 0.618rem;
            color: #cdd6f4;
            cursor: pointer;
            transition: all 0.2s ease;
            user-select: none;
        }

        .M3Unator-dropdown-item:hover {
            background: rgba(203, 166, 247, 0.1);
        }

        .M3Unator-dropdown-item.selected {
            background: rgba(203, 166, 247, 0.1);
            color: #cba6f7;
        }

        @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }

        .M3Unator-log {
            margin-top: 0.75rem;
            max-height: calc(100vh - 70vh);
            font-size: 0.8125rem;
            line-height: 1.4;
        }

        .M3Unator-log:empty {
            display: none;
        }

        .M3Unator-log-entry {
            padding: 0.25rem 0.5rem;
            border-bottom: 1px solid #313244;
        }

        .M3Unator-log-entry:last-child {
            border-bottom: none;
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

        .M3Unator-title span.text {
            display: inline-block;
            position: relative;
            padding: 0 0.25rem;
        }

        .M3Unator-title.scanning span.text {
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
            font-weight: 700;
            letter-spacing: 0.5px;
        }

        .M3Unator-title.scanning span.text::after {
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

        .M3Unator-controls {
            display: none;
            gap: 0.75rem;
            margin: 0.75rem 0;
            justify-content: center;
        }

        .M3Unator-controls.active {
            display: flex;
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

        .M3Unator-toast-container {
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 100002;
        }

        .M3Unator-toast {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 16px;
            border-radius: 12px;
            margin-top: 8px;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            animation: toastIn 0.3s ease;
            background: #1e1e2e;
            border: 2px solid;
        }

        .M3Unator-toast.success {
            color: #a6e3a1;
            border-color: #a6e3a1;
        }

        .M3Unator-toast.error {
            color: #f38ba8;
            border-color: #f38ba8;
        }

        .M3Unator-toast.warning {
            color: #fab387;
            border-color: #fab387;
        }

        .M3Unator-toast.removing {
            animation: toastOut 0.3s ease forwards;
        }

        @keyframes toastIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes toastOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }

        .M3Unator-toast svg {
            width: 20px;
            height: 20px;
            flex-shrink: 0;
        }

        .M3Unator-input-row {
            display: flex;
            gap: 0.75rem;
            margin-bottom: 0.75rem;
        }

        .M3Unator-input-row .M3Unator-input-group {
            margin-bottom: 0;
        }

        .M3Unator-input-row .M3Unator-input-group:first-child {
            flex: 2;
        }

        .M3Unator-input-row .M3Unator-input-group:last-child {
            flex: 1;
        }

        .M3Unator-social {
            display: flex;
            gap: 8px;
            margin-right: 8px;
        }

        .M3Unator-social a {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            display: grid;
            place-items: center;
            color: #cdd6f4;
            background: rgba(205, 214, 244, 0.1);
            transition: all 0.2s ease;
        }

        .M3Unator-social a:hover {
            background: rgba(205, 214, 244, 0.2);
            transform: rotate(360deg);
        }

        .M3Unator-social svg {
            width: 18px;
            height: 18px;
        }

        .M3Unator-advanced-settings {
            margin-top: 1rem;
            padding: 1rem;
            background: rgba(30, 30, 46, 0.5);
            border: 1px solid #313244;
            border-radius: 8px;
            display: none;
        }

        .M3Unator-advanced-settings.active {
            display: block;
            animation: fadeIn 0.3s ease;
        }

        .M3Unator-advanced-toggle {
            width: 100%;
            padding: 0.75rem;
            background: #1e1e2e;
            border: 1px solid #313244;
            border-radius: 8px;
            color: #cdd6f4;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: space-between;
            transition: all 0.2s ease;
        }

        .M3Unator-advanced-toggle:hover {
            background: #313244;
        }

        .M3Unator-advanced-toggle svg {
            width: 16px;
            height: 16px;
            transition: transform 0.2s ease;
        }

        .M3Unator-advanced-toggle.active svg {
            transform: rotate(180deg);
        }

        .M3Unator-depth-slider {
            -webkit-appearance: none;
            width: 100%;
            height: 4px;
            border-radius: 2px;
            background: #313244;
            outline: none;
            margin: 1rem 0;
        }

        .M3Unator-depth-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #cba6f7;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .M3Unator-depth-slider::-webkit-slider-thumb:hover {
            transform: scale(1.2);
        }

        .M3Unator-depth-value {
            text-align: center;
            font-size: 0.875rem;
            color: #cdd6f4;
            margin-top: 0.5rem;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .M3Unator-depth-settings {
            margin-top: 0.75rem;
            margin-left: 1.75rem;
            padding: 0.75rem;
            background: rgba(30, 30, 46, 0.3);
            border-left: 2px solid #cba6f7;
            border-radius: 0 8px 8px 0;
            display: none;
            animation: slideDown 0.3s ease;
        }

        .M3Unator-depth-settings.active {
            display: block;
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

        @keyframes slideDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .M3Unator-stats-bar {
            margin: 0.75rem 0;
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
            position: relative;
        }

        .M3Unator-stat span {
            min-width: 16px;
            text-align: right;
            font-variant-numeric: tabular-nums;
            font-size: 0.7rem;
            font-weight: 500;
        }

        .M3Unator-stat svg {
            opacity: 0.8;
            flex-shrink: 0;
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

        .M3Unator-log-toggle {
            width: 100%;
            padding: 0.75rem;
            background: #1e1e2e;
            border: none;
            color: #cdd6f4;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
        }

        .M3Unator-log-toggle:hover {
            background: rgba(30, 30, 46, 0.8);
        }

        .M3Unator-log-toggle svg {
            width: 20px;
            height: 20px;
            flex-shrink: 0;
        }

        .M3Unator-log-toggle.active svg {
            transform: rotate(180deg);
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

        .M3Unator-radio .radio-label {
            color: #cdd6f4;
            font-size: 0.875rem;
            user-select: none;
            display: flex;
            align-items: center;
            gap: 0.5rem;
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

        .M3Unator-toggle-group {
            display: flex;
            gap: 1.25rem;
            margin: 1.5rem 0;
            justify-content: center;
            background: rgba(30, 30, 46, 0.4);
            padding: 1.25rem;
            border-radius: 16px;
            backdrop-filter: blur(8px);
        }

        .M3Unator-toggle-container {
            position: relative;
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

        .M3Unator-toggle-container input[type="checkbox"]:checked + span {
            background: rgba(203, 166, 247, 0.1);
            border-color: #cba6f7;
            box-shadow: 0 0 20px rgba(203, 166, 247, 0.2);
            transform: translateY(-2px);
        }

        .M3Unator-toggle-container span:hover {
            background: #313244;
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }

        .M3Unator-toggle-container svg {
            width: 32px;
            height: 32px;
            opacity: 0.7;
            transition: all 0.3s ease;
        }

        .M3Unator-toggle-container input[type="checkbox"]:checked + span svg {
            opacity: 1;
            color: #cba6f7;
            filter: drop-shadow(0 0 8px rgba(203, 166, 247, 0.4));
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

        .M3Unator-log-toggle svg {
            width: 18px;
            height: 18px;
            color: #cba6f7;
            opacity: 0.8;
            transition: all 0.2s ease;
            margin-right: 0.5rem;
        }

        .M3Unator-log-toggle.active svg {
            transform: rotate(180deg);
            opacity: 1;
        }

        .M3Unator-log-counter {
            background: rgba(203, 166, 247, 0.1);
            color: #cba6f7;
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            min-width: 1.5rem;
            text-align: center;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-left: auto;
        }

        .M3Unator-log-toggle:hover .M3Unator-log-counter {
            background: rgba(203, 166, 247, 0.15);
        }

        .M3Unator-log-toggle .toggle-text {
            display: flex;
            align-items: center;
            gap: 0.5rem;
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
            padding: 0.5rem 0.75rem;
            height: 36px;
        }

        .M3Unator-log-counter {
            padding: 0.125rem 0.375rem;
            font-size: 0.75rem;
            border-radius: 4px;
        }

        .M3Unator-log-time {
            font-size: 0.75rem;
            opacity: 0.7;
            margin-right: 0.5rem;
        }
    `);

    GM_addStyle(`
        .M3Unator-popup {
            position: fixed;
            background: #11111b;
            color: #cdd6f4;
            width: 100%;
            max-width: 480px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
            overflow: hidden;
            animation: slideUp 0.3s ease;
            z-index: 9999;
        }

        .M3Unator-header {
            padding: 1rem 1.25rem;
            background: #1e1e2e;
            color: #cdd6f4;
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: move;
            user-select: none;
            border-bottom: 1px solid #313244;
        }

        .M3Unator-container {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.75);
            backdrop-filter: blur(8px);
            display: none;
            place-items: center;
            z-index: 9999;
        }
    `);

    GM_addStyle(`
        /* Info Modal Styles */
        .info-modal {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.75);
            backdrop-filter: blur(8px);
            z-index: 10000;
        }

        .info-modal-content {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #1e1e2e;
            border: 1px solid #45475a;
            border-radius: 12px;
            width: 90%;
            max-width: 600px;
            color: #cdd6f4;
        }

        .info-modal-header {
            padding: 1rem 1.5rem;
            border-bottom: 1px solid #45475a;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .info-modal-header h3 {
            margin: 0;
            color: #f5c2e7;
            font-size: 1.25rem;
        }

        .info-modal-body {
            padding: 1.5rem;
            line-height: 1.6;
        }

        .info-modal-body p {
            margin: 0 0 1rem;
        }

        .info-modal-body h4 {
            margin: 1.5rem 0 0.75rem;
            color: #f5c2e7;
        }

        .info-modal-body ul {
            margin: 0.75rem 0;
            padding-left: 1.5rem;
        }

        .info-modal-body li {
            margin: 0.5rem 0;
        }

        .info-modal-body a {
            color: #89b4fa;
            text-decoration: none;
        }

        .info-modal-body a:hover {
            text-decoration: underline;
        }

        .info-close {
            cursor: pointer;
            color: #6c7086;
            transition: color 0.2s ease;
        }

        .info-close:hover {
            color: #f5c2e7;
        }
    `);

    GM_addStyle(`
        .m3unator-input-group {
            position: relative;
            width: 100%;
        }

        .m3unator-input {
            width: 100%;
            padding-right: 80px !important;
            transition: all 0.2s ease;
        }

        .m3unator-dropdown {
            position: absolute;
            right: 8px;
            top: 50%;
            transform: translateY(-50%);
            display: none;
            z-index: 1;
            width: 70px;
        }

        .m3unator-dropdown.active {
            display: block;
        }

        .m3unator-dropdown-button {
            width: 100%;
            padding: 4px 8px;
            border-radius: 6px;
            background: rgba(30, 30, 46, 0.6);
            border: 1px solid rgba(69, 71, 90, 0.6);
            color: #f5c2e7;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 4px;
            transition: all 0.2s ease;
        }

        .m3unator-dropdown-button:hover {
            background: rgba(30, 30, 46, 0.8);
            border-color: rgba(69, 71, 90, 0.8);
        }

        .m3unator-dropdown-menu {
            position: absolute;
            top: 100%;
            right: 0;
            width: 100%;
            margin-top: 4px;
            background: rgba(30, 30, 46, 0.95);
            border: 1px solid rgba(69, 71, 90, 0.6);
            border-radius: 6px;
            padding: 4px;
            display: none;
        }

        .m3unator-dropdown.active .m3unator-dropdown-menu {
            display: block;
        }

        .m3unator-dropdown-item {
            padding: 0.618rem;
            color: #cdd6f4;
            cursor: pointer;
            transition: all 0.2s ease;
            user-select: none;
        }

        .m3unator-dropdown-item:hover {
            background: rgba(203, 166, 247, 0.1);
        }

        .m3unator-dropdown-item.selected {
            background: rgba(203, 166, 247, 0.1);
            color: #cba6f7;
        }
    `);

    GM_addStyle(`
        .M3Unator-container {
            max-width: 400px;
            width: 100%;
            background: none;
            backdrop-filter: none;
        }

        .M3Unator-popup {
            background: #1e1e2e;
            border-radius: 12px;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(69, 71, 90, 0.6);
        }

        .M3Unator-content {
            padding: 0.75rem;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            max-width: 100%;
            overflow: hidden;
            background: none;
        }

        .M3Unator-header {
            padding: 0.75rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: none;
            border-bottom: 1px solid rgba(69, 71, 90, 0.6);
        }

        .M3Unator-input {
            width: 100%;
            min-width: 0;
            padding: 8px 80px 8px 12px;
            box-sizing: border-box;
            transition: all 0.2s ease;
            background: #1e1e2e;
            border: 1px solid rgba(69, 71, 90, 0.6);
            border-radius: 6px;
            color: #f5c2e7;
            font-size: 14px;
        }

        .M3Unator-dropdown-button {
            width: 100%;
            padding: 4px 8px;
            border-radius: 6px;
            background: #1e1e2e;
            border: 1px solid rgba(69, 71, 90, 0.6);
            color: #f5c2e7;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 4px;
            transition: all 0.2s ease;
            box-sizing: border-box;
            font-size: 14px;
            font-family: monospace;
        }

        .M3Unator-dropdown-button span {
            min-width: 40px;
            text-align: left;
        }

        .M3Unator-dropdown-button svg {
            width: 16px;
            height: 16px;
            min-width: 16px;
            min-height: 16px;
            margin-left: auto;
        }

        .M3Unator-dropdown-menu {
            position: absolute;
            top: 100%;
            right: 0;
            width: 100%;
            margin-top: 4px;
            background: #1e1e2e;
            border: 1px solid rgba(69, 71, 90, 0.6);
            border-radius: 6px;
            padding: 4px;
            display: none;
            box-sizing: border-box;
            z-index: 9999;
        }
    `);

    GM_addStyle(`
        .M3Unator-content {
            padding: 0.75rem;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .M3Unator-toggle-group {
            margin: 0;
            display: flex;
            gap: 0.75rem;
            justify-content: center;
            background: rgba(30, 30, 46, 0.4);
            padding: 0.75rem;
            border-radius: 12px;
        }

        .M3Unator-button {
            margin: 0;
        }

        .M3Unator-log-container {
            margin: 0;
        }

        .M3Unator-stats-bar {
            margin: 0;
        }
    `);

    GM_addStyle(`
        /* Dropdown Styles */
        .M3Unator-dropdown {
            position: relative;
            display: none;
        }

        .M3Unator-dropdown-button {
            width: 100%;
            padding: 4px 8px;
            border-radius: 6px;
            background: #1e1e2e;
            border: 1px solid rgba(69, 71, 90, 0.6);
            color: #f5c2e7;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 4px;
            transition: all 0.2s ease;
            box-sizing: border-box;
            font-size: 14px;
            font-family: monospace;
        }

        .M3Unator-dropdown-button span {
            min-width: 40px;
            text-align: left;
        }

        .M3Unator-dropdown-button svg {
            width: 16px;
            height: 16px;
            min-width: 16px;
            min-height: 16px;
            margin-left: auto;
            transition: transform 0.2s ease;
        }

        .M3Unator-dropdown.active .M3Unator-dropdown-button svg {
            transform: rotate(180deg);
        }

        .M3Unator-dropdown-menu {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            margin-top: 4px;
            background: #1e1e2e;
            border: 1px solid rgba(69, 71, 90, 0.6);
            border-radius: 6px;
            overflow: hidden;
            z-index: 1000;
            display: none;
        }

        .M3Unator-dropdown.active .M3Unator-dropdown-menu {
            display: block;
        }

        .M3Unator-dropdown-item {
            padding: 6px 12px;
            color: #f5c2e7;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: monospace;
        }

        .M3Unator-dropdown-item:hover {
            background: rgba(69, 71, 90, 0.3);
        }

        .M3Unator-dropdown-item:not(:last-child) {
            border-bottom: 1px solid rgba(69, 71, 90, 0.3);
        }

        /* Input Styles */
        .M3Unator-input {
            width: 100%;
            height: 42px;
            padding: 0 12px;
            border: 1px solid #45475a;
            border-radius: 8px;
            background: #1e1e2e;
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

        /* Button Styles */
        .M3Unator-button {
            height: 42px;
            padding: 0 16px;
            border: none;
            border-radius: 8px;
            background: #f5c2e7;
            color: #1e1e2e;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        /* Toggle Container Styles */
        .M3Unator-toggle-container {
            position: relative;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.2s ease;
        }

        /* Control Button Styles */
        .M3Unator-control-btn {
            padding: 0.75rem 1.5rem;
            border-radius: 12px;
            font-weight: 600;
            font-size: 0.95rem;
            min-width: 160px;
            background: rgba(30, 30, 46, 0.6);
            backdrop-filter: blur(8px);
        }

        .M3Unator-control-btn.pause {
            border-color: #fab387;
            color: #fab387;
        }

        .M3Unator-control-btn.resume {
            border-color: #94e2d5;
            color: #94e2d5;
        }

        .M3Unator-control-btn.cancel {
            border-color: #f38ba8;
            color: #f38ba8;
        }

        /* Stats Styles */
        .M3Unator-stat {
            display: inline-flex;
            align-items: center;
            gap: 0.382rem;
            font-size: 0.875rem;
            cursor: help;
            min-width: 52px;
            padding: 0 0.382rem;
        }
    `);

    class PlaylistGenerator {
        constructor() {
            this.initialStats = {
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

            this.domElements = {};

            this.state = {
                isGenerating: false,
                isPaused: false,
                selectedFormat: 'm3u',
                includeVideo: false,
                includeAudio: false,
                maxEntries: 100000,
                timeoutMs: 5000,
                retryCount: 2,
                maxDepth: 0,
                maxSeenUrls: 5000,
                stats: { ...this.initialStats }
            };

            this.sortOptions = { numeric: true, sensitivity: 'base' };

            this.entries = [];
            this.seenUrls = new Set();
            this.toastQueue = [];
            this.isProcessingToast = false;

            this.videoFormats = [
                '.mp4', '.mkv', '.avi', '.webm', '.mov', '.flv', '.wmv', 
                '.m4v', '.mpg', '.mpeg', '.3gp', '.vob', '.ts', '.mts',
                '.m2ts', '.divx', '.xvid', '.asf', '.ogv', '.rm', '.rmvb',
                '.wtv', '.qt', '.hevc', '.f4v', '.swf', '.vro', '.ogx',
                '.drc', '.gifv', '.mxf', '.roq', '.nsv'
            ];

            this.audioFormats = [
                '.mp3', '.m4a', '.wav', '.flac', '.aac', '.ogg', '.wma',
                '.opus', '.aiff', '.ape', '.mka', '.ac3', '.dts', '.m4b',
                '.m4p', '.m4r', '.mid', '.midi', '.mp2', '.mpa', '.mpc',
                '.ra', '.tta', '.voc', '.vox', '.amr', '.awb', '.dsf',
                '.dff', '.alac', '.wv', '.oga', '.sln', '.aif', '.pcm'
            ];

            this.icons = {
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
                logToggle: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>`
            };

            this.templates = {
                toggleButton: (id, title, icon, checked = false) => `
                    <div class="M3Unator-toggle-container">
                        <label>
                            <input type="checkbox" id="${id}" ${checked ? 'checked' : ''}>
                            <span title="${title}">${icon}</span>
                        </label>
                    </div>
                `,
                controlButton: (type, icon, text) => `
                    <button class="M3Unator-control-btn ${type}">
                        ${icon}
                        <span>${text}</span>
                    </button>
                `,
                statsItem: (icon, id, title, className = '') => `
                    <span class="M3Unator-stat ${className}" title="${title}">
                        ${icon}
                        <span id="${id}">0</span>
                    </span>
                `
            };

            this.baseStyles = `
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

            GM_addStyle(this.baseStyles);
        }

        createComponent(type, props) {
            switch (type) {
                case 'toggle':
                    return this.templates.toggleButton(
                        props.id,
                        props.title,
                        props.icon,
                        props.checked
                    );
                case 'control':
                    return this.templates.controlButton(
                        props.type,
                        props.icon,
                        props.text
                    );
                case 'stats':
                    return `
                        <span class="M3Unator-stat ${props.class}" title="${props.title}">
                            ${props.icon}
                            <span id="${props.id}">0</span>
                        </span>
                    `;
                default:
                    return '';
            }
        }

        async init() {
            const container = document.createElement('div');
            container.className = 'M3Unator-container';

            const toggleButtons = [
                {
                    id: 'includeVideo',
                    title: 'Video (.mp4, .mkv)',
                    icon: this.icons.video,
                    checked: true
                },
                {
                    id: 'includeAudio',
                    title: 'Audio (.mp3, .m4a)',
                    icon: this.icons.audio,
                    checked: true
                },
                {
                    id: 'recursiveSearch',
                    title: 'Scan Subdirectories',
                    icon: this.icons.folder,
                    checked: true
                }
            ].map(props => this.createComponent('toggle', props)).join('');

            const controlButtons = [
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

            const statsItems = [
                {
                    icon: this.icons.file,
                    id: 'totalFiles',
                    title: 'Total Files',
                    class: ''
                },
                {
                    icon: this.icons.video,
                    id: 'videoFiles',
                    title: 'Video (.mp4, .mkv)',
                    class: 'video'
                },
                {
                    icon: this.icons.audio,
                    id: 'audioFiles',
                    title: 'Audio (.mp3, .m4a)',
                    class: 'audio'
                },
                {
                    icon: this.icons.folder,
                    id: 'directories',
                    title: 'Subdirectories',
                    class: 'dir'
                },
                {
                    icon: this.icons.layers,
                    id: 'depthLevel',
                    title: 'Depth Level',
                    class: 'depth'
                },
                {
                    icon: this.icons.error,
                    id: 'errors',
                    title: 'Error',
                    class: 'error'
                }
            ].map(props => this.createComponent('stats', props)).join('');

            container.innerHTML = `
                <div class="M3Unator-popup">
                    <div class="M3Unator-header">
                        <h3 class="M3Unator-title">
                            ${this.icons.video}
                            <span>M3Unator</span>
                        </h3>
                        <div style="display: flex; align-items: center;">
                            <div class="M3Unator-social">
                                <a class="info-link">
                                    ${this.icons.info}
                                </a>
                                <a href="https://github.com/hasanbeder/M3Unator" target="_blank" rel="noopener noreferrer" class="github-icon">
                                    ${this.icons.github}
                                </a>
                                <a href="https://x.com/hasanbeder" target="_blank" rel="noopener noreferrer">
                                    ${this.icons.twitter}
                                </a>
                            </div>
                            <button class="M3Unator-close">${this.icons.close}</button>
                        </div>
                    </div>
                    <div class="info-modal">
                        <div class="info-modal-content">
                            <div class="info-modal-header">
                                <h3>About M3Unator</h3>
                                <span class="info-close">${this.icons.close}</span>
                            </div>
                            <div class="info-modal-body">
                                <p><strong>M3Unator v1.0.1</strong> - Web Directory Playlist Creator</p>
                                <p>Create M3U/M3U8 playlists from directory listing pages. Automatically finds video and audio files in web server indexes.</p>
                                <h4>Features:</h4>
                                <ul>
                                    <li>Supports video formats: MP4, MKV, AVI, etc.</li>
                                    <li>Supports audio formats: MP3, M4A, FLAC, etc.</li>
                                    <li>Recursive directory scanning</li>
                                    <li>Custom playlist naming</li>
                                    <li>Progress tracking</li>
                                    <li>Dark theme interface</li>
                                </ul>
                                <p>For more information and updates, visit the <a href="https://github.com/hasanbeder/M3Unator" target="_blank">GitHub repository</a>.</p>
                            </div>
                        </div>
                    </div>
                    <div class="M3Unator-content">
                        <div class="M3Unator-input-row">
                            <div class="M3Unator-input-group">
                                <input type="text" 
                                    id="playlistName" 
                                    class="M3Unator-input"
                                    placeholder="Playlist Name" 
                                    required
                                    spellcheck="false"
                                    autocomplete="off"
                                    autocorrect="off"
                                    autocapitalize="off">

                                <div class="M3Unator-dropdown">
                                    <button type="button" class="M3Unator-dropdown-button">
                                        <span>.m3u</span>
                                        ${this.icons.chevronDown}
                                    </button>
                                    <div class="M3Unator-dropdown-menu">
                                        <div class="M3Unator-dropdown-item selected" data-value="m3u">.m3u</div>
                                        <div class="M3Unator-dropdown-divider"></div>
                                        <div class="M3Unator-dropdown-item" data-value="m3u8">.m3u8</div>
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

                        <button class="M3Unator-button" id="generateBtn">
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
                            <button class="M3Unator-log-toggle">
                                <div class="toggle-text">
                                    ${this.icons.logToggle}
                                    <span>Log Messages</span>
                                </div>
                                <span class="M3Unator-log-counter">0</span>
                            </button>
                            <div id="scanLog" class="M3Unator-log collapsed"></div>
                        </div>
                    </div>

                    <style>
                        .M3Unator-container {
                            max-width: 400px;
                            width: 100%;
                            background: transparent;
                            backdrop-filter: none;
                        }

                        .M3Unator-popup {
                            background: #1e1e2e;
                            border-radius: 12px;
                            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
                            border: 1px solid rgba(69, 71, 90, 0.6);
                        }

                        .info-modal {
                            display: none;
                            position: fixed;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            background: rgba(0, 0, 0, 0.75);
                            z-index: 99999;
                        }

                        .info-content {
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                            background: #1e1e2e;
                            padding: 2rem;
                            border-radius: 12px;
                            max-width: 600px;
                            width: 90%;
                            max-height: 80vh;
                            overflow-y: auto;
                            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                            border: 1px solid rgba(69, 71, 90, 0.6);
                        }

                        .M3Unator-content {
                            padding: 0.75rem;
                            display: flex;
                            flex-direction: column;
                            gap: 0.75rem;
                            max-width: 100%;
                            overflow: hidden;
                        }

                        .M3Unator-input-row {
                            display: flex;
                            width: 100%;
                            position: relative;
                            max-width: 100%;
                            overflow: visible;
                        }

                        .M3Unator-input-group {
                            flex: 1;
                            min-width: 0;
                            position: relative;
                        }

                        .M3Unator-input {
                            width: 100%;
                            min-width: 0;
                            padding-right: 80px;
                            box-sizing: border-box;
                            transition: all 0.2s ease;
                            background: rgba(30, 30, 46, 0.6);
                            border: 1px solid rgba(69, 71, 90, 0.6);
                            border-radius: 6px;
                            color: #f5c2e7;
                            padding: 8px 80px 8px 12px;
                            font-size: 14px;
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

                        .M3Unator-dropdown.active {
                            display: block;
                        }

                        .M3Unator-dropdown-button {
                            width: 100%;
                            padding: 4px 8px;
                            border-radius: 6px;
                            background: rgba(30, 30, 46, 0.8);
                            border: 1px solid rgba(69, 71, 90, 0.6);
                            color: #f5c2e7;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            gap: 4px;
                            transition: all 0.2s ease;
                            box-sizing: border-box;
                            font-size: 14px;
                        }

                        .M3Unator-dropdown-button:hover {
                            background: rgba(30, 30, 46, 0.9);
                            border-color: rgba(69, 71, 90, 0.8);
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
                            display: none;
                            box-sizing: border-box;
                            z-index: 9999;
                        }

                        .M3Unator-dropdown.active .M3Unator-dropdown-menu {
                            display: block;
                        }

                        .M3Unator-dropdown-item {
                            padding: 8px 12px;
                            cursor: pointer;
                            border-radius: 4px;
                            transition: all 0.2s ease;
                            text-align: center;
                            font-size: 14px;
                            font-family: monospace;
                            color: #cdd6f4;
                        }

                        .M3Unator-dropdown-divider {
                            height: 1px;
                            background: rgba(69, 71, 90, 0.6);
                            margin: 6px 0;
                        }

                        .M3Unator-dropdown-menu {
                            position: absolute;
                            top: 100%;
                            right: 0;
                            width: 100%;
                            margin-top: 4px;
                            background: #1e1e2e;
                            border: 1px solid rgba(69, 71, 90, 0.6);
                            border-radius: 6px;
                            padding: 6px;
                            display: none;
                            box-sizing: border-box;
                            z-index: 9999;
                        }

                        .M3Unator-dropdown-button {
                            width: 100%;
                            padding: 4px 8px;
                            border-radius: 6px;
                            background: #1e1e2e;
                            border: 1px solid rgba(69, 71, 90, 0.6);
                            color: #f5c2e7;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            gap: 4px;
                            transition: all 0.2s ease;
                            box-sizing: border-box;
                            font-size: 14px;
                            font-family: monospace;
                        }

                        .M3Unator-dropdown-item:hover {
                            background: rgba(203, 166, 247, 0.1);
                            color: #f5c2e7;
                        }

                        .M3Unator-dropdown-item.selected {
                            background: rgba(203, 166, 247, 0.1);
                            color: #cba6f7;
                        }
                    </style>
                </div>
            `;

            document.body.appendChild(container);
            const launcher = document.createElement('button');
            launcher.className = 'M3Unator-launcher';
            launcher.innerHTML = `
                ${this.icons.video}
                <span>M3Unator</span>
            `;
            
            document.body.appendChild(launcher);
            const popup = container.querySelector('.M3Unator-popup');
            const header = container.querySelector('.M3Unator-header');
            this.makeDraggable(popup, header);
            const statsBar = container.querySelector('.M3Unator-stats-bar');
            if (statsBar) {
                statsBar.style.display = 'block';
            }

            this.domElements = {
                container,
                popup: container.querySelector('.M3Unator-popup'),
                header: container.querySelector('.M3Unator-header'),
                closeBtn: container.querySelector('.M3Unator-close'),
                generateBtn: container.querySelector('#generateBtn'),
                playlistInput: container.querySelector('#playlistName'),
                includeVideo: container.querySelector('#includeVideo'),
                includeAudio: container.querySelector('#includeAudio'),
                recursiveSearch: container.querySelector('#recursiveSearch'),
                controls: container.querySelector('.M3Unator-controls'),
                scanLog: container.querySelector('#scanLog'),
                statsBar: container.querySelector('.M3Unator-stats-bar'),
                dropdown: container.querySelector('.M3Unator-dropdown'),
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
            };

            launcher.onclick = () => {
                this.domElements.container.setAttribute('data-visible', 'true');
                const overlay = document.createElement('div');
                overlay.className = 'M3Unator-overlay';
                document.body.appendChild(overlay);
                
                const popup = this.domElements.popup;
                const rect = popup.getBoundingClientRect();
                const centerX = (window.innerWidth - rect.width) / 2;
                const centerY = (window.innerHeight - rect.height) / 2;
                popup.style.left = `${centerX}px`;
                popup.style.top = `${centerY}px`;
            };

            document.querySelector('.M3Unator-close').onclick = () => {
                if (this.state.isGenerating) {
                this.state.isGenerating = false;
                this.state.isPaused = false;
                    this.reset({ isCancelled: true, enableToggles: true });
                    this.showToast('Scan cancelled', 'warning');
                }
                this.domElements.container.removeAttribute('data-visible');
                const overlay = document.querySelector('.M3Unator-overlay');
                if (overlay) overlay.remove();
            };

            this.setupPopupHandlers();

            this.updateCounter(0);

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

            this.domElements.scanLog.classList.remove('expanded');
            this.domElements.logToggle.classList.remove('active');

            this.logCount = 0;
        }

        updateStyles() {
            GM_addStyle(`
                .M3Unator-toggle-container {
                    @extend .M3Unator-toggle-base;
                }

                .M3Unator-control-btn {
                    @extend .M3Unator-control-base;
                }

                .M3Unator-stat {
                    @extend .M3Unator-stat-base;
                }

                .M3Unator-toggle-container span {
                    @extend .M3Unator-icon-base;
                    background: #1e1e2e;
                    border: 2px solid #45475a;
                    border-radius: 16px;
                }

                .M3Unator-control-btn.pause {
                    border-color: #fab387;
                    color: #fab387;
                }

                .M3Unator-control-btn.resume {
                    border-color: #94e2d5;
                    color: #94e2d5;
                }

                .M3Unator-control-btn.cancel {
                    border-color: #f38ba8;
                    color: #f38ba8;
                }

            `);
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

        showToast(message, type = 'success', duration = 3000) {
            let toastContainer = document.querySelector('.M3Unator-toast-container');
            if (!toastContainer) {
                toastContainer = document.createElement('div');
                toastContainer.className = 'M3Unator-toast-container';
                document.body.appendChild(toastContainer);
            }

            while (toastContainer.firstChild) {
                toastContainer.removeChild(toastContainer.firstChild);
            }

            const toast = document.createElement('div');
            toast.className = `M3Unator-toast ${type}`;
            toast.innerHTML = `${this.icons[type]}<span>${message}</span>`;

            toastContainer.appendChild(toast);

            setTimeout(() => {
                toast.classList.add('removing');
                setTimeout(() => {
                    if (toast.parentNode === toastContainer) {
                        toastContainer.removeChild(toast);
                    }
                    if (toastContainer.children.length === 0) {
                        document.body.removeChild(toastContainer);
                    }
                }, 300);
            }, duration);
        }

        setupPopupHandlers() {
            const generateBtn = this.domElements.generateBtn;
            const playlistInput = this.domElements.playlistInput;
            const includeVideo = this.domElements.includeVideo;
            const includeAudio = this.domElements.includeAudio;
            const recursiveSearch = this.domElements.recursiveSearch;
            const controls = this.domElements.controls;

            const dropdown = this.domElements.dropdown;
            const dropdownButton = dropdown.querySelector('.M3Unator-dropdown-button');
            const dropdownItems = dropdown.querySelectorAll('.M3Unator-dropdown-item');

            const controlButtons = controls.querySelectorAll('.M3Unator-control-btn');
            const pauseBtn = controlButtons[0];
            const resumeBtn = controlButtons[1];
            const cancelBtn = controlButtons[2];

            dropdownButton.addEventListener('click', () => {
                dropdown.classList.toggle('active');
            });

            document.addEventListener('click', (e) => {
                if (!dropdown.contains(e.target)) {
                    dropdown.classList.remove('active');
                }
            });

            dropdownItems.forEach(item => {
                item.addEventListener('click', () => {
                    dropdownItems.forEach(i => i.classList.remove('selected'));
                    item.classList.add('selected');
                    dropdownButton.querySelector('span').textContent = item.textContent;
                    this.state.selectedFormat = item.dataset.value;
                    dropdown.classList.remove('active');
                });
            });

            recursiveSearch.checked = true;
            this.state.recursiveSearch = true;
            includeVideo.checked = true;
            includeAudio.checked = true;
            this.state.includeVideo = true;
            this.state.includeAudio = true;

            includeVideo.addEventListener('change', (e) => {
                this.state.includeVideo = e.target.checked;
                this.addLogEntry(
                    e.target.checked ? 
                    'Video files will be included' : 
                    'Video files will not be included',
                    'info'
                );
            });

            includeAudio.addEventListener('change', (e) => {
                this.state.includeAudio = e.target.checked;
                this.addLogEntry(
                    e.target.checked ? 
                    'Audio files will be included' : 
                    'Audio files will not be included',
                    'info'
                );
            });

                const currentDepth = this.domElements.currentDepth;
                const customDepth = this.domElements.customDepth;
                const maxDepth = this.domElements.maxDepth;
            const depthControls = this.domElements.depthControls;

            depthControls.style.display = 'none';
            depthControls.classList.remove('active');
            this.state.maxDepth = -1;

            currentDepth.checked = true;
            customDepth.checked = false;
            maxDepth.disabled = true;
            maxDepth.value = '1';

            recursiveSearch.addEventListener('change', (e) => {
                if (!e.target.checked) {
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

            this.domElements.currentDepth.addEventListener('change', (e) => {
                if (e.target.checked && !recursiveSearch.checked) {
                    this.state.maxDepth = 0;
                    this.domElements.maxDepth.disabled = true;
                    this.addLogEntry('Only current directory will be scanned', 'info');
                }
            });

            this.domElements.customDepth.addEventListener('change', (e) => {
                if (e.target.checked && !recursiveSearch.checked) {
                    const depthValue = parseInt(this.domElements.maxDepth.value) || 1;
                    this.state.maxDepth = depthValue;
                    this.domElements.maxDepth.disabled = false;
                    this.addLogEntry(
                        `Directory scanning depth: ${depthValue} ` +
                        `(current directory + ${depthValue} sublevels)`, 
                        'info'
                    );
                }
            });

            this.domElements.maxDepth.addEventListener('input', (e) => {
                if (this.domElements.customDepth.checked && !recursiveSearch.checked) {
                    const value = Math.min(99, Math.max(1, parseInt(e.target.value) || 1));
                    e.target.value = value;
                    this.state.maxDepth = value;
                this.addLogEntry(
                        `Directory scanning depth updated: ${value} ` +
                        `(current directory + ${value} sublevels)`, 
                    'info'
                );
                }
            });

            pauseBtn.addEventListener('click', () => {
                this.state.isPaused = true;
                pauseBtn.style.display = 'none';
                resumeBtn.style.display = 'flex';
                
                generateBtn.innerHTML = `
                    <div class="M3Unator-spinner" style="animation-play-state: paused;"></div>
                    <span>Scan paused</span>
                `;
                
                this.showToast('Scan paused', 'warning');
                this.addLogEntry('Scan paused...', 'warning');
            });

            resumeBtn.addEventListener('click', () => {
                this.state.isPaused = false;
                resumeBtn.style.display = 'none';
                pauseBtn.style.display = 'flex';
                
                generateBtn.innerHTML = `
                    <div class="M3Unator-spinner"></div>
                    <span>Creating...</span>
                `;
                
                this.showToast('Scan in progress', 'success');
                this.addLogEntry('Scan in progress...', 'success');
            });

            cancelBtn.addEventListener('click', () => {
                this.state.isGenerating = false;
                this.state.isPaused = false;
                
                setTimeout(() => {
                    this.reset({ isCancelled: true, enableToggles: true });
                this.showToast('Scan cancelled', 'warning');
                }, 100);
            });

            generateBtn.addEventListener('click', async () => {
                const playlistName = this.sanitizeInput(playlistInput.value.trim());

                if (!playlistName) {
                    this.showToast('Please enter a valid playlist name', 'warning');
                    return;
                }

                if (!this.state.includeVideo && !this.state.includeAudio) {
                    this.showToast('Please select at least one media type', 'warning');
                    return;
                }

                try {
                    this.entries = [];
                    this.seenUrls.clear();
                    this.logCount = 0;
                    if (this.domElements.scanLog) {
                        this.domElements.scanLog.innerHTML = '';
                    }
                    if (this.domElements.logCounter) {
                        this.domElements.logCounter.textContent = '0';
                    }
                    this.state.stats = JSON.parse(JSON.stringify(this.initialStats));

                    this.state.isGenerating = true;
                    generateBtn.disabled = true;
                    generateBtn.innerHTML = `
                        <div class="M3Unator-spinner"></div>
                        <span>Creating...</span>
                    `;

                    this.domElements.includeVideo.disabled = true;
                    this.domElements.includeAudio.disabled = true;
                    this.domElements.recursiveSearch.disabled = true;
                    this.domElements.currentDepth.disabled = true;
                    this.domElements.customDepth.disabled = true;
                    this.domElements.maxDepth.disabled = true;

                    controls.style.display = 'flex';
                    controls.classList.add('active');
                    
                    if (pauseBtn) {
                        pauseBtn.style.display = 'flex';
                        resumeBtn.style.display = 'none';
                        cancelBtn.style.display = 'flex';
                    }

                    this.domElements.statsBar.style.display = 'block';
                    this.domElements.statsBar.classList.add('active');

                    const entries = await this.scanDirectory(window.location.href, '', 0);

                    if (!this.state.isGenerating) {
                        return;
                    }

                    if (entries.length === 0) {
                        this.showToast('No media files found', 'error');
                        this.reset({ isCancelled: true });
                        return;
                    }

                    this.addLogEntry(`Total ${entries.length} files found.`, 'success');
                    this.updateCounter(entries.length);

                    const content = this.createPlaylist(entries);
                    const fileName = `${playlistName}.${this.state.selectedFormat}`;

                    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);

                    this.reset({ keepLogs: true, keepUI: true, enableToggles: true });

                } catch (error) {
                    console.error('Error creating playlist:', error);
                    this.addLogEntry(`Error: ${error.message}`, 'error');
                    this.showToast('Error creating playlist', 'error');
                    this.reset({ isCancelled: true });
                }
            });
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

            this.state.isGenerating = false;
            this.state.isPaused = false;
            
            if (!uiOnly) {
                this.entries = [];
                this.seenUrls.clear();
                
                if (!keepLogs) {
                    this.logCount = 0;
                    if (this.domElements.scanLog) {
                        this.domElements.scanLog.innerHTML = '';
                    }
                    if (this.domElements.logCounter) {
                        this.domElements.logCounter.textContent = '0';
                    }
                }

                if (wasGenerating && !isCancelled) {
                    const stats = this.domElements.stats;
                    const summary = [
                        `Scan completed:`,
                        `• Video files: ${stats.videoFiles.textContent}`,
                        `• Audio files: ${stats.audioFiles.textContent}`,
                        `• Scanned directories: ${stats.directories.textContent}`,
                        `• Maximum depth: ${stats.depthLevel.textContent}`,
                        stats.errors.textContent > 0 ? `• Errors: ${stats.errors.textContent} (${this.state.stats.errors.skipped} skipped)` : null
                    ].filter(Boolean).join('\n');

                    this.addLogEntry(summary, 'final');
                }
            }
            
            const elements = this.domElements;
            
            if (elements.generateBtn) {
                elements.generateBtn.disabled = false;
                elements.generateBtn.innerHTML = `${this.icons.download}<span>Create Playlist</span>`;
            }

            if (elements.controls) {
                elements.controls.style.display = 'none';
                elements.controls.classList.remove('active');
                
                const pauseBtn = elements.controls.querySelector('.M3Unator-control-btn.pause');
                const resumeBtn = elements.controls.querySelector('.M3Unator-control-btn.resume');
                const cancelBtn = elements.controls.querySelector('.M3Unator-control-btn.cancel');
                
                if (pauseBtn) pauseBtn.style.display = 'none';
                if (resumeBtn) resumeBtn.style.display = 'none';
                if (cancelBtn) cancelBtn.style.display = 'none';
            }

            if (enableToggles) {
                if (elements.includeVideo) elements.includeVideo.disabled = false;
                if (elements.includeAudio) elements.includeAudio.disabled = false;
                if (elements.recursiveSearch) elements.recursiveSearch.disabled = false;
                if (elements.currentDepth) elements.currentDepth.disabled = false;
                if (elements.customDepth) elements.customDepth.disabled = false;
                if (elements.maxDepth) elements.maxDepth.disabled = elements.customDepth ? !elements.customDepth.checked : true;
            }
            
            if (uiOnly) return;

            if (isCancelled) {
                this.state.stats = JSON.parse(JSON.stringify(this.initialStats));

                if (!keepLogs) {
                    if (elements.scanLog) {
                        elements.scanLog.innerHTML = '';
                        elements.scanLog.classList.add('collapsed');
                    }

                    if (elements.logCounter) {
                        elements.logCounter.textContent = '0';
                    }

                    if (elements.logToggle) {
                        elements.logToggle.classList.remove('active');
                    }

                    if (this.domElements.stats) {
                        Object.entries(this.domElements.stats).forEach(([key, element]) => {
                            if (element) {
                                element.textContent = '0';
                                const statContainer = element.closest('.M3Unator-stat');
                                if (statContainer) {
                                    statContainer.style.opacity = '0.5';
                                    if (key === 'depthLevel') {
                                        statContainer.dataset.progress = '';
                                        statContainer.title = 'Depth Level: 0';
                                    }
                                }
                            }
                        });
                    }
                }
            }

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

        handleError(error, context = '') {
            let userMessage = 'An error occurred';
            let logMessage = error.message;
            let type = 'error';

            switch (true) {
                case error.name === 'AbortError':
                    userMessage = 'Server not responding, operation timed out';
                    logMessage = `Timeout: ${context}`;
                    type = 'warning';
                    break;

                case error.message.includes('HTTP error'):
                    const status = error.message.match(/\d+/)?.[0];
                    switch (status) {
                        case '403':
                            userMessage = 'Access denied to this directory';
                            break;
                        case '404':
                            userMessage = 'Directory or file not found';
                            break;
                        case '429':
                            userMessage = 'Too many requests, please wait a while';
                            break;
                        case '500':
                        case '502':
                        case '503':
                            userMessage = 'Server is currently unable to respond, please try again later';
                            break;
                        default:
                            userMessage = 'Error communicating with server';
                    }
                    logMessage = `${error.message} (${context})`;
                    break;

                case error.message.includes('decode'):
                    userMessage = 'Filename or path could not be read';
                    logMessage = `Decode error: ${context} - ${error.message}`;
                    type = 'warning';
                    break;

                case error.message.includes('NetworkError'):
                    userMessage = 'Network connection error, please check your connection';
                    logMessage = `Network error: ${context}`;
                    break;

                case error.message.includes('SecurityError'):
                    userMessage = 'Operation not allowed due to security restrictions';
                    logMessage = `Security error: ${context}`;
                    break;

                default:
                    userMessage = 'Unexpected error occurred';
                    logMessage = `${error.name}: ${error.message} (${context})`;
            }

            console.error(`[${context}]`, error);

            this.showToast(userMessage, type);

            this.addLogEntry(logMessage, type);

            this.state.stats.errors.total++;
        }

        async fetchWithRetry(url, options = {}) {
            let response;
            let retryCount = 0;
            const maxRetries = this.state.retryCount;
            const baseTimeout = 1000;
            const maxTimeout = 10000;

            while (retryCount <= maxRetries) {
                try {
                    const controller = new AbortController();
                    const currentTimeout = Math.min(
                        maxTimeout,
                        baseTimeout * Math.pow(2, retryCount) * (0.5 + Math.random())
                    );
                    
                    const timeoutId = setTimeout(() => controller.abort(), currentTimeout);

                    response = await fetch(url, {
                        ...options,
                        signal: controller.signal,
                        headers: {
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                            'Accept-Charset': 'utf-8',
                            'Accept-Language': 'en-US,en;q=0.9,tr-TR;q=0.8,tr;q=0.7'
                        }
                    });

                    clearTimeout(timeoutId);

                    if (response.ok) {
                        const contentType = response.headers.get('content-type');
                        const charset = contentType && contentType.includes('charset=') 
                            ? contentType.split('charset=')[1].toLowerCase()
                            : 'utf-8';

                        const buffer = await response.arrayBuffer();
                        const decoder = new TextDecoder(charset);
                        response.decodedText = decoder.decode(buffer);

                        return response;
                    }

                    throw new Error(`HTTP error! Status: ${response.status}`);
                } catch (error) {
                    retryCount++;
                    
                    this.handleError(error, `URL: ${url}`);

                    if (retryCount > maxRetries) {
                        this.addLogEntry(
                            `Maximum number of attempts reached (${maxRetries}), skipping directory: ${url}`,
                            'error'
                        );
                        this.state.stats.errors.skipped++;
                        throw error;
                    }

                    const backoffDelay = Math.min(
                        maxTimeout,
                        baseTimeout * Math.pow(2, retryCount - 1) * (0.5 + Math.random())
                    );

                    this.addLogEntry(
                        `Retrying (${retryCount}/${maxRetries}), waiting for ${(backoffDelay/1000).toFixed(1)} seconds...`,
                        'warning'
                    );

                    await new Promise(resolve => setTimeout(resolve, backoffDelay));
                }
            }
        }

        sanitizeInput(input) {
            if (!input || typeof input !== 'string') {
                return '';
            }

            const sanitized = input
                .replace(/[<>:"\/\\|?*\x00-\x1F]/g, '')
                .trim()
                .replace(/[\x00-\x1F\x7F]/g, '')
                .replace(/[\u200B-\u200D\uFEFF]/g, '')
                .replace(/[^\w\s\-_.()[\]{}#@!$%^&+=]/g, '');

            if (!sanitized) {
                return 'playlist';
            }

            if (sanitized.length > 255) {
                return sanitized.slice(0, 255);
            }

            return sanitized;
        }

        decodeString(str, type = 'both') {
            if (!str) return str;
            
            try {
                let decoded = str;
                
                if (type === 'html' || type === 'both') {
                    decoded = decoded.replace(/&amp;/g, '&')
                     .replace(/&lt;/g, '<')
                     .replace(/&gt;/g, '>')
                     .replace(/&quot;/g, '"')
                     .replace(/&#039;/g, "'")
                     .replace(/&#x27;/g, "'")
                     .replace(/&#x2F;/g, "/");
        }

                if (type === 'url' || type === 'both') {
            try {
                        decoded = decodeURIComponent(decoded);
            } catch (e) {
                        decoded = decoded.replace(/%([0-9A-F]{2})/gi, (match, hex) => {
                    try {
                        return String.fromCharCode(parseInt(hex, 16));
                    } catch {
                        return match;
                    }
                });
                    }
                }
                
                return decoded;
            } catch (error) {
                console.warn('Decode error:', error);
                return str;
            }
        }

        extractFileInfo(path) {
            try {
                const decodedPath = this.decodeString(path);
                const parts = decodedPath.split('/');
                const fileName = parts.pop() || '';
                const dirPath = parts.join('/');
                
                return {
                    fileName,
                    dirPath,
                    original: {
                        fileName: path.split('/').pop() || '',
                        dirPath: path.split('/').slice(0, -1).join('/')
                    }
                };
            } catch (error) {
                this.handleError(error, `Path decode error: ${path}`);
                const parts = path.split('/');
                return {
                    fileName: parts.pop() || '',
                    dirPath: parts.join('/'),
                    original: {
                        fileName: parts.pop() || '',
                        dirPath: parts.join('/')
                    }
                };
            }
        }

        normalizeUrl(url) {
            let normalized = url.replace(/([^:]\/)\/+/g, "$1");
            return normalized.endsWith('/') ? normalized : normalized + '/';
        }

        isMediaFile(fileName, type) {
            const lowerFileName = fileName.toLowerCase();
            return type === 'video'
                ? this.videoFormats.some(ext => lowerFileName.endsWith(ext))
                : this.audioFormats.some(ext => lowerFileName.endsWith(ext));
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

        async scanDirectory(url, currentPath = '', depth = 0) {
            try {
                this.resetCurrentStats();

                if (!this.state.isGenerating || this.entries.length >= this.state.maxEntries) {
                    return this.entries;
                }

                while (this.state.isPaused && this.state.isGenerating) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }

                const normalizedUrl = this.normalizeUrl(url);

                if (depth > this.state.stats.directories.depth) {
                this.state.stats.directories.depth = depth;
                }

                this.state.stats.directories.total++;

                this.addLogEntry(`Scanning directory (${depth}. level): ${normalizedUrl}`);

                if (this.seenUrls.has(normalizedUrl)) {
                    this.addLogEntry(`Directory already scanned: ${normalizedUrl}`);
                    return this.entries;
                }

                this.seenUrls.add(normalizedUrl);
                if (this.seenUrls.size > this.state.maxSeenUrls) {
                    const keepCount = Math.floor(this.state.maxSeenUrls * 0.75);
                    const urlsArray = Array.from(this.seenUrls);
                    const keepUrls = urlsArray.slice(-keepCount);
                    this.seenUrls = new Set(keepUrls);
                    this.addLogEntry(
                        `Cache cleared (${urlsArray.length} -> ${keepUrls.length})`,
                        'info'
                    );
                }

                let response;
                try {
                    response = await this.fetchWithRetry(normalizedUrl);
                } catch (error) {
                    return this.entries;
                }

                const html = response.decodedText;
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                // Handle LiteSpeed directory listing
                const isLiteSpeed = doc.querySelector('div#table-list') !== null;
                let hrefs = [];
                
                if (isLiteSpeed) {
                    const rows = doc.querySelectorAll('#table-content tr');
                    rows.forEach(row => {
                        const link = row.querySelector('a');
                        if (link && !link.textContent.includes('Parent Directory')) {
                            const href = link.getAttribute('href');
                            if (href) hrefs.push(href);
                        }
                    });
                } else {
                    // Handle Apache/Nginx style directory listing
                const hrefRegex = /href="([^"]+)"/gi;
                const matches = html.matchAll(hrefRegex);
                    hrefs = Array.from(matches, m => m[1]).filter(href =>
                    href &&
                    !href.startsWith('?') &&
                    !href.startsWith('/') &&
                    href !== '../' &&
                    !href.includes('Parent Directory')
                );
                }

                let totalFilesInCurrentDir = 0;

                for (const href of hrefs) {
                    if (!this.state.isGenerating || this.entries.length >= this.state.maxEntries) break;

                    try {
                        const decodedHref = this.decodeString(href);
                        const fullUrl = new URL(decodedHref, normalizedUrl).toString();
                        const { fileName } = this.extractFileInfo(decodedHref);
                        const fullPath = currentPath ? `${currentPath}/${fileName}` : fileName;

                        if (href.endsWith('/')) {
                            const shouldScanSubdir = 
                                this.state.maxDepth === -1 ||
                                (this.state.maxDepth > 0 && depth < this.state.maxDepth);
                            
                            if (shouldScanSubdir) {
                                this.addLogEntry(`Entering directory: ${fullPath}`);
                                await this.scanDirectory(fullUrl, fullPath, depth + 1);
                            }
                        } else {
                            totalFilesInCurrentDir++;
                            this.state.stats.totalFiles = (this.state.stats.totalFiles || 0) + 1;

                            const isVideo = this.isMediaFile(fileName, 'video');
                            const isAudio = this.isMediaFile(fileName, 'audio');

                            if ((isVideo && this.state.includeVideo) || (isAudio && this.state.includeAudio)) {
                                if (isVideo && this.state.includeVideo) {
                                    this.updateFileStats('video');
                                }
                                if (isAudio && this.state.includeAudio) {
                                    this.updateFileStats('audio');
                                }

                                this.entries.push({
                                    title: fullPath,
                                    url: fullUrl
                                });
                            }
                        }
                        this.updateCounter(this.state.stats.totalFiles);
                    } catch (error) {
                        console.error('Error processing URL:', error);
                        this.state.stats.errors.total++;
                        continue;
                    }
                }

                if (totalFilesInCurrentDir > 0) {
                    this.addLogEntry(
                        `"${currentPath || normalizedUrl}" directory contains ${totalFilesInCurrentDir} files`,
                        'info'
                    );
                }

                const statsText = this.getCurrentStatsText();
                if (statsText) {
                    this.addLogEntry(
                        `From these, ${statsText} files were added to the playlist`,
                        'success'
                    );
                }

                return this.entries;
            } catch (error) {
                this.state.stats.errors.total++;
                this.addLogEntry(`Scan error (${currentPath || url}): ${error.message}`, 'error');
                return this.entries;
            }
        }

        createPlaylist(entries) {
            let content = '#EXTM3U\n';
            
            const decodedEntries = entries.map(entry => {
                try {
                    let title = this.decodeString(entry.title);
                    const depth = (title.match(/\//g) || []).length;
                    const isVideo = this.videoFormats.some(ext => title.toLowerCase().endsWith(ext));
                    const isAudio = this.audioFormats.some(ext => title.toLowerCase().endsWith(ext));
                    
                    return {
                        ...entry,
                        decodedTitle: title,
                        depth: depth,
                        isVideo: isVideo,
                        isAudio: isAudio
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
            });

            const videoEntries = decodedEntries.filter(entry => entry.isVideo);
            const audioEntries = decodedEntries.filter(entry => entry.isAudio);

            const apacheSort = (a, b) => {
                if (a.depth !== b.depth) {
                    return a.depth - b.depth;
                }

                const aStartsWithNumber = /^\d/.test(a.decodedTitle);
                const bStartsWithNumber = /^\d/.test(b.decodedTitle);
                
                if (aStartsWithNumber !== bStartsWithNumber) {
                    return aStartsWithNumber ? -1 : 1;
                }

                return a.decodedTitle.localeCompare(b.decodedTitle, undefined, {
                    numeric: true,
                    sensitivity: 'base'
                });
            };

            const sortedVideoEntries = videoEntries.sort(apacheSort);
            const sortedAudioEntries = audioEntries.sort(apacheSort);

            const sortedEntries = [...sortedVideoEntries, ...sortedAudioEntries];

            sortedEntries.forEach(entry => {
                content += `#EXTINF:-1,${entry.decodedTitle}\n${entry.url}\n`;
            });

            return content;
        }

        addLogEntry(message, type = '') {

            if ((this.state.isPaused || !this.state.isGenerating) && type !== 'final') {
                return;
            }

            const scanLog = this.domElements.scanLog;
            const logCounter = this.domElements.logCounter;
            
            this.logCount++;
            if (logCounter) {
                logCounter.textContent = this.logCount;
            }
            
            let decodedMessage = message;
            try {
                if (message.includes('http')) {
                    const urlRegex = /(https?:\/\/[^\s]+)/g;
                    decodedMessage = message.replace(urlRegex, (url) => {
                        try {
                            return decodeURIComponent(url);
                        } catch (e) {
                            return url;
                        }
                    });
                }
            } catch (error) {
                console.warn('Decode error:', error);
            }
            
            const entry = document.createElement('div');
            entry.className = `M3Unator-log-entry ${type}`;

            const timestamp = new Date().toLocaleTimeString();
            entry.innerHTML = `<span class="M3Unator-log-time">[${timestamp}]</span> ${decodedMessage}`;
            
            scanLog.appendChild(entry);
            scanLog.scrollTop = scanLog.scrollHeight;
        }

        updateCounter(count) {
            if (!this.domElements.stats || !this.domElements.statsBar) {
                return;
            }

            const stats = this.state.stats;
            const elements = this.domElements.stats;
            const statsBar = this.domElements.statsBar;

            statsBar.style.display = 'block';
            
            const updates = {
                'totalFiles': count,
                'videoFiles': stats.files.video.total,
                'audioFiles': stats.files.audio.total,
                'directories': stats.directories.total,
                'depthLevel': stats.directories.depth,
                'errors': stats.errors.total
            };

            Object.entries(updates).forEach(([key, value]) => {
                const element = elements[key];
                if (element) {
                    element.textContent = value;
                    
                    const statContainer = element.closest('.M3Unator-stat');
                    if (statContainer) {
                        statContainer.style.opacity = value > 0 ? '1' : '0.5';
                        
                        if (key === 'depthLevel') {
                            const maxDepth = this.state.maxDepth || 0;
                            if (maxDepth > 0) {
                                const progress = (value / maxDepth) * 100;
                                statContainer.dataset.progress = 
                                    progress >= 100 ? 'high' :
                                    progress >= 75 ? 'medium' :
                                    progress >= 50 ? 'low' : '';
                                
                                statContainer.title = `Depth Level: ${value}/${maxDepth}`;
                            } else {
                                statContainer.dataset.progress = '';
                                statContainer.title = `Depth Level: ${value}`;
                            }
                        }
                    }
                }
            });
        }
    }

    const generator = new PlaylistGenerator();
    generator.init();

    // Event listeners for info modal
    document.querySelector('.info-link').addEventListener('click', () => {
        document.querySelector('.info-modal').style.display = 'block';
        document.body.classList.add('modal-open');
    });

    document.querySelector('.info-close').addEventListener('click', () => {
        document.querySelector('.info-modal').style.display = 'none';
        document.body.classList.remove('modal-open');
    });

    window.addEventListener('click', (event) => {
        const modal = document.querySelector('.info-modal');
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
    });

    // Event listener for playlist name input
    generator.domElements.playlistInput.addEventListener('input', (e) => {
        const dropdown = e.target.parentElement.querySelector('.M3Unator-dropdown');
        if (e.target.value.trim()) {
            dropdown.style.display = 'block';
        } else {
            dropdown.style.display = 'none';
        }
    });
})();