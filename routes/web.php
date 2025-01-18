<?php

use App\Events\PlayerReadyStatusChanged;
use App\Http\Controllers\GameController;
use App\Http\Controllers\LobbyController;
use App\Http\Controllers\ProfileController;
use App\Models\Lobby;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Home');
})->name('home');

Route::middleware(['auth'])->group(function () {

    Route::get('/game/{gameId}', [GameController::class, 'show'])->name('game.show');
    Route::post('/game/{gameId}/leave', [GameController::class, 'leave'])->name('game.leave');
    Route::post('/game/{gameId}/state/initial', [GameController::class, 'storeInitialState'])->name('game.state.initial');
    Route::post('/game/{gameId}/state/update', [GameController::class, 'updateState'])->name('game.state.update');
    Route::post('/game/{gameId}/players', [GameController::class, 'storePlayers'])->name('game.players.store');
});
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

Route::middleware('auth')->group(function () {
    // Ready toggle
    Route::post('/lobby/{code}/toggle-ready', function ($code) {
        Broadcast::presence("lobby.{$code}")->as('ready-toggle')->with(['id' => auth()->id(), 'name' => auth()->user()->name])->toOthers()->sendNow();
    })->name('lobby.ready');
    // Share ready status
    Route::get('/lobby/{code}/ready-status', function ($code) {
        return response()->json(Lobby::where('code', $code)->first()->ready_status);
    })->name('lobby.ready-status');
});

require __DIR__.'/auth.php';
