<?php

namespace App\Http\Controllers;

use App\Events\NewLobby;
use App\Events\LobbyDeleted;
use App\Jobs\CreateLobby;
use App\Models\Lobby;
use App\Models\LobbyUsers;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Events\LobbyUpdated;
use Illuminate\Support\Facades\DB;


class LobbyController
{
    use AuthorizesRequests;

    public function index()
    {
        $lobbies = Lobby::where('is_public', true)
            ->whereColumn('current_players', '<', 'max_players')
            ->latest()
            ->get();

        $currentUserLobby = Lobby::whereHas('players', function($query) {
            $query->where('user_id', auth()->id());
        })->first();

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
            'owners' => User::whereIn('id', $lobbies->pluck('owner_id'))->pluck('name', 'id'),
            'currentUserLobby' => $currentUserLobby ? [
                'id' => $currentUserLobby->id,
                'name' => $currentUserLobby->name,
                'code' => $currentUserLobby->code
            ] : null
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

        // Broadcast new lobby creation
        broadcast(new NewLobby($lobby))->toOthers();

        // Redirect to the lobby show page
        return redirect()->route('lobby.show', $lobby->code);
    }

    public function show($code)
    {
        $lobby = Lobby::where('code', $code)->firstOrFail();
        return Inertia::render('LobbyShow', [
            'lobby' => $lobby->load('players'), // Eager load players
            'canJoin' => $lobby->current_players < $lobby->max_players,
            'owners' => User::whereIn('id', [$lobby->owner_id])->pluck('name', 'id')
        ]);
    }

    public function join(Request $request, $code)
    {

        $lobby = Lobby::where('code', $code)->firstOrFail();
        $user = Auth::user();

        // Check if lobby is full
        if ($lobby->current_players >= $lobby->max_players) {
            return back()->with('error', 'Lobby is full');
        }

        // Check if user is already in the lobby
        if ($lobby->players()->where('user_id', $user->id)->exists()) {
            return redirect()->route('lobby.show', $lobby->code);
        }

        // Attach user to lobby
        $lobby->players()->attach($user->id);

        // Update current players count
        $lobby->increment('current_players');

        // Broadcast lobby update
        broadcast(new LobbyUpdated($lobby))->toOthers();

        // Redirect to lobby show page
        return redirect()->route('lobby.show', $lobby->code);
    }

    public function leave($code)
    {
        $lobby = Lobby::where('code', $code)->firstOrFail();
        $user = Auth::user();

        // Check if user is in the lobby
        if (!$lobby->players()->where('user_id', $user->id)->exists()) {
            return redirect()->route('lobby')->with('error', 'You are not in this lobby');
        }

        // If user is the owner, delete the entire lobby
        if ($lobby->owner_id === $user->id) {
            // Remove all players
            $lobby->players()->detach();

            // Broadcast lobby deletion
            broadcast(new LobbyDeleted($lobby))->toOthers();

            // Delete the lobby
            $lobby->delete();

            return redirect()->route('lobby')->with('success', 'Lobby deleted');
        }

        // If user is not the owner, just remove them from the lobby
        $lobby->players()->detach($user->id);

        // Decrement current players count
        $lobby->decrement('current_players');

        // Broadcast lobby update
        broadcast(new LobbyUpdated($lobby))->toOthers();

        return redirect()->route('lobby')->with('success', 'Left lobby');
    }


    public function toggleReady(string $code)
    {
        $lobby = Lobby::where('code', $code)->firstOrFail();
        $player = auth()->user();

        // Get the current player's lobby membership
        $playerLobby = $player->lobbies()
            ->where('lobby_id', $lobby->id)
            ->firstOrFail();

        // Toggle the status between 'ready' and 'not_ready' with proper string values
        $newStatus = $playerLobby->pivot->status === 'ready' ? 'not ready' : 'ready';

        // Update the status ensuring it's passed as a string
        $player->lobbies()->updateExistingPivot($lobby->id, [
            'status' => $newStatus
        ]);

        return redirect()->back();
    }



}
