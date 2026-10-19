<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Automatically verify admin and core seeder accounts
        DB::table('users')
            ->where('is_admin', true)
            ->orWhere('email', 'like', '%@mr1academy.com')
            ->update([
                'email_verified_at' => now(),
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
    }
};
