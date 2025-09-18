/**
 * Updated Challan Controller with Database Integration
 * Minor changes to work with the integrated EChallanFacade
 */

const { EChallanFacade, UserPermissionManager } = require('../patterns/DesignPatterns');
const { UserManager, Citizen, Officer, Admin } = require('../patterns/ClassHierarchy');
const Challan = require('../models/Challan');
const User = require('../models/User');

class ChallanController {
    constructor() {
        this.eChallanFacade = new EChallanFacade();
        this.userManager = new UserManager();
    }

    /**
     * Get Challans - Updated to use real database integration
     */
    async getChallans(req, res) {
        try {
            const userObj = this.createUserFromRequest(req.user);
            const decoratedUser = UserPermissionManager.setupUserWithDecorators(
                userObj,
                req.user.role,
                req.user.specialAccess || []
            );

            if (!decoratedUser.canPerformAction('view_challans') &&
                !decoratedUser.canPerformAction('view_own_challans')) {
                return res.status(403).json({ message: 'Access denied' });
            }

            // Use the facade to get all challans with pagination
            const result = await this.eChallanFacade.getAllChallans(
                req.user.id,
                req.user.role,
                req.query.page || 1,
                req.query.limit || 10
            );

            if (!result.success) {
                return res.status(400).json({ message: result.error });
            }

            res.json({
                challans: result.challans,
                pagination: result.pagination,
                message: result.message
            });

        } catch (error) {
            console.error('Error in getChallans:', error);
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Create Challan - Already works with database integration
     */
    async createChallan(req, res) {
        try {
            const userObj = this.createUserFromRequest(req.user);
            const decoratedUser = UserPermissionManager.setupUserWithDecorators(
                userObj,
                req.user.role,
                req.user.specialAccess || []
            );

            if (!decoratedUser.canPerformAction('create_challans')) {
                return res.status(403).json({ message: 'Only officers can create challans' });
            }

            // Use Facade Pattern - now with real database integration
            const result = await this.eChallanFacade.createChallan(req.user.id, {
                citizenEmail: req.body.citizenEmail,
                vehicleNumber: req.body.vehicleNumber,
                violationType: req.body.violationType,
                location: req.body.location,
                description: req.body.description,
                speedLimit: req.body.speedLimit,
                actualSpeed: req.body.actualSpeed,
                zoneType: req.body.zoneType,
                duration: req.body.duration,
                passengerCount: req.body.passengerCount,
                vehicleType: req.body.vehicleType,
                intersectionId: req.body.intersectionId,
                cameraId: req.body.cameraId,
                timeAfterRed: req.body.timeAfterRed,
                evidenceUrl: req.body.evidenceUrl
            });

            if (!result.success) {
                return res.status(400).json({ message: result.error });
            }

            res.status(201).json({
                message: result.message,
                challan: result.challan
            });

        } catch (error) {
            console.error('Error in createChallan:', error);
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Get Dashboard Stats - Updated to use facade
     */
    async getDashboardStats(req, res) {
        try {
            // Use Facade Pattern to get comprehensive dashboard data
            const result = await this.eChallanFacade.getUserDashboard(req.user.id);

            if (!result.success) {
                return res.status(400).json({ message: result.error });
            }

            res.json({
                dashboard: result.dashboard,
                user: result.user,
                message: result.message
            });

        } catch (error) {
            console.error('Error in getDashboardStats:', error);
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Update Challan - Database integrated
     */
    async updateChallan(req, res) {
        try {
            const userObj = this.createUserFromRequest(req.user);
            const decoratedUser = UserPermissionManager.setupUserWithDecorators(
                userObj,
                req.user.role,
                req.user.specialAccess || []
            );

            // Find challan in database
            const challan = await Challan.findById(req.params.id);
            if (!challan) {
                return res.status(404).json({ message: 'Challan not found' });
            }

            // Check permissions using OOP method
            if (userObj instanceof Officer) {
                if (!userObj.canEditChallan(challan.officerId.toString())) {
                    return res.status(403).json({
                        message: 'Access denied - you can only edit your own challans'
                    });
                }
            } else if (!decoratedUser.canPerformAction('update_all_challans')) {
                return res.status(403).json({ message: 'Access denied' });
            }

            // Use Strategy Pattern for different update strategies
            const updateStrategy = this.getUpdateStrategy(req.user.role);
            const updateFields = updateStrategy.processUpdate(req.body, challan);

            const updatedChallan = await Challan.findByIdAndUpdate(
                req.params.id,
                updateFields,
                { new: true, runValidators: true }
            ).populate('citizenId', 'name email')
                .populate('officerId', 'name');

            res.json(updatedChallan.toJSON());

        } catch (error) {
            console.error('Error in updateChallan:', error);
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Delete Challan - Database integrated
     */
    async deleteChallan(req, res) {
        try {
            const userObj = this.createUserFromRequest(req.user);
            const decoratedUser = UserPermissionManager.setupUserWithDecorators(
                userObj,
                req.user.role,
                req.user.specialAccess || []
            );

            if (!decoratedUser.canPerformAction('delete_challans')) {
                return res.status(403).json({ message: 'Access denied' });
            }

            const challan = await Challan.findById(req.params.id);
            if (!challan) {
                return res.status(404).json({ message: 'Challan not found' });
            }

            await challan.deleteOne();
            res.json({ message: 'Challan deleted successfully' });

        } catch (error) {
            console.error('Error in deleteChallan:', error);
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Get Challan by ID - Database integrated
     */
    async getChallanById(req, res) {
        try {
            const userObj = this.createUserFromRequest(req.user);

            const challan = await Challan.findById(req.params.id)
                .populate('citizenId', 'name email phone address')
                .populate('officerId', 'name badgeNumber');

            if (!challan) {
                return res.status(404).json({ message: 'Challan not found' });
            }

            // Check permissions using OOP method
            if (userObj instanceof Citizen) {
                if (challan.citizenId._id.toString() !== req.user.id) {
                    return res.status(403).json({ message: 'Access denied' });
                }
            }

            res.json(challan.toJSON());
        } catch (error) {
            console.error('Error in getChallanById:', error);
            res.status(500).json({ message: error.message });
        }
    }

    // Helper methods remain the same
    createUserFromRequest(userData) {
        switch (userData.role) {
            case 'citizen':
                return new Citizen(userData);
            case 'officer':
                return new Officer(userData);
            case 'admin':
                return new Admin(userData);
            default:
                throw new Error(`Invalid user role: ${userData.role}`);
        }
    }

    getUpdateStrategy(userRole) {
        switch (userRole) {
            case 'officer':
                return new OfficerUpdateStrategy();
            case 'admin':
                return new AdminUpdateStrategy();
            default:
                return new CitizenUpdateStrategy();
        }
    }

    async getChallansForUser(userData) {
        const userObj = this.createUserFromRequest(userData);
        let query = {};

        if (userObj instanceof Citizen) {
            query.citizenId = userObj.getId();
        } else if (userObj instanceof Officer) {
            query.officerId = userObj.getId();
        }

        return await Challan.find(query)
            .populate('citizenId', 'name email phone')
            .populate('officerId', 'name badgeNumber')
            .sort({ createdAt: -1 });
    }
}

// Strategy classes remain the same
class UpdateStrategy {
    processUpdate(updateData, existingChallan) {
        throw new Error("processUpdate method must be implemented");
    }
}

class OfficerUpdateStrategy extends UpdateStrategy {
    processUpdate(updateData, existingChallan) {
        const allowedFields = ['violationType', 'location', 'description', 'fineAmount'];
        const updateFields = {};

        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                updateFields[field] = updateData[field];
            }
        });

        return updateFields;
    }
}

class AdminUpdateStrategy extends UpdateStrategy {
    processUpdate(updateData, existingChallan) {
        const updateFields = {};
        const allowedFields = [
            'violationType', 'location', 'description',
            'fineAmount', 'status', 'dueDate'
        ];

        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                updateFields[field] = updateData[field];
            }
        });

        if (updateData.status === 'paid' && existingChallan.status !== 'paid') {
            updateFields.paymentDate = new Date();
        }

        return updateFields;
    }
}

class CitizenUpdateStrategy extends UpdateStrategy {
    processUpdate(updateData, existingChallan) {
        const updateFields = {};

        if (updateData.disputeReason && existingChallan.status === 'pending') {
            updateFields.disputeReason = updateData.disputeReason;
            updateFields.status = 'disputed';
        }

        return updateFields;
    }
}

module.exports = new ChallanController();// Updated 2025-09-18 by Michael Rodriguez
