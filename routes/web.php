<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\Dashboard\ApiAccessController;
use App\Http\Controllers\Dashboard\SupportController;
use App\Http\Controllers\Dashboard\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('/', [AuthenticatedSessionController::class, 'create'])->name('home');
    Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('login', [AuthenticatedSessionController::class, 'store']);
});

Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');

Route::middleware(['auth', 'admin'])->prefix('dashboard')->group(function () {
    Route::get('/', DashboardController::class)->name('dashboard');

    Route::name('dashboard.')->group(function () {
        Route::resource('users', UserController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::get('support', [SupportController::class, 'index'])->name('support.index');
        Route::get('support/{issue}', [SupportController::class, 'show'])->name('support.show');
        Route::get('api', [ApiAccessController::class, 'index'])->name('api.index');
        Route::get('api/tests', [ApiAccessController::class, 'tests'])->name('api.tests');
        Route::get('api/tests/issues/{issue}/job', [ApiAccessController::class, 'jobStatus'])->name('api.tests.job');
        Route::post('api/tests/issues/{issue}/run-summary', [ApiAccessController::class, 'runSummary'])->name('api.tests.run-summary');
        Route::post('api/tokens', [ApiAccessController::class, 'store'])->name('api.tokens.store');
        Route::delete('api/tokens/{token}', [ApiAccessController::class, 'destroy'])->name('api.tokens.destroy');
    });
});
