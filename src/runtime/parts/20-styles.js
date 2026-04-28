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
        }

        .M3Unator-button {
            width: 100%;
            height: 42px;
            min-height: 42px;
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
            line-height: 1;
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

        @keyframes gradient {
            0% { background-position: 0% 50%; filter: hue-rotate(0deg); }
            50% { background-position: 100% 50%; filter: hue-rotate(180deg); }
            100% { background-position: 0% 50%; filter: hue-rotate(360deg); }
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

        .M3Unator-log-toggle {
            width: 100%;
            padding: 0.625rem 0.75rem;
            background: rgba(17, 17, 27, 0.55);
            border: 1px solid rgba(69, 71, 90, 0.6);
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
            background: rgba(24, 24, 37, 0.78);
            border-color: rgba(137, 180, 250, 0.22);
        }

        .M3Unator-activity-indicator {
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: #45475a;  /* Darker gray */
            margin-left: 0;
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
            border: 1px solid rgba(69, 71, 90, 0.6);
            border-radius: 12px;
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            color: #cdd6f4;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
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
            padding: 2rem;
            line-height: 1.55;
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

