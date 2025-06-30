import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import React, { useEffect } from 'react';
import { MagnifyingGlassIcon, UserCircleIcon, PrinterIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { BreadcrumbItem } from '@/types';
import axios from 'axios';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: '/reports' },
];

const departments = ["All Departments", "Computer Science", "Engineering", "Business", "Arts", "Science"];

interface ConsultationUser {
  id?: number | string;
  name: string;
  email?: string;
  address?: string;
  phone?: string;
  affiliation_or_office?: string;
  purpose?: string;
  student_id?: string;
  id_number?: string;
  department?: string;
  course?: string;
  created_at?: string;
  timestamp?: string;
  contact?: string;
  type: 'student' | 'outsider';
}

type CSVRow = {
  'Date & Time': string;
  'Name': string;
} & (
  | {
      'Student ID': string;
      'Department': string;
      'Course': string;
    }
  | {
      'Email': string;
      'Address': string;
      'Office': string;
    }
) & {
  'Contact': string;
  'Purpose': string;
};

export default function ConsultationPage() {
  const [search, setSearch] = React.useState('');
  const [department, setDepartment] = React.useState('All Departments');
  const [dateFrom, setDateFrom] = React.useState('');
  const [dateTo, setDateTo] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const [visitors, setVisitors] = React.useState<ConsultationUser[]>([]);
  
  const fetchConsultations = async () => {
    try {
      const res = await axios.get('/api/consultation/all');
      setVisitors([
        ...res.data.students.map((s: Partial<ConsultationUser>) => ({ ...s, type: 'student' })),
        ...res.data.outsiders.map((o: Partial<ConsultationUser>) => ({ ...o, type: 'outsider' })),
      ]);
    } catch (err) {
      setError('Failed to fetch visitor data. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredVisitors = visitors.filter(visitor => {
    const matchesSearch = visitor.name.toLowerCase().includes(search.toLowerCase()) || 
                         (visitor.student_id && visitor.student_id.toLowerCase().includes(search.toLowerCase())) ||
                         (visitor.id_number && visitor.id_number.toLowerCase().includes(search.toLowerCase()));
    
    const matchesDepartment = department === 'All Departments' || 
                            (visitor.department && visitor.department === department);
    
    const matchesDateFrom = !dateFrom || (visitor.created_at && new Date(visitor.created_at) >= new Date(dateFrom));
    const matchesDateTo = !dateTo || (visitor.created_at && new Date(visitor.created_at) <= new Date(dateTo));
    
    return matchesSearch && matchesDepartment && matchesDateFrom && matchesDateTo;
  });

  const [activeTab, setActiveTab] = React.useState<'student' | 'outsider'>('student');

  const exportToCSV = () => {
    const headers = activeTab === 'student' 
      ? ['Date & Time', 'Name', 'Student ID', 'Department', 'Course', 'Contact', 'Purpose']
      : ['Date & Time', 'Name', 'Email', 'Address', 'Office', 'Contact', 'Purpose'];
    
    const data = filteredVisitors
      .filter(v => v.type === activeTab)
      .map(visitor => ({
        'Date & Time': formatDate(visitor.created_at),
        'Name': visitor.name,
        ...(activeTab === 'student' ? {
          'Student ID': visitor.student_id || '-',
          'Department': visitor.department || '-',
          'Course': visitor.course || '-',
        } : {
          'Email': visitor.email || '-',
          'Address': visitor.address || '-',
          'Office': visitor.affiliation_or_office || '-',
        }),
        'Contact': visitor.phone || visitor.contact || '-',
        'Purpose': visitor.purpose || '-'
      } as CSVRow));

    let csvContent = headers.join(',') + '\n';
    
    data.forEach(row => {
      csvContent += headers.map(header => {
        const value = (row as Record<string, string>)[header].toString().replace(/"/g, '""');
        return value.includes(',') ? `"${value}"` : value;
      }).join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${activeTab}_visitors_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printTable = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;
    
    const title = `${activeTab === 'student' ? 'Student' : 'External Visitor'} Consultation Records`;
    const styles = `
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #111827; font-size: 1.5rem; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background-color: #f9fafb; text-align: left; padding: 8px; border: 1px solid #e5e7eb; }
        td { padding: 8px; border: 1px solid #e5e7eb; }
        .text-center { text-align: center; }
        .truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
      </style>
    `;
    
    let tableContent = `
      <table>
        <thead>
          <tr>
            <th>Date & Time</th>
            <th>Name</th>
            ${activeTab === 'student' 
              ? '<th>Student ID</th><th>Department</th><th>Course</th>' 
              : '<th>Email</th><th>Address</th><th>Office</th>'}
            <th>Contact</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
    `;

    const visitorsToPrint = filteredVisitors.filter(v => v.type === activeTab);
    
    if (visitorsToPrint.length === 0) {
      tableContent += `
        <tr>
          <td colspan="${activeTab === 'student' ? 7 : 7}" class="text-center">No visitors found matching your criteria</td>
        </tr>
      `;
    } else {
      visitorsToPrint.forEach(visitor => {
        tableContent += `
          <tr>
            <td>${formatDate(visitor.created_at)}</td>
            <td>${visitor.name}</td>
            ${activeTab === 'student' 
              ? `<td>${visitor.student_id || '-'}</td><td>${visitor.department || '-'}</td><td>${visitor.course || '-'}</td>` 
              : `<td>${visitor.email || '-'}</td><td>${visitor.address || '-'}</td><td>${visitor.affiliation_or_office || '-'}</td>`}
            <td>${visitor.phone || visitor.contact || '-'}</td>
            <td class="truncate">${visitor.purpose || '-'}</td>
          </tr>
        `;
      });
    }

    tableContent += `
        </tbody>
      </table>
      <p style="margin-top: 20px; font-size: 0.8rem; color: #6b7280;">
        Generated on ${new Date().toLocaleString()}
      </p>
    `;

    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          ${styles}
        </head>
        <body>
          <h1>${title}</h1>
          ${tableContent}
          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 200);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Visitor Management System" />
        <div className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Filter Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="md:flex md:items-center md:justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Visitor Records</h2>
              <div className="mt-4 md:mt-0">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setActiveTab('student')}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'student' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    Students
                  </button>
                  <button
                    onClick={() => setActiveTab('outsider')}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'outsider' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    External Visitors
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                    placeholder="Search visitors..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="date"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="date"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={exportToCSV}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowDownTrayIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
                Export CSV
              </button>
              <button
                onClick={printTable}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PrinterIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
                Print
              </button>
            </div>
          </div>

          {/* Visitor Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center items-center p-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      {activeTab === 'student' ? (
                        <>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student ID
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Department
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Course
                          </th>
                        </>
                      ) : (
                        <>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Address
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Office
                          </th>
                        </>
                      )}
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Purpose
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredVisitors.filter(v => v.type === activeTab).length === 0 ? (
                      <tr>
                        <td colSpan={activeTab === 'student' ? 8 : 8} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                          No visitors found matching your criteria
                        </td>
                      </tr>
                    ) : (
                      filteredVisitors
                        .filter(v => v.type === activeTab)
                        .map((visitor) => (
                          <tr key={visitor.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(visitor.created_at)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                    <UserCircleIcon className="h-6 w-6" />
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{visitor.name}</div>
                                  <div className="text-sm text-gray-500">{visitor.type === 'student' ? 'Student' : 'External Visitor'}</div>
                                </div>
                              </div>
                            </td>
                            {activeTab === 'student' ? (
                              <>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {visitor.student_id || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {visitor.department || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {visitor.course || '-'}
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {visitor.email || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {visitor.address || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {visitor.affiliation_or_office || '-'}
                                </td>
                              </>
                            )}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {visitor.phone || visitor.contact || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="max-w-xs truncate">{visitor.purpose || '-'}</div>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
        </div>
    </AppLayout>
  );
}