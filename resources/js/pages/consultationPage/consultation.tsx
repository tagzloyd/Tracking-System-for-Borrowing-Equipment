import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import React, { useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { BreadcrumbItem } from '@/types';
import axios from 'axios';
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Consultation', href: '/consultation' },
];

const departments = ["All Departments", "Computer Science", "Engineering", "Business"];

interface ConsultationUser {
  id?: number | string;
  name: string;
  email?: string;
  address?: string;
  phone?: string;
  office?: string;
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

export default function ConsultationPage() {
  const [search, setSearch] = React.useState('');
  const [department, setDepartment] = React.useState('All Departments');
  const [dateFrom, setDateFrom] = React.useState('');
  const [dateTo, setDateTo] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const [getuser, setGetUser] = React.useState<ConsultationUser[]>([]);
  
  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/consultation/all');
      setGetUser([
        ...res.data.students.map((s: Partial<ConsultationUser>) => ({ ...s, type: 'student' })),
        ...res.data.outsiders.map((o: Partial<ConsultationUser>) => ({ ...o, type: 'outsider' })),
      ]);
    } catch (err) {
      setError('Failed to fetch consultation data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  const addStudentConsultation = async (data: Omit<ConsultationUser, 'type'>) => {
    try {
      const res = await axios.post('/consultation/store', data);
      setGetUser(prev => [
        { ...res.data, type: 'student' },
        ...prev,
      ]);
      return true;
    } catch (error) {
      setError('Failed to add student consultation');
      console.error(error);
      return false;
    }
  };

  const addOutsiderConsultation = async (data: Omit<ConsultationUser, 'type'>) => {
    try {
      const res = await axios.post('/consultation/store-outsider', data);
      setGetUser(prev => [
        { ...res.data, type: 'outsider' },
        ...prev,
      ]);
      return true;
    } catch (error) {
      setError('Failed to add outsider consultation');
      console.error(error);
      return false;
    }
  };

  const [showStudentForm, setShowStudentForm] = React.useState(false);
  const [showOutsiderForm, setShowOutsiderForm] = React.useState(false);

  const [studentForm, setStudentForm] = React.useState({
    name: '',
    student_id: '',
    department: '',
    course: '',
    year: '',
    email: '',
    phone: '',
    purpose: '',
  });

  const [outsiderForm, setOutsiderForm] = React.useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    office: '',
    purpose: '',
  });

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const filteredUsers = getuser.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) || 
                         (user.student_id && user.student_id.toLowerCase().includes(search.toLowerCase())) ||
                         (user.id_number && user.id_number.toLowerCase().includes(search.toLowerCase()));
    
    const matchesDepartment = department === 'All Departments' || 
                            (user.department && user.department === department);
    
    const matchesDateFrom = !dateFrom || (user.created_at && new Date(user.created_at) >= new Date(dateFrom));
    const matchesDateTo = !dateTo || (user.created_at && new Date(user.created_at) <= new Date(dateTo));
    
    return matchesSearch && matchesDepartment && matchesDateFrom && matchesDateTo;
  });

  return (
    <AppLayout>
      <Head title="Consultation Visitor Log" />
      <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <span className="block sm:inline">{error}</span>
            <button onClick={() => setError('')} className="absolute top-0 right-0 px-4 py-3">
              &times;
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          {/* Replace these with dynamic stats */}
          <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
            <div>
              <div className="text-2xl font-bold text-gray-800">{getuser.length}</div>
              <div className="text-gray-500 text-sm">Total Visitors</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
            <div>
              <div className="text-2xl font-bold text-gray-800">
                {getuser.filter(u => u.type === 'student').length}
              </div>
              <div className="text-gray-500 text-sm">Students</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
            <div>
              <div className="text-2xl font-bold text-gray-800">
                {getuser.filter(u => u.type === 'outsider').length}
              </div>
              <div className="text-gray-500 text-sm">Outsiders</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
            <div>
              <div className="text-2xl font-bold text-gray-800">
                {new Set(getuser.map(u => u.department)).size - 1} {/* -1 for undefined */}
              </div>
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

        {/* Add Visitor Buttons */}
        <div className="mb-4 flex gap-2">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => setShowStudentForm(true)}
          >
            Add Student
          </button>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            onClick={() => setShowOutsiderForm(true)}
          >
            Add Outsider
          </button>
        </div>

        {/* Student Form Modal */}
        {showStudentForm && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow w-full max-w-md">
              <h2 className="text-lg font-bold mb-4">Add Student Consultation</h2>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const success = await addStudentConsultation(studentForm);
                  if (success) {
                    setShowStudentForm(false);
                    setStudentForm({
                      name: '',
                      student_id: '',
                      department: '',
                      course: '',
                      year: '',
                      email: '',
                      phone: '',
                      purpose: '',
                    });
                  }
                }}
                className="space-y-2"
              >
                <input className="w-full border rounded px-2 py-1" placeholder="Name" value={studentForm.name} onChange={e => setStudentForm(f => ({ ...f, name: e.target.value }))} required />
                <input className="w-full border rounded px-2 py-1" placeholder="Student ID" value={studentForm.student_id} onChange={e => setStudentForm(f => ({ ...f, student_id: e.target.value }))} required />
                <input className="w-full border rounded px-2 py-1" placeholder="Department" value={studentForm.department} onChange={e => setStudentForm(f => ({ ...f, department: e.target.value }))} required />
                <input className="w-full border rounded px-2 py-1" placeholder="Course" value={studentForm.course} onChange={e => setStudentForm(f => ({ ...f, course: e.target.value }))} required />
                <input className="w-full border rounded px-2 py-1" placeholder="Year" value={studentForm.year} onChange={e => setStudentForm(f => ({ ...f, year: e.target.value }))} required />
                <input type="email" className="w-full border rounded px-2 py-1" placeholder="Email" value={studentForm.email} onChange={e => setStudentForm(f => ({ ...f, email: e.target.value }))} required />
                <input type="tel" className="w-full border rounded px-2 py-1" placeholder="Phone" value={studentForm.phone} onChange={e => setStudentForm(f => ({ ...f, phone: e.target.value }))} required />
                <textarea className="w-full border rounded px-2 py-1" placeholder="Purpose" value={studentForm.purpose} onChange={e => setStudentForm(f => ({ ...f, purpose: e.target.value }))} required />
                <div className="flex gap-2 mt-2">
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
                  <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => setShowStudentForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Outsider Form Modal */}
        {showOutsiderForm && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow w-full max-w-md">
              <h2 className="text-lg font-bold mb-4">Add Outsider Consultation</h2>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const success = await addOutsiderConsultation(outsiderForm);
                  if (success) {
                    setShowOutsiderForm(false);
                    setOutsiderForm({
                      name: '',
                      email: '',
                      phone: '',
                      address: '',
                      office: '',
                      purpose: '',
                    });
                  }
                }}
                className="space-y-2"
              >
                <input className="w-full border rounded px-2 py-1" placeholder="Name" value={outsiderForm.name} onChange={e => setOutsiderForm(f => ({ ...f, name: e.target.value }))} required />
                <input type="email" className="w-full border rounded px-2 py-1" placeholder="Email" value={outsiderForm.email} onChange={e => setOutsiderForm(f => ({ ...f, email: e.target.value }))} required />
                <input type="tel" className="w-full border rounded px-2 py-1" placeholder="Phone" value={outsiderForm.phone} onChange={e => setOutsiderForm(f => ({ ...f, phone: e.target.value }))} required />
                <input className="w-full border rounded px-2 py-1" placeholder="Address" value={outsiderForm.address} onChange={e => setOutsiderForm(f => ({ ...f, address: e.target.value }))} required />
                <input className="w-full border rounded px-2 py-1" placeholder="Office" value={outsiderForm.office} onChange={e => setOutsiderForm(f => ({ ...f, office: e.target.value }))} required />
                <textarea className="w-full border rounded px-2 py-1" placeholder="Purpose" value={outsiderForm.purpose} onChange={e => setOutsiderForm(f => ({ ...f, purpose: e.target.value }))} required />
                <div className="flex gap-2 mt-2">
                  <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
                  <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => setShowOutsiderForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Visitor Logs Table */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="font-semibold text-gray-700 mb-4">Recent Visitor Logs</div>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
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
                    <th className="px-4 py-2 text-left font-semibold text-gray-500">TYPE</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-400">
                        No visitor logs found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((log, idx) => (
                      <tr key={log.id || idx} className="border-b last:border-b-0 hover:bg-gray-50">
                        <td className="px-4 py-2">{formatDate(log.created_at)}</td>
                        <td className="px-4 py-2">{log.name}</td>
                        <td className="px-4 py-2">{log.student_id || log.id_number || '-'}</td>
                        <td className="px-4 py-2">{log.department || '-'}</td>
                        <td className="px-4 py-2">{log.course || '-'}</td>
                        <td className="px-4 py-2">{log.phone || log.contact || '-'}</td>
                        <td className="px-4 py-2">{log.purpose}</td>
                        <td className="px-4 py-2 capitalize">{log.type}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}