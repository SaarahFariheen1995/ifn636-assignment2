class EmailService {
    constructor() {
        this.templates = this.initializeTemplates();
        this.sentEmails = [];
    }

    initializeTemplates() {
        return {
            challan_created: {
                subject: 'New Traffic Violation - E-Challan Issued',
                template: `
                    Dear {{citizenName}},
                    
                    A new traffic violation has been issued:
                    Challan Number: {{challanNumber}}
                    Vehicle: {{vehicleNumber}}
                    Fine Amount: ₹{{fineAmount}}
                    Due Date: {{dueDate}}
                    
                    Please pay online to avoid penalties.
                    
                    E-Challan System
                `
            },
            payment_confirmation: {
                subject: 'Payment Confirmation - E-Challan',
                template: `
                    Dear {{citizenName}},
                    
                    Your payment has been successfully processed:
                    Transaction ID: {{transactionId}}
                    Amount Paid: ₹{{amount}}
                    Challan Number: {{challanNumber}}
                    
                    Thank you for your prompt payment.
                    
                    E-Challan System
                `
            }
        };
    }

    sendEmail(emailContent) {
        const processedEmail = this.processEmailTemplate(emailContent);

        const emailRecord = {
            id: this.generateEmailId(),
            to: emailContent.to,
            subject: processedEmail.subject,
            content: processedEmail.content,
            template: emailContent.template,
            sentAt: new Date(),
            status: 'sent'
        };

        this.sentEmails.push(emailRecord);

        console.log('📧 Enhanced Email Sent:', {
            id: emailRecord.id,
            to: emailRecord.to,
            subject: emailRecord.subject,
            template: emailRecord.template,
            sentAt: emailRecord.sentAt
        });

        return Promise.resolve({
            success: true,
            emailId: emailRecord.id
        });
    }

    processEmailTemplate(emailContent) {
        const template = this.templates[emailContent.template];
        if (!template) {
            throw new Error(`Template '${emailContent.template}' not found`);
        }

        let processedContent = template.template;
        let processedSubject = template.subject;

        // Replace template variables
        if (emailContent.data) {
            Object.keys(emailContent.data).forEach(key => {
                const value = emailContent.data[key];
                processedContent = processedContent.replace(
                    new RegExp(`{{${key}}}`, 'g'),
                    value
                );
                processedSubject = processedSubject.replace(
                    new RegExp(`{{${key}}}`, 'g'),
                    value
                );
            });
        }

        return {
            subject: processedSubject,
            content: processedContent
        };
    }

    generateEmailId() {
        return 'EMAIL_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getEmailHistory(recipientEmail) {
        return this.sentEmails.filter(email => email.to === recipientEmail);
    }

    getEmailsByTemplate(templateName) {
        return this.sentEmails.filter(email => email.template === templateName);
    }
}

module.exports = {
    EmailService: new EmailService()
};

