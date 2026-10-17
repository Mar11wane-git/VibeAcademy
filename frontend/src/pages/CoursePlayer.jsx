import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Clock, CheckCircle, Film, MessageSquare, List, Lock,
  Heart, Rocket, Award, Trash2, ChevronRight, FastForward,
  Sparkles, ShieldCheck, BarChart3, CheckCircle2, AlertCircle
} from 'lucide-react';
import api, { getCachedData } from '../services/api';
import {
  computePlaylistStats,
  parseDurationToSeconds,
  formatSecondsHuman,
  formatDurationClock,
  getRealYouTubeDurations,
  saveRealYouTubeDuration,
  getEffectiveModuleDuration,
  ensureMinimum10Modules,
  getLocalCompletedModules,
  saveLocalCompletedModules,
  getLocalCertificate,
  getCourseCover,
  toggleLocalFavoriteId,
} from '../utils/certificationEngine';
import { pushNotification } from '../utils/notificationEngine';

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
  } catch {
    const m = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([A-Za-z0-9_-]{11})/);
    if (m) return m[1];
  }
  return null;
};

const CoursePlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const numericId = parseInt(id, 10);

  const initialCourse = () => {
    const direct = getCachedData(`/courses/${id}`);
    if (direct) return ensureMinimum10Modules(direct);
    const all = getCachedData('/courses');
    if (Array.isArray(all)) {
      const found = all.find(c => Number(c.id) === numericId);
      return found ? ensureMinimum10Modules(found) : null;
    }
    return null;
  };

  const initialEnrollment = () => {
    const myCourses = getCachedData('/my-courses');
    if (Array.isArray(myCourses)) {
      return myCourses.find(e => Number(e.course_id) === numericId) || null;
    }
    return null;
  };

  const [course, setCourse] = useState(initialCourse);
  const [activeModule, setActiveModule] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [ytPlayerState, setYtPlayerState] = useState(-1); // 1 = playing, 2 = paused, 0 = ended
  const [videoEnded, setVideoEnded] = useState(false);
  const [realDurationsMap, setRealDurationsMap] = useState(() => getRealYouTubeDurations());
  const [comments, setComments] = useState(() => getCachedData(`/courses/${id}/comments`) || []);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(() => !initialCourse());
  const [enrolled, setEnrolled] = useState(() => Boolean(initialEnrollment()));
  const [enrollment, setEnrollment] = useState(initialEnrollment);
  const [enrolling, setEnrolling] = useState(false);
  const [saved, setSaved] = useState(() => Boolean(getCachedData(`/favorites/${id}/check`)?.favorited));
  const [toast, setToast] = useState(null);
  const [watchSeconds, setWatchSeconds] = useState(0);
  const [videoDurationSec, setVideoDurationSec] = useState(0);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState(null);

  const iframeRef = useRef(null);
  const completingRef = useRef(false);

  const getUser = () => {
    try {
      const u = localStorage.getItem('user');
      return u && u !== 'undefined' ? JSON.parse(u) : {};
    } catch { return {}; }
  };
  const user = getUser();

  // ── Sorted modules (guaranteed >= 10 modules) ──
  const sortedModules = useMemo(() => {
    if (!course?.modules) return [];
    const normalized = ensureMinimum10Modules(course);
    return [...(normalized.modules || [])].sort((a, b) => a.order - b.order);
  }, [course]);

  // ── Merged completed module IDs (Server + LocalStorage fallback) ──
  const completedModuleIds = useMemo(() => {
    const serverIds = Array.isArray(enrollment?.completed_modules) ? enrollment.completed_modules : [];
    const localIds = getLocalCompletedModules(id);
    return Array.from(new Set([...serverIds, ...localIds].map(Number)));
  }, [enrollment?.completed_modules, id]);

  // ── Compute Playlist Duration & Average per Video using Real YouTube Durations ──
  const playlistStats = useMemo(
    () => computePlaylistStats(sortedModules, completedModuleIds, realDurationsMap),
    [sortedModules, completedModuleIds, realDurationsMap]
  );

  // ── Compute progress from completed_modules ──
  const computedProgress = useMemo(() => {
    if (!sortedModules.length) return enrollment?.progress || 0;
    const validCompleted = sortedModules.filter(m => completedModuleIds.includes(Number(m.id))).length;
    return Math.min(100, Math.round((validCompleted / sortedModules.length) * 100));
  }, [sortedModules, completedModuleIds, enrollment?.progress]);

  // ── Check if all modules are completed → Green Light ("Feu Vert") for Quiz & Certificate ──
  const allCompleted = sortedModules.length > 0 && computedProgress === 100;
  const localCert = getLocalCertificate(id);
  const isCertified = Boolean(enrollment?.quiz_passed || localCert?.quiz_passed);

  // ── Is module unlocked? First module always unlocked; rest require previous completed ──
  const isUnlocked = useCallback((module) => {
    if (!module) return false;
    if (module.order === 1) return true;
    if (!enrolled || !sortedModules.length) return false;
    const prevModule = sortedModules.find(m => m.order === module.order - 1);
    if (!prevModule) return true;
    return completedModuleIds.includes(Number(prevModule.id));
  }, [enrolled, sortedModules, completedModuleIds]);

  // ── Auto-set active module to the first uncompleted & unlocked module on initial load ──
  useEffect(() => {
    if (!sortedModules.length) return;
    setActiveModule(prev => {
      if (prev && sortedModules.some(m => m.id === prev.id)) return prev;
      if (!enrolled) return sortedModules[0];
      const firstIncomplete = sortedModules.find(m => !completedModuleIds.includes(Number(m.id)));
      return firstIncomplete || sortedModules[sortedModules.length - 1];
    });
  }, [sortedModules, enrolled, completedModuleIds]);

  // ── Validate Current Module & Advance to Next Video in Playlist ──
  const handleCompleteAndAdvance = useCallback(async (goToNextImmediately = false) => {
    if (!enrolled || !activeModule || !sortedModules.length) return;

    const currentModId = Number(activeModule.id);
    const alreadyDone = completedModuleIds.includes(currentModId);

    // If already completed and user clicked "Passer à la vidéo suivante", jump immediately!
    if (alreadyDone && goToNextImmediately) {
      const currentIdx = sortedModules.findIndex(m => Number(m.id) === currentModId);
      const nextModule = sortedModules[currentIdx + 1] || null;
      if (nextModule) {
        setActiveModule(nextModule);
        setPlaying(true);
      }
      return;
    }

    if (completingRef.current) return;
    completingRef.current = true;

    const updatedLocalIds = Array.from(new Set([...completedModuleIds, currentModId]));
    saveLocalCompletedModules(id, updatedLocalIds);

    const validCompletedCount = sortedModules.filter(m => updatedLocalIds.includes(Number(m.id))).length;
    const newProgress = Math.min(100, Math.round((validCompletedCount / sortedModules.length) * 100));

    setEnrollment(prev => ({
      ...(prev || { course_id: Number(id) }),
      completed_modules: updatedLocalIds,
      progress: newProgress,
    }));

    // Push real notification for module validation
    pushNotification({
      type: 'course',
      category: 'academique',
      badge: `Vidéo ${activeModule.order}/${sortedModules.length}`,
      title: `Vidéo validée : ${activeModule.title}`,
      desc: `Progression sur "${course?.title || 'la formation'}" : ${newProgress}% (${validCompletedCount}/${sortedModules.length} vidéos terminées).`,
      actionUrl: `/courses/${id}`,
      actionLabel: 'Continuer la playlist',
      dedupeKey: `mod_completed_${id}_${currentModId}`,
    });

    // Persist on backend API
    try {
      const res = await api.post(`/courses/${id}/complete-module`, { module_id: currentModId });
      if (res.data) {
        setEnrollment(res.data);
      }
    } catch (err) {
      console.warn('Validation sauvegardée localement:', err?.message);
    }

    const currentIdx = sortedModules.findIndex(m => Number(m.id) === currentModId);
    const nextModule = sortedModules[currentIdx + 1] || null;

    if (nextModule) {
      if (goToNextImmediately) {
        setActiveModule(nextModule);
        setPlaying(true);
        completingRef.current = false;
        return;
      }

      setToast({
        message: `✅ Vidéo "${activeModule.title}" terminée à 100% ! Déblocage de la vidéo suivante : ${nextModule.title}`,
        nextModule,
        isGreenLight: false,
      });
      setAutoAdvanceCountdown(3);
      let count = 3;
      const countdownTimer = setInterval(() => {
        count -= 1;
        if (count <= 0) {
          clearInterval(countdownTimer);
          setAutoAdvanceCountdown(null);
          setActiveModule(nextModule);
          setPlaying(true);
          setToast(null);
          completingRef.current = false;
        } else {
          setAutoAdvanceCountdown(count);
        }
      }, 850);
    } else {
      // Entire playlist completed -> FEU VERT!
      pushNotification({
        type: 'greenlight',
        category: 'academique',
        badge: '🟢 Feu Vert Quiz',
        title: `100% Terminé : Feu Vert sur ${course?.title || 'votre formation'} !`,
        desc: `Bravo ! Vous avez regardé toutes les ${sortedModules.length} vidéos de la playlist. Le Quiz de Certification est maintenant débloqué.`,
        actionUrl: `/quiz/${id}`,
        actionLabel: 'Passer le Quiz Certifiant',
        dedupeKey: `greenlight_${id}`,
      });

      setToast({
        message: '🟢 FEU VERT DÉBLOQUÉ ! Vous avez terminé 100% de la playlist. Le Quiz de Certification est maintenant ouvert !',
        nextModule: null,
        isGreenLight: true,
      });
      setTimeout(() => {
        setToast(null);
        completingRef.current = false;
      }, 6000);
    }
  }, [activeModule, sortedModules, enrolled, id, completedModuleIds, course?.title]);

  // ── Real YouTube IFrame API Handshake & Live Duration/Progress Telemetry ──
  useEffect(() => {
    if (!playing || !activeModule) return;

    const sendListeningHandshake = () => {
      const win = iframeRef.current?.contentWindow;
      if (!win) return;
      try {
        win.postMessage(JSON.stringify({ event: 'listening', id: activeModule.id }), '*');
        win.postMessage(JSON.stringify({ event: 'command', func: 'addEventListener', args: ['onStateChange'] }), '*');
      } catch { /* ignore */ }
    };

    const handshakeInterval = setInterval(sendListeningHandshake, 1200);
    setTimeout(sendListeningHandshake, 400);

    const onMessage = (event) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

        // 1. State change from YouTube Player (1 = playing, 2 = paused, 0 = ended)
        if (data?.event === 'onStateChange' && typeof data?.info === 'number') {
          setYtPlayerState(data.info);
          if (data.info === 0) {
            setVideoEnded(true);
            handleCompleteAndAdvance(false);
          }
        }

        // 2. Real-time playback telemetry from YouTube IFrame (exact duration & currentTime)
        if (data?.event === 'infoDelivery' && data?.info) {
          if (typeof data.info.playerState === 'number') {
            setYtPlayerState(data.info.playerState);
          }

          if (typeof data.info.duration === 'number' && data.info.duration > 0) {
            const realSec = Math.floor(data.info.duration);
            setVideoDurationSec(realSec);

            // Sync the real YouTube video duration into state & localStorage so badge & average match 100%!
            const clockStr = saveRealYouTubeDuration(activeModule.video_url || activeModule.id, realSec);
            if (clockStr) {
              const ytKey = getYouTubeId(activeModule.video_url);
              setRealDurationsMap(prev => {
                if (prev[`mod_${activeModule.id}`] === clockStr && (!ytKey || prev[ytKey] === clockStr)) {
                  return prev;
                }
                return {
                  ...prev,
                  [`mod_${activeModule.id}`]: clockStr,
                  ...(ytKey ? { [ytKey]: clockStr } : {}),
                };
              });
            }
          }

          if (typeof data.info.currentTime === 'number') {
            const cur = Math.floor(data.info.currentTime);
            setWatchSeconds(cur);
            const dur = data.info.duration || videoDurationSec;
            if (dur > 0 && cur >= dur - 2) {
              setVideoEnded(true);
            }
          }

          if (data.info.playerState === 0) {
            setVideoEnded(true);
            handleCompleteAndAdvance(false);
          }
        }
      } catch { /* ignore non-JSON messages */ }
    };

    window.addEventListener('message', onMessage);
    return () => {
      clearInterval(handshakeInterval);
      window.removeEventListener('message', onMessage);
    };
  }, [playing, activeModule, handleCompleteAndAdvance, videoDurationSec]);

  // ── Reset telemetry when switching active module ──
  useEffect(() => {
    if (!activeModule) return;
    setWatchSeconds(0);
    setVideoEnded(false);
    setYtPlayerState(-1);
    const effectiveDurStr = getEffectiveModuleDuration(activeModule, realDurationsMap);
    setVideoDurationSec(parseDurationToSeconds(effectiveDurStr));
    completingRef.current = false;
  }, [activeModule?.id]);

  // ── Update videoDurationSec whenever realDurationsMap updates for the active module ──
  useEffect(() => {
    if (!activeModule) return;
    const effectiveDurStr = getEffectiveModuleDuration(activeModule, realDurationsMap);
    const parsed = parseDurationToSeconds(effectiveDurStr);
    if (parsed > 0) {
      setVideoDurationSec(parsed);
    }
  }, [activeModule, realDurationsMap]);

  // ── Fallback Watch-Time Counter ONLY when actually playing (ytPlayerState === 1) ──
  useEffect(() => {
    if (!playing || ytPlayerState !== 1) return;
    const timer = setInterval(() => {
      setWatchSeconds(prev => {
        const next = prev + 1;
        if (videoDurationSec > 0 && next >= videoDurationSec - 1) {
          setVideoEnded(true);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [playing, ytPlayerState, videoDurationSec]);

  // ── Fetch course data + enrollment ──
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [courseRes, commentsRes] = await Promise.all([
          api.get(`/courses/${id}`),
          api.get(`/courses/${id}/comments`)
        ]);
        setCourse(ensureMinimum10Modules(courseRes.data));
        setComments(commentsRes.data);

        if (localStorage.getItem('token')) {
          try {
            const [myCoursesRes, favCheckRes] = await Promise.all([
              api.get('/my-courses'),
              api.get(`/favorites/${id}/check`)
            ]);
            const currentEnrollment = myCoursesRes.data.find(e => e.course_id === parseInt(id, 10));
            if (currentEnrollment) {
              setEnrolled(true);
              setEnrollment(currentEnrollment);
            }
            setSaved(favCheckRes.data.favorited);
          } catch {
            console.log('Guest mode or profile error.');
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
      const currentEn = myCoursesRes.data.find(e => e.course_id === parseInt(id, 10));
      setEnrollment(currentEn || { course_id: parseInt(id, 10), progress: 0, completed_modules: [] });

      pushNotification({
        type: 'enrollment',
        category: 'academique',
        badge: 'Inscription',
        title: `Inscription confirmée : ${course?.title || 'Formation'}`,
        desc: `Vous avez débloqué la playlist complète de ${sortedModules.length} vidéos (${playlistStats.totalFormatted}). Bon apprentissage !`,
        actionUrl: `/courses/${id}`,
        actionLabel: 'Commencer la vidéo #1',
        dedupeKey: `enrolled_${id}`,
      });
    } catch (err) {
      console.error('Erreur inscription:', err);
    } finally {
      setEnrolling(false);
    }
  };

  const handleToggleFavorite = async () => {
    const nextLocal = toggleLocalFavoriteId(numericId);
    setSaved(nextLocal.favorited);

    if (nextLocal.favorited) {
      pushNotification({
        type: 'favorite',
        category: 'favoris',
        badge: 'Favoris ❤️',
        title: `Ajouté aux Favoris : ${course?.title || 'Formation'}`,
        desc: 'Retrouvez cette formation dans votre espace Favoris Pro pour définir sa priorité et planifier vos sessions d\'étude.',
        actionUrl: '/favoris',
        actionLabel: 'Voir mes Favoris',
      });
    }

    try {
      const res = await api.post(`/favorites/${id}`);
      if (typeof res.data?.favorited === 'boolean') {
        toggleLocalFavoriteId(numericId, res.data.favorited);
        setSaved(res.data.favorited);
      }
    } catch {
      // Local state already persisted
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const res = await api.post(`/courses/${id}/comments`, { body: commentText });
      setComments([res.data, ...comments]);
      setCommentText('');
      pushNotification({
        type: 'community',
        category: 'communaute',
        badge: 'Discussion',
        title: `Question publiée sur ${course?.title || 'le cours'}`,
        desc: `"${commentText.slice(0, 80)}${commentText.length > 80 ? '...' : ''}"`,
        actionUrl: `/courses/${id}`,
        actionLabel: 'Voir la discussion',
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Supprimer ce commentaire ?')) return;
    try {
      await api.delete(`/comments/${commentId}`);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (err) {
      console.error('Erreur suppression commentaire', err);
    }
  };

  // ── Handle clicking on a module in the playlist ──
  const handleModuleClick = (module) => {
    if (!enrolled) return;
    if (!isUnlocked(module)) {
      const prevOrder = Math.max(1, module.order - 1);
      setToast({
        message: `🔒 Vous devez obligatoirement regarder toute la vidéo #${prevOrder} jusqu'à la fin avant de débloquer la vidéo #${module.order}.`,
        nextModule: null,
        isGreenLight: false,
      });
      setTimeout(() => setToast(null), 4000);
      return;
    }
    setActiveModule(module);
    setPlaying(true);
  };

  if (loading) {
    return (
      <div className="flex-center">
        <div className="loader-wrapper">
          <div className="loader-pro"></div>
          <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Préparation de votre lecteur séquentiel...</p>
        </div>
      </div>
    );
  }

  if (!course) return <div className="page-view flex-center"><p className="brand-font">Cours introuvable.</p></div>;

  const ytId = getYouTubeId(activeModule?.video_url);
  const isModuleCompleted = (moduleId) => completedModuleIds.includes(Number(moduleId));
  const currentModCompleted = activeModule ? isModuleCompleted(activeModule.id) : false;
  const currentIdx = sortedModules.findIndex(m => m.id === activeModule?.id);
  const nextModuleInPlaylist = currentIdx >= 0 ? sortedModules[currentIdx + 1] : null;

  const activeEffectiveDuration = activeModule
    ? getEffectiveModuleDuration(activeModule, realDurationsMap)
    : playlistStats.avgFormatted;

  const watchPct = videoDurationSec > 0
    ? Math.min(100, Math.round((watchSeconds / videoDurationSec) * 100))
    : 0;

  // Mandatory full video watch requirement: Next button is ONLY enabled when current video is 100% watched or already completed
  const canAdvanceToNext = currentModCompleted || videoEnded || (videoDurationSec > 0 && watchPct >= 98);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-view" style={{ paddingBottom: '5rem' }}>
      <div className="player-layout">

        <div className="player-main">
          {/* Toast notification for Auto-Advance, Lock Warning & Green Light */}
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: -30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                style={{
                  position: 'fixed', top: '5rem', left: '50%', transform: 'translateX(-50%)',
                  zIndex: 9999,
                  background: toast.isGreenLight
                    ? 'linear-gradient(135deg, #059669, #10b981, #00d1ff)'
                    : 'linear-gradient(135deg, #7000ff, #00d1ff)',
                  color: '#fff', padding: '1rem 2rem', borderRadius: '20px',
                  fontWeight: 800, fontSize: '0.95rem',
                  boxShadow: '0 15px 45px rgba(0,0,0,0.5)',
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  backdropFilter: 'blur(20px)', maxWidth: '680px', textAlign: 'center'
                }}
              >
                {toast.nextModule ? <ChevronRight size={20} /> : <CheckCircle size={20} />}
                <span>{toast.message}</span>
                {autoAdvanceCountdown !== null && (
                  <span style={{
                    background: 'rgba(0,0,0,0.35)', padding: '0.2rem 0.65rem',
                    borderRadius: '99px', fontSize: '0.8rem'
                  }}>
                    {autoAdvanceCountdown}s
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Video Area */}
          <div className="video-container" style={{ position: 'relative', overflow: 'hidden', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', background: '#000' }}>
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
                  Inscrivez-vous pour débloquer la playlist ({sortedModules.length} vidéos)
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  {sortedModules.length} vidéos • Volume total {playlistStats.totalFormatted} (moyenne réelle {playlistStats.avgFormatted} / vidéo)
                </p>
                <button className="btn-pro btn-pro-primary" style={{ padding: '0.8rem 2rem' }} onClick={handleEnroll} disabled={enrolling}>
                  <Rocket size={18} /> {enrolling ? 'Inscription...' : "S'inscrire gratuitement"}
                </button>
              </div>
            ) : ytId && playing ? (
              <iframe
                ref={iframeRef}
                key={activeModule.id}
                id={`yt-player-${activeModule.id}`}
                width="100%" height="100%"
                src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`}
                title={activeModule.title} frameBorder="0" allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
              />
            ) : ytId && !playing ? (
              <div onClick={() => setPlaying(true)} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer' }}>
                <img
                  src={getCourseCover(course)}
                  alt={course?.title || ''}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.55)' }}
                />
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 10 }}>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} style={{ width: 84, height: 84, borderRadius: '50%', background: 'var(--gradient-magic)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(139,92,246,0.6)' }}>
                    <Play size={34} color="#fff" fill="#fff" />
                  </motion.div>
                </div>
                <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', right: '2rem', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <p style={{ fontSize: '0.8rem', opacity: 0.9, textTransform: 'uppercase', fontWeight: 800, color: '#00d1ff', marginBottom: '0.25rem' }}>
                      Vidéo {activeModule.order} sur {sortedModules.length} • Durée réelle : {activeEffectiveDuration}
                    </p>
                    <h2 className="brand-font" style={{ fontSize: '1.75rem' }}>{activeModule.title}</h2>
                  </div>
                  {currentModCompleted && (
                    <span style={{ background: 'rgba(74,222,128,0.2)', border: '1px solid rgba(74,222,128,0.5)', color: '#4ade80', padding: '0.4rem 0.9rem', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 800 }}>
                      ✓ Déjà validée
                    </span>
                  )}
                </div>
              </div>
            ) : !ytId && activeModule?.video_url ? (
              <video
                key={activeModule.id}
                controls autoPlay
                onTimeUpdate={(e) => {
                  const cur = Math.floor(e.currentTarget.currentTime);
                  const dur = Math.floor(e.currentTarget.duration || 0);
                  setWatchSeconds(cur);
                  if (dur > 0) {
                    setVideoDurationSec(dur);
                    if (cur >= dur - 2) setVideoEnded(true);
                  }
                }}
                onEnded={() => {
                  setVideoEnded(true);
                  handleCompleteAndAdvance(false);
                }}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: '#000' }}
              >
                <source src={activeModule.video_url.startsWith('http') ? activeModule.video_url : `http://127.0.0.1:8000/storage/${activeModule.video_url}`} />
                Votre navigateur ne supporte pas la lecture vidéo.
              </video>
            ) : (
              <div style={{
                height: '100%', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, rgba(112,0,255,0.05) 0%, rgba(0,209,255,0.05) 100%)'
              }}>
                <Film size={42} color="#a78bfa" strokeWidth={1.5} style={{ marginBottom: '1rem' }} />
                <h3 className="brand-font" style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                  {activeModule?.title || 'Vidéo'}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>📹 Vidéo bientôt disponible</p>
              </div>
            )}
          </div>

          {/* ── Active Video Control Bar: Real Duration Telemetry + Mandatory Watch Gate for Next Button ── */}
          {enrolled && activeModule && (
            <div style={{
              marginTop: '1.25rem', padding: '1.1rem 1.4rem', borderRadius: '18px',
              background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '260px' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '12px',
                  background: currentModCompleted ? 'rgba(74,222,128,0.15)' : 'rgba(139,92,246,0.15)',
                  border: `1px solid ${currentModCompleted ? 'rgba(74,222,128,0.35)' : 'rgba(139,92,246,0.35)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: currentModCompleted ? '#4ade80' : '#a78bfa', fontWeight: 800, flexShrink: 0
                }}>
                  {currentModCompleted ? <CheckCircle2 size={20} /> : `#${activeModule.order}`}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <span className="brand-font" style={{ fontWeight: 700, fontSize: '0.98rem' }}>
                      {activeModule.title}
                    </span>
                    <span style={{
                      fontSize: '0.73rem', padding: '3px 10px', borderRadius: '99px',
                      background: 'rgba(0,209,255,0.12)', border: '1px solid rgba(0,209,255,0.28)',
                      color: '#00d1ff', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px'
                    }}>
                      <Clock size={12} /> Durée réelle : {activeEffectiveDuration}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.45rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '140px', maxWidth: '240px', height: '6px', background: 'rgba(255,255,255,0.07)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${canAdvanceToNext ? 100 : watchPct}%`,
                        background: canAdvanceToNext ? '#4ade80' : 'linear-gradient(90deg, #8b5cf6, #00d1ff)',
                        transition: 'width 0.4s ease'
                      }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: canAdvanceToNext ? '#4ade80' : 'var(--text-muted)', fontWeight: canAdvanceToNext ? 700 : 500 }}>
                      {canAdvanceToNext
                        ? '✓ Visionnage complet validé — bouton Suivant activé'
                        : `${formatDurationClock(watchSeconds)} / ${activeEffectiveDuration} (${watchPct}%) • Visionnage obligatoire jusqu'à la fin`}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <button
                  onClick={() => {
                    if (!canAdvanceToNext) return;
                    handleCompleteAndAdvance(true);
                  }}
                  disabled={!canAdvanceToNext}
                  title={
                    canAdvanceToNext
                      ? 'Passer à la vidéo suivante'
                      : 'Vous devez regarder obligatoirement toute la vidéo jusqu\'à la fin pour activer le bouton Suivant'
                  }
                  className="btn-pro btn-pro-primary"
                  style={{
                    padding: '0.75rem 1.35rem', borderRadius: '12px', fontSize: '0.84rem', fontWeight: 800,
                    cursor: canAdvanceToNext ? 'pointer' : 'not-allowed',
                    opacity: canAdvanceToNext ? 1 : 0.65,
                    background: canAdvanceToNext
                      ? 'linear-gradient(135deg, #10b981, #00d1ff)'
                      : 'rgba(255,255,255,0.06)',
                    border: canAdvanceToNext
                      ? '1px solid rgba(74,222,128,0.45)'
                      : '1px solid rgba(245,158,11,0.35)',
                    color: canAdvanceToNext ? '#fff' : '#fcd34d',
                    boxShadow: canAdvanceToNext ? '0 8px 25px rgba(16,185,129,0.3)' : 'none',
                    display: 'flex', alignItems: 'center', gap: '0.5rem'
                  }}
                >
                  {!canAdvanceToNext ? (
                    <>
                      <Lock size={15} />
                      <span>Visionnage obligatoire ({watchPct}%)</span>
                    </>
                  ) : nextModuleInPlaylist ? (
                    <>
                      <FastForward size={16} />
                      <span>Passer à la vidéo suivante (#{nextModuleInPlaylist.order})</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      <span>{currentModCompleted ? 'Playlist 100% Validée ✓' : 'Valider la dernière vidéo'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── GREEN LIGHT ("FEU VERT") BANNER WHEN ALL PLAYLIST MODULES ARE COMPLETED ── */}
          <AnimatePresence>
            {enrolled && allCompleted && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginTop: '1.5rem', padding: '1.5rem 2rem', borderRadius: '22px',
                  background: 'linear-gradient(135deg, rgba(16,185,129,0.14) 0%, rgba(0,209,255,0.1) 100%)',
                  border: '1px solid rgba(74,222,128,0.45)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  flexWrap: 'wrap', gap: '1.25rem', boxShadow: '0 10px 35px rgba(16,185,129,0.15)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem' }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '16px',
                    background: 'linear-gradient(135deg, #10b981, #00d1ff)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                    boxShadow: '0 0 25px rgba(16,185,129,0.5)', flexShrink: 0
                  }}>
                    <ShieldCheck size={30} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <span style={{
                        background: '#10b981', color: '#052e16', fontWeight: 900,
                        fontSize: '0.7rem', padding: '2px 8px', borderRadius: '99px', textTransform: 'uppercase'
                      }}>
                        🟢 Feu Vert Accordé
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#4ade80', fontWeight: 700 }}>
                        {sortedModules.length}/{sortedModules.length} vidéos validées ({playlistStats.totalFormatted})
                      </span>
                    </div>
                    <h3 className="brand-font" style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>
                      {isCertified
                        ? 'Félicitations ! Vous êtes certifié sur cette formation'
                        : 'Playlist terminée ! Vous avez le feu vert pour passer le Quiz de Certification'}
                    </h3>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => navigate(`/quiz/${id}`)}
                    className="btn-pro btn-pro-primary"
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #00d1ff)',
                      padding: '0.85rem 1.6rem', fontWeight: 800, borderRadius: '14px'
                    }}
                  >
                    <Award size={18} /> {isCertified ? 'Revoir mon Certificat / Quiz' : 'Passer le Quiz & Obtenir le Certificat'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Course Info */}
          <div style={{ marginTop: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h1 className="brand-font" style={{ fontSize: '2.2rem' }}>{course.title}</h1>
              {!enrolled ? (
                <button className="btn-pro btn-pro-primary" style={{ padding: '0.8rem 2rem' }} onClick={handleEnroll} disabled={enrolling}>
                  <Rocket size={18} /> {enrolling ? 'Inscription...' : "S'inscrire gratuitement"}
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4ade80', fontWeight: 800, background: 'rgba(74,222,128,0.1)', padding: '0.6rem 1.2rem', borderRadius: '12px', border: '1px solid rgba(74,222,128,0.2)' }}>
                  <CheckCircle size={18} /> Inscrit • Progression {computedProgress}% ({sortedModules.filter(m => isModuleCompleted(m.id)).length}/{sortedModules.length} vidéos)
                </div>
              )}
            </div>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '1.05rem', marginBottom: '2rem' }}>{course.description}</p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '20px', border: '1px solid var(--glass-border)', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'var(--gradient-aurora)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>
                  {course.instructor?.name?.[0] || 'V'}
                </div>
                <div>
                  <p style={{ fontWeight: 800, color: 'var(--text-main)' }}>{course.instructor?.name || 'Instructeur MR1Academy'}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Expert Certifié • {course.students_count || 120} étudiants</p>
                </div>
              </div>
              <button onClick={handleToggleFavorite} className={`admin-action-btn ${saved ? 'active' : ''}`} style={{ background: saved ? 'rgba(255,0,85,0.1)' : 'transparent', color: saved ? '#ff0055' : 'var(--text-muted)', border: saved ? '1px solid rgba(255,0,85,0.2)' : '1px solid var(--glass-border)', padding: '0.6rem 1.25rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, cursor: 'pointer' }}>
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
                style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-main)', padding: '0 1rem', outline: 'none' }}
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

        {/* ══════════ SIDEBAR — SEQUENTIAL PLAYLIST (10+ VIDEOS) & REAL ANALYTICS ══════════ */}
        <div className="player-sidebar">
          <div className="playlist-card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '28px', padding: '1.5rem', position: 'sticky', top: '100px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 className="brand-font" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.15rem' }}>
                <List size={20} color="#a78bfa" /> Playlist Séquentielle
              </h3>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '0.28rem 0.7rem', borderRadius: '99px', background: 'rgba(139,92,246,0.15)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.3)' }}>
                {sortedModules.length} vidéos
              </span>
            </div>

            {/* ── Playlist Real Duration & Average Analytics Card ── */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem',
              marginBottom: '1.25rem', padding: '0.85rem', borderRadius: '16px',
              background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)'
            }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Moyenne Réelle / Vidéo
                </div>
                <div className="brand-font" style={{ fontSize: '0.96rem', fontWeight: 800, color: '#00d1ff', marginTop: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Clock size={14} /> {playlistStats.avgFormatted}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Volume Total ({sortedModules.length} vidéos)
                </div>
                <div className="brand-font" style={{ fontSize: '0.96rem', fontWeight: 800, color: '#a78bfa', marginTop: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <BarChart3 size={14} /> {playlistStats.totalFormatted}
                </div>
              </div>
            </div>

            {/* ── Progress bar & Green Light Status (enrolled only) ── */}
            {enrolled && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.45rem', fontWeight: 800 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Progression Playlist</span>
                  <span style={{ color: allCompleted ? '#4ade80' : '#a78bfa' }}>{computedProgress}%</span>
                </div>
                <div style={{ height: '7px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${computedProgress}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    style={{
                      height: '100%',
                      background: allCompleted ? 'linear-gradient(to right, #10b981, #00d1ff)' : 'linear-gradient(to right, #7000ff, #00d1ff)',
                      borderRadius: '10px'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '0.45rem', fontWeight: 600 }}>
                  <span>{sortedModules.filter(m => isModuleCompleted(m.id)).length} / {sortedModules.length} vidéos validées</span>
                  {!allCompleted && <span>Reste : {playlistStats.remainingFormatted}</span>}
                </div>

                {/* ── Green Light ("Feu Vert") Button when ALL modules completed ── */}
                {allCompleted ? (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="btn-pro btn-pro-primary"
                    style={{
                      width: '100%', marginTop: '1rem', height: '48px', justifyContent: 'center',
                      background: 'linear-gradient(135deg, #10b981, #00d1ff)',
                      fontWeight: 800, fontSize: '0.88rem', gap: '0.5rem',
                      boxShadow: '0 8px 25px rgba(16,185,129,0.35)'
                    }}
                    onClick={() => navigate(`/quiz/${id}`)}
                  >
                    <Award size={18} /> 🟢 Feu Vert : Passer le Quiz Certifiant
                  </motion.button>
                ) : (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.85rem',
                    padding: '0.65rem 0.85rem', background: 'rgba(245,158,11,0.07)',
                    borderRadius: '12px', border: '1px solid rgba(245,158,11,0.2)'
                  }}>
                    <Lock size={14} color="#f59e0b" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 700, lineHeight: 1.35 }}>
                      Visionnage intégral obligatoire de chaque vidéo pour débloquer la suivante et le Quiz
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* ── Module list / sequential playlist (10+ videos) ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '460px', overflowY: 'auto', paddingRight: '4px' }}>
              {sortedModules.map((m, idx) => {
                const unlocked = isUnlocked(m);
                const active = activeModule?.id === m.id;
                const completed = isModuleCompleted(m.id);
                const modDuration = getEffectiveModuleDuration(m, realDurationsMap);

                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => handleModuleClick(m)}
                    style={{
                      padding: '0.8rem 0.95rem', borderRadius: '16px',
                      background: active ? 'rgba(112,0,255,0.14)' : completed ? 'rgba(74,222,128,0.05)' : 'transparent',
                      border: active ? '1px solid rgba(112,0,255,0.4)' : completed ? '1px solid rgba(74,222,128,0.18)' : '1px solid transparent',
                      cursor: unlocked ? 'pointer' : 'not-allowed',
                      opacity: unlocked ? 1 : 0.45,
                      display: 'flex', gap: '0.8rem', alignItems: 'center',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                    whileHover={unlocked ? { scale: 1.01, x: 3 } : {}}
                  >
                    <div style={{
                      width: 34, height: 34, borderRadius: '10px', flexShrink: 0,
                      background: completed
                        ? 'rgba(74,222,128,0.16)'
                        : active ? 'var(--gradient-magic)' : 'rgba(255,255,255,0.04)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: completed ? '#4ade80' : active ? '#fff' : 'var(--text-muted)',
                      border: completed ? '1px solid rgba(74,222,128,0.35)' : active ? 'none' : '1px solid rgba(255,255,255,0.06)',
                      fontSize: '0.78rem', fontWeight: 900
                    }}>
                      {!unlocked ? <Lock size={13} /> : completed ? <CheckCircle size={15} /> : active ? <Play size={13} fill="#fff" /> : <span>{m.order}</span>}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{
                        fontSize: '0.82rem', fontWeight: active ? 800 : 600,
                        color: completed ? '#4ade80' : active ? '#c4b5fd' : 'var(--text-main)',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>
                        {m.title}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                        <span style={{ fontSize: '0.7rem', color: active ? '#00d1ff' : 'var(--text-muted)', fontWeight: active ? 700 : 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={10} /> {modDuration}
                        </span>
                        {completed && <span style={{ fontSize: '0.65rem', color: '#4ade80', fontWeight: 800 }}>✓ Validé</span>}
                        {!unlocked && <span style={{ fontSize: '0.65rem', color: '#f59e0b', fontWeight: 700 }}>🔒 Verrouillé</span>}
                      </div>
                    </div>

                    {active && (
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        style={{ width: 8, height: 8, borderRadius: '50%', background: '#00d1ff', flexShrink: 0 }}
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
