<?php

namespace App\Http\Controllers;



use Illuminate\Http\Request;

class GameController
{

    public function index(Request $request,$code){
        dd($request->players);
        return inertia('Multiplayer');
    }
}
