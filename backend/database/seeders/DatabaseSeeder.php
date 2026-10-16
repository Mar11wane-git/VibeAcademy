<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Course;
use App\Models\Module;
use App\Models\Enrollment;
use App\Models\Comment;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Users ─────────────────────────────────────────────
        $instructor = User::create([
            'name'     => 'Marwane',
            'email'    => 'Marwane@vibeacademy.com',
            'password' => Hash::make('123Marwane456!'),
            'is_admin' => true,
        ]);

        $instructor2 = User::create([
            'name'     => 'Thomas Dubois',
            'email'    => 'thomas@vibeacademy.com',
            'password' => Hash::make('password'),
        ]);

        $student = User::create([
            'name'     => 'Alexandre Dupont',
            'email'    => 'alex@example.com',
            'password' => Hash::make('password'),
        ]);

        // ── Courses ───────────────────────────────────────────
        $courses = [
            [
                'title'       => 'Maitrise de React JS & Animations Modernes',
                'description' => 'Apprenez React JS de zéro à expert : hooks, state management, animations Framer Motion et connexion avec une API REST.',
                'thumbnail'   => 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1000&auto=format&fit=crop',
                'instructor'  => $instructor,
                'rating'      => 4.9,
                'students'    => 12000,
                'modules'     => [
                    ["Introduction à l'Architecture Web",  '10:24', 'https://www.youtube.com/watch?v=SqcY0GlETPk'],
                    ['Configuration du Projet React',       '15:38', 'https://www.youtube.com/watch?v=O6P86uwfdR0'],
                    ['Hooks et State Management',           '24:15', 'https://www.youtube.com/watch?v=Ke90Tje7VS0'],
                    ['Animations avec Framer Motion',       '18:42', 'https://www.youtube.com/watch?v=znbCa4Rr054'],
                    ['Connexion à une API Laravel',         '32:10', 'https://www.youtube.com/watch?v=LRE0fL-d2o8'],
                ],
            ],
            [
                'title'       => 'Laravel 11: Architecture Backend Complète',
                'description' => 'Maîtrisez Laravel 11 pour construire des APIs REST robustes, avec Sanctum, Eloquent ORM, migrations et déploiement.',
                'thumbnail'   => 'https://images.unsplash.com/photo-1599507593499-a3f7d7d97667?q=80&w=1000&auto=format&fit=crop',
                'instructor'  => $instructor2,
                'rating'      => 4.8,
                'students'    => 8500,
                'modules'     => [
                    ['Installation & Configuration Laravel', '08:20', 'https://www.youtube.com/watch?v=MT-GJISB3Bg'],
                    ['Architecture MVC expliquée',           '12:45', 'https://www.youtube.com/watch?v=TzAJfjCn7Ks'],
                    ['Création de l\'API REST',               '22:30', 'https://www.youtube.com/watch?v=fXv3fP4Z1yM'],
                    ['Authentification Sanctum',              '28:15', 'https://www.youtube.com/watch?v=XML9w-ENvzw'],
                    ['Déploiement sur VPS Ubuntu',           '34:00', 'https://www.youtube.com/watch?v=XML9w-ENvzw'],
                ],
            ],
            [
                'title'       => 'UI/UX Masterclass: Du Wireframe au Prototype',
                'description' => 'Créez des designs professionnels avec Figma. De la recherche utilisateur au prototype interactif haute fidélité.',
                'thumbnail'   => 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1000&auto=format&fit=crop',
                'instructor'  => $instructor,
                'rating'      => 5.0,
                'students'    => 24000,
                'modules'     => [
                    ['Fondamentaux du Design UX',           '14:00', 'https://www.youtube.com/watch?v=SRec90j6lTY'],
                    ['Wireframing avec Figma',              '20:15', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8'],
                    ['Design System & Composants',          '18:30', 'https://www.youtube.com/watch?v=Dtd40cHQQlk'],
                    ['Prototype Interactif',                '22:45', 'https://www.youtube.com/watch?v=lTTajzrSkCw'],
                    ['Présenter à un client',               '10:00', 'https://www.youtube.com/watch?v=6T_HgnjoYwM'],
                ],
            ],
            [
                'title'       => 'Python pour la Data Science & Machine Learning',
                'description' => 'Maîtrisez Python, Pandas, NumPy, Matplotlib et les algorithmes ML avec scikit-learn pour analyser des données réelles.',
                'thumbnail'   => 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000&auto=format&fit=crop',
                'instructor'  => $instructor2,
                'rating'      => 4.9,
                'students'    => 18500,
                'modules'     => [
                    ['Introduction au Python Moderne',      '12:00', 'https://www.youtube.com/watch?v=kqtD5dpn9C8'],
                    ['NumPy & Pandas pour la Data',         '25:30', 'https://www.youtube.com/watch?v=vmEHCJofslg'],
                    ['Visualisation avec Matplotlib',       '20:00', 'https://www.youtube.com/watch?v=3Xc3CA655Y4'],
                    ['Machine Learning avec Scikit-learn',  '35:45', 'https://www.youtube.com/watch?v=pqNCD_5r0IU'],
                    ['Projet Final: Prédiction de Prix',    '45:00', 'https://www.youtube.com/watch?v=fwY9Qv96DJY'],
                ],
            ],
            [
                'title'       => 'Node.js & Express: API REST Complète',
                'description' => 'Construisez des APIs performantes avec Node.js, Express, MongoDB et déployez sur le cloud avec Docker et CI/CD.',
                'thumbnail'   => 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop',
                'instructor'  => $instructor2,
                'rating'      => 4.7,
                'students'    => 9200,
                'modules'     => [
                    ['Node.js: Architecture et Event Loop', '16:00', 'https://www.youtube.com/watch?v=ENrzD9HAZK4'],
                    ['Express.js et Routing avancé',        '22:30', 'https://www.youtube.com/watch?v=Lr9WUkeYSA8'],
                    ['MongoDB & Mongoose',                  '28:00', 'https://www.youtube.com/watch?v=DZBGEVgL2eE'],
                    ['Authentification JWT',                '32:15', 'https://www.youtube.com/watch?v=7Q17ubqLfaM'],
                    ['Dockeriser & Déployer l\'API',         '40:00', 'https://www.youtube.com/watch?v=pOZFqQQOAFQ'],
                ],
            ],
            [
                'title'       => 'CSS Glassmorphism & Design Avancé',
                'description' => 'Maîtrisez les techniques CSS modernes: Grid, Flexbox, variables CSS, animations, Glassmorphism et Dark Mode professionnel.',
                'thumbnail'   => 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?q=80&w=1000&auto=format&fit=crop',
                'instructor'  => $instructor,
                'rating'      => 4.8,
                'students'    => 15200,
                'modules'     => [
                    ['CSS Grid & Flexbox Avancés',          '18:00', 'https://www.youtube.com/watch?v=jV8B24rSN5o'],
                    ['Variables CSS & Design Tokens',       '14:30', 'https://www.youtube.com/watch?v=oZPR_78wCnY'],
                    ['Glassmorphism de A à Z',              '22:00', 'https://www.youtube.com/watch?v=RIWTs4U6Cto'],
                    ['Animations CSS & Keyframes',          '26:45', 'https://www.youtube.com/watch?v=YszONjKpgg4'],
                    ['Dark Mode & Thèmes Dynamiques',       '20:00', 'https://www.youtube.com/watch?v=9EPTBX2Ogz0'],
                ],
            ],
            [
                'title'       => 'Oracle Database 21c Administration',
                'description' => 'Devenez DBA expert : administration, sauvegarde, sécurité, SQL et PL/SQL.',
                'thumbnail'   => 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop',
                'instructor'  => $instructor2,
                'rating'      => 4.7,
                'students'    => 5400,
                'modules'     => [
                    ['Introduction à Oracle Database', '15:20', 'https://www.youtube.com/watch?v=wG6z3Kg8Ep4'],
                    ['SQL Fondamental : SELECT, JOIN, GROUP BY', '30:10', 'https://www.youtube.com/watch?v=7S_tz1z_5bA'],
                    ['PL/SQL : Procédures et Fonctions', '28:00', 'https://www.youtube.com/watch?v=t1Bt0LFaIXw'],
                    ['Administration et Sauvegarde', '35:45', 'https://www.youtube.com/watch?v=h0nxCDiD-zg'],
                ],
            ],
            [
                'title'       => 'Développement Web avec .NET 8',
                'description' => 'Construisez des applications robustes avec ASP.NET Core MVC, Web API et Entity Framework.',
                'thumbnail'   => 'https://images.unsplash.com/photo-1550439062-609e1531270e?q=80&w=1000&auto=format&fit=crop',
                'instructor'  => $instructor,
                'rating'      => 4.9,
                'students'    => 11200,
                'modules'     => [
                    ['Introduction à ASP.NET Core 8', '20:00', 'https://www.youtube.com/watch?v=ravLFzIGuCM'],
                    ['MVC Pattern et Razor Pages', '30:15', 'https://www.youtube.com/watch?v=pTB0EiLXUC8'],
                    ['Entity Framework Core et Migrations', '35:45', 'https://www.youtube.com/watch?v=fmvcAzHpsk8'],
                    ['Web API REST et Authentication', '42:00', 'https://www.youtube.com/watch?v=yClSNpoj-kQ'],
                ],
            ],
            [
                'title'       => 'Développeur Java Enterprise (Spring Boot)',
                'description' => 'Maîtrisez Java 21, Spring Boot, Spring Security et les micro-services orientés cloud.',
                'thumbnail'   => 'https://images.unsplash.com/photo-1629853925769-6d60cbee83b0?q=80&w=1000&auto=format&fit=crop',
                'instructor'  => $instructor2,
                'rating'      => 4.8,
                'students'    => 20500,
                'modules'     => [
                    ['Fondamentaux de Java 21', '18:30', 'https://www.youtube.com/watch?v=eIrMbAQSU34'],
                    ['Spring Boot : Configuration et Démarrage', '28:15', 'https://www.youtube.com/watch?v=9SGDpanrc8U'],
                    ['Spring Data JPA et Repositories', '35:00', 'https://www.youtube.com/watch?v=Zs342ePFvRI'],
                    ['Spring Security et JWT', '40:20', 'https://www.youtube.com/watch?v=IUqKuGNasdM'],
                    ['Micro-services et Docker', '45:00', 'https://www.youtube.com/watch?v=drQK8ciCAjY'],
                ],
            ],
            [
                'title'       => 'Programmation en C pour les Débutants',
                'description' => 'Apprenez les bases de la programmation système, les pointeurs, et la gestion de mémoire en C.',
                'thumbnail'   => 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000&auto=format&fit=crop',
                'instructor'  => $instructor,
                'rating'      => 4.6,
                'students'    => 4000,
                'modules'     => [
                    ['Introduction au Langage C', '22:15', 'https://www.youtube.com/watch?v=KJgsSFOSQv0'],
                    ['Variables, Boucles et Conditions', '30:00', 'https://www.youtube.com/watch?v=aZb0iu4AZXY'],
                    ['Pointeurs et Tableaux', '35:20', 'https://www.youtube.com/watch?v=zuegQmMdy8M'],
                    ['Gestion de la Mémoire Dynamique', '40:00', 'https://www.youtube.com/watch?v=ix5jPkxsr7M'],
                ],
            ],
            [
                'title'       => 'C# Moderne de A à Z',
                'description' => 'Découvrez C# 12, LINQ, l\'asynchrone, et les bonnes pratiques de programmation orientée objet.',
                'thumbnail'   => 'https://images.unsplash.com/photo-1605379399642-870262d3d051?q=80&w=1000&auto=format&fit=crop',
                'instructor'  => $instructor2,
                'rating'      => 4.9,
                'students'    => 13800,
                'modules'     => [
                    ['Introduction à C# 12', '25:00', 'https://www.youtube.com/watch?v=ravLFzIGuCM'],
                    ['Programmation Orientée Objet en C#', '32:30', 'https://www.youtube.com/watch?v=pTB0EiLXUC8'],
                    ['LINQ et Collections Avancées', '28:15', 'https://www.youtube.com/watch?v=yClSNpoj-kQ'],
                    ['Programmation Asynchrone (async/await)', '35:00', 'https://www.youtube.com/watch?v=fmvcAzHpsk8'],
                ],
            ],
            [
                'title'       => 'C++ Haute Performance',
                'description' => 'Domptez C++20, les templates, et la conception logicielle pour les jeux, la finance et l\'embarqué.',
                'thumbnail'   => 'https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?q=80&w=1000&auto=format&fit=crop',
                'instructor'  => $instructor,
                'rating'      => 4.8,
                'students'    => 8600,
                'modules'     => [
                    ['C++20 : Nouveautés et Concepts', '28:40', 'https://www.youtube.com/watch?v=vLnPwxZdW4Y'],
                    ['STL et Algorithmes Optimisés', '35:00', 'https://www.youtube.com/watch?v=LMXjMmuNiJQ'],
                    ['Templates et Programmation Générique', '42:15', 'https://www.youtube.com/watch?v=I-hZkUa9mIs'],
                    ['Multithreading et Concurrence', '45:10', 'https://www.youtube.com/watch?v=UOB7-B2MfwA'],
                ],
            ],
        ];

        foreach ($courses as $data) {
            $course = Course::create([
                'title'          => $data['title'],
                'description'    => $data['description'],
                'thumbnail'      => $data['thumbnail'],
                'user_id'        => $data['instructor']->id,
                'rating'         => $data['rating'],
                'students_count' => $data['students'],
            ]);

            foreach ($data['modules'] as $order => $mod) {
                Module::create([
                    'course_id' => $course->id,
                    'title'     => $mod[0],
                    'duration'  => $mod[1],
                    'video_url' => $mod[2],
                    'order'     => $order + 1,
                ]);
            }
        }

        // ── Enrollments ───────────────────────────────────────
        $allCourses = Course::all();
        Enrollment::create(['user_id' => $student->id, 'course_id' => $allCourses[0]->id, 'progress' => 45]);
        Enrollment::create(['user_id' => $student->id, 'course_id' => $allCourses[2]->id, 'progress' => 100]);
        Enrollment::create(['user_id' => $student->id, 'course_id' => $allCourses[3]->id, 'progress' => 20]);

        // ── Comments ──────────────────────────────────────────
        Comment::create(['user_id' => $student->id,     'course_id' => $allCourses[0]->id, 'body' => 'Ce cours est absolument excellent ! La qualité est au top.']);
        Comment::create(['user_id' => $instructor->id,  'course_id' => $allCourses[0]->id, 'body' => 'Merci beaucoup ! N\'hésitez pas si vous avez des questions.']);
        Comment::create(['user_id' => $student->id,     'course_id' => $allCourses[3]->id, 'body' => 'La partie Pandas est vraiment bien expliquée. Très clair !']);
    }
}
