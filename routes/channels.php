<?php

use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

//Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
//    return (int) $user->id === (int) $id;
//});

Broadcast::channel('lobbies', function ($user) {return true;});

Broadcast::channel('lobby.{code}', function (User $user, string $code) {
    return ['id' => $user->id, 'name' => $user->name];
});


