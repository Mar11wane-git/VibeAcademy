<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ThreadReply extends Model
{
    protected $fillable = ['thread_id', 'user_id', 'text'];
    
    public function user() { return $this->belongsTo(User::class); }
    public function thread() { return $this->belongsTo(Thread::class); }
}
