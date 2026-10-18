<?php

// Vercel serverless entrypoint for Laravel.
// The deployment filesystem is read-only except /tmp, so redirect every writable path there.
$tmp = '/tmp';
foreach (['storage/framework/cache/data', 'storage/framework/sessions', 'storage/framework/views', 'storage/logs', 'bootstrap/cache'] as $dir) {
    if (!is_dir("$tmp/$dir")) {
        @mkdir("$tmp/$dir", 0777, true);
    }
}

$paths = [
    'LARAVEL_STORAGE_PATH' => "$tmp/storage",
    'VIEW_COMPILED_PATH'   => "$tmp/storage/framework/views",
    'APP_CONFIG_CACHE'     => "$tmp/bootstrap/cache/config.php",
    'APP_ROUTES_CACHE'     => "$tmp/bootstrap/cache/routes.php",
    'APP_EVENTS_CACHE'     => "$tmp/bootstrap/cache/events.php",
    'APP_SERVICES_CACHE'   => "$tmp/bootstrap/cache/services.php",
    'APP_PACKAGES_CACHE'   => "$tmp/bootstrap/cache/packages.php",
];
foreach ($paths as $key => $value) {
    putenv("$key=$value");
    $_ENV[$key] = $value;
    $_SERVER[$key] = $value;
}

require __DIR__ . '/../public/index.php';
