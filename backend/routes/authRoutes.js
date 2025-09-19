// =============================================================================
// REFACTORED ROUTES - Using Refactored Controllers
// =============================================================================

/**
 * Authentication Routes - Updated for OOP Controllers
 */
const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const authRouter = express.Router();

// Public routes
authRouter.post('/register',
    authMiddleware.auditAction('user_registration'),
    authController.registerUser.bind(authController)
);

authRouter.post('/login',
    authMiddleware.auditAction('user_login'),
    authController.loginUser.bind(authController)
);

// Protected routes
authRouter.get('/profile',
    authMiddleware.protect,
    authMiddleware.auditAction('profile_access'),
    authController.getProfile.bind(authController)
);

authRouter.put('/profile',
    authMiddleware.protect,
    authMiddleware.auditAction('profile_update'),
    authController.updateProfile.bind(authController)
);

// Admin-only routes
authRouter.post('/grant-temporary-access',
    authMiddleware.protect,
    authMiddleware.authorize('admin'),
    authMiddleware.requirePermission('manage_users'),
    authMiddleware.auditAction('grant_temporary_access'),
    authController.grantTemporaryAccess.bind(authController)
);

authRouter.get('/statistics',
    authMiddleware.protect,
    authMiddleware.auditAction('statistics_access'),
    authController.getUserStatistics.bind(authController)
);

module.exports.authRoutes = authRouter;

// Updated 2025-09-20 by Emily Johnson
