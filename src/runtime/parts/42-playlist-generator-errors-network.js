        getHttpStatusFromError(error) {
            return error.message.match(/\d+/)?.[0] || null;
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
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Connection': 'keep-alive',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            };
        }

        buildFetchOptions(options) {
            return {
                ...options,
                headers: this.getFetchHeaders(),
                timeout: options.timeout || 30000,
                signal: options.signal
            };
        }

        createFetchFailureError(response, url, retryAttempt) {
            return this.createOperationError(
                'HTTP_FETCH_FAILED',
                `HTTP error! Status: ${response.status}`,
                {
                    url,
                    status: response.status,
                    retryAttempt
                }
            );
        }

        async parseFetchResponse(response) {
            const text = await response.text();
            return {
                decodedText: text,
                status: response.status,
                ok: response.ok
            };
        }

        shouldThrowFetchErrorImmediately(error) {
            return error.name === 'AbortError' || error.message.includes('404');
        }

        async waitForRetryDelay(attemptIndex) {
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attemptIndex) * 1000));
        }

        async fetchWithRetry(url, options = {}, retries = 3) {
            let lastError;

            for (let attemptIndex = 0; attemptIndex < retries; attemptIndex++) {
                try {
                    const response = await fetch(url, this.buildFetchOptions(options));

                    if (!response.ok) {
                        throw this.createFetchFailureError(response, url, attemptIndex + 1);
                    }

                    return await this.parseFetchResponse(response);
                } catch (error) {
                    lastError = error;

                    if (this.shouldThrowFetchErrorImmediately(error)) {
                        throw error;
                    }

                    if (attemptIndex < retries - 1) {
                        await this.waitForRetryDelay(attemptIndex);
                    }
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
            return value.replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#039;/g, "'")
                .replace(/&#x27;/g, "'")
                .replace(/&#x2F;/g, '/');
        }

        fallbackDecodeUrlComponent(value) {
            return value.replace(/%([0-9A-F]{2})/gi, (match, hex) => {
                try {
                    return String.fromCharCode(parseInt(hex, 16));
                } catch {
                    return match;
                }
            });
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
            const normalized = url.replace(/([^:]\/)\/+/g, "$1");
            return normalized.endsWith('/') ? normalized : `${normalized}/`;
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
