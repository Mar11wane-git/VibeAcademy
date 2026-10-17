<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('agenda_events')) {
            Schema::create('agenda_events', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id')->nullable();
                $table->string('title');
                $table->date('date');
                $table->string('start_time', 10)->default('18:00');
                $table->string('end_time', 10)->default('19:30');
                $table->string('type', 30)->default('live');
                $table->string('instructor')->default('Coach Alex');
                $table->string('location')->default('Google Meet / Discord Live');
                $table->string('meeting_url')->nullable();
                $table->integer('spots')->default(50);
                $table->integer('enrolled')->default(1);
                $table->text('description')->nullable();
                $table->json('registered_users')->nullable();
                $table->json('reminded_users')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('agenda_events');
    }
};
