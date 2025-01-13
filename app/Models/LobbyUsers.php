<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class LobbyUsers extends Model
{
    protected $fillable = [
        'lobby_id',
        'user_id',
        'status'
    ];
    public function up()
    {
        Schema::table('lobby_users', function (Blueprint $table) {
            if (!Schema::hasColumn('lobby_users', 'status')) {
                $table->string('status')->default('not ready')->check("status IN ('ready', 'not ready')");
            }
        });
    }

    public function down()
    {
        Schema::table('lobby_users', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
}
