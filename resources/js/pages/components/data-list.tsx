import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import React from 'react';
import axios from 'axios';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'; // If using Heroicons (recommended for Inertia projects)
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { title } from 'process';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: '/data-list' },
];

interface Tracking {
    id: number;
    student_id?: string;
    name: string;
    email: string;
    phone?: string;
    department?: string;
    course?: string;
    year?: string;
    equipment_id: number;
    equipment_name?: string;
    start_time: string;
    end_time?: string;
    status: string;
}

const PAGE_SIZE_OPTIONS = [5, 10, 25];

export default function TrackingPage() {
    const [activeTab, setActiveTab] = React.useState<'students' | 'outsiders'>('students');
    const [trackings, setTrackings] = React.useState<Tracking[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [search, setSearch] = React.useState('');

    // Paging
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(PAGE_SIZE_OPTIONS[0]);

    React.useEffect(() => {
        const fetchTrackings = async () => {
            setLoading(true);
            setError(null);
            try {
                const endpoint = activeTab === 'students' ? '/api/tracking' : '/api/outsider';
                const res = await axios.get(endpoint);
                setTrackings(res.data);
            } catch (err: any) {
                setError(err.message || `Failed to fetch ${activeTab} logs`);
            } finally {
                setLoading(false);
            }
        };
        fetchTrackings();
    }, [activeTab]);

    // Filtered data based on search AND status "Returned"
    const filteredData = trackings.filter(tracking => {
        const q = search.toLowerCase();
        // Only include status "Returned"
        if (tracking.status !== 'Returned') return false;
        return (
            tracking.name.toLowerCase().includes(q) ||
            (tracking.student_id && tracking.student_id.toLowerCase().includes(q)) ||
            (tracking.email && tracking.email.toLowerCase().includes(q)) ||
            (tracking.phone && tracking.phone.toLowerCase().includes(q)) ||
            (tracking.department && tracking.department.toLowerCase().includes(q)) ||
            (tracking.course && tracking.course.toLowerCase().includes(q)) ||
            (tracking.year && tracking.year.toLowerCase().includes(q)) ||
            (tracking.equipment_name && tracking.equipment_name.toLowerCase().includes(q))
        );
    });

    const totalRows = filteredData.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);

    const paginatedData = filteredData.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const handleChangePage = (newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setRowsPerPage(Number(e.target.value));
        setPage(0);
    };

    const from = page * rowsPerPage + 1;
    const to = Math.min((page + 1) * rowsPerPage, totalRows);

    function formatDate(dateString?: string) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    function getStatus(tracking: Tracking) {
        // Returned is always final
        if (tracking.status === 'Returned') return 'Returned';
        // If end_time is not set, it's still borrowed
        if (!tracking.end_time) return 'Borrowed';
        // If end_time is set and now is past end_time, it's deadline
        const now = new Date();
        const end = new Date(tracking.end_time);
        if (now > end) return 'Deadline';
        // If end_time is set but not yet due, still borrowed
        return 'Borrowed';
    }

    const handleStatusUpdate = async (id: number, type: 'student' | 'outsider', newStatus: string) => {
        try {
            await axios.patch(`/api/tracking/${id}/status`, { status: newStatus, type });
            setTrackings(prev =>
                prev.map(t =>
                    t.id === id
                        ? {
                            ...t,
                            status: newStatus,
                            end_time: newStatus === 'Returned' ? new Date().toISOString() : t.end_time
                        }
                        : t
                )
            );
            window.dispatchEvent(new Event('dashboard-refresh'));
        } catch (err: any) {
            alert('Failed to update status');
        }
    };

    // Export to CSV
    const handleExportCSV = () => {
        // Only export the filtered and paginated data as shown in the table
        const exportData = paginatedData.map(tracking => ({
            ...(activeTab === 'students' && {
                'Student ID': tracking.student_id,
                Department: tracking.department,
                Course: tracking.course,
                Year: tracking.year,
            }),
            Name: tracking.name,
            Contact: tracking.phone,
            Email: tracking.email,
            Equipment: tracking.equipment_name,
            'Start Time': formatDate(tracking.start_time),
            'End Time': tracking.end_time ? formatDate(tracking.end_time) : 'N/A',
        }));
        const csv = Papa.unparse(exportData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, 'List Of People Borrowed Items.csv');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title='List of People Borrowed Items' />
            <div className="w-full px-2 sm:px-4 py-4">
                {/* Export Buttons */}
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={handleExportCSV}
                        className="px-3 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 text-sm"
                    >
                        Export CSV
                    </button>
                </div>
                {/* Search Bar */}
                <div className="flex items-center mb-4">
                    <div className="relative w-full max-w-xs">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </span>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="Search by name, ID, email, equipment..."
                            value={search}
                            onChange={e => {
                                setSearch(e.target.value);
                                setPage(0);
                            }}
                        />
                    </div>
                </div>
                <div className="mb-4 border-b border-gray-200">
                    <ul className="flex flex-wrap -mb-px">
                        <li className="mr-2">
                            <button
                                onClick={() => setActiveTab('students')}
                                className={`inline-block p-4 border-b-2 rounded-t-lg transition-all duration-150 ${activeTab === 'students' ? 'text-blue-600 border-blue-600 font-semibold bg-blue-50' : 'border-transparent hover:text-gray-600 hover:border-gray-300'}`}
                            >
                                Students
                            </button>
                        </li>
                        <li className="mr-2">
                            <button
                                onClick={() => setActiveTab('outsiders')}
                                className={`inline-block p-4 border-b-2 rounded-t-lg transition-all duration-150 ${activeTab === 'outsiders' ? 'text-blue-600 border-blue-600 font-semibold bg-blue-50' : 'border-transparent hover:text-gray-600 hover:border-gray-300'}`}
                                aria-current="page"
                            >
                                Outsiders
                            </button>
                        </li>
                    </ul>
                </div>
                {error && <div className="mb-2 text-red-600">{error}</div>}

                <div className="w-full overflow-x-auto rounded-lg shadow border border-gray-200 bg-white">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                {activeTab === 'students' && (
                                    <>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Student ID</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Department</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Course</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Year</th>
                                    </>
                                )}
                                <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Name</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Contact</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Email</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Equipment</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Start Time</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">End Time</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={activeTab === 'students' ? 11 : 7} className="py-12 text-center">
                                        <div className="flex justify-center items-center">
                                            <svg className="animate-spin h-8 w-8 text-blue-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                            </svg>
                                            <span className="text-blue-600 text-lg">Loading...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={activeTab === 'students' ? 11 : 7} className="py-8 text-center text-gray-500">
                                        No records found.
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((tracking, idx) => {
                                    const status = getStatus(tracking);
                                    return (
                                        <tr
                                            key={tracking.id}
                                            className={`transition-colors duration-150 ${idx % 2 === 0 ? 'bg-white' : 'bg-blue-50/50'} hover:bg-blue-100`}
                                        >
                                            {activeTab === 'students' && (
                                                <>
                                                    <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-gray-700">{tracking.student_id}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap">{tracking.department || '-'}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap">{tracking.course || '-'}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap">{tracking.year || '-'}</td>
                                                </>
                                            )}
                                            <td className="px-4 py-3 whitespace-nowrap font-medium">{tracking.name}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">{tracking.phone || '-'}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">{tracking.email}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">{tracking.equipment_name || '-'}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">{formatDate(tracking.start_time)}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">{tracking.end_time ? formatDate(tracking.end_time) : <span className="italic text-gray-400">N/A</span>}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-2 border-t border-neutral-200 bg-white gap-2">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-neutral-700">Rows per page:</span>
                        <select
                            className="border rounded px-2 py-1 text-sm"
                            value={rowsPerPage}
                            onChange={handleChangeRowsPerPage}
                        >
                            {PAGE_SIZE_OPTIONS.map((n) => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-neutral-700">
                            {from}-{to} of {totalRows}
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                className="p-1 rounded-full border text-neutral-500 hover:bg-neutral-100 disabled:opacity-50"
                                onClick={() => handleChangePage(0)}
                                disabled={page === 0}
                                aria-label="First page"
                            >
                                &#171;
                            </button>
                            <button
                                className="p-1 rounded-full border text-neutral-500 hover:bg-neutral-100 disabled:opacity-50"
                                onClick={() => handleChangePage(page - 1)}
                                disabled={page === 0}
                                aria-label="Previous page"
                            >
                                &#8249;
                            </button>
                            <button
                                className="p-1 rounded-full border text-neutral-500 hover:bg-neutral-100 disabled:opacity-50"
                                onClick={() => handleChangePage(page + 1)}
                                disabled={page >= totalPages - 1}
                                aria-label="Next page"
                            >
                                &#8250;
                            </button>
                            <button
                                className="p-1 rounded-full border text-neutral-500 hover:bg-neutral-100 disabled:opacity-50"
                                onClick={() => handleChangePage(totalPages - 1)}
                                disabled={page >= totalPages - 1}
                                aria-label="Last page"
                            >
                                &#187;
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}