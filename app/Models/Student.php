<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'student_user';

    protected $fillable = [
        'name',
        'student_id',
        'department',
        'course',
        'year',
        'email',
        'phone', // should be 'phone', not 'phone_number'
        'equipment_id',
        'start_time', // should be 'start_time', not 'start_date'
        'end_time',   // should be 'end_time', not 'end_date'
        'status', // e.g., 'active', 'inactive', 'maintenance'
    ];

    public function getRouteKeyName()
    {
        return 'email'; // Use email as the route key
    }
    
    public function equipment()
    {
        return $this->belongsTo(\App\Models\Equipment::class, 'equipment_id');
    }
}
