import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Users, BookOpen, Sparkles, Activity, Clock, Trophy, Target } from 'lucide-react';
import api from '../services/api';
import { useApp } from '../context/AppContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useApp();
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const getUser = () => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : {};
    } catch { return {}; }
  };
  const user = getUser();

  const [errorStatus, setErrorStatus] = useState(null);

  useEffect(() => {
    if (user?.is_admin) {
      navigate('/admin');
      return;
    }
    // Separate fetches for robustness
    api.get('/courses')
      .then(res => setCourses(res.data))
      .catch(err => {
        console.error('Courses fetch error:', err);
        setErrorStatus('Erreur de chargement des cours.');
      })
      .finally(() => setLoading(false));

    api.get('/my-enrollments')
      .then(res => setEnrollments(res.data))
      .catch(err => console.error('Enrollment fetch error (normal if guest):', err));
  }, []);

  // Merge enrollment progress into courses
  const coursesWithProgress = courses.map(course => {
    const enrollment = enrollments.find(e => e.course_id === course.id);
    return { ...course, progress: enrollment ? enrollment.progress : 0, enrolled: !!enrollment };
  });

  const enrolledCount = enrollments.length;
  const completedCount = enrollments.filter(e => e.progress === 100).length;
  const averageProgress = enrolledCount > 0 ? Math.round(enrollments.reduce((acc, curr) => acc + curr.progress, 0) / enrolledCount) : 0;
  const totalHours = enrolledCount * 4; // Mock hours data

  const lastActiveCourse = coursesWithProgress.find(c => c.enrolled && c.progress > 0 && c.progress < 100) || coursesWithProgress.find(c => c.enrolled);
  const suggestedCourses = coursesWithProgress.filter(c => !c.enrolled).slice(0, 3);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-view">
      {/* Premium Hero Section */}
      <div style={{ background: 'linear-gradient(135deg, rgba(112,0,255,0.15) 0%, rgba(0,209,255,0.05) 100%)', border: '1px solid rgba(112,0,255,0.2)', borderRadius: '32px', padding: '3rem', marginBottom: '3rem', position: 'relative', overflow: 'hidden', display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center' }}>
         <div style={{ flex: '1 1 400px', zIndex: 2 }}>
            <h1 className="page-title brand-font text-gradient-animated" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              {t('welcome')} {user.name || 'Étudiant'} <Sparkles size={28} color="#fbbf24" strokeWidth={1.5} />
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem', lineHeight: 1.6 }}>Bienvenue sur ton espace de travail VibeAcademy. Prêt à repousser tes limites aujourd'hui ?</p>
            {lastActiveCourse ? (
               <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '20px', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <img src={lastActiveCourse.thumbnail?.startsWith('http') ? lastActiveCourse.thumbnail : `http://localhost:8000/storage/${lastActiveCourse.thumbnail}`} alt="" style={{ width: 80, height: 60, borderRadius: '12px', objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                     <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem', textTransform: 'uppercase', fontWeight: 800 }}>Reprendre le cours</p>
                     <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>{lastActiveCourse.title}</h3>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                        <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
                           <div style={{ width: `${lastActiveCourse.progress}%`, height: '100%', background: '#00d1ff', borderRadius: '10px', boxShadow: '0 0 10px rgba(0,209,255,0.5)' }}></div>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#00d1ff', fontWeight: 800 }}>{lastActiveCourse.progress}%</span>
                     </div>
                  </div>
                  <button className="btn-pro btn-pro-primary" onClick={() => navigate(`/course/${lastActiveCourse.id}`)} style={{ padding: '0.8rem 1.5rem', borderRadius: '14px' }}>Continuer</button>
               </div>
            ) : (
               <button className="btn-pro btn-pro-primary" onClick={() => navigate('/catalogue')}>Explorer le catalogue</button>
            )}
         </div>
         {/* Abstract Decoration */}
         <div style={{ position: 'absolute', right: '-10%', top: '-50%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(112,0,255,0.2) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: 1, pointerEvents: 'none' }}></div>
      </div>

      {/* Stats Section with Activity SVG */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        
        {/* Key Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', padding: '1.5rem', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '1rem', transition: '0.2s' }} className="hover-lift">
              <div style={{ width: 48, height: 48, borderRadius: '14px', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BookOpen size={24} /></div>
              <div><p style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-brand)', color: 'var(--text-main)', lineHeight: 1 }}>{enrolledCount}</p><p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 600 }}>Cours Inscrits</p></div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', padding: '1.5rem', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '1rem', transition: '0.2s' }} className="hover-lift">
              <div style={{ width: 48, height: 48, borderRadius: '14px', background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Target size={24} /></div>
              <div><p style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-brand)', color: 'var(--text-main)', lineHeight: 1 }}>{averageProgress}%</p><p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 600 }}>Moy. Progression</p></div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', padding: '1.5rem', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '1rem', transition: '0.2s' }} className="hover-lift">
              <div style={{ width: 48, height: 48, borderRadius: '14px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trophy size={24} /></div>
              <div><p style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-brand)', color: 'var(--text-main)', lineHeight: 1 }}>{completedCount}</p><p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 600 }}>Cours Terminés</p></div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', padding: '1.5rem', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '1rem', transition: '0.2s' }} className="hover-lift">
              <div style={{ width: 48, height: 48, borderRadius: '14px', background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Clock size={24} /></div>
              <div><p style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-brand)', color: 'var(--text-main)', lineHeight: 1 }}>{totalHours}h</p><p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 600 }}>Heures d'Étude</p></div>
            </div>
        </div>

        {/* Activity Chart Mockup */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', padding: '2rem', borderRadius: '24px', display: 'flex', flexDirection: 'column' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 className="brand-font" style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={20} color="#0ea5e9" /> Activité Hebdomadaire</h3>
              <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.8rem', borderRadius: '10px', color: 'var(--text-muted)' }}>Cette semaine</span>
           </div>
           <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '0.5rem', paddingTop: '1rem' }}>
              {[40, 70, 45, 90, 60, 20, 80].map((h, i) => (
                 <div key={i} style={{ width: '10%', height: '100%', position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <motion.div initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: i * 0.1, duration: 0.8, type: 'spring' }} style={{ width: '100%', background: i === 3 ? 'linear-gradient(to top, #7000ff, #00d1ff)' : 'rgba(255,255,255,0.1)', borderRadius: '6px' }}></motion.div>
                 </div>
              ))}
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700 }}>
             <span>Lun</span><span>Mar</span><span>Mer</span><span>Jeu</span><span>Ven</span><span>Sam</span><span>Dim</span>
           </div>
        </div>
      </div>

      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <h2 className="brand-font" style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Sparkles size={20} color="var(--accent-main)" /> Suggestions personnalisées</h2>
        <button style={{ background: 'transparent', border: 'none', color: '#a78bfa', fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate('/catalogue')}>Voir tout le catalogue &rarr;</button>
      </div>

      {errorStatus && (
        <div style={{ padding: '2rem', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', borderRadius: '16px', marginBottom: '2rem', textAlign: 'center' }}>{errorStatus}</div>
      )}

      {loading ? (
        <div className="flex-center">
          <div className="loader-wrapper"><div className="loader-pro"></div><p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Chargement des données...</p></div>
        </div>
      ) : (
        <div className="course-grid">
          {suggestedCourses.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', gridColumn: '1 / -1', background: 'var(--bg-secondary)', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
              <p style={{ color: 'var(--text-muted)' }}>Vous êtes inscrit à tous nos cours !</p>
            </div>
          ) : (
            suggestedCourses.map((c, i) => (
              <motion.div key={c.id} className="course-card" onClick={() => navigate(`/course/${c.id}`)} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <div className="card-img-wrap">
                   <img src={c.thumbnail?.startsWith('http') ? c.thumbnail : `http://localhost:8000/storage/${c.thumbnail}`} alt={c.title} onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop'; }} />
                  <div className="card-overlay"><Star size={14} color="#fbbf24" fill="currentColor" /> {Number(c.rating || 4.5).toFixed(1)}</div>
                </div>
                <div className="course-info">
                  <h3 className="brand-font">{c.title}</h3>
                  <div className="course-meta">
                    <span className="meta-item"><Users size={14} /> {c.students_count ? (c.students_count > 1000 ? `${(c.students_count / 1000).toFixed(1)}k` : c.students_count) : '0'} étudiants</span>
                    <span className="meta-item"><BookOpen size={14} /> {c.modules?.length || 0} modules</span>
                  </div>
                  <div style={{ marginTop: '1rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--accent-glow)', background: 'rgba(0,209,255,0.1)', padding: '0.3rem 0.6rem', borderRadius: '8px', fontWeight: 700 }}>Nouveau</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </motion.div>
  );
};

export default Dashboard;
