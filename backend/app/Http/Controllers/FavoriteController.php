<?php

/**
 * MR1Academy Favorite Controller
 */
namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class FavoriteController extends Controller
{
    private function ensureSchema(): void
    {
        if (Cache::get('vibe_favorites_schema_v2')) {
            return;
        }
        if (Schema::hasTable('favorites')) {
            Schema::table('favorites', function (Blueprint $table) {
                if (!Schema::hasColumn('favorites', 'priority')) {
                    $table->string('priority', 20)->default('medium')->after('course_id');
                }
                if (!Schema::hasColumn('favorites', 'collection')) {
                    $table->string('collection', 50)->default('À étudier')->after('priority');
                }
                if (!Schema::hasColumn('favorites', 'personal_note')) {
                    $table->text('personal_note')->nullable()->after('collection');
                }
            });
        }
        Cache::forever('vibe_favorites_schema_v2', true);
    }

    public function index(Request $request)
    {
        $this->ensureSchema();
        $user = $request->user('sanctum') ?? $request->user();
        if (!$user) {
            return response()->json([]);
        }

        $courses = $user->favorites()
            ->with('instructor', 'modules')
            ->withPivot(['priority', 'collection', 'personal_note', 'created_at'])
            ->get()
            ->map(function ($course) {
                $course->favorite_priority = $course->pivot->priority ?? 'medium';
                $course->favorite_collection = $course->pivot->collection ?? 'À étudier';
                $course->favorite_note = $course->pivot->personal_note ?? '';
                $course->favorited_at = $course->pivot->created_at ?? now();
                return $course;
            });

        return response()->json($courses);
    }

    public function toggle(Request $request, $courseId)
    {
        $this->ensureSchema();
        $user = $request->user('sanctum') ?? $request->user();
        if (!$user) {
            return response()->json(['message' => 'Non authentifié'], 401);
        }

        $exists = $user->favorites()->where('course_id', $courseId)->exists();

        if ($exists) {
            $user->favorites()->detach($courseId);
            return response()->json(['favorited' => false, 'message' => 'Retiré des favoris']);
        } else {
            $priority = $request->input('priority', 'medium');
            $collection = $request->input('collection', 'À étudier');
            $user->favorites()->attach($courseId, [
                'priority' => $priority,
                'collection' => $collection,
            ]);
            return response()->json(['favorited' => true, 'message' => 'Ajouté aux favoris']);
        }
    }

    public function updateMeta(Request $request, $courseId)
    {
        $this->ensureSchema();
        $user = $request->user('sanctum') ?? $request->user();
        if (!$user) {
            return response()->json(['message' => 'Non authentifié'], 401);
        }

        $data = [];
        if ($request->has('priority')) {
            $data['priority'] = $request->input('priority');
        }
        if ($request->has('collection')) {
            $data['collection'] = $request->input('collection');
        }
        if ($request->has('personal_note')) {
            $data['personal_note'] = $request->input('personal_note');
        }

        if (!empty($data)) {
            $data['updated_at'] = now();
            DB::table('favorites')
                ->where('user_id', $user->id)
                ->where('course_id', $courseId)
                ->update($data);
        }

        return response()->json([
            'status' => 'updated',
            'course_id' => (int) $courseId,
            'meta' => $data,
        ]);
    }

    public function check(Request $request, $courseId)
    {
        $user = $request->user('sanctum') ?? $request->user();
        if (!$user) {
            return response()->json(['favorited' => false]);
        }
        $exists = $user->favorites()->where('course_id', $courseId)->exists();
        return response()->json(['favorited' => $exists]);
    }
}
