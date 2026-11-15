<?php

use App\Http\Controllers\Api\IssueCommentController;
use App\Http\Controllers\Api\IssueController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('issues', [IssueController::class, 'index']);
    Route::post('issues', [IssueController::class, 'store']);
    Route::get('issues/{issue}', [IssueController::class, 'show']);
    Route::patch('issues/{issue}', [IssueController::class, 'update']);
    Route::delete('issues/{issue}', [IssueController::class, 'destroy']);
    Route::post('issues/{issue}/comments', [IssueCommentController::class, 'store']);
});
