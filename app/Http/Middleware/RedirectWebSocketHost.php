<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RedirectWebSocketHost
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle($request, Closure $next)
    {
        // Check if the request host is 'wss.shed.id.lv'
        if ($request->getHost() === 'wss.shed.id.lv') {
            // Redirect to the WebSocket server running on local port 8080
            return redirect()->away('http://127.0.0.1:8080' . $request->getRequestUri());
        }

        return $next($request);
    }
}
