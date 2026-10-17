<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AgendaEvent extends Model
{
    protected $table = 'agenda_events';

    protected $fillable = [
        'user_id',
        'title',
        'date',
        'start_time',
        'end_time',
        'type',
        'instructor',
        'location',
        'meeting_url',
        'spots',
        'enrolled',
        'description',
        'registered_users',
        'reminded_users',
    ];

    protected $casts = [
        'registered_users' => 'array',
        'reminded_users' => 'array',
        'spots' => 'integer',
        'enrolled' => 'integer',
    ];
}
