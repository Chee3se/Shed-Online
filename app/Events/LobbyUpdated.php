<?php

namespace App\Events;

use App\Models\Lobby;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LobbyUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $lobby;

    public function __construct(Lobby $lobby)
    {
        $this->lobby = $lobby;
    }

    public function broadcastOn()
    {
        return new Channel('lobbies');
    }

    public function broadcastWith()
    {
        return [
            'lobby_id' => $this->lobby->id,
            'current_players' => $this->lobby->current_players,
            'players' => $this->lobby->players->map(function ($player) {
                return [
                    'id' => $player->id,
                    'name' => $player->name
                ];
            })
        ];
    }
}
