import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement } from 'chart.js';
import { useState, useEffect } from 'react';

// Register ChartJS components
Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
];

interface ActivityItem {
  id: number;
  name: string;
  time: string;
  status: 'Borrowed' | 'Returned' | 'Deadline';
  type: 'student' | 'outsider';
  end_time?: string;
}

interface DashboardData {
  summary: {
    totalStudents: number;
    totalOutsiders: number;
    activeBorrowings: number;
  };
  weeklyUsage: {
    labels: string[];
    students: number[];
    outsiders: number[];
  };
  monthlyUsage: {
    labels: string[];
    students: number[];
    outsiders: number[];
  };
  recentActivity: ActivityItem[];
  activeBorrowings: ActivityItem[];
  deadlines: ActivityItem[];
  returned: ActivityItem[];
}

// Helper function to determine status based on end_time and status
function getStatus(item: ActivityItem) {
  if (item.status === 'Returned') return 'Returned';
  if (!item.end_time) return 'Borrowed';
  const now = new Date();
  const end = new Date(item.end_time);
  if (now > end) return 'Deadline';
  return 'Borrowed';
}

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/dashboard-data');
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen for dashboard-refresh event
    const handler = () => fetchData();
    window.addEventListener('dashboard-refresh', handler);

    // Cleanup
    return () => window.removeEventListener('dashboard-refresh', handler);
  }, []);

  if (loading || !dashboardData) {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Dashboard" />
        <div className="flex items-center justify-center h-full">
          <div className="text-lg">Loading dashboard data...</div>
        </div>
      </AppLayout>
    );
  }

  // Chart data for usage
  const usageChartData = {
    labels: timeRange === 'week' 
      ? dashboardData.weeklyUsage.labels 
      : dashboardData.monthlyUsage.labels,
    datasets: [
      {
        label: 'Students',
        data: timeRange === 'week' 
          ? dashboardData.weeklyUsage.students 
          : dashboardData.monthlyUsage.students,
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      },
      {
        label: 'Outsiders',
        data: timeRange === 'week' 
          ? dashboardData.weeklyUsage.outsiders 
          : dashboardData.monthlyUsage.outsiders,
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }
    ]
  };

  // Function to render user type badge
  const renderUserType = (type: 'student' | 'outsider') => {
    return (
      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
        type === 'student' 
          ? 'bg-blue-100 text-blue-800' 
          : 'bg-pink-100 text-pink-800'
      }`}>
        {type === 'student' ? 'Student' : 'Outsider'}
      </span>
    );
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />
      <div className="container mx-auto flex-1 flex flex-col gap-8 p-6">
        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="flex-shrink-0 rounded-full bg-blue-100 p-3">
              <svg className="h-7 w-7 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4a4 4 0 11-8 0 4 4 0 018 0zm6 8v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a6 6 0 0112 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Students</h3>
              <p className="mt-2 text-3xl font-semibold">{dashboardData.summary.totalStudents}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="flex-shrink-0 rounded-full bg-pink-100 p-3">
              <svg className="h-7 w-7 text-pink-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Outsiders</h3>
              <p className="mt-2 text-3xl font-semibold">{dashboardData.summary.totalOutsiders}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="flex-shrink-0 rounded-full bg-yellow-100 p-3">
              <svg className="h-7 w-7 text-yellow-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total No. of Active Borrowings</h3>
              <p className="mt-2 text-3xl font-semibold">{dashboardData.summary.activeBorrowings}</p>
            </div>
          </div>
        </div>

        {/* Borrower Usage and Recent Activity side by side */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Borrower Usage */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-700">Borrower Usage</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setTimeRange('week')}
                  className={`px-3 py-1 text-sm rounded-md transition ${
                    timeRange === 'week'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-blue-50'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setTimeRange('month')}
                  className={`px-3 py-1 text-sm rounded-md transition ${
                    timeRange === 'month'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-blue-50'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>
            <div className="flex-1 h-80">
              <Bar 
                data={usageChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: true,
                      text: `Usage by ${timeRange === 'week' ? 'Day' : 'Date'}`
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        precision: 0
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 flex flex-col">
            <h2 className="text-lg font-bold text-gray-700 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {dashboardData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start">
                  <div
                    className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center border
                      ${
                        activity.status === 'Returned'
                          ? 'bg-green-100 text-green-700 border-green-300'
                          : activity.status === 'Deadline'
                          ? 'bg-red-100 text-red-700 border-red-300'
                          : 'bg-yellow-100 text-yellow-700 border-yellow-300'
                      }`}
                  >
                    {activity.status === 'Returned' ? (
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 13l3 3 7-7" />
                      </svg>
                    ) : activity.status === 'Deadline' ? (
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01" />
                      </svg>
                    ) : (
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-semibold text-gray-800">
                      {activity.name} {renderUserType(activity.type)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.time} •{' '}
                      <span
                        className={`font-medium ${
                          activity.status === 'Returned'
                            ? 'text-green-700'
                            : activity.status === 'Deadline'
                            ? 'text-red-700'
                            : 'text-yellow-700'
                        }`}
                      >
                        {activity.status}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Borrowing Status Lists - Separate Container */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* Active Borrowings */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-blue-200 flex flex-col">
            <div className="flex items-center mb-3">
              <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 mr-2">
                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2" />
                </svg>
              </span>
              <h3 className="text-md font-semibold text-blue-700">Active Borrowings</h3>
            </div>
            <ul className="divide-y">
              {dashboardData.activeBorrowings.length === 0 && (
                <li className="py-2 text-gray-400">No active borrowings</li>
              )}
              {dashboardData.activeBorrowings.map((activity, idx) => (
                <li key={idx} className="py-2 flex items-center">
                  <div>
                    <span className="font-medium text-gray-800">{activity.name}</span>
                    {renderUserType(activity.type)}
                  </div>
                  <span className="ml-auto text-xs text-gray-500">{activity.time}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* Returned */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-green-200 flex flex-col">
            <div className="flex items-center mb-3">
              <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-green-100 mr-2">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 13l3 3 7-7" />
                </svg>
              </span>
              <h3 className="text-md font-semibold text-green-700">Returned</h3>
            </div>
            <ul className="divide-y">
              {dashboardData.returned.length === 0 && (
                <li className="py-2 text-gray-400">No returned items</li>
              )}
              {dashboardData.returned.map((activity, idx) => (
                <li key={idx} className="py-2 flex items-center">
                  <div>
                    <span className="font-medium text-gray-800">{activity.name}</span>
                    {renderUserType(activity.type)}
                  </div>
                  <span className="ml-auto text-xs text-gray-500">{activity.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}