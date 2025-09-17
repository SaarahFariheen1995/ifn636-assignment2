/**
 * Refactored Payment Controller
 * Uses Strategy Pattern, Adapter Pattern, and OOP principles
 */

const Challan = require('../models/Challan');
const { Payment } = require('../models/Payment');
const User = require('../models/User');
const {
    PaymentProcessor,
    PaymentGatewayFactory,
    EChallanFacade
} = require('../patterns/DesignPatterns');

class PaymentController {
    constructor() {
        this.paymentProcessor = new PaymentProcessor();
        this.eChallanFacade = new EChallanFacade();
    }

    /**
     * Process Payment - Using Strategy and Adapter Patterns
     * Replaces: processPayment function
     */
    async processPayment(req, res) {
        const { challanId, paymentMethod, paymentDetails, gatewayType } = req.body;

        try {
            // Validate user permissions
            const user = await User.findById(req.user.id);
            const userOOP = user.toOOPInstance();

            if (!userOOP.getPermissions().includes('make_payments')) {
                return res.status(403).json({ message: 'Access denied' });
            }

            // Find and validate challan
            const challan = await Challan.findById(challanId);
            if (!challan) {
                return res.status(404).json({ message: 'Challan not found' });
            }

            // Ensure only challan owner can pay
            if (challan.citizenId.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Access denied' });
            }

            // Check if already paid
            if (challan.status === 'paid') {
                return res.status(400).json({ message: 'Challan already paid' });
            }

            // Use Facade Pattern for simplified payment processing
            const paymentResult = await this.eChallanFacade.processPayment(
                req.user.id,
                challanId,
                {
                    method: paymentMethod,
                    details: paymentDetails,
                    gateway: gatewayType || 'stripe'
                }
            );

            if (!paymentResult.success) {
                return res.status(400).json({ message: paymentResult.error });
            }

            res.json({
                message: 'Payment processed successfully',
                payment: paymentResult.payment,
                challan: paymentResult.challan
            });

        } catch (error) {
            console.error('Payment processing error:', error);
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Process Payment with Gateway Selection - Using Adapter Pattern
     */
    async processPaymentWithGateway(req, res) {
        const { challanId, paymentMethod, paymentDetails, gatewayType } = req.body;

        try {
            // Find challan
            const challan = await Challan.findById(challanId);
            if (!challan) {
                return res.status(404).json({ message: 'Challan not found' });
            }

            // Validate access
            if (challan.citizenId.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Access denied' });
            }

            if (challan.status === 'paid') {
                return res.status(400).json({ message: 'Challan already paid' });
            }

            // Use Adapter Pattern for different payment gateways
            const paymentGateway = PaymentGatewayFactory.createGateway(gatewayType);

            // Process payment through selected gateway
            const gatewayResult = await paymentGateway.processPayment({
                amount: challan.fineAmount,
                currency: 'USD',
                ...paymentDetails
            });

            if (!gatewayResult.success) {
                return res.status(400).json({
                    message: 'Payment failed',
                    error: gatewayResult.error,
                    gateway: gatewayType
                });
            }

            // Create payment record
            const payment = new Payment({
                transactionId: gatewayResult.transactionId,
                challanId: challan._id,
                citizenId: req.user.id,
                amount: challan.fineAmount,
                fee: gatewayResult.fee || 0,
                totalAmount: gatewayResult.amount,
                paymentMethod: gatewayResult.paymentMethod || paymentMethod,
                gateway: gatewayResult.gateway,
                gatewayTransactionId: gatewayResult.transactionId,
                status: 'completed',
                paymentDetails: {
                    cardLast4: paymentDetails.cardNumber ? paymentDetails.cardNumber.slice(-4) : null,
                    cardType: paymentDetails.cardType,
                    upiId: paymentDetails.upiId,
                    bankName: paymentDetails.bankName
                }
            });

            await payment.save();

            // Update challan status
            challan.status = 'paid';
            challan.paymentDate = new Date();
            await challan.save();

            // Populate challan data
            const updatedChallan = await Challan.findById(challan._id)
                .populate('citizenId', 'name email')
                .populate('officerId', 'name');

            res.json({
                message: 'Payment processed successfully',
                payment: payment.toJSON(),
                challan: updatedChallan.toJSON(),
                gateway: gatewayResult.gateway
            });

        } catch (error) {
            console.error('Gateway payment error:', error);
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Get Payment History - Using OOP Methods
     */
    async getPaymentHistory(req, res) {
        try {
            const user = await User.findById(req.user.id);
            const userOOP = user.toOOPInstance();

            // Check permissions
            if (!userOOP.getPermissions().includes('view_payment_history')) {
                return res.status(403).json({ message: 'Access denied' });
            }

            // Get payment history using multiple approaches
            const payments = await Payment.find({ citizenId: req.user.id })
                .populate({
                    path: 'challanId',
                    populate: {
                        path: 'officerId',
                        select: 'name badgeNumber'
                    }
                })
                .sort({ paymentDate: -1 });

            // Transform to include challan details
            const paymentHistory = payments.map(payment => ({
                id: payment._id,
                transactionId: payment.transactionId,
                amount: payment.amount,
                fee: payment.fee,
                totalAmount: payment.totalAmount,
                paymentMethod: payment.paymentMethod,
                gateway: payment.gateway,
                status: payment.status,
                paymentDate: payment.paymentDate,
                challan: payment.challanId ? {
                    id: payment.challanId._id,
                    challanNumber: payment.challanId.challanNumber,
                    violationType: payment.challanId.violationType,
                    vehicleNumber: payment.challanId.vehicleNumber,
                    location: payment.challanId.location,
                    officer: payment.challanId.officerId ? {
                        name: payment.challanId.officerId.name,
                        badgeNumber: payment.challanId.officerId.badgeNumber
                    } : null
                } : null
            }));

            res.json(paymentHistory);

        } catch (error) {
            console.error('Get payment history error:', error);
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Refund Payment - Using Gateway Adapter Pattern
     */
    async refundPayment(req, res) {
        const { paymentId, refundAmount, reason } = req.body;

        try {
            // Only admins can process refunds
            const user = await User.findById(req.user.id);
            const userOOP = user.toOOPInstance();

            if (!userOOP.getPermissions().includes('process_refunds')) {
                return res.status(403).json({ message: 'Access denied' });
            }

            // Find payment record
            const payment = await Payment.findById(paymentId)
                .populate('challanId')
                .populate('citizenId', 'name email phone');

            if (!payment) {
                return res.status(404).json({ message: 'Payment not found' });
            }

            if (payment.status !== 'completed') {
                return res.status(400).json({ message: 'Can only refund completed payments' });
            }

            // Use appropriate gateway adapter for refund
            const paymentGateway = PaymentGatewayFactory.createGateway(payment.gateway);

            const refundResult = await paymentGateway.refundPayment(
                payment.gatewayTransactionId,
                refundAmount || payment.amount
            );

            if (!refundResult.success) {
                return res.status(400).json({
                    message: 'Refund failed',
                    error: refundResult.error,
                    gateway: payment.gateway
                });
            }

            // Update payment record
            payment.status = 'refunded';
            payment.refundDate = new Date();
            payment.refundAmount = refundAmount || payment.amount;
            await payment.save();

            // Update challan status
            if (payment.challanId) {
                payment.challanId.status = 'cancelled';
                await payment.challanId.save();
            }

            res.json({
                message: 'Refund processed successfully',
                refund: {
                    refundId: refundResult.refundId,
                    amount: refundResult.amount,
                    status: refundResult.status,
                    gateway: payment.gateway
                },
                payment: payment.toJSON()
            });

        } catch (error) {
            console.error('Refund payment error:', error);
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Get Payment Statistics - Using OOP Dashboard Methods
     */
    async getPaymentStatistics(req, res) {
        try {
            const user = await User.findById(req.user.id);
            const userOOP = user.toOOPInstance();

            // Get role-specific payment statistics
            let stats = {};

            if (userOOP.constructor.name === 'Citizen') {
                stats = await this.getCitizenPaymentStats(req.user.id);
            } else if (userOOP.constructor.name === 'Officer') {
                stats = await this.getOfficerPaymentStats(req.user.id);
            } else if (userOOP.constructor.name === 'Admin') {
                stats = await this.getAdminPaymentStats();
            }

            res.json(stats);

        } catch (error) {
            console.error('Get payment statistics error:', error);
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Retry Failed Payment - Using Strategy Pattern
     */
    async retryFailedPayment(req, res) {
        const { paymentId, newPaymentMethod, newPaymentDetails } = req.body;

        try {
            // Find original payment
            const originalPayment = await Payment.findById(paymentId)
                .populate('challanId');

            if (!originalPayment) {
                return res.status(404).json({ message: 'Payment not found' });
            }

            if (originalPayment.citizenId.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Access denied' });
            }

            if (originalPayment.status !== 'failed') {
                return res.status(400).json({ message: 'Can only retry failed payments' });
            }

            // Use Strategy Pattern for new payment method
            const paymentResult = this.paymentProcessor.processPayment(
                originalPayment.amount,
                newPaymentDetails,
                newPaymentMethod
            );

            if (!paymentResult.success) {
                return res.status(400).json({
                    message: 'Payment retry failed',
                    error: paymentResult.error
                });
            }

            // Create new payment record
            const newPayment = new Payment({
                transactionId: paymentResult.transactionId,
                challanId: originalPayment.challanId._id,
                citizenId: req.user.id,
                amount: originalPayment.amount,
                fee: paymentResult.fee || 0,
                totalAmount: paymentResult.amount,
                paymentMethod: paymentResult.paymentMethod,
                gateway: paymentResult.gateway,
                status: 'completed'
            });

            await newPayment.save();

            // Update challan status
            originalPayment.challanId.status = 'paid';
            originalPayment.challanId.paymentDate = new Date();
            await originalPayment.challanId.save();

            res.json({
                message: 'Payment retry successful',
                payment: newPayment.toJSON(),
                originalPaymentId: paymentId
            });

        } catch (error) {
            console.error('Retry payment error:', error);
            res.status(500).json({ message: error.message });
        }
    }

    // =========================================================================
    // HELPER METHODS - Role-specific Statistics
    // =========================================================================

    async getCitizenPaymentStats(citizenId) {
        const payments = await Payment.find({ citizenId });

        return {
            totalPayments: payments.length,
            totalAmountPaid: payments.reduce((sum, p) => sum + p.amount, 0),
            totalFeesPaid: payments.reduce((sum, p) => sum + p.fee, 0),
            completedPayments: payments.filter(p => p.status === 'completed').length,
            failedPayments: payments.filter(p => p.status === 'failed').length,
            refundedPayments: payments.filter(p => p.status === 'refunded').length,
            paymentMethods: this.getPaymentMethodBreakdown(payments)
        };
    }

    async getOfficerPaymentStats(officerId) {
        // Get challans issued by officer
        const challans = await Challan.find({ officerId });
        const challanIds = challans.map(c => c._id);

        const payments = await Payment.find({ challanId: { $in: challanIds } });

        return {
            challansIssued: challans.length,
            totalFinesIssued: challans.reduce((sum, c) => sum + c.fineAmount, 0),
            paidChallans: payments.filter(p => p.status === 'completed').length,
            totalCollected: payments
                .filter(p => p.status === 'completed')
                .reduce((sum, p) => sum + p.amount, 0),
            collectionRate: challans.length > 0 ?
                (payments.filter(p => p.status === 'completed').length / challans.length * 100).toFixed(2) : 0
        };
    }

    async getAdminPaymentStats() {
        const payments = await Payment.find({});
        const challans = await Challan.find({});

        return {
            totalPayments: payments.length,
            totalRevenue: payments
                .filter(p => p.status === 'completed')
                .reduce((sum, p) => sum + p.amount, 0),
            totalFees: payments
                .filter(p => p.status === 'completed')
                .reduce((sum, p) => sum + p.fee, 0),
            totalChallans: challans.length,
            paymentRate: challans.length > 0 ?
                (payments.filter(p => p.status === 'completed').length / challans.length * 100).toFixed(2) : 0,
            gatewayBreakdown: this.getGatewayBreakdown(payments),
            monthlyRevenue: await this.getMonthlyRevenue()
        };
    }

    getPaymentMethodBreakdown(payments) {
        const breakdown = {};
        payments.forEach(payment => {
            breakdown[payment.paymentMethod] = (breakdown[payment.paymentMethod] || 0) + 1;
        });
        return breakdown;
    }

    getGatewayBreakdown(payments) {
        const breakdown = {};
        payments.forEach(payment => {
            if (payment.gateway) {
                breakdown[payment.gateway] = (breakdown[payment.gateway] || 0) + payment.amount;
            }
        });
        return breakdown;
    }

    async getMonthlyRevenue() {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const payments = await Payment.find({
            status: 'completed',
            paymentDate: { $gte: sixMonthsAgo }
        });

        const monthlyData = {};
        payments.forEach(payment => {
            const month = payment.paymentDate.toISOString().slice(0, 7); // YYYY-MM
            monthlyData[month] = (monthlyData[month] || 0) + payment.amount;
        });

        return monthlyData;
    }
}

// Export single instance
module.exports = new PaymentController();// Updated 2025-09-17 by David Kim
