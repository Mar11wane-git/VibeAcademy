import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Map, Star, Users, BookOpen, Filter, CheckCircle2, Heart } from 'lucide-react';
import api from '../services/api';

const STORAGE_KEY = 'vibeacademy_favorites';

const Catalogue = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState(null);
  const [filterCat, setFilterCat] = useState('Tous');
  
  // Use localStorage directly for global state
  const loadFavs = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const [favorites, setFavorites] = useState(loadFavs());

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const isFav = (id) => favorites.some(f => f.id === id);

  const toggleFavorite = (course, e) => {
    e.stopPropagation();
    let current = loadFavs();
    if(current.some(f => f.id === course.id)) {
      current = current.filter(fav => fav.id !== course.id);
      showToast('Retiré des favoris');
    } else {
      current.push(course);
      showToast('Ajouté aux favoris ❤️');
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    setFavorites(current);
  };

  useEffect(() => {
    api.get('/courses')
      .then(res => setCourses(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'Tous' ? true : (c.title.includes(filterCat) || c.description?.includes(filterCat));
    return matchSearch && matchCat;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-view">
      
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
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Découvrez et inscrivez-vous aux formations existantes.</p>
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
                {['Tous', 'React', 'Laravel', 'Python', 'Java', 'UI/UX'].map(cat => (
                   <button key={cat} onClick={() => setFilterCat(cat)} style={{ background: filterCat === cat ? 'linear-gradient(to right, #7000ff, #00d1ff)' : 'var(--bg-tertiary)', border: 'none', color: '#fff', padding: '0.5rem 1rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>{cat}</button>
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
              Aucun cours existant trouvé pour cette recherche.
            </div>
          ) : (
            filtered.map((c, i) => (
              <motion.div key={c.id} className="course-card" onClick={() => navigate(`/course/${c.id}`)} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                <div className="card-img-wrap" style={{ position: 'relative' }}>
                  <img src={c.thumbnail?.startsWith('http') ? c.thumbnail : `http://localhost:8000/storage/${c.thumbnail}`} alt={c.title} onError={e => e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000'} />
                  <div className="card-overlay" style={{ left: '10px', right: 'auto' }}><Star size={14} color="#fbbf24" fill="currentColor" /> {Number(c.rating || 4.8).toFixed(1)}</div>
                  <button onClick={(e) => toggleFavorite(c, e)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isFav(c.id) ? '#ef4444' : '#fff', cursor: 'pointer', transition: '0.2s', transform: isFav(c.id) ? 'scale(1.1)' : 'scale(1)' }} className="hover-color-accent">
                    <Heart size={16} fill={isFav(c.id) ? '#ef4444' : 'none'} color="currentColor" />
                  </button>
                </div>
                <div className="course-info">
                  <h3 className="brand-font">{c.title}</h3>
                  <div className="course-meta">
                    <span className="meta-item"><Users size={14} /> {c.students_count || 120} inscrits</span>
                    <span className="meta-item"><BookOpen size={14} /> {c.modules?.length || 0} modules</span>
                  </div>
                  <button className="btn-pro btn-pro-primary" style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }} onClick={(e) => { e.stopPropagation(); navigate(`/course/${c.id}`); }}>
                    Voir le cours
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
