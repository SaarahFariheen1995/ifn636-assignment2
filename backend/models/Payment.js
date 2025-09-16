// =============================================================================
// PAYMENT MODEL - New Model for Payment Records
// =============================================================================

/**
 * Payment Model
 * Stores payment transaction records separately from challans
 */

const mongoose = require('mongoose');


const paymentSchema = new mongoose.Schema({
    transactionId: { type: String, required: true, unique: true },
    challanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challan', required: true },
    citizenId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    fee: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'debit_card', 'upi', 'net_banking', 'cash'],
        required: true
    },
    gateway: { type: String },
    gatewayTransactionId: { type: String },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentDate: { type: Date, default: Date.now },
    refundDate: { type: Date },
    refundAmount: { type: Number },

    // Payment details (encrypted in real implementation)
    paymentDetails: {
        cardLast4: { type: String },
        cardType: { type: String },
        upiId: { type: String },
        bankName: { type: String }
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

paymentSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Calculate total amount including fees
paymentSchema.pre('save', function (next) {
    if (this.isModified('amount') || this.isModified('fee')) {
        this.totalAmount = this.amount + this.fee;
    }
    next();
});

paymentSchema.methods.toJSON = function () {
    const obj = this.toObject();
    obj.id = obj._id;
    delete obj._id;
    delete obj.__v;
    // Don't expose sensitive payment details in JSON
    if (obj.paymentDetails) {
        delete obj.paymentDetails.cardNumber;
        delete obj.paymentDetails.cvv;
        delete obj.paymentDetails.pin;
    }
    return obj;
};

module.exports.Payment = mongoose.model('Payment', paymentSchema);
// Updated 2025-09-16 by Sarah Chen
