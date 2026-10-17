// ═══════════════════════════════════════════════════════════════════════════
// VibeGPT — Intelligent RAG + Code Generation + General Knowledge AI Engine
// ═══════════════════════════════════════════════════════════════════════════

import {
  computePlaylistStats,
  getLocalCompletedModules,
  getAllLocalCertificates,
  getCourseTechMeta,
  getCourseQuestions,
} from './certificationEngine';

const KNOWLEDGE_BASE = {
  react: {
    name: 'React 19 & Écosystème Frontend',
    summary:
      "React est une bibliothèque JavaScript déclarative développée par Meta pour construire des interfaces utilisateur composables via des composants et un Virtual DOM haute performance.",
    concepts: [
      "**useState** : Gère l'état local réactif d'un composant fonctionnel.",
      "**useEffect** : Synchronise le composant avec des systèmes externes (API REST, timers, WebSockets).",
      "**useMemo / useCallback** : Optimisent les performances en mémorisant les calculs lourds et les références de fonctions.",
      "**useRef** : Conserve une référence mutable sans provoquer de re-rendu ou cible un élément DOM.",
      "**Virtual DOM & Réconciliation** : React compare l'arbre virtuel précédent et le nouveau (diffing) pour ne mettre à jour que les nœuds DOM modifiés.",
    ],
    codeLang: 'jsx',
    codeExample: `import React, { useState, useEffect } from 'react';

export default function CourseTracker({ courseId }) {
  const [modules, setModules] = useState([]);
  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    fetch(\`/api/courses/\${courseId}\`)
      .then(res => res.json())
      .then(data => setModules(data.modules || []));
  }, [courseId]);

  const progress = modules.length ? Math.round((completed / modules.length) * 100) : 0;

  return (
    <div className="glass-card">
      <h3>Progression : {progress}%</h3>
      <button onClick={() => setCompleted(c => Math.min(modules.length, c + 1))}>
        Valider le module suivant
      </button>
    </div>
  );
}`,
  },
  java: {
    name: 'Java 21 LTS & Spring Boot 3',
    summary:
      "Java est un langage orienté objet fortement typé, compilé en bytecode exécuté par la JVM. Couplé à Spring Boot, il constitue le standard mondial pour les microservices d'entreprise et architectures bancaires/cloud.",
    concepts: [
      "**4 Piliers POO** : Encapsulation (`private` + getters/setters), Héritage (`extends`), Polymorphisme (`@Override` / interfaces), Abstraction (`abstract class` / `interface`).",
      "**Spring Boot IoC & DI** : Inversion de contrôle et injection de dépendances automatique via `@Autowired` ou constructeur.",
      "**Spring Data JPA** : Manipulation des bases relationnelles via des interfaces héritant de `JpaRepository<T, ID>`.",
      "**Nouveautés Java 21** : Virtual Threads (Project Loom), Record Classes (`record User(Long id, String name) {}`), Pattern Matching pour `switch`.",
    ],
    codeLang: 'java',
    codeExample: `@RestController
@RequestMapping("/api/v1/courses")
public class CourseController {

    private final CourseService service;

    public CourseController(CourseService service) {
        this.service = service;
    }

    @GetMapping("/{id}/progress")
    public ResponseEntity<ProgressDto> getProgress(@PathVariable Long id) {
        return ResponseEntity.ok(service.calculateSequentialProgress(id));
    }
}`,
  },
  python: {
    name: 'Python 3.12, Data Science & Intelligence Artificielle',
    summary:
      "Python est le langage de référence pour l'Intelligence Artificielle, le Machine Learning, la Data Science et l'automatisation grâce à sa syntaxe expressive et son écosystème scientifique (NumPy, Pandas, Scikit-learn, PyTorch).",
    concepts: [
      "**Structures natives** : `list` (mutable), `tuple` (immuable), `dict` (table de hachage clé-valeur $O(1)$), `set` (ensemble d'éléments uniques).",
      "**Compréhensions** : `[x**2 for x in range(10) if x % 2 == 0]` pour transformer et filtrer des données de manière concise.",
      "**Pandas & NumPy** : Manipulation vectorisée de tableaux multidimensionnels (`ndarray`) et de tables de données (`DataFrame`).",
      "**Machine Learning (Scikit-learn)** : Pipeline standard `train_test_split` $\\rightarrow$ `StandardScaler` $\\rightarrow$ `model.fit(X_train, y_train)` $\\rightarrow$ `model.predict(X_test)`.",
    ],
    codeLang: 'python',
    codeExample: `import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

# 1. Chargement et préparation du dataset
df = pd.read_csv("students_performance.csv")
X = df[["watch_minutes", "modules_completed", "avg_duration"]]
y = df["certified"]

# 2. Entraînement et validation du modèle IA
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
model = RandomForestClassifier(n_estimators=150, random_state=42)
model.fit(X_train, y_train)

preds = model.predict(X_test)
print(f"Précision du modèle : {accuracy_score(y_test, preds) * 100:.2f}%")`,
  },
  laravel: {
    name: 'Laravel 11, PHP 8.3 & Architecture API Sanctum',
    summary:
      "Laravel est le framework PHP Fullstack & API le plus élégant, intégrant l'ORM Eloquent, l'authentification Sanctum, le système de files d'attente (Queues), les Migrations et une architecture MVC robuste.",
    concepts: [
      "**Eloquent ORM** : Modélisation ActiveRecord avec relations (`hasMany`, `belongsTo`, `belongsToMany`) et chargement anticipé (`with()`) contre le problème N+1.",
      "**Laravel Sanctum** : Authentification par tokens API légers et sécurisation des SPA React/Vue.",
      "**Middlewares & FormRequests** : Filtrage HTTP et validation déclarative des payloads entrants.",
      "**Migrations & Seeders** : Versionnement du schéma MySQL/PostgreSQL directement en code PHP.",
    ],
    codeLang: 'php',
    codeExample: `<?php

namespace App\\Http\\Controllers;

use App\\Models\\Enrollment;
use Illuminate\\Http\\Request;

class CertificationController extends Controller
{
    public function verifyCompletion(Request $request, int $courseId)
    {
        $enrollment = Enrollment::with('course.modules')
            ->where('user_id', $request->user()->id)
            ->where('course_id', $courseId)
            ->firstOrFail();

        $greenLight = $enrollment->progress >= 100;

        return response()->json([
            'green_light' => $greenLight,
            'certificate_uid' => $enrollment->certificate_uid,
        ]);
    }
}`,
  },
  cpp: {
    name: 'Langage C & C++20 — Programmation Système & Mémoire',
    summary:
      "Le C et le C++ permettent un contrôle direct du matériel, de la mémoire (pile vs tas) et des performances temps réel pour les systèmes d'exploitation, moteurs 3D, compilateurs et systèmes embarqués.",
    concepts: [
      "**Pointeurs & Adresses** : `&x` retourne l'adresse mémoire de `x`, `*ptr` déréférence le pointeur pour accéder à la valeur.",
      "**Allocation Dynamique en C** : `malloc()` / `calloc()` / `realloc()` sur le tas (Heap), toujours suivis de `free()` pour éviter les fuites mémoire.",
      "**RAII & Smart Pointers (C++20)** : `std::unique_ptr` (propriété exclusive) et `std::shared_ptr` (compteur de références) libèrent automatiquement la mémoire.",
      "**STL (Standard Template Library)** : Conteneurs génériques (`std::vector`, `std::unordered_map`) et algorithmes optimisés (`std::sort`).",
    ],
    codeLang: 'cpp',
    codeExample: `#include <iostream>
#include <memory>
#include <vector>
#include <algorithm>

class ModuleBuffer {
public:
    explicit ModuleBuffer(size_t size) : data_(size, 0) {}
    void set(size_t idx, int val) { data_.at(idx) = val; }
    int sum() const {
        int total = 0;
        for (int v : data_) total += v;
        return total;
    }
private:
    std::vector<int> data_;
};

int main() {
    auto buffer = std::make_unique<ModuleBuffer>(5);
    buffer->set(0, 42);
    std::cout << "Total mémoire sécurisée : " << buffer->sum() << "\\n";
    return 0;
}`,
  },
  csharp: {
    name: 'C# 12 & ASP.NET Core 8 — Architecture Entreprise',
    summary:
      "C# et la plateforme .NET 8 de Microsoft offrent un environnement compilé JIT/AOT ultra-rapide pour les API Web, le Cloud Azure, les applications desktop et le jeu vidéo (Unity).",
    concepts: [
      "**LINQ (Language Integrated Query)** : Requêtes déclaratives typées directement sur les collections C# et bases SQL.",
      "**Programmation Asynchrone** : Modèle `Task<T>` avec `async` / `await` non-bloquant.",
      "**Entity Framework Core** : ORM moderne avec migrations Code-First et suivi de changements optimisé.",
      "**Injection de dépendances native** : Cycle de vie des services (`AddScoped`, `AddSingleton`, `AddTransient`) dans `Program.cs`.",
    ],
    codeLang: 'csharp',
    codeExample: `using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class CoursesController(AppDbContext db) : ControllerBase
{
    [HttpGet("top")]
    public async Task<IActionResult> GetTopCourses()
    {
        var courses = await db.Courses
            .Include(c => c.Modules)
            .OrderByDescending(c => c.Rating)
            .Take(5)
            .ToListAsync();

        return Ok(courses);
    }
}`,
  },
  node: {
    name: 'Node.js, Express & Architectures Temps Réel',
    summary:
      "Node.js exécute JavaScript côté serveur sur le moteur V8 de Google Chrome en s'appuyant sur une boucle d'événements (Event Loop) non-bloquante idéale pour les API REST, WebSockets et microservices.",
    concepts: [
      "**Event Loop (Boucle d'événements)** : Gère des milliers de connexions I/O concurrentes sur un seul thread principal grâce aux callbacks, Promises et `async/await`.",
      "**Middlewares Express** : Fonctions `(req, res, next)` chaînées pour l'authentification JWT, la journalisation, CORS et la gestion d'erreurs.",
      "**Streams & Buffers** : Traitement de fichiers volumineux ou flux vidéo par morceaux sans saturer la RAM.",
      "**Sécurité API** : Hachage `bcrypt`, tokens JWT signés, limitation de débit (Rate Limiting) et validation `Zod`/`Joi`.",
    ],
    codeLang: 'javascript',
    codeExample: `import express from 'express';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());

const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token manquant' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(403).json({ error: 'Token invalide' });
  }
};

app.get('/api/profile', requireAuth, (req, res) => {
  res.json({ status: 'authenticated', user: req.user });
});`,
  },
  sql: {
    name: 'SQL Avancé, MySQL & Oracle Database (PL/SQL)',
    summary:
      "Le langage SQL et les moteurs relationnels (Oracle 21c, PostgreSQL, MySQL) garantissent l'intégrité transactionnelle (ACID), la modélisation relationnelle et l'analyse haute performance des données.",
    concepts: [
      "**Jointures Relationnelles** : `INNER JOIN` (intersection), `LEFT JOIN` (toutes les lignes de gauche), `FULL OUTER JOIN`.",
      "**Agrégation & Fenêtrage** : `GROUP BY ... HAVING` et fonctions analytiques `ROW_NUMBER() OVER (PARTITION BY ... ORDER BY ...)`.",
      "**Indexation B-Tree** : Accélère les recherches `WHERE` et `JOIN` de $O(n)$ à $O(\\log n)$.",
      "**Transactions ACID** : Atomicité (`COMMIT`/`ROLLBACK`), Cohérence, Isolation, Durabilité.",
    ],
    codeLang: 'sql',
    codeExample: `SELECT 
    c.id AS course_id,
    c.title,
    COUNT(DISTINCT e.user_id) AS total_students,
    ROUND(AVG(e.quiz_score), 1) AS avg_quiz_score,
    SUM(CASE WHEN e.certified = 1 THEN 1 ELSE 0 END) AS certified_count
FROM courses c
LEFT JOIN enrollments e ON e.course_id = c.id
GROUP BY c.id, c.title
HAVING COUNT(DISTINCT e.user_id) >= 1
ORDER BY avg_quiz_score DESC;`,
  },
  uiux: {
    name: 'UI/UX Design Pro, Figma, CSS Grid & Glassmorphism',
    summary:
      "Le design d'interfaces modernes combine la psychologie cognitive (UX), les systèmes de composants atomiques sur Figma (Auto Layout, Variants, Design Tokens) et l'intégration CSS3 fluide.",
    concepts: [
      "**Glassmorphism** : Superposition translucide utilisant `backdrop-filter: blur(20px)`, bordures subtiles `rgba(255,255,255,0.15)` et ombres profondes.",
      "**Figma Auto Layout & Tokens** : Espacements dynamiques basés sur une grille de 8px, variables de couleurs sémantiques et composants responsives.",
      "**Accessibilité WCAG AA/AAA** : Contraste minimum de `4.5:1` pour le texte courant, navigation clavier (`:focus-visible`) et hiérarchie typographique claire.",
      "**CSS Grid & Flexbox** : `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))` pour des mises en page adaptatives sans media queries complexes.",
    ],
    codeLang: 'css',
    codeExample: `.vibe-glass-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 20px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.vibe-glass-card:hover {
  transform: translateY(-4px);
  border-color: rgba(168, 85, 247, 0.45);
}`,
  },
  algorithms: {
    name: 'Algorithmique, Structures de Données & Complexité Big-O',
    summary:
      "L'algorithmique permet de résoudre des problèmes complexes avec un coût minimal en temps CPU (complexité temporelle) et en mémoire RAM (complexité spatiale).",
    concepts: [
      "**Échelle de Complexité Big-O** : $O(1)$ (accès direct table de hachage) $<$ $O(\\log n)$ (recherche dichotomique) $<$ $O(n)$ (parcours linéaire) $<$ $O(n \\log n)$ (MergeSort / QuickSort) $<$ $O(n^2)$ (tri à bulles).",
      "**Arbres & Graphes** : Parcours en largeur (**BFS** avec une file/Queue pour le plus court chemin non pondéré), parcours en profondeur (**DFS** avec une pile/récursion), algorithme de **Dijkstra**.",
      "**Programmation Dynamique** : Mémorisation des sous-problèmes chevauchants (ex: Fibonacci en $O(n)$ au lieu de $O(2^n)$, problème du sac à dos).",
    ],
    codeLang: 'python',
    codeExample: `def binary_search(arr: list[int], target: int) -> int:
    """Recherche dichotomique en O(log n)"""
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

nums = [4, 12, 19, 27, 38, 54, 71, 90]
print("Indice de 38 :", binary_search(nums, 38))`,
  },
  git_docker: {
    name: 'Git, GitHub, Docker & DevOps CI/CD',
    summary:
      "Git assure le versionnement distribué du code source tandis que Docker encapsule l'application et ses dépendances (PHP, Node, MySQL, Redis) dans des conteneurs isolés et reproductibles.",
    concepts: [
      "**Flux Git Pro** : `git checkout -b feat/module` $\\rightarrow$ `git add .` $\\rightarrow$ `git commit -m 'feat: ...'` $\\rightarrow$ `git pull --rebase origin main` $\\rightarrow$ Pull Request.",
      "**Dockerfile & Docker Compose** : Orchestration multi-conteneurs (Frontend React + Backend Laravel + Base MySQL) en une seule commande `docker compose up -d --build`.",
      "**CI/CD (GitHub Actions)** : Exécution automatique des tests unitaires et du build (`npm run build`, `phpunit`) à chaque push.",
    ],
    codeLang: 'yaml',
    codeExample: `# docker-compose.yml — Stack MR1Academy Pro
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DB_HOST=mysql
      - DB_DATABASE=vibe_coding
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend`,
  },
};

