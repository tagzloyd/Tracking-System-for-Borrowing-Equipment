import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Head, router } from '@inertiajs/react';

export default function LogForm() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        name: '',
        student_id: '',
        department: '',
        course: '',
        year: '',
        email: '',
        phone: '',
        equipment_name: '', // changed from equipment_id
        start_time: '',
        end_time: '',
        purpose: '',
        status: 'Borrowed',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        if (form.end_time && new Date(form.end_time) <= new Date(form.start_time)) {
            setError('Return date must be after borrow date');
            setLoading(false);
            return;
        }

        try {
            await axios.post('/api/tracking/store', {
                ...form,
            });
            setSuccess('Borrowing request submitted successfully!');
            setForm({
                name: '',
                student_id: '',
                department: '',
                course: '',
                year: '',
                email: '',
                phone: '',
                equipment_name: '',
                start_time: '',
                end_time: '',
                purpose: '',
                status: 'Pending Approval',
            });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    const today = new Date().toISOString().slice(0, 16);
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    const maxDateString = maxDate.toISOString().slice(0, 16);

    return (
        
        <div className="min-h-screen flex flex-col bg-gray-100">
            <Head title="Student Equipment Borrowing Form" />
            {/* Fixed Header */}
            <header className="bg-white shadow-sm flex-shrink-0 z-10">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    <div className="flex items-center">
                        <a href={route('tracking.main')} className="flex items-center">
                            <img
                                src="https://www.carsu.edu.ph/wp-content/uploads/2024/10/CSU-logo-2-black-text-1-1.svg"
                                alt="CSU Logo"
                                className="h-12 w-auto mr-4 drop-shadow-lg"
                                style={{ maxWidth: 160 }}
                            />
                        </a>
                    </div>
                    <div className="text-sm text-gray-500">
                        Equipment Borrowing System
                    </div>
                </div>
            </header>
            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center">
                <div className="w-full max-w-4xl h-[calc(100vh-110px)] flex flex-col justify-center">
                    <div className="bg-white rounded-xl shadow-lg flex flex-col h-full">
                        {/* Back button and title */}
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
                        {/* Status messages */}
                        <div className="px-6 pt-4">
                            {success && (
                                <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 rounded text-green-700 flex items-center">
                                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {success}
                                </div>
                            )}
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded text-red-700 flex items-center">
                                    <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {error}
                                </div>
                            )}
                        </div>
                        {/* Form */}
                        <form
                            onSubmit={handleSubmit}
                            className="flex-1 overflow-auto px-6 pb-6 space-y-6"
                            style={{ minHeight: 0 }}
                        >
                            {/* Personal Information */}
                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                                    <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Personal Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Student ID <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="student_id"
                                            value={form.student_id}
                                            onChange={handleChange}
                                            placeholder="201-00000"
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* Academic Information */}
                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                                    <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    Academic Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Department <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="department"
                                            value={form.department}
                                            onChange={handleChange}
                                            required
                                            placeholder="e.g. Computer Science"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Course <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="course"
                                            value={form.course}
                                            onChange={handleChange}
                                            required
                                            placeholder="e.g. BSIT"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Year Level <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="year"
                                            value={form.year}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        >
                                            <option value="">Select Year</option>
                                            <option value="1st Year">1st Year</option>
                                            <option value="2nd Year">2nd Year</option>
                                            <option value="3rd Year">3rd Year</option>
                                            <option value="4th Year">4th Year</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            {/* Contact Information */}
                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                                    <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Contact Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                            placeholder="your.email@example.com"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={form.phone}
                                            onChange={handleChange}
                                            placeholder="0912 345 6789"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* Equipment Details */}
                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                                    <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                    </svg>
                                    Equipment Details
                                </h2>
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Return Date & Time</label>
                                            <input
                                                type="datetime-local"
                                                name="end_time"
                                                value={form.end_time}
                                                onChange={handleChange}
                                                min={form.start_time || today}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                            />
                                        </div>
                                    </div>
                                    {/* <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Purpose <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            name="purpose"
                                            value={form.purpose}
                                            onChange={handleChange}
                                            required
                                            rows={3}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                            placeholder="Briefly describe what you need the equipment for..."
                                        />
                                    </div> */}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-70 flex items-center"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                            </svg>
                                            Submit Request
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}