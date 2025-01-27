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
        if (Request::create(URL::previous())->url() !== $request->url()) {
            $lobby->increment('current_players');
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
        $user = auth()->user();

        // If user is the owner, delete the entire lobby
        if ($lobby->owner_id === $user->id) {
            Broadcast::on('lobbies')
                ->toOthers()
                ->with($lobby)
                ->as('lobby-deleted')
                ->sendNow();
            $lobby->delete();
            return redirect()->route('lobby')->with('success', 'Lobby deleted');
        }

        // Decrement current players count
        $lobby->decrement('current_players');

        // Broadcast lobby update
        Broadcast::on('lobbies')
            ->toOthers()
            ->with($lobby)
            ->as('lobby-updated')
            ->sendNow();

        return redirect()->route('lobby')->with('success', 'Left lobby');
    }



}
