import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Clock, MonitorPlay, BookOpen, Bookmark, Send, CheckCircle, Film, MessageSquare, List, Lock, Heart, Sparkles, Rocket, FileText, Award, Trash2, ChevronRight, Sparkles as SparklesIcon } from 'lucide-react';
import api from '../services/api';

// YouTube embed helper — handles all YouTube URL formats
const getYouTubeId = (url) => {
  if (!url) return null;
  try {
    const short = url.match(/youtu\.be\/([A-Za-z0-9_-]{11})/);
    if (short) return short[1];
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtube.com')) {
      const pathMatch = parsed.pathname.match(/\/(embed|shorts|live|v)\/([A-Za-z0-9_-]{11})/);
      if (pathMatch) return pathMatch[2];
      const v = parsed.searchParams.get('v');
      if (v && v.length >= 11) return v.substring(0, 11);
    }
    const fallback = url.match(/[?&/](?:v=|vi=|v\/|vi\/)?([A-Za-z0-9_-]{11})(?:[?&]|$)/);
    if (fallback) return fallback[1];
  } catch (_) {
    const m = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([A-Za-z0-9_-]{11})/);
    if (m) return m[1];
  }
  return null;
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
  const [enrolling, setEnrolling] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState(null);
  const completingRef = useRef(false);

  const getUser = () => {
    try {
      const u = localStorage.getItem('user');
      return u && u !== 'undefined' ? JSON.parse(u) : {};
    } catch { return {}; }
  };
  const user = getUser();

  // ── Sorted modules (memoized) ──
  const sortedModules = useMemo(() => {
    if (!course?.modules) return [];
    return [...course.modules].sort((a, b) => a.order - b.order);
  }, [course?.modules]);

  // ── Compute progress from completed_modules ──
  const computedProgress = useMemo(() => {
    if (!sortedModules.length || !enrollment?.completed_modules) return enrollment?.progress || 0;
    const completed = enrollment.completed_modules.length;
    return Math.round((completed / sortedModules.length) * 100);
  }, [sortedModules, enrollment]);

  // ── Check if all modules are completed → certificate access ──
  const allCompleted = computedProgress === 100;

  // ── Is module unlocked? First module always unlocked; rest require previous completed ──
  const isUnlocked = useCallback((module) => {
    if (!module) return false;
    if (module.order === 1) return true;
    if (!enrolled || !sortedModules.length) return false;
    const prevModule = sortedModules.find(m => m.order === module.order - 1);
    if (!prevModule) return true;
    return enrollment?.completed_modules?.includes(prevModule.id) || false;
  }, [enrolled, sortedModules, enrollment]);

  // ── Auto-set active module to the first uncompleted & unlocked module ──
  useEffect(() => {
    if (!sortedModules.length) return;
    if (!enrolled || !enrollment) {
      // Not enrolled: show first module
      setActiveModule(sortedModules[0]);
      return;
    }
    // Find first module that is NOT completed but IS unlocked
    const completedIds = enrollment.completed_modules || [];
    const firstIncomplete = sortedModules.find(m => !completedIds.includes(m.id));
    if (firstIncomplete) {
      setActiveModule(firstIncomplete);
    } else {
      // All completed → show last module
      setActiveModule(sortedModules[sortedModules.length - 1]);
    }
  }, [sortedModules, enrolled, enrollment]);

  // ── Auto-advance: listen for YouTube video ended (state 0) ──
  const handleVideoEnded = useCallback(async () => {
    if (!enrolled || !sortedModules.length || completingRef.current) return;
    completingRef.current = true;

    try {
      // Mark current module as complete on the server
      const res = await api.post(`/courses/${id}/complete-module`, { module_id: activeModule.id });
      const updatedEnrollment = res.data;
      setEnrollment(updatedEnrollment);

      // Find next module
      const currentIdx = sortedModules.findIndex(m => m.id === activeModule.id);
      const nextModule = sortedModules[currentIdx + 1] || null;

      if (nextModule) {
        setToast({ message: `✅ Module terminé ! Passage à : ${nextModule.title}`, nextModule });
        setTimeout(() => {
          setActiveModule(nextModule);
          setPlaying(true);
          setToast(null);
          completingRef.current = false;
        }, 3000);
      } else {
        // All modules done!
        setToast({ message: '🎉 Félicitations ! Vous avez terminé tous les modules ! Accédez maintenant à votre certificat.', nextModule: null });
        setTimeout(() => { setToast(null); completingRef.current = false; }, 5000);
      }
    } catch (err) {
      console.error('Erreur complétion module:', err);
      completingRef.current = false;
    }
  }, [activeModule, sortedModules, enrolled, id]);

  // Listen for YouTube postMessage events (video ended = state 0)
  useEffect(() => {
    const onMessage = (event) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data?.event === 'onStateChange' && data?.info === 0) {
          handleVideoEnded();
        }
      } catch (_) {}
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [handleVideoEnded]);

  // Reset playing state when switching modules
  useEffect(() => {
    setPlaying(false);
    completingRef.current = false;
  }, [activeModule?.id]);

  // ── Fetch course data + enrollment ──
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [courseRes, commentsRes] = await Promise.all([
          api.get(`/courses/${id}`),
          api.get(`/courses/${id}/comments`)
        ]);
        setCourse(courseRes.data);
        setComments(commentsRes.data);

        if (localStorage.getItem('token')) {
          try {
            const [myCoursesRes, favCheckRes] = await Promise.all([
              api.get('/my-courses'),
              api.get(`/favorites/${id}/check`)
            ]);
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

  // ── Handle clicking on a module in the playlist ──
  const handleModuleClick = (module) => {
    if (!enrolled) return; // Must be enrolled
    if (!isUnlocked(module)) return; // Must be unlocked (previous completed)
    setActiveModule(module);
    setPlaying(false);
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
  const isModuleCompleted = (moduleId) => enrollment?.completed_modules?.includes(moduleId) || false;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-view" style={{ paddingBottom: '5rem' }}>
      <div className="player-layout">
        
        <div className="player-main">
          {/* Toast notification */}
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: -30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                style={{
                  position: 'fixed', top: '5rem', left: '50%', transform: 'translateX(-50%)',
                  zIndex: 9999, background: 'linear-gradient(135deg, #7000ff, #00d1ff)',
                  color: '#fff', padding: '1rem 2rem', borderRadius: '20px',
                  fontWeight: 800, fontSize: '0.95rem',
                  boxShadow: '0 10px 40px rgba(112,0,255,0.4)',
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  backdropFilter: 'blur(20px)', maxWidth: '600px', textAlign: 'center'
                }}
              >
                {toast.nextModule ? <ChevronRight size={20} /> : <CheckCircle size={20} />}
                {toast.message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Video Area */}
          <div className="video-container" style={{ position: 'relative', overflow: 'hidden', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', background: '#000' }}>
            {/* Not enrolled → show enroll prompt overlay */}
            {!enrolled && activeModule ? (
              <div style={{
                height: '100%', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, rgba(112,0,255,0.08) 0%, rgba(0,209,255,0.08) 100%)'
              }}>
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{
                    width: 90, height: 90, borderRadius: '28px',
                    background: 'rgba(112,0,255,0.12)', border: '1px solid rgba(112,0,255,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem'
                  }}
                >
                  <Lock size={40} color="#a78bfa" strokeWidth={1.5} />
                </motion.div>
                <h3 className="brand-font" style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                  Inscrivez-vous pour accéder
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Ce cours contient {sortedModules.length} vidéos à regarder dans l'ordre
                </p>
                <button className="btn-pro btn-pro-primary" style={{ padding: '0.8rem 2rem' }} onClick={handleEnroll} disabled={enrolling}>
                  <Rocket size={18} /> {enrolling ? 'Inscription...' : "S'inscrire gratuitement"}
                </button>
              </div>
            ) : ytId && playing ? (
              /* ── YouTube embed ── */
              <iframe
                key={activeModule.id}
                width="100%" height="100%"
                src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`}
                title={activeModule.title} frameBorder="0" allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
              />
            ) : ytId && !playing ? (
              /* ── YouTube thumbnail + play button ── */
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
                   <p style={{ fontSize: '0.8rem', opacity: 0.7, textTransform: 'uppercase', fontWeight: 800 }}>
                     Module {activeModule.order} {activeModule.duration ? `• ${activeModule.duration}` : ''}
                   </p>
                   <h2 className="brand-font" style={{ fontSize: '1.8rem' }}>{activeModule.title}</h2>
                </div>
              </div>
            ) : !ytId && activeModule?.video_url ? (
              /* ── Non-YouTube video ── */
              <video
                key={activeModule.id}
                controls autoPlay
                onEnded={handleVideoEnded}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: '#000' }}
              >
                <source src={activeModule.video_url.startsWith('http') ? activeModule.video_url : `http://localhost:8000/storage/${activeModule.video_url}`} />
                Votre navigateur ne supporte pas la lecture vidéo.
              </video>
            ) : (
              /* ── No video → coming soon ── */
              <div style={{
                height: '100%', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, rgba(112,0,255,0.05) 0%, rgba(0,209,255,0.05) 100%)'
              }}>
                <motion.div
                  animate={{ scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{
                    width: 90, height: 90, borderRadius: '28px',
                    background: 'rgba(112,0,255,0.12)', border: '1px solid rgba(112,0,255,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem'
                  }}
                >
                  <Film size={40} color="#a78bfa" strokeWidth={1.5} />
                </motion.div>
                <h3 className="brand-font" style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                  {activeModule?.title || 'Vidéo'}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>📹 Vidéo bientôt disponible</p>
              </div>
            )}
          </div>

          {/* Course Info */}
          <div style={{ marginTop: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h1 className="brand-font" style={{ fontSize: '2.2rem' }}>{course.title}</h1>
              {!enrolled ? (
                <button className="btn-pro btn-pro-primary" style={{ padding: '0.8rem 2rem' }} onClick={handleEnroll} disabled={enrolling}>
                  <Rocket size={18} /> {enrolling ? 'Inscription...' : "S'inscrire gratuitement"}
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

          {/* Comments */}
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

        {/* ══════════ SIDEBAR — PLAYLIST ══════════ */}
        <div className="player-sidebar">
          <div className="playlist-card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '28px', padding: '1.5rem', position: 'sticky', top: '100px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
            <h3 className="brand-font" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}><List size={22} /> Playlist du cours</h3>

            {/* ── Progress bar (enrolled only) ── */}
            {enrolled && enrollment && (
               <div style={{ marginBottom: '2rem' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 800 }}>
                   <span style={{ color: 'var(--text-muted)' }}>Progression</span>
                   <span style={{ color: allCompleted ? '#4ade80' : '#a78bfa' }}>{computedProgress}%</span>
                 </div>
                 <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                   <motion.div
                     initial={{ width: 0 }}
                     animate={{ width: `${computedProgress}%` }}
                     transition={{ duration: 0.8, ease: 'easeOut' }}
                     style={{ height: '100%', background: allCompleted ? 'linear-gradient(to right, #4ade80, #22d3ee)' : 'linear-gradient(to right, #7000ff, #00d1ff)', borderRadius: '10px' }}
                   />
                 </div>

                 {/* ── Module counter ── */}
                 <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 600 }}>
                   {enrollment.completed_modules?.length || 0} / {sortedModules.length} modules complétés
                 </p>

                 {/* ── Certificate button: only when ALL modules completed ── */}
                 {allCompleted && (
                   <motion.button
                     initial={{ opacity: 0, scale: 0.9 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className="btn-pro btn-pro-primary"
                     style={{ width: '100%', marginTop: '1rem', height: '48px', justifyContent: 'center', background: 'linear-gradient(135deg, #4ade80, #22d3ee)', fontWeight: 900, fontSize: '0.9rem', gap: '0.5rem' }}
                     onClick={() => navigate(`/quiz/${id}`)}
                   >
                     <Award size={18} /> 🎓 Passer la certification
                   </motion.button>
                 )}

                 {/* ── Locked message when not all done ── */}
                 {!allCompleted && (
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', padding: '0.6rem 0.8rem', background: 'rgba(255,165,0,0.06)', borderRadius: '10px', border: '1px solid rgba(255,165,0,0.15)' }}>
                     <Lock size={14} color="#f59e0b" />
                     <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 700 }}>
                       Terminez tous les modules pour débloquer le certificat
                     </span>
                   </div>
                 )}
               </div>
            )}

            {/* ── Module list / playlist ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {sortedModules.map((m, idx) => {
                const unlocked = isUnlocked(m);
                const active = activeModule?.id === m.id;
                const completed = isModuleCompleted(m.id);
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => handleModuleClick(m)}
                    style={{
                      padding: '0.85rem 1rem', borderRadius: '16px',
                      background: active ? 'rgba(112,0,255,0.1)' : completed ? 'rgba(74,222,128,0.03)' : 'transparent',
                      border: active ? '1px solid rgba(112,0,255,0.25)' : '1px solid transparent',
                      cursor: unlocked ? 'pointer' : 'not-allowed',
                      opacity: unlocked ? 1 : 0.45,
                      display: 'flex', gap: '1rem', alignItems: 'center',
                      transition: 'all 0.25s ease',
                      position: 'relative'
                    }}
                    whileHover={unlocked ? { scale: 1.01, x: 4 } : {}}
                  >
                    {/* Module number / status icon */}
                    <div style={{
                      width: 38, height: 38, borderRadius: '12px', flexShrink: 0,
                      background: completed
                        ? 'rgba(74,222,128,0.15)'
                        : active ? 'var(--gradient-magic)' : 'rgba(255,255,255,0.04)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: completed ? '#4ade80' : active ? '#fff' : 'var(--text-muted)',
                      border: completed ? '1px solid rgba(74,222,128,0.3)' : active ? 'none' : '1px solid rgba(255,255,255,0.06)',
                      fontSize: '0.8rem', fontWeight: 900
                    }}>
                      {!unlocked ? <Lock size={14} /> : completed ? <CheckCircle size={16} /> : active ? <Play size={14} fill="#fff" /> : <span>{m.order}</span>}
                    </div>

                    {/* Module info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                       <h4 style={{
                         fontSize: '0.85rem', fontWeight: active ? 800 : 600,
                         color: completed ? '#4ade80' : active ? '#a78bfa' : 'var(--text-main)',
                         whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                       }}>
                         {m.title}
                       </h4>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                         {m.duration && (
                           <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                             <Clock size={10} /> {m.duration}
                           </span>
                         )}
                         {completed && <span style={{ fontSize: '0.65rem', color: '#4ade80', fontWeight: 800 }}>✓ Terminé</span>}
                         {!unlocked && <span style={{ fontSize: '0.65rem', color: '#f59e0b', fontWeight: 700 }}>🔒 Verrouillé</span>}
                         {!m.video_url && unlocked && !completed && <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>📹 Bientôt</span>}
                       </div>
                    </div>

                    {/* Active indicator dot */}
                    {active && (
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        style={{ width: 8, height: 8, borderRadius: '50%', background: '#a78bfa', flexShrink: 0 }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CoursePlayer;
