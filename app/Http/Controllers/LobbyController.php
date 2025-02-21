<?php

namespace App\Http\Controllers;

use App\Events\NewLobby;
use App\Events\LobbyDeleted;

use App\Models\Lobby;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\URL;
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

        $currentUserLobby = Lobby::where('owner_id', auth()->id())->first();

        return Inertia::render('Lobby', [
            'lobbies' => $lobbies ? $lobbies->map(fn($lobby) => [
                'id' => $lobby->id,
                'name' => $lobby->name,
                'owner_id' => $lobby->owner_id,
                'is_public' => $lobby->is_public,
                'current_players' => $lobby->current_players,
                'max_players' => $lobby->max_players,
                'code' => $lobby->code
            ]) : [],
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
            'current_players' => 0,
            'is_public' => $validatedData['is_public'],
            'password' => $validatedData['is_public'] ? null : Hash::make($validatedData['password']),
            'code' => $lobbyCode,
        ]);

        // Broadcast new lobby creation
        // OLD - broadcast(new NewLobby($lobby))->toOthers();
        Broadcast::on('lobbies')
            ->toOthers()
            ->with($lobby)
            ->as('new-lobby')
            ->sendNow();

        // Redirect to the lobby show page
        return redirect()->route('lobby.show', $lobby->code);
    }

    public function show(Request $request, $code)
    {
        $lobby = Lobby::where('code', $code)->firstOrFail();

        // Only increment if coming from a different URL
        if (Request::create(URL::previous())->url() !== $request->url()) {
            $lobby->increment('current_players');
            $lobby->update(['leave_timestamp' => null]); // Reset leave timestamp

            Broadcast::on('lobbies')
                ->toOthers()
                ->with($lobby)
                ->as('lobby-updated')
                ->sendNow();
        }

        return Inertia::render('LobbyShow', [
            'initialLobby' => $lobby,
            'canJoin' => $lobby->current_players < $lobby->max_players,
            'owners' => User::whereIn('id', [$lobby->owner_id])->pluck('name', 'id')
        ]);
    }

    public function leave($code)
    {
        $lobby = Lobby::where('code', $code)->firstOrFail();
        $lobby->decrement('current_players');

        // If this is from game start, or last player leaves, delete the lobby
        if ($lobby->current_players === 0 || request()->has('game_starting')) {
            $lobby->delete();
        } else {
            // Otherwise just set leave timestamp
            $lobby->update(['leave_timestamp' => now()]);
        }

        Broadcast::on('lobbies')
            ->toOthers()
            ->with($lobby)
            ->as('lobby-updated')
            ->sendNow();

        if (request()->has('game_starting')) {
            return response()->json(['success' => true]);
        }

        return redirect()->route('lobby')->with('success', 'Left lobby');
    }
    public function delete(string $code)
    {
        $lobby = Lobby::where('code', $code)->first();

        if ($lobby) {
            $lobby->delete();
            return response()->json(['message' => 'Lobby deleted']);
        }

        return response()->json(['message' => 'Lobby not found'], 404);
    }

    public function updateStatus(Request $request, $code)
    {
        $lobby = Lobby::where('code', $code)->firstOrFail();
        $lobby->is_public = $request->status;
        $lobby->save();

        return response()->json(['status' => 'success']);
    }



}
