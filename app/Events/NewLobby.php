<?php

namespace App\Events;

use App\Models\Lobby;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewLobby implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public $lobby;
    public function __construct(Lobby $lobby)
    {
        $this->lobby = $lobby;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('lobbies'),
        ];
    }
    public function broadcastAs(): string
    {
        return 'new-lobby';
    }
    public function broadcastWith(): array
    {
        return [
            'id' => $this->lobby->id,
            'name' => $this->lobby->name,
            'owner_id' => $this->lobby->owner_id,
            'is_public' => $this->lobby->is_public,
            'current_players' => $this->lobby->current_players,
            'max_players' => $this->lobby->max_players,
            'code' => $this->lobby->code
        ];
    }
}
