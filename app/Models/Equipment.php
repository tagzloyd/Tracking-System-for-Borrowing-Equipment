<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Equipment extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'equipment';  

    protected $fillable = [
        'name',
        'description',
        'serial_number',
        'model',
    ];

    public function getRouteKeyName()
    {
        return 'serial_number'; // Use serial_number as the route key
    }
    public function students()
    {
        return $this->hasMany(Student::class);
    }
    
    public function outsiders()
    {
        return $this->hasMany(Outsider::class);
    }
}
