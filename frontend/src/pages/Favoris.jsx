import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bookmark, Play, Star, Users, Trash2, Heart } from 'lucide-react';
import api from '../services/api';

const Favoris = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await api.get('/favorites');
      setFavorites(res.data);
    } catch (err) {
      console.error('Erreur chargement favoris:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (courseId) => {
    try {
      await api.post(`/favorites/${courseId}`);
      setFavorites(prev => prev.filter(f => f.id !== courseId));
    } catch (err) {
      console.error('Erreur retrait favori:', err);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-view" style={{ paddingBottom: '5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <h1 className="page-title brand-font text-gradient-animated" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
             Vos Favoris <Bookmark size={28} />
          </h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Retrouvez ici tous les cours que vous avez sauvegardés pour les consulter plus tard.</p>
        </div>
        {!loading && favorites.length > 0 && (
          <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem 1.5rem', borderRadius: '18px', border: '1px solid var(--glass-border)', display: 'flex', gap: '1.5rem', alignItems: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <div>
              <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: 800, marginBottom: '2px' }}>Favoris</span>
              <span className="brand-font" style={{ fontSize: '1.6rem', color: '#a78bfa' }}>{favorites.length}</span>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex-center">
          <div className="loader-wrapper"><div className="loader-pro"></div></div>
        </div>
      ) : favorites.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '6rem 2rem', background: 'var(--bg-secondary)', borderRadius: '32px', border: '1px solid var(--glass-border)' }}>
          <div style={{ width: 100, height: 100, borderRadius: '30px', background: 'rgba(255,0,85,0.08)', border: '1px solid rgba(255,0,85,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
            <Heart size={48} color="#ff0055" strokeWidth={1.5} />
          </div>
          <h2 className="brand-font" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Votre liste est vide</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', maxWidth: '400px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>Parcourez notre catalogue et cliquez sur le coeur pour ajouter des cours à vos favoris.</p>
          <button className="btn-pro btn-pro-primary" style={{ padding: '1rem 2rem' }} onClick={() => navigate('/catalogue')}>
            <Play size={18} fill="currentColor" /> Explorer le catalogue
          </button>
        </motion.div>
      ) : (
        <div className="course-grid">
          {favorites.map((course, i) => (
            <motion.div key={course.id} className="course-card"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
              <div className="card-img-wrap" style={{ position: 'relative' }} onClick={() => navigate(`/course/${course.id}`)}>
                <img src={course.thumbnail?.startsWith('http') ? course.thumbnail : `http://localhost:8000/storage/${course.thumbnail}`} alt={course.title} />
                <div className="card-overlay" style={{ background: 'var(--gradient-aurora)' }}><Star size={14} fill="currentColor" /> {Number(course.rating || 4.5).toFixed(1)}</div>
              </div>
              <div className="course-info">
                <h3 className="brand-font" style={{ fontSize: '1.2rem', marginBottom: '0.75rem', cursor: 'pointer' }} onClick={() => navigate(`/course/${course.id}`)}>{course.title}</h3>
                <div className="course-meta" style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
                  <span><Users size={14} /> {course.students_count || 0} étudiants</span>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn-pro btn-pro-primary" style={{ flex: 1, height: '44px', justifyContent: 'center' }}
                    onClick={() => navigate(`/course/${course.id}`)}>
                    <Play size={16} fill="currentColor" /> Continuer
                  </button>
                  <button className="admin-action-btn danger"
                    style={{ width: '44px', height: '44px' }}
                    onClick={() => removeFavorite(course.id)}
                    title="Retirer des favoris">
                    <Trash2 size={18} />
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

export default Favoris;
