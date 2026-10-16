<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$modules = [
    ['course_id'=>13, 'title'=>'Introduction à Python', 'video_url'=>'https://www.youtube.com/watch?v=rfscVS0vtbw', 'duration'=>'15:30', 'order'=>2],
    ['course_id'=>13, 'title'=>'Variables et Types de données', 'video_url'=>'https://www.youtube.com/watch?v=khKv-8q7YmY', 'duration'=>'12:45', 'order'=>3],
    ['course_id'=>13, 'title'=>'Structures de contrôle', 'video_url'=>'https://www.youtube.com/watch?v=DZwmZ8Usvnk', 'duration'=>'18:20', 'order'=>4],
];

foreach ($modules as $m) {
    \App\Models\Module::create($m);
    echo "Ajouté : " . $m['title'] . "\n";
}

echo "\n✅ Tous les modules ont été ajoutés !\n";
echo "Total modules : " . \App\Models\Module::where('course_id', 13)->count() . "\n";
