<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Equipment;
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
        $trackings = Student::with('equipment')->get()->map(function($t) {
            $t->equipment_name = $t->equipment->name ?? null;
            return $t;
        });
        return response()->json($trackings);
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
            'equipment_id' => 'required|exists:equipment,id',
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
            'equipment_id' => 'required|exists:equipment,id',
            'start_time' => 'required|date',
            'end_time' => 'nullable|date|after_or_equal:start_time',
            'status' => 'required|string|max:50',
        ]);

        $outsider = Outsider::create($validated); // Use Outsider model, not Student
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
            'equipment_id' => 'required|exists:equipment,id',
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
        $outsiders = Outsider::with('equipment')->get()->map(function($o) {
            $o->equipment_name = $o->equipment->name ?? null;
            return $o;
        });
        return response()->json($outsiders);
    }
    public function getDashboardData()
    {
        try {
            $totalStudents = Student::count();
            $totalOutsiders = Outsider::count();

            // Count active "Borrowed" for students
            $activeBorrowedStudents = Student::where(function($q) {
                $q->whereNull('end_time')
                  ->orWhere('end_time', '>', now());
            })->where('status', '!=', 'Returned')->count();

            // Count active "Borrowed" for outsiders
            $activeBorrowedOutsiders = Outsider::where(function($q) {
                $q->whereNull('end_time')
                  ->orWhere('end_time', '>', now());
            })->where('status', '!=', 'Returned')->count();

            $activeBorrowings = $activeBorrowedStudents + $activeBorrowedOutsiders;

            $mostUsedEquipment = Equipment::withCount(['students', 'outsiders'])
                ->orderByDesc('students_count')
                ->orderByDesc('outsiders_count')
                ->first();

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

            $equipmentDistribution = Equipment::withCount(['students', 'outsiders'])
                ->orderByDesc('students_count')
                ->orderByDesc('outsiders_count')
                ->limit(4)
                ->get();

            $equipmentLabels = $equipmentDistribution->pluck('name')->toArray();
            $equipmentUsage = $equipmentDistribution->map(function($equipment) {
                return ($equipment->students_count ?? 0) + ($equipment->outsiders_count ?? 0);
            })->toArray();

            $studentActivities = Student::with('equipment')
                ->latest('start_time')
                ->limit(5)
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
                        'equipment' => $activity->equipment->name ?? 'Unknown',
                        'time' => $activity->start_time ? \Carbon\Carbon::parse($activity->start_time)->diffForHumans() : '',
                        'status' => $status,
                        'type' => 'student'
                    ];
                });

            $outsiderActivities = Outsider::with('equipment')
                ->latest('start_time')
                ->limit(5)
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
                        'equipment' => $activity->equipment->name ?? 'Unknown',
                        'time' => $activity->start_time ? \Carbon\Carbon::parse($activity->start_time)->diffForHumans() : '',
                        'status' => $status,
                        'type' => 'outsider'
                    ];
                });

            $recentActivity = $studentActivities->merge($outsiderActivities)
                ->sortByDesc('time')
                ->take(5)
                ->values()
                ->toArray();

            return response()->json([
                'summary' => [
                    'totalStudents' => $totalStudents,
                    'totalOutsiders' => $totalOutsiders,
                    'activeBorrowings' => $activeBorrowings,
                    'mostUsedEquipment' => $mostUsedEquipment?->name ?? 'No equipment'
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
                'recentActivity' => $recentActivity
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
