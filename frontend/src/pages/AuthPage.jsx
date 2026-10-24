import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, LogIn, UserPlus, Mail, RotateCcw, CheckCircle2, ArrowLeft, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { useApp } from '../context/AppContext';
import VibeLogo from '../components/VibeLogo';

// ─── Mobile-Friendly OTP Input Component ──────────────────────────────────
const OTPInput = ({ value, onChange }) => {
  const inputs = useRef([]);
  const digits = (value || '').split('').slice(0, 6);

  const handleInputChange = (e, i) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    if (!rawVal) {
      const next = [...digits];
      next[i] = '';
      onChange(next.join(''));
      return;
    }

    if (rawVal.length > 1) {
      const pastedDigits = rawVal.slice(0, 6).split('');
      const next = [...digits];
      pastedDigits.forEach((char, idx) => {
        if (i + idx < 6) next[i + idx] = char;
      });
      onChange(next.join(''));
      const nextFocus = Math.min(i + pastedDigits.length, 5);
      inputs.current[nextFocus]?.focus();
      return;
    }

    const next = [...digits];
    next[i] = rawVal[rawVal.length - 1];
    onChange(next.join(''));
    if (i < 5) {
      inputs.current[i + 1]?.focus();
    }
  };

  const handleKeyDown = (e, i) => {
    if (e.key === 'Backspace' && (!digits[i] || digits[i] === ' ') && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted);
    const targetIdx = Math.min(pasted.length, 5);
    inputs.current[targetIdx]?.focus();
  };

  return (
    <div style={{ display: 'flex', gap: 'clamp(0.35rem, 1.5vw, 0.75rem)', justifyContent: 'center', margin: '1.25rem 0' }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={el => inputs.current[i] = el}
          type="tel"
          pattern="[0-9]*"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ''}
          onChange={e => handleInputChange(e, i)}
          onKeyDown={e => handleKeyDown(e, i)}
          onPaste={handlePaste}
          onFocus={e => e.target.select()}
          style={{
            width: 'clamp(40px, 12vw, 52px)',
            height: 'clamp(48px, 14vw, 60px)',
            textAlign: 'center',
            fontSize: 'clamp(1.2rem, 4.5vw, 1.6rem)',
            fontWeight: 900,
            fontFamily: 'monospace',
            borderRadius: 14,
            border: `2px solid ${digits[i] ? 'rgba(112,0,255,0.6)' : 'var(--glass-border)'}`,
            background: digits[i] ? 'rgba(112,0,255,0.08)' : 'var(--bg-tertiary)',
            color: 'var(--text-main)',
            outline: 'none',
            transition: '0.2s',
            WebkitAppearance: 'none',
          }}
        />
      ))}
    </div>
  );
};

