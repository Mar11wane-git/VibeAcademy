<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Thread;
use App\Models\User;

class ThreadSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first();
        if (!$user) return;

        $threads = [
            ['Astuces pour réussir l\'examen React', 'React', 120],
            ['Quel est le meilleur moment pour utiliser Redux ?', 'Architecture', 45],
            ['Problème avec useEffect : boucle infinie', 'Entraide', 15],
            ['Voici mon portfolio après 3 mois sur MR1Academy !', 'Showcase', 300]
        ];

        foreach($threads as $t) {
            $th = Thread::create(['user_id' => $user->id, 'title' => $t[0], 'tag' => $t[1], 'likes' => $t[2]]);
            if($t[0] == 'Astuces pour réussir l\'examen React') {
                $th->replies()->create(['user_id' => $user->id, 'text' => 'Je conseille de bien réviser les Hooks en premier !']);
            }
        }
    }
}
