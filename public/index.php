<?php

use Illuminate\Http\Request;

if (isset($_SERVER['HTTP_CONNECTION']) && $_SERVER['HTTP_CONNECTION'] === 'Upgrade') {
    header('HTTP/1.1 101 Switching Protocols');
    header('Upgrade: websocket');
    exit;
}

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
(require_once __DIR__.'/../bootstrap/app.php')
    ->handleRequest(Request::capture());
