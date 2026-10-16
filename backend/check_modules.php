<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$courses = \App\Models\Course::with('modules')->get();
foreach ($courses as $c) {
    echo $c->id . ' | ' . $c->title . ' | Modules: ' . $c->modules->count() . "\n";
    foreach ($c->modules as $m) {
        echo '   ' . $m->order . '. ' . $m->title . ' → ' . substr($m->video_url, 0, 55) . "\n";
    }
    echo "\n";
}
