import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, PieChart, BookOpen, Users, 
  Settings, LogOut, Bell, Search, Menu
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useApp();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { icon: <PieChart size={20} />,   label: 'Dashboard', path: '/admin' },
    { icon: <BookOpen size={20} />,   label: 'Cours',     path: '/admin/courses' },
    { icon: <Users size={20} />,      label: 'Apprenants',path: '/admin/users' },
  ];

  return (
    <div className="admin-layout">
      {/* ───── Admin Sidebar ───── */}
      <aside className="admin-sidebar">
        <div className="admin-brand" onClick={() => navigate('/')}>
          <div className="brand-logo"><ShieldCheck size={24} /></div>
          <span>VibeCommand</span>
        </div>

        <nav className="admin-nav">
          <div className="nav-section-label">Menu Principal</div>
          {menuItems.map(item => (
            <div 
              key={item.path} 
              className={`admin-nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}

          <div className="nav-section-label" style={{ marginTop: '2rem' }}>Paramètres</div>
          <div className="admin-nav-item" onClick={() => navigate('/settings')}>
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

      {/* ───── Admin Main Content ───── */}
      <div className="admin-main">
        <header className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1 }}>
            <Menu size={22} className="desktop-hide" />
            <div className="admin-search-bar">
              <Search size={18} />
              <input type="text" placeholder="Rechercher des logs, cours, utilisateurs..." />
            </div>
          </div>
          <div className="admin-header-actions">
            <div className="header-icon-btn"><Bell size={20} /><span className="badge">3</span></div>
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
    </div>
  );
};

export default AdminLayout;
