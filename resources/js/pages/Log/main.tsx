import { Head, router } from '@inertiajs/react';

export default function MainSelection() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <Head title="Equipment Borrowing Portal" />
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    <div className="flex items-center">
                        <a href={route('tracking.main')}>
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
            <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Equipment Borrowing Portal</h2>
                        <p className="text-gray-600 mb-8">
                            Please identify yourself to proceed with equipment borrowing
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div 
                            onClick={() => router.visit('Attendance/log')}
                            className="group cursor-pointer p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
                        >
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-blue-100 p-3 rounded-full group-hover:bg-blue-200 transition">
                                    <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l-9-5 9-5 9 5-9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-medium text-gray-900">University Student</h3>
                                    <p className="text-sm text-gray-500">
                                        Current enrolled students with valid university ID
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div 
                            onClick={() => router.visit('Attendance/outsider')}
                            className="group cursor-pointer p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200"
                        >
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-green-100 p-3 rounded-full group-hover:bg-green-200 transition">
                                    <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-medium text-gray-900">External Visitor</h3>
                                    <p className="text-sm text-gray-500">
                                        Researchers, partners, or guests from other institutions
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 
                    <div className="mt-8 text-center text-sm text-gray-500">
                        <p>Need help? Contact CREATE at <span className="text-blue-600">create@university.edu</span></p>
                        <p className="mt-1">or call <span className="font-medium">(123) 456-7890</span></p>
                    </div> */}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
                    <p>© {new Date().getFullYear()} CREATE - Center of Resource Assessment, Analytics and Emerging Technologies</p>
                    <p className="mt-1">All equipment borrowing is subject to institutional policies</p>
                </div>
            </footer>
        </div>
    );
}