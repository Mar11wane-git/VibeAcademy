import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, LogIn, UserPlus } from 'lucide-react';
import api from '../services/api';
import { useApp } from '../context/AppContext';

const AuthPage = ({ mode = 'login' }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { user: contextUser, login: setContextUser } = useApp();

  React.useEffect(() => {
    if (localStorage.getItem('token') && contextUser) {
      if (contextUser.is_admin) navigate('/admin');
      else navigate('/dashboard');
    }
  }, [navigate, contextUser]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = mode === 'login' ? '/login' : '/register';
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };

      const res = await api.post(endpoint, payload);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setContextUser(res.data.user);
      
      if (res.data.user.is_admin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        // Laravel validation errors (object of arrays)
        const messages = Object.values(data.errors).flat();
        setError(messages.join(' '));
      } else if (data?.message) {
        setError(data.message);
      } else {
        setError('Une erreur est survenue. Vérifiez votre connexion au serveur.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="orb-1"></div>
      <div className="orb-2"></div>

      <div className="brand cursor-pointer" onClick={() => navigate('/')} style={{ position: 'absolute', top: '2rem', left: '3rem' }}>
        <div className="brand-icon"><BookOpen size={20} strokeWidth={2.5} /></div>
        VibeAcademy
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="auth-card">
        <h2 className="auth-title brand-font">
          {mode === 'login' ? 'Heureux de vous revoir !' : 'Rejoindre VibeAcademy'}
        </h2>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', padding: '0.75rem 1rem', borderRadius: '10px', color: '#f87171', marginBottom: '1rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-group">
              <label>Nom Complet</label>
              <input name="name" type="text" placeholder="John Doe" value={form.name} onChange={handleChange} minLength={3} required />
            </div>
          )}
          <div className="form-group">
            <label>Adresse E-mail</label>
            <input name="email" type="email" placeholder="john@example.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Mot de passe</label>
            <input name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
            {mode === 'register' && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
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
