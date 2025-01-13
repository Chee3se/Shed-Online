<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PlayerReadyStatusChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $playerId;
    public $status;
    public $lobbyCode;

    /**
     * Create a new event instance.
     *
     * @param string $lobbyCode
     * @param int $playerId
     * @param string $status
     */
    public function __construct($lobbyCode, $playerId, $status)
    {
        $this->lobbyCode = $lobbyCode;
        $this->playerId = $playerId;
        // Normalize status to ensure consistency
        $this->status = $status === 'not ready' ? 'not ready' : $status;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        return new PrivateChannel("lobby.{$this->lobbyCode}");
    }

    /**
     * Get the data to broadcast.
     *
     * @return array
     */
    public function broadcastWith()
    {
        return [
            'playerId' => $this->playerId,
            'status' => $this->status,
            'lobbyCode' => $this->lobbyCode
        ];
    }
}
