import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config/api';

const Profile = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        licenseNumber: '',
        vehicleNumbers: []
    });
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [newVehicle, setNewVehicle] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/auth/profile`,
                {
                    headers: { Authorization: `Bearer ${user.token}` }
                }
            );
            setFormData({
                name: response.data.name || '',
                email: response.data.email || '',
                phone: response.data.phone || '',
                address: response.data.address || '',
                licenseNumber: response.data.licenseNumber || '',
                vehicleNumbers: response.data.vehicleNumbers || []
            });
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setFetchLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.put(
                `${API_BASE_URL}/auth/profile`,
                formData,
                {
                    headers: { Authorization: `Bearer ${user.token}` }
                }
            );

            // Success notification
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
            notification.innerHTML = `
        Profile updated successfully!
      `;
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 3000);
        } catch (error) {
            // Error notification
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
            notification.innerHTML = `
        ${error.response?.data?.message || 'Failed to update profile'}
      `;
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 3000);
        } finally {
            setLoading(false);
        }
    };

    const addVehicle = () => {
        if (newVehicle.trim() && !formData.vehicleNumbers.includes(newVehicle.trim())) {
            setFormData({
                ...formData,
                vehicleNumbers: [...formData.vehicleNumbers, newVehicle.trim()]
            });
            setNewVehicle('');
        }
    };

    const removeVehicle = (vehicleToRemove) => {
        setFormData({
            ...formData,
            vehicleNumbers: formData.vehicleNumbers.filter(vehicle => vehicle !== vehicleToRemove)
        });
    };

    if (fetchLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-gray-500 font-medium">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg font-bold">
                            {user.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
                        <p className="text-gray-600">Manage your personal information and preferences</p>
                    </div>
                </div>
            </div>

            {/* Profile Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Personal Information Section */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            Personal Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={formData.email}
                                        disabled
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Email address cannot be changed for security reasons</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="Enter your phone number"
                                />
                            </div>

                            {user.role === 'citizen' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Driving License Number
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.licenseNumber}
                                        onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="Enter your license number"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Address
                            </label>
                            <textarea
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                rows="3"
                                placeholder="Enter your complete address"
                            />
                        </div>
                    </div>

                    {/* Vehicle Information Section - Only for Citizens */}
                    {user.role === 'citizen' && (
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                Vehicle Information
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Add Vehicle Number
                                    </label>
                                    <div className="flex space-x-3">
                                        <input
                                            type="text"
                                            value={newVehicle}
                                            onChange={(e) => setNewVehicle(e.target.value)}
                                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="Enter vehicle number (e.g., ABC-1234)"
                                        />
                                        <button
                                            type="button"
                                            onClick={addVehicle}
                                            className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>

                                {formData.vehicleNumbers.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Registered Vehicles
                                        </label>
                                        <div className="space-y-2">
                                            {formData.vehicleNumbers.map((vehicle, index) => (
                                                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                        </div>
                                                        <span className="font-medium text-gray-900">{vehicle}</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeVehicle(vehicle)}
                                                        className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="pt-6 border-t border-gray-200">
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => window.history.back()}
                                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        Update Profile
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;