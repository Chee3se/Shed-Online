<?php

namespace App\Http\Controllers;



use App\Models\Lobby;
use Illuminate\Http\Request;
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
        try {
            // Step 1: Create a new shuffled deck
            $response = Http::withOptions([
                'verify' => false, // Disable SSL verification for development
            ])->get('https://deckofcardsapi.com/api/deck/new/shuffle/', [
                'deck_count' => 1,
            ]);

            if ($response->failed()) {
                return response()->json(['error' => 'Failed to create deck'], 500);
            }

            $deckId = $response->json()['deck_id'];

            // Step 2: Deal cards to players
            $players = $request->input('players'); // Array of player IDs
            if (empty($players)) {
                return response()->json(['error' => 'No players provided'], 400);
            }

            $cardsPerPlayer = 9; // 3 face-down, 3 face-up, 3 in-hand
            $dealtCards = [];

            foreach ($players as $player) {
                // Draw cards for each player
                $drawResponse = Http::withOptions([
                    'verify' => false,
                ])->get("https://deckofcardsapi.com/api/deck/{$deckId}/draw/", [
                    'count' => $cardsPerPlayer,
                ]);

                if ($drawResponse->failed()) {
                    return response()->json(['error' => 'Failed to draw cards'], 500);
                }

                $cards = $drawResponse->json()['cards'];

                // Split cards into face-down, face-up, and in-hand
                $dealtCards[$player] = [
                    'face_down' => array_slice($cards, 0, 3),
                    'face_up' => array_slice($cards, 3, 3),
                    'in_hand' => array_slice($cards, 6, 3),
                ];
            }

            // Step 3: Return the dealt cards and deck ID
            return response()->json([
                'deck_id' => $deckId,
                'dealt_cards' => $dealtCards,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Internal Server Error'], 500);
        }
    }
}
