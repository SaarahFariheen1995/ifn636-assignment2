import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config/api';

const ChallanForm = ({ onChallanCreated, onClose }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        citizenEmail: '',
        vehicleNumber: '',
        violationType: 'Speeding',
        location: '',
        fineAmount: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);

    const violationTypes = [
        'Speeding',
        'Red Light Violation',
        'Improper Parking',
        'No Helmet',
        'Mobile Phone Usage',
        'Other'
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(
                `${API_BASE_URL}/challans`,
                formData,
                {
                    headers: { Authorization: `Bearer ${user.token}` }
                }
            );

            onChallanCreated(response.data);
            setFormData({
                citizenEmail: '',
                vehicleNumber: '',
                violationType: 'Speeding',
                location: '',
                fineAmount: '',
                description: ''
            });
            onClose();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create challan');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-xl border border-gray-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Issue New E-Challan</h2>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    X
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Citizen Email *
                        </label>
                        <input
                            type="email"
                            required
                            value={formData.citizenEmail}
                            onChange={(e) => setFormData({ ...formData, citizenEmail: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="citizen@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Vehicle Number *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.vehicleNumber}
                            onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="ABC-1234"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Violation Type *
                        </label>
                        <select
                            value={formData.violationType}
                            onChange={(e) => setFormData({ ...formData, violationType: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                            {violationTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fine Amount (₹) *
                        </label>
                        <input
                            type="number"
                            required
                            min="0"
                            value={formData.fineAmount}
                            onChange={(e) => setFormData({ ...formData, fineAmount: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location *
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Street name, City"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Description
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        rows="4"
                        placeholder="Additional details about the violation..."
                    />
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Creating...
                            </>
                        ) : (
                            'Issue Challan'
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChallanForm;