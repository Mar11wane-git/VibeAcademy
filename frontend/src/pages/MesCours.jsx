import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Play, TrendingUp, Star, Users, ArrowRight, GraduationCap, Clock, User, BarChart, Calendar } from 'lucide-react';
import api from '../services/api';

const statusConfig = (progress) => {
  if (progress === 100) return { color: '#4ade80', label: 'Terminé', icon: '✓' };
  if (progress > 0) return { color: '#3b82f6', label: 'En cours', icon: '▶' };
  return { color: '#94a3b8', label: 'Non commencé', icon: '○' };
};

const MesCours = () => {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'in-progress', 'completed'

  useEffect(() => {
    api.get('/my-enrollments')
      .then(res => setEnrollments(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title brand-font" style={{ marginBottom: '0.5rem' }}>Mes Cours</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Gérez et reprenez vos cours en un clic.</p>
        </div>
        {!loading && enrollments.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
            {[{ id: 'all', label: 'Tous' }, { id: 'in-progress', label: 'En cours' }, { id: 'completed', label: 'Terminés' }].map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)}
                style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: filter === f.id ? 'var(--accent-purple)' : 'transparent', color: filter === f.id ? 'white' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s' }}>
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex-center">
          <div className="loader-wrapper">
            <div className="loader-pro"></div>
            <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Récupération de votre progression...</p>
          </div>
        </div>
      ) : enrollments.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '5rem 2rem', background: 'var(--glass-bg)', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
          <div style={{ width: 80, height: 80, borderRadius: '20px', background: 'rgba(255, 255, 255,0.1)', border: '1px solid rgba(255, 255, 255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <GraduationCap size={36} color="var(--accent-purple)" />
          </div>
          <h2 className="brand-font" style={{ marginBottom: '1rem' }}>Aucun cours pour l'instant</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Découvrez notre catalogue et commencez votre apprentissage.</p>
          <button className="btn-pro btn-pro-primary" onClick={() => navigate('/dashboard')}>
            <Play size={18} fill="currentColor" /> Explorer les cours
          </button>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {enrollments.filter(e => {
            if (filter === 'in-progress') return e.progress > 0 && e.progress < 100;
            if (filter === 'completed') return e.progress === 100;
            return true;
          }).map((enrollment, i) => {
            const course = enrollment.course;
            if (!course) return null;
            const status = statusConfig(enrollment.progress);
            return (
              <motion.div key={enrollment.id}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '24px', padding: '1.5rem', display: 'flex', gap: '2rem', alignItems: 'center', cursor: 'pointer', transition: 'all 0.3s ease', flexWrap: 'wrap' }}
                onClick={() => navigate(`/course/${course.id}`)}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-purple)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(112, 0, 255, 0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ width: 160, height: 100, borderRadius: '12px', overflow: 'hidden', flexShrink: 0, background: 'var(--bg-secondary)' }}>
                  <img
                    src={course.thumbnail?.startsWith('http') ? course.thumbnail : `http://localhost:8000/storage/${course.thumbnail}`}
                    alt={course.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop'; }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                           <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: 'var(--text-muted)' }}><BarChart size={12} /> Intermédiaire</span>
                           <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: 'var(--text-muted)' }}><Clock size={12} /> ~4h restantes</span>
                        </div>
                        <h3 className="brand-font" style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{course.title}</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Par <strong style={{ color: 'var(--text-main)' }}>Expert VibeAcademy</strong></p>
                    </div>
                    <span style={{ background: `${status.color}22`, color: status.color, padding: '0.3rem 0.9rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, border: `1px solid ${status.color}44`, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {status.label}
                    </span>
                  </div>
                  
                  <div style={{ background: 'rgba(0,0,0,0.15)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{enrollment.progress === 100 ? 'Cours terminé' : `Prochain chapitre suggéré...`}</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: status.color }}>{enrollment.progress}%</span>
                    </div>
                    <div className="progress-container" style={{ height: '6px', marginBottom: '0.75rem' }}>
                        <motion.div className="progress-bar" style={{ background: status.color }} initial={{ width: 0 }} animate={{ width: `${enrollment.progress}%` }} transition={{ duration: 1, delay: i * 0.1 + 0.3 }} />
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><BookOpen size={13} /> {course.modules?.length || 0} modules au total</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Calendar size={13} /> Dernier accès : Il y a 2 jours</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button className="btn-pro btn-pro-primary" style={{ padding: '0.75rem 1.5rem', flexShrink: 0, justifyContent: 'center' }}
                    onClick={e => { e.stopPropagation(); navigate(`/course/${course.id}`); }}>
                    {enrollment.progress === 100 ? 'Revoir' : enrollment.progress > 0 ? 'Continuer' : 'Commencer'}
                    <ArrowRight size={16} />
                    </button>
                    {enrollment.progress === 100 && (
                        <button className="btn-pro btn-pro-outline" style={{ padding: '0.5rem', fontSize: '0.85rem', color: 'var(--accent-purple)', borderColor: 'var(--accent-purple)' }} onClick={(e) => { e.stopPropagation(); navigate('/certificats'); }}>
                            Voir le certificat
                        </button>
                    )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default MesCours;
