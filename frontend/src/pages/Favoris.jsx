import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bookmark, Play, Star, Users, Trash2, Heart, Clock, BookOpen,
  Flame, Sparkles, Search, ArrowUpDown, Calendar, FileText,
  CheckCircle2, Award, Plus, RotateCcw, LayoutGrid, List,
  FolderKanban, Check, X, ExternalLink, Zap
} from 'lucide-react';
import api, { getCachedData } from '../services/api';
import {
  getCourseCover,
  getCourseTechMeta,
  computePlaylistStats,
  formatSecondsHuman,
  getLocalCompletedModules,
  getAllLocalCertificates,
  getLocalFavoriteIds,
  setLocalFavoriteIds,
  toggleLocalFavoriteId,
  getLocalFavoriteMeta,
  saveLocalFavoriteMeta,
} from '../utils/certificationEngine';

const PRIORITY_CONFIG = {
  high: { label: 'Priorité Haute', short: 'Haute 🔥', color: '#f43f5e', bg: 'rgba(244,63,94,0.14)', border: 'rgba(244,63,94,0.38)', rank: 3 },
  medium: { label: 'Priorité Moyenne', short: 'Moyenne ⚡', color: '#f59e0b', bg: 'rgba(245,158,11,0.14)', border: 'rgba(245,158,11,0.38)', rank: 2 },
  low: { label: 'Priorité Normale', short: 'Normale 📌', color: '#38bdf8', bg: 'rgba(56,189,248,0.14)', border: 'rgba(56,189,248,0.35)', rank: 1 },
};

const COLLECTIONS = [
  'À étudier',
  'Sprint Semaine',
  'Objectif Certif',
  'Révision Entretien',
];

const FILTER_TABS = [
  { key: 'all', label: 'Tous les Favoris' },
  { key: 'high', label: 'Priorité Haute 🔥' },
  { key: 'in_progress', label: 'En cours d\'étude ⚡' },
  { key: 'not_started', label: 'À démarrer 📌' },
  { key: 'certified', label: 'Certifiés / Feu Vert 🏆' },
];

