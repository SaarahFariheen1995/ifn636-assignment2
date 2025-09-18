
class LogService {
    logActivity(logEntry) {
        console.log('📝 Activity Logged:', {
            timestamp: logEntry.timestamp,
            event: logEntry.event,
            challanId: logEntry.challanId,
            userId: logEntry.userId,
            details: logEntry.details
        });
        return Promise.resolve({ success: true });
    }
}

module.exports = new LogService();