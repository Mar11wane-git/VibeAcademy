import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, PieChart, BookOpen, Users, 
  Settings, LogOut, Bell, Menu,
  UserPlus, BookMarked, MessageCircle, X, CheckCheck,
  Moon, Sun, RefreshCw, CheckSquare, Terminal, Server,
  ChevronRight, Activity, ShieldAlert
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
        list.push({ id: 1, icon: 'user', text: `${s.new_users_month} nouvel(s) inscrit(s) ce mois`, time: 'Ce mois', read: false });
      if (s.enrollments > 0)
        list.push({ id: 2, icon: 'book', text: `${s.enrollments} inscriptions totales aux cours enregistrées`, time: 'Base active', read: false });
      if (s.courses > 0)
        list.push({ id: 3, icon: 'check', text: `${s.courses} formations certifiantes publiées`, time: 'En ligne', read: false });
      if (s.comments > 0)
        list.push({ id: 4, icon: 'chat', text: `${s.comments} avis et commentaires enregistrés`, time: 'Récent', read: true });
      if (list.length === 0)
        list.push({ id: 5, icon: 'check', text: 'Système nominal. Aucune alerte de sécurité.', time: 'Maintenant', read: true });
      setNotifs(list);
      setUnread(list.filter(n => !n.read).length);
    } catch { /* notifications are optional */ }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    setUnread(0);
  };

  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setShowNotif(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navSections = [
    {
      label: 'Supervision & Pilotage',
      items: [
        { icon: <PieChart size={19} />, label: 'Tableau de Bord KPI', path: '/admin' },
      ]
    },
    {
      label: 'Gestion Plateforme',
      items: [
        { icon: <BookOpen size={19} />, label: 'Formations & Modules', path: '/admin/courses' },
        { icon: <Users size={19} />, label: 'Apprenants & Rôles', path: '/admin/users' },
      ]
    },
    {
      label: 'Développement & Roadmap',
      items: [
        { icon: <CheckSquare size={19} />, label: 'Tâches & Backlog Dev', path: '/admin/tasks' },
      ]
    },
    {
      label: 'Opérations & Sécurité',
      items: [
        { icon: <Settings size={19} />, label: 'Réglages & Système', path: '/admin/settings' },
      ]
    }
  ];

  const notifIcon = (type) => {
    if (type === 'user') return <div style={{ width: 34, height: 34, borderRadius: '10px', background: 'rgba(112,0,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa', flexShrink: 0 }}><UserPlus size={16} /></div>;
    if (type === 'book') return <div style={{ width: 34, height: 34, borderRadius: '10px', background: 'rgba(0,209,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', flexShrink: 0 }}><BookMarked size={16} /></div>;
    if (type === 'chat') return <div style={{ width: 34, height: 34, borderRadius: '10px', background: 'rgba(251,191,36,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24', flexShrink: 0 }}><MessageCircle size={16} /></div>;
    return <div style={{ width: 34, height: 34, borderRadius: '10px', background: 'rgba(74,222,128,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4ade80', flexShrink: 0 }}><CheckCheck size={16} /></div>;
  };

  return (
    <div className={`admin-layout ${sidebarOpen ? 'menu-open' : ''}`}>
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 99,
          }}
        />
      )}

      {/* ─── PURE ADMIN SIDEBAR ─── */}
      <aside className="admin-sidebar" style={{ zIndex: 100 }}>
        <div className="admin-brand" onClick={() => navigate('/admin')}>
          <div className="brand-logo" style={{ background: 'linear-gradient(135deg, #7000ff 0%, #00d1ff 100%)' }}>
            <ShieldCheck size={24} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: 900, letterSpacing: '-0.3px', color: '#ffffff' }}>MR1 Command</span>
            <span style={{ fontSize: '0.64rem', fontWeight: 800, color: '#00d1ff', letterSpacing: '0.9px', textTransform: 'uppercase' }}>Super Admin Backoffice</span>
          </div>
        </div>

        <nav className="admin-nav" style={{ padding: '1rem 0.75rem' }}>
          {navSections.map((sec, sIdx) => (
            <div key={sIdx} style={{ marginBottom: '1.25rem' }}>
              <div className="nav-section-label" style={{ margin: '0.5rem 0 0.4rem', padding: '0 0.75rem' }}>
                {sec.label}
              </div>
              {sec.items.map(item => (
                <div
                  key={item.path}
                  className={`admin-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  {item.icon}
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {location.pathname === item.path && (
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00d1ff', boxShadow: '0 0 8px #00d1ff' }} />
                  )}
                </div>
              ))}
            </div>
          ))}
        </nav>

        {/* Super Admin Identity Badge */}
        <div className="admin-user-card" onClick={handleLogout} title="Cliquer pour vous déconnecter du Backoffice">
          <div className="user-avatar" style={{ background: 'linear-gradient(135deg, #7000ff, #00d1ff)' }}>
            {user?.name?.[0] || 'M'}
          </div>
          <div className="user-info">
            <p className="user-name">{user?.name || 'Marwane'}</p>
            <p className="user-role" style={{ color: '#00d1ff', fontWeight: 800 }}>SUPER ADMINISTRATEUR</p>
          </div>
          <LogOut size={17} style={{ opacity: 0.7 }} />
        </div>
      </aside>

      {/* ─── PURE ADMIN MAIN ─── */}
      <div className="admin-main">
        <header className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
            <Menu size={22} className="desktop-hide" onClick={() => setSidebarOpen(p => !p)} />
            
            {/* Environment Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.74rem',
              fontWeight: 700,
              color: '#94a3b8'
            }}>
              <Terminal size={14} color="#00d1ff" />
              <span>CONSOLE DE GESTION ADMINISTRATIVE</span>
            </div>
          </div>

          <div className="admin-header-actions">
            {/* Live refresh data button */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: isRefreshing ? '#00d1ff' : '#94a3b8',
                  transition: '0.2s',
                }}
                title="Actualiser les données de la base en direct"
              >
                <RefreshCw size={16} className={isRefreshing ? 'spin-slow' : ''} />
              </button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#94a3b8',
                transition: '0.2s',
              }}
              title={theme === 'dark' ? 'Mode Clair' : 'Mode Sombre'}
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Notification Bell */}
            <div ref={bellRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotif(v => !v)}
                style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: showNotif ? 'rgba(112,0,255,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${showNotif ? 'rgba(112,0,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: showNotif ? '#a78bfa' : '#94a3b8',
                  position: 'relative', transition: '0.2s'
                }}
                title="Notifications Système"
              >
                <Bell size={17} />
                {unread > 0 && (
                  <span style={{
                    position: 'absolute', top: -3, right: -3,
                    minWidth: 16, height: 16, background: '#ff0055',
                    borderRadius: 10, fontSize: 9, fontWeight: 900,
                    color: 'white', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', padding: '0 3px',
                    boxShadow: '0 0 10px rgba(255,0,85,0.5)'
                  }}>{unread}</span>
                )}
              </button>

              {/* Dropdown */}
              {showNotif && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 12px)', right: 0,
                  width: 340, background: 'var(--bg-secondary)',
                  border: '1px solid var(--glass-border)', borderRadius: 18,
                  boxShadow: '0 24px 60px rgba(0,0,0,0.8)', zIndex: 9999,
                  overflow: 'hidden', animation: 'notif-in 0.2s ease'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid var(--glass-border)' }}>
                    <div>
                      <p style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-main)', margin: 0 }}>Alertes Administrateur</p>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>{unread} alerte(s) en attente</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {unread > 0 && (
                        <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: '#00d1ff', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>Tout acquitter</button>
                      )}
                      <button onClick={() => setShowNotif(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}><X size={16} /></button>
                    </div>
                  </div>
                  <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                    {notifs.map(n => (
                      <div key={n.id} style={{
                        display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                        padding: '0.85rem 1.15rem',
                        background: n.read ? 'transparent' : 'rgba(112,0,255,0.04)',
                        borderBottom: '1px solid var(--glass-border)',
                        cursor: 'pointer'
                      }}>
                        {notifIcon(n.icon)}
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '0.8rem', fontWeight: n.read ? 500 : 700, color: n.read ? 'var(--text-muted)' : 'var(--text-main)', margin: 0, lineHeight: 1.35 }}>{n.text}</p>
                          <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', margin: '3px 0 0' }}>{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Production Railway Indicator */}
            <div className="admin-status-pill" style={{ background: 'rgba(0, 209, 255, 0.08)', borderColor: 'rgba(0, 209, 255, 0.25)', color: '#00d1ff' }}>
              <div className="status-dot online" style={{ background: '#00d1ff', boxShadow: '0 0 8px #00d1ff' }}></div>
              <span>Railway PostgreSQL · Production</span>
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