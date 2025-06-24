<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Equipment;

class EquipmentController extends Controller
{
    public function index(){
        return Inertia::render('Equipment/index', []);
    }
    public function getAll()
    {
        $equipment = Equipment::all();
        return response()->json($equipment);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'serial_number' => 'required|string|unique:equipment,serial_number',
            'model' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
        ]);

        $equipment = Equipment::create($validated);
        return $equipment;
    }

    public function show($id)
    {
        $equipment = Equipment::findOrFail($id);
        return response()->json($equipment);
    }

    public function update(Request $request, $id)
    {
        $equipment = Equipment::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'serial_number' => 'required|string|unique:equipment,serial_number,' . $id,
            'model' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        $equipment->update($validated);
        return $equipment;
    }

    public function destroy($id)
    {
        $equipment = Equipment::findOrFail($id);
        $equipment->delete();
        return response()->json(['message' => 'Equipment deleted successfully']);
    }
}
