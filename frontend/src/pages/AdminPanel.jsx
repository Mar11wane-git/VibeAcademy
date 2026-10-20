import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Users, BookOpen, MessageSquare,
  Trash2, Plus, Edit, X, Lock,
  BarChart3, Search,
  RefreshCw, Award, Shield, Film, Clock, Link as LinkIcon,
  ExternalLink, CheckCircle2, AlertTriangle, Layers,
  Compass, Eye, Sparkles, Filter, Activity
} from 'lucide-react';
import api from '../services/api';
import AdminLayout from '../layouts/AdminLayout';
import { getCourseCover, getCourseTechMeta, COURSE_COVER_PRESETS } from '../utils/certificationEngine';

const inputStyle = {
  background: 'var(--bg-primary)',
  border: '1px solid var(--glass-border)',
  padding: '0.8rem 1rem',
  borderRadius: '12px',
  color: '#fff',
  width: '100%',
  fontSize: '0.9rem',
  outline: 'none',
  transition: 'border-color 0.2s',
};

const AdminPanel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [systemSettings, setSystemSettings] = useState({
    maintenance_mode: '0',
    allow_registrations: '1',
    auto_emails: '1',
    maintenance_message: ''
  });

  const [stats, setStats]         = useState(null);
  const [courses, setCourses]     = useState([]);
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTech, setSelectedTech] = useState('ALL');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL'); // ALL, ADMIN, USER

  // Course modal state
  const [modalType, setModalType]       = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [newCourse, setNewCourse]   = useState({ title: '', description: '', thumbnail: '' });
  const [editCourse, setEditCourse] = useState({ title: '', description: '', thumbnail: '' });

  // Module modal state
  const [moduleCourse, setModuleCourse]   = useState(null);
  const [moduleList, setModuleList]       = useState([]);
  const [newModule, setNewModule]         = useState({ title: '', video_url: '', duration: '' });
  const [addingModule, setAddingModule]   = useState(false);

  // Confirmation modal state
  const [confirmModal, setConfirmModal]   = useState(null);

  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const path = location.pathname;
    if (path === '/admin/courses') setActiveTab('Courses');
    else if (path === '/admin/users') setActiveTab('Students');
    else if (path === '/admin/settings') setActiveTab('Settings');
    else setActiveTab('Dashboard');
  }, [location.pathname]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sRes, cRes, uRes, setRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/courses'),
        api.get('/admin/users'),
        api.get('/admin/settings').catch(() => ({ data: {} }))
      ]);
      setStats(sRes.data);
      setCourses(cRes.data || []);
      setUsers(uRes.data || []);
      if (setRes.data) setSystemSettings(prev => ({ ...prev, ...setRes.data }));
    } catch {
      showToast('Erreur lors de la synchronisation avec le serveur.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveSettings = async () => {
    try {
      await api.post('/admin/settings', systemSettings);
      showToast('Configurations système synchronisées avec succès !');
    } catch {
      showToast('Échec de la mise à jour des réglages.', 'error');
    }
  };

  // ── Course handlers ──────────────────────────────────────
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newCourse,
        thumbnail: newCourse.thumbnail || getCourseCover(newCourse),
      };
      await api.post('/courses', payload);
      setModalType(null);
      setNewCourse({ title: '', description: '', thumbnail: '' });
      fetchData();
      showToast('Nouvelle formation publiée avec succès !');
    } catch {
      showToast("Erreur lors de la publication du cours.", 'error');
    }
  };

  const handleEditCourse = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;
    try {
      const payload = {
        ...editCourse,
        thumbnail: editCourse.thumbnail || getCourseCover(editCourse),
      };
      await api.put(`/courses/${selectedCourse.id}`, payload);
      setModalType(null);
      fetchData();
      showToast('Formation mise à jour avec succès.');
    } catch {
      showToast("Mise à jour échouée.", 'error');
    }
  };

  const handleDeleteCourse = (course) => {
    setConfirmModal({
      title: 'Supprimer cette formation ?',
      message: `Êtes-vous certain de vouloir supprimer définitivement le cours "${course.title}" ainsi que tous ses modules et inscriptions associées ?`,
      onConfirm: async () => {
        try {
          await api.delete(`/admin/courses/${course.id}`);
          showToast('Formation supprimée définitivement.');
          fetchData();
        } catch {
          showToast('Erreur lors de la suppression.', 'error');
        } finally {
          setConfirmModal(null);
        }
      }
    });
  };

  // ── Module handlers ──────────────────────────────────────
  const openModules = (course) => {
    setModuleCourse(course);
    setModuleList(course.modules ? [...course.modules].sort((a, b) => a.order - b.order) : []);
    setNewModule({ title: '', video_url: '', duration: '' });
    setModalType('modules');
  };

  const handleAddModule = async (e) => {
    e.preventDefault();
    if (!newModule.title || !newModule.video_url || !newModule.duration) {
      showToast('Remplissez tous les champs du module.', 'error');
      return;
    }
    setAddingModule(true);
    try {
      const res = await api.post(`/admin/courses/${moduleCourse.id}/modules`, newModule);
      setModuleList(prev => [...prev, res.data]);
      setNewModule({ title: '', video_url: '', duration: '' });
      showToast('Module vidéo ajouté avec succès !');
      fetchData();
    } catch {
      showToast("Erreur d'ajout du module.", 'error');
    } finally {
      setAddingModule(false);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    try {
      await api.delete(`/admin/courses/${moduleCourse.id}/modules/${moduleId}`);
      setModuleList(prev => prev.filter(m => m.id !== moduleId).map((m, i) => ({ ...m, order: i + 1 })));
      showToast('Module supprimé.');
      fetchData();
    } catch {
      showToast("Erreur de suppression du module.", 'error');
    }
  };

  // ── User handlers ────────────────────────────────────────
  const handleToggleAdmin = (u) => {
    const nextRole = u.is_admin ? 'étudiant' : 'administrateur';
    setConfirmModal({
      title: `Changer les droits d'accès`,
      message: `Voulez-vous modifier les privilèges de ${u.name} pour en faire un ${nextRole} ?`,
      onConfirm: async () => {
        try {
          const res = await api.post(`/admin/users/${u.id}/toggle-admin`);
          showToast(res.data.message || `Rôle mis à jour.`);
          fetchData();
        } catch {
          showToast('Droit de modification refusé.', 'error');
        } finally {
          setConfirmModal(null);
        }
      }
    });
  };

  const handleDeleteUser = (u) => {
    setConfirmModal({
      title: 'Bannir / Supprimer cet utilisateur ?',
      message: `Êtes-vous certain de vouloir supprimer le compte de ${u.name} (${u.email}) ? Cette action est irréversible.`,
      onConfirm: async () => {
        try {
          await api.delete(`/admin/users/${u.id}`);
          showToast('Utilisateur supprimé.');
          fetchData();
        } catch {
          showToast('Erreur lors de la suppression.', 'error');
        } finally {
          setConfirmModal(null);
        }
      }
    });
  };

  // ── Filtered data ────────────────────────────────────────
  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!matchesSearch) return false;
      if (selectedTech === 'ALL') return true;
      const meta = getCourseTechMeta(c);
      return meta.badge.toLowerCase().includes(selectedTech.toLowerCase()) ||
        c.title.toLowerCase().includes(selectedTech.toLowerCase());
    });
  }, [courses, searchQuery, selectedTech]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (userRoleFilter === 'ADMIN') return Boolean(u.is_admin);
      if (userRoleFilter === 'USER') return !u.is_admin;
      return true;
    });
  }, [users, searchQuery, userRoleFilter]);

  const chartData  = stats?.monthly_registrations || [];
  const topCourses = stats?.top_courses || [];
  const recentUsers = stats?.recent_users || [];

  return (
    <AdminLayout onRefresh={fetchData} isRefreshing={loading}>
      <div style={{ padding: '2rem 2.5rem', width: '100%', maxWidth: '1440px', margin: '0 auto' }}>

        {/* ─── Header & Search Banner ─── */}
        <div className="governance-header" style={{ marginBottom: '2rem' }}>
          <div>
            <div className="security-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.6rem' }}>
              <Lock size={12} />
              <span>SUPER ADMIN CONSOLE · TEMPS RÉEL</span>
            </div>
            <h1 className="brand-font" style={{ fontSize: '2.3rem', margin: 0, lineHeight: 1.2 }}>
              Centre de Gestion & Pilotage
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '0.45rem' }}>
              Supervisez les apprenants, administrez le catalogue certifiant et pilotez MR1 Academy.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="admin-search-bar" style={{ width: 260 }}>
              <Search size={16} />
              <input
                type="text"
                placeholder="Recherche dynamique..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 0 }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              className="btn-pro btn-pro-primary"
              onClick={() => {
                setNewCourse({ title: '', description: '', thumbnail: '' });
                setModalType('course');
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.65rem 1.15rem' }}
            >
              <Plus size={18} />
              <span>Nouveau Cours</span>
            </button>
          </div>
        </div>

        {/* ─── Pro Tabs Navigation ─── */}
        <div className="admin-tab-nav" style={{ marginBottom: '2.5rem' }}>
          {[
            { id: 'Dashboard', icon: BarChart3, label: 'Tableau de Bord & Métriques' },
            { id: 'Courses',   icon: BookOpen,  label: `Catalogue Formations (${courses.length})` },
            { id: 'Students',  icon: Users,     label: `Gestion Apprenants (${users.length})` },
            { id: 'Settings',  icon: Shield,    label: 'Système & Maintenance' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`admin-tab-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex-center" style={{ flexDirection: 'column', gap: '1.25rem', height: '45vh' }}>
            <RefreshCw size={38} className="spin-slow" color="#a78bfa" />
            <p className="brand-font" style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Synchronisation des données en temps réel...
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">

            {/* ══════════════════════════════════════════════════════
                1. DASHBOARD & LIVE STATS
            ══════════════════════════════════════════════════════ */}
            {activeTab === 'Dashboard' && (
              <motion.div key="dash" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {/* Stat Grid */}
                <div className="stat-grid" style={{ marginBottom: '2rem' }}>
                  <StatCard
                    label="Apprenants Inscrits"
                    value={stats?.users || 0}
                    subtext={`+${stats?.new_users_month || 0} ce mois-ci`}
                    icon={<Users size={22} />}
                    color="#a78bfa"
                  />
                  <StatCard
                    label="Formations Certifiantes"
                    value={stats?.courses || 0}
                    subtext="En ligne sur le catalogue"
                    icon={<BookOpen size={22} />}
                    color="#0bd1ff"
                  />
                  <StatCard
                    label="Taux de Réussite Global"
                    value={stats?.completion_rate || 0}
                    unit="%"
                    subtext="Progression des inscrits"
                    icon={<Award size={22} />}
                    color="#4ade80"
                  />
                  <StatCard
                    label="Inscriptions aux Formations"
                    value={stats?.enrollments || 0}
                    subtext="Total cours suivis"
                    icon={<Layers size={22} />}
                    color="#f59e0b"
                  />
                </div>

                {/* Charts Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.75rem', marginBottom: '2.5rem' }}>
                  
                  {/* Monthly Registrations Chart */}
                  <div className="glass-card" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h3 className="brand-font" style={{ fontSize: '1.15rem', margin: 0 }}>
                        Inscriptions Mensuelles (6 derniers mois)
                      </h3>
                      <span style={{ fontSize: '0.72rem', background: 'rgba(112,0,255,0.15)', color: '#a78bfa', padding: '0.2rem 0.6rem', borderRadius: 8, fontWeight: 700 }}>
                        Live DB
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '180px', paddingBottom: '0.5rem' }}>
                      {chartData.map((d, i) => {
                        const maxCount = Math.max(...chartData.map(x => x.count)) || 1;
                        const heightPercent = (d.count / maxCount) * 100;
                        return (
                          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', height: '100%' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: d.count > 0 ? '#ffffff' : 'var(--text-muted)' }}>
                              {d.count}
                            </span>
                            <div style={{ width: '100%', flex: 1, background: 'rgba(255,255,255,0.02)', borderRadius: '10px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', border: '1px solid rgba(255,255,255,0.04)' }}>
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${Math.max(heightPercent, d.count > 0 ? 8 : 3)}%` }}
                                transition={{ duration: 0.6, delay: i * 0.08 }}
                                style={{
                                  width: '100%',
                                  background: d.count > 0 ? 'var(--gradient-magic)' : 'rgba(112,0,255,0.08)',
                                  borderRadius: '6px',
                                  boxShadow: d.count > 0 ? '0 0 15px rgba(112,0,255,0.3)' : 'none'
                                }}
                              />
                            </div>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
                              {d.month}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Top Courses */}
                  <div className="glass-card" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h3 className="brand-font" style={{ fontSize: '1.15rem', margin: 0 }}>
                        Formations les Plus Populaires
                      </h3>
                      <button
                        onClick={() => setActiveTab('Courses')}
                        style={{ background: 'none', border: 'none', color: '#0bd1ff', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        Voir tout <ExternalLink size={12} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      {topCourses.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                          Aucune donnée d'inscription disponible.
                        </p>
                      ) : topCourses.map((c, idx) => {
                        const maxEnroll = Math.max(...topCourses.map(x => x.enrollments_count)) || 1;
                        return (
                          <div key={c.id}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem', alignItems: 'center' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ width: 18, height: 18, borderRadius: 6, background: 'rgba(255,255,255,0.05)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 800, color: '#a78bfa' }}>
                                  #{idx + 1}
                                </span>
                                {c.title}
                              </span>
                              <span style={{ color: '#0bd1ff', fontWeight: 800, fontSize: '0.8rem' }}>
                                {c.enrollments_count} élève{c.enrollments_count > 1 ? 's' : ''}
                              </span>
                            </div>
                            <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', overflow: 'hidden' }}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(c.enrollments_count / maxEnroll) * 100 || 4}%` }}
                                transition={{ duration: 0.8, delay: idx * 0.1 }}
                                style={{ height: '100%', background: 'var(--gradient-cyber)', borderRadius: '100px' }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* ─── Recent Registrations Table ─── */}
                <div className="glass-card" style={{ padding: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                      <h3 className="brand-font" style={{ fontSize: '1.15rem', margin: 0 }}>
                        Derniers Apprenants Inscrits
                      </h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                        Nouveaux membres ayant rejoint la plateforme récemment
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('Students')}
                      className="btn-pro"
                      style={{ padding: '0.45rem 0.9rem', fontSize: '0.78rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1' }}
                    >
                      Gérer tous les apprenants
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {recentUsers.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem' }}>
                        Aucun utilisateur récent enregistré.
                      </p>
                    ) : recentUsers.map(u => (
                      <div
                        key={u.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.85rem 1.15rem',
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '14px',
                          gap: '1rem',
                          flexWrap: 'wrap'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <div style={{
                            width: 38, height: 38, borderRadius: '12px',
                            background: u.is_admin ? 'linear-gradient(135deg, #7000ff, #00d1ff)' : 'rgba(255,255,255,0.06)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 800, color: '#fff', fontSize: '0.85rem'
                          }}>
                            {u.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p style={{ fontWeight: 700, fontSize: '0.88rem', margin: 0, color: 'var(--text-main)' }}>{u.name}</p>
                            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0 }}>{u.email}</p>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {new Date(u.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          <span style={{
                            fontSize: '0.66rem',
                            fontWeight: 800,
                            padding: '0.2rem 0.55rem',
                            borderRadius: '8px',
                            background: u.is_admin ? 'rgba(112,0,255,0.15)' : 'rgba(74,222,128,0.1)',
                            color: u.is_admin ? '#a78bfa' : '#4ade80',
                            border: `1px solid ${u.is_admin ? 'rgba(112,0,255,0.3)' : 'rgba(74,222,128,0.2)'}`
                          }}>
                            {u.is_admin ? 'SUPER ADMIN' : 'APPRENANT'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════
                2. COURSES MANAGEMENT
            ══════════════════════════════════════════════════════ */}
            {activeTab === 'Courses' && (
              <motion.div key="courses" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Tech category filter pills */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.4rem' }}>
                  {['ALL', 'Java', 'React', 'Python', 'Flutter', 'DevOps', 'Docker'].map(tech => (
                    <button
                      key={tech}
                      onClick={() => setSelectedTech(tech)}
                      style={{
                        padding: '0.45rem 0.9rem',
                        borderRadius: '10px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: selectedTech === tech ? 'var(--accent-purple)' : 'rgba(255,255,255,0.03)',
                        color: selectedTech === tech ? '#ffffff' : 'var(--text-muted)',
                        border: `1px solid ${selectedTech === tech ? 'var(--accent-purple)' : 'var(--glass-border)'}`,
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {tech === 'ALL' ? 'Toutes les catégories' : tech}
                    </button>
                  ))}
                </div>

                {filteredCourses.length === 0 ? (
                  <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <BookOpen size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    <h3 className="brand-font" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Aucune formation trouvée</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Essayez d'ajuster votre recherche ou ajoutez un nouveau cours.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filteredCourses.map(c => {
                      const meta = getCourseTechMeta(c);
                      return (
                        <div
                          key={c.id}
                          className="glass-card"
                          style={{
                            padding: '1.25rem 1.5rem',
                            display: 'grid',
                            gridTemplateColumns: '120px 1fr auto auto auto',
                            gap: '1.5rem',
                            alignItems: 'center',
                            transition: 'border-color 0.2s'
                          }}
                        >
                          <img
                            src={getCourseCover(c)}
                            alt={c.title}
                            style={{
                              width: 120,
                              height: 68,
                              borderRadius: '12px',
                              objectFit: 'cover',
                              border: `1px solid ${meta.accent}44`
                            }}
                          />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                              <span style={{
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                color: meta.accent,
                                background: `${meta.accent}15`,
                                border: `1px solid ${meta.accent}33`,
                                padding: '0.15rem 0.5rem',
                                borderRadius: '6px'
                              }}>
                                {meta.badge}
                              </span>
                              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                {c.modules?.length || 0} module{(c.modules?.length || 0) !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <h4 style={{ fontWeight: 800, fontSize: '0.98rem', margin: 0, color: 'var(--text-main)' }}>
                              {c.title}
                            </h4>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {c.description}
                            </p>
                          </div>

                          <div style={{ textAlign: 'center', padding: '0 0.5rem' }}>
                            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0bd1ff' }}>
                              {c.enrollments_count || 0}
                            </div>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>apprenants</span>
                          </div>

                          <div style={{ color: '#4ade80', fontSize: '0.68rem', padding: '0.35rem 0.65rem', background: 'rgba(74,222,128,0.1)', borderRadius: '8px', fontWeight: 800, border: '1px solid rgba(74,222,128,0.2)' }}>
                            CERTIFIANT
                          </div>

                          {/* Action Buttons */}
                          <div style={{ display: 'flex', gap: '0.45rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                            {/* Preview as student */}
                            <button
                              className="admin-action-btn"
                              title="Voir en mode apprenant"
                              onClick={() => navigate(`/course/${c.id}`)}
                              style={{ color: '#0bd1ff' }}
                            >
                              <Eye size={17} />
                            </button>

                            {/* Modules */}
                            <button
                              className="admin-action-btn"
                              title="Gérer les modules vidéo YouTube"
                              onClick={() => openModules(c)}
                              style={{ color: '#a78bfa' }}
                            >
                              <Film size={17} />
                            </button>

                            {/* Edit */}
                            <button
                              className="admin-action-btn"
                              title="Modifier la formation"
                              onClick={() => {
                                setSelectedCourse(c);
                                setEditCourse({ title: c.title, description: c.description, thumbnail: c.thumbnail || '' });
                                setModalType('editCourse');
                              }}
                              style={{ color: '#cbd5e1' }}
                            >
                              <Edit size={17} />
                            </button>

                            {/* Delete */}
                            <button
                              className="admin-action-btn danger"
                              title="Supprimer la formation"
                              onClick={() => handleDeleteCourse(c)}
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════
                3. STUDENTS MANAGEMENT
            ══════════════════════════════════════════════════════ */}
            {activeTab === 'Students' && (
              <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Role filter buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  {[
                    { id: 'ALL',   label: `Tous les comptes (${users.length})` },
                    { id: 'ADMIN', label: `Administrateurs (${users.filter(u => u.is_admin).length})` },
                    { id: 'USER',  label: `Apprenants (${users.filter(u => !u.is_admin).length})` },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setUserRoleFilter(tab.id)}
                      style={{
                        padding: '0.45rem 0.95rem',
                        borderRadius: '10px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: userRoleFilter === tab.id ? 'var(--accent-purple)' : 'rgba(255,255,255,0.03)',
                        color: userRoleFilter === tab.id ? '#ffffff' : 'var(--text-muted)',
                        border: `1px solid ${userRoleFilter === tab.id ? 'var(--accent-purple)' : 'var(--glass-border)'}`,
                        transition: 'all 0.2s'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {filteredUsers.length === 0 ? (
                  <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <Users size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    <h3 className="brand-font" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Aucun apprenant trouvé</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Ajustez vos filtres de recherche.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {filteredUsers.map(u => (
                      <div
                        key={u.id}
                        className="glass-card"
                        style={{
                          padding: '1.1rem 1.5rem',
                          display: 'grid',
                          gridTemplateColumns: '44px 1fr 140px 110px 110px 100px',
                          gap: '1.25rem',
                          alignItems: 'center'
                        }}
                      >
                        {/* Avatar */}
                        <div style={{
                          width: 44, height: 44, borderRadius: '12px',
                          background: u.is_admin ? 'linear-gradient(135deg, #7000ff, #00d1ff)' : 'rgba(255,255,255,0.06)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 800, color: '#fff', fontSize: '1rem'
                        }}>
                          {u.name?.[0]?.toUpperCase() || 'U'}
                        </div>

                        {/* Name and Email */}
                        <div>
                          <h4 style={{ fontWeight: 700, fontSize: '0.92rem', margin: 0, color: 'var(--text-main)' }}>{u.name}</h4>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.15rem 0 0' }}>{u.email}</p>
                        </div>

                        {/* Inscription date */}
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {new Date(u.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>

                        {/* Enrolled Courses count */}
                        <div style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0bd1ff' }}>
                            {u.enrollments_count || 0}
                          </span>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>cours suivi(s)</span>
                        </div>

                        {/* Role Badge */}
                        <div>
                          <span style={{
                            fontSize: '0.66rem',
                            padding: '0.25rem 0.6rem',
                            borderRadius: '8px',
                            fontWeight: 800,
                            display: 'inline-block',
                            background: u.is_admin ? 'rgba(112,0,255,0.2)' : 'rgba(255,255,255,0.05)',
                            color: u.is_admin ? '#a78bfa' : 'var(--text-muted)',
                            border: `1px solid ${u.is_admin ? 'rgba(112,0,255,0.4)' : 'rgba(255,255,255,0.1)'}`
                          }}>
                            {u.is_admin ? 'SUPER ADMIN' : 'APPRENANT'}
                          </span>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                          <button
                            className="admin-action-btn"
                            onClick={() => handleToggleAdmin(u)}
                            title={u.is_admin ? "Rétrograder en apprenant simple" : "Promouvoir Super Administrateur"}
                            style={{ color: u.is_admin ? '#a78bfa' : 'var(--text-muted)' }}
                          >
                            <Shield size={17} />
                          </button>
                          <button
                            className="admin-action-btn danger"
                            onClick={() => handleDeleteUser(u)}
                            title="Bannir / Supprimer cet utilisateur"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════
                4. SYSTEM & MAINTENANCE SETTINGS
            ══════════════════════════════════════════════════════ */}
            {activeTab === 'Settings' && (
              <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '2rem' }}>
                  
                  {/* System Toggles */}
                  <div className="glass-card" style={{ padding: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                      <Shield size={22} color="#a78bfa" />
                      <h3 className="brand-font" style={{ fontSize: '1.25rem', margin: 0 }}>Contrôles Système</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      <SettingItem
                        title="Mode Maintenance"
                        desc="Désactive l'accès public au catalogue pour des travaux techniques."
                        checked={systemSettings.maintenance_mode === '1'}
                        onToggle={() => setSystemSettings({
                          ...systemSettings,
                          maintenance_mode: systemSettings.maintenance_mode === '1' ? '0' : '1'
                        })}
                      />

                      {systemSettings.maintenance_mode === '1' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          style={{ padding: '1rem', background: 'rgba(112,0,255,0.06)', borderRadius: '14px', border: '1px solid rgba(112,0,255,0.2)' }}
                        >
                          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#a78bfa', marginBottom: '0.5rem', display: 'block' }}>
                            Message affiché aux apprenants
                          </label>
                          <textarea
                            style={{ ...inputStyle, minHeight: '70px', fontSize: '0.85rem' }}
                            value={systemSettings.maintenance_message || ''}
                            onChange={(e) => setSystemSettings({ ...systemSettings, maintenance_message: e.target.value })}
                            placeholder="MR1 Academy est momentanément en maintenance pour déploiement..."
                          />
                        </motion.div>
                      )}

                      <SettingItem
                        title="Autoriser les Inscriptions"
                        desc="Permet aux nouveaux apprenants de créer un compte librement."
                        checked={systemSettings.allow_registrations === '1'}
                        onToggle={() => setSystemSettings({
                          ...systemSettings,
                          allow_registrations: systemSettings.allow_registrations === '1' ? '0' : '1'
                        })}
                      />

                      <SettingItem
                        title="Emails Automatiques"
                        desc="Envoi automatique des notifications et délivrance des certificats."
                        checked={systemSettings.auto_emails === '1'}
                        onToggle={() => setSystemSettings({
                          ...systemSettings,
                          auto_emails: systemSettings.auto_emails === '1' ? '0' : '1'
                        })}
                      />

                      <button
                        className="btn-pro btn-pro-primary"
                        style={{ marginTop: '0.75rem', width: '100%', justifyContent: 'center' }}
                        onClick={handleSaveSettings}
                      >
                        Enregistrer la configuration
                      </button>
                    </div>
                  </div>

                  {/* System Diagnostics Card */}
                  <div className="glass-card" style={{ padding: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                      <Activity size={22} color="#0bd1ff" />
                      <h3 className="brand-font" style={{ fontSize: '1.25rem', margin: 0 }}>Statut Infrastructure & Santé</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                      <StatusRow
                        label="Backend API (Railway Production)"
                        value="https://vibeacademy-production.up.railway.app"
                        status="ONLINE"
                        statusColor="#4ade80"
                      />
                      <StatusRow
                        label="Frontend (Vercel CDN Edge)"
                        value="https://vibe-academy-mar11wane-gits-projects.vercel.app"
                        status="DEPLOYED"
                        statusColor="#0bd1ff"
                      />
                      <StatusRow
                        label="Base de Données"
                        value="PostgreSQL (Railway Managed)"
                        status="SYNCHRONISÉE"
                        statusColor="#4ade80"
                      />
                      <StatusRow
                        label="Authentification & Sécurité"
                        value="JWT Bearer + Auto-Verification OTP"
                        status="PROTÉGÉ"
                        statusColor="#a78bfa"
                      />

                      <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                          Outils de maintenance rapide :
                        </p>
                        <button
                          className="btn-pro"
                          onClick={() => {
                            Object.keys(localStorage).forEach(k => {
                              if (k.startsWith('vibe_') || k.startsWith('mr1_api_') || k.includes('cache')) {
                                localStorage.removeItem(k);
                              }
                            });
                            showToast('Cache local vidé et synchronisé avec le serveur !');
                            fetchData();
                          }}
                          style={{
                            width: '100%',
                            justifyContent: 'center',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#cbd5e1'
                          }}
                        >
                          <RefreshCw size={16} /> Purger le cache & Re-synchroniser
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

          </AnimatePresence>
        )}

        {/* ═══════════════════════════════════════════════════════
            MODALS
        ═══════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {modalType && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.85)',
                backdropFilter: 'blur(10px)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                overflowY: 'auto'
              }}
            >
              {/* ── CREATE / EDIT COURSE MODAL ── */}
              {(modalType === 'course' || modalType === 'editCourse') && (() => {
                const activeCourseObj = modalType === 'editCourse' ? editCourse : newCourse;
                const setActiveCourseObj = modalType === 'editCourse' ? setEditCourse : setNewCourse;
                const generatedCover = getCourseCover(activeCourseObj);

                return (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="glass-card"
                    style={{
                      width: '100%',
                      maxWidth: '580px',
                      padding: '2.25rem',
                      maxHeight: '92vh',
                      overflowY: 'auto'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                      <h2 className="brand-font" style={{ fontSize: '1.4rem', margin: 0 }}>
                        {modalType === 'editCourse' ? 'Modifier la Formation' : 'Nouvelle Formation Certifiante'}
                      </h2>
                      <button
                        onClick={() => setModalType(null)}
                        style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}
                      >
                        <X size={22} />
                      </button>
                    </div>

                    {/* Live Course Cover Preview */}
                    <div style={{ marginBottom: '1.25rem', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', height: '175px', position: 'relative' }}>
                      <img
                        src={generatedCover}
                        alt="Aperçu couverture"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(8,8,18,0.85)', color: '#4ade80', padding: '0.25rem 0.65rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800, border: '1px solid rgba(74,222,128,0.3)' }}>
                        Couverture HD Automatique
                      </span>
                    </div>

                    <form onSubmit={modalType === 'editCourse' ? handleEditCourse : handleCreateCourse} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.45rem' }}>
                          Titre de la formation certifiante
                        </label>
                        <input
                          style={inputStyle}
                          placeholder="Ex: Java 21 LTS & Spring Boot Microservices"
                          value={activeCourseObj.title}
                          onChange={e => setActiveCourseObj({ ...activeCourseObj, title: e.target.value })}
                          required
                        />
                      </div>

                      {/* Quick Tech Cover Presets */}
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.45rem' }}>
                          Thème &amp; Stack Technologique (préréglages rapides)
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {COURSE_COVER_PRESETS.map((p, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setActiveCourseObj({
                                ...activeCourseObj,
                                title: activeCourseObj.title || p.title,
                                thumbnail: getCourseCover({ title: activeCourseObj.title || p.title, description: p.label })
                              })}
                              style={{
                                padding: '0.32rem 0.65rem',
                                borderRadius: '8px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#cbd5e1',
                                cursor: 'pointer'
                              }}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.45rem' }}>
                          Programme & Description
                        </label>
                        <textarea
                          style={{ ...inputStyle, minHeight: 85, resize: 'vertical' }}
                          value={activeCourseObj.description}
                          onChange={e => setActiveCourseObj({ ...activeCourseObj, description: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.45rem' }}>
                          Image personnalisée (URL optionnelle)
                        </label>
                        <input
                          style={inputStyle}
                          placeholder="Laisser vide pour la couverture dynamique HD..."
                          value={activeCourseObj.thumbnail}
                          onChange={e => setActiveCourseObj({ ...activeCourseObj, thumbnail: e.target.value })}
                        />
                      </div>

                      <button type="submit" className="btn-pro btn-pro-primary" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
                        {modalType === 'editCourse' ? 'Enregistrer les modifications' : 'Publier la formation'}
                      </button>
                    </form>
                  </motion.div>
                );
              })()}

              {/* ── MODULES MANAGER MODAL ── */}
              {modalType === 'modules' && moduleCourse && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass-card"
                  style={{
                    width: '100%',
                    maxWidth: '680px',
                    padding: '2.5rem',
                    maxHeight: '90vh',
                    overflowY: 'auto'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                    <div>
                      <h2 className="brand-font" style={{ fontSize: '1.5rem', margin: 0 }}>Modules & Vidéos du Cours</h2>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem' }}>
                        {moduleCourse.title}
                      </p>
                    </div>
                    <button
                      onClick={() => setModalType(null)}
                      style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}
                    >
                      <X size={22} />
                    </button>
                  </div>

                  {/* Existing modules list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                    {moduleList.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed var(--glass-border)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Aucun module vidéo pour le moment. Ajoutez votre premier cours YouTube ci-dessous.
                      </div>
                    ) : (
                      moduleList.map((m, i) => (
                        <div
                          key={m.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '0.85rem 1rem',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '14px',
                            border: '1px solid var(--glass-border)'
                          }}
                        >
                          <div style={{
                            width: 32, height: 32, borderRadius: '8px',
                            background: 'var(--gradient-magic)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 900, fontSize: '0.8rem', color: '#fff', flexShrink: 0
                          }}>
                            {i + 1}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {m.title}
                            </p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                              <Clock size={12} /> {m.duration}
                              <span style={{ marginLeft: '0.5rem', opacity: 0.6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
                                <LinkIcon size={11} style={{ display: 'inline', marginRight: 3 }} />{m.video_url}
                              </span>
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteModule(m.id)}
                            style={{
                              background: 'rgba(239,68,68,0.08)',
                              border: '1px solid rgba(239,68,68,0.2)',
                              color: '#ef4444',
                              borderRadius: '8px',
                              padding: '0.4rem 0.6rem',
                              cursor: 'pointer',
                              flexShrink: 0
                            }}
                            title="Supprimer ce module"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add module form */}
                  <div style={{ background: 'rgba(112,0,255,0.05)', borderRadius: '20px', padding: '1.5rem', border: '1px solid rgba(112,0,255,0.15)' }}>
                    <h4 className="brand-font" style={{ fontSize: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Film size={18} color="#a78bfa" /> Ajouter un Module Vidéo
                    </h4>
                    <form onSubmit={handleAddModule} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                          Titre de la leçon / module
                        </label>
                        <input
                          style={inputStyle}
                          placeholder="Ex: Introduction & Architecture des Microservices"
                          value={newModule.title}
                          onChange={e => setNewModule({ ...newModule, title: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                          Lien de la Vidéo (YouTube)
                        </label>
                        <input
                          style={inputStyle}
                          placeholder="https://www.youtube.com/watch?v=..."
                          value={newModule.video_url}
                          onChange={e => setNewModule({ ...newModule, video_url: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                          Durée estimée
                        </label>
                        <input
                          style={inputStyle}
                          placeholder="Ex: 24:15"
                          value={newModule.duration}
                          onChange={e => setNewModule({ ...newModule, duration: e.target.value })}
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="btn-pro btn-pro-primary"
                        disabled={addingModule}
                        style={{ marginTop: '0.25rem', justifyContent: 'center' }}
                      >
                        <Plus size={18} /> {addingModule ? 'Ajout en cours...' : 'Ajouter le module'}
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Confirmation Modal ── */}
        <AnimatePresence>
          {confirmModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.85)',
                backdropFilter: 'blur(8px)',
                zIndex: 10000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.5rem'
              }}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="glass-card"
                style={{
                  width: '100%',
                  maxWidth: '460px',
                  padding: '2rem',
                  border: '1px solid rgba(239,68,68,0.3)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ef4444', marginBottom: '1rem' }}>
                  <AlertTriangle size={24} />
                  <h3 className="brand-font" style={{ fontSize: '1.2rem', margin: 0 }}>{confirmModal.title}</h3>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.75rem' }}>
                  {confirmModal.message}
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button
                    className="btn-pro"
                    onClick={() => setConfirmModal(null)}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1' }}
                  >
                    Annuler
                  </button>
                  <button
                    className="btn-pro"
                    onClick={confirmModal.onConfirm}
                    style={{ background: '#ef4444', color: '#fff', border: 'none' }}
                  >
                    Confirmer
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toast Alert */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              style={{
                position: 'fixed',
                bottom: '2rem',
                right: '2rem',
                zIndex: 10001,
                background: toast.type === 'error' ? 'rgba(239,68,68,0.95)' : 'rgba(112,0,255,0.95)',
                color: '#fff',
                padding: '0.9rem 1.6rem',
                borderRadius: '14px',
                boxShadow: '0 12px 35px rgba(0,0,0,0.4)',
                fontWeight: 700,
                fontSize: '0.9rem',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem'
              }}
            >
              {toast.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
              <span>{toast.msg}</span>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </AdminLayout>
  );
};

const StatCard = ({ label, value, unit = '', subtext, icon, color }) => (
  <div className="stat-box" style={{ borderLeft: `4px solid ${color}`, padding: '1.5rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </span>
      <div style={{ color, background: `${color}15`, padding: '0.5rem', borderRadius: '10px' }}>
        {icon}
      </div>
    </div>
    <div style={{ fontSize: '2.3rem', fontWeight: 900, lineHeight: 1.1, color: 'var(--text-main)' }}>
      {value}{unit}
    </div>
    {subtext && (
      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.45rem', fontWeight: 600 }}>
        {subtext}
      </div>
    )}
  </div>
);

const SettingItem = ({ title, desc, checked, onToggle }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.15rem 1.25rem',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '14px',
    border: '1px solid var(--glass-border)'
  }}>
    <div style={{ paddingRight: '1rem' }}>
      <p style={{ fontWeight: 700, fontSize: '0.92rem', margin: 0, color: 'var(--text-main)' }}>{title}</p>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>{desc}</p>
    </div>
    <div
      style={{
        width: 44,
        height: 22,
        background: checked ? '#7000ff' : '#333',
        borderRadius: '20px',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background 0.3s',
        flexShrink: 0
      }}
      onClick={onToggle}
    >
      <motion.div
        animate={{ x: checked ? 24 : 4 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{ position: 'absolute', top: 3, width: 16, height: 16, background: '#fff', borderRadius: '50%' }}
      />
    </div>
  </div>
);

const StatusRow = ({ label, value, status, statusColor }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.9rem 1rem',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '12px',
    border: '1px solid var(--glass-border)',
    gap: '0.75rem'
  }}>
    <div style={{ overflow: 'hidden' }}>
      <p style={{ fontSize: '0.82rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>{label}</p>
      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0.15rem 0 0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{value}</p>
    </div>
    <span style={{
      fontSize: '0.66rem',
      fontWeight: 800,
      padding: '0.2rem 0.55rem',
      borderRadius: '6px',
      background: `${statusColor}18`,
      color: statusColor,
      border: `1px solid ${statusColor}33`,
      flexShrink: 0
    }}>
      {status}
    </span>
  </div>
);

export default AdminPanel;