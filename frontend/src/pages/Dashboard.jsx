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
            setStats(response.data);
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
                            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
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
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
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
                                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
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
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
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
                                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
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
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
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
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
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
                                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Quick Actions Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                        <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
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
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
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
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
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
                                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
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
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
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
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
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
                                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
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
                        <svg className="w-6 h-6 text-amber-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        {user.role === 'citizen' ? 'Traffic Safety Guidelines' : 'Officer Best Practices'}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {user.role === 'citizen' ? (
                            <>
                                <div className="flex items-start space-x-4 p-6 bg-blue-50 rounded-xl border border-blue-200">
                                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-blue-900 mb-2">Follow Traffic Signals</h4>
                                        <p className="text-sm text-blue-700">Always obey traffic lights and road signs to avoid violations and ensure safety for all road users.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4 p-6 bg-green-50 rounded-xl border border-green-200">
                                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
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
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-blue-900 mb-2">Fair Enforcement</h4>
                                        <p className="text-sm text-blue-700">Ensure fair and consistent application of traffic laws while maintaining professional conduct.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4 p-6 bg-green-50 rounded-xl border border-green-200">
                                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
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