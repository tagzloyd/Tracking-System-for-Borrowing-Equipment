<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentConsultaion extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'studentconsultation';

    protected $fillable = [
        'name',
        'student_id',
        'department',
        'course',
        'year',
        'email',
        'phone',
        'purpose', // Purpose of consultation
    ];

    public function getRouteKeyName()
    {
        return 'email'; // Use email as the route key
    }
}
