<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    protected $fillable = ['course_id', 'title', 'video_url', 'duration', 'order'];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}
