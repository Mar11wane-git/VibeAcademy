import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Play, Star, Users, ArrowRight, GraduationCap, Clock, BarChart, Calendar, Activity, Award } from 'lucide-react';
import api from '../services/api';

const statusConfig = (progress) => {
  if (progress === 100) return { color: '#4ade80', label: 'Terminé', icon: '✓' };
  if (progress > 0) return { color: '#00d1ff', label: 'En cours', icon: '▶' };
  return { color: '#94a3b8', label: 'Non commencé', icon: '○' };
};

const MesCours = () => {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/my-courses');
      setEnrollments(res.data);
    } catch (err) {
      console.error('Erreur chargement mes cours:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = enrollments.filter(e => {
    if (filter === 'in-progress') return (e.progress || 0) > 0 && (e.progress || 0) < 100;
    if (filter === 'completed') return (e.progress || 0) === 100;
    return true;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-view" style={{ paddingBottom: '5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h1 className="page-title brand-font text-gradient-animated" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
             Ma Bibliothèque <BookOpen size={28} />
          </h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Gérez votre progression et reprenez vos cours exactement là où vous vous êtes arrêté.</p>
        </div>
        
        {!loading && enrollments.length > 0 && (
          <div style={{ display: 'flex', gap: '0.4rem', background: 'var(--bg-secondary)', padding: '0.4rem', borderRadius: '14px', border: '1px solid var(--glass-border)' }}>
            {[{ id: 'all', label: 'Tous' }, { id: 'in-progress', label: 'En cours' }, { id: 'completed', label: 'Terminés' }].map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)}
                style={{ padding: '0.6rem 1.25rem', borderRadius: '10px', border: 'none', background: filter === f.id ? 'var(--gradient-magic)' : 'transparent', color: filter === f.id ? '#fff' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 800, fontSize: '0.8rem', transition: 'all 0.3s' }}>
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex-center">
          <div className="loader-wrapper"><div className="loader-pro"></div><p style={{ color: 'var(--text-muted)', fontWeight: 600, marginTop: '1rem' }}>Chargement de vos formations...</p></div>
        </div>
      ) : enrollments.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '6rem 2rem', background: 'var(--bg-secondary)', borderRadius: '32px', border: '1px solid var(--glass-border)' }}>
          <div style={{ width: 100, height: 100, borderRadius: '30px', background: 'rgba(112,0,255,0.08)', border: '1px solid rgba(112,0,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
            <GraduationCap size={48} color="#a78bfa" strokeWidth={1.5} />
          </div>
          <h2 className="brand-font" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Aucun cours inscrit</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', maxWidth: '400px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>Vous n'avez pas encore rejoint de formation. Parcourez notre catalogue premium pour commencer votre parcours.</p>
          <button className="btn-pro btn-pro-primary" style={{ padding: '1rem 2rem' }} onClick={() => navigate('/catalogue')}>
            <Play size={18} fill="currentColor" /> Découvrir le catalogue
          </button>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filtered.map((e, i) => {
            const course = e.course;
            if (!course) return null;
            const status = statusConfig(e.progress || 0);
            return (
              <motion.div key={e.id}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                onClick={() => navigate(`/course/${course.id}`)}
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '28px', padding: '1.5rem', display: 'flex', gap: '2rem', alignItems: 'center', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative', overflow: 'hidden' }}
                className="hover-lift">
                
                <div style={{ width: 220, height: 130, borderRadius: '20px', overflow: 'hidden', flexShrink: 0, background: 'var(--bg-secondary)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <img
                    src={course.thumbnail?.startsWith('http') ? course.thumbnail : `http://localhost:8000/storage/${course.thumbnail}`}
                    alt={course.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000'; }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                    <div>
                        <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.75rem' }}>
                           <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', background: 'rgba(112,0,255,0.1)', padding: '0.3rem 0.7rem', borderRadius: '6px', color: '#a78bfa', fontWeight: 800 }}>Expert</span>
                           <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.7rem', borderRadius: '6px', color: 'var(--text-muted)', fontWeight: 700 }}><Clock size={12} /> ~4.5h</span>
                        </div>
                        <h3 className="brand-font" style={{ fontSize: '1.4rem', marginBottom: '0.4rem', color: 'var(--text-main)' }}>{course.title}</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Star size={14} color="#fbbf24" fill="#fbbf24" /> {course.rating || 4.8} • Par {course.instructor_name || 'VibeAcademy'}
                        </p>
                    </div>
                    <span style={{ background: `${status.color}15`, color: status.color, padding: '0.5rem 1.25rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 900, border: `1px solid ${status.color}30`, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.5rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                      <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{status.icon}</span> {status.label}
                    </span>
                  </div>
                  
                  <div style={{ background: 'rgba(0,0,0,0.1)', borderRadius: '18px', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{e.progress === 100 ? 'Formation complétée' : `Votre progression globale`}</span>
                        <span style={{ fontSize: '1rem', fontWeight: 900, color: status.color }}>{e.progress}%</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.04)', borderRadius: '20px', overflow: 'hidden', marginBottom: '1rem' }}>
                        <motion.div style={{ height: '100%', background: status.color, boxShadow: `0 0 15px ${status.color}40`, borderRadius: '20px' }} initial={{ width: 0 }} animate={{ width: `${e.progress}%` }} transition={{ duration: 1, delay: i * 0.1 + 0.3 }} />
                    </div>
                    <div style={{ display: 'flex', gap: '2rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><BookOpen size={14} /> {course.modules_count || course.modules?.length || 0} Chapitres</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={14} /> Mis à jour récemment</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <button className="btn-pro btn-pro-primary" style={{ height: '52px', padding: '0 1.5rem', justifyContent: 'center' }}>
                      {e.progress === 100 ? 'Revoir le cours' : (e.progress || 0) > 0 ? 'Continuer' : 'Commencer'}
                      <ArrowRight size={18} />
                    </button>
                    {e.progress === 100 && (
                        <button className="btn-pro btn-pro-outline" style={{ height: '44px', color: '#a78bfa', borderColor: 'rgba(112,0,255,0.3)', fontWeight: 800, fontSize: '0.8rem' }} onClick={(e) => { e.stopPropagation(); navigate('/certificats'); }}>
                            <Award size={16} /> Certificat
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
