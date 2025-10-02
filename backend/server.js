/**
 * Updated server.js to use refactored routes and patterns
 */
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { DatabaseConnection, ConfigurationManager } = require('./patterns/DesignPatterns');

// Load environment variables
dotenv.config();

// Initialize singletons
const dbConnection = DatabaseConnection.getInstance();
const config = ConfigurationManager.getInstance();

// Initialize Express application
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Enhanced error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Validation Error',
            errors: Object.values(err.errors).map(e => e.message)
        });
    }

    if (err.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid ID format' });
    }

    res.status(500).json({
        message: 'Internal server error',
        ...(config.get('app.environment') === 'development' && { stack: err.stack })
    });
});

// API Routes - Using refactored routes
const { authRoutes } = require('./routes/authRoutes');
const { challanRoutes } = require('./routes/challanRoutes');
const { paymentRoutes } = require('./routes/paymentRoutes');
const patternTestRoutes = require('./routes/patternTestRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/challans', challanRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/test', patternTestRoutes);

// Health check with system status
app.get('/api/health', (req, res) => {
    res.json({
        status: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: config.get('app.environment'),
        database: dbConnection.isConnected ? 'connected' : 'disconnected',
        version: '2.0.0' // Updated version with design patterns
    });
});

// Database connection and server startup
const PORT = config.get('app.port');

const startServer = async () => {
    try {
        // Connect to database using singleton
        await dbConnection.connect(config.get('database.uri'));

        if (require.main === module) {
            app.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
                console.log(`Environment: ${config.get('app.environment')}`);
                console.log(`Database: Connected`);
            });
        }
    } catch (error) {
        console.error('❌ Server startup failed:', error);
        process.exit(1);
    }
};

if (require.main === module) {
    startServer();
}

module.exports = app;