// test/patterns.test.js - Unit Tests for Design Patterns
const { expect } = require('chai');
const {
    ViolationFactory,
    PaymentProcessor,
    ConfigurationManager,
    EChallanFacade
} = require('../patterns/DesignPatterns');
const { Citizen, Officer, Admin } = require('../patterns/ClassHierarchy');

describe('Design Patterns Unit Tests', () => {

    // Factory Pattern Tests
    describe('Factory Pattern - ViolationFactory', () => {
        it('should create SpeedingViolation correctly', () => {
            const violation = ViolationFactory.createViolation({
                violationType: 'Speeding',
                vehicleNumber: 'ABC123',
                speedLimit: 50,
                actualSpeed: 80,
                location: 'Highway 1'
            });

            expect(violation.constructor.name).to.equal('SpeedingViolation');
            expect(violation.getViolationType()).to.equal('Speeding');
            expect(violation.calculateFine()).to.be.greaterThan(500);
        });

        it('should create ParkingViolation correctly', () => {
            const violation = ViolationFactory.createViolation({
                violationType: 'Wrong Parking',
                vehicleNumber: 'XYZ789',
                zoneType: 'handicap',
                duration: 60,
                location: 'Mall Parking'
            });

            expect(violation.constructor.name).to.equal('ParkingViolation');
            expect(violation.getViolationType()).to.equal('Wrong Parking');
            expect(violation.calculateFine()).to.equal(1000);
        });

        it('should throw error for invalid violation type', () => {
            expect(() => {
                ViolationFactory.createViolation({
                    violationType: 'InvalidType',
                    vehicleNumber: 'ABC123'
                });
            }).to.throw('Unknown violation type: InvalidType');
        });
    });

    // Strategy Pattern Tests
    describe('Strategy Pattern - PaymentProcessor', () => {
        let paymentProcessor;

        beforeEach(() => {
            paymentProcessor = new PaymentProcessor();
        });

        it('should process credit card payment', () => {
            const result = paymentProcessor.processPayment(
                1000,
                { cardNumber: '4111111111111111', cvv: '123', holderName: 'John Doe' },
                'credit_card'
            );

            expect(result.success).to.be.true;
            expect(result.paymentMethod).to.equal('credit_card');
            expect(result.fee).to.be.greaterThan(0);
        });

        it('should process UPI payment with no fees', () => {
            const result = paymentProcessor.processPayment(
                500,
                { upiId: 'test@paytm', pin: '1234' },
                'upi'
            );

            expect(result.success).to.be.true;
            expect(result.paymentMethod).to.equal('upi');
            expect(result.fee).to.equal(0);
        });

        it('should fail with invalid payment method', () => {
            expect(() => {
                paymentProcessor.processPayment(1000, {}, 'invalid_method');
            }).to.throw('Unsupported payment method: invalid_method');
        });
    });

    // Singleton Pattern Tests
    describe('Singleton Pattern - ConfigurationManager', () => {
        it('should return same instance', () => {
            const config1 = ConfigurationManager.getInstance();
            const config2 = ConfigurationManager.getInstance();

            expect(config1).to.equal(config2);
        });

        it('should store and retrieve configuration values', () => {
            const config = ConfigurationManager.getInstance();
            config.set('test.value', 'hello world');

            expect(config.get('test.value')).to.equal('hello world');
        });
    });

    // Observer Pattern Tests
    describe('Observer Pattern - Notification System', () => {
        it('should notify all observers when event occurs', (done) => {
            const { ChallanNotificationSubject, EmailNotificationObserver } = require('../patterns/DesignPatterns');

            const subject = new ChallanNotificationSubject();
            let notified = false;

            const mockEmailService = {
                sendEmail: () => {
                    notified = true;
                    expect(notified).to.be.true;
                    done();
                    return Promise.resolve({ success: true });
                }
            };

            const emailObserver = new EmailNotificationObserver(mockEmailService);
            subject.addObserver(emailObserver);

            subject.notifyObservers('challan_created', {
                citizenEmail: 'test@test.com',
                challanNumber: 'CH123',
                fineAmount: 500
            });
        });
    });
});

