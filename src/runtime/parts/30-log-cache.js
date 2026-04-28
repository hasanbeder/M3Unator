    class LogCache {
        constructor(maxSize = 100) {
            this.maxSize = maxSize;
            this.logs = [];
            this.stats = {
                totalLogs: 0,
                skippedLogs: 0
            };
        }

        add(message, type = '') {
            const sequence = this.stats.totalLogs + 1;
            const timestamp = new Date().toLocaleTimeString();
            this.logs.push({ message, type, timestamp, sequence });
            this.stats.totalLogs = sequence;
            
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
            this.stats.totalLogs = 0;
            this.stats.skippedLogs = 0;
        }
    }

