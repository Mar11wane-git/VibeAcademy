import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, PieChart, BookOpen, Users, 
  Settings, LogOut, Bell, Search, Menu,
  UserPlus, BookMarked, MessageCircle, X, CheckCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import api from '../services/api';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useApp();
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
      if (s.new_enrollments_month > 0)
        list.push({ id: 2, icon: 'book', text: `${s.new_enrollments_month} nouvelle(s) inscription(s) aux cours`, time: 'Ce mois', read: false });
      if (s.threads > 0)
        list.push({ id: 3, icon: 'chat', text: `${s.threads} thread(s) actif(s) dans la communauté`, time: 'Récemment', read: false });
      if (s.comments > 0)
        list.push({ id: 4, icon: 'chat', text: `${s.comments} commentaire(s) sur les cours`, time: 'Récemment', read: true });
      if (list.length === 0)
        list.push({ id: 5, icon: 'check', text: 'Tout est en ordre. Aucune alerte active.', time: 'Maintenant', read: true });
      setNotifs(list);
      setUnread(list.filter(n => !n.read).length);
    } catch { /* notifications are optional; ignore failures */ }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const menuItems = [
    { icon: <PieChart size={20} />,  label: 'Dashboard',  path: '/admin' },
    { icon: <BookOpen size={20} />,  label: 'Cours',      path: '/admin/courses' },
    { icon: <Users size={20} />,     label: 'Apprenants', path: '/admin/users' },
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
        <div className="admin-brand" onClick={() => navigate('/')}>
          <div className="brand-logo"><ShieldCheck size={24} /></div>
          <span>VibeCommand</span>
        </div>
        <nav className="admin-nav">
          <div className="nav-section-label">Menu Principal</div>
          {menuItems.map(item => (
            <div key={item.path} className={`admin-nav-item ${location.pathname === item.path ? 'active' : ''}`} onClick={() => navigate(item.path)}>
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
          <div className="nav-section-label" style={{ marginTop: '2rem' }}>Paramètres</div>
          <div className={`admin-nav-item ${location.pathname === '/admin/settings' ? 'active' : ''}`} onClick={() => navigate('/admin/settings')}>
            <Settings size={20} />
            <span>Réglages Système</span>
          </div>
        </nav>
        <div className="admin-user-card" onClick={handleLogout}>
          <div className="user-avatar">{user?.name?.[0]}</div>
          <div className="user-info">
            <p className="user-name">{user?.name}</p>
            <p className="user-role">Super Administrateur</p>
          </div>
          <LogOut size={18} />
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1 }}>
            <Menu size={22} className="desktop-hide" onClick={() => setSidebarOpen(p => !p)} />
            <div className="admin-search-bar">
              <Search size={18} />
              <input type="text" placeholder="Rechercher cours, apprenants, logs..." />
            </div>
          </div>
          <div className="admin-header-actions">

            {/* ─── Notification Bell ─── */}
            <div ref={bellRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotif(v => !v)}
                style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: showNotif ? 'rgba(112,0,255,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${showNotif ? 'rgba(112,0,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: showNotif ? '#a78bfa' : '#8b8b9c',
                  position: 'relative', transition: '0.2s'
                }}
              >
                <Bell size={20} />
                {unread > 0 && (
                  <span style={{
                    position: 'absolute', top: -5, right: -5,
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
                      <p style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>Notifications</p>
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
              Système Online
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
