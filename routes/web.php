<?php

use App\Http\Controllers\LobbyController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Home');
})->name('home');

Route::middleware('auth')->group(function () {
    Route::get('/lobby', [LobbyController::class, 'index'])->name('lobby');
    Route::get('/lobby/create', [LobbyController::class, 'create'])->name('lobby.create');
    Route::post('/lobby/store', [LobbyController::class, 'store'])->name('lobby.store');
    Route::get('/lobby/{code}', [LobbyController::class, 'show'])->name('lobby.show');
    Route::post('/lobbies/{code}/join', [LobbyController::class, 'join'])->name('lobby.join');
    Route::post('/lobby/{code}/leave', [LobbyController::class, 'leave'])->name('lobby.leave');
});

Route::get('/singleplayer', function () {
    return Inertia::render('Offline');
})->name('offline');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
