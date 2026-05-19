<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index(Request $request)
    {
        return response()->json($request->user()->favorites()->with('instructor', 'modules')->get());
    }

    public function toggle(Request $request, $courseId)
    {
        $user = $request->user();
        $exists = $user->favorites()->where('course_id', $courseId)->exists();

        if ($exists) {
            $user->favorites()->detach($courseId);
            return response()->json(['favorited' => false, 'message' => 'Retiré des favoris']);
        } else {
            $user->favorites()->attach($courseId);
            return response()->json(['favorited' => true, 'message' => 'Ajouté aux favoris']);
        }
    }

    public function check(Request $request, $courseId)
    {
        $exists = $request->user()->favorites()->where('course_id', $courseId)->exists();
        return response()->json(['favorited' => $exists]);
    }
}
