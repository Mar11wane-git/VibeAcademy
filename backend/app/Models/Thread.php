<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Thread extends Model
{
    protected $fillable = [
        'user_id',
        'author_name',
        'title',
        'body',
        'code_snippet',
        'code_lang',
        'tag',
        'likes',
        'is_solved',
        'views',
    ];

    protected $casts = [
        'is_solved' => 'boolean',
        'likes' => 'integer',
        'views' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function replies()
    {
        return $this->hasMany(ThreadReply::class)->with('user');
    }
}
