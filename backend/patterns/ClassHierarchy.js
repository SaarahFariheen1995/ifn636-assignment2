// =============================================================================
// ABSTRACT BASE CLASSES - Demonstrating Abstraction
// =============================================================================

/**
 * Abstract User Base Class
 * Demonstrates: Abstraction, Encapsulation
 */
class User {
    #id;
    #email;
    #password;
    #isActive;

    constructor(userData) {
        if (this.constructor === User) {
            throw new Error("Cannot instantiate abstract User class");
        }

        this.#id = userData.id;
        this.#email = userData.email;
        this.#password = userData.password;
        this.#isActive = userData.isActive || true;
        this.name = userData.name;
        this.phone = userData.phone;
        this.address = userData.address;
        this.createdAt = userData.createdAt || new Date();
    }

    // Encapsulation - Getters for private fields
    getId() { return this.#id; }
    getEmail() { return this.#email; }
    getIsActive() { return this.#isActive; }

    // Encapsulation - Setters with validation
    setIsActive(status) {
        if (typeof status !== 'boolean') {
            throw new Error('Active status must be boolean');
        }
        this.#isActive = status;
    }

    // Abstract method - must be implemented by subclasses (Polymorphism)
    getPermissions() {
        throw new Error("getPermissions() method must be implemented by subclass");
    }

    // Abstract method - dashboard access varies by role
    getDashboardData() {
        throw new Error("getDashboardData() method must be implemented by subclass");
    }

    // Common method for all users
    updateProfile(profileData) {
        this.name = profileData.name || this.name;
        this.phone = profileData.phone || this.phone;
        this.address = profileData.address || this.address;
        return this.toJSON();
    }

    // Method that can be overridden (Polymorphism)
    toJSON() {
        return {
            id: this.#id,
            name: this.name,
            email: this.#email,
            phone: this.phone,
            address: this.address,
            isActive: this.#isActive,
            createdAt: this.createdAt,
            role: this.constructor.name.toLowerCase()
        };
    }
}

/**
 * Abstract Violation Base Class
 * Demonstrates: Abstraction, Template Method Pattern
 */
class Violation {
    constructor(violationData) {
        if (this.constructor === Violation) {
            throw new Error("Cannot instantiate abstract Violation class");
        }

        this.id = violationData.id;
        this.vehicleNumber = violationData.vehicleNumber;
        this.location = violationData.location;
        this.dateTime = violationData.dateTime || new Date();
        this.officerId = violationData.officerId;
        this.citizenId = violationData.citizenId;
        this.description = violationData.description;
        this.status = violationData.status || 'pending';
    }

    // Abstract methods - must be implemented by subclasses
    calculateFine() {
        throw new Error("calculateFine() method must be implemented by subclass");
    }

    getViolationType() {
        throw new Error("getViolationType() method must be implemented by subclass");
    }

    // Template method - defines the algorithm, subclasses implement steps
    processViolation() {
        const fine = this.calculateFine();
        const type = this.getViolationType();

        return {
            ...this.toJSON(),
            fineAmount: fine,
            violationType: type,
            processed: true,
            processedAt: new Date()
        };
    }

    toJSON() {
        return {
            id: this.id,
            vehicleNumber: this.vehicleNumber,
            location: this.location,
            dateTime: this.dateTime,
            officerId: this.officerId,
            citizenId: this.citizenId,
            description: this.description,
            status: this.status
        };
    }
}

// =============================================================================
// CONCRETE USER CLASSES - Demonstrating Inheritance & Polymorphism
// =============================================================================

/**
 * Citizen Class
 * Demonstrates: Inheritance, Method Overriding
 */
class Citizen extends User {
    constructor(userData) {
        super(userData);
        this.licenseNumber = userData.licenseNumber;
        this.vehicleNumbers = userData.vehicleNumbers || [];
    }

    // Polymorphism - implements abstract method
    getPermissions() {
        return [
            'view_own_challans',
            'make_payments',
            'update_profile',
            'view_payment_history',
            'dispute_challan'
        ];
    }

    // Polymorphism - implements abstract method
    async getDashboardData() {
        // This would interact with database/services
        return {
            role: 'citizen',
            totalChallans: 0,
            pendingChallans: 0,
            paidChallans: 0,
            totalFineAmount: 0,
            recentActivity: []
        };
    }

    // Citizen-specific methods
    addVehicle(vehicleNumber) {
        if (!this.vehicleNumbers.includes(vehicleNumber)) {
            this.vehicleNumbers.push(vehicleNumber);
        }
        return this.vehicleNumbers;
    }

    removeVehicle(vehicleNumber) {
        this.vehicleNumbers = this.vehicleNumbers.filter(v => v !== vehicleNumber);
        return this.vehicleNumbers;
    }

    // Method overriding - extends parent behavior
    toJSON() {
        return {
            ...super.toJSON(),
            licenseNumber: this.licenseNumber,
            vehicleNumbers: this.vehicleNumbers
        };
    }
}

/**
 * Officer Class
 * Demonstrates: Inheritance, Method Overriding
 */
class Officer extends User {
    constructor(userData) {
        super(userData);
        this.badgeNumber = userData.badgeNumber;
        this.department = userData.department;
        this.rank = userData.rank || 'Constable';
    }

    // Polymorphism - implements abstract method
    getPermissions() {
        return [
            'create_challans',
            'view_own_challans',
            'update_own_challans',
            'upload_evidence',
            'search_citizens',
            'view_reports'
        ];
    }

    // Polymorphism - implements abstract method
    async getDashboardData() {
        return {
            role: 'officer',
            issuedChallans: 0,
            todayChallans: 0,
            thisMonthChallans: 0,
            recentChallans: []
        };
    }

    // Officer-specific methods
    canEditChallan(challanOfficerId) {
        return this.getId() === challanOfficerId;
    }

    // Method overriding
    toJSON() {
        return {
            ...super.toJSON(),
            badgeNumber: this.badgeNumber,
            department: this.department,
            rank: this.rank
        };
    }
}

/**
 * Admin Class
 * Demonstrates: Inheritance, Method Overriding
 */
class Admin extends User {
    constructor(userData) {
        super(userData);
        this.accessLevel = userData.accessLevel || 'standard';
        this.lastLogin = userData.lastLogin;
    }

    // Polymorphism - implements abstract method
    getPermissions() {
        const basePermissions = [
            'view_all_challans',
            'delete_challans',
            'manage_users',
            'view_system_reports',
            'system_configuration'
        ];

        if (this.accessLevel === 'super') {
            basePermissions.push('manage_admins', 'system_maintenance');
        }

        return basePermissions;
    }

    // Polymorphism - implements abstract method
    async getDashboardData() {
        return {
            role: 'admin',
            totalUsers: 0,
            totalChallans: 0,
            totalRevenue: 0,
            systemHealth: 'good',
            recentActivity: []
        };
    }

    // Admin-specific methods
    canPerformAction(action) {
        return this.getPermissions().includes(action);
    }

    updateLastLogin() {
        this.lastLogin = new Date();
    }

    // Method overriding
    toJSON() {
        return {
            ...super.toJSON(),
            accessLevel: this.accessLevel,
            lastLogin: this.lastLogin
        };
    }
}

// =============================================================================
// CONCRETE VIOLATION CLASSES - Demonstrating Inheritance & Polymorphism
// =============================================================================

class SpeedingViolation extends Violation {
    constructor(violationData) {
        super(violationData);
        this.speedLimit = violationData.speedLimit;
        this.actualSpeed = violationData.actualSpeed;
        this.radarReading = violationData.radarReading;
    }

    calculateFine() {
        const speedDifference = this.actualSpeed - this.speedLimit;
        let baseFine = 500; // Base fine for speeding

        if (speedDifference > 20) {
            baseFine *= 2;
        } else if (speedDifference > 10) {
            baseFine *= 1.5;
        }

        return baseFine;
    }

    getViolationType() {
        return 'Speeding';
    }

    toJSON() {
        return {
            ...super.toJSON(),
            speedLimit: this.speedLimit,
            actualSpeed: this.actualSpeed,
            radarReading: this.radarReading
        };
    }
}

class ParkingViolation extends Violation {
    constructor(violationData) {
        super(violationData);
        this.zoneType = violationData.zoneType; // 'no-parking', 'handicap', 'fire-lane'
        this.duration = violationData.duration; // how long parked illegally
    }

    calculateFine() {
        const fineMap = {
            'no-parking': 200,
            'handicap': 1000,
            'fire-lane': 1500,
            'expired-meter': 100
        };

        let baseFine = fineMap[this.zoneType] || 200;

        // Increase fine for longer duration
        if (this.duration > 120) { // 2 hours
            baseFine *= 1.5;
        }

        return baseFine;
    }

    getViolationType() {
        return 'Wrong Parking';
    }

    toJSON() {
        return {
            ...super.toJSON(),
            zoneType: this.zoneType,
            duration: this.duration
        };
    }
}

class HelmetViolation extends Violation {
    constructor(violationData) {
        super(violationData);
        this.passengerCount = violationData.passengerCount || 1;
        this.vehicleType = violationData.vehicleType; // 'motorcycle', 'scooter'
    }

    calculateFine() {
        const baseFine = 300;
        // Fine multiplied by number of people without helmets
        return baseFine * this.passengerCount;
    }

    getViolationType() {
        return 'No Helmet';
    }

    toJSON() {
        return {
            ...super.toJSON(),
            passengerCount: this.passengerCount,
            vehicleType: this.vehicleType
        };
    }
}

class RedLightViolation extends Violation {
    constructor(violationData) {
        super(violationData);
        this.intersectionId = violationData.intersectionId;
        this.cameraId = violationData.cameraId;
        this.timeAfterRed = violationData.timeAfterRed; // seconds
    }

    calculateFine() {
        let baseFine = 1000;

        // Higher fine for flagrant violations (running red light well after it turned red)
        if (this.timeAfterRed > 3) {
            baseFine *= 1.5;
        }

        return baseFine;
    }

    getViolationType() {
        return 'Red Light';
    }

    toJSON() {
        return {
            ...super.toJSON(),
            intersectionId: this.intersectionId,
            cameraId: this.cameraId,
            timeAfterRed: this.timeAfterRed
        };
    }
}

class MobileUsageViolation extends Violation {
    constructor(violationData) {
        super(violationData);
        this.evidenceType = violationData.evidenceType; // 'photo', 'video'
    }

    calculateFine() {
        return 1000; // Standard fine for mobile usage
    }

    getViolationType() {
        return 'Mobile Phone Usage';
    }

    toJSON() {
        return {
            ...super.toJSON(),
            evidenceType: this.evidenceType
        };
    }
}

class GenericViolation extends Violation {
    constructor(violationData) {
        super(violationData);
        this.customFine = violationData.customFine;
    }

    calculateFine() {
        return this.customFine || 500; // Use custom fine or default
    }

    getViolationType() {
        return 'Other';
    }

    toJSON() {
        return {
            ...super.toJSON(),
            customFine: this.customFine
        };
    }
}

// =============================================================================
// BUSINESS LOGIC CLASSES - Demonstrating Encapsulation
// =============================================================================

/**
 * User Manager Class
 * Demonstrates: Encapsulation, Single Responsibility
 */
class UserManager {
    #users;

    constructor() {
        this.#users = new Map();
    }

    createUser(userData) {
        let user;

        switch (userData.role) {
            case 'citizen':
                user = new Citizen(userData);
                break;
            case 'officer':
                user = new Officer(userData);
                break;
            case 'admin':
                user = new Admin(userData);
                break;
            default:
                throw new Error(`Invalid user role: ${userData.role}`);
        }

        this.#users.set(user.getId(), user);
        return user;
    }

    getUser(userId) {
        return this.#users.get(userId);
    }

    getUsersByRole(role) {
        return Array.from(this.#users.values())
            .filter(user => user.constructor.name.toLowerCase() === role);
    }

    validateUserPermission(userId, action) {
        const user = this.getUser(userId);
        if (!user) {
            throw new Error('User not found');
        }

        return user.getPermissions().includes(action);
    }
}

/**
 * Violation Manager Class
 * Demonstrates: Encapsulation, Business Logic Organization
 */
class ViolationManager {
    #violations;

    constructor() {
        this.#violations = new Map();
    }

    createViolation(violationData) {
        // This would use Factory pattern (implemented in next section)
        const violation = ViolationFactory.createViolation(violationData);
        const processedViolation = violation.processViolation();

        this.#violations.set(violation.id, violation);
        return processedViolation;
    }

    getViolation(violationId) {
        return this.#violations.get(violationId);
    }

    getViolationsByUser(userId, userRole) {
        return Array.from(this.#violations.values())
            .filter(violation => {
                if (userRole === 'citizen') {
                    return violation.citizenId === userId;
                } else if (userRole === 'officer') {
                    return violation.officerId === userId;
                }
                return true; // admin can see all
            });
    }

    updateViolationStatus(violationId, newStatus) {
        const violation = this.getViolation(violationId);
        if (!violation) {
            throw new Error('Violation not found');
        }

        violation.status = newStatus;
        if (newStatus === 'paid') {
            violation.paymentDate = new Date();
        }

        return violation;
    }
}

// =============================================================================
// EXPORT CLASSES FOR USE IN APPLICATION
// =============================================================================

module.exports = {
    // Abstract Classes
    User,
    Violation,

    // Concrete User Classes
    Citizen,
    Officer,
    Admin,

    // Concrete Violation Classes
    SpeedingViolation,
    ParkingViolation,
    HelmetViolation,
    RedLightViolation,
    MobileUsageViolation,
    GenericViolation,

    // Manager Classes
    UserManager,
    ViolationManager
};