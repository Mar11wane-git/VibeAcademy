<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Mail\VerificationCodeMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    /**
     * Step 1: Register — create user (unverified) & send code
     */
    public function register(Request $request)
    {
        $data = $request->validate([
            'name'     => 'required|string|min:3|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
        ], [
            'name.required'     => 'Le nom est requis.',
            'name.min'          => 'Le nom doit contenir au moins 3 caractères.',
            'email.required'    => "L'adresse e-mail est requise.",
            'email.email'       => "L'adresse e-mail n'est pas valide.",
            'email.unique'      => 'Cette adresse e-mail est déjà utilisée.',
            'password.required' => 'Le mot de passe est requis.',
            'password.min'      => 'Le mot de passe doit contenir au moins 8 caractères.',
        ]);

        // Generate 6-digit code
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $user = User::create([
            'name'                        => $data['name'],
            'email'                       => $data['email'],
            'password'                    => Hash::make($data['password']),
            'email_verification_code'     => $code,
            'verification_code_expires_at'=> now()->addMinutes(15),
            'email_verified_at'           => null,
        ]);

        // Send verification email
        try {
            Mail::to($user->email)->send(new VerificationCodeMail($code, $user->name));
        } catch (\Exception $e) {
            // Log error but don't block — code is stored in DB
            \Log::error('Mail send failed: ' . $e->getMessage());
        }

        return response()->json([
            'message'    => 'Un code de vérification a été envoyé à ' . $user->email,
            'email'      => $user->email,
            'needs_verification' => true,
        ], 201);
    }

    /**
     * Step 2: Verify the 6-digit code → activate account & return token
     */
    public function verifyEmail(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'code'  => 'required|string|size:6',
        ], [
            'email.required' => "L'adresse e-mail est requise.",
            'code.required'  => 'Le code de vérification est requis.',
            'code.size'      => 'Le code doit contenir exactement 6 chiffres.',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (!$user) {
            return response()->json(['message' => 'Utilisateur introuvable.'], 404);
        }

        if ($user->email_verified_at) {
            return response()->json(['message' => 'Ce compte est déjà vérifié.'], 400);
        }

        if ($user->email_verification_code !== $data['code']) {
            return response()->json(['message' => 'Code de vérification incorrect.'], 422);
        }

        if ($user->verification_code_expires_at && now()->gt($user->verification_code_expires_at)) {
            return response()->json(['message' => 'Ce code a expiré. Veuillez vous réinscrire.'], 422);
        }

        // Activate the account
        $user->update([
            'email_verified_at'            => now(),
            'email_verification_code'      => null,
            'verification_code_expires_at' => null,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Compte vérifié avec succès ! Bienvenue sur VibeAcademy 🎉',
            'user'    => $user,
            'token'   => $token,
        ]);
    }

    /**
     * Resend verification code
     */
    public function resendCode(Request $request)
    {
        $data = $request->validate(['email' => 'required|email']);
        $user = User::where('email', $data['email'])->whereNull('email_verified_at')->first();

        if (!$user) {
            return response()->json(['message' => 'Utilisateur introuvable ou déjà vérifié.'], 404);
        }

        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $user->update([
            'email_verification_code'      => $code,
            'verification_code_expires_at' => now()->addMinutes(15),
        ]);

        try {
            Mail::to($user->email)->send(new VerificationCodeMail($code, $user->name));
        } catch (\Exception $e) {
            \Log::error('Mail resend failed: ' . $e->getMessage());
        }

        return response()->json(['message' => 'Un nouveau code a été envoyé à ' . $user->email]);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ], [
            'email.required'    => "L'adresse e-mail est requise.",
            'email.email'       => "L'adresse e-mail n'est pas valide.",
            'password.required' => 'Le mot de passe est requis.',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'E-mail ou mot de passe incorrect. Vérifiez vos identifiants.'], 401);
        }

        // Block unverified accounts
        if (!$user->email_verified_at) {
            return response()->json([
                'message'            => 'Votre compte n\'est pas encore vérifié. Veuillez vérifier votre e-mail.',
                'needs_verification' => true,
                'email'              => $user->email,
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnecté avec succès.']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'name'     => 'sometimes|string|max:255',
            'email'    => 'sometimes|email|unique:users,email,' . $user->id,
            'password' => ['sometimes', 'confirmed', Password::min(8)->letters()->mixedCase()->numbers()->symbols()],
        ]);

        if (isset($data['name']))     $user->name     = $data['name'];
        if (isset($data['email']))    $user->email    = $data['email'];
        if (isset($data['password'])) $user->password = Hash::make($data['password']);

        $user->save();

        return response()->json([
            'message' => 'Profil mis à jour avec succès.',
            'user'    => $user,
        ]);
    }
}
