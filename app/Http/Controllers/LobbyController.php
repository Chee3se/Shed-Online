<?php

namespace App\Http\Controllers;

use App\Models\Lobby;
use App\Models\User;
use Inertia\Inertia;

class LobbyController
{

    public function index()
    {
        $lobbies = Lobby::where('is_public', true)
            ->where('current_players', '<', 'max_players')
            ->latest()
            ->get();
        return Inertia::render('Lobby', [
            'lobbies' => $lobbies->map(function ($lobby) {
                return [
                    'id' => $lobby->id,
                    'name' => $lobby->name,
                    'owner_id' => $lobby->owner_id,
                    'is_public' => $lobby->is_public,
                    'current_players' => $lobby->current_players,
                    'max_players' => $lobby->max_players,
                    'code' => $lobby->code
                ];
            }),
            'owners' => User::whereIn('id', $lobbies->pluck('owner_id'))
                ->pluck('name', 'id')
        ]);
    }

}
