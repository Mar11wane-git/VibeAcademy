import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Save, AlertCircle, CheckCircle, Shield, Award, Zap, Camera, Star } from 'lucide-react';
import api from '../services/api';
import { useApp } from '../context/AppContext';

const Profile = () => {
    const { t, lang } = useApp();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const [formData, setFormData] = useState({
        name: user.name || '',
        email: user.email || '',
        password: '',
        password_confirmation: '',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        setError(null);

        try {
            const dataToSubmit = {
                name: formData.name,
                email: formData.email,
            };

            if (formData.password) {
                dataToSubmit.password = formData.password;
                dataToSubmit.password_confirmation = formData.password_confirmation;
            }

            const response = await api.put('/profile', dataToSubmit);
            const updatedUser = response.data.user;
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setMessage(response.data.message);
            setFormData({ ...formData, password: '', password_confirmation: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-view">
            <h1 className="page-title brand-font">{t('profil')}</h1>
            <p className="page-subtitle">{lang === 'fr' ? 'Gérez vos informations personnelles et votre évolution.' : 'Manage your personal info and learning progress.'}</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem', alignItems: 'start' }}>
                
                {/* User Card (Left Column) */}
                <div style={{ background: 'var(--bg-tertiary)', padding: '2.5rem 1.5rem', borderRadius: '24px', border: '1px solid var(--glass-border)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: 'var(--gradient-aurora)', opacity: 0.2 }} />
                    
                    <div style={{ position: 'relative', marginTop: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'var(--gradient-magic)', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800, color: 'white', border: '4px solid var(--bg-primary)', boxShadow: '0 10px 25px rgba(139, 92, 246, 0.4)' }}>
                            {user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <button style={{ position: 'absolute', bottom: 0, right: 'calc(50% - 40px)', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
                            <Camera size={14} />
                        </button>
                    </div>

                    <h2 className="brand-font" style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>{user.name}</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                        <Shield size={14} color="var(--accent-purple)" /> Membre Pro VibeAcademy
                    </p>

                    <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '16px', padding: '1rem', marginBottom: '1.5rem', textAlign: 'left', border: '1px solid rgba(255,255,255,0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Niveau 12</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--accent-main)', fontWeight: 800 }}>4,500 XP</span>
                        </div>
                        <div className="progress-container" style={{ height: 6, marginBottom: '0.5rem' }}>
                            <div className="progress-bar" style={{ width: '75%', background: 'var(--gradient-magic)' }}></div>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted-dark)' }}>Plus que 500 XP avant le niveau 13</p>
                    </div>

                    <h3 className="brand-font" style={{ fontSize: '1rem', marginBottom: '1rem', textAlign: 'left' }}>Badges Obtenus (3)</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <div style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', padding: '0.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a78bfa', fontSize: '0.8rem' }}><Award size={14} /> Pionnier</div>
                        <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '0.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#60a5fa', fontSize: '0.8rem' }}><Star size={14} /> 5 Cours</div>
                        <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '0.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fcd34d', fontSize: '0.8rem' }}><Zap size={14} /> Streak 7j</div>
                    </div>
                </div>

                {/* Form (Right Column) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <form onSubmit={handleSubmit} className="auth-form" style={{ background: 'var(--bg-tertiary)', padding: '2.5rem', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h2 className="brand-font" style={{ fontSize: '1.3rem' }}>Paramètres du Compte</h2>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Mettez à jour vos identifiants ou votre nom public.</p>
                        </div>
                    
                    {message && (
                        <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', padding: '1rem', borderRadius: '12px', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <CheckCircle size={20} /> {message}
                        </div>
                    )}

                    {error && (
                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '12px', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <AlertCircle size={20} /> {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label><User size={16} /> {lang === 'fr' ? 'Nom Complet' : 'Full Name'}</label>
                        <input 
                            type="text" 
                            name="name" 
                            value={formData.name} 
                            onChange={handleChange} 
                            placeholder={lang === 'fr' ? 'Votre nom' : 'Your name'} 
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label><Mail size={16} /> {lang === 'fr' ? 'Adresse Email' : 'Email Address'}</label>
                        <input 
                            type="email" 
                            name="email" 
                            value={formData.email} 
                            onChange={handleChange} 
                            placeholder="votre@email.com" 
                            required 
                        />
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)', margin: '1.5rem 0' }} />
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{lang === 'fr' ? 'Changer le mot de passe (laisser vide si inchangé)' : 'Change password (leave empty if unchanged)'}</p>

                    <div className="form-group">
                        <label><Lock size={16} /> {lang === 'fr' ? 'Nouveau Mot de Passe' : 'New Password'}</label>
                        <input 
                            type="password" 
                            name="password" 
                            value={formData.password} 
                            onChange={handleChange} 
                            placeholder={lang === 'fr' ? 'Minimum 6 caractères' : 'Minimum 6 characters'} 
                        />
                    </div>

                    <div className="form-group">
                        <label><Lock size={16} /> {lang === 'fr' ? 'Confirmer le Mot de Passe' : 'Confirm Password'}</label>
                        <input 
                            type="password" 
                            name="password_confirmation" 
                            value={formData.password_confirmation} 
                            onChange={handleChange} 
                            placeholder={lang === 'fr' ? 'Répétez le mot de passe' : 'Repeat the password'} 
                        />
                    </div>

                    <button type="submit" className="btn-pro btn-pro-primary" disabled={loading} style={{ marginTop: '1rem', width: '100%' }}>
                        {loading ? (lang === 'fr' ? 'Mise à jour...' : 'Updating...') : <><Save size={18} /> {t('save_changes')}</>}
                    </button>
                    </form>
                    
                    {/* Advanced Settings Placeholder */}
                    <div style={{ background: 'var(--bg-tertiary)', padding: '2.5rem', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
                        <h2 className="brand-font" style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Zone de Danger</h2>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>La suppression de votre compte entraînera la perte de vos certificats et progrès.</p>
                        <button className="btn-pro btn-pro-outline" style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                            Supprimer mon compte (Action irréversible)
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Profile;
