<?php

namespace App\Http\Controllers;

use App\Models\Lobby;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;

class LobbyController
{
    use AuthorizesRequests;

    public function index()
    {
        $lobbies = Lobby::where('is_public', true)
            ->whereColumn('current_players', '<', 'max_players')
            ->latest()
            ->get();
        return Inertia::render('Lobby', [
            'lobbies' => $lobbies->map(fn($lobby) => [
                'id' => $lobby->id,
                'name' => $lobby->name,
                'owner_id' => $lobby->owner_id,
                'is_public' => $lobby->is_public,
                'current_players' => $lobby->current_players,
                'max_players' => $lobby->max_players,
                'code' => $lobby->code
            ]),
            'owners' => User::whereIn('id', $lobbies->pluck('owner_id'))->pluck('name', 'id')
        ]);
    }


    public function create()
    {
        return Inertia::render('CreateLobby');
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'max_players' => 'required|integer|min:2|max:6',
            'is_public' => 'boolean',
            'password' => $request->is_public ? 'nullable' : 'required|string|min:4',
        ]);

        // Generate a unique lobby code
        $lobbyCode = Str::random(6);

        $lobby = Lobby::create([
            'name' => $validatedData['name'],
            'owner_id' => auth()->id(),
            'max_players' => $validatedData['max_players'],
            'current_players' => 1,
            'is_public' => $validatedData['is_public'],
            'password' => $validatedData['is_public'] ? null : Hash::make($validatedData['password']),
            'code' => $lobbyCode,
        ]);

        // Automatically join the lobby
        $lobby->players()->attach(auth()->id());

        // Redirect to the lobby show page
        return redirect()->route('lobby.show', $lobby);
    }

    public function show(Lobby $lobby)
    {
        // Check if user is allowed to view the lobby
        $this->authorize('view', $lobby);

        return Inertia::render('LobbyShow', [
            'lobby' => $lobby->load('owner', 'players'),
            'canJoin' => $lobby->canJoin(auth()->user()),
        ]);
    }

}
