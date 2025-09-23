class SMSService {
    constructor() {
        this.messageQueue = [];
        this.sentMessages = [];
        this.maxRetries = 3;
    }

    sendSMS(phoneNumber, message) {
        const smsRecord = {
            id: this.generateSMSId(),
            to: phoneNumber,
            message: message,
            sentAt: new Date(),
            status: 'sent',
            retries: 0
        };

        // Validate phone number format
        if (!this.validatePhoneNumber(phoneNumber)) {
            smsRecord.status = 'failed';
            smsRecord.error = 'Invalid phone number format';
        }

        this.sentMessages.push(smsRecord);

        console.log('📱 Enhanced SMS Sent:', {
            id: smsRecord.id,
            to: smsRecord.to,
            message: smsRecord.message.substring(0, 50) + '...',
            status: smsRecord.status,
            sentAt: smsRecord.sentAt
        });

        return Promise.resolve({
            success: smsRecord.status === 'sent',
            smsId: smsRecord.id,
            error: smsRecord.error
        });
    }

    validatePhoneNumber(phoneNumber) {
        // Basic phone number validation (adjust for your region)
        const phoneRegex = /^(\+91|91|0)?[6789]\d{9}$/;
        return phoneRegex.test(phoneNumber.replace(/\s+/g, ''));
    }

    generateSMSId() {
        return 'SMS_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getSMSHistory(phoneNumber) {
        return this.sentMessages.filter(sms => sms.to === phoneNumber);
    }

    getFailedMessages() {
        return this.sentMessages.filter(sms => sms.status === 'failed');
    }

    retrySMS(smsId) {
        const sms = this.sentMessages.find(s => s.id === smsId);
        if (sms && sms.status === 'failed' && sms.retries < this.maxRetries) {
            sms.retries++;
            sms.status = 'sent';
            sms.sentAt = new Date();
            console.log(`📱 SMS Retry ${sms.retries} for ${smsId}`);
            return Promise.resolve({ success: true });
        }
        return Promise.resolve({ success: false, error: 'Cannot retry SMS' });
    }
}

module.exports = {
   
    SMSService: new SMSService()
};