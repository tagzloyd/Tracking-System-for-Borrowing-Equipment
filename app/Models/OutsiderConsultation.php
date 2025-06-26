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
        'office', // Office or organization of the outsider
        'purpose', // Purpose of consultation
    ];

    public function getRouteKeyName()
    {
        return 'email'; // Use email as the route key
    }
}
