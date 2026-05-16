<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\AdminController;

/*
|--------------------------------------------------------------------------
| API Routes - VibeAcademy
|--------------------------------------------------------------------------
*/

// Public Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);
Route::get('/courses',   [CourseController::class, 'index']);
Route::get('/courses/{id}', [CourseController::class, 'show']);
Route::get('/courses/{courseId}/comments', [CommentController::class, 'index']);

// Protected Routes (require Sanctum token)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);

    // Courses - Create & Video Upload
    Route::post('/courses',              [CourseController::class, 'store']);
    Route::post('/courses/upload-video', [CourseController::class, 'uploadVideo']);

    // Enrollments
    Route::get('/my-enrollments',                 [EnrollmentController::class, 'myEnrollments']);
    Route::post('/courses/{courseId}/enroll',     [EnrollmentController::class, 'enroll']);
    Route::put('/courses/{courseId}/progress',    [EnrollmentController::class, 'updateProgress']);
    Route::post('/courses/{courseId}/complete-module', [EnrollmentController::class, 'completeModule']);

    // Comments
    Route::post('/courses/{courseId}/comments', [CommentController::class, 'store']);
    Route::delete('/comments/{id}',             [CommentController::class, 'destroy']);

    // Community
    Route::get('/community/threads', [App\Http\Controllers\CommunityController::class, 'index']);
    Route::post('/community/threads', [App\Http\Controllers\CommunityController::class, 'store']);
    Route::post('/community/threads/{id}/reply', [App\Http\Controllers\CommunityController::class, 'reply']);
    Route::post('/community/threads/{id}/like', [App\Http\Controllers\CommunityController::class, 'like']);
    Route::post('/community/threads/{id}/unlike', [App\Http\Controllers\CommunityController::class, 'unlike']);

    // Admin Group
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/stats',            [AdminController::class, 'stats']);
        Route::get('/courses',          [AdminController::class, 'allCourses']);
        Route::get('/users',            [AdminController::class, 'allUsers']);
        Route::delete('/courses/{id}',  [AdminController::class, 'deleteCourse']);
        Route::delete('/users/{id}',    [AdminController::class, 'deleteUser']);
        
        // Course management for admin
        Route::post('/courses',         [CourseController::class, 'store']);
        Route::put('/courses/{id}',     [CourseController::class, 'update']);
        Route::post('/courses/{id}/modules', [CourseController::class, 'addModule']);
    });
});
