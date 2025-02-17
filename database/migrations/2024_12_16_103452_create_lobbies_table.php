<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('lobbies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('password')->nullable();
            $table->integer('max_players');
            $table->integer('current_players')->default(0);
            $table->foreignId('owner_id')->constrained('users');
            $table->string('code')->unique();
            $table->boolean('is_public')->default(true);
            $table->timestamps();
        });
        Schema::table('lobbies', function (Blueprint $table) {
            $table->timestamp('join_timestamp')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lobbies');
        Schema::table('lobbies', function (Blueprint $table) {
            $table->dropColumn('join_timestamp');
        });
    }
};
