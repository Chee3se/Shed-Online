<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LobbyUsers extends Model
{
    protected $fillable = [
        'lobby_id',
        'user_id'
    ];
}
