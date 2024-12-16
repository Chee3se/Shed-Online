<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lobby extends Model
{
    protected $fillable = [
        'name',
        'owner_id',
        'is_public',
        'current_players',
        'max_players',
        'code'
    ];
}
