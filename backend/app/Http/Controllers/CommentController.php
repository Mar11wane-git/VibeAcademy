<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function store(Request $request, $courseId)
    {
        $data = $request->validate(['body' => 'required|string']);

        $comment = Comment::create([
            'user_id'   => $request->user()->id,
            'course_id' => $courseId,
            'body'      => $data['body'],
        ]);

        return response()->json($comment->load('user'), 201);
    }

    public function index($courseId)
    {
        $comments = Comment::with('user')
            ->where('course_id', $courseId)
            ->latest()
            ->get();

        return response()->json($comments);
    }

    public function destroy(Request $request, $id)
    {
        $comment = Comment::findOrFail($id);

        // Security: Owner of comment or owner of course can delete
        if ($comment->user_id !== $request->user()->id && $comment->course->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $comment->delete();
        return response()->json(['message' => 'Commentaire supprimé.']);
    }
}
