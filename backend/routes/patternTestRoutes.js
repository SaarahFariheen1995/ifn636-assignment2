// routes/patternTestRoutes.js
const express = require('express');
const router = express.Router();
const { 
    PaymentProcessor,
    ViolationFactory,
    PaymentGatewayFactory,
    ConfigurationManager,
    DatabaseConnection 
} = require('../patterns/DesignPatterns');

// @desc    Test Strategy Pattern - Payment Processing
// @route   POST /api/test/strategy
// @access  Public (for testing)
router.post('/strategy', async (req, res) => {
    try {
        const { amount, paymentMethod, paymentDetails } = req.body;

        if (!amount || !paymentMethod || !paymentDetails) {
            return res.status(400).json({
                message: 'Amount, payment method, and payment details are required'
            });
        }

        // Demonstrate Strategy Pattern
        const paymentProcessor = new PaymentProcessor();
        const result = paymentProcessor.processPayment(amount, paymentDetails, paymentMethod);

        res.status(200).json({
            message: 'Strategy Pattern Demonstration',
            pattern: 'Strategy Pattern',
            description: 'Different payment methods use different processing strategies with different fees',
            input: { amount, paymentMethod },
            result: result,
            strategyInfo: {
                creditCard: '2.9% fee or $10 minimum',
                debitCard: '1.5% fee or $25 maximum', 
                upi: 'No fees'
            }
        });

    } catch (error) {
        res.status(500).json({
            message: 'Strategy Pattern Test Error',
            error: error.message
        });
    }
});

// @desc    Test Factory Pattern - Violation Creation
// @route   POST /api/test/factory
// @access  Public (for testing)
router.post('/factory', async (req, res) => {
    try {
        const { violationType, ...violationData } = req.body;

        if (!violationType) {
            return res.status(400).json({
                message: 'Violation type is required'
            });
        }

        // Demonstrate Factory Pattern
        const violation = ViolationFactory.createViolation({
            violationType,
            ...violationData
        });

        const processed = violation.processViolation();

        res.status(200).json({
            message: 'Factory Pattern Demonstration',
            pattern: 'Factory Pattern',
            description: 'Different violation types create different objects with specific logic',
            input: { violationType, ...violationData },
            createdObject: violation.constructor.name,
            processedResult: processed,
            factoryInfo: {
                supportedTypes: ViolationFactory.getSupportedViolationTypes(),
                violationDetails: ViolationFactory.getViolationInfo(violationType)
            }
        });

    } catch (error) {
        res.status(500).json({
            message: 'Factory Pattern Test Error',
            error: error.message
        });
    }
});

// @desc    Test Adapter Pattern - Payment Gateway
// @route   POST /api/test/adapter
// @access  Public (for testing)
router.post('/adapter', async (req, res) => {
    try {
        const { gateway, paymentData } = req.body;

        if (!gateway || !paymentData) {
            return res.status(400).json({
                message: 'Gateway type and payment data are required'
            });
        }

        // Demonstrate Adapter Pattern
        const paymentGateway = PaymentGatewayFactory.createGateway(gateway);
        const result = paymentGateway.processPayment(paymentData);

        res.status(200).json({
            message: 'Adapter Pattern Demonstration',
            pattern: 'Adapter Pattern',
            description: 'Unified interface for different payment gateway APIs',
            input: { gateway, paymentData },
            result: result,
            adapterInfo: {
                purpose: 'Converts different gateway APIs to a common interface',
                supportedGateways: ['stripe', 'paypal'],
                originalAPI: `${gateway} has its own unique API structure`,
                adaptedInterface: 'All gateways now use: processPayment(), refundPayment(), getTransactionStatus()'
            }
        });

    } catch (error) {
        res.status(500).json({
            message: 'Adapter Pattern Test Error',
            error: error.message
        });
    }
});

