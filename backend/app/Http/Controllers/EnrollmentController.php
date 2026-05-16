<?php

namespace App\Http\Controllers;

use App\Models\Enrollment;
use App\Models\Course;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    // Get all enrolled courses for logged-in user
    public function myEnrollments(Request $request)
    {
        $enrollments = Enrollment::with('course.instructor', 'course.modules')
            ->where('user_id', $request->user()->id)
            ->get();

        return response()->json($enrollments);
    }

    // Enroll user in a course
    public function enroll(Request $request, $courseId)
    {
        $course = Course::findOrFail($courseId);

        $enrollment = Enrollment::firstOrCreate([
            'user_id'   => $request->user()->id,
            'course_id' => $courseId,
        ]);

        $course->increment('students_count');

        return response()->json($enrollment, 201);
    }

    // Update course progress manual
    public function updateProgress(Request $request, $courseId)
    {
        $data = $request->validate(['progress' => 'required|integer|min:0|max:100']);

        $enrollment = Enrollment::where('user_id', $request->user()->id)
            ->where('course_id', $courseId)
            ->firstOrFail();

        $enrollment->update(['progress' => $data['progress']]);

        return response()->json($enrollment);
    }

    // Complete a module and recalculate progress
    public function completeModule(Request $request, $courseId)
    {
        $request->validate([
            'module_id' => 'required|exists:modules,id'
        ]);
        
        $moduleId = (int) $request->module_id;

        // Security: Ensure module belongs to the course
        $module = \App\Models\Module::where('id', $moduleId)
            ->where('course_id', $courseId)
            ->firstOrFail();

        $enrollment = Enrollment::where('user_id', $request->user()->id)
            ->where('course_id', $courseId)
            ->firstOrFail();

        $completed = $enrollment->completed_modules ?? [];

        if (!in_array($moduleId, $completed)) {
            $completed[] = $moduleId;
            $enrollment->completed_modules = $completed;
            
            // Recalculate progress percentage accurately
            $totalModules = \App\Models\Module::where('course_id', $courseId)->count();
            if ($totalModules > 0) {
                // Ensure we don't exceed 100% and round down to nearest int
                $enrollment->progress = min(100, (int) (count($completed) / $totalModules * 100));
            }
            
            $enrollment->save();
        }

        return response()->json($enrollment->load('course.modules'));
    }
}
