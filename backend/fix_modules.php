<?php

/**
 * Fix course modules — ensures every course has proper matching videos.
 * Run with: php fix_modules.php
 */

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Course;
use App\Models\Module;

// Define proper modules for each course by title keyword matching
$courseModules = [
    'Java : De Zéro' => [
        ['Introduction à Java et Installation JDK', '25:30', 'https://www.youtube.com/watch?v=eIrMbAQSU34'],
        ['Variables, Types et Opérateurs en Java', '32:15', 'https://www.youtube.com/watch?v=drQK8ciCAjY'],
        ['Structures de contrôle : If, Switch, Boucles', '28:45', 'https://www.youtube.com/watch?v=ldYLYRNaucM'],
        ['Programmation Orientée Objet : Classes et Objets', '45:00', 'https://www.youtube.com/watch?v=IUqKuGNasdM'],
        ['Héritage, Polymorphisme et Interfaces', '38:20', 'https://www.youtube.com/watch?v=Zs342ePFvRI'],
    ],
    'Java Enterprise' => [
        ['Fondamentaux de Java 21', '18:30', 'https://www.youtube.com/watch?v=eIrMbAQSU34'],
        ['Spring Boot : Configuration et Démarrage', '28:15', 'https://www.youtube.com/watch?v=9SGDpanrc8U'],
        ['Spring Data JPA et Repositories', '35:00', 'https://www.youtube.com/watch?v=Zs342ePFvRI'],
        ['Spring Security et JWT', '40:20', 'https://www.youtube.com/watch?v=IUqKuGNasdM'],
        ['Micro-services et Docker', '45:00', 'https://www.youtube.com/watch?v=drQK8ciCAjY'],
    ],
    'Langage C' => [
        ['Introduction au Langage C', '20:00', 'https://www.youtube.com/watch?v=KJgsSFOSQv0'],
        ['Variables, Types et Entrées/Sorties', '28:30', 'https://www.youtube.com/watch?v=aZb0iu4AZXY'],
        ['Pointeurs et Allocation Mémoire', '35:15', 'https://www.youtube.com/watch?v=zuegQmMdy8M'],
        ['Structures et Fichiers en C', '30:45', 'https://www.youtube.com/watch?v=ix5jPkxsr7M'],
    ],
    'C pour les Débutants' => [
        ['Introduction au Langage C', '22:15', 'https://www.youtube.com/watch?v=KJgsSFOSQv0'],
        ['Variables, Boucles et Conditions', '30:00', 'https://www.youtube.com/watch?v=aZb0iu4AZXY'],
        ['Pointeurs et Tableaux', '35:20', 'https://www.youtube.com/watch?v=zuegQmMdy8M'],
        ['Gestion de la Mémoire Dynamique', '40:00', 'https://www.youtube.com/watch?v=ix5jPkxsr7M'],
    ],
    'C#' => [
        ['Introduction à C# et .NET', '22:00', 'https://www.youtube.com/watch?v=ravLFzIGuCM'],
        ['POO en C# : Classes, Héritage, Interfaces', '40:10', 'https://www.youtube.com/watch?v=pTB0EiLXUC8'],
        ['LINQ et Collections', '32:00', 'https://www.youtube.com/watch?v=yClSNpoj-kQ'],
        ['Programmation Asynchrone (async/await)', '35:00', 'https://www.youtube.com/watch?v=fmvcAzHpsk8'],
    ],
    'C++' => [
        ['C++20 : Nouveautés et Concepts', '25:00', 'https://www.youtube.com/watch?v=vLnPwxZdW4Y'],
        ['STL : Vectors, Maps et Algorithmes', '35:20', 'https://www.youtube.com/watch?v=LMXjMmuNiJQ'],
        ['Pointeurs Intelligents et Gestion Mémoire', '30:45', 'https://www.youtube.com/watch?v=UOB7-B2MfwA'],
        ['Templates et Programmation Générique', '42:00', 'https://www.youtube.com/watch?v=I-hZkUa9mIs'],
    ],
    'React' => [
        ['React Fondamentaux : JSX et Composants', '10:24', 'https://www.youtube.com/watch?v=SqcY0GlETPk'],
        ['Configuration du Projet React', '15:38', 'https://www.youtube.com/watch?v=O6P86uwfdR0'],
        ['Hooks : useState, useEffect, useContext', '24:15', 'https://www.youtube.com/watch?v=Ke90Tje7VS0'],
        ['Animations avec Framer Motion', '18:42', 'https://www.youtube.com/watch?v=znbCa4Rr054'],
        ['Connexion à une API REST', '32:10', 'https://www.youtube.com/watch?v=LRE0fL-d2o8'],
    ],
    'Laravel' => [
        ['Installation et Configuration Laravel', '08:20', 'https://www.youtube.com/watch?v=MT-GJISB3Bg'],
        ['Architecture MVC expliquée', '12:45', 'https://www.youtube.com/watch?v=TzAJfjCn7Ks'],
        ['Création de l\'API REST', '22:30', 'https://www.youtube.com/watch?v=fXv3fP4Z1yM'],
        ['Authentification Sanctum', '28:15', 'https://www.youtube.com/watch?v=XML9w-ENvzw'],
    ],
    'UI/UX' => [
        ['Fondamentaux du Design UX', '14:00', 'https://www.youtube.com/watch?v=SRec90j6lTY'],
        ['Wireframing avec Figma', '20:15', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8'],
        ['Design System & Composants', '18:30', 'https://www.youtube.com/watch?v=Dtd40cHQQlk'],
        ['Prototype Interactif', '22:45', 'https://www.youtube.com/watch?v=lTTajzrSkCw'],
    ],
    'Figma' => [
        ['Introduction à Figma et l\'Interface', '18:00', 'https://www.youtube.com/watch?v=SRec90j6lTY'],
        ['Wireframing : De l\'idée au Prototype', '25:30', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8'],
        ['Design System et Composants Réutilisables', '32:15', 'https://www.youtube.com/watch?v=Dtd40cHQQlk'],
        ['Prototypage Interactif et Animations', '28:00', 'https://www.youtube.com/watch?v=lTTajzrSkCw'],
    ],
    'Python' => [
        ['Introduction à Python Moderne', '12:00', 'https://www.youtube.com/watch?v=kqtD5dpn9C8'],
        ['NumPy & Pandas pour la Data', '25:30', 'https://www.youtube.com/watch?v=vmEHCJofslg'],
        ['Visualisation avec Matplotlib', '20:00', 'https://www.youtube.com/watch?v=3Xc3CA655Y4'],
        ['Machine Learning avec Scikit-learn', '35:45', 'https://www.youtube.com/watch?v=pqNCD_5r0IU'],
        ['Projet Final: Prédiction de Prix', '45:00', 'https://www.youtube.com/watch?v=fwY9Qv96DJY'],
    ],
    'Node.js' => [
        ['Node.js: Architecture et Event Loop', '16:00', 'https://www.youtube.com/watch?v=ENrzD9HAZK4'],
        ['Express.js et Routing avancé', '22:30', 'https://www.youtube.com/watch?v=Lr9WUkeYSA8'],
        ['MongoDB & Mongoose', '28:00', 'https://www.youtube.com/watch?v=DZBGEVgL2eE'],
        ['Authentification JWT', '32:15', 'https://www.youtube.com/watch?v=7Q17ubqLfaM'],
    ],
    'CSS' => [
        ['CSS Grid & Flexbox Avancés', '18:00', 'https://www.youtube.com/watch?v=jV8B24rSN5o'],
        ['Variables CSS & Design Tokens', '14:30', 'https://www.youtube.com/watch?v=oZPR_78wCnY'],
        ['Glassmorphism de A à Z', '22:00', 'https://www.youtube.com/watch?v=RIWTs4U6Cto'],
        ['Animations CSS & Keyframes', '26:45', 'https://www.youtube.com/watch?v=YszONjKpgg4'],
    ],
    'Oracle' => [
        ['Introduction à Oracle Database', '15:20', 'https://www.youtube.com/watch?v=wG6z3Kg8Ep4'],
        ['SQL Fondamental : SELECT, JOIN, GROUP BY', '30:10', 'https://www.youtube.com/watch?v=7S_tz1z_5bA'],
        ['PL/SQL : Procédures et Fonctions', '28:00', 'https://www.youtube.com/watch?v=t1Bt0LFaIXw'],
        ['Administration et Sauvegarde', '35:45', 'https://www.youtube.com/watch?v=h0nxCDiD-zg'],
    ],
    '.NET' => [
        ['Introduction à ASP.NET Core 8', '20:00', 'https://www.youtube.com/watch?v=ravLFzIGuCM'],
        ['MVC Pattern et Razor Pages', '30:15', 'https://www.youtube.com/watch?v=pTB0EiLXUC8'],
        ['Entity Framework Core et Migrations', '35:45', 'https://www.youtube.com/watch?v=fmvcAzHpsk8'],
        ['Web API REST et Authentication', '42:00', 'https://www.youtube.com/watch?v=yClSNpoj-kQ'],
    ],
];

echo "\n🔧 Fixing course modules...\n\n";

$courses = Course::all();
$fixed = 0;

foreach ($courses as $course) {
    $matched = false;
    
    foreach ($courseModules as $keyword => $modules) {
        if (stripos($course->title, $keyword) !== false) {
            // Delete old modules
            $oldCount = $course->modules()->count();
            $course->modules()->delete();
            
            // Create new matching modules
            foreach ($modules as $order => $mod) {
                Module::create([
                    'course_id' => $course->id,
                    'title'     => $mod[0],
                    'duration'  => $mod[1],
                    'video_url' => $mod[2],
                    'order'     => $order + 1,
                ]);
            }
            
            echo "✅ [{$course->id}] {$course->title}\n";
            echo "   → Removed {$oldCount} old modules, added " . count($modules) . " matching modules\n";
            $fixed++;
            $matched = true;
            break;
        }
    }
    
    if (!$matched) {
        $modCount = $course->modules()->count();
        echo "⚠️  [{$course->id}] {$course->title} — no keyword match ({$modCount} modules kept)\n";
    }
}

echo "\n🎉 Done! Fixed {$fixed} courses.\n";
echo "Total courses: " . Course::count() . "\n";
echo "Total modules: " . Module::count() . "\n";
