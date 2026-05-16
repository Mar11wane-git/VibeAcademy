import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Bell, User, Settings, LogOut, Award, BookOpen, ChevronDown, Check, Info, AlertCircle, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useApp } from '../context/AppContext';

// ── Notification Panel ──────────────────────────────────────────────────────
const getIconForType = (type) => {
  switch(type) {
    case 'course': return { icon: <BookOpen size={16} />, color: 'var(--accent-blue)' };
    case 'success': return { icon: <Award size={16} />, color: '#f59e0b' };
    case 'enrollment': return { icon: <Check size={16} />, color: '#4ade80' };
    case 'welcome': return { icon: <Sparkles size={16} />, color: 'var(--accent-main)' };
    default: return { icon: <Info size={16} />, color: 'var(--accent-purple)' };
  }
};

const getNotifsForUser = (userId, userName) => {
  if (!userId) return [];
  const key = `notifications_${userId}`;
  const stored = localStorage.getItem(key);
  if (stored) return JSON.parse(stored);
  
  const initial = [
    { id: 1, type: 'welcome', title: 'Bienvenue !', desc: `Heureux de vous compter parmi nous, ${userName}. Profitez d'une expérience d'apprentissage sans précédent. Naviguez dans notre catalogue pour trouver vos premiers cours.`, time: 'À l\'instant', read: false },
    { id: 2, type: 'info', title: 'Nouveau cours', desc: 'Le module "Animations Avancées" est en ligne. Découvrez comment utiliser Framer Motion pour donner vie à vos interfaces utilisateur de manière professionnelle.', time: 'Il y a 1h', read: false }
  ];
  localStorage.setItem(key, JSON.stringify(initial));
  return initial;
};

const NotificationDetailModal = ({ note, onClose }) => {
  if (!note) return null;
  const { icon, color } = getIconForType(note.type);
  
  const modalContent = (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
        style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
          style={{ width: '100%', maxWidth: 450, background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '24px', padding: '2.5rem', position: 'relative', boxShadow: `0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px ${color}30` }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', outline: 'none' }}><X size={20} /></button>
          
          <div style={{ width: 60, height: 60, borderRadius: '16px', background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color, marginBottom: '1.5rem' }}>
            {React.cloneElement(icon, { size: 32 })}
          </div>
          
          <h2 className="brand-font" style={{ fontSize: '1.6rem', marginBottom: '0.2rem', color: 'white' }}>{note.title || 'Notification'}</h2>
          <p style={{ color: color, fontSize: '0.8rem', fontWeight: 700, marginBottom: '1.5rem', letterSpacing: '1px', textTransform: 'uppercase' }}>{note.time}</p>
          
          <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', padding: '1.5rem', borderRadius: '16px', color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>
            {note.desc}
          </div>
          
          <button className="btn-pro btn-pro-primary" style={{ width: '100%', marginTop: '2rem', background: color, boxShadow: `0 4px 15px ${color}40`, border: 'none', color: 'white' }} onClick={onClose}>
            Fermer
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

const NotificationsPanel = ({ user, onClose, notes, setNotes, onOpenNote }) => {
  const { lang } = useApp();
  
  const markAllRead = () => {
    const updated = notes.map(n => ({ ...n, read: true }));
    setNotes(updated);
    if (user?.id) localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updated));
  };

  const markAsRead = (id) => {
    const updated = notes.map(n => n.id === id ? { ...n, read: true } : n);
    setNotes(updated);
    if (user?.id) localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updated));
  };

  const unread = notes.filter(n => !n.read).length;

  return (
    <div className="dropdown-panel" style={{ width: 360, right: 0, top: 'calc(100% + 12px)' }}>
      <div className="dropdown-header">
        <div>
          <h3 className="brand-font" style={{ fontSize: '1.1rem' }}>Notifications</h3>
          {unread > 0 && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{unread} {lang === 'fr' ? 'non lues' : 'unread'}</span>}
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
            {lang === 'fr' ? 'Tout marquer lu' : 'Mark all as read'}
          </button>
        )}
      </div>

      <div style={{ maxHeight: 340, overflowY: 'auto' }}>
        {notes.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Aucune notification.</div>}
        {notes.map(note => {
          const { icon, color } = getIconForType(note.type);
          return (
            <div key={note.id} className="dropdown-item"
              style={{ background: note.read ? 'transparent' : 'rgba(255, 255, 255,0.05)', borderLeft: note.read ? 'none' : `3px solid ${color}` }}
              onClick={() => { markAsRead(note.id); onOpenNote(note); }}>
              <div style={{ width: 38, height: 38, borderRadius: '10px', background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: color }}>
                {icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: note.read ? 400 : 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{note.title || 'Notification'}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{note.desc}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted-dark)', marginTop: '4px' }}>{note.time}</p>
              </div>
              {!note.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />}
            </div>
          );
        })}
      </div>

      <div style={{ padding: '1rem', borderTop: '1px solid var(--glass-border)', textAlign: 'center' }}>
        <button style={{ fontSize: '0.85rem', color: 'var(--accent-blue)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
           {lang === 'fr' ? 'Voir toutes les notifications' : 'View all notifications'}
        </button>
      </div>
    </div>
  );
};

