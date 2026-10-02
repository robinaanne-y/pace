<?php

use App\Http\Controllers\Api\ProjectController;
use Illuminate\Support\Facades\Route;

Route::apiResource('projects', ProjectController::class)
    ->names('api.projects')
    ->missing(fn () => response()->json(['message' => 'Project not found.'], 404));
