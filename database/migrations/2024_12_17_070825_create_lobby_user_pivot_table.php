<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateLobbyUserPivotTable extends Migration
{
    public function up()
    {
        Schema::create('lobby_user', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('lobby_id');
            $table->unsignedBigInteger('user_id');
            $table->timestamps();

            $table->foreign('lobby_id')->references('id')->on('lobbies')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            $table->unique(['lobby_id', 'user_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('lobby_user');
    }
}
