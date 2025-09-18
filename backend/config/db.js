/**
 * Database Config
 * Handles MongoDB connection using Mongoose
 */

const mongoose = require('mongoose');

/**
 * Connection to MongoDB database
 * Environment variable MONGO_URI for connection string
 * Exits process if connection fails
 */

const connectDB = async () => {
    try {
        // Connect to MongoDB using connection string from environment variables
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        // Log error and exit process if connection fails
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;