import React, { useState } from 'react';
import axios from 'axios';
import { Head, router } from '@inertiajs/react';

export default function OutsiderLogForm() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState(1);

    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        equipment_name: '', // changed from equipment_id
        start_time: '',
        end_time: '',
        status: 'Still Borrowing',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        if (!form.end_time) {
            setError('Please specify expected return date');
            setLoading(false);
            return;
        }

        if (new Date(form.end_time) <= new Date(form.start_time)) {
            setError('Return date must be after borrow date');
            setLoading(false);
            return;
        }

        try {
            await axios.post('/api/tracking/store-outsider', {
                ...form,
                // send equipment_name directly
                user_type: 'outsider'
            });

            setSuccess('Your borrowing request has been submitted for approval!');
            setForm({
                name: '',
                email: '',
                phone: '',
                equipment_name: '',
                start_time: '',
                end_time: '',
                status: 'Still Borrowing',
            });
            setCurrentStep(1);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => {
        if (currentStep === 1 && (!form.name || !form.email || !form.phone)) {
            setError('Please fill all personal information fields');
            return;
        }
        setError(null);
        setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        setError(null);
        setCurrentStep(currentStep - 1);
    };

    const today = new Date().toISOString().slice(0, 16);
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    const maxDateString = maxDate.toISOString().slice(0, 16);

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            <Head title="Outsider Equipment Borrowing Form" />
            {/* Fixed Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    <div className="flex items-center">
                        <img
                            src="https://www.carsu.edu.ph/wp-content/uploads/2024/10/CSU-logo-2-black-text-1-1.svg"
                            alt="CSU Logo"
                            className="h-12 w-auto mr-4 drop-shadow-lg"
                            style={{ maxWidth: 160 }}
                        />
                    </div>
                    <div className="text-sm text-gray-500">
                        Equipment Borrowing System
                    </div>
                </div>
            </header>
            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center">
                <div className="w-full max-w-2xl h-[calc(100vh-90px)] flex flex-col justify-center">
                    <div className="bg-white rounded-xl shadow-lg flex flex-col h-full">
                        {/* Back to Main Button and Title */}
                        <div className="flex items-center justify-between px-6 py-4 border-b">
                            <button
                                onClick={() => router.get('/Attendance')}
                                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Dashboard
                            </button>
                            <div>
                                <p className="text-gray-500 text-sm">Fill out the form to borrow equipment</p>
                            </div>
                        </div>
                        {/* Step indicator */}
                        <div className="flex justify-center my-4">
                            <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                                <div className={`rounded-full h-8 w-8 flex items-center justify-center ${currentStep >= 1 ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                    1
                                </div>
                                <div className="ml-2 text-sm">Personal Info</div>
                            </div>
                            <div className="flex items-center mx-4">
                                <div className="border-t-2 w-8 border-gray-300"></div>
                            </div>
                            <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                                <div className={`rounded-full h-8 w-8 flex items-center justify-center ${currentStep >= 2 ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                    2
                                </div>
                                <div className="ml-2 text-sm">Equipment</div>
                            </div>
                        </div>
                        {/* Status messages */}
                        <div className="px-6">
                            {success && (
                                <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                                    {success}
                                </div>
                            )}
                            {error && (
                                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                                    {error}
                                </div>
                            )}
                        </div>
                        {/* Form */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-auto px-6 pb-6">
                            {currentStep === 1 && (
                                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                    <h2 className="text-lg font-medium text-gray-800 mb-4">Personal Information</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Full Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={form.name}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Email <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={form.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Phone Number <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={form.phone}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-6 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={nextStep}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                    <h2 className="text-lg font-medium text-gray-800 mb-4">Equipment Details</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Equipment to Borrow <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="equipment_name"
                                                value={form.equipment_name}
                                                onChange={handleChange}
                                                required
                                                placeholder="Enter equipment name"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Borrow Date & Time <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="datetime-local"
                                                    name="start_time"
                                                    value={form.start_time}
                                                    onChange={handleChange}
                                                    min={today}
                                                    max={maxDateString}
                                                    required
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Return Date & Time <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="datetime-local"
                                                    name="end_time"
                                                    value={form.end_time}
                                                    onChange={handleChange}
                                                    min={form.start_time || today}
                                                    max={maxDateString}
                                                    required
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-6 flex justify-between">
                                        <button
                                            type="button"
                                            onClick={prevStep}
                                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                        >
                                            {loading ? 'Submitting...' : 'Submit Request'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}