import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ChallanForm from '../components/ChallanForm';
import ChallanList from '../components/ChallanList';
import API_BASE_URL from '../config/api';

const Challans = () => {
    const { user } = useAuth();
    const [challans, setChallans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState('all');

    const fetchChallans = useCallback(async () => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/challans`,
                {
                    headers: { Authorization: `Bearer ${user.token}` }
                }
            );
            setChallans(response.data);
        } catch (error) {
            console.error('Failed to fetch challans:', error);
        } finally {
            setLoading(false);
        }
    }, [user.token]);

    useEffect(() => {
        fetchChallans();
    }, [fetchChallans]);

    const handleChallanCreated = (newChallan) => {
        setChallans(prevChallans => [newChallan, ...prevChallans]);
    };

    const handleChallanUpdate = (updatedChallanOrAction, challanId) => {
        if (updatedChallanOrAction === 'DELETE') {
            setChallans(prevChallans =>
                prevChallans.filter(challan => challan._id !== challanId)
            );
        } else {
            setChallans(prevChallans => {
                const updatedChallans = prevChallans.map(challan => {
                    if (challan._id === updatedChallanOrAction._id) {
                        return updatedChallanOrAction;
                    }
                    return challan;
                });
                return updatedChallans;
            });
        }
    };

    const filteredChallans = challans.filter(challan => {
        if (filter === 'all') return true;
        return challan.status === filter;
    });

    const getFilterCounts = () => {
        return {
            all: challans.length,
            pending: challans.filter(c => c.status === 'pending').length,
            paid: challans.filter(c => c.status === 'paid').length,
            disputed: challans.filter(c => c.status === 'disputed').length,
            cancelled: challans.filter(c => c.status === 'cancelled').length,
        };
    };

    const filterCounts = getFilterCounts();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-gray-500 font-medium">Loading challans...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {user.role === 'officer' ? 'Manage Challans' : 'My Challans'}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {user.role === 'officer'
                            ? 'Issue and manage traffic violations'
                            : 'View and pay your traffic violations'
                        }
                    </p>
                </div>

                {user.role === 'officer' && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        Issue New Challan
                    </button>
                )}
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total</p>
                            <p className="text-2xl font-bold text-gray-900">{filterCounts.all}</p>
                        </div>
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Pending</p>
                            <p className="text-2xl font-bold text-amber-600">{filterCounts.pending}</p>
                        </div>
                        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Paid</p>
                            <p className="text-2xl font-bold text-green-600">{filterCounts.paid}</p>
                        </div>
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Disputed</p>
                            <p className="text-2xl font-bold text-red-600">{filterCounts.disputed}</p>
                        </div>
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Cancelled</p>
                            <p className="text-2xl font-bold text-gray-600">{filterCounts.cancelled}</p>
                        </div>
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
                <div className="flex flex-wrap gap-1">
                    {[
                        { key: 'all', label: 'All Challans', count: filterCounts.all },
                        { key: 'pending', label: 'Pending', count: filterCounts.pending },
                        { key: 'paid', label: 'Paid', count: filterCounts.paid },
                        { key: 'disputed', label: 'Disputed', count: filterCounts.disputed },
                        { key: 'cancelled', label: 'Cancelled', count: filterCounts.cancelled }
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${filter === tab.key
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            <span>{tab.label}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${filter === tab.key
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-600'
                                }`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Results Summary */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                    Showing <span className="font-medium">{filteredChallans.length}</span> of{' '}
                    <span className="font-medium">{challans.length}</span> challans
                </p>
            </div>

            {/* Challan Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <ChallanForm
                            onChallanCreated={handleChallanCreated}
                            onClose={() => setShowForm(false)}
                        />
                    </div>
                </div>
            )}

            {/* Challan List */}
            <ChallanList
                challans={filteredChallans}
                onChallanUpdate={handleChallanUpdate}
            />
        </div>
    );
};

export default Challans;