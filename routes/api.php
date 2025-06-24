<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EquipmentController;
use App\Http\Controllers\TrackingController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::controller(EquipmentController::class)->group(function () {
    Route::get('equipment/getAll', 'getAll')->name('equipment.getAll');
    Route::post('equipment/store', 'store')->name('equipment.store');
    Route::get('equipment/{id}', 'show')->name('equipment.show');
    Route::put('equipment/{id}', 'update')->name('equipment.update');
    Route::delete('equipment/{id}', 'destroy')->name('equipment.destroy');
});

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