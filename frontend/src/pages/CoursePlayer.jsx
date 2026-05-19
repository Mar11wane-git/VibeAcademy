import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Clock, MonitorPlay, BookOpen, Bookmark, Send, CheckCircle, Film, MessageSquare, List, Lock, Heart, Sparkles, Rocket, FileText, Award, Trash2 } from 'lucide-react';
import api from '../services/api';

// YouTube embed helper — strips to plain video id
const getYouTubeId = (url) => {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  return match ? match[1] : null;
};

const CoursePlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [activeModule, setActiveModule] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [enrollment, setEnrollment] = useState(null);
  const [canComplete, setCanComplete] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [saved, setSaved] = useState(false);

  const getUser = () => {
    try {
      const u = localStorage.getItem('user');
      return u && u !== 'undefined' ? JSON.parse(u) : {};
    } catch { return {}; }
  };
  const user = getUser();

  const isUnlocked = (module) => {
    if (!module) return false;
    if (module.order === 1) return true;
    if (!enrolled || !course?.modules) return false;
    const prevModule = course.modules.find(m => m.order === module.order - 1);
    if (!prevModule) return true;
    return enrollment?.completed_modules?.includes(prevModule.id);
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [courseRes, commentsRes] = await Promise.all([
          api.get(`/courses/${id}`),
          api.get(`/courses/${id}/comments`)
        ]);
        setCourse(courseRes.data);
        setComments(commentsRes.data);
        
        const sortedModules = courseRes.data.modules?.sort((a,b) => a.order - b.order) || [];
        setActiveModule(sortedModules[0] || null);

        if (localStorage.getItem('token')) {
          try {
            const [myCoursesRes, favCheckRes] = await Promise.all([
              api.get('/my-courses'),
              api.get(`/favorites/${id}/check`)
            ]);
            
            // Check if user is enrolled in THIS course
            const currentEnrollment = myCoursesRes.data.find(e => e.course_id === parseInt(id));
            if (currentEnrollment) {
              setEnrolled(true);
              setEnrollment(currentEnrollment);
            }
            setSaved(favCheckRes.data.favorited);
          } catch (e) {
            console.log("Guest mode or profile error.");
          }
        }
      } catch (err) {
        console.error('Erreur chargement cours:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const handleEnroll = async () => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }
    setEnrolling(true);
    try {
      await api.post(`/enroll/${id}`);
      setEnrolled(true);
      // Refresh to get enrollment data
      const myCoursesRes = await api.get('/my-courses');
      const currentEn = myCoursesRes.data.find(e => e.course_id === parseInt(id));
      setEnrollment(currentEn);
    } catch (err) {
      console.error('Erreur inscription:', err);
    } finally {
      setEnrolling(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }
    try {
      const res = await api.post(`/favorites/${id}`);
      setSaved(res.data.favorited);
    } catch (err) {
      console.error('Erreur favoris:', err);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const res = await api.post(`/courses/${id}/comments`, { body: commentText });
      setComments([res.data, ...comments]);
      setCommentText('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Supprimer ce commentaire ?")) return;
    try {
      await api.delete(`/comments/${commentId}`);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (err) {
      console.error("Erreur suppression commentaire", err);
    }
  };

  if (loading) {
    return (
      <div className="flex-center">
        <div className="loader-wrapper"><div className="loader-pro"></div><p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Préparation de votre espace d'apprentissage...</p></div>
      </div>
    );
  }

  if (!course) return <div className="page-view flex-center"><p className="brand-font">Cours introuvable.</p></div>;
  const ytId = getYouTubeId(activeModule?.video_url);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-view" style={{ paddingBottom: '5rem' }}>
      <div className="player-layout">
        
        <div className="player-main">
          {/* Video Area */}
          <div className="video-container" style={{ position: 'relative', overflow: 'hidden', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', background: '#000' }}>
            {ytId && playing ? (
              <iframe
                key={activeModule.id}
                width="100%" height="100%"
                src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
                title={activeModule.title} frameBorder="0" allowFullScreen
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
              />
            ) : ytId && !playing ? (
              <div onClick={() => setPlaying(true)} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer' }}>
                <img 
                  src={course?.thumbnail?.startsWith('http') ? course.thumbnail : `http://localhost:8000/storage/${course.thumbnail}`} 
                  alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.5)' }} 
                />
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 10 }}>
                   <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--gradient-magic)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(139,92,246,0.6)' }}>
                     <Play size={32} color="#fff" fill="#fff" />
                   </motion.div>
                </div>
                <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', color: '#fff' }}>
                   <p style={{ fontSize: '0.8rem', opacity: 0.7, textTransform: 'uppercase', fontWeight: 800 }}>{activeModule.order}. {activeModule.duration}</p>
                   <h2 className="brand-font" style={{ fontSize: '1.8rem' }}>{activeModule.title}</h2>
                </div>
              </div>
            ) : (
              <div className="video-placeholder" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <MonitorPlay size={64} color="var(--text-muted)" style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <p style={{ color: 'var(--text-muted)' }}>Contenu indisponible pour le moment.</p>
              </div>
            )}
          </div>

          <div style={{ marginTop: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h1 className="brand-font" style={{ fontSize: '2.2rem' }}>{course.title}</h1>
              {!enrolled ? (
                <button className="btn-pro btn-pro-primary" style={{ padding: '0.8rem 2rem' }} onClick={handleEnroll} disabled={enrolling}>
                  <Rocket size={18} /> {enrolling ? 'Inscription...' : 'S\'inscrire gratuitement'}
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4ade80', fontWeight: 800, background: 'rgba(74,222,128,0.1)', padding: '0.6rem 1.2rem', borderRadius: '12px', border: '1px solid rgba(74,222,128,0.2)' }}>
                  <CheckCircle size={18} /> Déjà inscrit
                </div>
              )}
            </div>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '1.1rem', marginBottom: '2rem' }}>{course.description}</p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'var(--gradient-aurora)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>
                  {course.instructor?.name?.[0] || 'V'}
                </div>
                <div>
                  <p style={{ fontWeight: 800, color: 'var(--text-main)' }}>{course.instructor?.name || 'Instructeur VibeAcademy'}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Expert Certifié • {course.students_count || 120} étudiants</p>
                </div>
              </div>
              <button onClick={handleToggleFavorite} className={`admin-action-btn ${saved ? 'active' : ''}`} style={{ background: saved ? 'rgba(255,0,85,0.1)' : 'transparent', color: saved ? '#ff0055' : 'var(--text-muted)', border: saved ? '1px solid rgba(255,0,85,0.2)' : '1px solid var(--glass-border)', padding: '0.6rem 1.25rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
                <Heart size={18} fill={saved ? '#ff0055' : 'none'} /> {saved ? 'Sauvegardé' : 'Mettre en favori'}
              </button>
            </div>
          </div>

          <div style={{ marginTop: '4rem' }}>
             <h3 className="brand-font" style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
               <MessageSquare size={24} color="#00d1ff" /> Discussions ({comments.length})
             </h3>
             <form onSubmit={handleComment} style={{ background: 'var(--bg-secondary)', borderRadius: '20px', padding: '0.6rem', border: '1px solid var(--glass-border)', display: 'flex', gap: '0.6rem', marginBottom: '2.5rem' }}>
               <input 
                 type="text" value={commentText} onChange={e => setCommentText(e.target.value)}
                 placeholder="Une question ? Échangez avec la communauté..." 
                 style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', padding: '0 1rem', outline: 'none' }}
               />
               <button className="btn-pro btn-pro-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: '14px' }}>Envoyer</button>
             </form>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               {comments.map(c => (
                 <div key={c.id} style={{ display: 'flex', gap: '1rem', padding: '1.25rem', background: 'var(--bg-tertiary)', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'var(--gradient-aurora)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{c.user?.name?.[0]}</div>
                    <div style={{ flex: 1 }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{c.user?.name}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(c.created_at).toLocaleDateString()}</span>
                       </div>
                       <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>{c.body}</p>
                    </div>
                    {user.id === c.user_id && (
                      <button onClick={() => handleDeleteComment(c.id)} style={{ background: 'transparent', border: 'none', color: 'rgba(239, 68, 68, 0.4)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                    )}
                 </div>
               ))}
             </div>
          </div>
        </div>

        <div className="player-sidebar">
          <div className="playlist-card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '28px', padding: '1.5rem', position: 'sticky', top: '100px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
            <h3 className="brand-font" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}><List size={22} /> Contenu du cours</h3>
            {enrolled && enrollment && (
               <div style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 800 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Progression</span>
                    <span style={{ color: '#a78bfa' }}>{enrollment.progress}%</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                    <div style={{ width: `${enrollment.progress}%`, height: '100%', background: 'linear-gradient(to right, #7000ff, #00d1ff)', borderRadius: '10px' }}></div>
                  </div>
                  {enrollment.progress === 100 && (
                    <button className="btn-pro btn-pro-primary" style={{ width: '100%', marginTop: '1rem', height: '44px', justifyContent: 'center' }} onClick={() => navigate(`/quiz/${id}`)}>
                      <Award size={18} /> Obtenir le certificat
                    </button>
                  )}
               </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {course.modules?.sort((a,b) => a.order - b.order).map(m => {
                const unlocked = isUnlocked(m);
                const active = activeModule?.id === m.id;
                return (
                  <div 
                    key={m.id} onClick={() => unlocked && setActiveModule(m)}
                    style={{ padding: '0.85rem 1rem', borderRadius: '16px', background: active ? 'rgba(112,0,255,0.1)' : 'transparent', border: active ? '1px solid rgba(112,0,255,0.2)' : '1px solid transparent', cursor: unlocked ? 'pointer' : 'not-allowed', opacity: unlocked ? 1 : 0.5, display: 'flex', gap: '1rem', alignItems: 'center', transition: '0.2s' }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: '10px', background: active ? 'var(--gradient-magic)' : 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: active ? '#fff' : 'var(--text-muted)' }}>
                      {!unlocked ? <Lock size={14} /> : active ? <Play size={14} fill="#fff" /> : <Play size={14} />}
                    </div>
                    <div style={{ flex: 1 }}>
                       <h4 style={{ fontSize: '0.85rem', fontWeight: active ? 800 : 600, color: active ? '#a78bfa' : 'var(--text-main)' }}>{m.title}</h4>
                       <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{m.duration}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CoursePlayer;
