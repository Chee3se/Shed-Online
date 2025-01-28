<?php

namespace App\Http\Controllers;



use App\Models\Lobby;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class GameController
{

    public function index(Request $request, $code){

        $lobby = Lobby::where('code', $code)->first();

        return Inertia::render('Multiplayer', [
            'code' => $code,
            'lobby' => $lobby
        ]);
    }

    public function generateDeck(Request $request, $code)
    {

        $response = Http::withOptions([
                'verify' => false,
        ])->get('https://deckofcardsapi.com/api/deck/new/shuffle/', [
                'deck_count' => 1,
        ]);

        $deckId = $response->json()['deck_id'];

        Broadcast::on('lobby.'. $code)->as('generate-deck')->with($deckId)->sendNow();

    }
}