/* ─── Safe Mathematical Expression Evaluator ─── */
function tryEvaluateMath(query) {
  const cleaned = query
    .toLowerCase()
    .replace(/combien font|calcule|calculer|résous|résoudre|que vaut|c'est quoi|égal à|=/g, '')
    .replace(/×|x(?=\s*\d)/g, '*')
    .replace(/÷/g, '/')
    .replace(/\^/g, '**')
    .replace(/racine carrée de\s*(\d+(\.\d+)?)/g, 'Math.sqrt($1)')
    .replace(/sqrt\((\d+(\.\d+)?)\)/g, 'Math.sqrt($1)')
    .trim();

  // Check if it looks like a math expression containing numbers and operators
  if (!/[\d]/.test(cleaned) || !/[+\-*/%]|Math\.sqrt|\*\*/.test(cleaned)) {
    return null;
  }

  // Only allow safe math characters
  const stripped = cleaned.replace(/Math\.sqrt/g, '');
  if (!/^[0-9+\-*/().%\s*]+$/.test(stripped)) {
    return null;
  }

  try {
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${cleaned});`)();
    if (typeof result === 'number' && Number.isFinite(result)) {
      return {
        expression: cleaned.replace(/Math\.sqrt/g, '√').replace(/\*\*/g, '^'),
        result: Number.isInteger(result) ? result : Number(result.toFixed(6)),
      };
    }
  } catch {
    return null;
  }
  return null;
}

/* ─── Detect Tech Domain from Query ─── */
function detectTopicKey(text) {
  const q = text.toLowerCase();
  if (q.includes('react') || q.includes('jsx') || q.includes('usestate') || q.includes('useeffect') || q.includes('hook') || q.includes('frontend')) return 'react';
  if (q.includes('laravel') || q.includes('php') || q.includes('eloquent') || q.includes('sanctum') || q.includes('artisan')) return 'laravel';
  if (q.includes('java') || q.includes('spring') || q.includes('jvm') || q.includes('hibernate') || q.includes('jpa')) return 'java';
  if (q.includes('python') || q.includes('pandas') || q.includes('numpy') || q.includes('scikit') || q.includes('machine learning') || q.includes('data science') || q.includes('ia ') || q.includes('intelligence artificielle')) return 'python';
  if (q.includes('c#') || q.includes('.net') || q.includes('asp.net') || q.includes('linq') || q.includes('entity framework')) return 'csharp';
  if (q.includes('c++') || q.includes('langage c') || q.includes('malloc') || q.includes('pointeur') || q.includes('unique_ptr') || /\bc\b/.test(q)) return 'cpp';
  if (q.includes('node') || q.includes('express') || q.includes('event loop') || q.includes('jwt') || q.includes('websocket')) return 'node';
  if (q.includes('sql') || q.includes('oracle') || q.includes('mysql') || q.includes('base de données') || q.includes('jointure') || q.includes('acid')) return 'sql';
  if (q.includes('figma') || q.includes('ui') || q.includes('ux') || q.includes('css') || q.includes('glassmorphism') || q.includes('flexbox') || q.includes('grid') || q.includes('design')) return 'uiux';
  if (q.includes('algorithme') || q.includes('complexité') || q.includes('big o') || q.includes('dichotomi') || q.includes('tri ') || q.includes('graphe') || q.includes('arbre')) return 'algorithms';
  if (q.includes('git') || q.includes('github') || q.includes('docker') || q.includes('conteneur') || q.includes('devops') || q.includes('ci/cd')) return 'git_docker';
  return null;
}

/* ─── Find Matching Specific Course from Live Database ─── */
function findMatchingCourse(query, courses = []) {
  if (!courses.length) return null;
  const q = query.toLowerCase();

  // Direct title match first
  for (const c of courses) {
    const t = (c.title || '').toLowerCase();
    if (t && q.includes(t)) return c;
  }

  // Keyword matching
  const keywords = [
    { keys: ['java', 'spring'], match: c => /java|spring/i.test(c.title) },
    { keys: ['python', 'data', 'machine learning'], match: c => /python|data|machine/i.test(c.title) },
    { keys: ['react', 'hook', 'frontend'], match: c => /react/i.test(c.title) },
    { keys: ['laravel', 'php'], match: c => /laravel|php/i.test(c.title) },
    { keys: ['c#', '.net'], match: c => /c#|\.net/i.test(c.title) },
    { keys: ['c++', 'langage c', 'pointeur'], match: c => /\bc\b|c\+\+/i.test(c.title) },
    { keys: ['node', 'express'], match: c => /node|express/i.test(c.title) },
    { keys: ['oracle', 'sql', 'base de données'], match: c => /oracle|sql|base/i.test(c.title) },
    { keys: ['figma', 'ui', 'ux', 'design'], match: c => /ui|ux|figma|design/i.test(c.title) },
    { keys: ['css', 'glassmorphism'], match: c => /css|glassmorphism/i.test(c.title) },
  ];

  for (const item of keywords) {
    if (item.keys.some(k => q.includes(k))) {
      const found = courses.find(item.match);
      if (found) return found;
    }
  }
  return null;
}

/* ─── Main VibeGPT Response Generator ─── */
export async function generateVibeAiResponse({
  query,
  history = [],
  contextData = {},
  customApiKey = '',
}) {
  const raw = (query || '').trim();
  const q = raw.toLowerCase();
  const {
    courses = [],
    enrollments = [],
    agendaEvents = [],
    user = {},
  } = contextData;

  const userName = user?.name ? user.name.split(' ')[0] : 'Apprenant';
  const localCerts = getAllLocalCertificates();

  // Enrich courses with live playlist stats & user progress
  const enrichedCourses = courses.map(c => {
    const enroll = enrollments.find(e => Number(e.course_id) === Number(c.id));
    const completedIds = enroll?.completed_modules || getLocalCompletedModules(c.id);
    const stats = computePlaylistStats(c.modules || [], completedIds);
    const totalMods = c.modules?.length || 0;
    const localPct = totalMods > 0 ? Math.round((completedIds.length / totalMods) * 100) : 0;
    const progress = Math.max(enroll?.progress || 0, localPct);
    const cert = localCerts[String(c.id)];
    const isCertified = Boolean(enroll?.certified || cert?.certified);
    const meta = getCourseTechMeta(c);
    return {
      ...c,
      stats,
      progress,
      completedCount: completedIds.length,
      totalMods,
      isEnrolled: Boolean(enroll) || completedIds.length > 0,
      isCertified,
      certUid: enroll?.certificate_uid || cert?.certificate_uid || null,
      meta,
    };
  });

  // 0. Optional External LLM API (if user configured an OpenAI-compatible key)
  if (customApiKey && customApiKey.startsWith('sk-')) {
    try {
      const systemContext = `Tu es VibeGPT, l'assistant IA officiel de la plateforme e-learning MR1Academy (100% gratuite et certifiante).
L'étudiant s'appelle ${userName}.
Formations disponibles sur MR1Academy (${enrichedCourses.length}) :
${enrichedCourses.map(c => `- [ID:${c.id}] ${c.title} (${c.totalMods} vidéos, durée totale ${c.stats.totalFormatted}, durée moyenne ${c.stats.avgFormatted}/vidéo, progression de l'étudiant: ${c.progress}%, certifié: ${c.isCertified ? 'OUI' : 'NON'})`).join('\n')}
Règles de MR1Academy :
- Chaque cours est une playlist séquentielle : terminer une vidéo valide automatiquement le module et passe au suivant.
- À 100% de la playlist, le Feu Vert est accordé pour passer le Quiz final.
- Un score >= 80% au Quiz délivre immédiatement le Certificat officiel HD (PNG 2000px & PDF A4) avec identifiant unique VIBE-YYYY-XXXX.
- Aucun paiement n'existe sur la plateforme : tout est 100% académique et gratuit.
Réponds toujours en français avec un style clair, structuré, professionnel et avec des exemples de code si pertinent.`;

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemContext },
            ...history.slice(-6).map(m => ({
              role: m.sender === 'user' ? 'user' : 'assistant',
              content: m.text,
            })),
            { role: 'user', content: raw },
          ],
          temperature: 0.4,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data?.choices?.[0]?.message?.content;
        if (content) {
          return {
            text: content,
            actions: [{ label: 'Explorer le Catalogue', path: '/catalogue' }],
          };
        }
      }
    } catch {
      // Fallback transparently to built-in VibeGPT engine
    }
  }

  // 1. Check Math / Calculation Queries
  const mathEval = tryEvaluateMath(raw);
  if (mathEval) {
    return {
      text: `### 🧮 Calcul Mathématique Instantané\n\nVoici le résultat exact pour votre expression :\n\n\`\`\`text\n${mathEval.expression} = ${mathEval.result}\n\`\`\`\n\n💡 **Astuce programmation** : En Python ou JavaScript, vous pouvez évaluer ce calcul avec :\n\`\`\`python\nresultat = ${raw.replace(/×/g, '*').replace(/÷/g, '/').replace(/\^/g, '**')}\nprint(f"Résultat : {resultat}")\n\`\`\``,
      actions: [],
    };
  }

  // 2. Check Conversation Memory for Follow-up ("donne un exemple", "et le quiz ?", "explique plus", "montre le code")
  const prevUserMsgs = history.filter(m => m.sender === 'user').map(m => m.text);
  const lastContextText = prevUserMsgs.length > 0 ? prevUserMsgs[prevUserMsgs.length - 1] : '';
  const currentTopicKey = detectTopicKey(raw) || (
    /exemple|code|plus|détail|quiz|exercice|comment faire|explique/i.test(q)
      ? detectTopicKey(lastContextText)
      : null
  );

  // 3. Personal Progress / "Où j'en suis" / "Mes cours" / "Ma progression"
  if (
    q.includes('ma progression') ||
    q.includes('mes cours') ||
    q.includes('où j\'en suis') ||
    q.includes('ou jen suis') ||
    q.includes('mon avancement') ||
    q.includes('mon bilan') ||
    q.includes('mes statistiques')
  ) {
    const active = enrichedCourses.filter(c => c.isEnrolled);
    const certifiedList = enrichedCourses.filter(c => c.isCertified);
    const greenLightList = active.filter(c => c.progress >= 100 && !c.isCertified);

    if (active.length === 0) {
      return {
        text: `### 📊 Bilan Académique de ${userName}\n\nVous n'avez pas encore démarré de playlist vidéo.\n\n**Voici comment commencer immédiatement (100% gratuit) :**\n1. Choisissez une formation parmi nos **${enrichedCourses.length} parcours certifiants** dans le Catalogue.\n2. Lancez le **Module #1** : dès qu'une vidéo se termine, elle est automatiquement validée et la suivante démarre.\n3. Atteignez **100%** pour débloquer le **Feu Vert** du Quiz et obtenir votre diplôme officiel !`,
        actions: [
          { label: 'Explorer le Catalogue', path: '/catalogue' },
          { label: 'Voir mon Dashboard', path: '/dashboard' },
        ],
      };
    }

    const lines = active.map(
      c =>
        `- **${c.title}** : \`${c.progress}%\` (${c.completedCount}/${c.totalMods} vidéos · moy. ~${c.stats.avgFormatted}/vidéo) ${
          c.isCertified
            ? '🏆 **Certifié**'
            : c.progress >= 100
              ? '🟢 **FEU VERT QUIZ DÉBLOQUÉ**'
              : `⏳ Reste ~${c.stats.remainingFormatted}`
        }`
    );

    const nextCourse = active.find(c => c.progress < 100) || active[0];

    return {
      text: `### 📊 Votre Bilan Académique en Temps Réel (${userName})\n\n- **Formations suivies** : **${active.length}** sur ${enrichedCourses.length} disponibles\n- **Diplômes obtenus** : **${certifiedList.length}** certificat(s) officiel(s)\n- **Feux Verts prêts pour le Quiz** : **${greenLightList.length}**\n\n#### Détail de vos Playlists :\n${lines.join('\n')}\n\n${
        greenLightList.length > 0
          ? `🟢 **Félicitations !** Vous avez le Feu Vert pour passer le Quiz de **${greenLightList[0].title}** dès maintenant !`
          : `🎯 **Prochaine étape recommandée** : Continuez **${nextCourse.title}** pour atteindre 100% et débloquer son examen.`
      }`,
      actions: [
        ...(greenLightList.length > 0
          ? [{ label: `Passer le Quiz : ${greenLightList[0].title.slice(0, 22)}...`, path: `/quiz/${greenLightList[0].id}` }]
          : []),
        ...(nextCourse ? [{ label: `Reprendre : ${nextCourse.title.slice(0, 22)}...`, path: `/course/${nextCourse.id}` }] : []),
        { label: 'Mes Certificats', path: '/certificats' },
      ],
    };
  }

  // 4. Questions about Agenda / Planning / Live Sessions
  if (q.includes('agenda') || q.includes('calendrier') || q.includes('planning') || q.includes('événement') || q.includes('session') || q.includes('rappel')) {
    const upcoming = agendaEvents.slice(0, 4);
    const eventLines = upcoming.length > 0
      ? upcoming.map(e => `- **${e.title}** (${e.date || 'Prochainement'} · ${e.start_time || '10:00'} - ${e.end_time || '11:30'}) — Catégorie : *${e.category || 'Révision'}*`).join('\n')
      : `- Aucune session planifiée aujourd'hui — vous pouvez en créer une en un clic ou générer un planning automatique !`;

    return {
      text: `### 📅 Votre Agenda Pro & Sessions Live\n\nL'Agenda MR1Academy supporte le **Drag & Drop**, l'export/import **iCalendar (.ics RFC 5545)**, les liens directs **Google Calendar / Microsoft Outlook** et les **notifications navigateur**.\n\n#### Vos prochains créneaux :\n${eventLines}\n\n💡 **Conseil productivité** : Planifiez 3 sessions de 45 minutes par semaine pour valider un cours complet et décrocher son certificat en moins de 10 jours.`,
      actions: [
        { label: 'Ouvrir l’Agenda Pro', path: '/calendrier' },
      ],
    };
  }

  // 5. Questions about Certification, Green Light (Feu Vert), Quiz Rules, or Free Access
  if (
    q.includes('certificat') ||
    q.includes('diplôme') ||
    q.includes('diplome') ||
    q.includes('feu vert') ||
    q.includes('gratuit') ||
    q.includes('prix') ||
    q.includes('paiement') ||
    q.includes('payer') ||
    (q.includes('quiz') && !currentTopicKey)
  ) {
    const certCount = Object.values(localCerts).filter(c => c?.certified).length;
    return {
      text: `### 🏆 Système de Certification & Feu Vert MR1Academy\n\nSur **MR1Academy**, **tout est 100% gratuit et académique** (aucun paiement, aucun abonnement caché). Les certificats s'obtiennent uniquement par la validation de vos compétences :\n\n1. **Playlist Vidéo Séquentielle** : Chaque cours calcule la **durée moyenne par vidéo** et la durée totale. Dès que vous terminez la 1ère vidéo, elle est automatiquement validée et le lecteur lance la 2ème vidéo après un compte à rebours de 3 secondes.\n2. **Le Feu Vert (100%)** : Une fois toutes les vidéos de la playlist validées, la bannière **🟢 FEU VERT DÉBLOQUÉ** apparaît et vous ouvre l'accès au Quiz officiel.\n3. **Quiz Technique & Diplôme HD** : Obtenez au moins **80% de bonnes réponses** au QCM chronométré pour générer votre **Certificat Officiel** (exportable en **PNG Haute Définition 2000×1414px** et **PDF A4 Vectoriel**) avec un numéro de série unique \`VIBE-${new Date().getFullYear()}-XXXX\`.\n\n🎓 Vous possédez actuellement **${certCount} certificat(s) validé(s)**.`,
      actions: [
        { label: 'Voir mes Certificats', path: '/certificats' },
        { label: 'Choisir un Cours', path: '/catalogue' },
      ],
    };
  }

  // 6. Questions asking to list all courses / Catalogue / Recommendations
  if (
    q.includes('quels sont les cours') ||
    q.includes('liste des cours') ||
    q.includes('tous les cours') ||
    q.includes('catalogue') ||
    q.includes('formations disponibles') ||
    q.includes('que puis-je apprendre') ||
    q.includes('recommande') ||
    q.includes('conseille')
  ) {
    if (enrichedCourses.length > 0) {
      const courseLines = enrichedCourses.map(
        (c, idx) =>
          `${idx + 1}. **${c.title}** — *${c.meta.badge}*\n   - 🎬 **${c.totalMods} vidéos** (Durée totale : \`${c.stats.totalFormatted}\` · Moyenne : \`~${c.stats.avgFormatted}/vidéo\`)\n   - 📈 Votre statut : ${
            c.isCertified ? '🏆 **Certifié**' : c.isEnrolled ? `En cours (${c.progress}%)` : 'Disponible (Accès immédiat)'
          }`
      );

      return {
        text: `### 📚 Catalogue Officiel MR1Academy (${enrichedCourses.length} Formations Certifiantes)\n\nVoici l'ensemble des playlists disponibles avec leur durée moyenne par vidéo :\n\n${courseLines.join('\n\n')}\n\n💡 **Besoin d'un conseil personnalisé ?** Dites-moi votre objectif (*Web Fullstack*, *Intelligence Artificielle / Data*, *Backend Entreprise Java/C#*, *Systèmes C/C++*, ou *UI/UX Design*) et je vous trace un plan d'étude sur mesure !`,
        actions: [
          { label: 'Ouvrir le Catalogue Complet', path: '/catalogue' },
          ...(enrichedCourses[0] ? [{ label: `Voir : ${enrichedCourses[0].title.slice(0, 20)}...`, path: `/course/${enrichedCourses[0].id}` }] : []),
        ],
      };
    }
  }

  // 7. Specific Course + Tech Topic Deep-Dive (Combines Live DB Course Info + ChatGPT Technical Explanation & Code!)
  const matchedCourse = findMatchingCourse(raw, enrichedCourses) || (currentTopicKey ? findMatchingCourse(currentTopicKey, enrichedCourses) : null);

  if (currentTopicKey && KNOWLEDGE_BASE[currentTopicKey]) {
    const kb = KNOWLEDGE_BASE[currentTopicKey];
    const wantsQuizPrep = q.includes('quiz') || q.includes('qcm') || q.includes('question') || q.includes('examen') || q.includes('test');

    if (wantsQuizPrep) {
      const questions = getCourseQuestions(matchedCourse || kb.name).slice(0, 4);
      const qPreview = questions
        .map((item, i) => `**Q${i + 1}. ${item.q}**\n   - ✅ Réponse clé : *${item.options[item.correct]}*`)
        .join('\n\n');

      return {
        text: `### 🎯 Préparation au Quiz Officiel : ${matchedCourse ? matchedCourse.title : kb.name}\n\nPour réussir le Quiz de certification (score requis **≥ 80%** après avoir atteint 100% de la playlist), voici les points clés et exemples de questions techniques à maîtriser :\n\n${qPreview}\n\n💡 **Rappel** : Terminez toutes les vidéos de la playlist dans l'ordre pour activer le **Feu Vert** !`,
        actions: matchedCourse
          ? [
              { label: `Ouvrir la Playlist (${matchedCourse.progress}%)`, path: `/course/${matchedCourse.id}` },
              ...(matchedCourse.progress >= 100 ? [{ label: 'Lancer le Quiz Officiel', path: `/quiz/${matchedCourse.id}` }] : []),
            ]
          : [{ label: 'Voir le Catalogue', path: '/catalogue' }],
      };
    }

    const courseSection = matchedCourse
      ? `\n\n---\n### 🎬 Formation associée sur MR1Academy : **${matchedCourse.title}**\n- **Playlist** : ${matchedCourse.totalMods} modules vidéo · Durée totale \`${matchedCourse.stats.totalFormatted}\` (**moyenne ~${matchedCourse.stats.avgFormatted}/vidéo**)\n- **Modules du cours** : ${(matchedCourse.modules || []).map((m, i) => `*#${i + 1} ${m.title} (${m.duration})*`).join(' → ') || 'Playlist interactive complète'}\n- **Votre progression** : \`${matchedCourse.progress}%\` ${matchedCourse.isCertified ? '🏆 (Certifié)' : matchedCourse.progress >= 100 ? '🟢 (Feu Vert Quiz débloqué !)' : ''}`
      : '';

    return {
      text: `### 💡 ${kb.name}\n\n${kb.summary}\n\n#### Concepts Fondamentaux à Maîtriser :\n${kb.concepts.map(c => `- ${c}`).join('\n')}\n\n#### Exemple de Code Professionnel :\n\`\`\`${kb.codeLang}\n${kb.codeExample}\n\`\`\`${courseSection}`,
      actions: matchedCourse
        ? [
            { label: `Suivre le cours : ${matchedCourse.title.slice(0, 22)}...`, path: `/course/${matchedCourse.id}` },
            ...(matchedCourse.progress >= 100
              ? [{ label: 'Passer le Quiz Certifiant', path: `/quiz/${matchedCourse.id}` }]
              : []),
          ]
        : [{ label: 'Explorer le Catalogue', path: '/catalogue' }],
    };
  }

  // 8. Career, Study Plan, Roadmap, Interview Prep, Debugging, or General Questions
  if (q.includes('roadmap') || q.includes('plan d\'étude') || q.includes('par où commencer') || q.includes('débutant') || q.includes('carrière') || q.includes('entretien') || q.includes('stage') || q.includes('emploi')) {
    return {
      text: `### 🚀 Plan d'Étude & Roadmap Ingénieur MR1Academy\n\nVoici les **3 parcours d'excellence** que je vous recommande selon votre objectif :\n\n1. **Parcours Fullstack Web Moderne (4 semaines)**\n   - **Étape 1** : *UI/UX Design (Figma) & CSS Glassmorphism* pour maîtriser le design d'interface.\n   - **Étape 2** : *React 19 & Hooks Avancés* pour le Frontend réactif.\n   - **Étape 3** : *Laravel 11 API* ou *Node.js & Express* + *SQL* pour le Backend et l'authentification.\n\n2. **Parcours Ingénieur Logiciel & Entreprise (4 semaines)**\n   - **Étape 1** : *Langage C & C++20* pour comprendre la mémoire, les pointeurs et l'algorithmique.\n   - **Étape 2** : *Java 21 & Spring Boot* ou *C# 12 & .NET 8* pour l'architecture orientée objet.\n   - **Étape 3** : *Oracle Database & PL/SQL* pour l'optimisation de bases de données.\n\n3. **Parcours Data Science & Intelligence Artificielle**\n   - **Étape 1** : *Python 3.12, Pandas, NumPy & Scikit-Learn*.\n   - **Étape 2** : *SQL Avancé* pour l'extraction et le nettoyage de jeux de données.\n\n🎯 Chaque cours terminé à 100% vous donne le **Feu Vert** pour obtenir un certificat vérifiable à ajouter directement sur votre **CV et LinkedIn** !`,
      actions: [
        { label: 'Choisir mon 1er Cours', path: '/catalogue' },
        { label: 'Planifier dans mon Agenda', path: '/calendrier' },
      ],
    };
  }

  if (q.includes('bonjour') || q.includes('salut') || q.includes('hello') || q.includes('bonsoir') || q.includes('coucou') || q === 'hey') {
    return {
      text: `Bonjour **${userName}** ! 👋 Je suis **VibeGPT**, votre assistant IA personnel sur **MR1Academy**.\n\nJe connais en temps réel **toutes les formations de la plateforme**, vos **playlists vidéo**, vos **quiz de certification**, votre **agenda**, et je peux aussi répondre à **toutes vos questions de programmation, d'algorithmique, de mathématiques ou de carrière** avec du code prêt à copier.\n\nQue souhaitez-vous faire aujourd'hui ?`,
      actions: [
        { label: 'Voir ma progression', prompt: 'Où j’en suis dans mes cours ?' },
        { label: 'Catalogue des cours', prompt: 'Quels sont les cours disponibles ?' },
        { label: 'Exemple code React', prompt: 'Explique-moi React avec un exemple de code' },
      ],
    };
  }

  if (q.includes('merci') || q.includes('super') || q.includes('parfait') || q.includes('bravo') || q.includes('top')) {
    return {
      text: `Avec grand plaisir, **${userName}** ! 🚀 N'hésitez pas si vous avez besoin d'une explication de code, d'un débogage, d'un entraînement au quiz ou d'un conseil sur votre prochain module vidéo. Bon apprentissage sur **MR1Academy** !`,
      actions: [
        { label: 'Continuer mes cours', path: '/mes-cours' },
      ],
    };
  }

  // 9. Intelligent Universal Synthesis for Any Other Question (General Knowledge, Architecture, Debugging, Explanations)
  return {
    text: `### 🤖 Réponse VibeGPT — Analyse & Synthèse\n\nConcernant votre question : **"${raw}"**\n\nVoici une réponse structurée :\n\n1. **Analyse Technique & Conceptuelle** :\n   - Dans le génie logiciel et l'apprentissage moderne, ce sujet repose sur la décomposition modulaire, la clarté de l'architecture et la pratique régulière.\n   - Si votre question porte sur un **fragment de code ou un bug**, indiquez-moi le langage (**Python, Java, React/JS, PHP/Laravel, C/C++, C#, SQL, CSS**) et je vous génère immédiatement la solution complète commentée.\n\n2. **Lien avec votre parcours MR1Academy** :\n   - Vous avez accès gratuitement à **${enrichedCourses.length} formations complètes** avec playlists séquentielles, calcul de durée moyenne par vidéo et **Certificat Officiel HD** dès 100% de progression + réussite au Quiz.\n\n💡 **Essayez de me demander par exemple :**\n- *"Écris un exemple d'API en Laravel 11 ou Node.js"*\n- *"Explique les pointeurs en C/C++ ou la POO en Java"*\n- *"Prépare-moi au quiz du cours Python ou React"*\n- *"Où j'en suis dans ma progression ?"*`,
    actions: [
      { label: 'Catalogue des Formations', path: '/catalogue' },
      { label: 'Mon Bilan & Progression', prompt: 'Où j’en suis dans mes cours ?' },
    ],
  };
}
