<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

use App\Models\User;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Comment;
use App\Models\SiteSetting;

class AdminController extends Controller
{
    public function getSettings()
    {
        try {
            $data = SiteSetting::all();
            $settings = [];
            foreach ($data as $item) {
                $settings[$item->key] = $item->value;
            }
            return response()->json($settings);
        } catch (\Exception $e) {
            Log::error('Settings Fetch Error: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur lors de la récupération des réglages.'], 500);
        }
    }

    public function updateSettings(Request $request)
    {
        try {
            $settings = $request->only(['maintenance_mode', 'allow_registrations', 'auto_emails', 'maintenance_message']);
            
            foreach ($settings as $key => $value) {
                SiteSetting::updateOrCreate(['key' => $key], ['value' => (string)$value]);
            }

            return response()->json(['message' => 'Configurations système mises à jour avec succès.', 'settings' => $settings]);
        } catch (\Exception $e) {
            Log::error('Settings Update Error: ' . $e->getMessage());
            return response()->json(['message' => 'Échec de la mise à jour des réglages.'], 500);
        }
    }

    public function stats()
    {
        try {
            $totalUsers    = User::where('is_admin', false)->count();
            $totalCourses  = Course::count();
            $totalEnrolls  = Enrollment::count();
            $totalComments = Comment::count();

            // Completion rate safety
            $completed      = Enrollment::where('progress', 100)->count();
            $completionRate = $totalEnrolls > 0 ? round(($completed / $totalEnrolls) * 100, 1) : 0;

            $newUsersMonth = User::where('is_admin', false)
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count();

            $topCourses = Course::withCount('enrollments')
                ->orderByDesc('enrollments_count')
                ->limit(5)
                ->get(['id', 'title', 'enrollments_count']);

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

            $recentUsers = User::where('is_admin', false)
                ->latest()
                ->limit(10)
                ->get(['id', 'name', 'email', 'is_admin', 'created_at']);

            return response()->json([
                'users'                 => $totalUsers,
                'courses'               => $totalCourses,
                'enrollments'           => $totalEnrolls,
                'comments'              => $totalComments,
                'completion_rate'       => $completionRate,
                'new_users_month'       => $newUsersMonth,
                'top_courses'           => $topCourses,
                'monthly_registrations' => $monthlyRegistrations,
                'recent_users'          => $recentUsers,
            ]);
        } catch (\Exception $e) {
            Log::error('Admin Stats Error: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur lors de la génération des statistiques.'], 500);
        }
    }

    public function allCourses()
    {
        try {
            return response()->json(Course::with('instructor', 'modules')->withCount('enrollments')->get());
        } catch (\Exception $e) {
            return response()->json(['message' => 'Impossible de récupérer la liste des cours.'], 500);
        }
    }

    public function allUsers()
    {
        try {
            // Include everyone for management, but maybe filter out the current admin?
            return response()->json(
                User::withCount('enrollments')
                    ->latest()
                    ->get()
            );
        } catch (\Exception $e) {
            return response()->json(['message' => 'Impossible de récupérer la liste des utilisateurs.'], 500);
        }
    }

    public function deleteCourse($id)
    {
        try {
            $course = Course::findOrFail($id);
            $course->delete(); // Cascade handles the rest
            return response()->json(['message' => 'Le cours a été supprimé ainsi que toutes ses données liées.']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Ce cours n\'existe plus.'], 404);
        } catch (\Exception $e) {
            Log::error('Delete Course Error: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur lors de la suppression du cours.'], 500);
        }
    }

    public function deleteUser($id)
    {
        try {
            $user = User::findOrFail($id);
            
            if ($user->id === auth()->id()) {
                return response()->json(['message' => 'Vous ne pouvez pas supprimer votre propre compte !'], 403);
            }

            $user->delete();
            return response()->json(['message' => 'L\'utilisateur a été banni définitivement.']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Utilisateur introuvable.'], 404);
        } catch (\Exception $e) {
            Log::error('Delete User Error: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur lors de la suppression de l\'utilisateur.'], 500);
        }
    }

    public function toggleAdmin($id)
    {
        try {
            $user = User::findOrFail($id);
            
            if ($user->id === auth()->id()) {
                return response()->json(['message' => 'Vous ne pouvez pas changer vos propres droits.'], 403);
            }

            $user->is_admin = !$user->is_admin;
            $user->save();

            $status = $user->is_admin ? 'administrateur' : 'étudiant';
            return response()->json([
                'message' => "L'utilisateur est maintenant {$status}.",
                'user' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Échec de la modification des privilèges.'], 500);
        }
    }

    public function getTasks()
    {
        try {
            $setting = SiteSetting::where('key', 'admin_tasks')->first();
            $tasks = $setting ? json_decode($setting->value, true) : null;
            if (!$tasks || !is_array($tasks)) {
                $tasks = [
                    [
                        'id' => '1',
                        'title' => 'Déploiement et publication du module vidéo Java 21 LTS & Spring Boot',
                        'category' => 'Contenu',
                        'priority' => 'Haute',
                        'status' => 'Terminé',
                        'due_date' => date('Y-m-d'),
                        'notes' => 'Vidéos HD et chapitres microservices validés.'
                    ],
                    [
                        'id' => '2',
                        'title' => 'Optimisation du CDN Edge et mise en cache des requêtes catalogue',
                        'category' => 'Système',
                        'priority' => 'Moyenne',
                        'status' => 'En cours',
                        'due_date' => date('Y-m-d', strtotime('+3 days')),
                        'notes' => 'Réduction de la latence à moins de 80ms.'
                    ],
                    [
                        'id' => '3',
                        'title' => 'Contrôle de sécurité des tokens JWT et restriction stricte des privilèges',
                        'category' => 'Sécurité',
                        'priority' => 'Haute',
                        'status' => 'Terminé',
                        'due_date' => date('Y-m-d'),
                        'notes' => 'Protection des routes administratives via middleware Laravel.'
                    ],
                    [
                        'id' => '4',
                        'title' => 'Ajout de la certification automatique et génération du PDF officiel',
                        'category' => 'Développement',
                        'priority' => 'Haute',
                        'status' => 'En cours',
                        'due_date' => date('Y-m-d', strtotime('+5 days')),
                        'notes' => 'Système de vérification par code QR unique.'
                    ],
                    [
                        'id' => '5',
                        'title' => 'Sauvegarde automatique hebdomadaire de la base PostgreSQL Railway',
                        'category' => 'Système',
                        'priority' => 'Basse',
                        'status' => 'À faire',
                        'due_date' => date('Y-m-d', strtotime('+7 days')),
                        'notes' => 'Script de dump SQL avec envoi chiffré.'
                    ]
                ];
            }
            return response()->json($tasks);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Impossible de charger les tâches.'], 500);
        }
    }

    public function saveTasks(Request $request)
    {
        try {
            $tasks = $request->input('tasks', []);
            SiteSetting::updateOrCreate(
                ['key' => 'admin_tasks'],
                ['value' => json_encode($tasks, JSON_UNESCAPED_UNICODE)]
            );
            return response()->json([
                'message' => 'Tâches administratives sauvegardées avec succès.',
                'tasks' => $tasks
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur lors de la sauvegarde des tâches.'], 500);
        }
    }
}
