<?php

namespace App\Jobs;

use App\Events\NewLobby;
use App\Models\Lobby;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class CreateLobby implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(public Lobby $lobby)
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        NewLobby::dispatch(
            $this->lobby->id,
            $this->lobby->name,
            $this->lobby->owner_id,
            $this->lobby->is_public,
            $this->lobby->current_players,
            $this->lobby->max_players,
            $this->lobby->code
        );
    }
}
