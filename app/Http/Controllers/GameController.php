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

    public function generateDeck(Request $request)
    {
        $response = Http::withOptions([
            'verify' => false,
        ])->get('https://deckofcardsapi.com/api/deck/new/shuffle/', [
            'deck_count' => 1,
        ]);

        $deck_id = $response->json()['deck_id'];

        Broadcast::presence('lobby.'.$request->code)
            ->broadcastToEveryone()
            ->with(['deck_id' => $deck_id])
            ->as('deck-generated')
            ->sendNow();
    }

    public function draw(Request $request, $code){

        $response = Http::withOptions([
            'verify' => false,
        ])->get('https://deckofcardsapi.com/api/deck/'.$request->deck_id.'/draw/?count='.$request->count);

        $cards = $response->json()['cards'];

        Broadcast::presence('lobby.'.$request->code)
            ->toOthers()
            ->with(['cards' => $cards->count()])
            ->as('card-drawn')
            ->sendNow();

        return $cards;
    }
}
