<?php

namespace App\Http\Controllers;

use App\Models\Thread;
use App\Models\ThreadReply;
use Illuminate\Http\Request;

class CommunityController extends Controller
{
    public function index()
    {
        $threads = Thread::with('user', 'replies.user')->orderBy('created_at', 'desc')->get();
        // format output
        $out = [];
        foreach($threads as $t) {
            $replies = [];
            foreach($t->replies as $r) {
                $replies[] = [
                    'id' => $r->id,
                    'author' => $r->user->name,
                    'text' => $r->text,
                    'time' => $r->created_at->diffForHumans()
                ];
            }
            $out[] = [
                'id' => $t->id,
                'author' => $t->user->name,
                'avatar' => strtoupper(substr($t->user->name, 0, 1)),
                'title' => $t->title,
                'replies' => $t->replies->count(),
                'likes' => $t->likes,
                'tag' => $t->tag,
                'time' => $t->created_at->diffForHumans(),
                'replyList' => $replies
            ];
        }
        return response()->json($out);
    }

    public function store(Request $request)
    {
        $data = $request->validate(['title' => 'required|string', 'tag' => 'nullable|string']);
        $tag = $data['tag'] ?? 'Discussion';
        $thread = Thread::create(['user_id' => $request->user()->id, 'title' => $data['title'], 'tag' => $tag, 'likes' => 0]);
        return response()->json($thread, 201);
    }

    public function reply(Request $request, $id)
    {
        $data = $request->validate(['text' => 'required|string']);
        $thread = Thread::findOrFail($id);
        $reply = $thread->replies()->create(['user_id' => $request->user()->id, 'text' => $data['text']]);
        return response()->json($reply, 201);
    }

    public function like($id)
    {
        $thread = Thread::findOrFail($id);
        $thread->increment('likes');
        return response()->json(['status' => 'liked']);
    }

    public function unlike($id)
    {
        $thread = Thread::findOrFail($id);
        $thread->decrement('likes');
        return response()->json(['status' => 'unliked']);
    }
}