const Favoris = () => {
  const navigate = useNavigate();

  // ── Instant SWR + Local Cache Hydration ──
  const [allCourses, setAllCourses] = useState(() => getCachedData('/courses') || []);
  const [serverFavorites, setServerFavorites] = useState(() => getCachedData('/favorites') || []);
  const [enrollments, setEnrollments] = useState(() => getCachedData('/my-courses') || []);
  const [favIds, setFavIds] = useState(() => {
    const serverIds = (getCachedData('/favorites') || []).map(f => Number(f.id));
    return Array.from(new Set([...serverIds, ...getLocalFavoriteIds()]));
  });
  const [metaVersion, setMetaVersion] = useState(0);
  const [loading, setLoading] = useState(() => !getCachedData('/courses') && !getCachedData('/favorites'));

  // ── UI Filter & View State ──
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCollection, setSelectedCollection] = useState('Toutes');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('priority'); // 'priority' | 'progress' | 'rating' | 'duration'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // ── Interactive Note Editor & Agenda Scheduler Modal ──
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [scheduleCourse, setScheduleCourse] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    date: '2026-10-18',
    start_time: '18:00',
    end_time: '19:30',
  });
  const [scheduling, setScheduling] = useState(false);

  // ── Toast & Undo Remove ──
  const [toast, setToast] = useState(null);
  const [lastRemovedCourse, setLastRemovedCourse] = useState(null);

  const showToast = (text, type = 'success', undoCourse = null) => {
    setToast({ text, type });
    setLastRemovedCourse(undoCourse);
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // ── Fetch & Synchronize Server + Catalogue + Enrollments ──
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const coursesPromise = api.get('/courses').catch(() => ({ data: [] }));
        const favsPromise = localStorage.getItem('token')
          ? api.get('/favorites').catch(() => ({ data: [] }))
          : Promise.resolve({ data: [] });
        const myCoursesPromise = localStorage.getItem('token')
          ? api.get('/my-courses').catch(() => ({ data: [] }))
          : Promise.resolve({ data: [] });

        const [coursesRes, favsRes, myCoursesRes] = await Promise.all([
          coursesPromise,
          favsPromise,
          myCoursesPromise,
        ]);

        if (Array.isArray(coursesRes.data) && coursesRes.data.length > 0) {
          setAllCourses(coursesRes.data);
        }

        if (Array.isArray(myCoursesRes.data)) {
          setEnrollments(myCoursesRes.data);
        }

        const srvFavs = Array.isArray(favsRes.data) ? favsRes.data : [];
        setServerFavorites(srvFavs);

        // Merge server favorite metadata into local store
        srvFavs.forEach(f => {
          if (f.favorite_priority || f.favorite_collection || f.favorite_note) {
            const existing = getLocalFavoriteMeta(f.id);
            saveLocalFavoriteMeta(f.id, {
              priority: f.favorite_priority || existing.priority || 'medium',
              collection: f.favorite_collection || existing.collection || 'À étudier',
              personal_note: f.favorite_note || existing.personal_note || '',
            });
          }
        });

        const serverIds = srvFavs.map(f => Number(f.id));
        const localIds = getLocalFavoriteIds();
        const mergedIds = Array.from(new Set([...serverIds, ...localIds]));
        setFavIds(mergedIds);
        setLocalFavoriteIds(mergedIds);
        setMetaVersion(v => v + 1);
      } catch (err) {
        console.error('Erreur synchronisation favoris:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const localCerts = getAllLocalCertificates();

  // ── Build Enriched Favorite Courses List ──
  const enrichedFavorites = useMemo(() => {
    const courseMap = new Map();
    allCourses.forEach(c => courseMap.set(Number(c.id), c));
    serverFavorites.forEach(c => {
      if (!courseMap.has(Number(c.id))) {
        courseMap.set(Number(c.id), c);
      } else {
        courseMap.set(Number(c.id), { ...courseMap.get(Number(c.id)), ...c });
      }
    });

    return favIds
      .map(id => courseMap.get(Number(id)))
      .filter(Boolean)
      .map(course => {
        const meta = getCourseTechMeta(course);
        const cover = getCourseCover(course);
        const enrollment = enrollments.find(e => Number(e.course_id) === Number(course.id));
        const serverCompleted = Array.isArray(enrollment?.completed_modules) ? enrollment.completed_modules : [];
        const localCompleted = getLocalCompletedModules(course.id);
        const completedIds = Array.from(new Set([...serverCompleted, ...localCompleted].map(Number)));
        const stats = computePlaylistStats(course.modules || [], completedIds);
        const totalMods = (course.modules || []).length;
        const doneMods = (course.modules || []).filter(m => completedIds.includes(Number(m.id))).length;
        const rawProgress = totalMods > 0
          ? Math.min(100, Math.round((doneMods / totalMods) * 100))
          : (enrollment?.progress || 0);
        const progress = Math.max(enrollment?.progress || 0, rawProgress);
        const isCertified = Boolean(enrollment?.quiz_passed || localCerts[String(course.id)]?.quiz_passed);
        const favMeta = getLocalFavoriteMeta(course.id);
        const priorityKey = PRIORITY_CONFIG[favMeta.priority] ? favMeta.priority : 'medium';

        return {
          ...course,
          meta,
          cover,
          stats,
          totalMods,
          doneMods,
          progress,
          isCertified,
          allModulesDone: totalMods > 0 && progress === 100,
          priorityKey,
          priorityInfo: PRIORITY_CONFIG[priorityKey],
          collection: favMeta.collection || 'À étudier',
          personalNote: favMeta.personal_note || '',
        };
      });
  }, [allCourses, serverFavorites, favIds, enrollments, localCerts, metaVersion]);

  // ── Recommended Courses (Not yet in Favorites) for 1-Click Quick Add ──
  const recommendedCourses = useMemo(() => {
    return allCourses
      .filter(c => !favIds.includes(Number(c.id)))
      .slice(0, 4)
      .map(c => ({
        ...c,
        meta: getCourseTechMeta(c),
        cover: getCourseCover(c),
        stats: computePlaylistStats(c.modules || [], []),
      }));
  }, [allCourses, favIds]);

  // ── Global KPI Study Stats ──
  const studyStats = useMemo(() => {
    const totalCourses = enrichedFavorites.length;
    const highPriorityCount = enrichedFavorites.filter(c => c.priorityKey === 'high').length;
    const totalSeconds = enrichedFavorites.reduce((acc, c) => acc + (c.stats?.totalSeconds || 0), 0);
    const remainingSeconds = enrichedFavorites.reduce((acc, c) => acc + (c.stats?.remainingSeconds || 0), 0);
    const totalVideos = enrichedFavorites.reduce((acc, c) => acc + (c.totalMods || 0), 0);
    const avgProgress = totalCourses > 0
      ? Math.round(enrichedFavorites.reduce((acc, c) => acc + c.progress, 0) / totalCourses)
      : 0;
    const certifiedOrReadyCount = enrichedFavorites.filter(c => c.isCertified || c.allModulesDone).length;

    return {
      totalCourses,
      highPriorityCount,
      totalDurationFormatted: formatSecondsHuman(totalSeconds),
      remainingDurationFormatted: formatSecondsHuman(remainingSeconds),
      totalVideos,
      avgProgress,
      certifiedOrReadyCount,
    };
  }, [enrichedFavorites]);

  // ── Filtered & Sorted Favorites ──
  const filteredFavorites = useMemo(() => {
    const q = search.toLowerCase().trim();
    const list = enrichedFavorites.filter(c => {
      if (activeTab === 'high' && c.priorityKey !== 'high') return false;
      if (activeTab === 'in_progress' && (c.progress <= 0 || c.progress >= 100)) return false;
      if (activeTab === 'not_started' && c.progress > 0) return false;
      if (activeTab === 'certified' && !c.isCertified && !c.allModulesDone) return false;

      if (selectedCollection !== 'Toutes' && c.collection !== selectedCollection) return false;

      if (q) {
        const matchTitle = c.title.toLowerCase().includes(q);
        const matchTech = c.meta.badge.toLowerCase().includes(q) || c.meta.category.toLowerCase().includes(q);
        const matchNote = (c.personalNote || '').toLowerCase().includes(q);
        if (!matchTitle && !matchTech && !matchNote) return false;
      }
      return true;
    });

    return list.sort((a, b) => {
      if (sortBy === 'priority') return b.priorityInfo.rank - a.priorityInfo.rank;
      if (sortBy === 'progress') return b.progress - a.progress;
      if (sortBy === 'rating') return (Number(b.rating) || 4.8) - (Number(a.rating) || 4.8);
      if (sortBy === 'duration') return (b.stats?.totalSeconds || 0) - (a.stats?.totalSeconds || 0);
      return 0;
    });
  }, [enrichedFavorites, activeTab, selectedCollection, search, sortBy]);

  // ── Actions: Add / Remove / Undo / Update Meta / Schedule in Agenda ──
  const handleAddFavorite = async (course, e) => {
    if (e) e.stopPropagation();
    const numId = Number(course.id);
    const updated = toggleLocalFavoriteId(numId, true);
    setFavIds(updated.ids);
    showToast(`« ${course.title} » ajouté à vos Favoris ❤️`, 'success');
    try {
      await api.post(`/favorites/${numId}`, { priority: 'medium', collection: 'À étudier' });
    } catch {
      // Saved locally
    }
  };

  const handleRemoveFavorite = async (course, e) => {
    if (e) e.stopPropagation();
    const numId = Number(course.id);
    const updated = toggleLocalFavoriteId(numId, false);
    setFavIds(updated.ids);
    showToast(`« ${course.title} » retiré des favoris`, 'info', course);
    try {
      await api.post(`/favorites/${numId}`);
    } catch {
      // Updated locally
    }
  };

  const handleUndoRemove = async () => {
    if (!lastRemovedCourse) return;
    const course = lastRemovedCourse;
    setLastRemovedCourse(null);
    await handleAddFavorite(course);
  };

  const handleCyclePriority = async (course, e) => {
    if (e) e.stopPropagation();
    const order = ['medium', 'high', 'low'];
    const nextPriority = order[(order.indexOf(course.priorityKey) + 1) % order.length];
    saveLocalFavoriteMeta(course.id, { priority: nextPriority });
    setMetaVersion(v => v + 1);
    showToast(`Priorité changée : ${PRIORITY_CONFIG[nextPriority].label}`, 'success');
    try {
      await api.put(`/favorites/${course.id}/meta`, { priority: nextPriority });
    } catch {
      // Saved locally
    }
  };

  const handleChangeCollection = async (courseId, newCollection, e) => {
    if (e) e.stopPropagation();
    saveLocalFavoriteMeta(courseId, { collection: newCollection });
    setMetaVersion(v => v + 1);
    showToast(`Classé dans « ${newCollection} »`, 'success');
    try {
      await api.put(`/favorites/${courseId}/meta`, { collection: newCollection });
    } catch {
      // Saved locally
    }
  };

  const handleOpenNoteEditor = (course, e) => {
    if (e) e.stopPropagation();
    setEditingNoteId(course.id);
    setNoteDraft(course.personalNote || '');
  };

  const handleSaveNote = async (courseId, e) => {
    if (e) e.stopPropagation();
    saveLocalFavoriteMeta(courseId, { personal_note: noteDraft.trim() });
    setMetaVersion(v => v + 1);
    setEditingNoteId(null);
    showToast('Note d\'étude sauvegardée 📝', 'success');
    try {
      await api.put(`/favorites/${courseId}/meta`, { personal_note: noteDraft.trim() });
    } catch {
      // Saved locally
    }
  };

  const handleScheduleStudy = async (e) => {
    e.preventDefault();
    if (!scheduleCourse) return;
    setScheduling(true);
    try {
      await api.post('/agenda/events', {
        title: `Sprint Étude : ${scheduleCourse.title}`,
        date: scheduleForm.date,
        start_time: scheduleForm.start_time,
        end_time: scheduleForm.end_time,
        type: 'workshop',
        instructor: scheduleCourse.instructor?.name || 'Auto-Formation Vibe',
        location: `Playlist Interactive (/course/${scheduleCourse.id})`,
        meeting_url: `${window.location.origin}/course/${scheduleCourse.id}`,
        spots: 1,
        description: `Session d'étude planifiée depuis vos Favoris (${scheduleCourse.totalMods} vidéos • ${scheduleCourse.stats.totalFormatted}). Objectif : ${scheduleCourse.personalNote || 'Avancer sur la playlist et valider le quiz certifiant.'}`,
      });
      setScheduleCourse(null);
      showToast('Créneau d\'étude ajouté à votre Agenda Pro 📅', 'success');
    } catch {
      showToast('Erreur lors de la planification dans l\'agenda', 'info');
    } finally {
      setScheduling(false);
    }
  };

  const handleQuickAddStarterPack = async () => {
    const topThree = allCourses.slice(0, 3);
    if (!topThree.length) {
      navigate('/catalogue');
      return;
    }
    const idsToAdd = topThree.map(c => Number(c.id));
    const merged = setLocalFavoriteIds([...favIds, ...idsToAdd]);
    setFavIds(merged);
    topThree.forEach((c, idx) => {
      saveLocalFavoriteMeta(c.id, {
        priority: idx === 0 ? 'high' : 'medium',
        collection: idx === 0 ? 'Sprint Semaine' : 'À étudier',
      });
      api.post(`/favorites/${c.id}`, {
        priority: idx === 0 ? 'high' : 'medium',
        collection: idx === 0 ? 'Sprint Semaine' : 'À étudier',
      }).catch(() => {});
    });
    setMetaVersion(v => v + 1);
    showToast('3 formations phares ajoutées à votre liste d\'étude 🚀', 'success');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="page-view"
      style={{ paddingBottom: '5rem' }}
    >
      {/* ── Toast Notification + Undo Button ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            style={{
              position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999,
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(139, 92, 246, 0.45)',
              color: '#fff', padding: '0.9rem 1.35rem', borderRadius: '14px',
              fontWeight: 700, backdropFilter: 'blur(14px)',
              display: 'flex', alignItems: 'center', gap: '0.85rem',
              boxShadow: '0 16px 40px rgba(0,0,0,0.45)'
            }}
          >
            <CheckCircle2 size={18} color="#4ade80" />
            <span style={{ fontSize: '0.88rem' }}>{toast.text}</span>
            {lastRemovedCourse && (
              <button
                onClick={handleUndoRemove}
                style={{
                  background: 'rgba(167,139,250,0.2)',
                  border: '1px solid rgba(167,139,250,0.45)',
                  color: '#c4b5fd', borderRadius: '8px', padding: '0.3rem 0.65rem',
                  fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.3rem'
                }}
              >
                <RotateCcw size={13} /> Annuler
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header Banner ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        marginBottom: '1.8rem', flexWrap: 'wrap', gap: '1rem'
      }}>
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
            padding: '0.32rem 0.85rem', borderRadius: '999px',
            background: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fb7185', fontSize: '0.74rem', fontWeight: 800, marginBottom: '0.65rem',
            textTransform: 'uppercase', letterSpacing: '0.8px'
          }}>
            <Heart size={13} fill="currentColor" /> Bibliothèque Personnelle & Study Planner
          </div>
          <h1 className="page-title brand-font text-gradient-animated" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
            Vos Favoris & Collections Pro <Bookmark size={28} />
          </h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Organisez vos playlists par priorité, ajoutez vos notes d&apos;étude et planifiez vos créneaux directement dans l&apos;Agenda.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            className="btn-pro"
            onClick={() => navigate('/calendrier')}
            style={{
              background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
              color: 'var(--text-main)', padding: '0.65rem 1.15rem', borderRadius: '12px',
              display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer'
            }}
          >
            <Calendar size={16} color="#a78bfa" /> Voir mon Agenda
          </button>
          <button
            className="btn-pro btn-pro-primary"
            onClick={() => navigate('/catalogue')}
            style={{
              padding: '0.65rem 1.25rem', borderRadius: '12px',
              display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.84rem', fontWeight: 700
            }}
          >
            <Plus size={16} /> Explorer le Catalogue
          </button>
        </div>
      </div>

      {/* ── 4 Real KPI Study Cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '1rem',
        marginBottom: '1.8rem'
      }}>
        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
          borderRadius: '18px', padding: '1.15rem 1.35rem', display: 'flex', alignItems: 'center', gap: '1rem'
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: '14px',
            background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.28)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fb7185', flexShrink: 0
          }}>
            <Heart size={22} fill="currentColor" />
          </div>
          <div>
            <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>
              Playlists Sauvegardées
            </div>
            <div className="brand-font" style={{ fontSize: '1.55rem', fontWeight: 800, color: '#fff' }}>
              {studyStats.totalCourses}
              <span style={{ fontSize: '0.78rem', color: '#fb7185', marginLeft: '0.5rem', fontWeight: 700 }}>
                ({studyStats.highPriorityCount} Haute priorité 🔥)
              </span>
            </div>
          </div>
        </div>

        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
          borderRadius: '18px', padding: '1.15rem 1.35rem', display: 'flex', alignItems: 'center', gap: '1rem'
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: '14px',
            background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.28)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', flexShrink: 0
          }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>
              Volume d&apos;Étude Total
            </div>
            <div className="brand-font" style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff' }}>
              {studyStats.totalDurationFormatted}
              <span style={{ fontSize: '0.78rem', color: '#38bdf8', marginLeft: '0.45rem', fontWeight: 700 }}>
                • {studyStats.totalVideos} vidéos
              </span>
            </div>
          </div>
        </div>

        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
          borderRadius: '18px', padding: '1.15rem 1.35rem', display: 'flex', alignItems: 'center', gap: '1rem'
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: '14px',
            background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.28)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa', flexShrink: 0
          }}>
            <Zap size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.73rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>
              <span>Progression Moyenne</span>
              <span style={{ color: '#a78bfa' }}>{studyStats.avgProgress}%</span>
            </div>
            <div style={{
              width: '100%', height: '8px', background: 'rgba(255,255,255,0.07)',
              borderRadius: '999px', overflow: 'hidden', marginTop: '0.45rem'
            }}>
              <div style={{
                width: `${studyStats.avgProgress}%`, height: '100%',
                background: 'linear-gradient(90deg, #8b5cf6, #ec4899)', borderRadius: '999px',
                transition: 'width 0.3s ease'
              }} />
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
              Restant : {studyStats.remainingDurationFormatted}
            </div>
          </div>
        </div>

        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
          borderRadius: '18px', padding: '1.15rem 1.35rem', display: 'flex', alignItems: 'center', gap: '1rem'
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: '14px',
            background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.28)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4ade80', flexShrink: 0
          }}>
            <Award size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>
              Feu Vert & Certifiés
            </div>
            <div className="brand-font" style={{ fontSize: '1.55rem', fontWeight: 800, color: '#4ade80' }}>
              {studyStats.certifiedOrReadyCount}
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '0.45rem', fontWeight: 600 }}>
                / {studyStats.totalCourses} cours
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Smart Filter Bar: Status Tabs + Collection Pills + Search + Sort + View Toggle ── */}
      {enrichedFavorites.length > 0 && (
        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
          borderRadius: '20px', padding: '1.1rem 1.25rem', marginBottom: '1.8rem',
          display: 'flex', flexDirection: 'column', gap: '1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            {/* Status Filter Tabs */}
            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
              {FILTER_TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    background: activeTab === tab.key ? 'var(--gradient-magic)' : 'var(--bg-tertiary)',
                    border: activeTab === tab.key ? 'none' : '1px solid rgba(255,255,255,0.07)',
                    color: activeTab === tab.key ? '#fff' : 'var(--text-muted)',
                    padding: '0.48rem 0.95rem', borderRadius: '10px', fontSize: '0.8rem',
                    fontWeight: 700, cursor: 'pointer', transition: '0.2s'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search + Sort + Grid/List Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <div style={{
                background: 'var(--bg-tertiary)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '11px', padding: '0.42rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: '210px'
              }}>
                <Search size={15} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Filtrer par titre, techno, note..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-main)', fontSize: '0.82rem', width: '100%' }}
                />
              </div>

              <div style={{
                background: 'var(--bg-tertiary)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '11px', padding: '0.42rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem'
              }}>
                <ArrowUpDown size={14} color="#a78bfa" />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-main)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  <option value="priority" style={{ background: '#0f0f1a' }}>Trier : Priorité</option>
                  <option value="progress" style={{ background: '#0f0f1a' }}>Trier : Progression</option>
                  <option value="rating" style={{ background: '#0f0f1a' }}>Trier : Note ★</option>
                  <option value="duration" style={{ background: '#0f0f1a' }}>Trier : Durée</option>
                </select>
              </div>

              <div style={{ display: 'flex', background: 'var(--bg-tertiary)', borderRadius: '10px', padding: '0.2rem', border: '1px solid rgba(255,255,255,0.07)' }}>
                <button
                  onClick={() => setViewMode('grid')}
                  title="Vue Grille"
                  style={{
                    background: viewMode === 'grid' ? 'rgba(139,92,246,0.25)' : 'transparent',
                    color: viewMode === 'grid' ? '#c4b5fd' : 'var(--text-muted)',
                    border: 'none', borderRadius: '8px', padding: '0.35rem 0.55rem', cursor: 'pointer', display: 'flex'
                  }}
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  title="Vue Liste Compacte"
                  style={{
                    background: viewMode === 'list' ? 'rgba(139,92,246,0.25)' : 'transparent',
                    color: viewMode === 'list' ? '#c4b5fd' : 'var(--text-muted)',
                    border: 'none', borderRadius: '8px', padding: '0.35rem 0.55rem', cursor: 'pointer', display: 'flex'
                  }}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Collection Filter Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', marginRight: '0.3rem' }}>
              <FolderKanban size={14} color="#a78bfa" /> Collections :
            </span>
            {['Toutes', ...COLLECTIONS].map(col => (
              <button
                key={col}
                onClick={() => setSelectedCollection(col)}
                style={{
                  background: selectedCollection === col ? 'rgba(167,139,250,0.18)' : 'transparent',
                  border: selectedCollection === col ? '1px solid rgba(167,139,250,0.45)' : '1px solid rgba(255,255,255,0.08)',
                  color: selectedCollection === col ? '#c4b5fd' : 'var(--text-muted)',
                  padding: '0.28rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem',
                  fontWeight: 700, cursor: 'pointer'
                }}
              >
                {col}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Main Content: Favorites List or Interactive Empty State ── */}
      {loading ? (
        <div className="flex-center">
          <div className="loader-wrapper"><div className="loader-pro"></div></div>
        </div>
      ) : enrichedFavorites.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            textAlign: 'center', padding: '3.5rem 2rem',
            background: 'var(--bg-secondary)', borderRadius: '28px',
            border: '1px solid var(--glass-border)', marginBottom: '2.5rem'
          }}
        >
          <div style={{
            width: 84, height: 84, borderRadius: '26px',
            background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.28)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem'
          }}>
            <Heart size={40} color="#fb7185" />
          </div>
          <h2 className="brand-font" style={{ fontSize: '1.75rem', marginBottom: '0.6rem' }}>
            Votre bibliothèque de favoris est prête
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem', maxWidth: '520px', marginInline: 'auto', lineHeight: 1.6 }}>
            Sauvegardez vos playlists certifiantes préférées pour organiser votre plan d&apos;étude, définir des priorités, prendre des notes et réserver vos créneaux dans l&apos;Agenda.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            <button
              className="btn-pro btn-pro-primary"
              style={{ padding: '0.85rem 1.6rem' }}
              onClick={handleQuickAddStarterPack}
            >
              <Sparkles size={17} /> Importer le Pack 3 Formations Phares (1-Clic)
            </button>
            <button
              className="btn-pro"
              style={{
                padding: '0.85rem 1.5rem', background: 'var(--bg-tertiary)',
                border: '1px solid var(--glass-border)', color: 'var(--text-main)'
              }}
              onClick={() => navigate('/catalogue')}
            >
              <Play size={16} fill="currentColor" /> Parcourir tout le Catalogue
            </button>
          </div>
        </motion.div>
      ) : filteredFavorites.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '3rem 1.5rem',
          background: 'var(--bg-secondary)', borderRadius: '22px',
          border: '1px solid var(--glass-border)', marginBottom: '2rem'
        }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.95rem' }}>
            Aucun favori ne correspond à ce filtre.
          </p>
          <button
            className="btn-pro"
            onClick={() => { setActiveTab('all'); setSelectedCollection('Toutes'); setSearch(''); }}
            style={{
              background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.35)',
              color: '#c4b5fd', padding: '0.55rem 1.2rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 700
            }}
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div
          className={viewMode === 'grid' ? 'course-grid' : ''}
          style={viewMode === 'list' ? { display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' } : { marginBottom: '2.5rem' }}
        >
          {filteredFavorites.map((course, i) => (
            <motion.div
              key={course.id}
              className="course-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.25) }}
              onClick={() => navigate(`/course/${course.id}`)}
              style={
                viewMode === 'list'
                  ? { display: 'flex', flexDirection: 'row', alignItems: 'stretch', minHeight: '190px' }
                  : { display: 'flex', flexDirection: 'column' }
              }
            >
              {/* Cover Image + Priority Badge + Status Pill */}
              <div
                className="card-img-wrap"
                style={{
                  position: 'relative',
                  height: viewMode === 'list' ? 'auto' : '190px',
                  width: viewMode === 'list' ? '280px' : '100%',
                  flexShrink: 0
                }}
              >
                <img
                  src={course.cover}
                  alt={course.title}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {/* Top Left: Rating + Certified/Progress Status */}
                <div style={{
                  position: 'absolute', top: '10px', left: '10px',
                  display: 'flex', gap: '0.4rem', alignItems: 'center'
                }}>
                  <span style={{
                    background: 'rgba(8,8,18,0.86)', border: '1px solid rgba(251,191,36,0.35)',
                    color: '#fbbf24', padding: '0.25rem 0.6rem', borderRadius: '8px',
                    fontSize: '0.73rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.25rem'
                  }}>
                    <Star size={12} fill="#fbbf24" /> {Number(course.rating || 4.8).toFixed(1)}
                  </span>

                  {course.isCertified ? (
                    <span style={{
                      background: 'rgba(22,163,74,0.9)', color: '#fff',
                      padding: '0.25rem 0.6rem', borderRadius: '8px',
                      fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.25rem'
                    }}>
                      <Award size={12} /> CERTIFIÉ
                    </span>
                  ) : course.allModulesDone ? (
                    <span style={{
                      background: 'rgba(16,185,129,0.9)', color: '#fff',
                      padding: '0.25rem 0.6rem', borderRadius: '8px',
                      fontSize: '0.7rem', fontWeight: 800
                    }}>
                      FEU VERT QUIZ 🟢
                    </span>
                  ) : null}
                </div>

                {/* Top Right: Interactive Priority Toggle Button */}
                <button
                  onClick={(e) => handleCyclePriority(course, e)}
                  title="Cliquer pour changer la priorité"
                  style={{
                    position: 'absolute', top: '10px', right: '10px',
                    background: 'rgba(8,8,18,0.88)',
                    border: `1px solid ${course.priorityInfo.border}`,
                    color: course.priorityInfo.color,
                    padding: '0.28rem 0.65rem', borderRadius: '8px',
                    fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer',
                    backdropFilter: 'blur(8px)'
                  }}
                >
                  {course.priorityInfo.short}
                </button>
              </div>

              {/* Card Body */}
              <div className="course-info" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  {/* Tech Badge + Collection Selector */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem' }}>
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 800, color: course.meta.accent,
                      background: `${course.meta.accent}18`, padding: '0.2rem 0.55rem', borderRadius: '6px'
                    }}>
                      {course.meta.badge}
                    </span>

                    <select
                      value={course.collection}
                      onClick={e => e.stopPropagation()}
                      onChange={e => handleChangeCollection(course.id, e.target.value, e)}
                      style={{
                        background: 'var(--bg-tertiary)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#c4b5fd', borderRadius: '7px', padding: '0.18rem 0.45rem',
                        fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', outline: 'none'
                      }}
                    >
                      {COLLECTIONS.map(col => (
                        <option key={col} value={col} style={{ background: '#0f0f1a' }}>
                          📁 {col}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Course Title */}
                  <h3 className="brand-font" style={{ fontSize: '1.12rem', marginBottom: '0.55rem', lineHeight: 1.35 }}>
                    {course.title}
                  </h3>

                  {/* Playlist Meta Stats */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem',
                    color: 'var(--text-muted)', fontSize: '0.76rem', marginBottom: '0.75rem'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <BookOpen size={13} color={course.meta.accent} /> {course.doneMods}/{course.totalMods} vidéos
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={13} /> {course.stats.totalFormatted} (~{course.stats.avgFormatted}/vid)
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Users size={13} /> {course.students_count || 120}
                    </span>
                  </div>

                  {/* Real Playlist Progress Bar */}
                  <div style={{ marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.3rem' }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                        {course.progress === 100
                          ? 'Playlist 100% terminée ✓'
                          : course.progress > 0
                            ? `En cours (${course.stats.remainingFormatted} restants)`
                            : 'Prêt à démarrer'}
                      </span>
                      <span style={{ fontWeight: 800, color: course.progress === 100 ? '#4ade80' : '#a78bfa' }}>
                        {course.progress}%
                      </span>
                    </div>
                    <div style={{
                      width: '100%', height: '6px', background: 'rgba(255,255,255,0.07)',
                      borderRadius: '999px', overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${course.progress}%`, height: '100%',
                        background: course.progress === 100
                          ? 'linear-gradient(90deg, #22c55e, #10b981)'
                          : 'linear-gradient(90deg, #8b5cf6, #ec4899)',
                        borderRadius: '999px'
                      }} />
                    </div>
                  </div>

                  {/* Personal Study Note Section */}
                  <div
                    onClick={e => e.stopPropagation()}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px dashed rgba(255,255,255,0.12)',
                      borderRadius: '10px', padding: '0.55rem 0.75rem',
                      marginBottom: '0.95rem', fontSize: '0.76rem'
                    }}
                  >
                    {editingNoteId === course.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                        <textarea
                          rows={2}
                          value={noteDraft}
                          onChange={e => setNoteDraft(e.target.value)}
                          placeholder="Votre objectif d'étude (ex: Finir les chapitres 1 à 4 avant vendredi)..."
                          style={{
                            width: '100%', background: 'rgba(0,0,0,0.35)',
                            border: '1px solid rgba(167,139,250,0.4)', borderRadius: '7px',
                            color: '#fff', padding: '0.45rem', fontSize: '0.76rem', outline: 'none', resize: 'none'
                          }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                          <button
                            onClick={() => setEditingNoteId(null)}
                            style={{
                              background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
                              color: 'var(--text-muted)', borderRadius: '6px', padding: '0.2rem 0.55rem',
                              fontSize: '0.72rem', cursor: 'pointer'
                            }}
                          >
                            Annuler
                          </button>
                          <button
                            onClick={e => handleSaveNote(course.id, e)}
                            style={{
                              background: 'rgba(74,222,128,0.2)', border: '1px solid rgba(74,222,128,0.45)',
                              color: '#4ade80', borderRadius: '6px', padding: '0.2rem 0.65rem',
                              fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: '0.25rem'
                            }}
                          >
                            <Check size={12} /> Enregistrer
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={e => handleOpenNoteEditor(course, e)}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', gap: '0.5rem' }}
                      >
                        <span style={{ color: course.personalNote ? '#e2e8f0' : 'var(--text-muted)', fontStyle: course.personalNote ? 'normal' : 'italic' }}>
                          <FileText size={12} style={{ display: 'inline', marginRight: '0.35rem', verticalAlign: 'middle', color: '#a78bfa' }} />
                          {course.personalNote || 'Ajouter une note ou un objectif d\'étude...'}
                        </span>
                        <span style={{ color: '#a78bfa', fontWeight: 700, fontSize: '0.7rem', flexShrink: 0 }}>
                          Modifier
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons: Open Playlist + Schedule in Agenda + Remove */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button
                    className="btn-pro btn-pro-primary"
                    style={{ flex: 1, height: '40px', justifyContent: 'center', fontSize: '0.82rem' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(course.allModulesDone && !course.isCertified ? `/course/${course.id}/quiz` : `/course/${course.id}`);
                    }}
                  >
                    <Play size={14} fill="currentColor" />
                    {course.allModulesDone && !course.isCertified
                      ? 'Passer le Quiz'
                      : course.progress > 0
                        ? 'Reprendre'
                        : 'Ouvrir Playlist'}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setScheduleCourse(course);
                    }}
                    title="Planifier une session d'étude dans l'Agenda"
                    style={{
                      width: '40px', height: '40px', borderRadius: '10px',
                      background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.32)',
                      color: '#c4b5fd', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0
                    }}
                  >
                    <Calendar size={16} />
                  </button>

                  <button
                    style={{
                      width: '40px', height: '40px', borderRadius: '10px',
                      background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)',
                      color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0
                    }}
                    onClick={(e) => handleRemoveFavorite(course, e)}
                    title="Retirer des favoris"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Quick-Add Recommended Courses Section ── */}
      {recommendedCourses.length > 0 && (
        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
          borderRadius: '24px', padding: '1.6rem', marginTop: '1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 className="brand-font" style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <Sparkles size={19} color="#fbbf24" /> Suggestions à ajouter à vos Favoris en 1 clic
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>
                Complétez votre parcours d&apos;apprentissage avec ces playlists certifiantes populaires.
              </p>
            </div>
            <button
              onClick={() => navigate('/catalogue')}
              style={{
                background: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
                color: 'var(--text-main)', padding: '0.45rem 0.95rem', borderRadius: '10px',
                fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem'
              }}
            >
              Tout voir <ExternalLink size={13} />
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(245px, 1fr))',
            gap: '1rem'
          }}>
            {recommendedCourses.map(course => (
              <div
                key={course.id}
                onClick={() => navigate(`/course/${course.id}`)}
                style={{
                  background: 'var(--bg-tertiary)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '16px', overflow: 'hidden', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ height: '120px', position: 'relative' }}>
                    <img src={course.cover} alt={course.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span style={{
                      position: 'absolute', bottom: '8px', left: '8px',
                      background: 'rgba(8,8,18,0.86)', color: course.meta.accent,
                      padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 800
                    }}>
                      {course.meta.badge}
                    </span>
                  </div>
                  <div style={{ padding: '0.9rem 1rem 0.5rem' }}>
                    <h4 className="brand-font" style={{ fontSize: '0.95rem', marginBottom: '0.35rem', lineHeight: 1.35 }}>
                      {course.title}
                    </h4>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem' }}>
                      <span>{course.modules?.length || 0} vidéos</span>
                      <span>•</span>
                      <span>{course.stats.totalFormatted}</span>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '0.65rem 1rem 0.95rem' }}>
                  <button
                    onClick={(e) => handleAddFavorite(course, e)}
                    style={{
                      width: '100%', padding: '0.5rem', borderRadius: '10px',
                      background: 'rgba(244,63,94,0.14)', border: '1px solid rgba(244,63,94,0.35)',
                      color: '#fb7185', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
                    }}
                  >
                    <Heart size={14} fill="currentColor" /> + Ajouter aux Favoris
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Modal: Planifier un Créneau d'Étude dans l'Agenda Pro ── */}
      <AnimatePresence>
        {scheduleCourse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setScheduleCourse(null)}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              background: 'rgba(5, 5, 15, 0.82)', backdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%', maxWidth: '460px',
                background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
                borderRadius: '22px', padding: '1.6rem', boxShadow: '0 24px 60px rgba(0,0,0,0.6)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 className="brand-font" style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                  <Calendar size={20} color="#a78bfa" /> Planifier dans l&apos;Agenda
                </h3>
                <button
                  onClick={() => setScheduleCourse(null)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{
                background: 'var(--bg-tertiary)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '12px', padding: '0.85rem', marginBottom: '1.15rem'
              }}>
                <div style={{ fontSize: '0.72rem', color: scheduleCourse.meta.accent, fontWeight: 800 }}>
                  {scheduleCourse.meta.badge}
                </div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', marginTop: '0.15rem' }}>
                  {scheduleCourse.title}
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Progression actuelle : {scheduleCourse.progress}% • Restant : {scheduleCourse.stats.remainingFormatted}
                </div>
              </div>

              <form onSubmit={handleScheduleStudy} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 700 }}>
                    Date de la session d&apos;étude
                  </label>
                  <input
                    type="date"
                    required
                    value={scheduleForm.date}
                    onChange={e => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                    style={{
                      width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px',
                      background: 'var(--bg-tertiary)', border: '1px solid rgba(255,255,255,0.12)',
                      color: '#fff', fontSize: '0.86rem'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 700 }}>
                      Heure de début
                    </label>
                    <input
                      type="time"
                      required
                      value={scheduleForm.start_time}
                      onChange={e => setScheduleForm({ ...scheduleForm, start_time: e.target.value })}
                      style={{
                        width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px',
                        background: 'var(--bg-tertiary)', border: '1px solid rgba(255,255,255,0.12)',
                        color: '#fff', fontSize: '0.86rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 700 }}>
                      Heure de fin
                    </label>
                    <input
                      type="time"
                      required
                      value={scheduleForm.end_time}
                      onChange={e => setScheduleForm({ ...scheduleForm, end_time: e.target.value })}
                      style={{
                        width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px',
                        background: 'var(--bg-tertiary)', border: '1px solid rgba(255,255,255,0.12)',
                        color: '#fff', fontSize: '0.86rem'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setScheduleCourse(null)}
                    style={{
                      padding: '0.6rem 1.1rem', borderRadius: '10px',
                      background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
                      color: 'var(--text-muted)', fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={scheduling}
                    className="btn-pro btn-pro-primary"
                    style={{ padding: '0.6rem 1.25rem', borderRadius: '10px' }}
                  >
                    {scheduling ? 'Ajout en cours...' : 'Ajouter à mon Agenda 📅'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Favoris;
