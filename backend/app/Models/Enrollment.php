<?php

/**
 * MR1Academy Enrollment Model
 */
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Enrollment extends Model
{
    protected $fillable = [
        'user_id',
        'course_id',
        'progress',
        'completed_modules',
        'quiz_score',
        'quiz_passed',
        'certificate_uid',
        'certified_at',
    ];

    protected $casts = [
        'completed_modules' => 'array',
        'quiz_score'        => 'integer',
        'quiz_passed'       => 'boolean',
        'certified_at'      => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}
