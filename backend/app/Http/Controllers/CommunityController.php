<?php

namespace App\Http\Controllers;

use App\Models\Thread;
use App\Models\ThreadReply;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class CommunityController extends Controller
{
    private function ensureSchemaAndSeed(): void
    {
        if (Cache::get('vibe_community_schema_ready_v1')) {
            return;
        }
        if (!Schema::hasTable('threads')) {
            Schema::create('threads', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id')->nullable();
                $table->string('author_name')->nullable();
                $table->string('title');
                $table->text('body')->nullable();
                $table->text('code_snippet')->nullable();
                $table->string('code_lang', 30)->nullable();
                $table->string('tag')->default('Discussion');
                $table->integer('likes')->default(0);
                $table->boolean('is_solved')->default(false);
                $table->integer('views')->default(12);
                $table->timestamps();
            });
        } else {
            Schema::table('threads', function (Blueprint $table) {
                if (!Schema::hasColumn('threads', 'author_name')) {
                    $table->string('author_name')->nullable()->after('user_id');
                }
                if (!Schema::hasColumn('threads', 'body')) {
                    $table->text('body')->nullable()->after('title');
                }
                if (!Schema::hasColumn('threads', 'code_snippet')) {
                    $table->text('code_snippet')->nullable()->after('body');
                }
                if (!Schema::hasColumn('threads', 'code_lang')) {
                    $table->string('code_lang', 30)->nullable()->after('code_snippet');
                }
                if (!Schema::hasColumn('threads', 'is_solved')) {
                    $table->boolean('is_solved')->default(false)->after('likes');
                }
                if (!Schema::hasColumn('threads', 'views')) {
                    $table->integer('views')->default(15)->after('is_solved');
                }
            });
        }

        if (!Schema::hasTable('thread_replies')) {
            Schema::create('thread_replies', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('thread_id');
                $table->unsignedBigInteger('user_id')->nullable();
                $table->string('author_name')->nullable();
                $table->text('text');
                $table->boolean('is_solution')->default(false);
                $table->timestamps();
            });
        } else {
            Schema::table('thread_replies', function (Blueprint $table) {
                if (!Schema::hasColumn('thread_replies', 'author_name')) {
                    $table->string('author_name')->nullable()->after('user_id');
                }
                if (!Schema::hasColumn('thread_replies', 'is_solution')) {
                    $table->boolean('is_solution')->default(false)->after('text');
                }
            });
        }

        if (!Schema::hasTable('community_projects')) {
            Schema::create('community_projects', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id')->nullable();
                $table->string('author_name')->default('Étudiant Vibe');
                $table->string('author_role')->default('Full-Stack Certifié');
                $table->string('title');
                $table->text('description');
                $table->string('category')->default('React & Laravel');
                $table->json('tech_stack')->nullable();
                $table->string('github_url')->nullable();
                $table->string('demo_url')->nullable();
                $table->integer('likes')->default(18);
                $table->timestamps();
            });
        }

        // Seed rich technical threads if minimal
        if (Thread::count() < 5) {
            $firstUserId = optional(User::first())->id;
            $seedThreads = [
                [
                    'author_name' => 'Yassine El Amrani',
                    'title' => 'Comment éviter les re-renders inutiles avec useMemo et React 19 ?',
                    'body' => 'Je travaille sur le module avancé du cours React 19. J\'ai une liste de 2 000 éléments filtrés dynamiquement et je veux m\'assurer que mes composants enfants ne se re-rendent pas à chaque frappe clavier. Voici mon hook actuel :',
                    'code_snippet' => "const visibleItems = useMemo(() => {\n  return items.filter(item => item.name.toLowerCase().includes(DeferredQuery));\n}, [items, DeferredQuery]);",
                    'code_lang' => 'javascript',
                    'tag' => 'React',
                    'likes' => 42,
                    'is_solved' => true,
                    'views' => 184,
                    'replies' => [
                        ['author_name' => 'Coach Alex (Mentor)', 'text' => 'Excellente approche ! Combine `useDeferredValue(query)` avec `React.memo` sur ton composant ligne. Avec le compilateur React 19, la mémoïsation est aussi automatisée si tes props restent pures.', 'is_solution' => true],
                        ['author_name' => 'Salma Benali', 'text' => 'Merci ! Ça m\'a permis de valider la question 4 du Quiz React avec 100% !', 'is_solution' => false],
                    ],
                ],
                [
                    'author_name' => 'Karim Tazi',
                    'title' => 'Optimisation requête N+1 dans Laravel 11 Eloquent API',
                    'body' => 'Lors du chargement des playlists et de leurs modules vidéo dans mon contrôleur Laravel, je remarquais 15 requêtes SQL exécutées au lieu de 2. Voici la solution avec `with()` et sélection de colonnes :',
                    'code_snippet' => "\$courses = Course::with(['modules:id,course_id,title,duration'])\n    ->select('id', 'title', 'category', 'level')\n    ->latest()\n    ->get();",
                    'code_lang' => 'php',
                    'tag' => 'Laravel',
                    'likes' => 37,
                    'is_solved' => true,
                    'views' => 142,
                    'replies' => [
                        ['author_name' => 'Mentor Sarah', 'text' => 'Très propre ! Tu peux même ajouter `preventLazyLoading(!app()->isProduction())` dans `AppServiceProvider` pour détecter automatiquement tout N+1 en développement.', 'is_solution' => true],
                    ],
                ],
                [
                    'author_name' => 'Amina Mansouri',
                    'title' => 'Différence entre std::unique_ptr et std::shared_ptr en C++20 (RAII)',
                    'body' => 'Je prépare le Quiz de certification du cours Langage C & C++20. Quelqu\'un a une règle mnémotechnique simple pour savoir quand utiliser `std::unique_ptr` vs `std::shared_ptr` et `std::weak_ptr` ?',
                    'code_snippet' => "auto node = std::make_unique<EngineNode>(1024);\n// Transfert explicite de propriété :\nauto owner2 = std::move(node);",
                    'code_lang' => 'cpp',
                    'tag' => 'C/C++',
                    'likes' => 29,
                    'is_solved' => true,
                    'views' => 118,
                    'replies' => [
                        ['author_name' => 'Pr. Mehdi (Systèmes)', 'text' => 'Règle d\'or : utilise `std::unique_ptr` par défaut (zéro surcoût mémoire). N\'utilise `std::shared_ptr` que si plusieurs objets partagent réellement le cycle de vie, et `std::weak_ptr` pour casser les références circulaires.', 'is_solution' => true],
                    ],
                ],
                [
                    'author_name' => 'Omar Berrada',
                    'title' => 'Pipeline Data Science Python : Pandas vectorisation vs boucles for',
                    'body' => 'Sur un dataset de 500 000 lignes, remplacer `.iterrows()` par une opération vectorisée NumPy/Pandas a réduit le temps d\'exécution de 14 secondes à 18 millisecondes !',
                    'code_snippet' => "# Vectorisation ultra-rapide NumPy / Pandas\ndf['score_normalise'] = np.where(df['progress'] >= 100, df['quiz_score'] * 1.15, df['quiz_score'])",
                    'code_lang' => 'python',
                    'tag' => 'Python',
                    'likes' => 54,
                    'is_solved' => false,
                    'views' => 230,
                    'replies' => [
                        ['author_name' => 'Nadia DataLead', 'text' => 'Exactement ! La vectorisation délègue la boucle directement au code C précompilé de NumPy.', 'is_solution' => false],
                    ],
                ],
            ];

            foreach ($seedThreads as $st) {
                if (!Thread::where('title', $st['title'])->exists()) {
                    $t = Thread::create([
                        'user_id' => $firstUserId,
                        'author_name' => $st['author_name'],
                        'title' => $st['title'],
                        'body' => $st['body'],
                        'code_snippet' => $st['code_snippet'],
                        'code_lang' => $st['code_lang'],
                        'tag' => $st['tag'],
                        'likes' => $st['likes'],
                        'is_solved' => $st['is_solved'],
                        'views' => $st['views'],
                    ]);
                    foreach ($st['replies'] as $rep) {
                        ThreadReply::create([
                            'thread_id' => $t->id,
                            'user_id' => $firstUserId,
                            'author_name' => $rep['author_name'],
                            'text' => $rep['text'],
                            'is_solution' => $rep['is_solution'],
                        ]);
                    }
                }
            }
        }

        // Seed showcase projects if empty
        if (DB::table('community_projects')->count() === 0) {
            $projects = [
                [
                    'author_name' => 'Sofia El Idrissi',
                    'author_role' => 'Certifiée React 19 & Laravel 11',
                    'title' => 'VibeCloud Monitor — Dashboard DevOps Temps Réel',
                    'description' => 'Interface de télémétrie serveur temps réel avec WebSockets, graphiques SVG fluides, alertes automatiques et API REST Laravel 11 sécurisée par Sanctum.',
                    'category' => 'Full-Stack',
                    'tech_stack' => json_encode(['React 19', 'Laravel 11', 'WebSockets', 'Tailwind']),
                    'github_url' => 'https://github.com/MR1Academy/vibecloud-monitor',
                    'demo_url' => 'https://vibecloud-demo.vercel.app',
                    'likes' => 86,
                    'created_at' => now()->subDays(2),
                    'updated_at' => now()->subDays(2),
                ],
                [
                    'author_name' => 'Mehdi Chraibi',
                    'author_role' => 'Certifié Python Data Science & SQL',
                    'title' => 'NeuroPredict AI — Analyse Prédictive Médicale',
                    'description' => 'Pipeline complet de Machine Learning sous Python 3.12 (Pandas, Scikit-Learn, FastAPI) avec visualisation interactive des matrices de corrélation et export PDF.',
                    'category' => 'IA & Data',
                    'tech_stack' => json_encode(['Python 3.12', 'Scikit-Learn', 'Pandas', 'FastAPI']),
                    'github_url' => 'https://github.com/MR1Academy/neuropredict-ai',
                    'demo_url' => 'https://neuropredict-demo.vercel.app',
                    'likes' => 74,
                    'created_at' => now()->subDays(4),
                    'updated_at' => now()->subDays(4),
                ],
                [
                    'author_name' => 'Youssef Bennani',
                    'author_role' => 'Certifié Java 21 & Oracle Database',
                    'title' => 'FinCore Engine — Microservices Bancaires Haute Fréquence',
                    'description' => 'Architecture hexagonale sous Java 21 (Virtual Threads, Spring Boot 3) couplée à des procédures PL/SQL optimisées pour le traitement transactionnel.',
                    'category' => 'Backend Enterprise',
                    'tech_stack' => json_encode(['Java 21', 'Spring Boot 3', 'Oracle PL/SQL', 'Docker']),
                    'github_url' => 'https://github.com/MR1Academy/fincore-engine',
                    'demo_url' => 'https://fincore-docs.vercel.app',
                    'likes' => 63,
                    'created_at' => now()->subDays(6),
                    'updated_at' => now()->subDays(6),
                ],
                [
                    'author_name' => 'Inès Berrada',
                    'author_role' => 'Certifiée UI/UX Figma & CSS Architecture',
                    'title' => 'Aura Design System — Kit Glassmorphism & Composants A11y',
                    'description' => 'Bibliothèque de 60+ composants accessibles WCAG AAA avec tokens CSS variables, animations Framer Motion et fichier source Figma complet.',
                    'category' => 'UI/UX & Frontend',
                    'tech_stack' => json_encode(['Figma', 'CSS3 Grid', 'React', 'Framer Motion']),
                    'github_url' => 'https://github.com/MR1Academy/aura-design-system',
                    'demo_url' => 'https://aura-ui-demo.vercel.app',
                    'likes' => 95,
                    'created_at' => now()->subDays(8),
                    'updated_at' => now()->subDays(8),
                ],
                [
                    'author_name' => 'Adam Ouazzani',
                    'author_role' => 'Certifié C & C++20 Systèmes',
                    'title' => 'VoxelRay — Moteur de Rendu 3D & Allocateur Mémoire C++20',
                    'description' => 'Moteur de raytracing temps réel écrit en C++20 moderne utilisant les Smart Pointers, le multithreading std::jthread et une gestion mémoire sans fuite.',
                    'category' => 'Systèmes & 3D',
                    'tech_stack' => json_encode(['C++20', 'OpenGL', 'SIMD', 'CMake']),
                    'github_url' => 'https://github.com/MR1Academy/voxelray-cpp20',
                    'demo_url' => 'https://voxelray-showcase.vercel.app',
                    'likes' => 112,
                    'created_at' => now()->subDays(10),
                    'updated_at' => now()->subDays(10),
                ],
                [
                    'author_name' => 'Kenza Alaoui',
                    'author_role' => 'Certifiée C# 12 / .NET 8 & Node.js',
                    'title' => 'SyncFlow ERP — Gestion de Projets Agiles Multi-Tenant',
                    'description' => 'Application SaaS B2B avec backend .NET 8 Minimal APIs, Entity Framework Core, notifications temps réel et export iCalendar (.ics).',
                    'category' => 'Architecture .NET',
                    'tech_stack' => json_encode(['C# 12', '.NET 8', 'EF Core', 'React']),
                    'github_url' => 'https://github.com/MR1Academy/syncflow-dotnet',
                    'demo_url' => 'https://syncflow-erp.vercel.app',
                    'likes' => 58,
                    'created_at' => now()->subDays(12),
                    'updated_at' => now()->subDays(12),
                ],
            ];

            DB::table('community_projects')->insert($projects);
        }
        Cache::forever('vibe_community_schema_ready_v1', true);
    }

    private function formatThread(Thread $t): array
    {
        $authorName = $t->author_name ?: (optional($t->user)->name ?? 'Étudiant Vibe');
        $replies = [];
        foreach ($t->replies as $r) {
            $rAuthor = $r->author_name ?: (optional($r->user)->name ?? 'Membre Vibe');
            $replies[] = [
                'id' => $r->id,
                'user_id' => $r->user_id,
                'author' => $rAuthor,
                'avatar' => strtoupper(substr($rAuthor, 0, 1)),
                'text' => $r->text,
                'is_solution' => (bool) $r->is_solution,
                'time' => $r->created_at ? $r->created_at->diffForHumans() : 'À l\'instant',
            ];
        }

        return [
            'id' => $t->id,
            'user_id' => $t->user_id,
            'author' => $authorName,
            'avatar' => strtoupper(substr($authorName, 0, 1)),
            'title' => $t->title,
            'body' => $t->body ?? '',
            'code_snippet' => $t->code_snippet ?? '',
            'code_lang' => $t->code_lang ?: 'javascript',
            'replies' => count($replies),
            'likes' => (int) $t->likes,
            'is_solved' => (bool) $t->is_solved,
            'views' => (int) ($t->views ?: 12),
            'tag' => $t->tag ?: 'Discussion',
            'time' => $t->created_at ? $t->created_at->diffForHumans() : 'À l\'instant',
            'replyList' => $replies,
        ];
    }

    public function index()
    {
        $this->ensureSchemaAndSeed();
        $threads = Thread::with('user', 'replies.user')->orderBy('created_at', 'desc')->get();
        return response()->json($threads->map(fn($t) => $this->formatThread($t)));
    }

    public function store(Request $request)
    {
        $this->ensureSchemaAndSeed();
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'body' => 'nullable|string',
            'code_snippet' => 'nullable|string',
            'code_lang' => 'nullable|string|max:30',
            'tag' => 'nullable|string|max:50',
            'author_name' => 'nullable|string|max:100',
        ]);

        $user = $request->user('sanctum');
        $authorName = ($data['author_name'] ?? null) ?: (optional($user)->name ?? 'Étudiant Vibe');

        $thread = Thread::create([
            'user_id' => optional($user)->id,
            'author_name' => $authorName,
            'title' => $data['title'],
            'body' => $data['body'] ?? '',
            'code_snippet' => $data['code_snippet'] ?? '',
            'code_lang' => ($data['code_lang'] ?? null) ?: 'javascript',
            'tag' => ($data['tag'] ?? null) ?: 'Discussion',
            'likes' => 1,
            'is_solved' => false,
            'views' => 1,
        ]);

        $thread->load('user', 'replies.user');
        return response()->json($this->formatThread($thread), 201);
    }

    public function destroy(Request $request, $id)
    {
        $this->ensureSchemaAndSeed();
        $thread = Thread::find($id);
        if ($thread) {
            ThreadReply::where('thread_id', $thread->id)->delete();
            $thread->delete();
        }
        return response()->json(['status' => 'deleted']);
    }

    public function toggleSolved($id)
    {
        $this->ensureSchemaAndSeed();
        $thread = Thread::with('user', 'replies.user')->findOrFail($id);
        $thread->is_solved = !$thread->is_solved;
        $thread->save();
        return response()->json($this->formatThread($thread));
    }

    public function reply(Request $request, $id)
    {
        $this->ensureSchemaAndSeed();
        $data = $request->validate([
            'text' => 'required|string',
            'author_name' => 'nullable|string|max:100',
        ]);

        $user = $request->user('sanctum');
        $authorName = ($data['author_name'] ?? null) ?: (optional($user)->name ?? 'Étudiant Vibe');

        $thread = Thread::findOrFail($id);
        $reply = $thread->replies()->create([
            'user_id' => optional($user)->id,
            'author_name' => $authorName,
            'text' => $data['text'],
            'is_solution' => false,
        ]);

        return response()->json([
            'id' => $reply->id,
            'author' => $authorName,
            'avatar' => strtoupper(substr($authorName, 0, 1)),
            'text' => $reply->text,
            'is_solution' => false,
            'time' => 'À l\'instant',
        ], 201);
    }

    public function like($id)
    {
        $this->ensureSchemaAndSeed();
        $thread = Thread::findOrFail($id);
        $thread->increment('likes');
        return response()->json(['status' => 'liked', 'likes' => $thread->likes]);
    }

    public function unlike($id)
    {
        $this->ensureSchemaAndSeed();
        $thread = Thread::findOrFail($id);
        if ($thread->likes > 0) {
            $thread->decrement('likes');
        }
        return response()->json(['status' => 'unliked', 'likes' => $thread->likes]);
    }

    public function projects()
    {
        $this->ensureSchemaAndSeed();
        $projects = DB::table('community_projects')->orderBy('likes', 'desc')->orderBy('id', 'desc')->get();
        return response()->json($projects->map(function ($p) {
            return [
                'id' => $p->id,
                'user_id' => $p->user_id,
                'author_name' => $p->author_name,
                'author_role' => $p->author_role,
                'title' => $p->title,
                'description' => $p->description,
                'category' => $p->category,
                'tech_stack' => json_decode($p->tech_stack ?: '[]', true) ?: ['React', 'Laravel'],
                'github_url' => $p->github_url ?: 'https://github.com',
                'demo_url' => $p->demo_url ?: 'https://MR1Academy.io',
                'likes' => (int) $p->likes,
            ];
        }));
    }

    public function storeProject(Request $request)
    {
        $this->ensureSchemaAndSeed();
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'nullable|string|max:60',
            'tech_stack' => 'nullable|array',
            'github_url' => 'nullable|string|max:255',
            'demo_url' => 'nullable|string|max:255',
            'author_name' => 'nullable|string|max:100',
            'author_role' => 'nullable|string|max:100',
        ]);

        $user = $request->user('sanctum');
        $authorName = ($data['author_name'] ?? null) ?: (optional($user)->name ?? 'Étudiant Vibe');
        $authorRole = ($data['author_role'] ?? null) ?: 'Développeur MR1Academy';
        $stack = $data['tech_stack'] ?? ['React 19', 'Laravel 11'];

        $id = DB::table('community_projects')->insertGetId([
            'user_id' => optional($user)->id,
            'author_name' => $authorName,
            'author_role' => $authorRole,
            'title' => $data['title'],
            'description' => $data['description'],
            'category' => ($data['category'] ?? null) ?: 'Full-Stack',
            'tech_stack' => json_encode($stack),
            'github_url' => ($data['github_url'] ?? null) ?: 'https://github.com',
            'demo_url' => ($data['demo_url'] ?? null) ?: 'https://MR1Academy.io',
            'likes' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'id' => $id,
            'user_id' => optional($user)->id,
            'author_name' => $authorName,
            'author_role' => $authorRole,
            'title' => $data['title'],
            'description' => $data['description'],
            'category' => ($data['category'] ?? null) ?: 'Full-Stack',
            'tech_stack' => $stack,
            'github_url' => ($data['github_url'] ?? null) ?: 'https://github.com',
            'demo_url' => ($data['demo_url'] ?? null) ?: 'https://MR1Academy.io',
            'likes' => 1,
        ], 201);
    }

    public function likeProject($id)
    {
        $this->ensureSchemaAndSeed();
        DB::table('community_projects')->where('id', $id)->increment('likes');
        $p = DB::table('community_projects')->where('id', $id)->first();
        return response()->json(['status' => 'liked', 'likes' => $p ? (int) $p->likes : 1]);
    }
}
