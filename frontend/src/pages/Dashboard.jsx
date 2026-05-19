import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Users, BookOpen, Sparkles, Activity, Clock, Trophy, Target } from 'lucide-react';
import api from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
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
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const [coursesRes, myCoursesRes] = await Promise.all([
        api.get('/courses'),
        api.get('/my-courses')
      ]);
      setCourses(coursesRes.data);
      setMyCourses(myCoursesRes.data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setErrorStatus('Impossible de charger vos données personnelles.');
    } finally {
      setLoading(false);
    }
  };

  const enrolledCount = myCourses.length;
  const completedCount = myCourses.filter(c => c.progress === 100).length;
  const averageProgress = enrolledCount > 0 ? Math.round(myCourses.reduce((acc, curr) => acc + (curr.progress || 0), 0) / enrolledCount) : 0;
  const totalHours = enrolledCount * 4; // Mock estimate for study time

  const lastActiveCourse = myCourses.find(c => (c.progress || 0) > 0 && (c.progress || 0) < 100) || myCourses[0];
  const suggestedCourses = courses.filter(c => !myCourses.some(m => m.id === c.id)).slice(0, 3);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-view" style={{ paddingBottom: '5rem' }}>
      {/* Premium Hero Section */}
      <div style={{ background: 'linear-gradient(135deg, rgba(112,0,255,0.1) 0%, rgba(0,209,255,0.05) 100%)', border: '1px solid rgba(112,0,255,0.15)', borderRadius: '32px', padding: '3.5rem', marginBottom: '3.5rem', position: 'relative', overflow: 'hidden', display: 'flex', flexWrap: 'wrap', gap: '2.5rem', alignItems: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
         <div style={{ flex: '1 1 400px', zIndex: 2 }}>
            <h1 className="page-title brand-font text-gradient-animated" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', fontSize: '2.8rem' }}>
              Ravi de vous voir, {user.name?.split(' ')[0] || 'Étudiant'} <Sparkles size={32} color="#fbbf24" fill="#fbbf24" />
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', marginBottom: '2.5rem', lineHeight: 1.6, maxWidth: '500px' }}>Bienvenue sur votre espace de travail intelligent. Allons passer un nouveau cap dans votre apprentissage aujourd'hui.</p>
            {lastActiveCourse ? (
               <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '22px', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}>
                  <img src={lastActiveCourse.thumbnail?.startsWith('http') ? lastActiveCourse.thumbnail : `http://localhost:8000/storage/${lastActiveCourse.thumbnail}`} alt="" style={{ width: 100, height: 75, borderRadius: '14px', objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                     <p style={{ fontSize: '0.75rem', color: '#a78bfa', marginBottom: '0.3rem', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '1px' }}>En cours de lecture</p>
                     <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>{lastActiveCourse.title}</h3>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.75rem' }}>
                        <div style={{ flex: 1, height: '7px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px' }}>
                           <div style={{ width: `${lastActiveCourse.progress || 0}%`, height: '100%', background: 'linear-gradient(to right, #7000ff, #00d1ff)', borderRadius: '10px', boxShadow: '0 0 12px rgba(112,0,255,0.4)' }}></div>
                        </div>
                        <span style={{ fontSize: '0.85rem', color: '#00d1ff', fontWeight: 800 }}>{lastActiveCourse.progress || 0}%</span>
                     </div>
                  </div>
                  <button className="btn-pro btn-pro-primary" onClick={() => navigate(`/course/${lastActiveCourse.id}`)} style={{ padding: '0.9rem 1.8rem', borderRadius: '15px' }}>Reprendre</button>
               </div>
            ) : (
               <button className="btn-pro btn-pro-primary" style={{ padding: '1rem 2rem' }} onClick={() => navigate('/catalogue')}>Parcourir les formations</button>
            )}
         </div>
         {/* Abstract Decoration */}
         <div style={{ position: 'absolute', right: '-10%', top: '-30%', width: '450px', height: '450px', background: 'radial-gradient(circle, rgba(112,0,255,0.15) 0%, transparent 70%)', filter: 'blur(50px)', zIndex: 1, pointerEvents: 'none' }}></div>
      </div>

      {/* Stats Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3.5rem' }}>
        
        {/* Key Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', padding: '1.75rem', borderRadius: '28px', display: 'flex', flexDirection: 'column', gap: '1.25rem', transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)' }} className="hover-lift">
              <div style={{ width: 52, height: 52, borderRadius: '16px', background: 'rgba(112,0,255,0.08)', color: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(112,0,255,0.15)' }}><BookOpen size={26} /></div>
              <div>
                <p style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1 }}>{enrolledCount}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Formations</p>
              </div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', padding: '1.75rem', borderRadius: '28px', display: 'flex', flexDirection: 'column', gap: '1.25rem', transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)' }} className="hover-lift">
              <div style={{ width: 52, height: 52, borderRadius: '16px', background: 'rgba(0,209,255,0.08)', color: '#00d1ff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,209,255,0.15)' }}><Target size={26} /></div>
              <div>
                <p style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1 }}>{averageProgress}%</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Progression</p>
              </div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', padding: '1.75rem', borderRadius: '28px', display: 'flex', flexDirection: 'column', gap: '1.25rem', transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)' }} className="hover-lift">
              <div style={{ width: 52, height: 52, borderRadius: '16px', background: 'rgba(251,191,36,0.08)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(251,191,36,0.15)' }}><Trophy size={26} /></div>
              <div>
                <p style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1 }}>{completedCount}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Certificats</p>
              </div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', padding: '1.75rem', borderRadius: '28px', display: 'flex', flexDirection: 'column', gap: '1.25rem', transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)' }} className="hover-lift">
              <div style={{ width: 52, height: 52, borderRadius: '16px', background: 'rgba(14,165,233,0.08)', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(14,165,233,0.15)' }}><Clock size={26} /></div>
              <div>
                <p style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1 }}>{totalHours}h</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Étude</p>
              </div>
            </div>
        </div>

        {/* Activity Mini View */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', padding: '2rem', borderRadius: '32px', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h3 className="brand-font" style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Activity size={22} color="#00d1ff" /> Votre Activité</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Intensité de travail hebdomadaire</p>
              </div>
              <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.04)', padding: '0.4rem 0.9rem', borderRadius: '10px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px' }}>MAI 2026</span>
           </div>
           <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '0.6rem', padding: '1rem 0' }}>
              {[35, 65, 40, 95, 55, 30, 75].map((h, i) => (
                 <div key={i} style={{ width: '10%', height: '100%', position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <motion.div initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: i * 0.1, duration: 1, type: 'spring' }} style={{ width: '100%', background: i === 3 ? 'var(--gradient-magic)' : 'rgba(255,255,255,0.06)', borderRadius: '8px', boxShadow: i === 3 ? '0 4px 15px rgba(112,0,255,0.3)' : 'none' }}></motion.div>
                 </div>
              ))}
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.25rem', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 800 }}>
             <span>LUN</span><span>MAR</span><span>MER</span><span>JEU</span><span>VEN</span><span>SAM</span><span>DIM</span>
           </div>
        </div>
      </div>

      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 className="brand-font" style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Sparkles size={24} color="#fbbf24" fill="#fbbf24" strokeWidth={1.5} /> Recommandé pour vous</h2>
        <button className="btn-pro btn-pro-outline" style={{ border: 'none', background: 'transparent', color: '#a78bfa', fontWeight: 700, fontSize: '0.9rem' }} onClick={() => navigate('/catalogue')}>Voir tout le catalogue &rarr;</button>
      </div>

      {errorStatus && (
        <div style={{ padding: '2rem', background: 'rgba(239, 68, 68, 0.08)', color: '#f87171', borderRadius: '18px', marginBottom: '2.5rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{errorStatus}</div>
      )}

      {loading ? (
        <div className="flex-center" style={{ padding: '4rem 0' }}>
          <div className="loader-wrapper"><div className="loader-pro"></div><p style={{ color: 'var(--text-muted)', fontWeight: 600, marginTop: '1rem' }}>Synchronisation de vos résultats...</p></div>
        </div>
      ) : (
        <div className="course-grid">
          {suggestedCourses.length === 0 ? (
            <div style={{ padding: '5rem 2rem', textAlign: 'center', gridColumn: '1 / -1', background: 'var(--bg-secondary)', borderRadius: '32px', border: '1px solid var(--glass-border)' }}>
              <div style={{ width: 70, height: 70, background: 'rgba(74,222,128,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#4ade80' }}><Trophy size={32} /></div>
              <h3 className="brand-font" style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Félicitations !</h3>
              <p style={{ color: 'var(--text-muted)' }}>Vous maîtrisez déjà tout notre catalogue actuel.</p>
            </div>
          ) : (
            suggestedCourses.map((c, i) => (
              <motion.div key={c.id} className="course-card" onClick={() => navigate(`/course/${c.id}`)} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <div className="card-img-wrap" style={{ position: 'relative' }}>
                   <img src={c.thumbnail?.startsWith('http') ? c.thumbnail : `http://localhost:8000/storage/${c.thumbnail}`} alt={c.title} onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000'; }} />
                   <div className="card-overlay" style={{ left: '12px', right: 'auto', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}><Star size={14} color="#fbbf24" fill="#fbbf24" /> {Number(c.rating || 4.8).toFixed(1)}</div>
                   <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'var(--gradient-magic)', padding: '0.3rem 0.75rem', borderRadius: '7px', color: '#fff', fontWeight: 900, fontSize: '0.85rem', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>{c.price > 0 ? `${c.price}€` : 'Gratuit'}</div>
                </div>
                <div className="course-info">
                  <h3 className="brand-font" style={{ fontSize: '1.2rem', marginBottom: '0.8rem', lineHeight: 1.3 }}>{c.title}</h3>
                  <div className="course-meta" style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Users size={14} /> {c.students_count || 0}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><BookOpen size={14} /> {c.modules?.length || 0} modules</span>
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
