import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Clock, MonitorPlay, BookOpen, Bookmark, Send, CheckCircle, Film, MessageSquare, List, Lock, Heart, Sparkles, Rocket, FileText, Award, Trash2 } from 'lucide-react';
import api from '../services/api';
import { addToFavorites, isInFavorites } from './Favoris';

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
  const [playing, setPlaying] = useState(false);   // click-to-play state
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [enrollment, setEnrollment] = useState(null);
  const [videoEnded, setVideoEnded] = useState(false);
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

  // Check if a module is unlocked (must complete the previous one)
  const isUnlocked = (module) => {
    if (!module) return false;
    if (module.order === 1) return true; // First module always previewable
    if (!enrolled || !course?.modules) return false;
    
    // Find previous module
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
        setActiveModule(courseRes.data.modules?.sort((a,b) => a.order - b.order)[0] || null);

        if (localStorage.getItem('token')) {
          try {
            const enrollmentsRes = await api.get('/my-enrollments');
            const currentEn = enrollmentsRes.data.find(e => e.course_id === parseInt(id));
            if (currentEn) {
              setEnrolled(true);
              setEnrollment(currentEn);
            }
          } catch (e) {
            console.log("Guest or error loading enrollment.");
          }
        }
        setSaved(isInFavorites(parseInt(id)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await api.post(`/courses/${id}/enroll`);
      setEnrolled(true);
    } catch (err) {
      console.error(err);
    } finally {
      setEnrolling(false);
    }
  };

  const handleSave = () => {
    if (course) {
      const added = addToFavorites(course);
      if (added) setSaved(true);
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

  // Timer simulation for YouTube (demo convenience: 10s wait)
  useEffect(() => {
    if (playing && !canComplete) {
      const timer = setTimeout(() => {
        setCanComplete(true);
      }, 10000); // Wait 10s of watching for demo
      return () => clearTimeout(timer);
    }
  }, [playing, activeModule?.id, enrollment]);

  if (loading) {
    return (
      <div className="flex-center">
        <div className="loader-wrapper">
          <div className="loader-pro"></div>
          <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Préparation du lecteur vidéo...</p>
        </div>
      </div>
    );
  }
  if (!course) return <div className="page-view" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}><Film size={20} /> Cours introuvable.</div>;
  const ytId = getYouTubeId(activeModule?.video_url);

  const handleModuleChange = (module) => {
    if (!isUnlocked(module)) return;
    setActiveModule(module);
    setPlaying(false);
    setVideoEnded(false);
    setCanComplete(enrollment?.completed_modules?.includes(module.id));
  };

  const markAsComplete = async (module) => {
    if (!enrolled || !module || !canComplete) return;
    try {
      const res = await api.post(`/courses/${id}/complete-module`, { module_id: module.id });
      setEnrollment(res.data);
      setVideoEnded(true);
      
      const sorted = [...course.modules].sort((a,b) => a.order - b.order);
      const curIdx = sorted.findIndex(m => m.id === module.id);
      if (curIdx < sorted.length - 1) {
        handleModuleChange(sorted[curIdx + 1]);
      }
    } catch (err) {
      console.error("Erreur progression", err);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-view">
      <div className="player-layout">

        {/* ══════════ Main Player ══════════ */}
        <div className="player-main">

          {/* ── Video Player (click-to-play, no redirect) ── */}
          <div className="video-container" style={{ position: 'relative', overflow: 'hidden', borderRadius: '16px' }}>
            {ytId && playing ? (
              /* YouTube embedded — plays directly on the page */
              <iframe
                key={activeModule.id}
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&fs=1&color=white`}
                title={activeModule.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '16px', border: 'none' }}
              />
            ) : ytId && !playing ? (
              /* Course Thumbnail + big play button — click to load player */
              <div
                onClick={() => setPlaying(true)}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer', borderRadius: '16px', overflow: 'hidden' }}
              >
                {/* Course-specific thumbnail */}
                <img
                  src={
                    course?.thumbnail?.startsWith('http')
                      ? course.thumbnail
                      : `http://localhost:8000/storage/${course.thumbnail}`
                  }
                  alt={course?.title}
                  onError={(e) => { e.target.src = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`; }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'brightness(0.55)' }}
                />
                {/* Gradient overlay */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(3,3,8,0.9) 0%, rgba(3,3,8,0.3) 50%, transparent 100%)' }} />
                {/* Animated glow ring behind play button */}
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%,-50%)',
                    width: 110, height: 110, borderRadius: '50%',
                    background: 'rgba(139,92,246,0.2)',
                    animation: 'breathe 2.5s ease-in-out infinite alternate',
                  }} />
                  <motion.div
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      width: 80, height: 80, borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 0 50px rgba(139,92,246,0.6), 0 0 100px rgba(236,72,153,0.3)',
                      position: 'relative', zIndex: 2,
                    }}
                  >
                    <Play size={34} color="white" fill="white" style={{ marginLeft: 4 }} />
                  </motion.div>
                </div>
                {/* Module info bottom */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '2rem' }}>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Module {activeModule?.order}</p>
                  <h3 className="brand-font" style={{ fontSize: '1.4rem', color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{activeModule?.title}</h3>
                  {activeModule?.duration && (
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={13} /> {activeModule.duration}
                    </p>
                  )}
                </div>
                {/* Course title badge top-left */}
                <div style={{
                  position: 'absolute', top: '1.25rem', left: '1.25rem',
                  background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '0.4rem 1rem', borderRadius: '99px',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                }}>
                  <Play size={12} color="var(--accent-pink)" fill="var(--accent-pink)" />
                  <span style={{ fontSize: '0.78rem', color: 'white', fontWeight: 600 }}>Cliquez pour regarder</span>
                </div>
              </div>
            ) : activeModule?.video_url && !activeModule.video_url.includes('youtu') ? (
              <video 
                controls autoPlay 
                width="100%" height="100%"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }}
                src={`http://localhost:8000/storage/${activeModule.video_url}`}
                onEnded={() => setCanComplete(true)}>
                Votre navigateur ne supporte pas la vidéo.
              </video>
            ) : (
              <div className="video-placeholder" style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 72, height: 72, borderRadius: '20px', background: 'rgba(255, 255, 255,0.1)', border: '1px solid rgba(255, 255, 255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <Film size={32} color="var(--accent-purple)" />
                </div>
                <h2 className="brand-font">{activeModule?.title || 'Sélectionnez un module'}</h2>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>Aucune vidéo disponible pour ce module.</p>
              </div>
            )}
          </div>

          {/* Module controls */}
          {enrolled && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem', marginTop: '1rem', alignItems: 'center', gap: '1.5rem' }}>
              {!canComplete && playing && (
                <p style={{ color: 'var(--accent-pink)', fontSize: '0.85rem', fontWeight: 600, animation: 'pulse 1.5s infinite' }}>
                  Regardez la vidéo pour débloquer...
                </p>
              )}
              <button 
                className={`btn-pro ${enrollment?.completed_modules?.includes(activeModule?.id) ? 'btn-pro-outline' : 'btn-pro-primary'}`}
                onClick={() => markAsComplete(activeModule)}
                disabled={!canComplete || enrollment?.completed_modules?.includes(activeModule?.id)}
                style={{ opacity: (!canComplete && !enrollment?.completed_modules?.includes(activeModule?.id)) ? 0.5 : 1 }}>
                {enrollment?.completed_modules?.includes(activeModule?.id) 
                  ? <><CheckCircle size={18} color="#4ade80" /> Module Terminé</> 
                  : <><Award size={18} /> Terminer ce module & Suivant</>
                }
              </button>
            </div>
          )}

          {/* Title & Actions */}
          <h1 className="course-title-large brand-font" style={{ marginBottom: '0.5rem' }}>{course.title}</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>{course.description}</p>

          <div className="author-bar">
            <div className="author-info">
              <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.3rem', color: 'white' }}>
                {course.instructor?.name?.[0] || '?'}
              </div>
              <div>
                <p style={{ fontWeight: 600 }}>{course.instructor?.name}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Sparkles size={13} color="var(--accent-purple)" /> Instructeur Expert</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {!enrolled ? (
                <button className="btn-pro btn-pro-primary" onClick={handleEnroll} disabled={enrolling}>
                  {enrolling ? <><Clock size={16} /> Inscription...</> : <><Rocket size={16} /> S'inscrire gratuitement</>}
                </button>
              ) : (
                <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', padding: '0.7rem 1.3rem', borderRadius: '12px', color: '#4ade80', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={18} /> Inscrit
                </div>
              )}
              <button
                className="pill-btn"
                onClick={handleSave}
                style={saved ? { borderColor: 'rgba(236,72,153,0.5)', color: '#ec4899' } : {}}
              >
                {saved ? <><Heart size={16} fill="currentColor" /> Sauvegardé</> : <><Bookmark size={16} /> Sauvegarder</>}
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="comments-section">
            <h3 className="brand-font" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><MessageSquare size={22} color="var(--accent-blue)" /> Commentaires ({comments.length})</h3>

            <form onSubmit={handleComment} className="comment-input-box">
              <input
                type="text"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Posez votre question ou partagez votre avis..."
              />
              <button type="submit" className="btn-pro btn-pro-primary" style={{ padding: '0 1.5rem', borderRadius: '12px' }}>
                <Send size={16} /> Publier
              </button>
            </form>

            {comments.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', background: 'var(--glass-bg)', borderRadius: '16px' }}>
                <MessageSquare size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4, display: 'block' }} />
                <p>Soyez le premier à commenter !</p>
              </div>
            )}

            {comments.map(comment => (
              <motion.div key={comment.id} className="comment" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                  {comment.user?.name?.[0] || '?'}
                </div>
                <div className="comment-content">
                  <div className="comment-header">
                    <span className="comment-name">{comment.user?.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className="comment-date">{new Date(comment.created_at).toLocaleDateString('fr-FR')}</span>
                      {(user?.id === comment.user_id || user?.id === course?.user_id) && (
                        <button 
                          onClick={() => handleDeleteComment(comment.id)}
                          style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: 'var(--text-muted-dark)', transition: 'color 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted-dark)'}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>{comment.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ══════════ Playlist Sidebar ══════════ */}
        <div className="player-sidebar">
          <div className="playlist-card">
            <div className="playlist-header">
              <h3 className="brand-font" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><List size={20} /> Contenu du cours</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {course.modules?.length || 0} modules • {enrolled ? <><CheckCircle size={13} color="#4ade80" /> Inscrit</> : <><Lock size={13} /> Inscription requise</>}
              </p>
              <div className="progress-container" style={{ marginTop: '0.75rem' }}>
                <div className="progress-bar" style={{ width: `${enrollment?.progress || 0}%` }}></div>
              </div>
              {enrollment?.progress === 100 ? (
                <button 
                  onClick={() => navigate(`/quiz/${id}`)}
                  className="btn-pro btn-pro-primary" 
                  style={{ width: '100%', marginTop: '1rem', padding: '0.6rem 0' }}>
                  <Award size={18} /> Passer le Quiz du Certificat
                </button>
              ) : (
                <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                   <Lock size={16} /> Finissez tous les cours pour débloquer le certificat.
                </div>
              )}
            </div>

            {course.modules?.sort((a,b) => a.order - b.order).map((module) => {
              const isActive = activeModule?.id === module.id;
              const hasVideo = !!module.video_url;
              const unlocked = isUnlocked(module);
              return (
                <div
                  key={module.id}
                  className={`playlist-item ${isActive ? 'active' : ''}`}
                  onClick={() => unlocked && handleModuleChange(module)}
                  style={{ opacity: unlocked ? 1 : 0.5, cursor: unlocked ? 'pointer' : 'not-allowed' }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: '10px', flexShrink: 0,
                    background: isActive ? 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))' : 'var(--bg-secondary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: isActive ? '0 4px 15px rgba(255, 255, 255,0.4)' : 'none',
                    transition: 'all 0.3s ease',
                  }}>
                    {!unlocked ? (
                      <Lock size={16} color="var(--text-muted-dark)" />
                    ) : isActive ? (
                      <MonitorPlay size={18} color="white" />
                    ) : hasVideo ? (
                      <Play size={16} color="var(--text-muted)" />
                    ) : (
                      <FileText size={16} color="var(--text-muted)" />
                    )}
                  </div>
                  <div className="play-item-info">
                    <h4 style={{ color: isActive ? 'var(--accent-purple)' : unlocked ? 'var(--text-main)' : 'var(--text-muted)', fontSize: '0.9rem' }}>
                      {module.order}. {module.title}
                    </h4>
                    {module.duration && (
                      <p style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={11} /> {module.duration}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default CoursePlayer;
