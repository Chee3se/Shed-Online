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

            $response = Http::withOptions([
                'verify' => false,
            ])->get('https://deckofcardsapi.com/api/deck/new/shuffle/', [
                'deck_count' => 1,
            ]);

            if ($response->failed()) {
                return response()->json(['error' => 'Failed to create deck'], 500);
            }

            $deckId = $response->json()['deck_id'];


            $players = $request->input('players');
            if (empty($players)) {
                return response()->json(['error' => 'No players provided'], 400);
            }

            $cardsPerPlayer = 9;
            $dealtCards = [];

            foreach ($players as $player) {
                $drawResponse = Http::withOptions([
                    'verify' => false,
                ])->get("https://deckofcardsapi.com/api/deck/{$deckId}/draw/", [
                    'count' => $cardsPerPlayer,
                ]);

                if ($drawResponse->failed()) {
                    return response()->json(['error' => 'Failed to draw cards'], 500);
                }

                $cards = $drawResponse->json()['cards'];


                $dealtCards[$player] = [
                    'face_down' => array_slice($cards, 0, 3),
                    'face_up' => array_slice($cards, 3, 3),
                    'in_hand' => array_slice($cards, 6, 3),
                ];
            }


            return response()->json([
                'deck_id' => $deckId,
                'dealt_cards' => $dealtCards,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Internal Server Error'], 500);
        }
    }
}
