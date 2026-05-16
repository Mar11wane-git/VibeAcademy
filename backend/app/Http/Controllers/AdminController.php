<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Models\User;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Comment;

class AdminController extends Controller
{
    public function stats()
    {
        $totalUsers    = User::where('is_admin', false)->count();
        $totalCourses  = Course::count();
        $totalEnrolls  = Enrollment::count();
        $totalComments = Comment::count();

        // Completion rate: enrollments with progress = 100
        $completed     = Enrollment::where('progress', 100)->count();
        $completionRate = $totalEnrolls > 0 ? round(($completed / $totalEnrolls) * 100, 1) : 0;

        // New users this month
        $newUsersMonth = User::where('is_admin', false)
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        // New enrollments this month
        $newEnrollsMonth = Enrollment::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        // Top 5 courses by students_count
        $topCourses = Course::withCount('enrollments')
            ->orderByDesc('enrollments_count')
            ->limit(5)
            ->get(['id', 'title', 'enrollments_count']);

        // Monthly registrations for last 6 months
        $monthlyRegistrations = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthlyRegistrations[] = [
                'month' => $date->format('M'),
                'count' => User::where('is_admin', false)
                    ->whereMonth('created_at', $date->month)
                    ->whereYear('created_at', $date->year)
                    ->count(),
            ];
        }

        // Monthly enrollments for last 6 months
        $monthlyEnrollments = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthlyEnrollments[] = [
                'month' => $date->format('M'),
                'count' => Enrollment::whereMonth('created_at', $date->month)
                    ->whereYear('created_at', $date->year)
                    ->count(),
            ];
        }

        // Threads count (if table exists)
        $totalThreads = 0;
        try {
            $totalThreads = DB::table('threads')->count();
        } catch (\Exception $e) {}

        // Recent 5 users
        $recentUsers = User::where('is_admin', false)
            ->latest()
            ->limit(5)
            ->get(['id', 'name', 'email', 'created_at']);

        return response()->json([
            'users'                 => $totalUsers,
            'courses'               => $totalCourses,
            'enrollments'           => $totalEnrolls,
            'comments'              => $totalComments,
            'threads'               => $totalThreads,
            'completion_rate'       => $completionRate,
            'new_users_month'       => $newUsersMonth,
            'new_enrollments_month' => $newEnrollsMonth,
            'top_courses'           => $topCourses,
            'monthly_registrations' => $monthlyRegistrations,
            'monthly_enrollments'   => $monthlyEnrollments,
            'recent_users'          => $recentUsers,
        ]);
    }

    public function allCourses()
    {
        return response()->json(Course::with('instructor', 'modules')->withCount('enrollments')->get());
    }

    public function allUsers()
    {
        return response()->json(
            User::where('is_admin', false)
                ->withCount('enrollments')
                ->latest()
                ->get()
        );
    }

    public function deleteCourse($id)
    {
        $course = Course::findOrFail($id);
        $course->modules()->delete();
        $course->enrollments()->delete();
        $course->comments()->delete();
        $course->delete();
        return response()->json(['message' => 'Cours supprimé avec succès.']);
    }

    public function deleteUser($id)
    {
        $user = User::findOrFail($id);
        $user->enrollments()->delete();
        $user->comments()->delete();
        $user->courses()->delete();
        $user->delete();
        return response()->json(['message' => 'Utilisateur supprimé avec succès.']);
    }
}
