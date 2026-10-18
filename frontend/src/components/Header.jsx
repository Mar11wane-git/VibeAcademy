import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Search, Bell, User, Settings, LogOut, Award, BookOpen,
  ChevronDown, Check, Info, Sparkles, X, LayoutGrid, Compass,
  MonitorPlay, Users, Calendar, Bookmark, MessageSquare, ShieldCheck,
  Heart, Trash2, ExternalLink, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import api, { getCachedData } from '../services/api';
import { useApp } from '../context/AppContext';
import VibeLogo from './VibeLogo';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  syncSmartNotifications,
} from '../utils/notificationEngine';

// ── Notification Panel Helpers ──────────────────────────────────────────────
const getIconForType = (type) => {
  switch (type) {
    case 'course': return { icon: <BookOpen size={16} />, color: '#38bdf8' };
    case 'enrollment': return { icon: <CheckCircle2 size={16} />, color: '#4ade80' };
    case 'greenlight': return { icon: <ShieldCheck size={16} />, color: '#10b981' };
    case 'certificate':
    case 'success': return { icon: <Award size={16} />, color: '#f59e0b' };
    case 'favorite': return { icon: <Heart size={16} />, color: '#f43f5e' };
    case 'agenda': return { icon: <Calendar size={16} />, color: '#a855f7' };
    case 'community': return { icon: <Users size={16} />, color: '#06b6d4' };
    case 'profile': return { icon: <User size={16} />, color: '#8b5cf6' };
    case 'support': return { icon: <MessageSquare size={16} />, color: '#ec4899' };
    case 'welcome':
    case 'system': return { icon: <Sparkles size={16} />, color: '#00d1ff' };
    default: return { icon: <Info size={16} />, color: 'var(--accent-purple)' };
  }
};

const NotificationDetailModal = ({ note, onClose, onNavigate }) => {
  if (!note) return null;
  const { icon, color } = getIconForType(note.type);

  const modalContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 99999,
          background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}
      >
        <motion.div
          initial={{ scale: 0.92, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.92, y: 20 }}
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: 465, background: 'var(--bg-secondary)',
            border: '1px solid var(--glass-border)', borderRadius: '24px',
            padding: '2.2rem', position: 'relative',
            boxShadow: `0 20px 45px rgba(0,0,0,0.6), 0 0 0 1px ${color}35`
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: '1.35rem', right: '1.35rem',
              background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.15rem' }}>
            <div style={{
              width: 52, height: 52, borderRadius: '16px',
              background: `${color}18`, border: `1px solid ${color}35`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color, flexShrink: 0
            }}>
              {React.cloneElement(icon, { size: 26 })}
            </div>
            <div>
              {note.badge && (
                <span style={{
                  display: 'inline-block', fontSize: '0.68rem', fontWeight: 800,
                  padding: '0.18rem 0.55rem', borderRadius: '99px',
                  background: `${color}18`, color, border: `1px solid ${color}35`,
                  textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem'
                }}>
                  {note.badge}
                </span>
              )}
              <p style={{ color: 'var(--text-muted)', fontSize: '0.76rem', fontWeight: 700 }}>
                {note.time}
              </p>
            </div>
          </div>

          <h2 className="brand-font" style={{ fontSize: '1.35rem', marginBottom: '0.85rem', color: 'white', lineHeight: 1.3 }}>
            {note.title || 'Notification'}
          </h2>

          <div style={{
            background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)',
            padding: '1.2rem', borderRadius: '16px', color: 'var(--text-muted)',
            lineHeight: 1.65, fontSize: '0.92rem'
          }}>
            {note.desc}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            {note.actionUrl && (
              <button
                className="btn-pro btn-pro-primary"
                style={{ flex: 1, justifyContent: 'center', gap: '0.45rem' }}
                onClick={() => {
                  onNavigate(note.actionUrl);
                  onClose();
                }}
              >
                <ExternalLink size={16} />
                {note.actionLabel || 'Ouvrir maintenant'}
              </button>
            )}
            <button
              className="btn-pro"
              style={{
                flex: note.actionUrl ? 0 : 1,
                padding: '0.75rem 1.25rem',
                justifyContent: 'center',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-main)',
              }}
              onClick={onClose}
            >
              Fermer
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

