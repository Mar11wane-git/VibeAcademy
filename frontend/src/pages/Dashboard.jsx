import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Star, Users, BookOpen, Sparkles, Activity, Clock, Trophy,
  Target, Play, Award, Calendar as CalendarIcon, ChevronRight,
  ShieldCheck, Zap, CheckCircle2
} from 'lucide-react';
import api, { getCachedData } from '../services/api';
import {
  getCourseCover,
  getCourseTechMeta,
  computePlaylistStats,
  parseDurationToSeconds,
  formatSecondsHuman,
  getLocalCompletedModules,
  getAllLocalCertificates,
} from '../utils/certificationEngine';

const Dashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState(() => {
    const c = getCachedData('/courses');
    return Array.isArray(c) ? c : [];
  });
  const [enrollments, setEnrollments] = useState(() => {
    const e = getCachedData('/my-courses');
    return Array.isArray(e) ? e : [];
  });
  const [agendaEvents, setAgendaEvents] = useState(() => {
    const a = getCachedData('/agenda/events');
    return Array.isArray(a) ? a.slice(0, 3) : [];
  });
  const [loading, setLoading] = useState(() => !Array.isArray(getCachedData('/courses')));
  const [errorStatus, setErrorStatus] = useState(null);

  const getUser = () => {
    try {
      const u = localStorage.getItem('user');
      return u && u !== 'undefined' ? JSON.parse(u) : {};
    } catch { return {}; }
  };
  const user = getUser();

  useEffect(() => {
    if (user?.is_admin) {
      navigate('/admin');
      return;
    }
    const fetchDashboard = async () => {
      if (!courses.length) setLoading(true);
      try {
        const [coursesRes, myCoursesRes, agendaRes] = await Promise.all([
          api.get('/courses').catch(() => ({ data: [] })),
          api.get('/my-courses').catch(() => ({ data: [] })),
          api.get('/agenda/events').catch(() => ({ data: [] })),
        ]);
        setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : []);
        setEnrollments(Array.isArray(myCoursesRes.data) ? myCoursesRes.data : []);
        if (Array.isArray(agendaRes.data) && agendaRes.data.length > 0) {
          setAgendaEvents(agendaRes.data.slice(0, 3));
        } else {
          try {
            const localAg = JSON.parse(localStorage.getItem('vibe_agenda_events_v2') || '[]');
            setAgendaEvents(Array.isArray(localAg) ? localAg.slice(0, 3) : []);
          } catch { /* ignore */ }
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setErrorStatus('Impossible de charger vos données personnelles.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const localCerts = getAllLocalCertificates();

  // Normalize and enrich enrollments with real course objects, playlist stats, and next module
  const enrichedEnrollments = useMemo(() => {
    const safeEnrollments = Array.isArray(enrollments) ? enrollments : [];
    const safeCourses = Array.isArray(courses) ? courses : [];
    return safeEnrollments
      .map(e => {
        const courseObj = e.course || safeCourses.find(c => Number(c.id) === Number(e.course_id || e.id));
        if (!courseObj) return null;

        const sortedModules = [...(courseObj.modules || [])].sort((a, b) => a.order - b.order);
        const serverCompleted = Array.isArray(e.completed_modules) ? e.completed_modules : [];
        const localCompleted = getLocalCompletedModules(courseObj.id);
        const mergedCompleted = Array.from(new Set([...serverCompleted, ...localCompleted].map(Number)));

        const validCompletedCount = sortedModules.filter(m => mergedCompleted.includes(Number(m.id))).length;
        const calcProgress = sortedModules.length > 0
          ? Math.min(100, Math.round((validCompletedCount / sortedModules.length) * 100))
          : (e.progress || 0);
        const progress = Math.max(e.progress || 0, calcProgress);

        const nextModule = sortedModules.find(m => !mergedCompleted.includes(Number(m.id))) || sortedModules[sortedModules.length - 1] || null;
        const stats = computePlaylistStats(sortedModules, mergedCompleted);

        // Studied seconds from completed modules
        const studiedSeconds = sortedModules
          .filter(m => mergedCompleted.includes(Number(m.id)))
          .reduce((acc, m) => acc + parseDurationToSeconds(m.duration), 0);

        const isCertified = Boolean(e.quiz_passed || localCerts[String(courseObj.id)]?.quiz_passed);
        const quizScore = e.quiz_score || localCerts[String(courseObj.id)]?.quiz_score || null;

        return {
          enrollmentId: e.id,
          courseId: courseObj.id,
          course: courseObj,
          cover: getCourseCover(courseObj),
          meta: getCourseTechMeta(courseObj),
          progress,
          validCompletedCount,
          totalModules: sortedModules.length,
          nextModule,
          stats,
          studiedSeconds,
          isCertified,
          quizScore,
          greenLight: progress === 100,
        };
      })
      .filter(Boolean);
  }, [enrollments, courses, localCerts]);

  // Real KPIs
  const enrolledCount = enrichedEnrollments.length;
  const greenLightCount = enrichedEnrollments.filter(e => e.greenLight).length;
  const certifiedCount = enrichedEnrollments.filter(e => e.isCertified).length;
  const averageProgress = enrolledCount > 0
    ? Math.round(enrichedEnrollments.reduce((acc, curr) => acc + curr.progress, 0) / enrolledCount)
    : 0;
  const totalStudiedSeconds = enrichedEnrollments.reduce((acc, curr) => acc + curr.studiedSeconds, 0);
  const totalStudyFormatted = totalStudiedSeconds > 0
    ? formatSecondsHuman(totalStudiedSeconds, true)
    : `${enrolledCount * 2}h 00m`;

  // Active course to resume (prefer in-progress, then greenLight not yet certified, then first enrolled)
  const activeItem = useMemo(() => {
    return (
      enrichedEnrollments.find(e => e.progress > 0 && e.progress < 100) ||
      enrichedEnrollments.find(e => e.greenLight && !e.isCertified) ||
      enrichedEnrollments[0] ||
      null
    );
  }, [enrichedEnrollments]);

  // Recommended courses (not yet enrolled)
  const suggestedCourses = useMemo(() => {
    const enrolledIds = new Set(enrichedEnrollments.map(e => Number(e.courseId)));
    return courses
      .filter(c => !enrolledIds.has(Number(c.id)))
      .slice(0, 6)
      .map(c => ({
        ...c,
        cover: getCourseCover(c),
        meta: getCourseTechMeta(c),
        stats: computePlaylistStats(c.modules || [], []),
      }));
  }, [courses, enrichedEnrollments]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-view" style={{ paddingBottom: '5rem' }}>

      {/* ═══ 1. EXECUTIVE HERO COMMAND CENTER ═══ */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(112,0,255,0.12) 0%, rgba(0,209,255,0.06) 100%)',
        border: '1px solid rgba(139,92,246,0.25)', borderRadius: '28px', padding: '2.5rem',
        marginBottom: '2.25rem', position: 'relative', overflow: 'hidden',
        display: 'grid', gridTemplateColumns: activeItem ? 'minmax(280px, 1fr) minmax(320px, 1.15fr)' : '1fr',
        gap: '2rem', alignItems: 'center', boxShadow: '0 15px 45px rgba(0,0,0,0.2)'
      }}>
        <div style={{ zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.35)', padding: '0.35rem 0.9rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700, color: '#c4b5fd', marginBottom: '1rem' }}>
            <Zap size={13} color="#fbbf24" /> Tableau de Bord Apprenant Pro
          </div>
          <h1 className="page-title brand-font text-gradient-animated" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', fontSize: '2.35rem' }}>
            Bonjour, {user.name?.split(' ')[0] || 'Étudiant'} <Sparkles size={28} color="#fbbf24" fill="#fbbf24" />
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.5rem', maxWidth: '520px' }}>
            Chaque vidéo validée débloque automatiquement la suivante dans votre playlist. Terminez 100% d'un cours pour obtenir le <strong>Feu Vert</strong> et décrocher votre certificat officiel.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn-pro btn-pro-primary" onClick={() => navigate('/catalogue')}>
              <BookOpen size={16} /> Explorer le Catalogue ({courses.length})
            </button>
            <button className="btn-pro btn-pro-outline" onClick={() => navigate('/certificats')}>
              <Award size={16} /> Mes Diplômes ({certifiedCount})
            </button>
          </div>
        </div>

        {/* Active Course Resume Widget */}
        {activeItem && (
          <div style={{
            background: 'var(--bg-secondary)', padding: '1.35rem', borderRadius: '22px',
            border: '1px solid var(--glass-border)', zIndex: 2,
            boxShadow: '0 15px 35px rgba(0,0,0,0.35)'
          }}>
            <div style={{ display: 'flex', gap: '1.15rem', alignItems: 'center', marginBottom: '1rem' }}>
              <img
                src={activeItem.cover}
                alt={activeItem.course.title}
                style={{ width: 115, height: 74, borderRadius: '12px', objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)' }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.7rem', color: activeItem.greenLight ? '#4ade80' : '#00d1ff', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.8px' }}>
                    {activeItem.greenLight ? '🟢 Feu Vert Débloqué' : '▶ Playlist en cours'}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Moy. ~{activeItem.stats.avgFormatted}/vidéo
                  </span>
                </div>
                <h3 className="brand-font" style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {activeItem.course.title}
                </h3>
                {activeItem.nextModule && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {activeItem.greenLight
                      ? `Toutes les ${activeItem.totalModules} vidéos sont validées !`
                      : `Suivant : #${activeItem.nextModule.order} ${activeItem.nextModule.title} (${activeItem.nextModule.duration})`}
                  </p>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1, height: '7px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{
                  width: `${activeItem.progress}%`, height: '100%',
                  background: activeItem.greenLight ? 'linear-gradient(to right, #10b981, #00d1ff)' : 'linear-gradient(to right, #7000ff, #00d1ff)',
                  borderRadius: '10px'
                }} />
              </div>
              <span style={{ fontSize: '0.82rem', color: activeItem.greenLight ? '#4ade80' : '#00d1ff', fontWeight: 800 }}>
                {activeItem.validCompletedCount}/{activeItem.totalModules} ({activeItem.progress}%)
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button
                className="btn-pro btn-pro-primary"
                onClick={() => navigate(`/course/${activeItem.courseId}`)}
                style={{ flex: 1, justifyContent: 'center', padding: '0.7rem 1rem', borderRadius: '12px', fontSize: '0.85rem' }}
              >
                <Play size={15} fill="#fff" /> {activeItem.greenLight ? 'Revoir la Playlist' : 'Reprendre la Vidéo'}
              </button>
              {activeItem.greenLight && (
                <button
                  className="btn-pro btn-pro-primary"
                  onClick={() => navigate(`/quiz/${activeItem.courseId}`)}
                  style={{
                    flex: 1, justifyContent: 'center', padding: '0.7rem 1rem', borderRadius: '12px',
                    fontSize: '0.85rem', background: 'linear-gradient(135deg, #10b981, #00d1ff)', fontWeight: 800
                  }}
                >
                  <Award size={15} /> {activeItem.isCertified ? 'Mon Certificat' : 'Passer le Quiz'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ═══ 2. REAL KPI STATS CARDS ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {[
          {
            label: 'Playlists Inscrites',
            value: enrolledCount,
            sub: `${greenLightCount} terminée(s) à 100%`,
            icon: <BookOpen size={22} />,
            color: '#a78bfa',
            onClick: () => navigate('/mes-cours')
          },
          {
            label: 'Progression Globale',
            value: `${averageProgress}%`,
            sub: 'Validation séquentielle',
            icon: <Target size={22} />,
            color: '#00d1ff',
            onClick: () => navigate('/mes-cours')
          },
          {
            label: 'Certificats & Feu Vert',
            value: certifiedCount,
            sub: greenLightCount > certifiedCount ? `🟢 ${greenLightCount - certifiedCount} Quiz prêt(s) à passer !` : 'Examens officiels validés',
            icon: <Trophy size={22} />,
            color: '#4ade80',
            onClick: () => navigate('/certificats')
          },
          {
            label: 'Volume Vidéo Validé',
            value: totalStudyFormatted,
            sub: 'Calculé sur vos playlists',
            icon: <Clock size={22} />,
            color: '#fbbf24',
            onClick: () => navigate('/calendrier')
          },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            onClick={kpi.onClick}
            style={{
              background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
              padding: '1.4rem', borderRadius: '22px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '1.1rem', transition: '0.25s'
            }}
            className="hover-lift"
          >
            <div style={{
              width: 50, height: 50, borderRadius: '15px',
              background: `${kpi.color}15`, border: `1px solid ${kpi.color}35`,
              color: kpi.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              {kpi.icon}
            </div>
            <div>
              <div className="brand-font" style={{ fontSize: '1.75rem', fontWeight: 900, lineHeight: 1.1 }}>
                {kpi.value}
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                {kpi.label}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                {kpi.sub}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ═══ 3. ACTIVE PLAYLISTS & UPCOMING AGENDA SESSIONS ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.55fr) minmax(300px, 1fr)', gap: '1.75rem', marginBottom: '3rem' }}>

        {/* Left: Active Playlists Progress & Green Light Tracker */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '24px', padding: '1.75rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 className="brand-font" style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={20} color="#a78bfa" /> Suivi de vos Playlists & Certifications
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Progression vidéo par vidéo et accès direct au Quiz dès 100%
              </p>
            </div>
            <button
              onClick={() => navigate('/mes-cours')}
              style={{ background: 'none', border: 'none', color: '#a78bfa', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Tout voir &rarr;
            </button>
          </div>

          {enrichedEnrollments.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <BookOpen size={36} color="#a78bfa" style={{ marginBottom: '0.75rem', opacity: 0.6 }} />
              <p style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>Vous n'avez pas encore commencé de playlist.</p>
              <button className="btn-pro btn-pro-primary" onClick={() => navigate('/catalogue')}>
                Choisir mon premier cours
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {enrichedEnrollments.slice(0, 4).map(item => (
                <div
                  key={item.courseId}
                  onClick={() => navigate(`/course/${item.courseId}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.9rem 1rem',
                    borderRadius: '16px', background: 'rgba(255,255,255,0.025)',
                    border: item.greenLight ? '1px solid rgba(74,222,128,0.3)' : '1px solid rgba(255,255,255,0.05)',
                    cursor: 'pointer', transition: '0.2s'
                  }}
                >
                  <img
                    src={item.cover}
                    alt={item.course.title}
                    style={{ width: 76, height: 50, borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <h4 className="brand-font" style={{ fontSize: '0.92rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.course.title}
                      </h4>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: item.greenLight ? '#4ade80' : '#00d1ff' }}>
                        {item.progress}%
                      </span>
                    </div>
                    <div style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden', marginBottom: '0.35rem' }}>
                      <div style={{
                        height: '100%', width: `${item.progress}%`,
                        background: item.greenLight ? 'linear-gradient(90deg, #10b981, #00d1ff)' : 'linear-gradient(90deg, #7000ff, #00d1ff)'
                      }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      <span>{item.validCompletedCount}/{item.totalModules} vidéos • Moy. ~{item.stats.avgFormatted}/vidéo</span>
                      <span>Total : {item.stats.totalFormatted}</span>
                    </div>
                  </div>

                  {item.greenLight ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/quiz/${item.courseId}`); }}
                      style={{
                        padding: '0.45rem 0.85rem', borderRadius: '10px', border: 'none',
                        background: 'linear-gradient(135deg, #10b981, #00d1ff)', color: '#fff',
                        fontSize: '0.74rem', fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap',
                        display: 'flex', alignItems: 'center', gap: '0.35rem'
                      }}
                    >
                      <Award size={14} /> {item.isCertified ? 'Certificat' : '🟢 Quiz'}
                    </button>
                  ) : (
                    <ChevronRight size={18} color="var(--text-muted)" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Upcoming Live Sessions from Agenda */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '24px', padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 className="brand-font" style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CalendarIcon size={20} color="#00d1ff" /> Agenda Live
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Prochaines masterclasses & revues de code
                </p>
              </div>
              <button
                onClick={() => navigate('/calendrier')}
                style={{ background: 'none', border: 'none', color: '#00d1ff', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Ouvrir &rarr;
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {agendaEvents.map((ev, idx) => (
                <div
                  key={ev.id || idx}
                  onClick={() => navigate('/calendrier')}
                  style={{
                    padding: '0.85rem 1rem', borderRadius: '14px',
                    background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)',
                    cursor: 'pointer', borderLeft: '3px solid #00d1ff'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--text-main)' }}>
                    {ev.title}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>📅 {ev.date} • {ev.start_time || ev.time}</span>
                    <span style={{ color: '#a78bfa', fontWeight: 600 }}>{ev.instructor}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigate('/calendrier')}
            className="btn-pro btn-pro-outline"
            style={{ width: '100%', marginTop: '1.25rem', justifyContent: 'center', borderRadius: '12px' }}
          >
            <CalendarIcon size={15} /> Gérer mon Agenda (.ics / Google Sync)
          </button>
        </div>
      </div>

      {/* ═══ 4. RECOMMENDED COURSES WITH NEW PRO COVERS ═══ */}
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <h2 className="brand-font" style={{ fontSize: '1.65rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Sparkles size={22} color="#fbbf24" fill="#fbbf24" /> Formations Recommandées pour Vous
        </h2>
        <button
          className="btn-pro btn-pro-outline"
          style={{ border: 'none', background: 'transparent', color: '#a78bfa', fontWeight: 700, fontSize: '0.9rem' }}
          onClick={() => navigate('/catalogue')}
        >
          Voir tout le catalogue &rarr;
        </button>
      </div>

      {errorStatus && (
        <div style={{ padding: '1.5rem', background: 'rgba(239, 68, 68, 0.08)', color: '#f87171', borderRadius: '18px', marginBottom: '2rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          {errorStatus}
        </div>
      )}

      {loading ? (
        <div className="flex-center" style={{ padding: '4rem 0' }}>
          <div className="loader-wrapper"><div className="loader-pro"></div></div>
        </div>
      ) : (
        <div className="course-grid">
          {suggestedCourses.map((c, i) => (
            <motion.div
              key={c.id}
              className="course-card"
              onClick={() => navigate(`/course/${c.id}`)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <div>
                <div className="card-img-wrap" style={{ position: 'relative', height: '185px' }}>
                  <img src={c.cover} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div className="card-overlay" style={{ left: '12px', right: 'auto', background: 'rgba(8,8,18,0.82)', border: '1px solid rgba(255,255,255,0.12)', color: '#fbbf24' }}>
                    <Star size={13} fill="#fbbf24" /> {Number(c.rating || 4.8).toFixed(1)}
                  </div>
                  <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'var(--gradient-magic)', padding: '0.28rem 0.75rem', borderRadius: '8px', color: '#fff', fontWeight: 800, fontSize: '0.78rem' }}>
                    🎓 Parcours Certifiant
                  </div>
                </div>

                <div className="course-info">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '0.4rem' }}>
                    <span style={{ color: c.meta.accent, fontWeight: 800 }}>{c.meta.badge}</span>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Moy. ~{c.stats.avgFormatted}/vidéo</span>
                  </div>
                  <h3 className="brand-font" style={{ fontSize: '1.15rem', marginBottom: '0.6rem', lineHeight: 1.3 }}>{c.title}</h3>
                </div>
              </div>

              <div className="course-meta" style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.78rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)', marginBottom: 0 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><BookOpen size={13} color={c.meta.accent} /> {c.modules?.length || 0} vidéos</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Clock size={13} color="#00d1ff" /> {c.stats.totalFormatted}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Users size={13} /> {c.students_count || 0}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Dashboard;
