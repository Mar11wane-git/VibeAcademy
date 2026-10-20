import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, PieChart, BookOpen, Users, 
  Settings, LogOut, Bell, Search, Menu,
  UserPlus, BookMarked, MessageCircle, X, CheckCheck,
  Compass, ExternalLink, Moon, Sun, RefreshCw, LayoutGrid,
  Calendar, Award, MessageSquare, ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import api from '../services/api';

const AdminLayout = ({ children, onRefresh, isRefreshing = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, theme, toggleTheme } = useApp();
  const [showNotif, setShowNotif] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const bellRef = useRef(null);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/admin/stats');
      const s = res.data;
      const list = [];
      if (s.new_users_month > 0)
        list.push({ id: 1, icon: 'user', text: `${s.new_users_month} nouveau(x) membre(s) ce mois`, time: 'Ce mois', read: false });
      if (s.enrollments > 0)
        list.push({ id: 2, icon: 'book', text: `${s.enrollments} inscription(s) globale(s) enregistrée(s)`, time: 'En temps réel', read: false });
      if (s.courses > 0)
        list.push({ id: 3, icon: 'check', text: `${s.courses} formations certifiantes publiées et actives`, time: 'En ligne', read: false });
      if (s.comments > 0)
        list.push({ id: 4, icon: 'chat', text: `${s.comments} avis & questions dans la communauté`, time: 'Récemment', read: true });
      if (list.length === 0)
        list.push({ id: 5, icon: 'check', text: 'Tout est en ordre. Aucune alerte active.', time: 'Maintenant', read: true });
      setNotifs(list);
      setUnread(list.filter(n => !n.read).length);
    } catch { /* notifications are optional; ignore failures */ }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    setUnread(0);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setShowNotif(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const adminMenuItems = [
    { icon: <PieChart size={19} />, label: 'Tableau de Bord', path: '/admin' },
    { icon: <BookOpen size={19} />, label: 'Formations & Modules', path: '/admin/courses' },
    { icon: <Users size={19} />, label: 'Gestion Apprenants', path: '/admin/users' },
    { icon: <Settings size={19} />, label: 'Réglages Système', path: '/admin/settings' },
  ];

  const studentShortcuts = [
    { icon: <LayoutGrid size={17} />, label: 'Espace Étudiant (Home)', path: '/dashboard' },
    { icon: <Compass size={17} />, label: 'Catalogue Public', path: '/catalogue' },
    { icon: <MessageSquare size={17} />, label: 'Communauté d\'Entraide', path: '/communaute' },
    { icon: <Calendar size={17} />, label: 'Agenda & Ateliers', path: '/calendrier' },
    { icon: <Award size={17} />, label: 'Certifications', path: '/certificats' },
  ];

  const notifIcon = (type) => {
    if (type === 'user') return <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(112,0,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa', flexShrink: 0 }}><UserPlus size={16} /></div>;
    if (type === 'book') return <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(0,209,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', flexShrink: 0 }}><BookMarked size={16} /></div>;
    if (type === 'chat') return <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(251,191,36,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24', flexShrink: 0 }}><MessageCircle size={16} /></div>;
    return <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(74,222,128,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4ade80', flexShrink: 0 }}><CheckCheck size={16} /></div>;
  };

  return (
    <div className={`admin-layout ${sidebarOpen ? 'menu-open' : ''}`}>
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 99,
          }}
        />
      )}
      <aside className="admin-sidebar" style={{ zIndex: 100 }}>
        <div className="admin-brand" onClick={() => navigate('/admin')}>
          <div className="brand-logo"><ShieldCheck size={24} /></div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1.15rem', lineHeight: 1.2 }}>MR1 Academy</span>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#a78bfa', letterSpacing: '0.8px', textTransform: 'uppercase' }}>Admin Console Pro</span>
          </div>
        </div>

        <nav className="admin-nav">
          <div className="nav-section-label">Administration</div>
          {adminMenuItems.map(item => (
            <div
              key={item.path}
              className={`admin-nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}

          {/* ─── Switcher to Student Experience ─── */}
          <div className="nav-section-label" style={{ marginTop: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Espace Plateforme</span>
            <span style={{ fontSize: '0.62rem', background: 'rgba(112,0,255,0.15)', color: '#a78bfa', padding: '1px 6px', borderRadius: 6, fontWeight: 700 }}>Étudiant</span>
          </div>
          {studentShortcuts.map(item => (
            <div
              key={item.path}
              className="admin-nav-item"
              onClick={() => navigate(item.path)}
              style={{ fontSize: '0.86rem', opacity: 0.88 }}
            >
              {item.icon}
              <span style={{ flex: 1 }}>{item.label}</span>
              <ChevronRight size={13} style={{ opacity: 0.4 }} />
            </div>
          ))}
        </nav>

        {/* User Card */}
        <div className="admin-user-card" onClick={handleLogout} title="Cliquer pour vous déconnecter">
          <div className="user-avatar">{user?.name?.[0] || 'A'}</div>
          <div className="user-info">
            <p className="user-name">{user?.name || 'Administrateur'}</p>
            <p className="user-role" style={{ color: '#4ade80', fontWeight: 700 }}>Super Administrateur</p>
          </div>
          <LogOut size={18} style={{ opacity: 0.7 }} />
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
            <Menu size={22} className="desktop-hide" onClick={() => setSidebarOpen(p => !p)} />
            
            {/* Quick Switch Button to Student View */}
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.95rem',
                borderRadius: '12px',
                background: 'rgba(112, 0, 255, 0.12)',
                border: '1px solid rgba(167, 139, 250, 0.35)',
                color: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(112, 0, 255, 0.25)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(112, 0, 255, 0.12)'}
              title="Tester et voir la plateforme en tant qu'étudiant"
            >
              <ExternalLink size={15} color="#00d1ff" />
              <span>Voir en Mode Étudiant</span>
            </button>
          </div>

          <div className="admin-header-actions">
            {/* Live refresh data button */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: isRefreshing ? '#a78bfa' : '#8b8b9c',
                  transition: '0.2s',
                }}
                title="Actualiser les données en temps réel"
              >
                <RefreshCw size={17} className={isRefreshing ? 'spin-slow' : ''} />
              </button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#8b8b9c',
                transition: '0.2s',
              }}
              title={theme === 'dark' ? 'Passer en Mode Clair' : 'Passer en Mode Sombre'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notification Bell */}
            <div ref={bellRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotif(v => !v)}
                style={{
                  width: 42, height: 42, borderRadius: 12,
                  background: showNotif ? 'rgba(112,0,255,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${showNotif ? 'rgba(112,0,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: showNotif ? '#a78bfa' : '#8b8b9c',
                  position: 'relative', transition: '0.2s'
                }}
                title="Notifications en direct"
              >
                <Bell size={18} />
                {unread > 0 && (
                  <span style={{
                    position: 'absolute', top: -4, right: -4,
                    minWidth: 18, height: 18, background: '#ff0055',
                    borderRadius: 10, fontSize: 10, fontWeight: 800,
                    color: 'white', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', padding: '0 4px',
                    boxShadow: '0 0 10px rgba(255,0,85,0.5)'
                  }}>{unread}</span>
                )}
              </button>

              {/* Dropdown */}
              {showNotif && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 12px)', right: 0,
                  width: 340, background: 'var(--bg-secondary)',
                  border: '1px solid var(--glass-border)', borderRadius: 20,
                  boxShadow: '0 24px 60px rgba(0,0,0,0.7)', zIndex: 9999,
                  overflow: 'hidden', animation: 'notif-in 0.2s ease'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 1.25rem', borderBottom: '1px solid var(--glass-border)' }}>
                    <div>
                      <p style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>Notifications Live</p>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{unread} non lue(s)</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {unread > 0 && (
                        <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: '#a78bfa', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>Tout lire</button>
                      )}
                      <button onClick={() => setShowNotif(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}><X size={16} /></button>
                    </div>
                  </div>
                  <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                    {notifs.map(n => (
                      <div key={n.id} style={{
                        display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                        padding: '0.9rem 1.25rem',
                        background: n.read ? 'transparent' : 'rgba(112,0,255,0.04)',
                        borderBottom: '1px solid var(--glass-border)',
                        cursor: 'pointer', transition: 'background 0.15s'
                      }}>
                        {notifIcon(n.icon)}
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '0.82rem', fontWeight: n.read ? 500 : 700, color: n.read ? 'var(--text-muted)' : 'var(--text-main)', lineHeight: 1.4 }}>{n.text}</p>
                          <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 4 }}>{n.time}</p>
                        </div>
                        {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#7000ff', flexShrink: 0, marginTop: 4 }} />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="admin-status-pill">
              <div className="status-dot online"></div>
              <span>En Ligne (Railway Live)</span>
            </div>
          </div>
        </header>

        <div className="admin-content-scroller">
          {children}
        </div>
      </div>

      <style>{`
        @keyframes notif-in {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
