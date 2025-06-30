<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OutsiderConsultation extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'outsiderconsultation';

    protected $fillable = [
        'name',
        'email',
        'phone',
        'address', // Address of the outsider
        'affiliation_or_office',
        'purpose', // Purpose of consultation
        'appointment_date' // Appointment date for the consultation
    ];

}
