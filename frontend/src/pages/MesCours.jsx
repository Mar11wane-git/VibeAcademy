import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, Play, Star, ArrowRight, GraduationCap, Clock,
  Activity, Award, ShieldCheck
} from 'lucide-react';
import api, { getCachedData } from '../services/api';
import {
  getCourseCover,
  getCourseTechMeta,
  computePlaylistStats,
  getLocalCompletedModules,
  getAllLocalCertificates,
} from '../utils/certificationEngine';

const statusConfig = (progress, isCertified) => {
  if (isCertified) return { color: '#4ade80', label: 'Certifié 🏆', icon: '✓' };
  if (progress === 100) return { color: '#00d1ff', label: 'Feu Vert Quiz 🟢', icon: '★' };
  if (progress > 0) return { color: '#a78bfa', label: 'En cours', icon: '▶' };
  return { color: '#94a3b8', label: 'Non commencé', icon: '○' };
};

const MesCours = () => {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState(() => {
    const e = getCachedData('/my-courses');
    return Array.isArray(e) ? e : [];
  });
  const [loading, setLoading] = useState(() => !Array.isArray(getCachedData('/my-courses')));
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchMyCourses = async () => {
      if (!Array.isArray(enrollments) || !enrollments.length) setLoading(true);
      try {
        const res = await api.get('/my-courses');
        setEnrollments(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Erreur chargement mes cours:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyCourses();
  }, []);

  const localCerts = getAllLocalCertificates();

  const enriched = useMemo(() => {
    const safeEnrollments = Array.isArray(enrollments) ? enrollments : [];
    return safeEnrollments
      .filter(e => e && e.course)
      .map(e => {
        const course = e.course;
        const modules = course.modules || [];
        const serverCompleted = Array.isArray(e.completed_modules) ? e.completed_modules : [];
        const localCompleted = getLocalCompletedModules(course.id);
        const mergedCompleted = Array.from(new Set([...serverCompleted, ...localCompleted].map(Number)));
        const validCompletedCount = modules.filter(m => mergedCompleted.includes(Number(m.id))).length;
        const calcProgress = modules.length > 0
          ? Math.min(100, Math.round((validCompletedCount / modules.length) * 100))
          : (e.progress || 0);
        const progress = Math.max(e.progress || 0, calcProgress);
        const stats = computePlaylistStats(modules, mergedCompleted);
        const isCertified = Boolean(e.quiz_passed || localCerts[String(course.id)]?.quiz_passed);

        return {
          ...e,
          course,
          cover: getCourseCover(course),
          meta: getCourseTechMeta(course),
          stats,
          progress,
          validCompletedCount,
          totalModules: modules.length,
          isCertified,
        };
      });
  }, [enrollments, localCerts]);

  const filtered = enriched.filter(e => {
    if (filter === 'in-progress') return e.progress > 0 && e.progress < 100;
    if (filter === 'completed') return e.progress === 100;
    return true;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-view" style={{ paddingBottom: '5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h1 className="page-title brand-font text-gradient-animated" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            Ma Bibliothèque & Playlists <BookOpen size={28} />
          </h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Suivez vos playlists vidéo séquentielles et accédez directement au Quiz de Certification dès 100%.
          </p>
        </div>

        {!loading && enriched.length > 0 && (
          <div style={{ display: 'flex', gap: '0.4rem', background: 'var(--bg-secondary)', padding: '0.4rem', borderRadius: '14px', border: '1px solid var(--glass-border)' }}>
            {[
              { id: 'all', label: `Tous (${enriched.length})` },
              { id: 'in-progress', label: 'En cours' },
              { id: 'completed', label: 'Terminés (Feu Vert)' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                style={{
                  padding: '0.6rem 1.15rem', borderRadius: '10px', border: 'none',
                  background: filter === f.id ? 'var(--gradient-magic)' : 'transparent',
                  color: filter === f.id ? '#fff' : 'var(--text-muted)',
                  cursor: 'pointer', fontWeight: 800, fontSize: '0.8rem', transition: 'all 0.25s'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex-center">
          <div className="loader-wrapper"><div className="loader-pro"></div></div>
        </div>
      ) : enriched.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '5rem 2rem', background: 'var(--bg-secondary)', borderRadius: '32px', border: '1px solid var(--glass-border)' }}
        >
          <div style={{ width: 90, height: 90, borderRadius: '26px', background: 'rgba(112,0,255,0.08)', border: '1px solid rgba(112,0,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <GraduationCap size={44} color="#a78bfa" />
          </div>
          <h2 className="brand-font" style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>Aucun cours inscrit</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '420px', marginInline: 'auto', lineHeight: 1.6 }}>
            Rejoignez une formation du catalogue pour débloquer sa playlist vidéo et sa certification officielle.
          </p>
          <button className="btn-pro btn-pro-primary" style={{ padding: '0.9rem 2rem' }} onClick={() => navigate('/catalogue')}>
            <Play size={18} fill="currentColor" /> Découvrir le catalogue
          </button>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
          {filtered.map((e, i) => {
            const { course, cover, meta, stats, progress, validCompletedCount, totalModules, isCertified } = e;
            const status = statusConfig(progress, isCertified);

            return (
              <motion.div
                key={e.id || course.id}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => navigate(`/course/${course.id}`)}
                style={{
                  background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
                  borderRadius: '24px', padding: '1.4rem', display: 'flex', gap: '1.75rem',
                  alignItems: 'center', cursor: 'pointer', flexWrap: 'wrap'
                }}
                className="hover-lift"
              >
                <div style={{ width: 230, height: 135, borderRadius: '16px', overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(255,255,255,0.08)' }}>
                  <img src={cover} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                <div style={{ flex: 1, minWidth: '260px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.7rem', background: 'rgba(139,92,246,0.12)', padding: '0.25rem 0.65rem', borderRadius: '6px', color: meta.accent, fontWeight: 800 }}>
                          {meta.badge}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', background: 'rgba(255,255,255,0.04)', padding: '0.25rem 0.65rem', borderRadius: '6px', color: 'var(--text-muted)', fontWeight: 700 }}>
                          <Clock size={12} color="#00d1ff" /> Total : {stats.totalFormatted} (Moy. ~{stats.avgFormatted}/vidéo)
                        </span>
                      </div>
                      <h3 className="brand-font" style={{ fontSize: '1.35rem', marginBottom: '0.3rem', color: 'var(--text-main)' }}>
                        {course.title}
                      </h3>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <Star size={14} color="#fbbf24" fill="#fbbf24" /> {course.rating || 4.8} • Par {course.instructor?.name || 'MR1Academy'}
                      </p>
                    </div>

                    <span style={{
                      background: `${status.color}15`, color: status.color,
                      padding: '0.45rem 1rem', borderRadius: '10px', fontSize: '0.76rem',
                      fontWeight: 800, border: `1px solid ${status.color}35`, whiteSpace: 'nowrap'
                    }}>
                      {status.icon} {status.label}
                    </span>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '14px', padding: '1rem', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {progress === 100 ? '🟢 Playlist 100% validée — Examen débloqué' : `Vidéos validées : ${validCompletedCount} / ${totalModules}`}
                      </span>
                      <span style={{ fontSize: '0.92rem', fontWeight: 900, color: status.color }}>{progress}%</span>
                    </div>
                    <div style={{ height: '7px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', overflow: 'hidden' }}>
                      <motion.div
                        style={{ height: '100%', background: status.color, borderRadius: '20px' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.7 }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', minWidth: '175px' }}>
                  <button className="btn-pro btn-pro-primary" style={{ height: '46px', justifyContent: 'center' }}>
                    {progress === 100 ? 'Revoir Playlist' : progress > 0 ? 'Continuer' : 'Démarrer'}
                    <ArrowRight size={16} />
                  </button>
                  {progress === 100 && (
                    <button
                      className="btn-pro btn-pro-primary"
                      style={{
                        height: '44px', justifyContent: 'center',
                        background: 'linear-gradient(135deg, #10b981, #00d1ff)',
                        fontWeight: 800, fontSize: '0.82rem'
                      }}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        navigate(isCertified ? '/certificats' : `/quiz/${course.id}`);
                      }}
                    >
                      <Award size={16} /> {isCertified ? 'Mon Certificat 🏆' : '🟢 Passer le Quiz'}
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
