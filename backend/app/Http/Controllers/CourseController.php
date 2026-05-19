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
        try {
            $course = Course::with('instructor', 'modules', 'comments.user')->findOrFail($id);
            return response()->json($course);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Ce cours n\'existe pas ou a été supprimé.'], 404);
        }
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'thumbnail'   => 'required|string',
            'price'       => 'nullable|numeric|min:0',
        ], [
            'title.required'       => 'Le titre est obligatoire.',
            'description.required' => 'La description est obligatoire.',
            'thumbnail.required'   => 'L\'image de couverture est obligatoire.',
            'price.numeric'        => 'Le prix doit être un nombre valide.',
        ]);

        $course = Course::create([
            'title'       => $data['title'],
            'description' => $data['description'],
            'thumbnail'   => $data['thumbnail'],
            'price'       => $data['price'] ?? 0,
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
            'price'       => 'nullable|numeric|min:0',
        ], [
            'title.required'       => 'Le titre est obligatoire.',
            'description.required' => 'La description est obligatoire.',
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
        ], [
            'title.required'     => 'Le titre du module est requis.',
            'video_url.required' => 'Le lien de la vidéo est requis.',
        ]);

        $module = $course->modules()->create($data);

        return response()->json($module, 201);
    }

    /**
     * Specialized Error Handling for Personalized Routes
     */
    public function myCourses(Request $request)
    {
        try {
            $enrollments = $request->user()->enrollments()
                ->with('course.instructor', 'course.modules')
                ->get();
            return response()->json($enrollments);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur lors de la récupération de vos cours.'], 500);
        }
    }

    public function enroll(Request $request, $id)
    {
        $user = $request->user();
        
        try {
            $course = Course::findOrFail($id);
            
            // Already enrolled?
            if ($user->enrollments()->where('course_id', $id)->exists()) {
                return response()->json(['message' => 'Vous suivez déjà cette formation.'], 400);
            }

            $user->enrollments()->create([
                'course_id' => $id,
                'progress'  => 0
            ]);

            return response()->json(['message' => 'Inscription réussie ! Profitez de votre cours.']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Formation introuvable.'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Une erreur est survenue lors de l\'inscription.'], 500);
        }
    }
}
