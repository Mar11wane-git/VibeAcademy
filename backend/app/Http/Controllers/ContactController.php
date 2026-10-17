<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class ContactController extends Controller
{
    private function ensureSchema(): void
    {
        if (Cache::get('vibe_contact_schema_v1')) {
            return;
        }

        if (!Schema::hasTable('contact_messages')) {
            Schema::create('contact_messages', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id')->nullable();
                $table->string('ticket_ref', 40)->unique();
                $table->string('name', 120);
                $table->string('email', 150);
                $table->string('category', 60)->default('Support Technique');
                $table->string('priority', 30)->default('normale');
                $table->string('subject', 200);
                $table->text('message');
                $table->string('status', 30)->default('Reçu • En traitement');
                $table->timestamps();
            });
        }

        Cache::forever('vibe_contact_schema_v1', true);
    }

    public function store(Request $request)
    {
        $this->ensureSchema();

        $validated = $request->validate([
            'name'     => 'required|string|max:120',
            'email'    => 'required|email|max:150',
            'category' => 'nullable|string|max:60',
            'priority' => 'nullable|string|max:30',
            'subject'  => 'required|string|max:200',
            'message'  => 'required|string|max:5000',
        ]);

        $user = $request->user('sanctum') ?? $request->user();
        $ticketRef = 'VIBE-SUP-' . strtoupper(substr(md5(uniqid((string) mt_rand(), true)), 0, 6));

        $id = DB::table('contact_messages')->insertGetId([
            'user_id'    => $user ? $user->id : null,
            'ticket_ref' => $ticketRef,
            'name'       => $validated['name'],
            'email'      => $validated['email'],
            'category'   => $validated['category'] ?? 'Support Technique',
            'priority'   => $validated['priority'] ?? 'normale',
            'subject'    => $validated['subject'],
            'message'    => $validated['message'],
            'status'     => 'Reçu • Réponse sous 2h',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $ticket = DB::table('contact_messages')->where('id', $id)->first();

        return response()->json([
            'message' => 'Votre demande a bien été enregistrée par notre équipe Support.',
            'ticket'  => $ticket,
        ], 201);
    }

    public function index(Request $request)
    {
        $this->ensureSchema();
        $user = $request->user('sanctum') ?? $request->user();

        $query = DB::table('contact_messages')->orderByDesc('created_at');
        if ($user) {
            $query->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhere('email', $user->email);
            });
        } else {
            return response()->json([]);
        }

        return response()->json($query->limit(10)->get());
    }
}
