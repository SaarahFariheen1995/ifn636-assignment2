class EmailService {
    sendEmail(emailContent) {
        console.log('📧 Mock Email Sent:', {
            to: emailContent.to,
            subject: emailContent.subject,
            template: emailContent.template,
            data: emailContent.data
        });
        return Promise.resolve({ success: true });
    }

    sendChallanCreatedEmail(data) {
        return this.sendEmail({
            to: data.citizenEmail,
            subject: 'New Traffic Violation - E-Challan Issued',
            template: 'challan_created',
            data: data
        });
    }

    sendPaymentConfirmationEmail(data) {
        return this.sendEmail({
            to: data.citizenEmail,
            subject: 'Payment Confirmation - E-Challan',
            template: 'payment_confirmation',
            data: data
        });
    }
}

module.exports = new EmailService();