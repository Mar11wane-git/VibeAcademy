<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AgendaController;

/*
|--------------------------------------------------------------------------
| API Routes - MR1Academy
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

    // Agenda Routes (accessible with or without auth token, enhanced when authenticated)
    Route::get('/agenda/events',                    [AgendaController::class, 'index']);
    Route::post('/agenda/events',                   [AgendaController::class, 'store']);
    Route::put('/agenda/events/{id}',               [AgendaController::class, 'update']);
    Route::delete('/agenda/events/{id}',            [AgendaController::class, 'destroy']);
    Route::post('/agenda/events/{id}/toggle-enroll',[AgendaController::class, 'toggleEnroll']);
    Route::post('/agenda/events/{id}/toggle-reminder',[AgendaController::class, 'toggleReminder']);

    // Community & Showcase Routes (accessible with or without auth token, enhanced when authenticated)
    Route::get('/community/threads',                [\App\Http\Controllers\CommunityController::class, 'index']);
    Route::post('/community/threads',               [\App\Http\Controllers\CommunityController::class, 'store']);
    Route::delete('/community/threads/{id}',        [\App\Http\Controllers\CommunityController::class, 'destroy']);
    Route::post('/community/threads/{id}/solve',    [\App\Http\Controllers\CommunityController::class, 'toggleSolved']);
    Route::post('/community/threads/{id}/reply',    [\App\Http\Controllers\CommunityController::class, 'reply']);
    Route::post('/community/threads/{id}/like',     [\App\Http\Controllers\CommunityController::class, 'like']);
    Route::post('/community/threads/{id}/unlike',   [\App\Http\Controllers\CommunityController::class, 'unlike']);
    Route::get('/community/projects',               [\App\Http\Controllers\CommunityController::class, 'projects']);
    Route::post('/community/projects',              [\App\Http\Controllers\CommunityController::class, 'storeProject']);
    Route::post('/community/projects/{id}/like',    [\App\Http\Controllers\CommunityController::class, 'likeProject']);

    // Contact & Support Tickets (accessible with or without auth token)
    Route::get('/contact/tickets',                  [\App\Http\Controllers\ContactController::class, 'index']);
    Route::post('/contact',                         [\App\Http\Controllers\ContactController::class, 'store']);

    // Protected Routes (require Sanctum token)
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        // Profile & Misc
        Route::get('/me',             [AuthController::class, 'me']);
        Route::post('/profile',       [AuthController::class, 'updateProfile']);

        // Favorites (Personalized)
        Route::get('/favorites',           [FavoriteController::class, 'index']);
        Route::post('/favorites/{id}',     [FavoriteController::class, 'toggle']);
        Route::put('/favorites/{id}/meta', [FavoriteController::class, 'updateMeta']);
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
        Route::post('/courses/{courseId}/submit-quiz',     [EnrollmentController::class, 'submitQuiz']);

        // Comments
        Route::post('/courses/{courseId}/comments', [CommentController::class, 'store']);
        Route::delete('/comments/{id}',             [CommentController::class, 'destroy']);

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
