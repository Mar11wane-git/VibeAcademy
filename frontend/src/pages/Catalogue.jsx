import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Map, Star, Users, BookOpen, Filter, CheckCircle2,
  Heart, Clock, Award, Play, Sparkles, ArrowUpDown
} from 'lucide-react';
import api, { getCachedData } from '../services/api';
import {
  getCourseCover,
  getCourseTechMeta,
  computePlaylistStats,
  getLocalCompletedModules,
  getAllLocalCertificates,
  getLocalFavoriteIds,
  setLocalFavoriteIds,
  toggleLocalFavoriteId,
} from '../utils/certificationEngine';

const CATEGORIES = [
  'Tous',
  'IA & Deep Learning',
  'Data & Big Data',
  'Cloud & DevOps',
  'Cybersécurité',
  'React & Web',
  'Mobile & Flutter',
  'Laravel & PHP',
  'Java & Backend',
  'Python & IA',
  'C & C++',
  'C# & .NET',
  'Node & Cloud',
  'SQL & Database',
  'Web3 & Blockchain',
  'UI/UX & Design',
];

const Catalogue = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState(() => getCachedData('/courses') || []);
  const [enrollments, setEnrollments] = useState(() => getCachedData('/my-courses') || []);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(() => !getCachedData('/courses'));
  const [showFilters, setShowFilters] = useState(true);
  const [toast, setToast] = useState(null);
  const [filterCat, setFilterCat] = useState('Tous');
  const [sortBy, setSortBy] = useState('popular'); // 'popular' | 'rating' | 'modules'
  const [favoritesIds, setFavoritesIds] = useState(() => {
    const cachedFavs = (getCachedData('/favorites') || []).map(f => Number(f.id));
    return Array.from(new Set([...cachedFavs, ...getLocalFavoriteIds()]));
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const isFav = (id) => favoritesIds.includes(Number(id));

  useEffect(() => {
    const fetchData = async () => {
      if (!courses.length) setLoading(true);
      try {
        const coursesRes = await api.get('/courses');
        setCourses(coursesRes.data || []);

        if (localStorage.getItem('token')) {
          const [favsRes, myCoursesRes] = await Promise.all([
            api.get('/favorites').catch(() => ({ data: [] })),
            api.get('/my-courses').catch(() => ({ data: [] })),
          ]);
          const serverIds = (favsRes.data || []).map(f => Number(f.id));
          const merged = Array.from(new Set([...serverIds, ...getLocalFavoriteIds()]));
          setFavoritesIds(merged);
          setLocalFavoriteIds(merged);
          setEnrollments(myCoursesRes.data || []);
        }
      } catch (err) {
        console.error('Erreur lors du chargement du catalogue:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleFavorite = async (courseId, e) => {
    e.stopPropagation();
    const numId = Number(courseId);
    const localToggle = toggleLocalFavoriteId(numId);
    setFavoritesIds(localToggle.ids);
    showToast(localToggle.favorited ? 'Ajouté à vos Favoris ❤️' : 'Retiré des favoris');
    try {
      const res = await api.post(`/favorites/${numId}`);
      if (typeof res.data?.favorited === 'boolean') {
        const synced = toggleLocalFavoriteId(numId, res.data.favorited);
        setFavoritesIds(synced.ids);
      }
    } catch {
      // Local favorite state already saved
    }
  };

  const localCerts = getAllLocalCertificates();

  const enrichedCourses = useMemo(() => {
    return courses.map(c => {
      const meta = getCourseTechMeta(c);
      const cover = getCourseCover(c);
      const enrollment = enrollments.find(e => Number(e.course_id) === Number(c.id));
      const serverCompleted = Array.isArray(enrollment?.completed_modules) ? enrollment.completed_modules : [];
      const localCompleted = getLocalCompletedModules(c.id);
      const mergedCompleted = Array.from(new Set([...serverCompleted, ...localCompleted].map(Number)));
      const stats = computePlaylistStats(c.modules || [], mergedCompleted);
      const totalMods = (c.modules || []).length;
      const validDone = (c.modules || []).filter(m => mergedCompleted.includes(Number(m.id))).length;
      const progress = totalMods > 0
        ? Math.min(100, Math.round((validDone / totalMods) * 100))
        : (enrollment?.progress || 0);
      const isEnrolled = Boolean(enrollment || mergedCompleted.length > 0);
      const isCertified = Boolean(enrollment?.quiz_passed || localCerts[String(c.id)]?.quiz_passed);

      return {
        ...c,
        meta,
        cover,
        stats,
        progress: Math.max(enrollment?.progress || 0, progress),
        isEnrolled,
        isCertified,
      };
    });
  }, [courses, enrollments, localCerts]);

  const filtered = useMemo(() => {
    const list = enrichedCourses.filter(c => {
      const q = search.toLowerCase().trim();
      const matchSearch = !q ||
        c.title.toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q) ||
        c.meta.badge.toLowerCase().includes(q);
      const matchCat = filterCat === 'Tous' ? true : c.meta.category === filterCat;
      return matchSearch && matchCat;
    });

    return list.sort((a, b) => {
      if (sortBy === 'rating') return (Number(b.rating) || 4.8) - (Number(a.rating) || 4.8);
      if (sortBy === 'modules') return (b.modules?.length || 0) - (a.modules?.length || 0);
      return (Number(b.students_count) || 0) - (Number(a.students_count) || 0);
    });
  }, [enrichedCourses, search, filterCat, sortBy]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-view" style={{ paddingBottom: '5rem' }}>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            style={{
              position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999,
              background: 'rgba(15, 23, 42, 0.92)', border: '1px solid rgba(74,222,128,0.45)',
              color: '#4ade80', padding: '1rem 1.5rem', borderRadius: '14px', fontWeight: 700,
              backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}
          >
            <CheckCircle2 size={18} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title brand-font text-gradient-animated" style={{ marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Map size={28} /> Catalogue des Formations Pro ({filtered.length})
          </h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Playlists séquentielles certifiantes avec durée moyenne par vidéo, validation automatique et examen final.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{
            background: 'var(--bg-secondary)', borderRadius: '14px', border: '1px solid var(--glass-border)',
            padding: '0.55rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '260px'
          }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Rechercher (Java, React, Python, C++...)"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', width: '100%', fontSize: '0.88rem' }}
            />
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
            borderRadius: '14px', padding: '0.45rem 0.85rem'
          }}>
            <ArrowUpDown size={15} color="#a78bfa" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '0.84rem', fontWeight: 600, outline: 'none', cursor: 'pointer' }}
            >
              <option value="popular" style={{ background: '#0f0f1a' }}>Plus populaires</option>
              <option value="rating" style={{ background: '#0f0f1a' }}>Mieux notés</option>
              <option value="modules" style={{ background: '#0f0f1a' }}>Nombre de vidéos</option>
            </select>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              background: showFilters ? 'rgba(112,0,255,0.15)' : 'var(--bg-tertiary)',
              border: showFilters ? '1px solid rgba(112,0,255,0.4)' : '1px solid var(--glass-border)',
              color: showFilters ? '#a78bfa' : 'var(--text-main)',
              padding: '0.55rem 1rem', borderRadius: '14px', display: 'flex', alignItems: 'center',
              gap: '0.5rem', cursor: 'pointer', fontWeight: 600
            }}
          >
            <Filter size={16} /> Fililières
          </button>
        </div>
      </div>

      {/* Category Filter Chips */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden', marginBottom: '2rem' }}
          >
            <div style={{
              display: 'flex', gap: '0.6rem', padding: '1rem',
              background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
              borderRadius: '18px', flexWrap: 'wrap'
            }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCat(cat)}
                  style={{
                    background: filterCat === cat ? 'var(--gradient-magic)' : 'var(--bg-tertiary)',
                    border: filterCat === cat ? 'none' : '1px solid rgba(255,255,255,0.06)',
                    color: filterCat === cat ? '#fff' : 'var(--text-muted)',
                    padding: '0.45rem 1rem', borderRadius: '10px', fontWeight: 700,
                    cursor: 'pointer', fontSize: '0.8rem', transition: '0.2s'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Course Cards Grid */}
      {loading ? (
        <div className="flex-center">
          <div className="loader-wrapper"><div className="loader-pro"></div></div>
        </div>
      ) : (
        <div className="course-grid">
          {filtered.length === 0 ? (
            <div style={{
              gridColumn: '1/-1', textAlign: 'center', padding: '4rem',
              color: 'var(--text-muted)', background: 'var(--bg-secondary)',
              borderRadius: '24px', border: '1px solid var(--glass-border)'
            }}>
              Aucun cours trouvé pour cette sélection.
            </div>
          ) : (
            filtered.map((c, i) => (
              <motion.div
                key={c.id}
                className="course-card"
                onClick={() => navigate(`/course/${c.id}`)}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div>
                  {/* Custom Tech Artwork Cover */}
                  <div className="card-img-wrap" style={{ position: 'relative', height: '190px' }}>
                    <img
                      src={c.cover}
                      alt={c.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />

                    {/* Rating Badge */}
                    <div className="card-overlay" style={{
                      left: '10px', right: 'auto',
                      background: 'rgba(8, 8, 18, 0.82)', border: '1px solid rgba(255,255,255,0.15)', color: '#fbbf24'
                    }}>
                      <Star size={13} fill="#fbbf24" /> {Number(c.rating || 4.8).toFixed(1)}
                    </div>

                    {/* Academic Status Badge */}
                    <div style={{
                      position: 'absolute', bottom: '10px', right: '10px',
                      background: c.isCertified
                        ? 'rgba(16,185,129,0.9)'
                        : c.isEnrolled
                          ? 'rgba(124,58,237,0.9)'
                          : 'rgba(8,8,18,0.85)',
                      backdropFilter: 'blur(8px)', padding: '0.3rem 0.75rem', borderRadius: '8px',
                      color: '#fff', fontWeight: 800, fontSize: '0.76rem',
                      border: '1px solid rgba(255,255,255,0.18)'
                    }}>
                      {c.isCertified
                        ? '🏆 Certifié'
                        : c.isEnrolled
                          ? `En cours (${c.progress}%)`
                          : '🎓 Parcours Certifiant'}
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => toggleFavorite(c.id, e)}
                      style={{
                        position: 'absolute', top: '10px', right: '10px',
                        background: 'rgba(8,8,18,0.7)', backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px',
                        width: '36px', height: '36px', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: isFav(c.id) ? '#ff0055' : '#fff',
                        cursor: 'pointer', zIndex: 10
                      }}
                    >
                      <Heart size={18} fill={isFav(c.id) ? '#ff0055' : 'none'} strokeWidth={2.3} />
                    </button>
                  </div>

                  {/* Course Info */}
                  <div className="course-info">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                      <span style={{
                        fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase',
                        letterSpacing: '0.8px', color: c.meta.accent
                      }}>
                        {c.meta.badge}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        Moy. ~{c.stats.avgFormatted}/vidéo
                      </span>
                    </div>

                    <h3 className="brand-font" style={{ fontSize: '1.18rem', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                      {c.title}
                    </h3>

                    <p style={{
                      fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.45,
                      marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden'
                    }}>
                      {c.description}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="course-meta" style={{
                    display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)',
                    fontSize: '0.78rem', marginBottom: '1rem', paddingTop: '0.75rem',
                    borderTop: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <BookOpen size={13} color={c.meta.accent} /> {c.modules?.length || 0} vidéos
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Clock size={13} color="#00d1ff" /> {c.stats.totalFormatted}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Users size={13} /> {c.students_count || 0}
                    </span>
                  </div>

                  <button
                    className="btn-pro btn-pro-primary"
                    style={{
                      width: '100%', justifyContent: 'center', borderRadius: '12px', height: '44px',
                      fontSize: '0.88rem', fontWeight: 700,
                      background: c.progress === 100
                        ? 'linear-gradient(135deg, #10b981, #00d1ff)'
                        : undefined
                    }}
                  >
                    {c.progress === 100 ? (
                      <><Award size={16} /> 🟢 Feu Vert Quiz / Certificat</>
                    ) : c.isEnrolled ? (
                      <><Play size={16} fill="#fff" /> Continuer la Playlist ({c.progress}%)</>
                    ) : (
                      <><Play size={16} fill="#fff" /> Démarrer la Playlist</>
                    )}
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </motion.div>
  );
};

export default Catalogue;
