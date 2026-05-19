<?php

namespace Database\Seeders;

use App\Models\Course;
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

        // 2. Comprehensive Course List including requested "Ancient" courses
        $courses = [
            [
                'title' => 'Programmation Java : De Zéro à Héros',
                'description' => 'Maîtrisez Java, la Programmation Orientée Objet (POO) et créez des applications robustes.',
                'price' => 59.99,
                'thumbnail' => 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800',
                'user_id' => $instructor->id,
                'rating' => 4.9,
                'students_count' => 3500,
            ],
            [
                'title' => 'Maîtriser le Langage C',
                'description' => 'Apprenez les bases de l\'informatique et de la gestion mémoire avec le langage C.',
                'price' => 45.00,
                'thumbnail' => 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&q=80&w=800',
                'user_id' => $instructor->id,
                'rating' => 4.8,
                'students_count' => 5100,
            ],
            [
                'title' => 'C# et .NET Core : Le Guide Ultime',
                'description' => 'Créez des applications d\'entreprise et des jeux vidéo avec Unity et C#.',
                'price' => 65.00,
                'thumbnail' => 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800',
                'user_id' => $admin->id,
                'rating' => 4.7,
                'students_count' => 2800,
            ],
            [
                'title' => 'Algorithmique et C++',
                'description' => 'Plongez dans le C++ moderne, la STL et l\'optimisation de performance.',
                'price' => 70.00,
                'thumbnail' => 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800',
                'user_id' => $admin->id,
                'rating' => 4.9,
                'students_count' => 1950,
            ],
            [
                'title' => 'Mastering React & Next.js 14',
                'description' => 'Apprenez à créer des applications web modernes avec React et Next.js.',
                'price' => 89.99,
                'thumbnail' => 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=800',
                'user_id' => $instructor->id,
                'rating' => 4.8,
                'students_count' => 1250,
            ],
            [
                'title' => 'Laravel 11 Full-Stack Mastery',
                'description' => 'Le guide ultime pour maîtriser Laravel 11 du début à la fin.',
                'price' => 74.99,
                'thumbnail' => 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&q=80&w=800',
                'user_id' => $instructor->id,
                'rating' => 4.9,
                'students_count' => 850,
            ],
            [
                'title' => 'Design UI/UX avec Figma',
                'description' => 'Devenez expert en design d\'interface avec Figma.',
                'price' => 49.99,
                'thumbnail' => 'https://images.unsplash.com/photo-1561070791-2a0335e98bb4?auto=format&fit=crop&q=80&w=800',
                'user_id' => $admin->id,
                'rating' => 4.7,
                'students_count' => 2100,
            ],
            [
                'title' => 'Python pour la Data Science',
                'description' => 'Analysez des données massives avec Python.',
                'price' => 69.99,
                'thumbnail' => 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800',
                'user_id' => $instructor->id,
                'rating' => 4.5,
                'students_count' => 3200,
            ]
        ];

        foreach ($courses as $c) {
            Course::updateOrCreate(['title' => $c['title']], $c);
        }
    }
}
