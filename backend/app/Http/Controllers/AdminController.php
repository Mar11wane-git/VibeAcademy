<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\User;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Comment;

class AdminController extends Controller
{
    public function stats()
    {
        return response()->json([
            'users'       => User::where('is_admin', false)->count(),
            'admins'      => User::where('is_admin', true)->count(),
            'courses'     => Course::count(),
            'enrollments' => Enrollment::count(),
            'comments'    => Comment::count(),
        ]);
    }

    public function allCourses()
    {
        return response()->json(Course::with('instructor', 'modules')->get());
    }

    public function allUsers()
    {
        return response()->json(User::where('is_admin', false)->get());
    }

    public function deleteCourse($id)
    {
        $course = Course::findOrFail($id);
        // Cascade delete manually to bypass missing ON DELETE CASCADE
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
        $user->courses()->delete(); // If they instruct courses
        $user->delete();
        return response()->json(['message' => 'Utilisateur supprimé avec succès.']);
    }
}
