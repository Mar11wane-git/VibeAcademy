import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, LayoutGrid, MonitorPlay, Bookmark, Award, LogOut, ShieldCheck, Compass, Users, Calendar } from 'lucide-react';
import api from '../services/api';
import { useApp } from '../context/AppContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, user } = useApp();

  let navItems = [];

  navItems = [
    { icon: <LayoutGrid size={20} />, label: t('dashboard'), path: '/dashboard' },
    { icon: <Compass size={20} />, label: t('catalogue'), path: '/catalogue' },
    { icon: <MonitorPlay size={20} />, label: t('mes_cours'), path: '/mes-cours' },
    { icon: <Users size={20} />, label: t('communaute'), path: '/communaute' },
    { icon: <Calendar size={20} />, label: t('calendrier'), path: '/calendrier' },
    { icon: <Bookmark size={20} />, label: t('favoris'), path: '/favoris' },
    { icon: <Award size={20} />, label: t('certificats'), path: '/certificats' },
  ];

  if (user?.is_admin) {
    navItems.unshift(
      { icon: <ShieldCheck size={20} />, label: 'Admin Panel', path: '/admin' }
    );
  }

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch { }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="sidebar">
      <div className="brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <div className="brand-icon"><BookOpen size={20} strokeWidth={2.5} /></div>
        VibeAcademy
      </div>

      <div className="nav-menu">
        {navItems.map(item => (
          <div
            key={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            {item.icon}
            <span>{item.label}</span>
          </div>
        ))}

        <div style={{ flex: 1 }} />

        <div className="nav-item" onClick={handleLogout}>
          <LogOut size={20} />
          <span>{t('logout')}</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
