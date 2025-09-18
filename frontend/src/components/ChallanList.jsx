import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config/api';

const ChallanList = ({ challans, onChallanUpdate }) => {
    const { user } = useAuth();
    const [payingChallan, setPayingChallan] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('Card');
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [editingChallan, setEditingChallan] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [editLoading, setEditLoading] = useState(false);

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: {
                bg: 'bg-amber-50',
                text: 'text-amber-700',
                border: 'border-amber-200'
            },
            paid: {
                bg: 'bg-green-50',
                text: 'text-green-700',
                border: 'border-green-200'
            },
            disputed: {
                bg: 'bg-red-50',
                text: 'text-red-700',
                border: 'border-red-200'
            },
            cancelled: {
                bg: 'bg-gray-50',
                text: 'text-gray-700',
                border: 'border-gray-200'
            }
        };

        const config = statusConfig[status] || statusConfig.pending;

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const getViolationTypeIcon = (violationType) => {
        const iconMap = {
            'Speeding': (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            'Red Light Violation': (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            ),
            'Improper Parking': (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            'No Helmet': (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            ),
            'Mobile Phone Usage': (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            ),
            'Other': (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        };
        return iconMap[violationType] || iconMap['Other'];
    };

    const handlePayment = async (challanId) => {
        setPaymentLoading(true);
        try {
            const response = await axios.post(
                `${API_BASE_URL}/payments/process`,
                { challanId, paymentMethod },
                {
                    headers: { Authorization: `Bearer ${user.token}` }
                }
            );

            // Success notification
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
            notification.innerHTML = 'Payment successful!';
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 3000);

            onChallanUpdate(response.data.challan);
            setPayingChallan(null);
        } catch (error) {
            alert(error.response?.data?.message || 'Payment failed');
        } finally {
            setPaymentLoading(false);
        }
    };

    const handleDelete = async (challanId) => {
        if (window.confirm('Are you sure you want to delete this challan? This action cannot be undone.')) {
            try {
                await axios.delete(`${API_BASE_URL}/challans/${challanId}`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });

                // Success notification
                const notification = document.createElement('div');
                notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
                notification.innerHTML = 'Challan deleted successfully!';
                document.body.appendChild(notification);
                setTimeout(() => notification.remove(), 3000);

                onChallanUpdate('DELETE', challanId);
            } catch (error) {
                alert(error.response?.data?.message || 'Failed to delete challan');
            }
        }
    };

    const handleEdit = (challan) => {
        setEditingChallan(challan._id);
        setEditFormData({
            violationType: challan.violationType,
            location: challan.location,
            fineAmount: challan.fineAmount,
            description: challan.description,
            status: challan.status
        });
    };

    const handleEditSubmit = async (challanId) => {
        setEditLoading(true);

        try {
            const updateData = {};
            const currentChallan = challans.find(c => c._id === challanId);

            if (editFormData.violationType && editFormData.violationType !== currentChallan.violationType) {
                updateData.violationType = editFormData.violationType;
            }

            if (editFormData.location && editFormData.location !== currentChallan.location) {
                updateData.location = editFormData.location;
            }

            if (editFormData.fineAmount && Number(editFormData.fineAmount) !== currentChallan.fineAmount) {
                updateData.fineAmount = Number(editFormData.fineAmount);
            }

            if (editFormData.description !== currentChallan.description) {
                updateData.description = editFormData.description || '';
            }

            if (editFormData.status && editFormData.status !== currentChallan.status) {
                updateData.status = editFormData.status;
            }

            if (Object.keys(updateData).length === 0) {
                setEditingChallan(null);
                setEditFormData({});
                setEditLoading(false);
                return;
            }

            const response = await axios.put(
                `${API_BASE_URL}/challans/${challanId}`,
                updateData,
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Success notification
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
            notification.innerHTML = 'Challan updated successfully!';
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 3000);

            onChallanUpdate(response.data);
            setEditingChallan(null);
            setEditFormData({});

        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update challan';
            alert(`Update failed: ${errorMessage}`);
        } finally {
            setEditLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingChallan(null);
        setEditFormData({});
    };

    const violationTypes = [
        'Speeding',
        'Red Light Violation',
        'Improper Parking',
        'No Helmet',
        'Mobile Phone Usage',
        'Other'
    ];

    const statusOptions = [
        'pending',
        'paid',
        'disputed',
        'cancelled'
    ];

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatDateTime = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (challans.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No challans found</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                    {user.role === 'citizen'
                        ? "You don't have any traffic violations. Keep driving safely!"
                        : "No challans have been issued yet."
                    }
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">
                {challans.map((challan) => {
                    const isEditing = editingChallan === challan._id;

                    return (
                        <div key={challan._id} className={`bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md ${isEditing ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-200'}`}>
                            {/* Header */}
                            <div className={`px-6 py-4 border-b border-gray-200 ${isEditing ? 'bg-blue-50' : 'bg-gray-50'}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200">
                                            <div className="text-blue-600">
                                                {getViolationTypeIcon(challan.violationType)}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {challan.challanNumber}
                                            </h3>
                                            <p className="text-sm text-gray-600 flex items-center">
                                                {isEditing ? (
                                                    <select
                                                        value={editFormData.violationType || challan.violationType}
                                                        onChange={(e) => setEditFormData({ ...editFormData, violationType: e.target.value })}
                                                        className="bg-white border border-gray-300 rounded px-2 py-1 text-sm mr-2"
                                                    >
                                                        {violationTypes.map(type => (
                                                            <option key={type} value={type}>{type}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <>
                                                        {challan.violationType}
                                                        <span className="mx-2">•</span>
                                                    </>
                                                )}
                                                {challan.vehicleNumber}
                                            </p>
                                        </div>
                                    </div>
                                    {isEditing ? (
                                        <select
                                            value={editFormData.status || challan.status}
                                            onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                                            className="bg-white border border-gray-300 rounded px-3 py-1 text-sm"
                                        >
                                            {statusOptions.map(status => (
                                                <option key={status} value={status}>
                                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        getStatusBadge(challan.status)
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                    {/* Location */}
                                    <div className="flex items-start space-x-3">
                                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mt-1">
                                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-500">Location</p>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editFormData.location || challan.location}
                                                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                                                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm font-medium mt-1"
                                                />
                                            ) : (
                                                <p className="font-medium text-gray-900 truncate">{challan.location}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Fine Amount */}
                                    <div className="flex items-start space-x-3">
                                        <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center mt-1">
                                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-500">Fine Amount</p>
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={editFormData.fineAmount || challan.fineAmount}
                                                    onChange={(e) => setEditFormData({ ...editFormData, fineAmount: e.target.value })}
                                                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm font-semibold text-red-600 mt-1"
                                                />
                                            ) : (
                                                <p className="font-semibold text-red-600 text-lg">₹{challan.fineAmount}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Date & Time */}
                                    <div className="flex items-start space-x-3">
                                        <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center mt-1">
                                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Date & Time</p>
                                            <p className="font-medium text-gray-900">{formatDateTime(challan.dateTime)}</p>
                                        </div>
                                    </div>

                                    {/* Due Date */}
                                    <div className="flex items-start space-x-3">
                                        <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center mt-1">
                                            <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Due Date</p>
                                            <p className="font-medium text-gray-900">{formatDate(challan.dueDate)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                {(challan.description || isEditing) && (
                                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <p className="text-sm font-medium text-gray-600 mb-2">Additional Details</p>
                                        {isEditing ? (
                                            <textarea
                                                value={editFormData.description || challan.description || ''}
                                                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                                rows="3"
                                                placeholder="Additional details about the violation..."
                                            />
                                        ) : (
                                            <p className="text-gray-800">{challan.description}</p>
                                        )}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                    <div className="flex items-center space-x-4">
                                        {challan.officerId && (
                                            <div className="flex items-center text-sm text-gray-500">
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                Issued by: {challan.officerId.name}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        {isEditing ? (
                                            <>
                                                <button
                                                    onClick={() => handleEditSubmit(challan._id)}
                                                    disabled={editLoading}
                                                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm"
                                                >
                                                    {editLoading ? (
                                                        <div className="flex items-center">
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                            Saving...
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            Save Changes
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors shadow-sm"
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                {user.role === 'citizen' && challan.status === 'pending' && (
                                                    <button
                                                        onClick={() => setPayingChallan(challan._id)}
                                                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                                                    >
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                        </svg>
                                                        Pay Now
                                                    </button>
                                                )}

                                                {user.role === 'officer' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleEdit(challan)}
                                                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                                        >
                                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(challan._id)}
                                                            className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                                                        >
                                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                            Delete
                                                        </button>
                                                    </>
                                                )}

                                                <button className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    View Details
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Payment Success Message */}
                                {challan.status === 'paid' && challan.paymentDate && (
                                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <div>
                                                <p className="text-sm font-medium text-green-800">
                                                    Payment Completed
                                                </p>
                                                <p className="text-sm text-green-600">
                                                    Paid on {formatDateTime(challan.paymentDate)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Payment Modal */}
            {payingChallan && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold text-gray-900">Process Payment</h3>
                                <button
                                    onClick={() => setPayingChallan(null)}
                                    className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="mb-6">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-blue-800 font-medium">Amount to Pay:</span>
                                        <span className="text-2xl font-bold text-blue-900">
                                            ₹{challans.find(c => c._id === payingChallan)?.fineAmount}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Payment Method
                                </label>
                                <div className="space-y-2">
                                    {[
                                        {
                                            value: 'Card', label: 'Credit/Debit Card', icon: (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                </svg>
                                            )
                                        },
                                        {
                                            value: 'Bank Transfer', label: 'Bank Transfer', icon: (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                                                </svg>
                                            )
                                        },
                                        {
                                            value: 'Digital Wallet', label: 'Digital Wallet', icon: (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                </svg>
                                            )
                                        }
                                    ].map((method) => (
                                        <label key={method.value} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                            <input
                                                type="radio"
                                                value={method.value}
                                                checked={paymentMethod === method.value}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                className="text-blue-600"
                                            />
                                            <div className="text-gray-600">{method.icon}</div>
                                            <span className="font-medium text-gray-900">{method.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => handlePayment(payingChallan)}
                                    disabled={paymentLoading}
                                    className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center"
                                >
                                    {paymentLoading ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Processing...
                                        </div>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                            Pay Now
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setPayingChallan(null)}
                                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChallanList;