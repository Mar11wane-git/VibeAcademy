import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, BookOpen, MessageSquare,
  Trash2, Plus, Edit, X, Lock,
  BarChart3, Search,
  RefreshCw, Award, Shield, Film, Clock, Link
} from 'lucide-react';
import api from '../services/api';
import AdminLayout from '../layouts/AdminLayout';
import { useLocation } from 'react-router-dom';

const inputStyle = {
  background: 'var(--bg-primary)',
  border: '1px solid var(--glass-border)',
  padding: '0.8rem 1rem',
  borderRadius: '10px',
  color: '#fff',
  width: '100%',
  fontSize: '0.9rem',
  outline: 'none',
};

const AdminPanel = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [systemSettings, setSystemSettings] = useState({
    maintenance_mode: '0',
    allow_registrations: '1',
    auto_emails: '1'
  });

  const fetchSettings = async () => {
    try {
      const res = await api.get('/admin/settings');
      setSystemSettings(res.data);
    } catch (err) {
      console.error("Failed to load settings");
    }
  };

  const handleSaveSettings = async () => {
    try {
      await api.post('/admin/settings', systemSettings);
      showToast('Configuration système synchronisée !');
    } catch (err) {
      showToast('Échec de la synchronisation', 'error');
    }
  };

  useEffect(() => {
    const path = location.pathname;
    if (path === '/admin/courses') setActiveTab('Courses');
    else if (path === '/admin/users') setActiveTab('Students');
    else if (path === '/admin/settings') setActiveTab('Settings');
    else setActiveTab('Dashboard');
  }, [location.pathname]);

  const [stats, setStats]     = useState(null);
  const [courses, setCourses] = useState([]);
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Course modal state
  const [modalType, setModalType]       = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [newCourse, setNewCourse]   = useState({ title: '', description: '', thumbnail: '', price: 0 });
  const [editCourse, setEditCourse] = useState({ title: '', description: '', thumbnail: '', price: 0 });

  // Module modal state
  const [moduleCourse, setModuleCourse]   = useState(null); // course being managed
  const [moduleList, setModuleList]       = useState([]);
  const [newModule, setNewModule]         = useState({ title: '', video_url: '', duration: '' });
  const [addingModule, setAddingModule]   = useState(false);

  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetchData();
    fetchSettings();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sRes, cRes, uRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/courses'),
        api.get('/admin/users')
      ]);
      setStats(sRes.data);
      setCourses(cRes.data);
      setUsers(uRes.data);
    } catch (err) {
      showToast('Erreur de synchronisation.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── Course handlers ──────────────────────────────────────
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await api.post('/courses', newCourse);
      setModalType(null);
      setNewCourse({ title: '', description: '', thumbnail: '', price: 0 });
      fetchData();
      showToast('Cours publié avec succès !');
    } catch (err) {
      showToast("Erreur de publication", 'error');
    }
  };

  const handleEditCourse = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;
    try {
      await api.put(`/courses/${selectedCourse.id}`, editCourse);
      setModalType(null);
      fetchData();
      showToast('Modifications enregistrées.');
    } catch (err) {
      showToast("Mise à jour échouée", 'error');
    }
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
      showToast('Module ajouté !');
      fetchData(); // refresh courses list counts
    } catch (err) {
      showToast("Erreur d'ajout du module", 'error');
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
    } catch (err) {
      showToast("Erreur de suppression", 'error');
    }
  };

  // ── User handlers ────────────────────────────────────────
  const handleToggleAdmin = async (userId) => {
    try {
      const res = await api.post(`/admin/users/${userId}/toggle-admin`);
      showToast(res.data.message);
      fetchData();
    } catch (err) {
      showToast('Droit de modification refusé.', 'error');
    }
  };

  const filteredCourses = useMemo(() =>
    courses.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase())),
    [courses, searchQuery]
  );

  const filteredUsers = useMemo(() => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    return users.filter(u =>
      u.id !== currentUser.id && (
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [users, searchQuery]);

  const chartData  = stats?.monthly_registrations || [];
  const topCourses = stats?.top_courses || [];

  return (
    <AdminLayout>
      <div className="admin-content-scroller" style={{ padding: '2rem 2.5rem', flex: 1, overflowY: 'auto' }}>

        {/* Header */}
        <div className="governance-header">
          <div>
            <div className="security-badge"><Lock size={12} /> SYSTÈME SÉCURISÉ</div>
            <h1 className="brand-font" style={{ fontSize: '2.4rem', margin: '0.75rem 0' }}>Centre de Gestion</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Gérez les formations et surveillez la croissance de VibeAcademy.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div className="admin-search-bar" style={{ width: 280 }}>
              <Search size={16} />
              <input type="text" placeholder="Rechercher..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <button className="btn-pro btn-pro-primary" onClick={() => setModalType('course')}>
              <Plus size={18} /> Nouveau Cours
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-tab-nav" style={{ marginBottom: '3rem' }}>
          {[
            { id: 'Dashboard', icon: BarChart3, label: 'Performance' },
            { id: 'Courses',   icon: BookOpen,  label: 'Catalogue' },
            { id: 'Students',  icon: Users,     label: 'Apprenants' },
            { id: 'Settings',  icon: Shield,    label: 'Système' }
          ].map(tab => (
            <button key={tab.id} className={`admin-tab-item ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex-center" style={{ flexDirection: 'column', gap: '1.5rem', height: '40vh' }}>
            <RefreshCw size={40} className="spin-slow" color="#7000ff" />
            <p className="brand-font" style={{ color: 'var(--text-muted)' }}>Synchronisation en cours...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">

            {/* ── DASHBOARD ── */}
            {activeTab === 'Dashboard' && (
              <motion.div key="dash" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="stat-grid">
                  <StatCard label="Étudiants"  value={stats?.users || 0}            icon={<Users size={22}/>}    color="#a78bfa" />
                  <StatCard label="Formations" value={stats?.courses || 0}           icon={<BookOpen size={22}/>} color="#0bd1ff" />
                  <StatCard label="Réussite"   value={stats?.completion_rate || 0} unit="%" icon={<Award size={22}/>}   color="#4ade80" />
                  <StatCard label="Retours"    value={stats?.comments || 0}          icon={<MessageSquare size={22}/>} color="#f59e0b" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                  <div className="glass-card" style={{ padding: '2rem' }}>
                    <h3 className="brand-font" style={{ marginBottom: '2rem', fontSize: '1.2rem' }}>Inscriptions Mensuelles</h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '180px', paddingBottom: '0.5rem' }}>
                      {chartData.map((d, i) => {
                        const maxCount = Math.max(...chartData.map(x => x.count)) || 1;
                        const heightPercent = (d.count / maxCount) * 100;
                        return (
                          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem', height: '100%' }}>
                            <div style={{ width: '100%', flex: 1, background: 'rgba(255,255,255,0.02)', borderRadius: '10px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', border: '1px solid rgba(255,255,255,0.03)' }}>
                              <motion.div initial={{ height: 0 }} animate={{ height: `${Math.max(heightPercent, d.count > 0 ? 5 : 2)}%` }}
                                style={{ width: '100%', background: d.count > 0 ? 'var(--gradient-magic)' : 'rgba(112,0,255,0.08)', borderRadius: '6px', boxShadow: d.count > 0 ? '0 0 15px rgba(112,0,255,0.3)' : 'none' }} />
                            </div>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>{d.month}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="glass-card" style={{ padding: '2rem' }}>
                    <h3 className="brand-font" style={{ marginBottom: '2rem', fontSize: '1.2rem' }}>Formations Populaires</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {topCourses.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Aucune donnée d'inscription disponible.</p>
                      ) : topCourses.map(c => {
                        const maxEnroll = Math.max(...topCourses.map(x => x.enrollments_count)) || 1;
                        return (
                          <div key={c.id}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>{c.title}</span>
                              <span style={{ color: '#a78bfa', fontWeight: 800, fontSize: '0.8rem' }}>{c.enrollments_count} inscrit{c.enrollments_count > 1 ? 's' : ''}</span>
                            </div>
                            <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', overflow: 'hidden' }}>
                              <motion.div initial={{ width: 0 }} animate={{ width: `${(c.enrollments_count / maxEnroll) * 100 || 2}%` }}
                                style={{ height: '100%', background: 'var(--gradient-cyber)', borderRadius: '100px' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── COURSES ── */}
            {activeTab === 'Courses' && (
              <motion.div key="courses" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {filteredCourses.length === 0 && (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>Aucun cours trouvé.</p>
                )}
                {filteredCourses.map(c => (
                  <div key={c.id} className="asset-row" style={{ gridTemplateColumns: '80px 1fr 120px 80px 180px' }}>
                    <img src={c.thumbnail} alt="" style={{ width: 80, height: 50, borderRadius: '10px', objectFit: 'cover' }} />
                    <div>
                      <h4 style={{ fontWeight: 800 }}>{c.title}</h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {c.price > 0 ? `${c.price}€` : 'Gratuit'} · {c.modules?.length || 0} module{(c.modules?.length || 0) !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#a78bfa' }}>{c.enrollments_count} élèves</div>
                    <div style={{ color: '#4ade80', fontSize: '0.65rem', padding: '0.4rem', background: 'rgba(74,222,128,0.1)', borderRadius: '8px', textAlign: 'center', fontWeight: 800 }}>ACTIF</div>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      {/* Modules button */}
                      <button
                        className="admin-action-btn"
                        title="Gérer les modules / vidéos"
                        onClick={() => openModules(c)}
                        style={{ color: '#a78bfa' }}
                      >
                        <Film size={18} />
                      </button>
                      <button className="admin-action-btn" onClick={() => { setSelectedCourse(c); setEditCourse({ title: c.title, description: c.description, thumbnail: c.thumbnail, price: c.price }); setModalType('editCourse'); }}>
                        <Edit size={18} />
                      </button>
                      <button className="admin-action-btn danger" onClick={() => api.delete(`/admin/courses/${c.id}`).then(fetchData)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* ── STUDENTS ── */}
            {activeTab === 'Students' && (
              <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {filteredUsers.map(u => (
                  <div key={u.id} className="asset-row" style={{ gridTemplateColumns: '50px 1fr 180px 100px 100px' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '12px', background: u.is_admin ? 'rgba(112,0,255,0.1)' : 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: u.is_admin ? '#a78bfa' : '#fff' }}>{u.name[0]}</div>
                    <div>
                      <h4 style={{ fontWeight: 700 }}>{u.name}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</p>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(u.created_at).toLocaleDateString()}</div>
                    <div style={{ fontSize: '0.65rem', padding: '0.3rem', borderRadius: '6px', textAlign: 'center', fontWeight: 800, background: u.is_admin ? 'rgba(112,0,255,0.2)' : 'rgba(255,255,255,0.05)', color: u.is_admin ? '#a78bfa' : 'var(--text-muted)' }}>
                      {u.is_admin ? 'ADMIN' : 'USER'}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button className={`admin-action-btn ${u.is_admin ? 'active-admin' : ''}`} onClick={() => handleToggleAdmin(u.id)} title={u.is_admin ? "Rétrograder" : "Promouvoir admin"}>
                        <Shield size={18} color={u.is_admin ? '#a78bfa' : 'currentColor'} />
                      </button>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* ── SETTINGS ── */}
            {activeTab === 'Settings' && (
              <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="glass-card" style={{ padding: '2.5rem', maxWidth: '650px' }}>
                  <h3 className="brand-font" style={{ marginBottom: '2rem' }}>Réglages Système</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <SettingItem title="Mode Maintenance" desc="Désactive l'accès public au catalogue."
                      checked={systemSettings.maintenance_mode === '1'}
                      onToggle={() => setSystemSettings({ ...systemSettings, maintenance_mode: systemSettings.maintenance_mode === '1' ? '0' : '1' })}
                    />
                    {systemSettings.maintenance_mode === '1' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ padding: '1rem', background: 'rgba(112,0,255,0.05)', borderRadius: '12px', border: '1px solid rgba(112,0,255,0.1)' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#a78bfa', marginBottom: '0.5rem', display: 'block' }}>Message de Maintenance</label>
                        <textarea className="form-group-input" style={{ minHeight: '60px', fontSize: '0.85rem' }}
                          value={systemSettings.maintenance_message || ''}
                          onChange={(e) => setSystemSettings({ ...systemSettings, maintenance_message: e.target.value })}
                          placeholder="Écrivez le message ici..." />
                      </motion.div>
                    )}
                    <SettingItem title="Inscriptions" desc="Autorise la création de nouveaux comptes."
                      checked={systemSettings.allow_registrations === '1'}
                      onToggle={() => setSystemSettings({ ...systemSettings, allow_registrations: systemSettings.allow_registrations === '1' ? '0' : '1' })}
                    />
                    <SettingItem title="Emails Automatiques" desc="Notifications d'inscription et certificats."
                      checked={systemSettings.auto_emails === '1'}
                      onToggle={() => setSystemSettings({ ...systemSettings, auto_emails: systemSettings.auto_emails === '1' ? '0' : '1' })}
                    />
                    <button className="btn-pro btn-pro-primary" style={{ marginTop: '1rem' }} onClick={handleSaveSettings}>Enregistrer la configuration</button>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        )}

        {/* ═══════════════════════════════════════════════
            MODALS
        ═══════════════════════════════════════════════ */}
        <AnimatePresence>
          {modalType && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', overflowY: 'auto' }}
            >

              {/* ── CREATE / EDIT COURSE ── */}
              {(modalType === 'course' || modalType === 'editCourse') && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <h2 className="brand-font">{modalType === 'editCourse' ? 'Modifier le cours' : 'Nouveau Cours'}</h2>
                    <button onClick={() => setModalType(null)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}><X size={24} /></button>
                  </div>
                  <form onSubmit={modalType === 'editCourse' ? handleEditCourse : handleCreateCourse} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Titre</label>
                      <input style={inputStyle}
                        value={modalType === 'editCourse' ? editCourse.title : newCourse.title}
                        onChange={e => modalType === 'editCourse' ? setEditCourse({ ...editCourse, title: e.target.value }) : setNewCourse({ ...newCourse, title: e.target.value })}
                        required />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Description</label>
                      <textarea style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }}
                        value={modalType === 'editCourse' ? editCourse.description : newCourse.description}
                        onChange={e => modalType === 'editCourse' ? setEditCourse({ ...editCourse, description: e.target.value }) : setNewCourse({ ...newCourse, description: e.target.value })}
                        required />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Image (URL)</label>
                      <input style={inputStyle} placeholder="https://images.unsplash.com/..."
                        value={modalType === 'editCourse' ? editCourse.thumbnail : newCourse.thumbnail}
                        onChange={e => modalType === 'editCourse' ? setEditCourse({ ...editCourse, thumbnail: e.target.value }) : setNewCourse({ ...newCourse, thumbnail: e.target.value })}
                        required />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Prix (€)</label>
                      <input style={inputStyle} type="number" min="0" step="0.01"
                        value={modalType === 'editCourse' ? editCourse.price : newCourse.price}
                        onChange={e => modalType === 'editCourse' ? setEditCourse({ ...editCourse, price: e.target.value }) : setNewCourse({ ...newCourse, price: e.target.value })} />
                    </div>
                    <button type="submit" className="btn-pro btn-pro-primary" style={{ marginTop: '0.5rem' }}>
                      {modalType === 'editCourse' ? 'Enregistrer' : 'Publier le cours'}
                    </button>
                  </form>
                </motion.div>
              )}

              {/* ── MODULES MANAGER ── */}
              {modalType === 'modules' && moduleCourse && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card"
                  style={{ width: '100%', maxWidth: '680px', padding: '2.5rem', maxHeight: '90vh', overflowY: 'auto' }}>

                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                    <div>
                      <h2 className="brand-font" style={{ fontSize: '1.5rem' }}>Modules du cours</h2>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{moduleCourse.title}</p>
                    </div>
                    <button onClick={() => setModalType(null)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}><X size={24} /></button>
                  </div>

                  {/* Existing modules list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                    {moduleList.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed var(--glass-border)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Aucun module — ajoutez votre première vidéo ci-dessous.
                      </div>
                    )}
                    {moduleList.map((m, i) => (
                      <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid var(--glass-border)' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'var(--gradient-magic)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem', color: '#fff', flexShrink: 0 }}>
                          {i + 1}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.title}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Clock size={12} /> {m.duration}
                            <span style={{ marginLeft: '0.5rem', opacity: 0.6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
                              <Link size={11} style={{ display: 'inline', marginRight: 3 }} />{m.video_url}
                            </span>
                          </p>
                        </div>
                        <button onClick={() => handleDeleteModule(m.id)}
                          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: '8px', padding: '0.4rem 0.6rem', cursor: 'pointer', flexShrink: 0 }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add module form */}
                  <div style={{ background: 'rgba(112,0,255,0.05)', borderRadius: '20px', padding: '1.5rem', border: '1px solid rgba(112,0,255,0.15)' }}>
                    <h4 className="brand-font" style={{ fontSize: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Film size={18} color="#a78bfa" /> Ajouter un module
                    </h4>
                    <form onSubmit={handleAddModule} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Titre du module</label>
                        <input style={inputStyle} placeholder="Ex : Introduction à la POO"
                          value={newModule.title}
                          onChange={e => setNewModule({ ...newModule, title: e.target.value })}
                          required />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Lien YouTube</label>
                        <input style={inputStyle} placeholder="https://www.youtube.com/watch?v=..."
                          value={newModule.video_url}
                          onChange={e => setNewModule({ ...newModule, video_url: e.target.value })}
                          required />
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                          Formats acceptés : youtube.com/watch?v=... · youtu.be/... · youtube.com/embed/...
                        </p>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Durée</label>
                        <input style={inputStyle} placeholder="Ex : 12:30"
                          value={newModule.duration}
                          onChange={e => setNewModule({ ...newModule, duration: e.target.value })}
                          required />
                      </div>
                      <button type="submit" className="btn-pro btn-pro-primary" disabled={addingModule} style={{ marginTop: '0.25rem' }}>
                        <Plus size={18} /> {addingModule ? 'Ajout...' : 'Ajouter le module'}
                      </button>
                    </form>
                  </div>

                </motion.div>
              )}

            </motion.div>
          )}
        </AnimatePresence>

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 10000, background: toast.type === 'error' ? 'rgba(239,68,68,0.9)' : 'rgba(112,0,255,0.9)', color: '#fff', padding: '1rem 2rem', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', fontWeight: 600 }}>
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </AdminLayout>
  );
};

const StatCard = ({ label, value, unit = '', icon, color }) => (
  <div className="stat-box" style={{ borderLeft: `4px solid ${color}`, padding: '1.5rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
      <div style={{ color, background: `${color}10`, padding: '0.6rem', borderRadius: '12px' }}>{icon}</div>
      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</span>
    </div>
    <div style={{ fontSize: '2.4rem', fontWeight: 900 }}>{value}{unit}</div>
  </div>
);

const SettingItem = ({ title, desc, checked, onToggle }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px solid var(--glass-border)' }}>
    <div>
      <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{title}</p>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{desc}</p>
    </div>
    <div style={{ width: 44, height: 22, background: checked ? '#7000ff' : '#333', borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }} onClick={onToggle}>
      <motion.div animate={{ x: checked ? 24 : 4 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{ position: 'absolute', top: 3, width: 16, height: 16, background: '#fff', borderRadius: '50%' }} />
    </div>
  </div>
);

export default AdminPanel;
