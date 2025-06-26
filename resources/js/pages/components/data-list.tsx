import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import React from 'react';
import axios from 'axios';
import { MagnifyingGlassIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline'; // If using Heroicons (recommended for Inertia projects)
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { title } from 'process';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Records', href: '/records' },
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

    // Sorting
    const [sortBy, setSortBy] = React.useState<string>('start_time');
    const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('desc');
    const [statusFilter, setStatusFilter] = React.useState<string>('Returned'); // Default to Returned

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

    // Filtered data based on search AND status filter
    const filteredData = trackings.filter(tracking => {
        const q = search.toLowerCase();
        // Filter by status
        if (statusFilter !== 'All' && tracking.status !== statusFilter) return false;
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

    // Sorting
    const sortedData = React.useMemo(() => {
        return [...filteredData].sort((a, b) => {
            let aValue = a[sortBy as keyof Tracking];
            let bValue = b[sortBy as keyof Tracking];
            // For date fields, compare as dates
            if (sortBy === 'start_time' || sortBy === 'end_time') {
                aValue = aValue ? new Date(aValue as string).getTime() : 0;
                bValue = bValue ? new Date(bValue as string).getTime() : 0;
            }
            if (aValue === undefined || bValue === undefined) return 0;
            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredData, sortBy, sortDirection]);

    const totalRows = sortedData.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);

    const paginatedData = sortedData.slice(
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
        saveAs(blob, 'Records Of People Borrowed Items.csv');
    };

    // Sorting handler
    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortDirection('asc');
        }
    };

    // Status filter options
    const statusOptions = ['All', 'Returned', 'Borrowed', 'Deadline'];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title='Records' />
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
                {/* Search and Filter Bar */}
                <div className="flex flex-col sm:flex-row items-center mb-4 gap-2">
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
                    <select
                        className="border rounded px-2 py-2 text-sm ml-0 sm:ml-2"
                        value={statusFilter}
                        onChange={e => {
                            setStatusFilter(e.target.value);
                            setPage(0);
                        }}
                    >
                        {statusOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
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
                                        <th
                                            className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap cursor-pointer select-none"
                                            onClick={() => handleSort('student_id')}
                                        >
                                            Student ID
                                            <ChevronUpDownIcon className="inline h-4 w-4 ml-1 text-gray-400" />
                                        </th>
                                        <th
                                            className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap cursor-pointer select-none"
                                            onClick={() => handleSort('department')}
                                        >
                                            Department
                                            <ChevronUpDownIcon className="inline h-4 w-4 ml-1 text-gray-400" />
                                        </th>
                                        <th
                                            className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap cursor-pointer select-none"
                                            onClick={() => handleSort('course')}
                                        >
                                            Course
                                            <ChevronUpDownIcon className="inline h-4 w-4 ml-1 text-gray-400" />
                                        </th>
                                        <th
                                            className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap cursor-pointer select-none"
                                            onClick={() => handleSort('year')}
                                        >
                                            Year
                                            <ChevronUpDownIcon className="inline h-4 w-4 ml-1 text-gray-400" />
                                        </th>
                                    </>
                                )}
                                <th
                                    className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap cursor-pointer select-none"
                                    onClick={() => handleSort('name')}
                                >
                                    Name
                                    <ChevronUpDownIcon className="inline h-4 w-4 ml-1 text-gray-400" />
                                </th>
                                <th
                                    className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap cursor-pointer select-none"
                                    onClick={() => handleSort('phone')}
                                >
                                    Contact
                                    <ChevronUpDownIcon className="inline h-4 w-4 ml-1 text-gray-400" />
                                </th>
                                <th
                                    className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap cursor-pointer select-none"
                                    onClick={() => handleSort('email')}
                                >
                                    Email
                                    <ChevronUpDownIcon className="inline h-4 w-4 ml-1 text-gray-400" />
                                </th>
                                <th
                                    className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap cursor-pointer select-none"
                                    onClick={() => handleSort('equipment_name')}
                                >
                                    Equipment
                                    <ChevronUpDownIcon className="inline h-4 w-4 ml-1 text-gray-400" />
                                </th>
                                <th
                                    className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap cursor-pointer select-none"
                                    onClick={() => handleSort('start_time')}
                                >
                                    Start Time
                                    <ChevronUpDownIcon className="inline h-4 w-4 ml-1 text-gray-400" />
                                </th>
                                <th
                                    className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap cursor-pointer select-none"
                                    onClick={() => handleSort('end_time')}
                                >
                                    End Time
                                    <ChevronUpDownIcon className="inline h-4 w-4 ml-1 text-gray-400" />
                                </th>
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