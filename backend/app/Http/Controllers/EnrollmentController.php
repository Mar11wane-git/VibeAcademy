<?php

namespace App\Http\Controllers;

use App\Models\Enrollment;
use App\Models\Course;
use App\Models\Module;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class EnrollmentController extends Controller
{
    private function ensureColumns(): void
    {
        if (Schema::hasTable('enrollments') && !Schema::hasColumn('enrollments', 'certificate_uid')) {
            Schema::table('enrollments', function (Blueprint $table) {
                if (!Schema::hasColumn('enrollments', 'quiz_score')) {
                    $table->integer('quiz_score')->nullable();
                }
                if (!Schema::hasColumn('enrollments', 'quiz_passed')) {
                    $table->boolean('quiz_passed')->default(false);
                }
                if (!Schema::hasColumn('enrollments', 'certificate_uid')) {
                    $table->string('certificate_uid', 64)->nullable();
                }
                if (!Schema::hasColumn('enrollments', 'certified_at')) {
                    $table->timestamp('certified_at')->nullable();
                }
            });
        }
    }

    // Get all enrolled courses for logged-in user
    public function myEnrollments(Request $request)
    {
        $this->ensureColumns();
        $enrollments = Enrollment::with('course.instructor', 'course.modules')
            ->where('user_id', $request->user()->id)
            ->get();

        // Ensure progress reflects completed_modules accurately
        foreach ($enrollments as $enrollment) {
            if ($enrollment->course && $enrollment->course->modules) {
                $total = $enrollment->course->modules->count();
                $done = is_array($enrollment->completed_modules) ? count($enrollment->completed_modules) : 0;
                if ($total > 0) {
                    $calc = min(100, (int) round(($done / $total) * 100));
                    if ($calc > (int) $enrollment->progress) {
                        $enrollment->progress = $calc;
                        $enrollment->save();
                    }
                }
            }
        }

        return response()->json($enrollments);
    }

    // Enroll user in a course
    public function enroll(Request $request, $courseId)
    {
        $this->ensureColumns();
        $course = Course::findOrFail($courseId);

        $enrollment = Enrollment::firstOrCreate(
            [
                'user_id'   => $request->user()->id,
                'course_id' => $courseId,
            ],
            [
                'progress'          => 0,
                'completed_modules' => [],
            ]
        );

        $course->increment('students_count');

        return response()->json($enrollment->load('course.instructor', 'course.modules'), 201);
    }

    // Update course progress manual
    public function updateProgress(Request $request, $courseId)
    {
        $this->ensureColumns();
        $data = $request->validate(['progress' => 'required|integer|min:0|max:100']);

        $enrollment = Enrollment::where('user_id', $request->user()->id)
            ->where('course_id', $courseId)
            ->firstOrFail();

        $enrollment->update(['progress' => $data['progress']]);

        return response()->json($enrollment->load('course.instructor', 'course.modules'));
    }

    // Complete a module and recalculate progress
    public function completeModule(Request $request, $courseId)
    {
        $this->ensureColumns();
        $request->validate([
            'module_id' => 'required|exists:modules,id'
        ]);

        $moduleId = (int) $request->module_id;

        // Security: Ensure module belongs to the course
        $module = Module::where('id', $moduleId)
            ->where('course_id', $courseId)
            ->firstOrFail();

        $enrollment = Enrollment::firstOrCreate(
            [
                'user_id'   => $request->user()->id,
                'course_id' => $courseId,
            ],
            [
                'progress'          => 0,
                'completed_modules' => [],
            ]
        );

        $completed = is_array($enrollment->completed_modules) ? $enrollment->completed_modules : [];

        if (!in_array($moduleId, $completed)) {
            $completed[] = $moduleId;
        }
        $enrollment->completed_modules = array_values(array_unique($completed));

        // Recalculate progress percentage accurately
        $totalModules = Module::where('course_id', $courseId)->count();
        if ($totalModules > 0) {
            $enrollment->progress = min(100, (int) round((count($enrollment->completed_modules) / $totalModules) * 100));
        } else {
            $enrollment->progress = 100;
        }

        $enrollment->save();

        return response()->json($enrollment->load('course.instructor', 'course.modules'));
    }

    // Submit Quiz Score & Generate Official Certificate if score >= 80%
    public function submitQuiz(Request $request, $courseId)
    {
        $this->ensureColumns();
        $data = $request->validate([
            'score' => 'required|integer|min:0|max:100',
        ]);

        $user = $request->user();
        $enrollment = Enrollment::where('user_id', $user->id)
            ->where('course_id', $courseId)
            ->firstOrFail();

        $score = (int) $data['score'];
        $bestScore = max((int) ($enrollment->quiz_score ?? 0), $score);
        $enrollment->quiz_score = $bestScore;

        if ($score >= 80 || $enrollment->quiz_passed) {
            $enrollment->quiz_passed = true;
            if (!$enrollment->certificate_uid) {
                $hash = strtoupper(substr( hash('sha256', $user->id . '-' . $courseId . '-MR1Academy'), 0, 8 ));
                $enrollment->certificate_uid = 'VIBE-' . date('Y') . '-' . str_pad((string)$courseId, 2, '0', STR_PAD_LEFT) . '-' . $hash;
            }
            if (!$enrollment->certified_at) {
                $enrollment->certified_at = now();
            }
        }

        $enrollment->save();

        return response()->json($enrollment->load('course.instructor', 'course.modules'));
    }
}
