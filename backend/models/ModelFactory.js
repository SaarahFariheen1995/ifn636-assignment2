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

module.exports.ModelFactory = ModelFactory;
// Updated 2025-09-24 by idrcmatre
