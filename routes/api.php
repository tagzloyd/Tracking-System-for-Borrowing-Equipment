<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TrackingController;
use App\Http\Controllers\ConsultationController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::controller(TrackingController::class)->group(function () {
    Route::get('tracking', 'getAll')->name('tracking.getAll');
    Route::post('tracking/store', 'store')->name('tracking.store');
    Route::get('tracking/{id}', 'show')->name('tracking.show');
    Route::put('tracking/{id}', 'update')->name('tracking.update');
    Route::delete('tracking/{id}', 'destroy')->name('tracking.destroy');
    Route::get('outsider', 'getAllOutsiders')->name('outsider.getAll');
    Route::post('tracking/store-outsider', 'storeOutsider')->name('tracking.storeOutsider');
    Route::patch('tracking/{id}/status', 'updateStatus')->name('tracking.updateStatus');
});
Route::get('/dashboard-data', [TrackingController::class, 'getDashboardData']);

Route::controller(ConsultationController::class)->group(function () {
    Route::get('consultation', 'fetch')->name('consultation.fetch');
    Route::get('consultation/outsider', 'fetchOutsider')->name('consultation.fetchOutsider');
    Route::post('consultation/store', 'store')->name('consultation.store');
    Route::post('consultation/store-outsider', 'storeOutsider')->name('consultation.storeOutsider');
});
Route::get('consultation/all', [ConsultationController::class, 'allConsultations'])->name('consultation.all');