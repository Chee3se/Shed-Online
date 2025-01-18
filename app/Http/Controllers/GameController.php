<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Events\GameStateUpdated;

class GameController extends Controller
{
    /**
     * Show the game page.
     */
    private function getPlayersInGame(string $gameId)
    {
        $players = cache()->get("game.{$gameId}.players", collect());

        // Convert array data to collection of objects if needed
        return collect($players)->map(function ($player) {
            return (object)[
                'id' => $player['id'] ?? $player->id ?? null,
                'name' => $player['name'] ?? $player->name ?? null
            ];
        });
    }

    public function show(Request $request, string $gameId)
    {
        // Get the players from the game ID (which was passed from lobby)
        $playersInGame = $this->getPlayersInGame($gameId);

        // Check if the authenticated user is part of this game
        if (!$playersInGame->contains('id', Auth::id())) {
            return redirect()->route('lobby')->with('error', 'You are not part of this game.');
        }

        // Format players data as arrays
        $players = $playersInGame->map(function ($player) {
            return [
                'id' => $player->id,
                'name' => $player->name,
            ];
        })->values()->all();

        return Inertia::render('Multiplayer', [
            'auth' => [
                'user' => $request->user(),
            ],
            'gameId' => $gameId,
            'initialPlayers' => $players,
        ]);
    }
    public function leave(Request $request, string $gameId)
    {
        $players = $this->getPlayersInGame($gameId);

        // Remove the player from the game
        $updatedPlayers = $players->filter(function ($player) {
            return $player->id !== Auth::id();
        });

        // Update the cached players list
        cache()->put("game.{$gameId}.players", $updatedPlayers);

        // If the game is empty, clean up
        if ($updatedPlayers->isEmpty()) {
            cache()->forget("game.{$gameId}.players");
        }

        return response()->json(['success' => true]);
    }

    /**
     * Store the initial game state when a game starts.
     */
    public function storeInitialState(Request $request, string $gameId)
    {
        $validated = $request->validate([
            'gameState' => 'required|array',
            'playerStates' => 'required|array',
        ]);

        // Store the initial game state in cache
        cache()->put("game.{$gameId}.state", $validated['gameState']);
        cache()->put("game.{$gameId}.players.state", $validated['playerStates']);

        // Broadcast the initial state to all players
        broadcast(new GameStateUpdated($gameId, $validated['gameState'], $validated['playerStates']))->toOthers();

        return response()->json(['success' => true]);
    }

    /**
     * Update the game state during gameplay.
     */
    public function updateState(Request $request, string $gameId)
    {
        $validated = $request->validate([
            'gameState' => 'required|array',
            'playerState' => 'required|array',
        ]);

        // Update the game state in cache
        cache()->put("game.{$gameId}.state", $validated['gameState']);
        cache()->put("game.{$gameId}.players.state.{$request->user()->id}", $validated['playerState']);

        // Broadcast the state update to all players
        broadcast(new GameStateUpdated($gameId, $validated['gameState'], $validated['playerState']))->toOthers();

        return response()->json(['success' => true]);
    }
    public function storePlayers(Request $request, string $gameId)
    {
        $validated = $request->validate([
            'players' => 'required|array',
            'players.*.id' => 'required',
            'players.*.name' => 'required',
        ]);

        $players = collect($validated['players'])->map(function ($player) {
            return [
                'id' => $player['id'],
                'name' => $player['name']
            ];
        });

        // Store players in cache for the game
        cache()->put("game.{$gameId}.players", $players, now()->addHours(2));

        return response()->json(['success' => true]);
    }
}
