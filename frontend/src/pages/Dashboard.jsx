import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config/api';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/challans/stats`,
                {
                    headers: { Authorization: `Bearer ${user.token}` }
                }
            );
            setStats(response.data.dashboard);
            console.log('Dashboard stats:', response.data.dashboard); // Debug log
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-gray-500 font-medium">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Welcome back, {user.name}
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Here's your traffic violation overview
                            </p>
                        </div>
                        <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-full text-sm font-medium border border-blue-200">
                            {user.role === 'citizen' ? 'Citizen Account' : 'Traffic Officer'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {user.role === 'citizen' ? (
                    <>
                        {/* Stats Cards for Citizens */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 mb-1">Total Challans</p>
                                        <p className="text-3xl font-bold text-gray-900">
                                            {stats.totalChallans || 0}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">All time</p>
                                    </div>
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 mb-1">Pending Payment</p>
                                        <p className="text-3xl font-bold text-amber-600">
                                            {stats.pendingChallans || 0}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">Requires action</p>
                                    </div>
                                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 mb-1">Paid Challans</p>
                                        <p className="text-3xl font-bold text-green-600">
                                            {stats.paidChallans || 0}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">Completed</p>
                                    </div>
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 mb-1">Total Fine Amount</p>
                                        <p className="text-3xl font-bold text-red-600">
                                            ₹{stats.totalFineAmount || 0}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">Outstanding amount</p>
                                    </div>
                                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Stats Cards for Officers */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 mb-1">Challans Issued</p>
                                        <p className="text-3xl font-bold text-blue-600">
                                            {stats.issuedChallans || 0}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">Total issued by you</p>
                                    </div>
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 mb-1">Today's Challans</p>
                                        <p className="text-3xl font-bold text-green-600">
                                            {stats.todayChallans || 0}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">Issued today</p>
                                    </div>
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 mb-1">Collection Amount</p>
                                        <p className="text-3xl font-bold text-purple-600">
                                            ₹{stats.collectionAmount || 0}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">Total fines collected</p>
                                    </div>
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Quick Actions Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                        Quick Actions
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {user.role === 'citizen' ? (
                            <>
                                <a
                                    href="/challans"
                                    className="group block p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:shadow-md transition-all duration-300 border border-blue-200"
                                >
                                    <div className="flex items-center mb-4">
                                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                        </div>
                                        <h3 className="font-semibold text-blue-900 group-hover:text-blue-700">View My Challans</h3>
                                    </div>
                                    <p className="text-sm text-blue-700">Check your traffic violations and pay outstanding fines</p>
                                </a>

                                <a
                                    href="/payments"
                                    className="group block p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:shadow-md transition-all duration-300 border border-green-200"
                                >
                                    <div className="flex items-center mb-4">
                                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                        </div>
                                        <h3 className="font-semibold text-green-900 group-hover:text-green-700">Payment History</h3>
                                    </div>
                                    <p className="text-sm text-green-700">View your payment records and download receipts</p>
                                </a>

                                <a
                                    href="/profile"
                                    className="group block p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:shadow-md transition-all duration-300 border border-purple-200"
                                >
                                    <div className="flex items-center mb-4">
                                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                        </div>
                                        <h3 className="font-semibold text-purple-900 group-hover:text-purple-700">Update Profile</h3>
                                    </div>
                                    <p className="text-sm text-purple-700">Manage your personal information and vehicle details</p>
                                </a>
                            </>
                        ) : (
                            <>
                                <a
                                    href="/challans"
                                    className="group block p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:shadow-md transition-all duration-300 border border-blue-200"
                                >
                                    <div className="flex items-center mb-4">
                                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                        </div>
                                        <h3 className="font-semibold text-blue-900 group-hover:text-blue-700">Issue New Challan</h3>
                                    </div>
                                    <p className="text-sm text-blue-700">Create new traffic violation records for offenders</p>
                                </a>

                                <a
                                    href="/challans"
                                    className="group block p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:shadow-md transition-all duration-300 border border-green-200"
                                >
                                    <div className="flex items-center mb-4">
                                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                        </div>
                                        <h3 className="font-semibold text-green-900 group-hover:text-green-700">Manage Challans</h3>
                                    </div>
                                    <p className="text-sm text-green-700">View, edit, and manage all issued violations</p>
                                </a>

                                <a
                                    href="/profile"
                                    className="group block p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:shadow-md transition-all duration-300 border border-purple-200"
                                >
                                    <div className="flex items-center mb-4">
                                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                        </div>
                                        <h3 className="font-semibold text-purple-900 group-hover:text-purple-700">Settings</h3>
                                    </div>
                                    <p className="text-sm text-purple-700">Update your profile and system preferences</p>
                                </a>
                            </>
                        )}
                    </div>
                </div>

                {/* Tips Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                        {user.role === 'citizen' ? 'Traffic Safety Guidelines' : 'Officer Best Practices'}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {user.role === 'citizen' ? (
                            <>
                                <div className="flex items-start space-x-4 p-6 bg-blue-50 rounded-xl border border-blue-200">
                                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-blue-900 mb-2">Follow Traffic Signals</h4>
                                        <p className="text-sm text-blue-700">Always obey traffic lights and road signs to avoid violations and ensure safety for all road users.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4 p-6 bg-green-50 rounded-xl border border-green-200">
                                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-green-900 mb-2">Use Safety Equipment</h4>
                                        <p className="text-sm text-green-700">Always wear helmets while riding two-wheelers and use seat belts in cars for your safety.</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-start space-x-4 p-6 bg-blue-50 rounded-xl border border-blue-200">
                                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-blue-900 mb-2">Fair Enforcement</h4>
                                        <p className="text-sm text-blue-700">Ensure fair and consistent application of traffic laws while maintaining professional conduct.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4 p-6 bg-green-50 rounded-xl border border-green-200">
                                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-green-900 mb-2">Clear Documentation</h4>
                                        <p className="text-sm text-green-700">Provide clear violation details and maintain accurate records for better transparency.</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;