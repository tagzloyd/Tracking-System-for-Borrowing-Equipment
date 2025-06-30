<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\TrackingController;
use App\Http\Controllers\DataListController;
use App\Http\Controllers\ConsultationController;

Route::get('/admin', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    
    // Add this new route for tracking
    Route::get('log', [TrackingController::class, 'index'])->name('log');
    Route::get('records', [DataListController::class, 'index'])->name('records.index');
    Route::get('reports', [ConsultationController::class, 'reports'])->name('consultation.reports');
    Route::get('consultation', [ConsultationController::class, 'index'])->name('consultation.index');

});
    Route::get('Attendance/log', [TrackingController::class, 'log'])->name('tracking.log');
    Route::get('Attendance/outsider', [TrackingController::class, 'outsider'])->name('tracking.outsider');
    Route::get('Attendance', [TrackingController::class, 'attendance'])->name('tracking.main');
    Route::get('consultation/student', [ConsultationController::class, 'studentConsultation'])->name('consultation.student');
    Route::get('/', [ConsultationController::class, 'HomePageConsultation'])->name('consultation.home');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';