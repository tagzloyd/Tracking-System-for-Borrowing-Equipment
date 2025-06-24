<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Outsider extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'outsider';
    
    protected $fillable = [
        'name', 'email', 'phone', 'equipment_id', 'start_time', 'end_time', 'status'
    ];
    public function equipment()
{
    return $this->belongsTo(\App\Models\Equipment::class, 'equipment_id');
}
}
