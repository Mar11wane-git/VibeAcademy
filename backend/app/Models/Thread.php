<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Thread extends Model
{
    protected $fillable = ['user_id', 'title', 'tag', 'likes'];
    
    public function user() { return $this->belongsTo(User::class); }
    public function replies() { return $this->hasMany(ThreadReply::class)->with('user'); }
}
