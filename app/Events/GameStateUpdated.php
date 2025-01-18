<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GameStateUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $gameId;
    public $gameState;
    public $playerState;

    public function __construct($gameId, $gameState, $playerState)
    {
        $this->gameId = $gameId;
        $this->gameState = $gameState;
        $this->playerState = $playerState;
    }

    public function broadcastOn()
    {
        return new PresenceChannel('game.' . $this->gameId);
    }

    public function broadcastAs()
    {
        return 'game-state-updated';
    }
}
