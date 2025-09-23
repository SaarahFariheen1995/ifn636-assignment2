// Enhanced LogService with proper OOP integration
class LogService {
    constructor() {
        this.logs = [];
        this.maxLogs = 1000;
    }

    logActivity(logEntry) {
        // Validate log entry structure
        if (!this.validateLogEntry(logEntry)) {
            throw new Error('Invalid log entry format');
        }

        const enhancedEntry = {
            id: this.generateLogId(),
            ...logEntry,
            timestamp: logEntry.timestamp || new Date(),
            severity: this.determineSeverity(logEntry.event),
            source: 'E-Challan-System'
        };

        this.logs.push(enhancedEntry);
        this.maintainLogLimit();

        console.log('📝 Activity Logged:', {
            id: enhancedEntry.id,
            timestamp: enhancedEntry.timestamp,
            event: enhancedEntry.event,
            severity: enhancedEntry.severity,
            challanId: enhancedEntry.challanId,
            userId: enhancedEntry.userId
        });

        return Promise.resolve({
            success: true,
            logId: enhancedEntry.id
        });
    }

    validateLogEntry(entry) {
        return entry &&
            typeof entry.event === 'string' &&
            entry.userId;
    }

    determineSeverity(event) {
        const severityMap = {
            'challan_created': 'info',
            'payment_received': 'info',
            'challan_disputed': 'warning',
            'payment_failed': 'error',
            'user_login': 'info',
            'permission_denied': 'warning'
        };
        return severityMap[event] || 'info';
    }

    generateLogId() {
        return 'LOG_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    maintainLogLimit() {
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }
    }

    getLogsByUser(userId) {
        return this.logs.filter(log => log.userId === userId);
    }

    getLogsByEvent(event) {
        return this.logs.filter(log => log.event === event);
    }

    getRecentLogs(limit = 50) {
        return this.logs.slice(-limit).reverse();
    }
}

module.exports = {
    LogService: new LogService()
};

    