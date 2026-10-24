<?php

use Illuminate\Support\Facades\Route;

Route::any('/api/test', function () {
    return response()->json(['status' => 'ok', 'message' => 'MR1Academy API is running!']);
});

Route::fallback(function () {
    return response()->json(['message' => 'API route not found. Use /api/* routes.'], 404);
});