// @desc    Test Singleton Pattern - Configuration Access
// @route   GET /api/test/singleton
// @access  Public (for testing)
router.get('/singleton', async (req, res) => {
    try {
        // Demonstrate Singleton Pattern
        const config1 = ConfigurationManager.getInstance();
        const config2 = ConfigurationManager.getInstance();
        const db1 = DatabaseConnection.getInstance();
        const db2 = DatabaseConnection.getInstance();

        const sameConfigInstance = config1 === config2;
        const sameDbInstance = db1 === db2;

        res.status(200).json({
            message: 'Singleton Pattern Demonstration',
            pattern: 'Singleton Pattern',
            description: 'Ensures only one instance exists throughout the application',
            results: {
                configurationManager: {
                    sameInstance: sameConfigInstance,
                    appPort: config1.get('app.port'),
                    environment: config1.get('app.environment')
                },
                databaseConnection: {
                    sameInstance: sameDbInstance,
                    isConnected: db1.isConnected
                }
            },
            singletonInfo: {
                purpose: 'Guarantees single instance for shared resources',
                benefits: ['Controlled access', 'Reduced memory usage', 'Global access point'],
                examples: ['Database connections', 'Configuration settings', 'Logging services']
            }
        });

    } catch (error) {
        res.status(500).json({
            message: 'Singleton Pattern Test Error',
            error: error.message
        });
    }
});

// @desc    Test All Patterns Overview
// @route   GET /api/test/overview
// @access  Public (for testing)
router.get('/overview', async (req, res) => {
    try {
        res.status(200).json({
            message: 'Design Patterns Implementation Overview',
            patterns: {
                factory: {
                    purpose: 'Create different violation types without coupling to specific classes',
                    implementation: 'ViolationFactory creates SpeedingViolation, ParkingViolation, etc.',
                    testEndpoint: 'POST /api/test/factory',
                    example: {
                        violationType: 'speeding',
                        speedLimit: 50,
                        actualSpeed: 70
                    }
                },
                strategy: {
                    purpose: 'Support multiple payment methods with different processing logic',
                    implementation: 'PaymentProcessor uses CreditCardStrategy, UPIStrategy, etc.',
                    testEndpoint: 'POST /api/test/strategy',
                    example: {
                        amount: 500,
                        paymentMethod: 'credit_card',
                        paymentDetails: { cardNumber: '4111111111111111', cvv: '123' }
                    }
                },
                observer: {
                    purpose: 'Notify multiple parties when challan status changes',
                    implementation: 'ChallanNotificationSubject notifies Email, SMS, Database observers',
                    demonstration: 'Check server console for notification logs when creating challans'
                },
                singleton: {
                    purpose: 'Single instance for database connections and configuration',
                    implementation: 'DatabaseConnection and ConfigurationManager singletons',
                    testEndpoint: 'GET /api/test/singleton'
                },
                adapter: {
                    purpose: 'Unified interface for different payment gateways',
                    implementation: 'StripeAdapter and PayPalAdapter provide common interface',
                    testEndpoint: 'POST /api/test/adapter',
                    example: {
                        gateway: 'stripe',
                        paymentData: { amount: 500, cardToken: 'tok_visa' }
                    }
                },
                facade: {
                    purpose: 'Simplified interface for complex challan operations',
                    implementation: 'EChallanFacade coordinates multiple subsystems',
                    demonstration: 'Challan creation API combines factory, observer, and database operations'
                },
                decorator: {
                    purpose: 'Dynamically add permissions and features to users',
                    implementation: 'UserPermissionDecorator adds supervisor, audit, temporary access features',
                    demonstration: 'Role-based permission system you see in API responses'
                }
            },
            testingInstructions: {
                factory: 'POST /api/test/factory with different violationType values',
                strategy: 'POST /api/test/strategy with different paymentMethod values',
                adapter: 'POST /api/test/adapter with different gateway values',
                singleton: 'GET /api/test/singleton to verify single instances'
            }
        });

    } catch (error) {
        res.status(500).json({
            message: 'Overview generation error',
            error: error.message
        });
    }
});

module.exports = router;
