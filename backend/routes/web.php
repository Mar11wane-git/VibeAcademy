<?php

use Illuminate\Support\Facades\Route;

Route::any('/api/test', function () {
    return response()->json(['status' => 'ok', 'message' => 'MR1Academy API is running!']);
});

Route::get('/{any}', function () {
    return response()->json(['message' => 'API not found. Use /api/* routes.'], 404);
})->where('any', '.*');
