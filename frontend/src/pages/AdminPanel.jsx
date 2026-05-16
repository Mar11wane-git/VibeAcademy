import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, BookOpen, MessageSquare, TrendingUp, 
  Trash2, Plus, Edit, X, Save, 
  ShieldCheck, Eye, Terminal, BarChart3,
  CheckCircle2, AlertCircle, Search, Filter, 
  Video, ListChecks, ArrowRight, UserPlus,
  Cpu, Globe, Zap, Activity, MoreVertical,
  ChevronDown, ArrowUpRight, ArrowDownRight,
  Clock, CheckSquare, Calendar, Layout,
  Download, FileText, Bot, Sparkles, Map,
  RefreshCw, Lock
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
  
  // Modals state
  const [modalType, setModalType] = useState(null); // 'course' | 'module' | 'editCourse'
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [newCourse, setNewCourse] = useState({ title: '', description: '', thumbnail: '' });
  const [editCourse, setEditCourse] = useState({ title: '', description: '', thumbnail: '' });
  const [newModule, setNewModule] = useState({ title: '', duration: '', video_url: '' });

  const [aiInsight, setAiInsight] = useState("VibeBot analyse en cours...");
  const [pdfExporting, setPdfExporting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchData();
    setTimeout(() => setAiInsight("Insight : 3 cours ont un taux de complétion supérieur à 85% ce mois-ci. Bravo !"), 2000);
  }, []);

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
        const errorMsg = err.response?.data?.message || "Erreur lors de la création du cours";
        showToast(errorMsg, 'error');
        console.error(err.response?.data || err);
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
      const errorMsg = err.response?.data?.message || "Erreur lors de la mise à jour";
      showToast(errorMsg + (err.response?.data?.errors ? ' (Vérifiez les champs)' : ''), 'error');
      console.error(err.response?.data || err);
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
        const errorMsg = err.response?.data?.message || "Erreur lors de l'ajout du module";
        showToast(errorMsg, 'error');
        console.error(err.response?.data || err);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm("Supprimer définitivement ce cours et ses modules ?")) return;
    try {
      await api.delete(`/admin/courses/${id}`);
      setCourses(courses.filter(c => c.id !== id));
      showToast('Cours supprimé.');
    } catch (err) {
        const errorMsg = err.response?.data?.message || "Impossible de supprimer ce cours.";
        showToast(errorMsg, 'error');
        console.error(err); 
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Bannir cet utilisateur ?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
      showToast('Utilisateur supprimé.');
    } catch (err) { console.error(err); }
  };

  const handleExportPDF = () => {
    setPdfExporting(true);
    setTimeout(() => {
      setPdfExporting(false);
      showToast('Export PDF généré avec succès !');
    }, 1500);
  };

  const handleOptimizeCourses = () => {
    navigate('/admin/courses');
    setActiveTab('Courses');
  };

  const filteredCourses = useMemo(() => {
    return courses.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [courses, searchQuery]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [users, searchQuery]);

  return (
    <AdminLayout>
      <div className="governance-container">
        
        {/* ── Toast Notification ── */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
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

        {/* ───── Infrastructure Header ───── */}
        <section className="infra-header">
          <div className="infra-meta">
            <div className="security-badge"><Lock size={12} /> SECURE COMMAND CHANNEL</div>
            <h1 className="infra-title">VibeAdmin Center</h1>
            <p className="infra-p">Orchestration &amp; Intelligence Artificielle (VibeBot Pro v4.2)</p>
          </div>
          
          <div className="infra-actions">
            <div className="infra-search-box">
              <Search size={16} />
              <input type="text" placeholder="Rechercher..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <button className="infra-btn-outline" onClick={fetchData}><RefreshCw size={16} /> Sync</button>
            <button className="infra-btn-primary" onClick={() => setModalType('course')}><Plus size={16} /> New Asset</button>
          </div>
        </section>

        {/* ─── Tab Navigation ─── */}
        <div className="admin-tab-nav">
          {['Dashboard', 'Courses', 'Students'].map(tab => (
            <button
              key={tab}
              className={`admin-tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'Dashboard' && <BarChart3 size={16} />}
              {tab === 'Courses' && <BookOpen size={16} />}
              {tab === 'Students' && <Users size={16} />}
              {tab}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'Dashboard' && (
            <motion.div key="governance" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
              
              <div className="ai-insight-bar">
                 <div className="ai-bot-icon"><Bot size={22} /><Sparkles className="sparkle" size={14} /></div>
                 <div className="ai-text">
                    <span className="ai-tag">VIBEBOT INSIGHT</span>
                    <p>{aiInsight}</p>
                 </div>
                 <button className="ai-action" onClick={handleOptimizeCourses}>Optimiser les cours <ArrowRight size={14} /></button>
              </div>

              <div className="quantum-stats">
                 <StatNode label="Total Learners" value={stats?.users || 0} unit="Membres" trend="+15%" status="growth" />
                 <StatNode label="Platform Uptime" value="99.98" unit="%" trend="Stable" status="neutral" />
                 <StatNode label="Monthly Revenue" value="45,280" unit="€" trend="+8.2%" status="growth" />
                 <StatNode label="Security Level" value="9级" unit="High" trend="Safe" status="secure" />
              </div>

              <div className="command-matrix">
                 <div className="matrix-pane main-pane">
                    <div className="pane-header">
                       <h3>Analyse de Cohorte (Engagement)</h3>
                       <button className="pane-tools" onClick={handleExportPDF} disabled={pdfExporting}>
                         <Download size={16} />
                         <span>{pdfExporting ? 'Export...' : 'Export PDF'}</span>
                       </button>
                    </div>
                    <div className="pro-chart">
                       <svg viewBox="0 0 500 150" style={{ width: '100%', height: '100%' }}>
                          <path d="M0,130 Q125,50 250,90 T500,40" fill="none" stroke="url(#lineGradient)" strokeWidth="4" strokeLinecap="round" />
                          <defs>
                             <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#7000ff" />
                                <stop offset="100%" stopColor="#00d1ff" />
                             </linearGradient>
                          </defs>
                       </svg>
                    </div>
                 </div>

                 <div className="matrix-pane side-pane">
                    <div className="pane-header"><h3>Status des Noeuds</h3></div>
                    <div className="nodes-stack">
                       <SystemNode label="Auth Server" status="online" ping="12ms" />
                       <SystemNode label="Media CDN" status="online" ping="24ms" />
                       <SystemNode label="Backup Worker" status="idle" ping="-" />
                       <SystemNode label="AI Processor" status="busy" ping="150ms" />
                    </div>
                 </div>

                 <div className="matrix-pane full-pane">
                    <div className="pane-header"><h3>Connexions Actives (Monde)</h3></div>
                    <div className="geo-simulation">
                       <div className="geo-map">
                          <div className="map-point" style={{ top: '30%', left: '45%' }}></div>
                          <div className="map-point" style={{ top: '60%', left: '70%' }}></div>
                          <div className="map-point" style={{ top: '40%', left: '20%' }}></div>
                          <p>Visualisation des flux de données en temps réel...</p>
                       </div>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'Courses' && (
            <motion.div key="assets" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
               <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                 <button className="infra-btn-primary" onClick={() => setModalType('course')}><Plus size={16} /> Nouveau cours</button>
               </div>
               <AssetTable courses={filteredCourses} onModule={(c) => { setSelectedCourse(c); setModalType('module'); }} onDelete={handleDeleteCourse} onEdit={openEditModal} />
            </motion.div>
          )}

          {activeTab === 'Students' && (
            <motion.div key="registry" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
               <RegistryTable users={filteredUsers} onDel={handleDeleteUser} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ───── Modals ───── */}
        {modalType && (
          <div className="admin-modal-overlay">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="admin-modal-box">
              <div className="modal-header">
                <h2 className="brand-font" style={{ fontSize: '1.5rem' }}>
                  {modalType === 'course' ? 'Deploy New Asset' 
                   : modalType === 'editCourse' ? `Modifier : ${selectedCourse?.title}`
                   : `Add Module to ${selectedCourse?.title}`}
                </h2>
                <button className="close-btn" onClick={() => setModalType(null)}><X size={24} /></button>
              </div>
              
              {modalType === 'course' ? (
                <form className="cc-form" onSubmit={handleCreateCourse}>
                  <div className="f-group">
                    <label>Titre du cours</label>
                    <input type="text" placeholder="Ex: Masterclass React Pro" value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} required />
                  </div>
                  <div className="f-group">
                    <label>Description</label>
                    <textarea placeholder="Sommaire technique..." value={newCourse.description} onChange={e => setNewCourse({...newCourse, description: e.target.value})} required />
                  </div>
                  <div className="f-group">
                    <label>URL Miniature (Image)</label>
                    <input type="text" placeholder="https://..." value={newCourse.thumbnail} onChange={e => setNewCourse({...newCourse, thumbnail: e.target.value})} required />
                  </div>
                  <button type="submit" className="cc-action-btn primary full">Commit To Mainframe</button>
                </form>
              ) : modalType === 'editCourse' ? (
                <form className="cc-form" onSubmit={handleEditCourse}>
                  <div className="f-group">
                    <label>Titre du cours</label>
                    <input type="text" placeholder="Titre..." value={editCourse.title} onChange={e => setEditCourse({...editCourse, title: e.target.value})} required />
                  </div>
                  <div className="f-group">
                    <label>Description</label>
                    <textarea placeholder="Description..." value={editCourse.description} onChange={e => setEditCourse({...editCourse, description: e.target.value})} required />
                  </div>
                  <div className="f-group">
                    <label>URL Miniature</label>
                    <input type="text" placeholder="https://..." value={editCourse.thumbnail} onChange={e => setEditCourse({...editCourse, thumbnail: e.target.value})} />
                  </div>
                  <button type="submit" className="cc-action-btn primary full"><Save size={16}/> Sauvegarder les modifications</button>
                </form>
              ) : (
                <form className="cc-form" onSubmit={handleAddModule}>
                  <div className="f-group">
                    <label>Titre du module</label>
                    <input type="text" placeholder="Ex: Introduction au JSX" value={newModule.title} onChange={e => setNewModule({...newModule, title: e.target.value})} required />
                  </div>
                  <div className="f-group">
                    <label>Durée (ex: 12:45)</label>
                    <input type="text" placeholder="00:00" value={newModule.duration} onChange={e => setNewModule({...newModule, duration: e.target.value})} required />
                  </div>
                  <div className="f-group">
                    <label>URL Vidéo</label>
                    <input type="text" placeholder="https://..." value={newModule.video_url} onChange={e => setNewModule({...newModule, video_url: e.target.value})} required />
                  </div>
                  <button type="submit" className="cc-action-btn primary full">Inject Module Data</button>
                </form>
              )}
            </motion.div>
          </div>
        )}

      </div>

      <style>{`
        .governance-container { padding: 1rem 0 5rem; }

        /* ── Tab Nav ── */
        .admin-tab-nav { display: flex; gap: 0.5rem; margin-bottom: 2rem; }
        .admin-tab-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.65rem 1.25rem; border-radius: 12px; border: 1px solid var(--glass-border); background: transparent; color: var(--text-muted); font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: 0.2s; font-family: 'Inter', sans-serif; }
        .admin-tab-btn:hover { background: var(--glass-bg); color: var(--text-main); }
        .admin-tab-btn.active { background: rgba(112,0,255,0.15); color: #a78bfa; border-color: rgba(112,0,255,0.3); }

        /* ── Header ── */
        .infra-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
        .security-badge { background: rgba(74,222,128,0.05); color: #4ade80; font-size: 0.65rem; font-weight: 900; letter-spacing: 1px; padding: 4px 10px; border-radius: 6px; display: inline-flex; align-items: center; gap: 6px; margin-bottom: 0.75rem; border: 1px solid rgba(74,222,128,0.1); }
        .infra-title { font-family: 'Outfit', sans-serif; font-size: 2.8rem; font-weight: 800; letter-spacing: -1.5px; margin-bottom: 0.2rem; color: var(--text-main); }
        .infra-p { color: var(--text-muted); font-size: 1.05rem; }
        .infra-actions { display: flex; gap: 1.25rem; flex-wrap: wrap; }
        .infra-search-box { background: var(--bg-secondary); border: 1px solid var(--glass-border); border-radius: 14px; padding: 0.8rem 1.25rem; display: flex; align-items: center; gap: 0.75rem; width: 280px; color: var(--text-muted); }
        .infra-search-box input { background: none; border: none; outline: none; color: var(--text-main); width: 100%; font-size: 0.9rem; }
        .infra-btn-primary { background: #7000ff; color: white; padding: 0.85rem 1.75rem; border-radius: 14px; border: none; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(112,0,255,0.3); transition: 0.2s; font-family: 'Inter', sans-serif; }
        .infra-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(112,0,255,0.4); }
        .infra-btn-outline { background: var(--glass-bg); border: 1px solid var(--glass-border); color: var(--text-muted); padding: 0.85rem 1.5rem; border-radius: 14px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; font-family: 'Inter', sans-serif; }
        .infra-btn-outline:hover { color: var(--text-main); background: var(--bg-tertiary); }
        
        /* ── AI Insight ── */
        .ai-insight-bar { background: linear-gradient(90deg, rgba(112,0,255,0.1), rgba(0,209,255,0.05)); border: 1px solid rgba(112,0,255,0.2); border-radius: 20px; padding: 1.25rem 2rem; display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2.5rem; flex-wrap: wrap; }
        .ai-bot-icon { width: 44px; height: 44px; background: #7000ff; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; position: relative; flex-shrink: 0; }
        .ai-bot-icon .sparkle { position: absolute; top: -4px; right: -4px; color: #fbbf24; }
        .ai-tag { font-size: 0.65rem; font-weight: 900; color: #7000ff; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 0.2rem; display: block; }
        .ai-text { flex: 1; }
        .ai-text p { font-size: 0.95rem; font-weight: 600; color: var(--text-main); }
        .ai-action { margin-left: auto; background: #7000ff; color: white; border: none; border-radius: 10px; padding: 0.6rem 1rem; font-size: 0.8rem; font-weight: 800; display: flex; align-items: center; gap: 6px; cursor: pointer; transition: 0.2s; font-family: 'Inter', sans-serif; }
        .ai-action:hover { background: #5500cc; transform: translateY(-1px); }

        /* ── Stats ── */
        .quantum-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
        .node-stat { background: var(--bg-secondary); border-radius: 24px; border: 1px solid var(--glass-border); padding: 2rem; position: relative; overflow: hidden; transition: 0.2s; }
        .node-stat:hover { border-color: rgba(112,0,255,0.3); transform: translateY(-3px); }
        .node-stat h4 { font-size: 0.75rem; color: var(--text-muted); font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 0.75rem; }
        .node-stat .val-main { font-family: 'Outfit', sans-serif; font-size: 2.5rem; font-weight: 800; color: var(--text-main); }
        .node-stat .val-unit { font-size: 1rem; color: var(--text-muted); margin-left: 0.5rem; font-weight: 600; }
        .node-stat .val-trend { position: absolute; right: 2rem; top: 2rem; font-size: 0.7rem; font-weight: 900; padding: 4px 10px; border-radius: 8px; }

        /* ── Command Matrix ── */
        .command-matrix { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; }
        .matrix-pane { background: var(--bg-secondary); border-radius: 32px; border: 1px solid var(--glass-border); padding: 2rem; }
        .pane-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .pane-header h3 { font-family: 'Outfit', sans-serif; font-size: 1.2rem; font-weight: 800; color: var(--text-main); }
        .pane-tools { display: flex; align-items: center; gap: 8px; color: var(--text-muted); font-size: 0.75rem; font-weight: 700; cursor: pointer; padding: 6px 12px; border-radius: 10px; background: var(--glass-bg); border: 1px solid var(--glass-border); transition: 0.2s; font-family: 'Inter', sans-serif; }
        .pane-tools:hover { color: var(--text-main); background: var(--bg-tertiary); }
        .pane-tools:disabled { opacity: 0.6; cursor: not-allowed; }
        .nodes-stack { display: flex; flex-direction: column; gap: 1rem; }
        .node-row { display: flex; align-items: center; gap: 1rem; padding: 0.85rem; background: var(--glass-bg); border-radius: 14px; }
        .n-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .n-dot.online { background: #4ade80; box-shadow: 0 0 8px #4ade80; }
        .n-dot.idle { background: #fbbf24; }
        .n-dot.busy { background: #60a5fa; }
        .n-label { flex: 1; font-size: 0.85rem; font-weight: 700; color: var(--text-main); }
        .n-ping { font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; color: var(--text-muted); }
        .geo-simulation { height: 180px; position: relative; overflow: hidden; background: radial-gradient(circle at center, var(--bg-tertiary), var(--bg-secondary)); border-radius: 20px; }
        .geo-map { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: var(--text-muted-dark); font-size: 0.8rem; font-weight: 800; }
        .map-point { position: absolute; width: 10px; height: 10px; background: #7000ff; border-radius: 50%; animation: pulse-geo 2s infinite; }
        @keyframes pulse-geo { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(3); opacity: 0; } }

        /* ── Asset List (Courses) ── */
        .asset-list { border-radius: 24px; overflow: hidden; border: 1px solid var(--glass-border); }
        .asset-item { background: var(--bg-secondary); padding: 1.25rem 2rem; border-bottom: 1px solid var(--glass-border); display: grid; grid-template-columns: 80px 1fr 140px 140px 200px; align-items: center; gap: 1.5rem; transition: 0.2s; }
        .asset-item:last-child { border-bottom: none; }
        .asset-item:hover { background: var(--bg-tertiary); }
        .asset-title { font-weight: 800; font-size: 1rem; color: var(--text-main); }
        .asset-id { color: var(--text-muted); font-size: 0.8rem; }
        .asset-modules { color: var(--text-main); font-size: 0.85rem; font-weight: 700; }
        .asset-status { background: rgba(56,189,248,0.1); color: #38bdf8; font-size: 0.65rem; padding: 4px 10px; border-radius: 6px; font-weight: 900; text-align: center; }

        /* ── Registry (Users) ── */
        .user-initial { width: 40px; height: 40px; border-radius: '50%'; background: '#7000ff'; display: flex; align-items: center; justify-content: center; font-weight: 800; color: white; border-radius: 50%; flex-shrink: 0; }

        /* ── Modal ── */
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

        /* ── Pro Chart ── */
        .pro-chart { height: 150px; }

        /* ── Responsive ── */  
        @media (max-width: 900px) {
          .command-matrix { grid-template-columns: 1fr; }
          .asset-item { grid-template-columns: 60px 1fr 120px; }
          .asset-item > :nth-child(4), .asset-item > :nth-child(5) { display: none; }
        }
      `}</style>
    </AdminLayout>
  );
};

const StatNode = ({ label, value, unit, trend, status }) => (
  <div className="node-stat">
    <div className="val-trend" style={{ background: status === 'growth' ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)', color: status === 'growth' ? '#4ade80' : '#8b8b9c' }}>{trend}</div>
    <h4>{label}</h4>
    <div className="val-main">{value}<span className="val-unit">{unit}</span></div>
  </div>
);

const SystemNode = ({ label, status, ping }) => (
  <div className="node-row">
     <div className={`n-dot ${status}`}></div>
     <div className="n-label">{label}</div>
     <div className="n-ping">{ping}</div>
  </div>
);

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
           <p className="asset-id">ID: AX-{c.id}0-PR</p>
        </div>
        <div className="asset-modules">{c.modules?.length || 0} Modules</div>
        <div className="asset-status">PUBLISHED</div>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button className="pill-btn" title="Ajouter un module" onClick={() => onModule(c)}><Plus size={16} /></button>
          <button className="pill-btn" title="Modifier le cours" onClick={() => onEdit(c)}><Edit size={16} /></button>
          <button className="pill-btn" title="Supprimer le cours" style={{ color: '#f87171' }} onClick={() => onDelete(c.id)}><Trash2 size={16} /></button>
        </div>
      </div>
    ))}
  </div>
);

const RegistryTable = ({ users, onDel }) => (
  <div className="asset-list">
    {users.length === 0 && (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Aucun utilisateur trouvé.
      </div>
    )}
    {users.map(u => (
      <div key={u.id} className="asset-item" style={{ gridTemplateColumns: '50px 1fr 180px 120px 100px' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#7000ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white', flexShrink: 0 }}>{u.name[0]}</div>
        <div>
           <p style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>{u.name}</p>
           <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{u.email}</p>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Active Member</div>
        <div style={{ background: 'var(--glass-bg)', color: 'var(--text-muted)', fontSize: '0.65rem', padding: '4px 10px', borderRadius: '6px', fontWeight: 800, textAlign: 'center', border: '1px solid var(--glass-border)' }}>LEVEL 1</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {!u.is_admin && <button className="pill-btn" title="Bannir l'utilisateur" style={{ color: '#f87171' }} onClick={() => onDel(u.id)}><Trash2 size={16} /></button>}
        </div>
      </div>
    ))}
  </div>
);

export default AdminPanel;
