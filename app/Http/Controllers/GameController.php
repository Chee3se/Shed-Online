<?php

namespace App\Http\Controllers;



use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class GameController
{

    public function index(Request $request, $code){

        return Inertia::render('Multiplayer', [
            'code' => $code
        ]);
    }

    public function generateDeck(){

        $response = Http::get('https://deckofcardsapi.com/api/deck/new/shuffle/', [
            'deck_count' => 1
        ]);
        dd($response);
    }
}
