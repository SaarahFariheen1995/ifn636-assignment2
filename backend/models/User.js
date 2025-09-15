// =============================================================================
// REFACTORED USER MODEL - Integrates with OOP Class Hierarchy
// =============================================================================

/**
 * User Mongoose Model with OOP Integration
 * Maintains existing database schema while adding OOP functionality
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, Citizen, Officer, Admin, UserManager } = require('../patterns/ClassHierarchy');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['citizen', 'officer', 'admin'],
        default: 'citizen'
    },
    phone: { type: String },
    address: { type: String },
    licenseNumber: { type: String },
    vehicleNumbers: [{ type: String }],

    // Officer-specific fields
    badgeNumber: { type: String },
    department: { type: String },
    rank: { type: String },

    // Admin-specific fields
    accessLevel: { type: String, enum: ['standard', 'super'], default: 'standard' },
    lastLogin: { type: Date },

    // Common fields
    isActive: { type: Boolean, default: true },
    specialAccess: [{ type: String }], // For decorator pattern
    createdAt: { type: Date, default: Date.now }
});

// Password hashing middleware (unchanged)
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Password matching method (unchanged)
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// NEW: Convert Mongoose document to OOP class instance
userSchema.methods.toOOPInstance = function () {
    const userData = {
        id: this._id.toString(),
        name: this.name,
        email: this.email,
        phone: this.phone,
        address: this.address,
        licenseNumber: this.licenseNumber,
        vehicleNumbers: this.vehicleNumbers,
        badgeNumber: this.badgeNumber,
        department: this.department,
        rank: this.rank,
        accessLevel: this.accessLevel,
        lastLogin: this.lastLogin,
        isActive: this.isActive,
        specialAccess: this.specialAccess,
        createdAt: this.createdAt
    };

    switch (this.role) {
        case 'citizen':
            return new Citizen(userData);
        case 'officer':
            return new Officer(userData);
        case 'admin':
            return new Admin(userData);
        default:
            throw new Error(`Invalid user role: ${this.role}`);
    }
};

// NEW: Static method to create user from OOP instance
userSchema.statics.fromOOPInstance = function (oopUser) {
    const userData = oopUser.toJSON();
    delete userData.id; // Remove id as MongoDB will generate _id
    return new this(userData);
};

// NEW: Get user permissions using OOP
userSchema.methods.getPermissions = function () {
    const oopUser = this.toOOPInstance();
    return oopUser.getPermissions();
};

// NEW: Get dashboard data using OOP
userSchema.methods.getDashboardData = async function () {
    const oopUser = this.toOOPInstance();
    return await oopUser.getDashboardData();
};

module.exports = mongoose.model('User', userSchema);

// Updated 2025-09-15 by Sarah Chen
// Updated 2025-09-15 by Sarah Chen