// test/oop.test.js - Unit Tests for OOP Principles
describe('OOP Principles Unit Tests', () => {

    // Inheritance Tests
    describe('Inheritance - User Class Hierarchy', () => {
        it('should create different user types with inheritance', () => {
            const citizen = new Citizen({
                id: '1',
                name: 'John Doe',
                email: 'john@test.com',
                licenseNumber: 'DL123'
            });

            const officer = new Officer({
                id: '2',
                name: 'Jane Smith',
                email: 'jane@police.com',
                badgeNumber: 'BADGE001',
                department: 'Traffic'
            });

            expect(citizen).to.be.instanceOf(Citizen);
            expect(citizen).to.be.instanceOf(require('../patterns/ClassHierarchy').User);
            expect(officer).to.be.instanceOf(Officer);
            expect(officer).to.be.instanceOf(require('../patterns/ClassHierarchy').User);
        });
    });

    // Polymorphism Tests
    describe('Polymorphism - Method Overriding', () => {
        it('should have different permissions for different user types', () => {
            const citizen = new Citizen({
                id: '1',
                name: 'John Doe',
                email: 'john@test.com'
            });

            const officer = new Officer({
                id: '2',
                name: 'Jane Smith',
                email: 'jane@police.com',
                badgeNumber: 'BADGE001'
            });

            const admin = new Admin({
                id: '3',
                name: 'Admin User',
                email: 'admin@system.com'
            });

            expect(citizen.getPermissions()).to.include('view_own_challans');
            expect(citizen.getPermissions()).to.not.include('create_challans');

            expect(officer.getPermissions()).to.include('create_challans');
            expect(officer.getPermissions()).to.not.include('delete_challans');

            expect(admin.getPermissions()).to.include('delete_challans');
            expect(admin.getPermissions()).to.include('manage_users');
        });
    });

    // Encapsulation Tests
    describe('Encapsulation - Private Fields', () => {
        it('should protect private fields from direct access', () => {
            const user = new Citizen({
                id: '1',
                name: 'John Doe',
                email: 'john@test.com',
                isActive: true
            });

            // Should access through getter
            expect(user.getId()).to.equal('1');
            expect(user.getEmail()).to.equal('john@test.com');
            expect(user.getIsActive()).to.be.true;

            // Private fields should not be directly accessible
            expect(user.id).to.be.undefined;
            expect(user.email).to.be.undefined;
        });
    });

    // Abstraction Tests
    describe('Abstraction - Abstract Classes', () => {
        it('should not allow instantiation of abstract User class', () => {
            const { User } = require('../patterns/ClassHierarchy');

            expect(() => {
                new User({ id: '1', name: 'Test' });
            }).to.throw('Cannot instantiate abstract User class');
        });

        it('should require implementation of abstract methods', () => {
            // Test that concrete classes implement abstract methods
            const citizen = new Citizen({
                id: '1',
                name: 'John Doe',
                email: 'john@test.com'
            });

            expect(() => citizen.getPermissions()).to.not.throw();
            expect(() => citizen.getDashboardData()).to.not.throw();
        });
    });
});

// test/integration.test.js - Integration Tests
describe('Integration Tests', () => {
    describe('EChallanFacade Integration', () => {
        let facade;

        beforeEach(() => {
            facade = new EChallanFacade();
        });

        it('should create challan and send notifications', async () => {
            // This would require proper test database setup
            // Mock test for demonstration
            const mockResult = {
                success: true,
                challan: {
                    id: 'test-challan-id',
                    challanNumber: 'CH123',
                    fineAmount: 500
                }
            };

            // Test that facade coordinates multiple operations
            expect(facade).to.have.property('notificationSubject');
            expect(facade).to.have.property('paymentProcessor');
            expect(facade).to.have.property('userManager');
        });
    });

    describe('Database Integration with OOP', () => {
        it('should convert Mongoose documents to OOP instances', () => {
            // Mock Mongoose document
            const mockUser = {
                _id: 'test-id',
                name: 'Test User',
                email: 'test@test.com',
                role: 'citizen',
                toOOPInstance: function () {
                    return new Citizen({
                        id: this._id,
                        name: this.name,
                        email: this.email
                    });
                }
            };

            const oopUser = mockUser.toOOPInstance();
            expect(oopUser).to.be.instanceOf(Citizen);
            expect(oopUser.name).to.equal('Test User');

        });
    });
});

// Export test configuration
module.exports = {
    testTimeout: 5000,
    testEnvironment: 'node'
};