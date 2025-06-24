import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Bar, Line } from 'react-chartjs-2';
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

interface DashboardData {
  summary: {
    totalStudents: number;
    totalOutsiders: number;
    activeBorrowings: number;
    mostUsedEquipment: string;
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
  equipmentDistribution: {
    labels: string[];
    usage: number[];
  };
  recentActivity: {
    name: string;
    equipment: string;
    time: string;
    status: 'Borrowed' | 'Returned' | 'Deadline'; // <-- add 'Deadline'
  }[];
}

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Refactor fetchData to a named function
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

  // Chart data for equipment distribution
  const equipmentChartData = {
    labels: dashboardData.equipmentDistribution.labels,
    datasets: [
      {
        label: 'Usage Count',
        data: dashboardData.equipmentDistribution.usage,
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />
      <div className="flex h-full flex-1 flex-col gap-6 p-6 overflow-x-auto">
        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            {/* Students icon */}
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
            {/* Outsiders icon */}
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
            {/* Borrowings icon */}
            <div className="flex-shrink-0 rounded-full bg-yellow-100 p-3">
              <svg className="h-7 w-7 text-yellow-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Active Borrowings</h3>
              <p className="mt-2 text-3xl font-semibold">{dashboardData.summary.activeBorrowings}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            {/* Equipment icon */}
            <div className="flex-shrink-0 rounded-full bg-green-100 p-3">
              <svg className="h-7 w-7 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <rect x="4" y="7" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 17v2a2 2 0 002 2h4a2 2 0 002-2v-2" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Most Used Equipment</h3>
              <p className="mt-2 text-xl font-semibold truncate">{dashboardData.summary.mostUsedEquipment}</p>
            </div>
          </div>
        </div>

        {/* Usage Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Equipment Usage</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setTimeRange('week')}
                className={`px-3 py-1 text-sm rounded-md ${timeRange === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
              >
                Weekly
              </button>
              <button
                onClick={() => setTimeRange('month')}
                className={`px-3 py-1 text-sm rounded-md ${timeRange === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
              >
                Monthly
              </button>
            </div>
          </div>
          <div className="h-80">
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

        {/* Bottom Section */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Equipment Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Equipment Distribution</h2>
            <div className="h-64">
              <Bar 
                data={equipmentChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
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
                      // Inertia check-circle icon
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 13l3 3 7-7" />
                      </svg>
                    ) : activity.status === 'Deadline' ? (
                      // Inertia exclamation icon
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01" />
                      </svg>
                    ) : (
                      // Inertia clock icon
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">
                      {activity.name} <span className="text-gray-500">used {activity.equipment}</span>
                    </p>
                    <p className="text-sm text-gray-500">
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
      </div>
    </AppLayout>
  );
}