import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Consultation', href: '/consultation' },
];

const departments = ["All Departments", "Computer Science", "Engineering", "Business"];

export default function ConsultationPage() {
  const [search, setSearch] = React.useState('');
  const [department, setDepartment] = React.useState('All Departments');
  const [dateFrom, setDateFrom] = React.useState('');
  const [dateTo, setDateTo] = React.useState('');

  // Data should come from Inertia props (controller/backend)
  // Example: const { stats, logs } = usePage().props;

  return (
    <AppLayout>
      <Head title="Consultation Visitor Log" />
      <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          {/* Replace these with dynamic stats from props */}
          <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
            <span className="inline-flex items-center justify-center h-12 w-12 rounded-full text-2xl bg-blue-50">
              {/* Icon */}
            </span>
            <div>
              <div className="text-2xl font-bold text-gray-800">{/* {stats.today} */}</div>
              <div className="text-gray-500 text-sm">Today's Visitors</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
            <span className="inline-flex items-center justify-center h-12 w-12 rounded-full text-2xl bg-green-50">
              {/* Icon */}
            </span>
            <div>
              <div className="text-2xl font-bold text-gray-800">{/* {stats.week} */}</div>
              <div className="text-gray-500 text-sm">Total This Week</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
            <span className="inline-flex items-center justify-center h-12 w-12 rounded-full text-2xl bg-purple-50">
              {/* Icon */}
            </span>
            <div>
              <div className="text-2xl font-bold text-gray-800">{/* {stats.total} */}</div>
              <div className="text-gray-500 text-sm">Total Visitors</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
            <span className="inline-flex items-center justify-center h-12 w-12 rounded-full text-2xl bg-orange-50">
              {/* Icon */}
            </span>
            <div>
              <div className="text-2xl font-bold text-gray-800">{/* {stats.departments} */}</div>
              <div className="text-gray-500 text-sm">Departments</div>
            </div>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="font-semibold text-gray-700 mb-4">Filter & Search</div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Search</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </span>
                <input
                  type="text"
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Search by name, ID..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Department</label>
              <select
                className="block w-full border border-gray-300 rounded-lg py-2 px-3 text-sm"
                value={department}
                onChange={e => setDepartment(e.target.value)}
              >
                {departments.map(dep => (
                  <option key={dep} value={dep}>{dep}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Date From</label>
              <input
                type="date"
                className="block w-full border border-gray-300 rounded-lg py-2 px-3 text-sm"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Date To</label>
              <input
                type="date"
                className="block w-full border border-gray-300 rounded-lg py-2 px-3 text-sm"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Visitor Logs Table */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="font-semibold text-gray-700 mb-4">Recent Visitor Logs</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left font-semibold text-gray-500">TIMESTAMP</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-500">NAME</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-500">ID NUMBER</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-500">DEPARTMENT</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-500">COURSE</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-500">CONTACT</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-500">PURPOSE</th>
                  <th className="px-4 py-2 text-center font-semibold text-gray-500">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {/* Render logs here using Inertia props */}
                {/* Example:
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400">
                      No visitor logs found.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="border-b last:border-b-0">
                      <td className="px-4 py-2">{log.timestamp}</td>
                      <td className="px-4 py-2">{log.name}</td>
                      <td className="px-4 py-2">{log.idNumber}</td>
                      <td className="px-4 py-2">{log.department}</td>
                      <td className="px-4 py-2">{log.course}</td>
                      <td className="px-4 py-2">{log.contact}</td>
                      <td className="px-4 py-2">{log.purpose}</td>
                      <td className="px-4 py-2 text-center">
                        // Actions here
                      </td>
                    </tr>
                  ))
                )}
                */}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}