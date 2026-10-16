<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Module;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class CourseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Ensure Admins & Instructors exist
        $instructor = User::firstOrCreate(
            ['email' => 'marwane@vibeacademy.com'],
            [
                'name' => 'Marwane El',
                'password' => Hash::make('password123'),
                'is_admin' => false,
                'email_verified_at' => now(),
            ]
        );

        $admin = User::firstOrCreate(
            ['email' => 'admin@vibeacademy.com'],
            [
                'name' => 'Sara Admin',
                'password' => Hash::make('password123'),
                'is_admin' => true,
                'email_verified_at' => now(),
            ]
        );

        // 2. Comprehensive Course List with MATCHING modules/videos
        $courses = [
            [
                'title' => 'Programmation Java : De Zéro à Héros',
                'description' => 'Maîtrisez Java, la Programmation Orientée Objet (POO) et créez des applications robustes.',
                'price' => 59.99,
                'thumbnail' => 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800',
                'user_id' => $instructor->id,
                'rating' => 4.9,
                'students_count' => 3500,
                'modules' => [
                    ['Introduction à Java et Installation JDK', '25:30', 'https://www.youtube.com/watch?v=eIrMbAQSU34'],
                    ['Variables, Types et Opérateurs en Java', '32:15', 'https://www.youtube.com/watch?v=drQK8ciCAjY'],
                    ['Structures de contrôle : If, Switch, Boucles', '28:45', 'https://www.youtube.com/watch?v=ldYLYRNaucM'],
                    ['Programmation Orientée Objet : Classes et Objets', '45:00', 'https://www.youtube.com/watch?v=IUqKuGNasdM'],
                    ['Héritage, Polymorphisme et Interfaces', '38:20', 'https://www.youtube.com/watch?v=Zs342ePFvRI'],
                ],
            ],
            [
                'title' => 'Maîtriser le Langage C',
                'description' => 'Apprenez les bases de l\'informatique et de la gestion mémoire avec le langage C.',
                'price' => 45.00,
                'thumbnail' => 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&q=80&w=800',
                'user_id' => $instructor->id,
                'rating' => 4.8,
                'students_count' => 5100,
                'modules' => [
                    ['Introduction au Langage C', '20:00', 'https://www.youtube.com/watch?v=KJgsSFOSQv0'],
                    ['Variables, Types et Entrées/Sorties', '28:30', 'https://www.youtube.com/watch?v=aZb0iu4AZXY'],
                    ['Pointeurs et Allocation Mémoire', '35:15', 'https://www.youtube.com/watch?v=zuegQmMdy8M'],
                    ['Structures et Fichiers en C', '30:45', 'https://www.youtube.com/watch?v=ix5jPkxsr7M'],
                ],
            ],
            [
                'title' => 'C# et .NET Core : Le Guide Ultime',
                'description' => 'Créez des applications d\'entreprise et des jeux vidéo avec Unity et C#.',
                'price' => 65.00,
                'thumbnail' => 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800',
                'user_id' => $admin->id,
                'rating' => 4.7,
                'students_count' => 2800,
                'modules' => [
                    ['Introduction à C# et .NET', '22:00', 'https://www.youtube.com/watch?v=ravLFzIGuCM'],
                    ['POO en C# : Classes, Héritage, Interfaces', '40:10', 'https://www.youtube.com/watch?v=pTB0EiLXUC8'],
                    ['LINQ et Collections', '32:00', 'https://www.youtube.com/watch?v=yClSNpoj-kQ'],
                    ['ASP.NET Core Web API', '45:30', 'https://www.youtube.com/watch?v=fmvcAzHpsk8'],
                ],
            ],
            [
                'title' => 'Algorithmique et C++',
                'description' => 'Plongez dans le C++ moderne, la STL et l\'optimisation de performance.',
                'price' => 70.00,
                'thumbnail' => 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800',
                'user_id' => $admin->id,
                'rating' => 4.9,
                'students_count' => 1950,
                'modules' => [
                    ['Introduction au C++ Moderne', '25:00', 'https://www.youtube.com/watch?v=vLnPwxZdW4Y'],
                    ['STL : Vectors, Maps et Algorithmes', '35:20', 'https://www.youtube.com/watch?v=LMXjMmuNiJQ'],
                    ['Pointeurs Intelligents et Gestion Mémoire', '30:45', 'https://www.youtube.com/watch?v=UOB7-B2MfwA'],
                    ['Templates et Programmation Générique', '42:00', 'https://www.youtube.com/watch?v=I-hZkUa9mIs'],
                ],
            ],
            [
                'title' => 'Mastering React & Next.js 14',
                'description' => 'Apprenez à créer des applications web modernes avec React et Next.js.',
                'price' => 89.99,
                'thumbnail' => 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=800',
                'user_id' => $instructor->id,
                'rating' => 4.8,
                'students_count' => 1250,
                'modules' => [
                    ['React Fondamentaux : JSX et Composants', '28:00', 'https://www.youtube.com/watch?v=SqcY0GlETPk'],
                    ['Hooks : useState, useEffect, useContext', '35:15', 'https://www.youtube.com/watch?v=O6P86uwfdR0'],
                    ['State Management avec Redux Toolkit', '40:30', 'https://www.youtube.com/watch?v=Ke90Tje7VS0'],
                    ['Next.js 14 : App Router et Server Components', '45:00', 'https://www.youtube.com/watch?v=znbCa4Rr054'],
                    ['Déploiement Vercel et Optimisation', '20:00', 'https://www.youtube.com/watch?v=LRE0fL-d2o8'],
                ],
            ],
            [
                'title' => 'Laravel 11 Full-Stack Mastery',
                'description' => 'Le guide ultime pour maîtriser Laravel 11 du début à la fin.',
                'price' => 74.99,
                'thumbnail' => 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&q=80&w=800',
                'user_id' => $instructor->id,
                'rating' => 4.9,
                'students_count' => 850,
                'modules' => [
                    ['Installation et Configuration Laravel 11', '15:00', 'https://www.youtube.com/watch?v=MT-GJISB3Bg'],
                    ['Routes, Controllers et Middleware', '30:20', 'https://www.youtube.com/watch?v=TzAJfjCn7Ks'],
                    ['Eloquent ORM et Migrations', '35:45', 'https://www.youtube.com/watch?v=fXv3fP4Z1yM'],
                    ['API REST avec Sanctum Auth', '42:00', 'https://www.youtube.com/watch?v=XML9w-ENvzw'],
                ],
            ],
            [
                'title' => 'Design UI/UX avec Figma',
                'description' => 'Devenez expert en design d\'interface avec Figma.',
                'price' => 49.99,
                'thumbnail' => 'https://images.unsplash.com/photo-1561070791-2a0335e98bb4?auto=format&fit=crop&q=80&w=800',
                'user_id' => $admin->id,
                'rating' => 4.7,
                'students_count' => 2100,
                'modules' => [
                    ['Introduction à Figma et l\'Interface', '18:00', 'https://www.youtube.com/watch?v=SRec90j6lTY'],
                    ['Wireframing : De l\'idée au Prototype', '25:30', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8'],
                    ['Design System et Composants Réutilisables', '32:15', 'https://www.youtube.com/watch?v=Dtd40cHQQlk'],
                    ['Prototypage Interactif et Animations', '28:00', 'https://www.youtube.com/watch?v=lTTajzrSkCw'],
                ],
            ],
            [
                'title' => 'Python pour la Data Science',
                'description' => 'Analysez des données massives avec Python, Pandas et scikit-learn.',
                'price' => 69.99,
                'thumbnail' => 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800',
                'user_id' => $instructor->id,
                'rating' => 4.5,
                'students_count' => 3200,
                'modules' => [
                    ['Introduction à Python pour la Data', '20:00', 'https://www.youtube.com/watch?v=kqtD5dpn9C8'],
                    ['NumPy : Calcul Numérique', '28:30', 'https://www.youtube.com/watch?v=vmEHCJofslg'],
                    ['Pandas : Manipulation de Données', '35:00', 'https://www.youtube.com/watch?v=3Xc3CA655Y4'],
                    ['Visualisation avec Matplotlib et Seaborn', '30:15', 'https://www.youtube.com/watch?v=pqNCD_5r0IU'],
                    ['Machine Learning avec Scikit-learn', '50:00', 'https://www.youtube.com/watch?v=fwY9Qv96DJY'],
                ],
            ],
        ];

        foreach ($courses as $data) {
            $modules = $data['modules'];
            unset($data['modules']);

            $course = Course::updateOrCreate(['title' => $data['title']], $data);

            // Delete old modules and recreate with correct matching videos
            $course->modules()->delete();

            foreach ($modules as $order => $mod) {
                Module::create([
                    'course_id' => $course->id,
                    'title'     => $mod[0],
                    'duration'  => $mod[1],
                    'video_url' => $mod[2],
                    'order'     => $order + 1,
                ]);
            }
        }
    }
}
