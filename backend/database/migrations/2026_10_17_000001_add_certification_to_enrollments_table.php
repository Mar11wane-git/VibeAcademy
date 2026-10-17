<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            if (!Schema::hasColumn('enrollments', 'quiz_score')) {
                $table->integer('quiz_score')->nullable()->after('completed_modules');
            }
            if (!Schema::hasColumn('enrollments', 'quiz_passed')) {
                $table->boolean('quiz_passed')->default(false)->after('quiz_score');
            }
            if (!Schema::hasColumn('enrollments', 'certificate_uid')) {
                $table->string('certificate_uid', 64)->nullable()->after('quiz_passed');
            }
            if (!Schema::hasColumn('enrollments', 'certified_at')) {
                $table->timestamp('certified_at')->nullable()->after('certificate_uid');
            }
        });
    }

    public function down(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            $cols = array_filter(['quiz_score', 'quiz_passed', 'certificate_uid', 'certified_at'], fn($c) => Schema::hasColumn('enrollments', $c));
            if (!empty($cols)) {
                $table->dropColumn($cols);
            }
        });
    }
};
