<?php

namespace App\Http\Controllers;

use App\Models\AgendaEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Cache;

class AgendaController extends Controller
{
    private function ensureSchemaAndSeed(): void
    {
        if (Cache::get('vibe_agenda_schema_ready_v1')) {
            return;
        }
        if (!Schema::hasTable('agenda_events')) {
            Schema::create('agenda_events', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id')->nullable();
                $table->string('title');
                $table->date('date');
                $table->string('start_time', 10)->default('18:00');
                $table->string('end_time', 10)->default('19:30');
                $table->string('type', 30)->default('live');
                $table->string('instructor')->default('Coach Alex');
                $table->string('location')->default('Google Meet / Discord Live');
                $table->string('meeting_url')->nullable();
                $table->integer('spots')->default(50);
                $table->integer('enrolled')->default(1);
                $table->text('description')->nullable();
                $table->json('registered_users')->nullable();
                $table->json('reminded_users')->nullable();
                $table->timestamps();
            });
        }

        if (AgendaEvent::count() === 0) {
            $defaults = [
                ['title' => 'Live Coding: React Hooks & Custom Patterns', 'date' => '2026-10-05', 'start_time' => '18:00', 'end_time' => '19:30', 'type' => 'live', 'instructor' => 'Coach Alex', 'location' => 'Google Meet Live', 'meeting_url' => 'https://meet.google.com/vibe-react-live', 'spots' => 45, 'enrolled' => 38, 'description' => 'Deep dive dans useReducer, useContext, useMemo et la création de hooks personnalisés performants.'],
                ['title' => 'Workshop: Déploiement Docker & CI/CD GitHub Actions', 'date' => '2026-10-07', 'start_time' => '14:00', 'end_time' => '16:00', 'type' => 'workshop', 'instructor' => 'Mentor Karim', 'location' => 'Discord Stage #devops', 'meeting_url' => 'https://discord.gg/MR1Academy', 'spots' => 30, 'enrolled' => 27, 'description' => 'Apprenez à containeriser une stack React + Laravel et automatiser le pipeline CI/CD en production.'],
                ['title' => 'Code Review: API RESTful Node.js & Sécurité JWT', 'date' => '2026-10-09', 'start_time' => '14:30', 'end_time' => '16:00', 'type' => 'review', 'instructor' => 'Mentor Sarah', 'location' => 'Zoom Pro Room 2', 'meeting_url' => 'https://zoom.us/j/vibe-review', 'spots' => 20, 'enrolled' => 19, 'description' => 'Revue de code collective du projet n°3 avec analyse de sécurité OWASP et feedback architectural.'],
                ['title' => 'Session Q&A: Carrière Dev Full-Stack & Négociation', 'date' => '2026-10-12', 'start_time' => '19:00', 'end_time' => '20:30', 'type' => 'qa', 'instructor' => 'Équipe Vibe', 'location' => 'YouTube Live Privé', 'meeting_url' => 'https://meet.google.com/vibe-career-qa', 'spots' => 100, 'enrolled' => 64, 'description' => 'Session interactive sur le marché tech, optimisation LinkedIn/GitHub et préparation aux entretiens.'],
                ['title' => 'Masterclass: Architecture TypeScript Avancée', 'date' => '2026-10-14', 'start_time' => '18:00', 'end_time' => '20:00', 'type' => 'live', 'instructor' => 'Coach Alex', 'location' => 'Google Meet Live', 'meeting_url' => 'https://meet.google.com/vibe-ts-master', 'spots' => 50, 'enrolled' => 42, 'description' => 'Generics avancés, Utility Types, Type Guards et intégration stricte dans un projet React 19.'],
                ['title' => 'Hackathon 48h: Challenge Agents IA & SaaS (Jour 1)', 'date' => '2026-10-16', 'start_time' => '09:00', 'end_time' => '18:00', 'type' => 'hackathon', 'instructor' => 'Tous les Mentors', 'location' => 'Discord HQ + Twitch', 'meeting_url' => 'https://discord.gg/MR1Academy', 'spots' => 60, 'enrolled' => 55, 'description' => 'Lancement du Hackathon 48h : formez votre équipe et concevez un SaaS propulsé par des LLMs.'],
                ['title' => 'Hackathon 48h: Démos & Jury Final (Jour 2)', 'date' => '2026-10-17', 'start_time' => '10:00', 'end_time' => '18:00', 'type' => 'hackathon', 'instructor' => 'Jury MR1Academy', 'location' => 'Discord Stage Principal', 'meeting_url' => 'https://discord.gg/MR1Academy', 'spots' => 60, 'enrolled' => 56, 'description' => 'Pitch de 5 minutes par équipe devant le jury professionnel, délibérations en direct et remise des prix.'],
                ['title' => 'Workshop: Design System Figma to React', 'date' => '2026-10-19', 'start_time' => '15:00', 'end_time' => '17:00', 'type' => 'workshop', 'instructor' => 'Designer Nora', 'location' => 'Google Meet + Figma Live', 'meeting_url' => 'https://meet.google.com/vibe-figma-code', 'spots' => 25, 'enrolled' => 21, 'description' => 'Tokens de design, variantes accessibles et implémentation pixel-perfect avec Framer Motion.'],
                ['title' => 'Live Coding: Next.js & Server Actions en Production', 'date' => '2026-10-21', 'start_time' => '18:00', 'end_time' => '19:30', 'type' => 'live', 'instructor' => 'Coach Alex', 'location' => 'Google Meet Live', 'meeting_url' => 'https://meet.google.com/vibe-nextjs', 'spots' => 45, 'enrolled' => 33, 'description' => 'React Server Components, Streaming SSR, Server Actions et stratégies de cache haute performance.'],
                ['title' => 'Mock Interview: Algorithmes & System Design', 'date' => '2026-10-23', 'start_time' => '19:00', 'end_time' => '20:30', 'type' => 'qa', 'instructor' => 'Mentor Karim', 'location' => 'Zoom Pro Room 1', 'meeting_url' => 'https://zoom.us/j/vibe-interview', 'spots' => 40, 'enrolled' => 28, 'description' => 'Simulation d\'entretien technique en conditions réelles avec résolution live au tableau blanc.'],
                ['title' => 'Code Review: Dashboard Analytics Full-Stack', 'date' => '2026-10-24', 'start_time' => '14:30', 'end_time' => '16:00', 'type' => 'review', 'instructor' => 'Mentor Sarah', 'location' => 'Google Meet Live', 'meeting_url' => 'https://meet.google.com/vibe-review-4', 'spots' => 20, 'enrolled' => 18, 'description' => 'Analyse des performances de requêtes SQL, agrégations et rendu graphique temps réel.'],
                ['title' => 'Workshop: Tests E2E & Unitaires (Vitest / Playwright)', 'date' => '2026-10-26', 'start_time' => '14:00', 'end_time' => '16:00', 'type' => 'workshop', 'instructor' => 'Coach Alex', 'location' => 'Google Meet Live', 'meeting_url' => 'https://meet.google.com/vibe-testing', 'spots' => 30, 'enrolled' => 16, 'description' => 'Stratégie TDD, mocking d\'API et automatisation de tests E2E sur vos applications React.'],
                ['title' => 'Masterclass: Clean Architecture & Principes SOLID', 'date' => '2026-10-28', 'start_time' => '18:00', 'end_time' => '20:00', 'type' => 'live', 'instructor' => 'Mentor Karim', 'location' => 'Google Meet Live', 'meeting_url' => 'https://meet.google.com/vibe-clean-arch', 'spots' => 50, 'enrolled' => 31, 'description' => 'Découplage métier, injection de dépendances et refactoring de code legacy.'],
                ['title' => 'Cérémonie Officielle: Remise des Certificats Octobre', 'date' => '2026-10-30', 'start_time' => '17:00', 'end_time' => '18:30', 'type' => 'ceremony', 'instructor' => 'Direction MR1Academy', 'location' => 'Amphithéâtre Virtuel', 'meeting_url' => 'https://meet.google.com/vibe-ceremony', 'spots' => 200, 'enrolled' => 156, 'description' => 'Célébration des diplômés du mois, présentation des meilleurs projets de fin d\'études et networking.'],
            ];

            foreach ($defaults as $ev) {
                AgendaEvent::create(array_merge($ev, [
                    'registered_users' => [],
                    'reminded_users' => [],
                ]));
            }
        }
        Cache::forever('vibe_agenda_schema_ready_v1', true);
    }

    private function formatEvent(AgendaEvent $ev, ?int $userId): array
    {
        $reg = is_array($ev->registered_users) ? $ev->registered_users : [];
        $rem = is_array($ev->reminded_users) ? $ev->reminded_users : [];
        $cleanDate = substr((string) $ev->date, 0, 10);
        $startTime = $ev->start_time ?: '18:00';
        $endTime = $ev->end_time ?: '19:30';

        return [
            'id' => $ev->id,
            'user_id' => $ev->user_id,
            'title' => $ev->title,
            'date' => $cleanDate,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'time' => $startTime . ' - ' . $endTime,
            'type' => $ev->type ?: 'live',
            'instructor' => $ev->instructor ?: 'Coach Alex',
            'location' => $ev->location ?: 'Google Meet Live',
            'meeting_url' => $ev->meeting_url ?: 'https://meet.google.com/vibe-live',
            'spots' => (int) ($ev->spots ?: 50),
            'enrolled' => (int) ($ev->enrolled ?? 1),
            'description' => $ev->description ?? '',
            'isEnrolled' => $userId ? in_array($userId, $reg) : true,
            'hasReminder' => $userId ? in_array($userId, $rem) : false,
        ];
    }

    public function index(Request $request)
    {
        $this->ensureSchemaAndSeed();
        $userId = optional($request->user('sanctum'))->id;
        $events = AgendaEvent::orderBy('date', 'asc')->orderBy('start_time', 'asc')->get();

        return response()->json($events->map(fn($e) => $this->formatEvent($e, $userId)));
    }

    public function store(Request $request)
    {
        $this->ensureSchemaAndSeed();
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'date' => 'required|string|max:30',
            'start_time' => 'nullable|string|max:10',
            'end_time' => 'nullable|string|max:10',
            'type' => 'nullable|string|max:30',
            'instructor' => 'nullable|string|max:120',
            'location' => 'nullable|string|max:150',
            'meeting_url' => 'nullable|string|max:255',
            'spots' => 'nullable|integer|min:1|max:1000',
            'description' => 'nullable|string',
        ]);

        $user = $request->user('sanctum');
        $userId = optional($user)->id;
        $cleanDate = substr((string) $data['date'], 0, 10);

        $ev = AgendaEvent::create([
            'user_id' => $userId,
            'title' => $data['title'],
            'date' => $cleanDate,
            'start_time' => ($data['start_time'] ?? null) ?: '18:00',
            'end_time' => ($data['end_time'] ?? null) ?: '19:30',
            'type' => ($data['type'] ?? null) ?: 'live',
            'instructor' => ($data['instructor'] ?? null) ?: (optional($user)->name ?? 'Organisateur Vibe'),
            'location' => ($data['location'] ?? null) ?: 'Google Meet / Discord',
            'meeting_url' => ($data['meeting_url'] ?? null) ?: 'https://meet.google.com/vibe-session',
            'spots' => (int) ($data['spots'] ?? 30),
            'enrolled' => 1,
            'description' => $data['description'] ?? '',
            'registered_users' => $userId ? [$userId] : [0],
            'reminded_users' => $userId ? [$userId] : [0],
        ]);

        return response()->json($this->formatEvent($ev, $userId ?? 0), 201);
    }

    public function update(Request $request, $id)
    {
        $this->ensureSchemaAndSeed();
        $ev = AgendaEvent::findOrFail($id);

        $data = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'date' => 'sometimes|required|string|max:30',
            'start_time' => 'nullable|string|max:10',
            'end_time' => 'nullable|string|max:10',
            'type' => 'nullable|string|max:30',
            'instructor' => 'nullable|string|max:120',
            'location' => 'nullable|string|max:150',
            'meeting_url' => 'nullable|string|max:255',
            'spots' => 'nullable|integer|min:1|max:1000',
            'description' => 'nullable|string',
        ]);

        if (isset($data['date'])) {
            $data['date'] = substr((string) $data['date'], 0, 10);
        }

        $ev->update($data);
        $userId = optional($request->user('sanctum'))->id;

        return response()->json($this->formatEvent($ev, $userId));
    }

    public function destroy($id)
    {
        $this->ensureSchemaAndSeed();
        $ev = AgendaEvent::find($id);
        if ($ev) {
            $ev->delete();
        }

        return response()->json(['status' => 'deleted']);
    }

    public function toggleEnroll(Request $request, $id)
    {
        $this->ensureSchemaAndSeed();
        $ev = AgendaEvent::findOrFail($id);
        $userId = optional($request->user('sanctum'))->id ?? 0;

        $reg = is_array($ev->registered_users) ? $ev->registered_users : [];
        if (in_array($userId, $reg)) {
            $reg = array_values(array_diff($reg, [$userId]));
            $ev->enrolled = max(0, $ev->enrolled - 1);
        } else {
            if ($ev->enrolled < $ev->spots) {
                $reg[] = $userId;
                $ev->enrolled = $ev->enrolled + 1;
            }
        }
        $ev->registered_users = $reg;
        $ev->save();

        return response()->json($this->formatEvent($ev, $userId));
    }

    public function toggleReminder(Request $request, $id)
    {
        $this->ensureSchemaAndSeed();
        $ev = AgendaEvent::findOrFail($id);
        $userId = optional($request->user('sanctum'))->id ?? 0;

        $rem = is_array($ev->reminded_users) ? $ev->reminded_users : [];
        if (in_array($userId, $rem)) {
            $rem = array_values(array_diff($rem, [$userId]));
        } else {
            $rem[] = $userId;
        }
        $ev->reminded_users = $rem;
        $ev->save();

        return response()->json($this->formatEvent($ev, $userId));
    }
}
