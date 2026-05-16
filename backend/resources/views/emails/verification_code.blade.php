<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Code de vérification VibeAcademy</title>
</head>
<body style="margin:0;padding:0;background:#0a0a14;font-family:'Inter',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#13131f;border-radius:24px;border:1px solid rgba(139,92,246,0.2);overflow:hidden;box-shadow:0 30px 60px rgba(0,0,0,0.6);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#7000ff,#00d1ff);padding:40px 48px;text-align:center;">
      <div style="width:60px;height:60px;background:rgba(255,255,255,0.15);border-radius:16px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
        <span style="font-size:28px;">🎓</span>
      </div>
      <h1 style="margin:0;color:#fff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">VibeAcademy</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:14px;">Vérification de votre compte</p>
    </div>

    <!-- Body -->
    <div style="padding:48px;">
      <p style="color:#94a3b8;font-size:15px;margin:0 0 8px;">Bonjour <strong style="color:#fff;">{{ $userName }}</strong>,</p>
      <p style="color:#94a3b8;font-size:15px;margin:0 0 32px;line-height:1.6;">
        Merci de rejoindre VibeAcademy ! Pour activer votre compte, veuillez entrer le code de vérification ci-dessous dans l'application.
      </p>

      <!-- Code Box -->
      <div style="background:rgba(112,0,255,0.08);border:2px solid rgba(112,0,255,0.3);border-radius:16px;padding:32px;text-align:center;margin-bottom:32px;">
        <p style="color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin:0 0 16px;">Votre code de vérification</p>
        <div style="font-size:48px;font-weight:900;letter-spacing:16px;color:#fff;font-family:monospace;">{{ $code }}</div>
        <p style="color:#64748b;font-size:12px;margin:16px 0 0;">⏱️ Ce code expire dans <strong style="color:#f59e0b;">15 minutes</strong></p>
      </div>

      <div style="background:rgba(248,113,113,0.06);border:1px solid rgba(248,113,113,0.2);border-radius:12px;padding:16px 20px;margin-bottom:32px;">
        <p style="color:#f87171;font-size:13px;margin:0;">⚠️ <strong>Ne partagez jamais ce code.</strong> VibeAcademy ne vous demandera jamais votre code par téléphone ou email.</p>
      </div>

      <p style="color:#64748b;font-size:13px;margin:0;line-height:1.6;">
        Si vous n'avez pas créé de compte sur VibeAcademy, ignorez cet email. Aucune action n'est requise.
      </p>
    </div>

    <!-- Footer -->
    <div style="padding:24px 48px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
      <p style="color:#475569;font-size:12px;margin:0;">© 2026 VibeAcademy — Tous droits réservés</p>
    </div>
  </div>
</body>
</html>
