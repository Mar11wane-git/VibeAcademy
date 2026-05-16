<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CourseController extends Controller
{
    public function index()
    {
        $courses = Course::with('instructor', 'modules')->get();
        return response()->json($courses);
    }

    public function show($id)
    {
        $course = Course::with('instructor', 'modules', 'comments.user')->findOrFail($id);
        return response()->json($course);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'thumbnail'   => 'required|string', // URL from Admin UI
        ]);

        $course = Course::create([
            'title'       => $data['title'],
            'description' => $data['description'],
            'thumbnail'   => $data['thumbnail'],
            'user_id'     => $request->user()->id,
        ]);

        return response()->json($course->load('instructor', 'modules'), 201);
    }

    public function update(Request $request, $id)
    {
        $course = Course::findOrFail($id);

        $data = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'thumbnail'   => 'required|string',
        ]);

        $course->update($data);

        return response()->json($course->load('instructor', 'modules'));
    }

    public function addModule(Request $request, $courseId)
    {
        $course = Course::findOrFail($courseId);

        $data = $request->validate([
            'title'     => 'required|string|max:255',
            'duration'  => 'required|string',
            'video_url' => 'required|string',
        ]);

        $module = $course->modules()->create($data);

        return response()->json($module, 201);
    }
}
