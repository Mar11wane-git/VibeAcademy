import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bookmark, Play, Star, Users, Trash2, Heart } from 'lucide-react';

const STORAGE_KEY = 'vibeacademy_favorites';

const Favoris = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    setFavorites(saved);
  }, []);

  const removeFavorite = (courseId) => {
    const updated = favorites.filter(f => f.id !== courseId);
    setFavorites(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <h1 className="page-title brand-font" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            Favoris <Bookmark size={28} color="var(--accent-purple)" strokeWidth={1.5} />
          </h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Gérez les cours que vous avez sauvegardés pour plus tard.</p>
        </div>
        <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem 1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Total Sauvegardés</span>
            <span className="brand-font" style={{ fontSize: '1.5rem', color: 'var(--text-main)' }}>{favorites.length}</span>
          </div>
        </div>
      </div>

      {favorites.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '5rem 2rem', background: 'var(--glass-bg)', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
          <div style={{ width: 80, height: 80, borderRadius: '20px', background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Heart size={36} color="var(--accent-pink)" />
          </div>
          <h2 className="brand-font" style={{ marginBottom: '1rem' }}>Aucun favori</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Cliquez sur "Sauvegarder" dans un cours pour l'ajouter ici.</p>
          <button className="btn-pro btn-pro-primary" onClick={() => navigate('/dashboard')}>
            <Play size={18} fill="currentColor" /> Découvrir des cours
          </button>
        </motion.div>
      ) : (
        <div className="course-grid">
          {favorites.map((course, i) => (
            <motion.div key={course.id} className="course-card"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
              <div className="card-img-wrap" onClick={() => navigate(`/course/${course.id}`)}>
                <img src={course.thumbnail} alt={course.title} />
                <div className="card-overlay"><Star size={14} color="#fbbf24" fill="#fbbf24" /> {Number(course.rating || 0).toFixed(1)}</div>
              </div>
              <div className="course-info">
                <h3 className="brand-font" style={{ cursor: 'pointer' }} onClick={() => navigate(`/course/${course.id}`)}>{course.title}</h3>
                <div className="course-meta">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Users size={14} /> {(course.students_count / 1000).toFixed(1)}k étudiants</span>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button className="btn-pro btn-pro-primary" style={{ flex: 1, padding: '0.6rem' }}
                    onClick={() => navigate(`/course/${course.id}`)}>
                    <Play size={16} fill="currentColor" /> Voir le cours
                  </button>
                  <button className="pill-btn"
                    style={{ padding: '0.6rem 1rem', color: '#f87171', borderColor: 'rgba(239,68,68,0.3)' }}
                    onClick={() => removeFavorite(course.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export const addToFavorites = (course) => {
  const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  if (!existing.find(f => f.id === course.id)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, course]));
    return true;
  }
  return false;
};

export const isInFavorites = (courseId) => {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]').some(f => f.id === courseId);
};

export default Favoris;
