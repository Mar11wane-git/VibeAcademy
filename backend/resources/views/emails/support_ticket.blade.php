<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Nouveau Ticket Support — MR1Academy</title>
</head>
<body style="margin:0;padding:0;background:#090d16;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e2e8f0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#090d16;padding:36px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:620px;background:#101726;border-radius:20px;border:1px solid #1e293b;box-shadow:0 25px 50px -12px rgba(0,0,0,0.7);overflow:hidden;">
          
          <!-- En-tête MR1Academy -->
          <tr>
            <td style="background:linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #06b6d4 100%);padding:32px 36px;text-align:left;">
              <table role="presentation" width="100%">
                <tr>
                  <td>
                    <div style="display:inline-block;padding:8px 14px;background:rgba(255,255,255,0.18);backdrop-filter:blur(10px);border-radius:12px;color:#ffffff;font-size:12px;font-weight:800;letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;">
                      ⚡ Centre de Support MR1Academy
                    </div>
                    <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:900;letter-spacing:-0.5px;">
                      Nouveau Ticket Reçu
                    </h1>
                    <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">
                      Un étudiant a soumis une nouvelle demande d'assistance sur la plateforme.
                    </p>
                  </td>
                  <td align="right" valign="top" style="width:70px;">
                    <div style="width:54px;height:54px;border-radius:16px;background:rgba(255,255,255,0.2);display:inline-flex;align-items:center;justify-content:center;text-align:center;line-height:54px;font-size:26px;">
                      📬
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Contenu principal -->
          <tr>
            <td style="padding:36px;">
              
              <!-- Badges Référence & Priorité -->
              <table role="presentation" width="100%" style="margin-bottom:24px;">
                <tr>
                  <td style="background:#172033;border:1px solid #334155;border-radius:12px;padding:12px 18px;">
                    <span style="color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;display:block;">Numéro de Référence</span>
                    <strong style="color:#38bdf8;font-size:16px;font-family:monospace;letter-spacing:1px;">{{ $ticket['ticket_ref'] ?? 'MR1-TICK' }}</strong>
                  </td>
                  <td style="width:12px;"></td>
                  <td style="background:#172033;border:1px solid #334155;border-radius:12px;padding:12px 18px;">
                    <span style="color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;display:block;">Priorité déclarée</span>
                    <strong style="color:{{ in_array(strtolower($ticket['priority'] ?? ''), ['urgent', 'urgente', 'haute', 'high']) ? '#f43f5e' : '#10b981' }};font-size:15px;text-transform:capitalize;">
                      ● {{ $ticket['priority'] ?? 'Normale' }}
                    </strong>
                  </td>
                </tr>
              </table>

              <!-- Informations de l'Étudiant -->
              <div style="background:#131c2e;border:1px solid #1e293b;border-radius:14px;padding:20px;margin-bottom:24px;">
                <h3 style="margin:0 0 14px;color:#f8fafc;font-size:13px;text-transform:uppercase;letter-spacing:1px;">👤 Informations de l'expéditeur</h3>
                
                <table role="presentation" width="100%" style="font-size:14px;">
                  <tr>
                    <td style="padding:5px 0;color:#94a3b8;width:120px;">Nom complet :</td>
                    <td style="padding:5px 0;color:#ffffff;font-weight:700;">{{ $ticket['name'] }}</td>
                  </tr>
                  <tr>
                    <td style="padding:5px 0;color:#94a3b8;">Adresse email :</td>
                    <td style="padding:5px 0;">
                      <a href="mailto:{{ $ticket['email'] }}" style="color:#38bdf8;text-decoration:none;font-weight:600;">{{ $ticket['email'] }}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:5px 0;color:#94a3b8;">Département :</td>
                    <td style="padding:5px 0;color:#cbd5e1;">{{ $ticket['category'] ?? 'Support Technique' }}</td>
                  </tr>
                  <tr>
                    <td style="padding:5px 0;color:#94a3b8;">Date d'envoi :</td>
                    <td style="padding:5px 0;color:#94a3b8;font-size:13px;">{{ now()->locale('fr')->isoFormat('D MMMM YYYY à HH:mm') }}</td>
                  </tr>
                </table>
              </div>

              <!-- Sujet & Message -->
              <div style="margin-bottom:28px;">
                <span style="color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:700;display:block;margin-bottom:8px;">Sujet du ticket</span>
                <div style="font-size:18px;font-weight:800;color:#ffffff;line-height:1.4;margin-bottom:16px;">
                  {{ $ticket['subject'] }}
                </div>

                <span style="color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:700;display:block;margin-bottom:8px;">Message de l'étudiant</span>
                <div style="background:#0b1120;border:1px solid #24324a;border-left:4px solid #6366f1;border-radius:12px;padding:22px;color:#e2e8f0;font-size:15px;line-height:1.7;white-space:pre-wrap;word-break:break-word;">
{{ $ticket['message'] }}
                </div>
              </div>

              <!-- Bouton d'action directe -->
              <div style="text-align:center;margin:32px 0 16px;">
                <a href="mailto:{{ $ticket['email'] }}?subject={{ rawurlencode('Re: [MR1Academy Ticket #' . ($ticket['ticket_ref'] ?? '') . '] ' . ($ticket['subject'] ?? '')) }}"
                   style="display:inline-block;background:linear-gradient(135deg, #6366f1, #8b5cf6);color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:12px;box-shadow:0 10px 20px -5px rgba(99,102,241,0.5);">
                  ✉️ Répondre directement à {{ $ticket['name'] }}
                </a>
                <p style="color:#64748b;font-size:12px;margin-top:10px;">
                  (Vous pouvez aussi simplement cliquer sur « Répondre » dans Gmail)
                </p>
              </div>

            </td>
          </tr>

          <!-- Pied de page -->
          <tr>
            <td style="background:#0b1120;border-top:1px solid #1e293b;padding:22px 36px;text-align:center;">
              <p style="margin:0;color:#64748b;font-size:12px;">
                Notification automatique générée par la plateforme <strong>MR1Academy</strong> pour l'administrateur Marouane El Hamdaoui.
              </p>
              <p style="margin:6px 0 0;color:#475569;font-size:11px;">
                © {{ date('Y') }} MR1Academy — Tous droits réservés.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
