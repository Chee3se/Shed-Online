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
            $remainingCount = $response->json()['remaining'];


            return response()->json([
                'deck_id' => $deckId,
                'remaining' => $remainingCount,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Internal Server Error'], 500);
        }
    }
}
