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
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function players() {
        return $this->belongsToMany(User::class, 'lobby_users', 'lobby_id', 'user_id')->withPivot('status');
    }

    // Ensure players are detached when lobby is deleted
    protected static function booted()
    {
        static::deleting(function ($lobby) {
            $lobby->players()->detach();
        });
    }

}
