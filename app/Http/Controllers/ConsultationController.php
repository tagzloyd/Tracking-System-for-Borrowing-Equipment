<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\StudentConsultation;
use App\Models\OutsiderConsultation;

class ConsultationController extends Controller
{
    public function index()
    {
        return Inertia::render('consultationPage/consultation', []);
    }
    
    public function reports()
    {
        return Inertia::render('consultationPage/reports', []);
    }
    
    public function studentConsultation()
    {
        return Inertia::render('consultationPage/studentConsultation', []);
    }
    
    public function HomePageConsultation()
    {
        return Inertia::render('consultationPage/HomePageConsultation', []);
    }
    
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'student_id' => 'required|string|max:20',
            'department' => 'required|string|max:100',
            'course' => 'required|string|max:100',
            'year' => 'required|string|max:10',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:15',
            'purpose' => 'required|string|max:500',
            'appointment_date' => 'required|date_format:Y-m-d\TH:i', // Matches datetime-local input format
        ]);

        // Convert the datetime format to match database
        $validated['appointment_date'] = date('Y-m-d H:i:s', strtotime($validated['appointment_date']));

        $tracking = StudentConsultation::create($validated);
        return response()->json($tracking, 201);
    }

    public function storeOutsider(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:15',
            'address' => 'required|string|max:255',
            'affiliation_or_office' => 'required|string|max:255',
            'purpose' => 'required|string|max:500',
            'appointment_date' => 'required|date_format:Y-m-d\TH:i',
        ]);

        // Convert the datetime format to match database
        $validated['appointment_date'] = date('Y-m-d H:i:s', strtotime($validated['appointment_date']));

        $tracking = OutsiderConsultation::create($validated);
        return response()->json($tracking, 201);
    }

    public function allConsultations()
    {
        $students = StudentConsultation::all();
        $outsiders = OutsiderConsultation::all();

        return response()->json([
            'students' => $students,
            'outsiders' => $outsiders,
        ]);
    }
}