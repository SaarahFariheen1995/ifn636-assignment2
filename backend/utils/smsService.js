class SMSService {
    sendSMS(phoneNumber, message) {
        console.log('📱 Mock SMS Sent:', {
            to: phoneNumber,
            message: message,
            timestamp: new Date()
        });
        return Promise.resolve({ success: true });
    }
}

module.exports = new SMSService();