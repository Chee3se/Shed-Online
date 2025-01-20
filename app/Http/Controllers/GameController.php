<?php

namespace App\Http\Controllers;



use Illuminate\Http\Request;
use Inertia\Inertia;

class GameController
{

    public function index(Request $request, $code){

        return Inertia::render('Multiplayer');
    }
}
