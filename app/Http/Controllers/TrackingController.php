<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Student;
use App\Models\Outsider;
use Illuminate\Support\Facades\Log;

class TrackingController extends Controller
{
    public function index(){
        return Inertia::render('Log/index', []);// Replace 'Tracking' with your actual component name
    }
    // Display the tracking page
    public function log()
    {
        return Inertia::render('Log/log', []); 
    }
    public function outsider()
    {
        return Inertia::render('Log/outsider', []); 
    }
    public function attendance()
    {
        return Inertia::render('Log/main', []); 
    }
    
    // Get all tracking records
    public function getAll()
    {
        // Get both students and outsiders and combine them
        $students = Student::all()->map(function($item) {
            return [
                'id' => $item->id,
                'name' => $item->name,
                'student_id' => $item->student_id,
                'department' => $item->department,
                'course' => $item->course,
                'year' => $item->year,
                'email' => $item->email,
                'phone' => $item->phone,
                'equipment_name' => $item->equipment_name,
                'start_time' => $item->start_time,
                'end_time' => $item->end_time,
                'status' => $item->status,
                'type' => 'student'
            ];
        });

        

        return $students;
    }

    // Store a new tracking record with validation
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'student_id' => 'required|string',
            'department' => 'nullable|string|max:255',
            'course' => 'nullable|string|max:255',
            'year' => 'nullable|string|max:255',
            'email' => 'required|email',
            'phone' => 'nullable|string|max:20',
            'equipment_name' => 'required|string|max:255', // Just a string, no lookup
            'start_time' => 'required|date',
            'end_time' => 'nullable|date|after_or_equal:start_time',
            'status' => 'required|string|max:50',
        ]);

        $tracking = Student::create($validated);
        return response()->json($tracking, 201);
    }

    // Store a new tracking record for outsiders (no student_id, department, course, year)
    public function storeOutsider(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'phone' => 'nullable|string|max:20',
            'equipment_name' => 'required|string|max:255', // Just a string, no lookup
            'start_time' => 'required|date',
            'end_time' => 'nullable|date|after_or_equal:start_time',
            'status' => 'required|string|max:50',
        ]);

        $outsider = Outsider::create($validated);
        return response()->json($outsider, 201);
    }

    // Show a single tracking record
    public function show($id)
    {
        $tracking = Student::findOrFail($id);
        return response()->json($tracking);
    }

    // Update a tracking record with validation
    public function update(Request $request, $id)
    {
        $tracking = Student::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'student_id' => 'required|string|unique:student_user,student_id,' . $id,
            'department' => 'nullable|string|max:255',
            'course' => 'nullable|string|max:255',
            'year' => 'nullable|string|max:255',
            'email' => 'required|email|unique:student_user,email,' . $id,
            'phone' => 'nullable|string|max:20',
            'equipment_name' => 'required|string|max:255', // Just a string, no lookup
            'start_time' => 'required|date',
            'end_time' => 'nullable|date|after_or_equal:start_time',
            'status' => 'required|string|max:50',
        ]);

        $tracking->update($validated);
        return response()->json($tracking);
    }

    // Delete a tracking record
    public function destroy($id)
    {
        $tracking = Student::findOrFail($id);
        $tracking->delete();
        return response()->json(['message' => 'Tracking deleted successfully']);
    }

    // Fetch all outsider records
    public function getAllOutsiders()
    {
        $outsiders = Outsider::all()->map(function($item) {
            return [
                'id' => $item->id,
                'name' => $item->name,
                'email' => $item->email,
                'phone' => $item->phone,
                'equipment_name' => $item->equipment_name,
                'start_time' => $item->start_time,
                'end_time' => $item->end_time,
                'status' => $item->status,
                'type' => 'outsider'
            ];
        });
        return response()->json($outsiders);
    }

    public function getDashboardData()
    {
        try {
            $totalStudents = Student::count();
            $totalOutsiders = Outsider::count();

            $activeBorrowedStudents = Student::where(function($q) {
                $q->whereNull('end_time')
                  ->orWhere('end_time', '>', now());
            })->where('status', '!=', 'Returned')->count();

            $activeBorrowedOutsiders = Outsider::where(function($q) {
                $q->whereNull('end_time')
                  ->orWhere('end_time', '>', now());
            })->where('status', '!=', 'Returned')->count();

            $activeBorrowings = $activeBorrowedStudents + $activeBorrowedOutsiders;

            // Remove Equipment-related code
            $mostUsedEquipment = 'N/A';
            $equipmentLabels = [];
            $equipmentUsage = [];

            $weeklyLabels = [];
            $weeklyStudents = [];
            $weeklyOutsiders = [];
            for ($i = 6; $i >= 0; $i--) {
                $date = now()->subDays($i);
                $weeklyLabels[] = $date->format('D');
                $weeklyStudents[] = Student::whereDate('start_time', $date)->count();
                $weeklyOutsiders[] = Outsider::whereDate('start_time', $date)->count();
            }

            $monthlyLabels = [];
            $monthlyStudents = [];
            $monthlyOutsiders = [];
            for ($i = 29; $i >= 0; $i--) {
                $date = now()->subDays($i);
                $monthlyLabels[] = $date->format('m/d');
                $monthlyStudents[] = Student::whereDate('start_time', $date)->count();
                $monthlyOutsiders[] = Outsider::whereDate('start_time', $date)->count();
            }

            // Student activities
            $studentActivities = Student::latest('start_time')
                ->get()
                ->map(function($activity) {
                    $status = 'Borrowed';
                    if ($activity->status === 'Returned') {
                        $status = 'Returned';
                    } elseif ($activity->end_time) {
                        $now = now();
                        if ($now->greaterThan(\Carbon\Carbon::parse($activity->end_time))) {
                            $status = 'Deadline';
                        } else {
                            $status = 'Borrowed';
                        }
                    }
                    return [
                        'id' => $activity->id,
                        'name' => $activity->name,
                        'time' => $activity->start_time ? \Carbon\Carbon::parse($activity->start_time)->diffForHumans() : '',
                        'status' => $status,
                        'type' => 'student',
                        'end_time' => $activity->end_time,
                    ];
                });

            // Outsider activities
            $outsiderActivities = Outsider::latest('start_time')
                ->get()
                ->map(function($activity) {
                    $status = 'Borrowed';
                    if ($activity->status === 'Returned') {
                        $status = 'Returned';
                    } elseif ($activity->end_time) {
                        $now = now();
                        if ($now->greaterThan(\Carbon\Carbon::parse($activity->end_time))) {
                            $status = 'Deadline'; 
                        } else {
                            $status = 'Borrowed';
                        }
                    }
                    return [
                        'id' => $activity->id,
                        'name' => $activity->name,
                        'time' => $activity->start_time ? \Carbon\Carbon::parse($activity->start_time)->diffForHumans() : '',
                        'status' => $status,
                        'type' => 'outsider',
                        'end_time' => $activity->end_time,
                    ];
                });

            // Combine and sort all activities
            $allActivities = $studentActivities->merge($outsiderActivities)
                ->sortByDesc('start_time')
                ->values()
                ->toArray();

            // Filter for deadlines (status is Deadline)
            $deadlines = array_filter($allActivities, function($activity) {
                return $activity['status'] === 'Deadline';
            });

            // Filter for active borrowings (status is Borrowed or Deadline)
            $activeBorrowings = array_filter($allActivities, function($activity) {
                return in_array($activity['status'], ['Borrowed', 'Deadline']);
            });

            // Filter for returned items
            $returned = array_filter($allActivities, function($activity) {
                return $activity['status'] === 'Returned';
            });

            // Get recent activity (all types, limited to 5)
            $recentActivity = array_slice($allActivities, 0, 5);

            return response()->json([
                'summary' => [
                    'totalStudents' => $totalStudents,
                    'totalOutsiders' => $totalOutsiders,
                    'activeBorrowings' => count($activeBorrowings),
                    'mostUsedEquipment' => $mostUsedEquipment
                ],
                'weeklyUsage' => [
                    'labels' => $weeklyLabels,
                    'students' => $weeklyStudents,
                    'outsiders' => $weeklyOutsiders
                ],
                'monthlyUsage' => [
                    'labels' => $monthlyLabels,
                    'students' => $monthlyStudents,
                    'outsiders' => $monthlyOutsiders
                ],
                'equipmentDistribution' => [
                    'labels' => $equipmentLabels,
                    'usage' => $equipmentUsage
                ],
                'recentActivity' => $recentActivity,
                'activeBorrowings' => array_values($activeBorrowings),
                'deadlines' => array_values($deadlines),
                'returned' => array_values($returned)
            ]);
            
        } catch (\Exception $e) {
            Log::error('Dashboard data error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to load dashboard data',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string|max:50',
            'type' => 'required|in:student,outsider'
        ]);

        if ($request->type === 'student') {
            $tracking = Student::findOrFail($id);
        } else {
            $tracking = Outsider::findOrFail($id);
        }

        $tracking->status = $request->status;
        // Optionally update end_time if marking as returned
        if ($request->status === 'Returned') {
            $tracking->end_time = now();
        }
        $tracking->save();

        return response()->json(['success' => true, 'status' => $tracking->status, 'end_time' => $tracking->end_time]);
    }
}