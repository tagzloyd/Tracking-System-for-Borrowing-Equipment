<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\TrackingController;
use App\Http\Controllers\DataListController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    
    // Add this new route for tracking
    Route::get('log', [TrackingController::class, 'index'])->name('log');
    Route::get('data-list', [DataListController::class, 'index'])->name('data-list');
    
});
Route::get('Attendance/log', [TrackingController::class, 'log'])->name('tracking.log');
Route::get('Attendance/outsider', [TrackingController::class, 'outsider'])->name('tracking.outsider');
Route::get('Attendance', [TrackingController::class, 'attendance'])->name('tracking.main');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';