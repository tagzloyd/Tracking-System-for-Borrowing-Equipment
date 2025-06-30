<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentConsultation extends Model
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
        'purpose',
        'appointment_date'
    ];
}