const NotificationsPanel = ({ user, notes, setNotes, onOpenNote, onNavigate, onClosePanel }) => {
  const { lang } = useApp();
  const [activeFilter, setActiveFilter] = useState('all');

  const safeNotes = Array.isArray(notes) ? notes : [];

  const handleMarkAllRead = () => {
    const updated = markAllNotificationsRead(user?.id);
    setNotes(Array.isArray(updated) ? updated : []);
  };

  const handleMarkAsRead = (id) => {
    const updated = markNotificationRead(id, user?.id);
    setNotes(Array.isArray(updated) ? updated : []);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    const updated = deleteNotification(id, user?.id);
    setNotes(Array.isArray(updated) ? updated : []);
  };

  const unreadCount = safeNotes.filter(n => !n.read).length;

  const filterTabs = [
    { key: 'all', label: `Toutes (${safeNotes.length})` },
    { key: 'unread', label: `Non lues (${unreadCount})` },
    { key: 'academique', label: 'Cours & Certifs' },
    { key: 'agenda', label: 'Agenda' },
    { key: 'social', label: 'Communauté & Favoris' },
  ];

  const filteredNotes = safeNotes.filter(n => {
    if (activeFilter === 'unread') return !n.read;
    if (activeFilter === 'academique') return ['course', 'enrollment', 'greenlight', 'certificate', 'system', 'welcome'].includes(n.type);
    if (activeFilter === 'agenda') return n.type === 'agenda' || n.category === 'agenda';
    if (activeFilter === 'social') return ['community', 'favorite', 'profile', 'support'].includes(n.type);
    return true;
  });

  return (
    <div
      className="dropdown-panel"
      style={{
        width: 420,
        right: 0,
        top: 'calc(100% + 12px)',
        zIndex: 300,
        borderRadius: '20px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.65)',
        overflow: 'hidden',
      }}
    >
      <div className="dropdown-header" style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <h3 className="brand-font" style={{ fontSize: '1.08rem' }}>Centre de Notifications</h3>
          {unreadCount > 0 && (
            <span style={{
              fontSize: '0.7rem', fontWeight: 800, padding: '0.15rem 0.55rem',
              borderRadius: '99px', background: 'rgba(244,63,94,0.16)', color: '#fb7185',
              border: '1px solid rgba(244,63,94,0.35)'
            }}>
              {unreadCount} {lang === 'fr' ? 'nouvelles' : 'new'}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            style={{
              fontSize: '0.76rem', color: '#00d1ff',
              background: 'none', border: 'none', cursor: 'pointer', fontWeight: 800,
              display: 'flex', alignItems: 'center', gap: '4px'
            }}
          >
            <Check size={14} /> {lang === 'fr' ? 'Tout lire' : 'Read all'}
          </button>
        )}
      </div>

      {/* Category Filter Pills */}
      <div style={{
        display: 'flex', gap: '0.35rem', padding: '0.65rem 1rem',
        borderBottom: '1px solid rgba(255,255,255,0.06)', overflowX: 'auto', scrollbarWidth: 'none'
      }}>
        {filterTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            style={{
              fontSize: '0.71rem', fontWeight: 700, whiteSpace: 'nowrap',
              padding: '0.3rem 0.68rem', borderRadius: '99px', cursor: 'pointer',
              background: activeFilter === tab.key ? 'linear-gradient(135deg, #7c3aed, #00d1ff)' : 'rgba(255,255,255,0.04)',
              color: activeFilter === tab.key ? '#fff' : 'var(--text-muted)',
              border: activeFilter === tab.key ? 'none' : '1px solid rgba(255,255,255,0.08)',
              transition: 'all 0.18s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ maxHeight: 390, overflowY: 'auto' }}>
        {filteredNotes.length === 0 && (
          <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
            Aucune notification dans cette catégorie.
          </div>
        )}
        {filteredNotes.map(note => {
          const { icon, color } = getIconForType(note.type);
          return (
            <div
              key={note.id}
              className="dropdown-item"
              style={{
                padding: '0.9rem 1.15rem',
                background: note.read ? 'transparent' : 'rgba(255, 255, 255, 0.035)',
                borderLeft: note.read ? '3px solid transparent' : `3px solid ${color}`,
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                display: 'flex', alignItems: 'flex-start', gap: '0.85rem',
                cursor: 'pointer'
              }}
              onClick={() => {
                handleMarkAsRead(note.id);
                onOpenNote(note);
              }}
            >
              <div style={{
                width: 38, height: 38, borderRadius: '11px',
                background: `${color}18`, border: `1px solid ${color}35`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, color, marginTop: '2px'
              }}>
                {icon}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem', marginBottom: '2px' }}>
                  {note.badge ? (
                    <span style={{
                      fontSize: '0.62rem', fontWeight: 800, padding: '1px 6px',
                      borderRadius: '6px', background: `${color}18`, color,
                      textTransform: 'uppercase'
                    }}>
                      {note.badge}
                    </span>
                  ) : <span />}
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted-dark)', fontWeight: 600 }}>
                    {note.time}
                  </span>
                </div>

                <p style={{
                  fontWeight: note.read ? 600 : 800,
                  fontSize: '0.85rem',
                  color: note.read ? 'var(--text-main)' : '#ffffff',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                }}>
                  {note.title || 'Notification'}
                </p>

                <p style={{
                  fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '3px',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  overflow: 'hidden', lineHeight: 1.4
                }}>
                  {note.desc}
                </p>

                {note.actionUrl && (
                  <div style={{ marginTop: '0.45rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(note.id);
                        onNavigate(note.actionUrl);
                        onClosePanel();
                      }}
                      style={{
                        background: 'none', border: 'none', padding: 0,
                        color: '#00d1ff', fontSize: '0.73rem', fontWeight: 800,
                        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px'
                      }}
                    >
                      {note.actionLabel || 'Ouvrir'} <ExternalLink size={11} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, note.id)}
                      title="Supprimer cette notification"
                      style={{
                        background: 'none', border: 'none', padding: '2px',
                        color: 'rgba(255,255,255,0.28)', cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>

              {!note.read && (
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: color, flexShrink: 0, marginTop: '6px',
                  boxShadow: `0 0 8px ${color}`
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Profile Dropdown ────────────────────────────────────────────────────────
const ProfileDropdown = ({ user, onClose }) => {
  const navigate = useNavigate();
  const { t, logout } = useApp();

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch { /* ignore */ }
    logout();
    navigate('/');
  };

  const menuItems = [
    { icon: <User size={16} />, label: t('profil') || 'Mon Profil & Portfolio', action: () => { navigate('/profile'); onClose(); } },
    { icon: <MonitorPlay size={16} />, label: t('mes_cours') || 'Mes Cours', action: () => { navigate('/mes-cours'); onClose(); } },
    { icon: <Bookmark size={16} />, label: t('favoris') || 'Mes Favoris', action: () => { navigate('/favoris'); onClose(); } },
    { icon: <Award size={16} />, label: t('certificats') || 'Mes Certificats', action: () => { navigate('/certificats'); onClose(); } },
    { icon: <Settings size={16} />, label: t('parametres') || 'Paramètres', action: () => { navigate('/settings'); onClose(); } },
    { icon: <Info size={16} />, label: 'À Propos & Vérification', action: () => { navigate('/apropos'); onClose(); } },
    { icon: <MessageSquare size={16} />, label: 'Contact & Support 24/7', action: () => { navigate('/contact'); onClose(); } },
  ];

  return (
    <div className="dropdown-panel" style={{ width: 270, right: 0, top: 'calc(100% + 12px)', zIndex: 300 }}>
      <div style={{ padding: '1.1rem 1.35rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div style={{
          width: 42, height: 42, borderRadius: '12px', background: 'var(--gradient-magic)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: '1.1rem', color: 'white', flexShrink: 0
        }}>
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: '0.92rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.name}
          </p>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.email}
          </p>
        </div>
      </div>

      <div style={{ padding: '0.45rem' }}>
        {menuItems.map(item => (
          <button key={item.label} onClick={item.action} className="dropdown-menu-btn">
            {item.icon} {item.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '0.45rem', borderTop: '1px solid var(--glass-border)' }}>
        <button onClick={handleLogout} className="dropdown-menu-btn" style={{ color: '#f87171', width: '100%' }}>
          <LogOut size={16} /> {t('logout') || 'Déconnexion'}
        </button>
      </div>
    </div>
  );
};

// ── Main Full-Width Enterprise Header ───────────────────────────────────────
const Header = () => {
  const { t, lang } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const notifsRef = useRef(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

  const getUser = () => {
    try {
      const u = localStorage.getItem('user');
      return u && u !== 'undefined' ? JSON.parse(u) : {};
    } catch { return {}; }
  };
  const [user, setUser] = useState(getUser);

  const [userNotes, setUserNotes] = useState(() => {
    try {
      const currentUser = getUser();
      const notes = currentUser?.id ? getNotifications(currentUser.id) : [];
      return Array.isArray(notes) ? notes : [];
    } catch {
      return [];
    }
  });

  // Sync notifications & user profile updates in real time
  useEffect(() => {
    const refreshNotifications = () => {
      const currentUser = getUser();
      setUser(currentUser);
      if (currentUser?.id) {
        const fetched = getNotifications(currentUser.id);
        setUserNotes(Array.isArray(fetched) ? fetched : []);
      }
    };

    refreshNotifications();
    const timer = setTimeout(() => {
      syncSmartNotifications();
      refreshNotifications();
    }, 800);

    window.addEventListener('vibe-notifications-updated', refreshNotifications);
    window.addEventListener('vibe-profile-updated', refreshNotifications);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('vibe-notifications-updated', refreshNotifications);
      window.removeEventListener('vibe-profile-updated', refreshNotifications);
    };
  }, [location.pathname]);

  const unread = Array.isArray(userNotes) ? userNotes.filter(n => !n.read).length : 0;

  useEffect(() => {
    const handler = (e) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target)) setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearchResults(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setShowSearchResults(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const toggleNotifs = () => {
    if (!showNotifs) {
      syncSmartNotifications();
      const fetched = getNotifications(user?.id);
      setUserNotes(Array.isArray(fetched) ? fetched : []);
    }
    setShowNotifs(p => !p);
    setShowProfile(false);
    setShowSearchResults(false);
  };
  const toggleProfile = () => { setShowProfile(p => !p); setShowNotifs(false); setShowSearchResults(false); };

  const [allCourses, setAllCourses] = useState(() => {
    try {
      const cached = getCachedData('/courses');
      return Array.isArray(cached) ? cached : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    api.get('/courses')
      .then(res => {
        if (Array.isArray(res.data)) {
          setAllCourses(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const safeCourses = Array.isArray(allCourses) ? allCourses : [];

  const searchItems = [
    ...safeCourses.map(c => ({ id: `course-${c.id}`, type: 'course', badge: 'COURS', title: c.title, path: `/courses/${c.id}` })),
    { id: 'page-dash', type: 'page', badge: 'ACCUEIL', title: 'Tableau de Bord Principal', path: '/dashboard' },
    { id: 'page-cat', type: 'page', badge: '24 CURSUS', title: 'Catalogue des Formations (IA, Data, Cloud, Web)', path: '/catalogue' },
    { id: 'page-agenda', type: 'page', badge: 'LIVE .ICS', title: 'Agenda & Sessions Live RFC 5545', path: '/calendrier' },
    { id: 'page-comm', type: 'page', badge: 'HUB PRO', title: 'Communauté, Code Snippets & Mentors 1-on-1', path: '/communaute' },
    { id: 'page-fav', type: 'page', badge: 'PLANNER', title: 'Mes Favoris & Collections d\'Étude', path: '/favoris' },
    { id: 'page-cert', type: 'page', badge: 'DIPLÔMES', title: 'Mes Certificats Officiels & Quiz', path: '/certificats' },
    { id: 'page-prof', type: 'page', badge: 'PORTFOLIO', title: 'Mon Profil Développeur & Compétences', path: '/profile' },
    { id: 'page-about', type: 'page', badge: 'INSTITUTION', title: 'À Propos de MR1Academy & Vérification de Certificat', path: '/apropos' },
    { id: 'page-contact', type: 'page', badge: 'SUPPORT 24/7', title: 'Contact, Tickets Support & FAQ', path: '/contact' },
  ];

  const searchResults = (searchQuery.trim()
    ? searchItems.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : searchItems.filter(item => item.type === 'page')
  ).slice(0, 7);

  // Unified Single-Row Top Navigation Links
  const navLinks = [
    { icon: <LayoutGrid size={15} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <Compass size={15} />, label: 'Catalogue', path: '/catalogue' },
    { icon: <MonitorPlay size={15} />, label: 'Mes Cours', path: '/mes-cours' },
    { icon: <Calendar size={15} />, label: 'Agenda', path: '/calendrier', match: ['/calendrier', '/calendar'] },
    { icon: <Users size={15} />, label: 'Communauté', path: '/communaute', match: ['/communaute', '/community'] },
    { icon: <Bookmark size={15} />, label: 'Favoris', path: '/favoris' },
    { icon: <Award size={15} />, label: 'Certificats', path: '/certificats' },
    { icon: <Info size={15} />, label: 'À Propos', path: '/apropos', match: ['/apropos', '/about'] },
    { icon: <MessageSquare size={15} />, label: 'Contact', path: '/contact', match: ['/contact', '/support'] },
  ];

  if (user?.is_admin) {
    navLinks.unshift({ icon: <ShieldCheck size={15} />, label: 'Admin', path: '/admin' });
  }

  const currentPath = location.pathname;

  return (
    <header
      className="header"
      style={{
        height: '78px',
        padding: '0 1.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        background: 'rgba(7, 7, 18, 0.88)',
        backdropFilter: 'blur(22px)',
        borderBottom: '1px solid var(--glass-border)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* 1. Left: Bespoke Pro MR1Academy Logo */}
      <VibeLogo
        size={38}
        onClick={() => navigate('/dashboard')}
      />

      {/* 2. Center: Unified Single-Line Navigation Pill Bar */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '0.32rem',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          maxWidth: '100%',
        }}
      >
        {navLinks.map(item => {
          const isActive = item.match
            ? item.match.includes(currentPath)
            : currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path + '/'));

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.42rem',
                whiteSpace: 'nowrap',
                padding: '0.46rem 0.78rem',
                borderRadius: '10px',
                border: isActive ? '1px solid rgba(167, 139, 250, 0.45)' : '1px solid transparent',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(112, 0, 255, 0.32) 0%, rgba(0, 209, 255, 0.16) 100%)'
                  : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                fontSize: '0.8rem',
                fontWeight: isActive ? 800 : 600,
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                boxShadow: isActive ? '0 4px 14px rgba(112, 0, 255, 0.25)' : 'none',
              }}
              onMouseOver={e => {
                if (!isActive) {
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }
              }}
              onMouseOut={e => {
                if (!isActive) {
                  e.currentTarget.style.color = 'var(--text-muted)';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span style={{ color: isActive ? '#00d1ff' : 'inherit', display: 'flex' }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* 3. Right: Compact Search (Ctrl+K) + Notifications + Profile */}
      <div className="profile-area" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
        {/* Search Input with Ctrl+K */}
        <div ref={searchRef} style={{ position: 'relative' }}>
          <div
            style={{
              width: showSearchResults ? 245 : 195,
              height: '40px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: showSearchResults ? '1px solid rgba(167, 139, 250, 0.5)' : '1px solid var(--glass-border)',
              borderRadius: '12px',
              padding: '0 0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.45rem',
              transition: 'width 0.2s ease, border-color 0.2s ease',
            }}
          >
            <Search size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={t('search') || 'Rechercher...'}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#fff',
                fontSize: '0.8rem',
                width: '100%',
              }}
            />
            <span
              style={{
                fontSize: '0.62rem',
                fontWeight: 800,
                color: 'var(--text-muted)',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '0.12rem 0.36rem',
                borderRadius: '5px',
                flexShrink: 0,
              }}
            >
              ⌘K
            </span>
          </div>

          <AnimatePresence>
            {showSearchResults && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  right: 0,
                  width: 380,
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 22px 50px rgba(0,0,0,0.65)',
                  zIndex: 300,
                }}
              >
                <div style={{ padding: '0.55rem 0.9rem', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {searchQuery.trim() ? `Résultats pour « ${searchQuery} »` : 'Navigation & Accès Rapide'}
                </div>
                {searchResults.length > 0 ? (
                  <div style={{ padding: '0.4rem' }}>
                    {searchResults.map(res => (
                      <button
                        key={res.id}
                        onClick={() => { navigate(res.path); setShowSearchResults(false); setSearchQuery(''); }}
                        className="dropdown-menu-btn"
                        style={{ padding: '0.6rem 0.8rem', display: 'flex', gap: '0.6rem', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', minWidth: 0 }}>
                          {res.type === 'course' ? <BookOpen size={15} color="var(--accent-blue)" /> : <Sparkles size={15} color="#a78bfa" />}
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {res.title}
                          </span>
                        </div>
                        <span style={{
                          fontSize: '0.62rem', fontWeight: 800,
                          color: res.type === 'course' ? '#38bdf8' : '#c4b5fd',
                          background: res.type === 'course' ? 'rgba(56,189,248,0.12)' : 'rgba(139,92,246,0.14)',
                          padding: '0.14rem 0.42rem', borderRadius: '6px', flexShrink: 0
                        }}>
                          {res.badge}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                    Aucun résultat pour « {searchQuery} »
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications Bell with Live Count Badge */}
        <div ref={notifsRef} style={{ position: 'relative' }}>
          <button
            className="icon-btn"
            onClick={toggleNotifs}
            style={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              background: showNotifs ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.04)',
              borderColor: showNotifs ? 'rgba(255, 255, 255, 0.35)' : 'var(--glass-border)',
              position: 'relative',
            }}
          >
            <Bell size={17} />
            {unread > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4,
                minWidth: 18, height: 18, padding: '0 4px',
                background: 'linear-gradient(135deg, #f43f5e, #ec4899)',
                color: '#fff', fontSize: '0.65rem', fontWeight: 900,
                borderRadius: '99px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid var(--bg-primary)', boxShadow: '0 0 10px rgba(244,63,94,0.6)'
              }}>
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
          {showNotifs && (
            <NotificationsPanel
              user={user}
              notes={userNotes}
              setNotes={setUserNotes}
              onOpenNote={setSelectedNotif}
              onNavigate={(url) => navigate(url)}
              onClosePanel={() => setShowNotifs(false)}
            />
          )}
        </div>

        {/* User Profile Pill */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button
            onClick={toggleProfile}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              background: showProfile ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${showProfile ? 'rgba(167, 139, 250, 0.45)' : 'var(--glass-border)'}`,
              borderRadius: '12px',
              padding: '0.35rem 0.7rem 0.35rem 0.38rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: '9px', background: 'var(--gradient-magic)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '0.9rem', color: 'white', flexShrink: 0
            }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ textAlign: 'left', maxWidth: '115px' }}>
              <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'Étudiant'}
              </p>
              <p style={{ fontSize: '0.68rem', color: '#4ade80', fontWeight: 700, lineHeight: 1.1 }}>
                {user?.is_admin ? 'Admin Pro' : (lang === 'fr' ? 'Membre Pro' : 'Pro Member')}
              </p>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" style={{ transition: 'transform 0.2s', transform: showProfile ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </button>
          {showProfile && <ProfileDropdown user={user} onClose={() => setShowProfile(false)} />}
        </div>
      </div>

      <NotificationDetailModal
        note={selectedNotif}
        onClose={() => setSelectedNotif(null)}
        onNavigate={(url) => navigate(url)}
      />
    </header>
  );
};

export default Header;
