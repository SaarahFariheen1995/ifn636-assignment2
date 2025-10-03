import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config/api';

const PaymentHistory = () => {
    const { user } = useAuth();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchPaymentHistory();
    }, []);

    const fetchPaymentHistory = async () => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/payments/history`,
                {
                    headers: { Authorization: `Bearer ${user.token}` }
                }
            );
            setPayments(response.data);
        } catch (error) {
            console.error('Failed to fetch payment history:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDateShort = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            completed: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
            pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
            failed: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' }
        };

        const config = statusConfig[status] || statusConfig.completed;

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const filteredPayments = payments.filter(payment => {
        if (filter === 'all') return true;
        return payment.status === filter;
    });

    const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-gray-500 font-medium">Loading payment history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
                    <p className="text-gray-600 mt-1">View all your payment transactions and receipts</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Payments</p>
                            <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Amount</p>
                            <p className="text-2xl font-bold text-green-600">${totalAmount}</p>
                        </div>
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Average Payment</p>
                            <p className="text-2xl font-bold text-purple-600">
                                ${payments.length > 0 ? Math.round(totalAmount / payments.length) : 0}
                            </p>
                        </div>
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
                <div className="flex space-x-1">
                    {['all', 'completed', 'pending', 'failed'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === status
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${filter === status
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-600'
                                }`}>
                                {status === 'all' ? payments.length : payments.filter(p => p.status === status).length}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Payment List */}
            {filteredPayments.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No payment history found</h3>
                    <p className="text-gray-500">You haven't made any payments yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredPayments.map((payment, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Transaction #{payment.transactionId}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                Challan: {payment.challan.challanNumber}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        {getStatusBadge(payment.status || 'completed')}
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-green-600">${payment.amount}</p>
                                            <p className="text-xs text-gray-500">{payment.paymentMethod}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Vehicle Number</p>
                                            <p className="font-medium text-gray-900">{payment.challan.vehicleNumber}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Violation Type</p>
                                            <p className="font-medium text-gray-900">{payment.challan.violationType}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Payment Date</p>
                                            <p className="font-medium text-gray-900">{formatDateShort(payment.paymentDate)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-200 space-y-2 sm:space-y-0">
                                    <p className="text-sm text-gray-600">
                                        Paid on {formatDate(payment.paymentDate)}
                                    </p>
                                    <div className="flex space-x-2">
                                        <button className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
                                            Download Receipt
                                        </button>
                                        <button className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-200 transition-colors">
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PaymentHistory;