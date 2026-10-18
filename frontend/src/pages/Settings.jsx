import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Bell, Globe, Moon, Shield, Save, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Settings = () => {
    const { theme, lang, toggleTheme, changeLang, t } = useApp();
    const [preferences, setPreferences] = useState({
        notifications: true,
        privacy: 'public',
    });
    const [message, setMessage] = useState(null);

    const toggle = (field) => {
        setPreferences({ ...preferences, [field]: !preferences[field] });
    };

    const saveSettings = (e) => {
        e.preventDefault();
        setMessage('Paramètres enregistrés avec succès.');
        setTimeout(() => setMessage(null), 3000);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="page-view"
        >
            <h1 className="page-title brand-font">{t('parametres')}</h1>
            <p className="page-subtitle">{lang === 'fr' ? 'Personnalisez votre expérience MR1Academy.' : 'Personalize your MR1Academy experience.'}</p>

            <div style={{ maxWidth: '600px' }}>
                <div style={{ background: 'var(--bg-tertiary)', padding: '2.5rem', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
                    
                    {message && (
                        <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', padding: '1rem', borderRadius: '12px', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <CheckCircle size={20} /> {message}
                        </div>
                    )}

                    {/* Dark Mode */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 0', borderBottom: '1px solid var(--glass-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(255, 255, 255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-purple)' }}>
                                <Moon size={20} />
                            </div>
                            <div>
                                <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{t('dark_mode')}</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{lang === 'fr' ? 'Utiliser le thème sombre par défaut.' : 'Use the dark theme by default.'}</p>
                            </div>
                        </div>
                        <div 
                            onClick={toggleTheme}
                            style={{ 
                                width: 50, height: 26, background: theme === 'dark' ? 'var(--accent-purple)' : 'var(--text-muted-dark)', 
                                borderRadius: '99px', border: '2px solid var(--glass-border)', cursor: 'pointer', position: 'relative', transition: '0.3s' 
                            }}
                        >
                            <motion.div 
                                animate={{ x: theme === 'dark' ? 24 : 4 }}
                                style={{ width: 18, height: 18, background: 'white', borderRadius: '50%', position: 'absolute', top: 2 }}
                            />
                        </div>
                    </div>

                    {/* Notifications */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 0', borderBottom: '1px solid var(--glass-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-blue)' }}>
                                <Bell size={20} />
                            </div>
                            <div>
                                <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{t('notifications')}</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{lang === 'fr' ? 'Recevoir des alertes pour les nouveaux cours.' : 'Receive alerts for new courses.'}</p>
                            </div>
                        </div>
                        <div 
                            onClick={() => toggle('notifications')}
                            style={{ 
                                width: 50, height: 26, background: preferences.notifications ? 'var(--accent-purple)' : 'var(--bg-primary)', 
                                borderRadius: '99px', border: '2px solid var(--glass-border)', cursor: 'pointer', position: 'relative', transition: '0.3s' 
                            }}
                        >
                            <motion.div 
                                animate={{ x: preferences.notifications ? 24 : 4 }}
                                style={{ width: 18, height: 18, background: 'white', borderRadius: '50%', position: 'absolute', top: 2 }}
                            />
                        </div>
                    </div>

                    {/* Language */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 0', borderBottom: '1px solid var(--glass-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(236,72,153,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-pink)' }}>
                                <Globe size={20} />
                            </div>
                            <div>
                                <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{t('language')}</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{lang === 'fr' ? 'Choisir la langue de l\'interface.' : 'Choose the interface language.'}</p>
                            </div>
                        </div>
                        <select 
                            value={lang}
                            onChange={(e) => changeLang(e.target.value)}
                            style={{ background: 'var(--bg-primary)', color: 'var(--text-main)', border: '1px solid var(--glass-border)', padding: '0.5rem', borderRadius: '8px' }}
                        >
                            <option value="fr">Français</option>
                            <option value="en">English</option>
                        </select>
                    </div>

                    {/* Privacy */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4ade80' }}>
                                <Shield size={20} />
                            </div>
                            <div>
                                <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{t('privacy')}</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{lang === 'fr' ? 'Gérer la visibilité de votre profil.' : 'Manage your profile visibility.'}</p>
                            </div>
                        </div>
                        <select 
                            value={preferences.privacy}
                            onChange={(e) => setPreferences({...preferences, privacy: e.target.value})}
                            style={{ background: 'var(--bg-primary)', color: 'var(--text-main)', border: '1px solid var(--glass-border)', padding: '0.5rem', borderRadius: '8px' }}
                        >
                            <option value="public">Public</option>
                            <option value="private">Privé</option>
                        </select>
                    </div>

                    <button onClick={saveSettings} className="btn-pro btn-pro-primary" style={{ marginTop: '2rem', width: '100%' }}>
                        <Save size={18} /> {t('save_changes')}
                    </button>
                    
                </div>
            </div>
        </motion.div>
    );
};

export default Settings;
