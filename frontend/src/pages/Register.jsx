import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'citizen',
        phone: '',
        address: '',
        licenseNumber: ''
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.post(`${API_BASE_URL}/auth/register`, formData);

            // Success notification
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
            notification.innerHTML = `
                Registration successful! Please login.
            `;
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 3000);

            navigate('/login');
        } catch (error) {
            // Error notification
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
            notification.innerHTML = `
                ${error.response?.data?.message || 'Registration failed'}
            `;
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 3000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="mx-auto w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4 shadow-sm">
                    </div>
                    <h1 className="text-2xl font-semibold text-gray-900 mb-2">Create Account</h1>
                    <p className="text-gray-600">Join the E-Challan traffic management system</p>
                </div>

                {/* Registration Form */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Account Type Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Account Type
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <label className={`relative flex cursor-pointer rounded-lg p-4 border-2 transition-colors ${formData.role === 'citizen'
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-300 bg-white hover:bg-gray-50'
                                    }`}>
                                    <input
                                        type="radio"
                                        value="citizen"
                                        checked={formData.role === 'citizen'}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="sr-only"
                                    />
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                        </div>
                                        <div className="ml-3">
                                            <span className="block text-sm font-medium text-gray-900">Citizen</span>
                                            <span className="block text-xs text-gray-500">For vehicle owners</span>
                                        </div>
                                    </div>
                                </label>

                                <label className={`relative flex cursor-pointer rounded-lg p-4 border-2 transition-colors ${formData.role === 'officer'
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-300 bg-white hover:bg-gray-50'
                                    }`}>
                                    <input
                                        type="radio"
                                        value="officer"
                                        checked={formData.role === 'officer'}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="sr-only"
                                    />
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                        </div>
                                        <div className="ml-3">
                                            <span className="block text-sm font-medium text-gray-900">Officer</span>
                                            <span className="block text-xs text-gray-500">For traffic officers</span>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Personal Information */}
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
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="Enter your email address"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password *
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-10"
                                        placeholder="Create a secure password"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showPassword ? 'Hide' : 'Show'}
                                        </button>
                                    </div>
                                </div>
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
                        </div>

                        <div>
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

                        {formData.role === 'citizen' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Driving License Number
                                </label>
                                <input
                                    type="text"
                                    value={formData.licenseNumber}
                                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="Enter your driving license number"
                                />
                            </div>
                        )}

                        {/* Terms and Conditions */}
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="terms"
                                        type="checkbox"
                                        required
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                    />
                                </div>
                                <div className="ml-3">
                                    <label htmlFor="terms" className="text-sm text-gray-700">
                                        I agree to the{' '}
                                        <a href="#" className="text-blue-600 hover:text-blue-500 font-medium">
                                            Terms and Conditions
                                        </a>{' '}
                                        and{' '}
                                        <a href="#" className="text-blue-600 hover:text-blue-500 font-medium">
                                            Privacy Policy
                                        </a>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Creating Account...
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    Create Account
                                </div>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
                            </div>
                        </div>
                    </div>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                            Sign In Instead
                        </Link>
                    </div>
                </div>

                {/* Security Notice */}
                <div className="mt-6 bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-gray-900">Secure Registration</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Your personal information is encrypted and secure. We follow strict data protection protocols to keep your information safe.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;