// ── Profile Dropdown ────────────────────────────────────────────────────────
const ProfileDropdown = ({ user, onClose }) => {
  const navigate = useNavigate();
  const { t, logout } = useApp();

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch {}
    logout();
    navigate('/');
  };

  const menuItems = [
    { icon: <User size={16} />,    label: t('profil'),     action: () => { navigate('/profile'); onClose(); } },
    { icon: <BookOpen size={16} />, label: t('mes_cours'),  action: () => { navigate('/mes-cours'); onClose(); } },
    { icon: <Award size={16} />,    label: t('certificats'),action: () => { navigate('/certificats'); onClose(); } },
    { icon: <Settings size={16} />, label: t('parametres'), action: () => { navigate('/settings'); onClose(); } },
  ];

  return (
    <div className="dropdown-panel" style={{ width: 280, right: 0, top: 'calc(100% + 12px)' }}>
      {/* Profile Header */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'var(--gradient-magic)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', color: 'white', flexShrink: 0 }}>
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
        </div>
      </div>

      {/* Menu Items */}
      <div style={{ padding: '0.5rem' }}>
        {menuItems.map(item => (
          <button key={item.label} onClick={item.action}
            className="dropdown-menu-btn">
            {item.icon} {item.label}
          </button>
        ))}
      </div>

      {/* Logout */}
      <div style={{ padding: '0.5rem', borderTop: '1px solid var(--glass-border)' }}>
        <button onClick={handleLogout} className="dropdown-menu-btn" style={{ color: '#f87171', width: '100%' }}>
          <LogOut size={16} /> {t('logout')}
        </button>
      </div>
    </div>
  );
};

// ── Main Header ─────────────────────────────────────────────────────────────
const Header = () => {
  const { t, lang } = useApp();
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const notifsRef = useRef(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);
  const getUser = () => {
    try {
      const u = localStorage.getItem('user');
      return u && u !== 'undefined' ? JSON.parse(u) : {};
    } catch { return {}; }
  };
  const user = getUser();
  
  const [userNotes, setUserNotes] = useState([]);
  
  useEffect(() => {
    if (user?.id) {
      setUserNotes(getNotifsForUser(user.id, user.name));
    }
  }, [user?.id]);
  
  const unread = userNotes.filter(n => !n.read).length;

  // Close panels on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target)) setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearchResults(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleNotifs  = () => { setShowNotifs(p => !p); setShowProfile(false); setShowSearchResults(false); };
  const toggleProfile = () => { setShowProfile(p => !p); setShowNotifs(false); setShowSearchResults(false); };

  // Mock search data
  const MOCK_SEARCH_DATA = [
    { id: 1, type: 'course', title: 'React JS : De Débutant à Pro', path: '/course/1' },
    { id: 2, type: 'course', title: 'Laravel 11 : API Backend Intégral', path: '/course/2' },
    { id: 3, type: 'course', title: 'CSS Animations & Glassmorphism', path: '/course/6' },
    { id: 4, type: 'page', title: 'Mes Certificats', path: '/certificats' },
    { id: 5, type: 'page', title: 'Mes Favoris', path: '/favoris' }
  ];

  const searchResults = MOCK_SEARCH_DATA.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <header className="header">
      {/* Search */}
      <div ref={searchRef} style={{ position: 'relative' }}>
        <div className="search-bar" style={{ width: 300 }}>
          <Search size={18} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder={t('search')} 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(e.target.value.length > 0);
            }}
            onFocus={() => { if (searchQuery.length > 0) setShowSearchResults(true); }}
          />
        </div>
        
        {/* Search Results Dropdown */}
        <AnimatePresence>
          {showSearchResults && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              style={{ position: 'absolute', top: 'calc(100% + 10px)', left: 0, right: 0, background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', zIndex: 100 }}>
              {searchResults.length > 0 ? (
                <div style={{ padding: '0.5rem' }}>
                  {searchResults.map(res => (
                    <button key={res.id} onClick={() => { navigate(res.path); setShowSearchResults(false); setSearchQuery(''); }}
                      className="dropdown-menu-btn" style={{ padding: '0.75rem 1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      {res.type === 'course' ? <BookOpen size={16} color="var(--accent-blue)" /> : <Search size={16} color="var(--text-muted)" />}
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{res.title}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Aucun résultat pour "{searchQuery}"
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Controls */}
      <div className="profile-area">

        {/* Notifications Bell */}
        <div ref={notifsRef} style={{ position: 'relative' }}>
          <button className="icon-btn" onClick={toggleNotifs}
            style={{ background: showNotifs ? 'rgba(255, 255, 255,0.15)' : undefined, borderColor: showNotifs ? 'rgba(255, 255, 255,0.4)' : undefined }}>
            <Bell size={18} />
            {unread > 0 && (
              <div style={{ position: 'absolute', top: 8, right: 8, width: 9, height: 9, background: 'var(--accent-pink)', borderRadius: '50%', border: '2px solid var(--bg-primary)', boxShadow: '0 0 8px var(--accent-pink)' }} />
            )}
          </button>
          {showNotifs && <NotificationsPanel user={user} onClose={() => setShowNotifs(false)} notes={userNotes} setNotes={setUserNotes} onOpenNote={setSelectedNotif} />}
        </div>

        {/* Profile */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button onClick={toggleProfile}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: showProfile ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)', border: `1px solid ${showProfile ? 'rgba(255, 255, 255,0.4)' : 'var(--glass-border)'}`, borderRadius: '14px', padding: '0.5rem 1rem 0.5rem 0.5rem', cursor: 'pointer', transition: 'all 0.2s' }}>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'var(--gradient-magic)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', color: 'white' }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.2 }}>{user?.name || 'Utilisateur'}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1 }}>{lang === 'fr' ? 'Étudiant' : 'Student'}</p>
            </div>
            <ChevronDown size={15} color="var(--text-muted)" style={{ transition: 'transform 0.2s', transform: showProfile ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </button>
          {showProfile && <ProfileDropdown user={user} onClose={() => setShowProfile(false)} />}
        </div>
      </div>

      <NotificationDetailModal note={selectedNotif} onClose={() => setSelectedNotif(null)} />
    </header>
  );
};

export default Header;
