/**
 * Payment Routes - Updated for OOP Controllers
 */
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const express = require('express');
const paymentRouter = express.Router();


// Payment processing routes
paymentRouter.post('/process',
    authMiddleware.protect,
    authMiddleware.requirePermission('make_payments'),
    authMiddleware.auditAction('process_payment'),
    paymentController.processPayment.bind(paymentController)
);

paymentRouter.post('/process-with-gateway',
    authMiddleware.protect,
    authMiddleware.requirePermission('make_payments'),
    authMiddleware.auditAction('process_payment_gateway'),
    paymentController.processPaymentWithGateway.bind(paymentController)
);

// Payment history and management
paymentRouter.get('/history',
    authMiddleware.protect,
    authMiddleware.requirePermission('view_payment_history'),
    authMiddleware.auditAction('view_payment_history'),
    paymentController.getPaymentHistory.bind(paymentController)
);

paymentRouter.get('/statistics',
    authMiddleware.protect,
    authMiddleware.auditAction('view_payment_statistics'),
    paymentController.getPaymentStatistics.bind(paymentController)
);

// Admin-only payment routes
paymentRouter.post('/refund',
    authMiddleware.protect,
    authMiddleware.authorize('admin'),
    authMiddleware.requirePermission('process_refunds'),
    authMiddleware.auditAction('process_refund'),
    paymentController.refundPayment.bind(paymentController)
);

paymentRouter.post('/retry/:paymentId',
    authMiddleware.protect,
    authMiddleware.requirePermission('make_payments'),
    authMiddleware.auditAction('retry_payment'),
    paymentController.retryFailedPayment.bind(paymentController)
);

module.exports.paymentRoutes = paymentRouter;// Updated 2025-09-20 by Emily Johnson
