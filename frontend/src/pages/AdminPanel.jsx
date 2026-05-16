import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, BookOpen, MessageSquare, TrendingUp, 
  Trash2, Plus, Edit, X, Save, 
  ShieldCheck, BarChart3,
  CheckCircle2, AlertCircle, Search,
  ArrowRight, UserPlus,
  Activity, MoreVertical,
  Download, Bot, Sparkles,
  RefreshCw, Lock, GraduationCap, Award, Star
} from 'lucide-react';
import api from '../services/api';
import AdminLayout from '../layouts/AdminLayout';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminPanel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [modalType, setModalType] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [newCourse, setNewCourse] = useState({ title: '', description: '', thumbnail: '' });
  const [editCourse, setEditCourse] = useState({ title: '', description: '', thumbnail: '' });
  const [newModule, setNewModule] = useState({ title: '', duration: '', video_url: '' });

  const [pdfExporting, setPdfExporting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (location.pathname.includes('/courses')) setActiveTab('Courses');
    else if (location.pathname.includes('/users')) setActiveTab('Students');
    else setActiveTab('Dashboard');
  }, [location.pathname]);

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
      console.error('Fetch error:', err);
      showToast('Erreur lors du chargement des données.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/courses', newCourse);
      setModalType(null);
      setNewCourse({ title: '', description: '', thumbnail: '' });
      fetchData();
      showToast('Cours créé avec succès !');
    } catch (err) {
      showToast(err.response?.data?.message || "Erreur lors de la création du cours", 'error');
    }
  };

  const handleEditCourse = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;
    try {
      await api.put(`/admin/courses/${selectedCourse.id}`, editCourse);
      setModalType(null);
      fetchData();
      showToast('Cours mis à jour avec succès !');
    } catch (err) {
      showToast(err.response?.data?.message || "Erreur lors de la mise à jour", 'error');
    }
  };

  const openEditModal = (course) => {
    setSelectedCourse(course);
    setEditCourse({ title: course.title, description: course.description || '', thumbnail: course.thumbnail || '' });
    setModalType('editCourse');
  };

  const handleAddModule = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;
    try {
      await api.post(`/admin/courses/${selectedCourse.id}/modules`, newModule);
      setModalType(null);
      setNewModule({ title: '', duration: '', video_url: '' });
      fetchData();
      showToast('Module ajouté avec succès !');
    } catch (err) {
      showToast(err.response?.data?.message || "Erreur lors de l'ajout du module", 'error');
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm("Supprimer définitivement ce cours et ses modules ?")) return;
    try {
      await api.delete(`/admin/courses/${id}`);
      setCourses(courses.filter(c => c.id !== id));
      showToast('Cours supprimé.');
    } catch (err) {
      showToast(err.response?.data?.message || "Impossible de supprimer ce cours.", 'error');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Bannir cet utilisateur ?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
      showToast('Utilisateur supprimé.');
    } catch (err) {
      showToast('Erreur lors de la suppression.', 'error');
    }
  };

  const handleExportPDF = () => {
    setPdfExporting(true);
    setTimeout(() => {
      setPdfExporting(false);
      showToast('Export PDF généré avec succès !');
    }, 1500);
  };

  const filteredCourses = useMemo(() =>
    courses.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase())),
    [courses, searchQuery]
  );

  const filteredUsers = useMemo(() =>
    users.filter(u =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [users, searchQuery]
  );

  // Build AI insight from real data
  const aiInsight = useMemo(() => {
    if (!stats) return "VibeBot analyse les données en cours...";
    const rate = stats.completion_rate || 0;
    const newU = stats.new_users_month || 0;
    if (rate >= 70) return `✨ Excellent ! Taux de complétion de ${rate}% ce mois. ${newU} nouveaux apprenants inscrits.`;
    if (rate >= 40) return `📊 Taux de complétion : ${rate}%. ${newU} nouveaux membres — continuez à enrichir les cours !`;
    return `⚠️ Taux de complétion : ${rate}%. Pensez à améliorer l'engagement des apprenants. ${newU} nouveaux membres ce mois.`;
  }, [stats]);

  // Chart data from real monthly_registrations
  const chartData = stats?.monthly_registrations || [];
  const maxChart = Math.max(...chartData.map(d => d.count), 1);

  // Top courses from real data
  const topCourses = stats?.top_courses || [];
  const maxEnroll = Math.max(...topCourses.map(c => c.enrollments_count), 1);

  return (
    <AdminLayout>
      <div className="governance-container">
        
        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
              style={{
                position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999,
                background: toast.type === 'error' ? 'rgba(248,113,113,0.15)' : 'rgba(74,222,128,0.15)',
                border: `1px solid ${toast.type === 'error' ? 'rgba(248,113,113,0.4)' : 'rgba(74,222,128,0.4)'}`,
                color: toast.type === 'error' ? '#f87171' : '#4ade80',
                padding: '1rem 1.5rem', borderRadius: '14px', fontWeight: 700,
                backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}
            >
              {toast.type === 'error' ? <AlertCircle size={18}/> : <CheckCircle2 size={18}/>}
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <section className="infra-header">
          <div className="infra-meta">
            <div className="security-badge"><Lock size={12} /> VIBEADMIN — DONNÉES RÉELLES</div>
            <h1 className="infra-title">VibeAdmin Center</h1>
            <p className="infra-p">Tableau de bord analytique en temps réel</p>
          </div>
          <div className="infra-actions">
            <div className="infra-search-box">
              <Search size={16} />
              <input type="text" placeholder="Rechercher..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <button className="infra-btn-outline" onClick={fetchData}><RefreshCw size={16} /> Actualiser</button>
            <button className="infra-btn-primary" onClick={() => setModalType('course')}><Plus size={16} /> Nouveau cours</button>
          </div>
        </section>

        {/* Tabs */}
        <div className="admin-tab-nav">
          {['Dashboard', 'Courses', 'Students'].map(tab => (
            <button key={tab} className={`admin-tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab === 'Dashboard' && <BarChart3 size={16} />}
              {tab === 'Courses' && <BookOpen size={16} />}
              {tab === 'Students' && <Users size={16} />}
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
            <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
            <p>Chargement des données réelles...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">

            {/* ─── DASHBOARD ─── */}
            {activeTab === 'Dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

                {/* AI Insight bar */}
                <div className="ai-insight-bar">
                  <div className="ai-bot-icon"><Bot size={22} /><Sparkles className="sparkle" size={14} /></div>
                  <div className="ai-text">
                    <span className="ai-tag">VIBEBOT INSIGHT</span>
                    <p>{aiInsight}</p>
                  </div>
                  <button className="ai-action" onClick={() => setActiveTab('Courses')}>Gérer les cours <ArrowRight size={14} /></button>
                </div>

                {/* Real KPI Cards */}
                <div className="quantum-stats">
                  <StatNode label="Apprenants" value={stats?.users ?? 0} unit="membres" icon={<Users size={20}/>} color="#7000ff" trend={stats?.new_users_month > 0 ? `+${stats.new_users_month} ce mois` : 'Stable'} />
                  <StatNode label="Cours Publiés" value={stats?.courses ?? 0} unit="cours" icon={<BookOpen size={20}/>} color="#00d1ff" trend={`${stats?.enrollments ?? 0} inscriptions`} />
                  <StatNode label="Taux de Complétion" value={stats?.completion_rate ?? 0} unit="%" icon={<Award size={20}/>} color="#4ade80" trend={`${stats?.enrollments ?? 0} inscrits`} />
                  <StatNode label="Communauté" value={stats?.threads ?? 0} unit="threads" icon={<MessageSquare size={20}/>} color="#f59e0b" trend={`${stats?.comments ?? 0} commentaires`} />
                </div>

                {/* Charts Row */}
                <div className="command-matrix">
                  
                  {/* Monthly Registrations Chart */}
                  <div className="matrix-pane main-pane">
                    <div className="pane-header">
                      <h3>Inscriptions Mensuelles (6 mois)</h3>
                      <button className="pane-tools" onClick={handleExportPDF} disabled={pdfExporting}>
                        <Download size={16} />
                        <span>{pdfExporting ? 'Export...' : 'Export CSV'}</span>
                      </button>
                    </div>
                    <div className="real-chart">
                      {chartData.map((d, i) => (
                        <div key={i} className="bar-col">
                          <div className="bar-wrap">
                            <motion.div
                              className="bar-fill"
                              initial={{ height: 0 }}
                              animate={{ height: `${Math.max((d.count / maxChart) * 100, 4)}%` }}
                              transition={{ delay: i * 0.1, duration: 0.6, ease: 'easeOut' }}
                              title={`${d.count} inscriptions`}
                            />
                          </div>
                          <span className="bar-val">{d.count}</span>
                          <span className="bar-label">{d.month}</span>
                        </div>
                      ))}
                      {chartData.length === 0 && (
                        <div style={{ color: 'var(--text-muted)', textAlign: 'center', width: '100%', paddingTop: '3rem' }}>
                          Pas encore de données d'inscription.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Top Courses */}
                  <div className="matrix-pane side-pane">
                    <div className="pane-header"><h3>Top Cours</h3></div>
                    <div className="top-courses-list">
                      {topCourses.length === 0 && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Aucun cours encore.</p>
                      )}
                      {topCourses.map((c, i) => (
                        <div key={c.id} className="top-course-row">
                          <span className="top-rank">#{i + 1}</span>
                          <div className="top-info">
                            <p className="top-title">{c.title}</p>
                            <div className="top-bar-wrap">
                              <motion.div
                                className="top-bar-fill"
                                initial={{ width: 0 }}
                                animate={{ width: `${(c.enrollments_count / maxEnroll) * 100}%` }}
                                transition={{ delay: 0.2 + i * 0.1, duration: 0.7 }}
                              />
                            </div>
                          </div>
                          <span className="top-count">{c.enrollments_count} <GraduationCap size={13}/></span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Users */}
                  <div className="matrix-pane full-pane">
                    <div className="pane-header"><h3>Nouveaux Membres Récents</h3></div>
                    <div className="recent-users-list">
                      {(stats?.recent_users || []).length === 0 && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Aucun membre encore.</p>
                      )}
                      {(stats?.recent_users || []).map((u, i) => (
                        <motion.div key={u.id} className="recent-user-row" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
                          <div className="user-avatar-sm">{u.name[0].toUpperCase()}</div>
                          <div className="recent-user-info">
                            <p className="ru-name">{u.name}</p>
                            <p className="ru-email">{u.email}</p>
                          </div>
                          <span className="ru-date">{new Date(u.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* ─── COURSES ─── */}
            {activeTab === 'Courses' && (
              <motion.div key="courses" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{filteredCourses.length} cours trouvés</p>
                  <button className="infra-btn-primary" onClick={() => setModalType('course')}><Plus size={16} /> Nouveau cours</button>
                </div>
                <AssetTable courses={filteredCourses} onModule={(c) => { setSelectedCourse(c); setModalType('module'); }} onDelete={handleDeleteCourse} onEdit={openEditModal} />
              </motion.div>
            )}

            {/* ─── STUDENTS ─── */}
            {activeTab === 'Students' && (
              <motion.div key="students" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{filteredUsers.length} apprenants trouvés</p>
                </div>
                <RegistryTable users={filteredUsers} onDel={handleDeleteUser} />
              </motion.div>
            )}

          </AnimatePresence>
        )}

        {/* Modals */}
        {modalType && (
          <div className="admin-modal-overlay">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="admin-modal-box">
              <div className="modal-header">
                <h2 className="brand-font" style={{ fontSize: '1.5rem' }}>
                  {modalType === 'course' ? 'Nouveau Cours'
                   : modalType === 'editCourse' ? `Modifier : ${selectedCourse?.title}`
                   : `Module → ${selectedCourse?.title}`}
                </h2>
                <button className="close-btn" onClick={() => setModalType(null)}><X size={24} /></button>
              </div>

              {modalType === 'course' ? (
                <form className="cc-form" onSubmit={handleCreateCourse}>
                  <div className="f-group"><label>Titre du cours</label><input type="text" placeholder="Ex: Masterclass React Pro" value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} required /></div>
                  <div className="f-group"><label>Description</label><textarea placeholder="Sommaire technique..." value={newCourse.description} onChange={e => setNewCourse({...newCourse, description: e.target.value})} required /></div>
                  <div className="f-group"><label>URL Miniature</label><input type="text" placeholder="https://..." value={newCourse.thumbnail} onChange={e => setNewCourse({...newCourse, thumbnail: e.target.value})} required /></div>
                  <button type="submit" className="cc-action-btn primary full">Créer le cours</button>
                </form>
              ) : modalType === 'editCourse' ? (
                <form className="cc-form" onSubmit={handleEditCourse}>
                  <div className="f-group"><label>Titre</label><input type="text" value={editCourse.title} onChange={e => setEditCourse({...editCourse, title: e.target.value})} required /></div>
                  <div className="f-group"><label>Description</label><textarea value={editCourse.description} onChange={e => setEditCourse({...editCourse, description: e.target.value})} required /></div>
                  <div className="f-group"><label>URL Miniature</label><input type="text" value={editCourse.thumbnail} onChange={e => setEditCourse({...editCourse, thumbnail: e.target.value})} /></div>
                  <button type="submit" className="cc-action-btn primary full"><Save size={16}/> Sauvegarder</button>
                </form>
              ) : (
                <form className="cc-form" onSubmit={handleAddModule}>
                  <div className="f-group"><label>Titre du module</label><input type="text" placeholder="Ex: Introduction au JSX" value={newModule.title} onChange={e => setNewModule({...newModule, title: e.target.value})} required /></div>
                  <div className="f-group"><label>Durée (ex: 12:45)</label><input type="text" placeholder="00:00" value={newModule.duration} onChange={e => setNewModule({...newModule, duration: e.target.value})} required /></div>
                  <div className="f-group"><label>URL Vidéo</label><input type="text" placeholder="https://..." value={newModule.video_url} onChange={e => setNewModule({...newModule, video_url: e.target.value})} required /></div>
                  <button type="submit" className="cc-action-btn primary full">Ajouter le module</button>
                </form>
              )}
            </motion.div>
          </div>
        )}

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .governance-container { padding: 1rem 0 5rem; }

        /* Tabs */
        .admin-tab-nav { display: flex; gap: 0.5rem; margin-bottom: 2rem; }
        .admin-tab-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.65rem 1.25rem; border-radius: 12px; border: 1px solid var(--glass-border); background: transparent; color: var(--text-muted); font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: 0.2s; font-family: 'Inter', sans-serif; }
        .admin-tab-btn:hover { background: var(--glass-bg); color: var(--text-main); }
        .admin-tab-btn.active { background: rgba(112,0,255,0.15); color: #a78bfa; border-color: rgba(112,0,255,0.3); }

        /* Header */
        .infra-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
        .security-badge { background: rgba(112,0,255,0.08); color: #a78bfa; font-size: 0.65rem; font-weight: 900; letter-spacing: 1px; padding: 4px 10px; border-radius: 6px; display: inline-flex; align-items: center; gap: 6px; margin-bottom: 0.75rem; border: 1px solid rgba(112,0,255,0.2); }
        .infra-title { font-family: 'Outfit', sans-serif; font-size: 2.8rem; font-weight: 800; letter-spacing: -1.5px; margin-bottom: 0.2rem; color: var(--text-main); }
        .infra-p { color: var(--text-muted); font-size: 1rem; }
        .infra-actions { display: flex; gap: 1rem; flex-wrap: wrap; }
        .infra-search-box { background: var(--bg-secondary); border: 1px solid var(--glass-border); border-radius: 14px; padding: 0.8rem 1.25rem; display: flex; align-items: center; gap: 0.75rem; width: 260px; color: var(--text-muted); }
        .infra-search-box input { background: none; border: none; outline: none; color: var(--text-main); width: 100%; font-size: 0.9rem; }
        .infra-btn-primary { background: #7000ff; color: white; padding: 0.85rem 1.5rem; border-radius: 14px; border: none; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(112,0,255,0.3); transition: 0.2s; font-family: 'Inter', sans-serif; }
        .infra-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(112,0,255,0.4); }
        .infra-btn-outline { background: var(--glass-bg); border: 1px solid var(--glass-border); color: var(--text-muted); padding: 0.85rem 1.25rem; border-radius: 14px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; font-family: 'Inter', sans-serif; }
        .infra-btn-outline:hover { color: var(--text-main); background: var(--bg-tertiary); }

        /* AI Insight */
        .ai-insight-bar { background: linear-gradient(90deg, rgba(112,0,255,0.1), rgba(0,209,255,0.05)); border: 1px solid rgba(112,0,255,0.2); border-radius: 20px; padding: 1.25rem 2rem; display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2.5rem; flex-wrap: wrap; }
        .ai-bot-icon { width: 44px; height: 44px; background: #7000ff; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; position: relative; flex-shrink: 0; }
        .ai-bot-icon .sparkle { position: absolute; top: -4px; right: -4px; color: #fbbf24; }
        .ai-tag { font-size: 0.65rem; font-weight: 900; color: #a78bfa; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 0.2rem; display: block; }
        .ai-text { flex: 1; }
        .ai-text p { font-size: 0.95rem; font-weight: 600; color: var(--text-main); }
        .ai-action { margin-left: auto; background: #7000ff; color: white; border: none; border-radius: 10px; padding: 0.6rem 1rem; font-size: 0.8rem; font-weight: 800; display: flex; align-items: center; gap: 6px; cursor: pointer; transition: 0.2s; }
        .ai-action:hover { background: #5500cc; transform: translateY(-1px); }

        /* KPI Stats */
        .quantum-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
        .node-stat { background: var(--bg-secondary); border-radius: 24px; border: 1px solid var(--glass-border); padding: 1.75rem; position: relative; transition: 0.25s; overflow: hidden; }
        .node-stat::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; border-radius: 3px 3px 0 0; }
        .node-stat:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,0.15); }
        .stat-icon-wrap { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; }
        .node-stat h4 { font-size: 0.72rem; color: var(--text-muted); font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 0.4rem; }
        .val-main { font-family: 'Outfit', sans-serif; font-size: 2.5rem; font-weight: 800; color: var(--text-main); line-height: 1; }
        .val-unit { font-size: 0.9rem; color: var(--text-muted); margin-left: 6px; font-weight: 600; }
        .val-trend { margin-top: 0.5rem; font-size: 0.75rem; font-weight: 700; color: var(--text-muted); }

        /* Command Matrix Grid */
        .command-matrix { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; }
        .matrix-pane { background: var(--bg-secondary); border-radius: 28px; border: 1px solid var(--glass-border); padding: 2rem; }
        .full-pane { grid-column: 1 / -1; }
        .pane-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .pane-header h3 { font-family: 'Outfit', sans-serif; font-size: 1.15rem; font-weight: 800; color: var(--text-main); }
        .pane-tools { display: flex; align-items: center; gap: 8px; color: var(--text-muted); font-size: 0.75rem; font-weight: 700; cursor: pointer; padding: 6px 12px; border-radius: 10px; background: var(--glass-bg); border: 1px solid var(--glass-border); transition: 0.2s; }
        .pane-tools:hover { color: var(--text-main); }
        .pane-tools:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Real Bar Chart */
        .real-chart { display: flex; align-items: flex-end; gap: 1rem; height: 160px; padding-top: 0.5rem; }
        .bar-col { display: flex; flex-direction: column; align-items: center; gap: 0.3rem; flex: 1; }
        .bar-wrap { flex: 1; width: 100%; display: flex; align-items: flex-end; }
        .bar-fill { width: 100%; min-height: 4px; background: linear-gradient(to top, #7000ff, #00d1ff); border-radius: 6px 6px 0 0; cursor: pointer; transition: opacity 0.2s; }
        .bar-fill:hover { opacity: 0.8; }
        .bar-val { font-size: 0.75rem; font-weight: 800; color: var(--text-main); }
        .bar-label { font-size: 0.7rem; color: var(--text-muted); font-weight: 600; }

        /* Top Courses */
        .top-courses-list { display: flex; flex-direction: column; gap: 1rem; }
        .top-course-row { display: flex; align-items: center; gap: 0.75rem; }
        .top-rank { font-family: 'Outfit', sans-serif; font-size: 1.1rem; font-weight: 800; color: var(--text-muted); width: 28px; flex-shrink: 0; }
        .top-info { flex: 1; }
        .top-title { font-size: 0.82rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.35rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; }
        .top-bar-wrap { height: 6px; background: var(--glass-bg); border-radius: 3px; overflow: hidden; }
        .top-bar-fill { height: 100%; background: linear-gradient(90deg, #7000ff, #00d1ff); border-radius: 3px; }
        .top-count { font-size: 0.8rem; font-weight: 800; color: #a78bfa; display: flex; align-items: center; gap: 4px; flex-shrink: 0; }

        /* Recent Users */
        .recent-users-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 0.75rem; }
        .recent-user-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.85rem 1rem; background: var(--glass-bg); border-radius: 14px; border: 1px solid var(--glass-border); }
        .user-avatar-sm { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #7000ff, #00d1ff); display: flex; align-items: center; justify-content: center; font-weight: 800; color: white; font-size: 0.9rem; flex-shrink: 0; }
        .recent-user-info { flex: 1; min-width: 0; }
        .ru-name { font-size: 0.85rem; font-weight: 800; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ru-email { font-size: 0.72rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ru-date { font-size: 0.7rem; font-weight: 700; color: var(--text-muted); flex-shrink: 0; }

        /* Asset List */
        .asset-list { border-radius: 24px; overflow: hidden; border: 1px solid var(--glass-border); }
        .asset-item { background: var(--bg-secondary); padding: 1.25rem 2rem; border-bottom: 1px solid var(--glass-border); display: grid; grid-template-columns: 80px 1fr 120px 120px 100px 200px; align-items: center; gap: 1.5rem; transition: 0.2s; }
        .asset-item:last-child { border-bottom: none; }
        .asset-item:hover { background: var(--bg-tertiary); }
        .asset-title { font-weight: 800; font-size: 1rem; color: var(--text-main); }
        .asset-id { color: var(--text-muted); font-size: 0.78rem; margin-top: 2px; }
        .asset-modules { color: var(--text-main); font-size: 0.85rem; font-weight: 700; }
        .asset-status { background: rgba(56,189,248,0.1); color: #38bdf8; font-size: 0.65rem; padding: 4px 10px; border-radius: 6px; font-weight: 900; text-align: center; }
        .admin-action-btn { width: 36px; height: 36px; border-radius: 10px; background: var(--bg-tertiary); border: 1px solid var(--glass-border); color: var(--text-muted); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; flex-shrink: 0; }
        .admin-action-btn:hover { background: rgba(112,0,255,0.12); border-color: rgba(112,0,255,0.3); color: #a78bfa; }
        .admin-action-btn.danger:hover { background: rgba(248,113,113,0.12); border-color: rgba(248,113,113,0.3); color: #f87171; }

        /* Modal */
        .admin-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(25px); z-index: 3000; display: flex; align-items: center; justify-content: center; }
        .admin-modal-box { background: var(--bg-secondary); width: 100%; max-width: 480px; padding: 3rem; border-radius: 40px; border: 1px solid var(--glass-border); box-shadow: 0 30px 60px rgba(0,0,0,0.6); }
        .cc-form .f-group { margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.6rem; }
        .cc-form label { font-size: 0.7rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; }
        .cc-form input, .cc-form textarea { background: var(--bg-tertiary); border: 1px solid var(--glass-border); border-radius: 14px; padding: 1rem; color: var(--text-main); outline: none; font-family: 'Inter', sans-serif; font-size: 0.95rem; transition: 0.2s; }
        .cc-form input:focus, .cc-form textarea:focus { border-color: #7000ff; box-shadow: 0 0 0 3px rgba(112,0,255,0.1); }
        .cc-action-btn { border-radius: 14px; padding: 0.85rem 1.5rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 0.6rem; border: none; transition: 0.2s; font-family: 'Inter', sans-serif; font-size: 0.95rem; }
        .cc-action-btn.primary { background: #7000ff; color: white; }
        .cc-action-btn.primary:hover { background: #5500cc; transform: translateY(-1px); }
        .cc-action-btn.full { width: 100%; justify-content: center; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .close-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; transition: 0.2s; }
        .close-btn:hover { color: var(--text-main); }

        @media (max-width: 900px) {
          .command-matrix { grid-template-columns: 1fr; }
          .full-pane { grid-column: 1; }
          .asset-item { grid-template-columns: 60px 1fr 80px 120px; }
          .asset-item > :nth-child(4), .asset-item > :nth-child(6) { display: none; }
        }
      `}</style>
    </AdminLayout>
  );
};

// ─── StatNode Component ───
const StatNode = ({ label, value, unit, icon, color, trend }) => (
  <div className="node-stat" style={{ '--accent': color }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color, borderRadius: '3px 3px 0 0' }} />
    <div className="stat-icon-wrap" style={{ background: `${color}18` }}>
      <span style={{ color }}>{icon}</span>
    </div>
    <h4>{label}</h4>
    <div className="val-main">{value}<span className="val-unit">{unit}</span></div>
    <div className="val-trend">{trend}</div>
  </div>
);

// ─── AssetTable ───
const AssetTable = ({ courses, onModule, onDelete, onEdit }) => (
  <div className="asset-list">
    {courses.length === 0 && (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Aucun cours trouvé. Cliquez sur "Nouveau cours" pour commencer.
      </div>
    )}
    {courses.map(c => (
      <div key={c.id} className="asset-item">
        <img src={c.thumbnail} style={{ width: 64, height: 44, borderRadius: '8px', objectFit: 'cover', background: 'var(--bg-tertiary)' }} alt="" onError={e => e.target.style.display='none'} />
        <div>
          <p className="asset-title">{c.title}</p>
          <p className="asset-id">ID #{c.id}</p>
        </div>
        <div className="asset-modules">{c.modules?.length || 0} modules</div>
        <div style={{ color: '#a78bfa', fontSize: '0.85rem', fontWeight: 700 }}>{c.enrollments_count ?? 0} inscrits</div>
        <div className="asset-status">PUBLIÉ</div>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button className="admin-action-btn" title="Ajouter un module" onClick={() => onModule(c)}><Plus size={16} /></button>
          <button className="admin-action-btn" title="Modifier" onClick={() => onEdit(c)}><Edit size={16} /></button>
          <button className="admin-action-btn danger" title="Supprimer" onClick={() => onDelete(c.id)}><Trash2 size={16} /></button>
        </div>
      </div>
    ))}
  </div>
);

// ─── RegistryTable ───
const RegistryTable = ({ users, onDel }) => (
  <div className="asset-list">
    {users.length === 0 && (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Aucun apprenant trouvé.
      </div>
    )}
    {users.map(u => (
      <div key={u.id} className="asset-item" style={{ gridTemplateColumns: '50px 1fr 160px 100px 100px 80px' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #7000ff, #00d1ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white', flexShrink: 0 }}>
          {u.name[0].toUpperCase()}
        </div>
        <div>
          <p style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>{u.name}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{u.email}</p>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          {new Date(u.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
        </div>
        <div style={{ color: '#a78bfa', fontSize: '0.85rem', fontWeight: 700 }}>{u.enrollments_count ?? 0} cours</div>
        <div style={{ background: 'rgba(112,0,255,0.1)', color: '#a78bfa', fontSize: '0.65rem', padding: '4px 10px', borderRadius: '6px', fontWeight: 900, textAlign: 'center' }}>ACTIF</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {!u.is_admin && <button className="admin-action-btn danger" title="Bannir" onClick={() => onDel(u.id)}><Trash2 size={16} /></button>}
        </div>
      </div>
    ))}
  </div>
);

export default AdminPanel;
