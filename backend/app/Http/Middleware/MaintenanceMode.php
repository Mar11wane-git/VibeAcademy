<?php

/**
 * MR1Academy MaintenanceMode Middleware
 */
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\SiteSetting;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class MaintenanceMode
{
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Toujours autoriser ces routes SANS AUCUNE condition
        // On utilise '*' pour être sûr de matcher
        if ($request->is('api/login') || $request->is('api/register') || $request->is('api/admin/*') || $request->is('api/logout')) {
            return $next($request);
        }

        // 2. Vérifier si on est en maintenance (avec cache rapide de 15s pour éviter 1 requête SQL par appel API)
        $isMaintenance = Cache::remember('vibe_maintenance_mode_flag', 15, function () {
            $setting = SiteSetting::where('key', 'maintenance_mode')->first();
            return $setting && $setting->value === '1';
        });
        
        if ($isMaintenance) {
            
            // 3. Essayer de voir si l'utilisateur est admin
            // On vérifie le token s'il est présent
            $user = Auth::guard('sanctum')->user();

            if ($user && $user->is_admin) {
                return $next($request);
            }

            // 4. Si c'est un étudiant ou un visiteur, on bloque
            $msgContent = Cache::remember('vibe_maintenance_msg', 15, function () {
                $message = SiteSetting::where('key', 'maintenance_message')->first();
                return $message ? $message->value : 'Le système est actuellement en maintenance pour une mise à jour.';
            });

            return response()->json([
                'message' => $msgContent,
                'maintenance' => true
            ], 503);
        }

        return $next($request);
    }
}
