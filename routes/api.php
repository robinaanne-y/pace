<?php

use App\Http\Controllers\Api\ProjectController;
use Illuminate\Support\Facades\Route;

Route::apiResource('projects', ProjectController::class)
    ->names('api.projects')
    ->where(['project' => '[0-9]+'])
    ->missing(fn () => response()->json(['message' => 'Project not found.'], 404));