// ─── Countdown Timer ──────────────────────────────────────────────────────
const Countdown = ({ seconds, onExpire }) => {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (left <= 0) { onExpire(); return; }
    const t = setTimeout(() => setLeft(l => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  const m = String(Math.floor(left / 60)).padStart(2, '0');
  const s = String(left % 60).padStart(2, '0');
  return (
    <span style={{ fontFamily: 'monospace', color: left < 60 ? '#f87171' : '#f59e0b', fontWeight: 700 }}>
      {m}:{s}
    </span>
  );
};

// ─── Main AuthPage ────────────────────────────────────────────────────────
const AuthPage = ({ mode = 'login' }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Verification step state
  const [step, setStep] = useState('form'); // 'form' | 'verify'
  const [pendingEmail, setPendingEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [codeExpired, setCodeExpired] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const { user: contextUser, login: setContextUser } = useApp();

  useEffect(() => {
    if (localStorage.getItem('token') && contextUser) {
      if (contextUser.is_admin) navigate('/admin');
      else navigate('/dashboard');
    }
  }, [navigate, contextUser]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // ── Step 1: submit registration / login ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const cleanEmail = form.email.trim().toLowerCase();
    try {
      const endpoint = mode === 'login' ? '/login' : '/register';
      const payload  = mode === 'login'
        ? { email: cleanEmail, password: form.password }
        : { name: form.name.trim(), email: cleanEmail, password: form.password };

      const res = await api.post(endpoint, payload);

      // Register → needs verification
      if (res.data.needs_verification) {
        setPendingEmail(res.data.email || cleanEmail);
        setOtpCode('');
        setStep('verify');
        return;
      }

      // Login (if already verified) or direct login
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setContextUser(res.data.user);
      navigate(res.data.user.is_admin ? '/admin' : '/dashboard');

    } catch (err) {
      const data = err.response?.data;
      // Login blocked because not verified
      if (data?.needs_verification) {
        setPendingEmail(data.email || cleanEmail);
        setOtpCode('');
        setStep('verify');
        return;
      }
      if (data?.errors) {
        setError(Object.values(data.errors).flat().join(' '));
      } else {
        setError(data?.message || 'Une erreur est survenue. Vérifiez votre connexion au serveur.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: submit OTP code ──
  const handleVerify = async (e) => {
    e.preventDefault();
    const cleanCode = String(otpCode).replace(/\D/g, '').slice(0, 6);
    if (cleanCode.length < 6) { setError('Entrez les 6 chiffres du code reçu par e-mail.'); return; }
    setLoading(true);
    setError('');
    try {
      const cleanEmail = pendingEmail.trim().toLowerCase();
      const res = await api.post('/verify-email', { email: cleanEmail, code: cleanCode });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setContextUser(res.data.user);
      navigate(res.data.user.is_admin ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Code invalide ou expiré.');
    } finally {
      setLoading(false);
    }
  };

  // ── Resend code ──
  const handleResend = async () => {
    setResendLoading(true);
    setResendSuccess(false);
    setError('');
    setCodeExpired(false);
    try {
      const cleanEmail = pendingEmail.trim().toLowerCase();
      await api.post('/resend-code', { email: cleanEmail });
      setOtpCode('');
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err) {
      setError(err.response?.data?.message || "Impossible d'envoyer le code.");
    } finally {
      setResendLoading(false);
    }
  };

  // ── VERIFY STEP UI ──
  if (step === 'verify') {
    return (
      <div className="auth-page">
        <div className="orb-1" /><div className="orb-2" />

        <div className="auth-brand-wrap" onClick={() => navigate('/')}>
          <VibeLogo size={42} />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="auth-card"
          style={{ maxWidth: 480, textAlign: 'center' }}>

          {/* Icon */}
          <div style={{ width: 72, height: 72, borderRadius: 20, background: 'linear-gradient(135deg, #7000ff, #00d1ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Mail size={32} color="white" />
          </div>

          <h2 className="auth-title brand-font" style={{ marginBottom: '0.5rem' }}>Vérifiez votre e-mail</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
            Un code secret de vérification à 6 chiffres a été envoyé à
          </p>
          <p style={{ color: '#00d1ff', fontWeight: 800, fontSize: '0.98rem', marginBottom: '0.5rem', wordBreak: 'break-all' }}>
            {pendingEmail}
          </p>

          <div style={{
            background: 'rgba(0, 209, 255, 0.07)',
            border: '1px solid rgba(0, 209, 255, 0.25)',
            padding: '0.9rem 1.15rem',
            borderRadius: 14,
            color: '#cbd5e1',
            margin: '1rem 0',
            fontSize: '0.84rem',
            lineHeight: 1.5,
            textAlign: 'left',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-start'
          }}>
            <Mail size={18} color="#00d1ff" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ margin: 0, fontWeight: 700, color: '#fff' }}>Code OTP envoyé à votre adresse e-mail</p>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Veuillez ouvrir votre boîte de réception (ou dossier Spams) sur votre messagerie et saisir ci-dessous le code à 6 chiffres pour accéder à votre compte.
              </p>
            </div>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Expire dans : {!codeExpired
              ? <Countdown seconds={900} onExpire={() => setCodeExpired(true)} />
              : <span style={{ color: '#f87171', fontWeight: 700 }}>Expiré</span>
            }
          </p>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', padding: '0.75rem 1rem', borderRadius: 10, color: '#f87171', margin: '1rem 0', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}
          {resendSuccess && (
            <div style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)', padding: '0.75rem 1rem', borderRadius: 10, color: '#4ade80', margin: '1rem 0', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
              <CheckCircle2 size={16} /> Nouveau code envoyé dans votre boîte e-mail !
            </div>
          )}

          <form onSubmit={handleVerify}>
            <OTPInput value={otpCode} onChange={setOtpCode} />

            <button
              type="submit"
              className="btn-pro btn-pro-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={loading || otpCode.length < 6 || codeExpired}
            >
              {loading ? 'Vérification...' : <><CheckCircle2 size={18} /> Valider le code & Accéder au compte</>}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              onClick={handleResend}
              disabled={resendLoading}
              style={{ background: 'none', border: 'none', color: '#a78bfa', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}
            >
              <RotateCcw size={15} />
              {resendLoading ? 'Envoi en cours...' : 'Renvoyer un nouveau code'}
            </button>
            <button
              onClick={() => { setStep('form'); setError(''); setOtpCode(''); }}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}
            >
              <ArrowLeft size={15} /> Modifier l'adresse e-mail
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── FORM STEP UI ──
  return (
    <div className="auth-page">
      <div className="orb-1" /><div className="orb-2" />

      <div className="auth-brand-wrap" onClick={() => navigate('/')}>
        <VibeLogo size={42} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="auth-card">
        <h2 className="auth-title brand-font">
          {mode === 'login' ? 'Heureux de vous revoir !' : 'Rejoindre MR1Academy'}
        </h2>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', padding: '0.75rem 1rem', borderRadius: 10, color: '#f87171', marginBottom: '1rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-group">
              <label>Nom Complet</label>
              <input
                name="name"
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                minLength={3}
                required
              />
            </div>
          )}
          <div className="form-group">
            <label>Adresse E-mail</label>
            <input
              name="email"
              type="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              placeholder="john@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Mot de passe</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                style={{ width: '100%', paddingRight: '2.8rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {mode === 'register' && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Minimum 8 caractères requis.
              </p>
            )}
          </div>

          <button type="submit" className="btn-pro btn-pro-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Chargement...' : mode === 'login'
              ? <><LogIn size={18} /> Se Connecter</>
              : <><UserPlus size={18} /> Créer mon compte</>}
          </button>
        </form>

        {mode === 'register' && (
          <div style={{ marginTop: '1.25rem', padding: '0.85rem 1rem', background: 'rgba(0,209,255,0.06)', border: '1px solid rgba(0,209,255,0.2)', borderRadius: 12, fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Mail size={14} style={{ color: '#00d1ff', flexShrink: 0 }} />
            Un code OTP sera envoyé à votre adresse e-mail pour activer et accéder à votre compte.
          </div>
        )}

        <p className="auth-footer">
          {mode === 'login' ? "Pas encore de compte ?" : "Vous avez déjà un compte ?"}
          <Link to={mode === 'login' ? '/register' : '/login'} className="auth-link">
            {mode === 'login' ? "S'inscrire" : "Se Connecter"}
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default AuthPage;
