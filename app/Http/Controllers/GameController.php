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
        $request->validate([
            'code' => 'required|string',
        ]);

        $currentCode = $request->code;
        $previousCode = session('game_code');

        if ($currentCode !== $previousCode) {
            $response = Http::withOptions([
                'verify' => false,
            ])->get('https://deckofcardsapi.com/api/deck/new/shuffle/', [
                'deck_count' => 1,
            ]);

            $deck_id = $response->json()['deck_id'];

            Broadcast::presence('lobby.' . $currentCode)
                ->broadcastToEveryone()
                ->with(['deck_id' => $deck_id])
                ->as('deck-generated')
                ->sendNow();

            session(['game_code' => $currentCode]);
        }

        return;
    }

    public function draw(Request $request, $code)
    {
        $request->validate([
            'deck_id' => 'required|string',
            'count' => 'required|integer',
        ]);

        $response = Http::withOptions([
            'verify' => false,
        ])->get('https://deckofcardsapi.com/api/deck/'.$request->deck_id.'/draw/?count='.$request->count);

        $cards = $response->json()['cards'];

        Broadcast::presence('lobby.'.$code)
            ->toOthers()
            ->with(['cards' => count($cards), 'player_id' => auth()->id()])
            ->as('card-drawn')
            ->sendNow();

        return $cards;
    }

    public function play(Request $request, $code)
    {
        $request->validate([
            'cards' => 'required|array',
            'cards.*.code' => 'required|string',
            'next_player' => 'required|integer',
            'current_player' => 'required|integer' // Add this validation
        ]);

        $cards = $request->get('cards');
        $id = auth()->id();
        $currentPlayer = $request->get('current_player');
        $nextPlayer = $request->get('next_player');

        // Validate that it's actually this player's turn
        if ($currentPlayer !== $id) {
            return response()->json([
                'error' => 'Not your turn'
            ], 403);
        }

        // Get the lobby to validate the turn order
        $lobby = Lobby::where('code', $code)->first();
        if (!$lobby) {
            return response()->json([
                'error' => 'Invalid lobby'
            ], 404);
        }

        Broadcast::presence('lobby.' . $code)
            ->broadcastToEveryone()
            ->with([
                'cards' => $cards,
                'player_id' => $id,
                'next_player' => $nextPlayer,
                'current_player' => $currentPlayer
            ])
            ->as('card-played')
            ->sendNow();

        return response()->json([
            'success' => true,
            'next_player' => $nextPlayer
        ]);
    }

    public function take(Request $request, $code)
    {
        $request->validate([
            'cards' => 'required|array',
            'cards.*.code' => 'required|string',
            'next_player' => 'required|integer'
        ]);

        $cards = $request->get('cards');
        $id = auth()->id();
        $nextPlayer = $request->get('next_player');

        Broadcast::presence('lobby.' . $code)
            ->broadcastToEveryone() // Change from toOthers() to broadcastToEveryone()
            ->with([
                'cards' => $cards,
                'player_id' => $id,
                'next_player' => $nextPlayer
            ])
            ->as('card-taken')
            ->sendNow();

        return response()->json([
            'success' => true,
            'next_player' => $nextPlayer
        ]);
    }
}
