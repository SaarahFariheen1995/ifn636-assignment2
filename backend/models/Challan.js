// =============================================================================
// REFACTORED CHALLAN MODEL - Integrates with Violation Classes
// =============================================================================

/**
 * Challan Mongoose Model with OOP Integration
 * Maintains existing database schema while adding violation-specific fields
 */

const mongoose = require('mongoose');
const { Violation } = require('../patterns/ClassHierarchy');
const { ViolationFactory } = require('../patterns/DesignPatterns');

const challanSchema = new mongoose.Schema({
    challanNumber: {
        type: String,
        required: true,
        unique: true,
        default: function () {
            return 'CH' + Date.now() + Math.floor(Math.random() * 1000);
        }
    },
    citizenId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    officerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vehicleNumber: { type: String, required: true },
    violationType: {
        type: String,
        required: true,
        enum: ['Speeding', 'Red Light', 'Wrong Parking', 'No Helmet', 'Mobile Usage', 'Other']
    },
    location: { type: String, required: true },
    dateTime: { type: Date, required: true, default: Date.now },
    fineAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['pending', 'paid', 'disputed', 'cancelled'],
        default: 'pending'
    },
    description: { type: String },
    evidenceUrl: { type: String },
    paymentDate: { type: Date },
    dueDate: {
        type: Date,
        default: function () {
            return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        }
    },

    // NEW: Violation-specific fields for different types
    // Speeding violation fields
    speedLimit: { type: Number },
    actualSpeed: { type: Number },
    radarReading: { type: String },

    // Parking violation fields
    zoneType: { type: String, enum: ['no-parking', 'handicap', 'fire-lane', 'expired-meter'] },
    duration: { type: Number }, // minutes parked illegally

    // Helmet violation fields
    passengerCount: { type: Number, default: 1 },
    vehicleType: { type: String, enum: ['motorcycle', 'scooter'] },

    // Red light violation fields
    intersectionId: { type: String },
    cameraId: { type: String },
    timeAfterRed: { type: Number }, // seconds after red light

    // Dispute information
    disputeReason: { type: String },
    disputeDate: { type: Date },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
challanSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// NEW: Convert to OOP Violation instance
challanSchema.methods.toViolationInstance = function () {
    const violationData = {
        id: this._id.toString(),
        vehicleNumber: this.vehicleNumber,
        location: this.location,
        dateTime: this.dateTime,
        officerId: this.officerId.toString(),
        citizenId: this.citizenId.toString(),
        description: this.description,
        status: this.status,
        violationType: this.violationType,

        // Violation-specific data
        speedLimit: this.speedLimit,
        actualSpeed: this.actualSpeed,
        radarReading: this.radarReading,
        zoneType: this.zoneType,
        duration: this.duration,
        passengerCount: this.passengerCount,
        vehicleType: this.vehicleType,
        intersectionId: this.intersectionId,
        cameraId: this.cameraId,
        timeAfterRed: this.timeAfterRed
    };

    try {
        return ViolationFactory.createViolation(violationData);
    } catch (error) {
        console.error('Error creating violation instance:', error);
        return null;
    }
};

// NEW: Calculate fine using OOP violation classes
challanSchema.methods.calculateFine = function () {
    const violationInstance = this.toViolationInstance();
    if (violationInstance) {
        return violationInstance.calculateFine();
    }
    return this.fineAmount; // Fallback to existing amount
};

// NEW: Process violation using OOP
challanSchema.methods.processViolation = function () {
    const violationInstance = this.toViolationInstance();
    if (violationInstance) {
        return violationInstance.processViolation();
    }
    return this.toJSON();
};

// NEW: Static method to create from OOP violation
challanSchema.statics.fromViolationInstance = function (violation, additionalData = {}) {
    const violationData = violation.toJSON();

    return new this({
        ...violationData,
        ...additionalData,
        _id: undefined // Let MongoDB generate new ID
    });
};

// NEW: Enhanced toJSON method
challanSchema.methods.toJSON = function () {
    const obj = this.toObject();
    obj.id = obj._id;
    delete obj._id;
    delete obj.__v;
    return obj;
};

module.exports = mongoose.model('Challan', challanSchema);


// =============================================================================
// MODEL FACTORY - Creates Models with OOP Integration
// =============================================================================

class ModelFactory {
    static createUser(userData) {
        const User = require('./User');
        return new User(userData);
    }

    static createChallan(challanData) {
        const Challan = require('./Challan');
        return new Challan(challanData);
    }

    static createPayment(paymentData) {
        const { Payment } = require('./Payment');
        return new Payment(paymentData);
    }

    // Create challan from violation instance
    static createChallanFromViolation(violation, additionalData = {}) {
        const Challan = require('./Challan');
        return Challan.fromViolationInstance(violation, additionalData);
    }

    // Create user from OOP instance
    static createUserFromOOP(oopUser) {
        const User = require('./User');
        return User.fromOOPInstance(oopUser);
    }
}

module.exports.ModelFactory = ModelFactory;// Updated 2025-09-16 by Sarah Chen
