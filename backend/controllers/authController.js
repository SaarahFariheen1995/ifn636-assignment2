/**
 * Refactored Authentication Controller
 * Uses OOP principles and design patterns
 */

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { UserPermissionManager } = require('../patterns/DesignPatterns');
const { ConfigurationManager } = require('../patterns/DesignPatterns');

class AuthController {
    constructor() {
        this.config = ConfigurationManager.getInstance();
    }

    /**
     * Register User - Using Factory Pattern and OOP
     */
    async registerUser(req, res) {
        const { name, email, password, role, phone, address, licenseNumber, badgeNumber, department, rank } = req.body;

        try {
            // Check if user exists
            const userExists = await User.findOne({ email });
            if (userExists) {
                return res.status(400).json({ message: 'User already exists' });
            }

            // Validate role-specific data
            this.validateRoleSpecificData(role, req.body);

            // Create user data object
            const userData = {
                name,
                email,
                password,
                role: role || 'citizen',
                phone,
                address,
                licenseNumber,
                badgeNumber,
                department,
                rank
            };

            // Create user using Mongoose model
            const user = await User.create(userData);

            // Convert to OOP instance for response
            const userOOP = user.toOOPInstance();

            // Generate token
            const token = this.generateToken(user._id);

            // Return user data with permissions
            res.status(201).json({
                id: user._id,
                ...userOOP.toJSON(),
                permissions: userOOP.getPermissions(),
                token: token
            });

        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Login User - Using OOP and Decorator Pattern
     */
    async loginUser(req, res) {
        const { email, password } = req.body;

        try {
            // Find user
            const user = await User.findOne({ email });

            // Verify credentials
            if (user && (await user.matchPassword(password))) {
                // Convert to OOP instance
                const userOOP = user.toOOPInstance();

                // Apply decorators for enhanced functionality
                const decoratedUser = UserPermissionManager.setupUserWithDecorators(
                    userOOP,
                    user.role,
                    user.specialAccess || []
                );

                // Update last login for admin users
                if (user.role === 'admin') {
                    user.lastLogin = new Date();
                    await user.save();
                }

                // Generate token
                const token = this.generateToken(user._id);

                // Get enhanced dashboard data
                const dashboardData = await decoratedUser.getDashboardData();

                res.json({
                    id: user._id,
                    ...userOOP.toJSON(),
                    permissions: decoratedUser.getPermissions(),
                    dashboardPreview: dashboardData,
                    token: token
                });
            } else {
                res.status(401).json({ message: 'Invalid email or password' });
            }

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Get Profile - Using OOP Instance Methods
     */
    async getProfile(req, res) {
        try {
            const user = await User.findById(req.user.id).select('-password');

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Convert to OOP instance
            const userOOP = user.toOOPInstance();

            // Apply decorators
            const decoratedUser = UserPermissionManager.setupUserWithDecorators(
                userOOP,
                user.role,
                user.specialAccess || []
            );

            // Get enhanced profile data
            const profileData = {
                ...userOOP.toJSON(),
                permissions: decoratedUser.getPermissions(),
                hasTemporaryAccess: decoratedUser.wrappedComponent instanceof require('../patterns/DesignPatterns').TemporaryAccessDecorator
            };

            res.json(profileData);

        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Update Profile - Using OOP Methods
     */
    async updateProfile(req, res) {
        try {
            const user = await User.findById(req.user.id);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Convert to OOP instance
            const userOOP = user.toOOPInstance();

            // Use OOP method to update profile
            const updatedData = userOOP.updateProfile(req.body);

            // Update specific fields based on role
            const updateFields = this.getUpdateFieldsForRole(user.role, req.body);

            // Apply updates to Mongoose model
            Object.assign(user, updateFields);
            const updatedUser = await user.save();

            // Convert updated user to OOP instance
            const updatedUserOOP = updatedUser.toOOPInstance();

            res.json({
                ...updatedUserOOP.toJSON(),
                permissions: updatedUserOOP.getPermissions()
            });

        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Grant Temporary Access - Using Decorator Pattern
     */
    async grantTemporaryAccess(req, res) {
        const { userId, permissions, duration } = req.body;

        try {
            // Only admins can grant temporary access
            const currentUser = await User.findById(req.user.id);
            const currentUserOOP = currentUser.toOOPInstance();

            if (!currentUserOOP.getPermissions().includes('manage_users')) {
                return res.status(403).json({ message: 'Access denied' });
            }

            // Find target user
            const targetUser = await User.findById(userId);
            if (!targetUser) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Add temporary access to special access array
            const expiryDate = new Date(Date.now() + duration * 60 * 60 * 1000); // duration in hours

            targetUser.specialAccess = targetUser.specialAccess || [];
            targetUser.specialAccess.push(`temp_${permissions.join('_')}_until_${expiryDate.getTime()}`);

            await targetUser.save();

            res.json({
                message: 'Temporary access granted successfully',
                userId: userId,
                permissions: permissions,
                expiresAt: expiryDate
            });

        } catch (error) {
            console.error('Grant temporary access error:', error);
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Generate JWT Token - Using Singleton Configuration
     */
    generateToken(id) {
        const jwtConfig = this.config.get('jwt');
        return jwt.sign({ id }, jwtConfig.secret, {
            expiresIn: jwtConfig.expiresIn
        });
    }

    /**
     * Validate Role-Specific Data
     */
    validateRoleSpecificData(role, data) {
        switch (role) {
            case 'officer':
                if (!data.badgeNumber) {
                    throw new Error('Badge number is required for officers');
                }
                if (!data.department) {
                    throw new Error('Department is required for officers');
                }
                break;
            case 'admin':
                // Admins might have additional validation in the future
                break;
            case 'citizen':
            default:
                // Citizens don't need additional validation
                break;
        }
    }

    /**
     * Get Update Fields Based on Role - Strategy Pattern
     */
    getUpdateFieldsForRole(role, updateData) {
        const commonFields = ['name', 'phone', 'address'];
        const updateFields = {};

        // Common fields for all roles
        commonFields.forEach(field => {
            if (updateData[field] !== undefined) {
                updateFields[field] = updateData[field];
            }
        });

        // Role-specific fields
        switch (role) {
            case 'citizen':
                if (updateData.licenseNumber !== undefined) {
                    updateFields.licenseNumber = updateData.licenseNumber;
                }
                if (updateData.vehicleNumbers !== undefined) {
                    updateFields.vehicleNumbers = updateData.vehicleNumbers;
                }
                break;

            case 'officer':
                if (updateData.department !== undefined) {
                    updateFields.department = updateData.department;
                }
                if (updateData.rank !== undefined) {
                    updateFields.rank = updateData.rank;
                }
                break;

            case 'admin':
                if (updateData.accessLevel !== undefined) {
                    updateFields.accessLevel = updateData.accessLevel;
                }
                break;
        }

        return updateFields;
    }

    /**
     * Get User Statistics - Using OOP Methods
     */
    async getUserStatistics(req, res) {
        try {
            const user = await User.findById(req.user.id);
            const userOOP = user.toOOPInstance();

            // Get dashboard data using OOP methods
            const dashboardData = await userOOP.getDashboardData();

            res.json(dashboardData);

        } catch (error) {
            console.error('Get user statistics error:', error);
            res.status(500).json({ message: error.message });
        }
    }
}

// Export single instance
module.exports = new AuthController();