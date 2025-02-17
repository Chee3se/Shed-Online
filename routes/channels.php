<?php

use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

//Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
//    return (int) $user->id === (int) $id;
//});

Broadcast::channel('lobbies', function ($user) {return true;});

Broadcast::channel('lobby.{code}', function (User $user, string $code) {
    $lobby = \App\Models\Lobby::where('code', $code)->first();

    if (!$lobby) {
        return false;
    }

    // Track the first join
    if ($lobby->current_players === 0) {
        $lobby->update(['join_timestamp' => now()]);
    }

    // Check if the lobby is abandoned after a delay
    if ($lobby->join_timestamp && $lobby->join_timestamp->addMinutes(5) < now() && $lobby->current_players === 0) {
        $lobby->delete();
        return false;
    }

    return [
        'id' => $user->id,
        'name' => $user->name
    ];
});


