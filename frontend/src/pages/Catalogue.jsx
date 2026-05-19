import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Map, Star, Users, BookOpen, Filter, CheckCircle2, Heart } from 'lucide-react';
import api from '../services/api';

const Catalogue = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState(null);
  const [filterCat, setFilterCat] = useState('Tous');
  const [favoritesIds, setFavoritesIds] = useState([]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const isFav = (id) => favoritesIds.includes(id);

  // Fetch courses and user favorites
  const fetchData = async () => {
    setLoading(true);
    try {
      const [coursesRes, favsRes] = await Promise.all([
        api.get('/courses'),
        api.get('/favorites')
      ]);
      setCourses(coursesRes.data);
      setFavoritesIds(favsRes.data.map(f => f.id));
    } catch (err) {
      console.error('Erreur lors du chargement du catalogue:', err);
      // If unauthorized, just show courses
      api.get('/courses').then(res => setCourses(res.data)).catch(console.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleFavorite = async (courseId, e) => {
    e.stopPropagation();
    try {
      const res = await api.post(`/favorites/${courseId}`);
      showToast(res.data.message);
      // Re-fetch favorites or update locally
      if (res.data.favorited) {
        setFavoritesIds(prev => [...prev, courseId]);
      } else {
        setFavoritesIds(prev => prev.filter(id => id !== courseId));
      }
    } catch (err) {
      showToast('Connectez-vous pour ajouter des favoris');
    }
  };

  const filtered = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'Tous' ? true : (c.title.includes(filterCat) || c.description?.includes(filterCat));
    return matchSearch && matchCat;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-view" style={{ paddingBottom: '5rem' }}>
      
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
            style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999, background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.4)', color: '#4ade80', padding: '1rem 1.5rem', borderRadius: '14px', fontWeight: 700, backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={18}/> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title brand-font text-gradient-animated" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Map size={28} />
            Catalogue des Cours
          </h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Découvrez et inscrivez-vous aux formations de haute qualité.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '14px', border: '1px solid var(--glass-border)', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '280px' }}>
            <Search size={16} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Rechercher un cours..." 
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', width: '100%', fontSize: '0.9rem' }}
            />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} style={{ background: showFilters ? 'rgba(112,0,255,0.15)' : 'var(--bg-tertiary)', border: showFilters ? '1px solid rgba(112,0,255,0.4)' : '1px solid var(--glass-border)', color: showFilters ? '#a78bfa' : 'var(--text-main)', padding: '0.5rem 1rem', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, transition: '0.2s' }}>
            <Filter size={16} /> Filtres
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginBottom: '2rem' }}>
             <div style={{ display: 'flex', gap: '0.8rem', padding: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '16px', flexWrap: 'wrap' }}>
                {['Tous', 'React', 'Laravel', 'UI/UX', 'IA'].map(cat => (
                   <button key={cat} onClick={() => setFilterCat(cat)} style={{ background: filterCat === cat ? 'var(--gradient-magic)' : 'var(--bg-tertiary)', border: 'none', color: '#fff', padding: '0.5rem 1rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>{cat}</button>
                ))}
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex-center">
          <div className="loader-wrapper"><div className="loader-pro"></div></div>
        </div>
      ) : (
        <div className="course-grid">
          {filtered.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', background: 'var(--bg-secondary)', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
              Aucun cours trouvé pour cette sélection.
            </div>
          ) : (
            filtered.map((c, i) => (
              <motion.div key={c.id} className="course-card" onClick={() => navigate(`/course/${c.id}`)} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                <div className="card-img-wrap" style={{ position: 'relative' }}>
                  <img src={c.thumbnail?.startsWith('http') ? c.thumbnail : `http://localhost:8000/storage/${c.thumbnail}`} alt={c.title} onError={e => e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000'} />
                  <div className="card-overlay" style={{ left: '10px', right: 'auto', background: 'var(--gradient-aurora)', color: '#fff' }}>
                    <Star size={14} fill="currentColor" /> {Number(c.rating || 4.8).toFixed(1)}
                  </div>
                  <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', padding: '0.3rem 0.8rem', borderRadius: '8px', color: '#fff', fontWeight: 800, fontSize: '0.9rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {c.price > 0 ? `${c.price} €` : 'Gratuit'}
                  </div>
                  <button onClick={(e) => toggleFavorite(c.id, e)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isFav(c.id) ? '#ff0055' : '#fff', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: 10 }}>
                    <Heart size={20} fill={isFav(c.id) ? '#ff0055' : 'none'} strokeWidth={2.5} />
                  </button>
                </div>
                <div className="course-info">
                  <h3 className="brand-font" style={{ fontSize: '1.2rem', marginBottom: '0.75rem', lineHeight: 1.3 }}>{c.title}</h3>
                  <div className="course-meta" style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Users size={14} /> {c.students_count || 0}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><BookOpen size={14} /> {c.modules?.length || 0} modules</span>
                  </div>
                  <button className="btn-pro btn-pro-primary" style={{ width: '100%', justifyContent: 'center', borderRadius: '14px', height: '48px' }}>
                    Commencer l'apprentissage
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
