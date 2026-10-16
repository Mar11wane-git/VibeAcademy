<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\AdminController;

/*
|--------------------------------------------------------------------------
| API Routes - VibeAcademy
|--------------------------------------------------------------------------
*/

// Public Routes
Route::post('/register',      [AuthController::class, 'register']);
Route::post('/login',         [AuthController::class, 'login']);

// Maintenance-protected Routes
Route::middleware('maintenance')->group(function () {
    Route::post('/verify-email',  [AuthController::class, 'verifyEmail']);
    Route::post('/resend-code',   [AuthController::class, 'resendCode']);
    Route::get('/courses',        [CourseController::class, 'index']);
    Route::get('/courses/{id}',   [CourseController::class, 'show']);
    Route::get('/courses/{courseId}/comments', [CommentController::class, 'index']);

    // Protected Routes (require Sanctum token)
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        // Profile & Misc
        Route::get('/me',             [AuthController::class, 'me']);
        Route::post('/profile',       [AuthController::class, 'updateProfile']);

        // Favorites (Personalized)
        Route::get('/favorites',           [FavoriteController::class, 'index']);
        Route::post('/favorites/{id}',     [FavoriteController::class, 'toggle']);
        Route::get('/favorites/{id}/check', [FavoriteController::class, 'check']);

        // Enrollments (Personalized Student Dashboard)
        Route::get('/my-courses',     [CourseController::class, 'myCourses']);
        Route::post('/enroll/{id}',   [CourseController::class, 'enroll']);

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

        // Admin Group (Always accessible for admins via middleware logic)
        Route::middleware('admin')->prefix('admin')->group(function () {
            Route::get('/settings',         [AdminController::class, 'getSettings']);
            Route::post('/settings',        [AdminController::class, 'updateSettings']);
            Route::get('/stats',            [AdminController::class, 'stats']);
            Route::get('/courses',          [AdminController::class, 'allCourses']);
            Route::get('/users',            [AdminController::class, 'allUsers']);
            Route::delete('/courses/{id}',  [AdminController::class, 'deleteCourse']);
            Route::delete('/users/{id}',    [AdminController::class, 'deleteUser']);
            Route::post('/users/{id}/toggle-admin', [AdminController::class, 'toggleAdmin']);
            
            // Course management for admin
            Route::post('/courses',         [CourseController::class, 'store']);
            Route::put('/courses/{id}',     [CourseController::class, 'update']);
            Route::post('/courses/{id}/modules', [CourseController::class, 'addModule']);
            Route::delete('/courses/{courseId}/modules/{moduleId}', [CourseController::class, 'deleteModule']);
        });
    });
});
