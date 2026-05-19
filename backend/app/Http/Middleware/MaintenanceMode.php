<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\SiteSetting;
use Illuminate\Support\Facades\Auth;

class MaintenanceMode
{
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Toujours autoriser ces routes SANS AUCUNE condition
        // On utilise '*' pour être sûr de matcher
        if ($request->is('api/login') || $request->is('api/register') || $request->is('api/admin/*') || $request->is('api/logout')) {
            return $next($request);
        }

        // 2. Vérifier si on est en maintenance
        $maintenance = SiteSetting::where('key', 'maintenance_mode')->first();
        
        if ($maintenance && $maintenance->value === '1') {
            
            // 3. Essayer de voir si l'utilisateur est admin
            // On vérifie le token s'il est présent
            $user = Auth::guard('sanctum')->user();

            if ($user && $user->is_admin) {
                return $next($request);
            }

            // 4. Si c'est un étudiant ou un visiteur, on bloque
            $message = SiteSetting::where('key', 'maintenance_message')->first();
            $msgContent = $message ? $message->value : 'Le système est actuellement en maintenance pour une mise à jour.';

            return response()->json([
                'message' => $msgContent,
                'maintenance' => true
            ], 503);
        }

        return $next($request);
    }
}
