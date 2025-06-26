<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ConsultationController extends Controller
{
    public function index()
    {
        return Inertia::render('consultationPage/consultation', []);
    }
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:15',
            'address' => 'required|string|max:255',
            'office' => 'required|string|max:255',
            'purpose' => 'required|string|max:500',
        ]);
        $tracking = StudentConsultaion::create($request->all());
        return response()->json($tracking, 201);
    }
}
