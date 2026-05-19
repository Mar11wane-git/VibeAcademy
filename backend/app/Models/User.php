<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, HasApiTokens;

    protected $fillable = [
        'name', 'email', 'password', 'avatar', 'is_admin',
        'email_verification_code', 'email_verified_at', 'verification_code_expires_at',
    ];

    protected $casts = [
        'is_admin'                     => 'boolean',
        'email_verified_at'            => 'datetime',
        'verification_code_expires_at' => 'datetime',
    ];

    protected $hidden = ['password', 'email_verification_code'];

    public function courses()
    {
        return $this->hasMany(Course::class);
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function favorites()
    {
        return $this->belongsToMany(Course::class, 'favorites')->withTimestamps();
    }
}
