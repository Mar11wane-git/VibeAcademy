import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Award, Download, CheckCircle, Clock, Brain, Trophy,
  Target, Lock, Play, Printer, ShieldCheck, BarChart3
} from 'lucide-react';
import api, { getCachedData } from '../services/api';
import {
  computePlaylistStats,
  getLocalCompletedModules,
  getAllLocalCertificates,
  generateCertificateUid,
  downloadCertificatePNG,
  openCertificatePrintWindow,
} from '../utils/certificationEngine';

const Certificats = () => {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState(() => getCachedData('/my-enrollments') || getCachedData('/my-courses') || []);
  const [loading, setLoading] = useState(() => !(getCachedData('/my-enrollments') || getCachedData('/my-courses')));

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  })();

  useEffect(() => {
    api.get('/my-enrollments')
      .then(res => setEnrollments(res.data || []))
      .catch(() => {
        api.get('/my-courses')
          .then(res => setEnrollments(res.data || []))
          .catch(console.error);
      })
      .finally(() => setLoading(false));
  }, []);

  const localCerts = getAllLocalCertificates();

  // Enrich enrollments with accurate playlist stats, progress, and certification state
  const enrichedEnrollments = enrollments
    .filter(e => e.course)
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
      const playlistStats = computePlaylistStats(modules, mergedCompleted);

      const localCert = localCerts[String(course.id)];
      const isCertified = Boolean(e.quiz_passed || localCert?.quiz_passed);
      const quizScore = e.quiz_score || localCert?.quiz_score || (isCertified ? 100 : null);
      const certificateUid = e.certificate_uid || localCert?.certificate_uid || generateCertificateUid(course.id, user.id || 1);
      const certifiedDate = new Date(e.certified_at || localCert?.certified_at || Date.now()).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric'
      });

      return {
        ...e,
        progress,
        validCompletedCount,
        totalModules: modules.length,
        playlistStats,
        isCertified,
        quizScore,
        certificateUid,
        certifiedDate,
      };
    });

  const certifiedList = enrichedEnrollments.filter(e => e.isCertified);
  const certifiedHours = certifiedList.reduce((sum, e) => sum + e.playlistStats.totalHoursDecimal, 0).toFixed(1);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-view">
      {/* Header + Real Metrics */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title brand-font" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
            Certifications & Diplômes Officiels <Award size={28} color="var(--accent-main)" />
          </h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Terminez 100% de la playlist d'un cours pour obtenir le Feu Vert, validez le Quiz (≥ 80%) et téléchargez votre certificat vérifié.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', background: 'var(--bg-secondary)', padding: '1rem 1.75rem', borderRadius: '18px', border: '1px solid var(--glass-border)' }}>
          <div>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '1px' }}>
              Certificats Obtenus
            </span>
            <div className="brand-font" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#4ade80', marginTop: '0.15rem' }}>
              {certifiedList.length}
            </div>
          </div>
          <div style={{ width: 1, background: 'var(--glass-border)' }} />
          <div>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '1px' }}>
              Volume Certifié
            </span>
            <div className="brand-font" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#00d1ff', marginTop: '0.15rem' }}>
              {certifiedHours}h
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-center">
          <div className="loader-wrapper">
            <div className="loader-pro"></div>
            <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Vérification de vos progressions et diplômes...</p>
          </div>
        </div>
      ) : enrichedEnrollments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'var(--bg-secondary)', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
          <div style={{ width: 80, height: 80, borderRadius: '20px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Award size={36} color="var(--accent-purple)" />
          </div>
          <h2 className="brand-font" style={{ marginBottom: '0.75rem' }}>Aucun cours suivi pour le moment</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Inscrivez-vous à un cours du catalogue et suivez sa playlist vidéo pour débloquer votre certification.
          </p>
          <button className="btn-pro btn-pro-primary" onClick={() => navigate('/catalogue')}>
            Explorer le Catalogue
          </button>
        </div>
      ) : (
        <div className="course-grid">
          {enrichedEnrollments.map((item, i) => {
            const {
              course, progress, validCompletedCount, totalModules,
              playlistStats, isCertified, quizScore, certificateUid, certifiedDate
            } = item;
            const greenLight = progress === 100;

            const certPayload = {
              studentName: user.name || 'Étudiant MR1Academy',
              courseTitle: course.title,
              instructorName: course.instructor?.name || 'Direction Pédagogique MR1Academy',
              score: quizScore || 100,
              certificateUid,
              certifiedDate,
              totalDuration: playlistStats.totalFormatted,
              modulesCount: totalModules,
            };

            return (
              <motion.div
                key={item.id || course.id}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                style={{
                  background: 'var(--bg-secondary)',
                  border: isCertified
                    ? '1px solid rgba(74,222,128,0.4)'
                    : greenLight
                      ? '1px solid rgba(0,209,255,0.35)'
                      : '1px solid var(--glass-border)',
                  borderRadius: '24px', padding: '1.85rem', display: 'flex',
                  flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden'
                }}
              >
                <div>
                  {/* Status Top Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.15rem' }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: '16px',
                      background: isCertified
                        ? 'rgba(74,222,128,0.15)'
                        : greenLight
                          ? 'rgba(0,209,255,0.15)'
                          : 'rgba(139,92,246,0.12)',
                      border: `1px solid ${isCertified ? 'rgba(74,222,128,0.35)' : greenLight ? 'rgba(0,209,255,0.35)' : 'rgba(139,92,246,0.25)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {isCertified ? <Trophy size={24} color="#4ade80" /> : greenLight ? <ShieldCheck size={24} color="#00d1ff" /> : <Award size={24} color="#a78bfa" />}
                    </div>

                    <span style={{
                      padding: '0.3rem 0.8rem', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 800,
                      background: isCertified
                        ? 'rgba(74,222,128,0.14)'
                        : greenLight
                          ? 'rgba(0,209,255,0.14)'
                          : 'rgba(245,158,11,0.12)',
                      color: isCertified ? '#4ade80' : greenLight ? '#00d1ff' : '#f59e0b',
                      border: `1px solid ${isCertified ? 'rgba(74,222,128,0.3)' : greenLight ? 'rgba(0,209,255,0.3)' : 'rgba(245,158,11,0.25)'}`
                    }}>
                      {isCertified ? `🏆 Certifié (${quizScore}%)` : greenLight ? '🟢 Feu Vert Quiz' : '🔒 Playlist en cours'}
                    </span>
                  </div>

                  <h3 className="brand-font" style={{ fontSize: '1.2rem', marginBottom: '0.6rem', lineHeight: 1.3 }}>
                    {course.title}
                  </h3>

                  {/* Playlist Duration & Average Info */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                    <span style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', fontSize: '0.73rem', padding: '0.25rem 0.65rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={12} color="#00d1ff" /> Moy. ~{playlistStats.avgFormatted}/vidéo
                    </span>
                    <span style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', fontSize: '0.73rem', padding: '0.25rem 0.65rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <BarChart3 size={12} color="#a78bfa" /> Total : {playlistStats.totalFormatted}
                    </span>
                  </div>

                  {/* Progress Box */}
                  <div style={{ background: 'rgba(255,255,255,0.025)', borderRadius: '14px', padding: '0.85rem', marginBottom: '1.25rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem', fontSize: '0.78rem' }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                        Playlist : {validCompletedCount}/{totalModules} vidéos
                      </span>
                      <span style={{ color: greenLight ? '#4ade80' : 'var(--text-main)', fontWeight: 800 }}>
                        {progress}%
                      </span>
                    </div>
                    <div className="progress-container" style={{ marginBottom: '0.3rem' }}>
                      <div
                        className="progress-bar"
                        style={{
                          width: `${progress}%`,
                          background: greenLight ? 'linear-gradient(90deg, #10b981, #00d1ff)' : 'var(--accent-main)'
                        }}
                      />
                    </div>
                    {isCertified && (
                      <div style={{ fontSize: '0.72rem', color: '#00d1ff', fontFamily: 'monospace', fontWeight: 700, marginTop: '0.35rem' }}>
                        ID: {certificateUid} • Délivré le {certifiedDate}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {isCertified ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                    <button
                      className="btn-pro btn-pro-primary"
                      style={{ width: '100%', background: 'linear-gradient(135deg, #10b981, #00d1ff)', fontWeight: 800 }}
                      onClick={() => downloadCertificatePNG(certPayload)}
                    >
                      <Download size={16} /> Télécharger Certificat (.PNG HD)
                    </button>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <button
                        className="btn-pro btn-pro-outline"
                        style={{ padding: '0.6rem', fontSize: '0.78rem' }}
                        onClick={() => openCertificatePrintWindow(certPayload)}
                      >
                        <Printer size={14} /> Version PDF
                      </button>
                      <button
                        className="btn-pro btn-pro-outline"
                        style={{ padding: '0.6rem', fontSize: '0.78rem' }}
                        onClick={() => navigate(`/quiz/${course.id}`)}
                      >
                        <Brain size={14} /> Revoir Quiz
                      </button>
                    </div>
                  </div>
                ) : greenLight ? (
                  <div>
                    <button
                      className="btn-pro btn-pro-primary"
                      style={{ width: '100%', background: 'linear-gradient(135deg, #7c3aed, #00d1ff)', fontWeight: 800 }}
                      onClick={() => navigate(`/quiz/${course.id}`)}
                    >
                      <Brain size={18} /> 🟢 Passer le Quiz Certifiant
                    </button>
                    <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.6rem', textAlign: 'center' }}>
                      Feu vert activé • Minimum 80% requis
                    </p>
                  </div>
                ) : (
                  <div>
                    <button
                      className="btn-pro btn-pro-outline"
                      style={{ width: '100%' }}
                      onClick={() => navigate(`/course/${course.id}`)}
                    >
                      <Play size={16} /> Continuer la Playlist ({validCompletedCount}/{totalModules})
                    </button>
                    <p style={{ fontSize: '0.74rem', color: '#f59e0b', marginTop: '0.6rem', textAlign: 'center', fontWeight: 600 }}>
                      <Lock size={11} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                      Terminez toutes les vidéos pour débloquer le Quiz
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default Certificats;
