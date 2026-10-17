import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft,
  RefreshCcw, Download, Sparkles, Trophy, Printer, ShieldCheck, Clock
} from 'lucide-react';
import api from '../services/api';
import {
  getCourseQuestions,
  computePlaylistStats,
  getLocalCompletedModules,
  saveLocalCertificate,
  getLocalCertificate,
  generateCertificateUid,
  downloadCertificatePNG,
  openCertificatePrintWindow,
} from '../utils/certificationEngine';
import { pushNotification } from '../utils/notificationEngine';

const Quiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [certMeta, setCertMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  })();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseRes = await api.get(`/courses/${id}`);
        const courseData = courseRes.data;
        const totalModules = courseData.modules?.length || 0;

        let enrollment = null;
        try {
          const enrollsRes = await api.get('/my-enrollments');
          enrollment = enrollsRes.data.find(e => e.course_id === parseInt(id, 10));
        } catch {
          try {
            const myCoursesRes = await api.get('/my-courses');
            enrollment = myCoursesRes.data.find(e => e.course_id === parseInt(id, 10));
          } catch { /* ignore */ }
        }

        const serverCompleted = Array.isArray(enrollment?.completed_modules) ? enrollment.completed_modules : [];
        const localCompleted = getLocalCompletedModules(id);
        const mergedCompleted = Array.from(new Set([...serverCompleted, ...localCompleted].map(Number)));

        if (!enrollment && mergedCompleted.length === 0) {
          setError("Vous devez d'abord vous inscrire et valider toutes les vidéos de la playlist.");
          setLoading(false);
          return;
        }

        const validCompletedCount = (courseData.modules || []).filter(m => mergedCompleted.includes(Number(m.id))).length;
        const computedProgress = totalModules > 0
          ? Math.round((validCompletedCount / totalModules) * 100)
          : (enrollment?.progress || 0);
        const actualProgress = Math.max(enrollment?.progress || 0, computedProgress);

        if (actualProgress < 100) {
          setError(`Le Feu Vert n'est pas encore débloqué : vous devez terminer 100% de la playlist avant de passer le Quiz (${validCompletedCount}/${totalModules} vidéos validées — ${actualProgress}%).`);
          setLoading(false);
          return;
        }

        setCourse(courseData);
        const pool = getCourseQuestions(courseData);
        setQuestions(pool);

        // Preload existing certificate if already certified
        const existingLocal = getLocalCertificate(id);
        if (enrollment?.quiz_passed || existingLocal?.quiz_passed) {
          setCertMeta({
            certificateUid: enrollment?.certificate_uid || existingLocal?.certificate_uid || generateCertificateUid(id, user.id || 1),
            certifiedDate: new Date(enrollment?.certified_at || existingLocal?.certified_at || Date.now()).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
          });
        }
      } catch {
        setError("Erreur lors du chargement de l'examen de certification.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user.id]);

  const handleSelect = (qIdx, optIdx) => {
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const calculateScore = async () => {
    let correctCount = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correct) correctCount++;
    });
    const percentage = Math.round((correctCount / Math.max(1, questions.length)) * 100);
    setScore(percentage);
    setSubmitted(true);

    const passed = percentage >= 80;
    const defaultUid = generateCertificateUid(id, user.id || 1);
    const nowIso = new Date().toISOString();

    let finalUid = defaultUid;
    let finalDate = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

    try {
      const res = await api.post(`/courses/${id}/submit-quiz`, { score: percentage });
      if (res.data?.certificate_uid) {
        finalUid = res.data.certificate_uid;
      }
      if (res.data?.certified_at) {
        finalDate = new Date(res.data.certified_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
      }
    } catch { /* saved locally below */ }

    if (passed) {
      saveLocalCertificate(id, {
        course_id: Number(id),
        course_title: course?.title,
        quiz_score: percentage,
        quiz_passed: true,
        certificate_uid: finalUid,
        certified_at: nowIso,
      });
      setCertMeta({ certificateUid: finalUid, certifiedDate: finalDate });
      pushNotification({
        type: 'certificate',
        category: 'academique',
        badge: `Score ${percentage}%`,
        title: `🏆 Diplôme Officiel Obtenu : ${course?.title || 'Formation'}`,
        desc: `Félicitations ! Vous avez réussi l'examen final avec ${percentage}% (Certificat ID : ${finalUid}).`,
        actionUrl: '/certificats',
        actionLabel: 'Télécharger mon Certificat',
        dedupeKey: `cert_earned_${id}`,
      });
    }
  };

  if (loading) {
    return (
      <div className="page-view flex-center">
        <div className="loader-wrapper">
          <div className="loader-pro"></div>
          <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Chargement de l'examen officiel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-view flex-center">
        <div className="glass-card" style={{ maxWidth: 540, padding: '3rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
          <AlertCircle size={48} color="#f87171" style={{ margin: '0 auto 1.5rem' }} />
          <h2 className="brand-font" style={{ marginBottom: '1rem' }}>Feu Vert Requis</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>{error}</p>
          <button className="btn-pro btn-pro-primary" onClick={() => navigate(`/course/${id}`)}>
            Retourner à la playlist du cours
          </button>
        </div>
      </div>
    );
  }

  const playlistStats = computePlaylistStats(course?.modules || [], []);
  const currentQ = questions[currentIdx];
  const isLast = currentIdx === questions.length - 1;

  if (submitted) {
    const passed = score >= 80;
    const certPayload = {
      studentName: user.name || 'Étudiant MR1Academy',
      courseTitle: course?.title || 'Formation Certifiante',
      instructorName: course?.instructor?.name || 'Direction Pédagogique MR1Academy',
      score,
      certificateUid: certMeta?.certificateUid || generateCertificateUid(id, user.id || 1),
      certifiedDate: certMeta?.certifiedDate || new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
      totalDuration: playlistStats.totalFormatted,
      modulesCount: course?.modules?.length || 5,
    };

    return (
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="page-view">
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
            borderRadius: '28px', padding: '3rem', textAlign: 'center', position: 'relative', overflow: 'hidden'
          }}>
            {passed ? (
              <>
                <div style={{
                  width: 88, height: 88, borderRadius: '24px',
                  background: 'linear-gradient(135deg, #10b981, #00d1ff)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1.5rem', boxShadow: '0 0 40px rgba(16,185,129,0.4)'
                }}>
                  <Trophy size={44} color="white" />
                </div>

                <span style={{
                  background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)',
                  color: '#4ade80', padding: '0.3rem 1rem', borderRadius: '99px',
                  fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px'
                }}>
                  Certification Officielle Validée
                </span>

                <h1 className="brand-font" style={{ fontSize: '2.3rem', margin: '0.75rem 0 0.5rem' }}>
                  Félicitations, {certPayload.studentName} !
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '2rem' }}>
                  Score final : <strong style={{ color: '#4ade80' }}>{score}%</strong> • Certificat ID : <code style={{ color: '#00d1ff', fontWeight: 700 }}>{certPayload.certificateUid}</code>
                </p>

                {/* ── LIVE CERTIFICATE PREVIEW CARD ── */}
                <div style={{
                  background: 'linear-gradient(135deg, #070714 0%, #110b29 55%, #070c1a 100%)',
                  border: '2px solid #8b5cf6', borderRadius: '22px', padding: '2.5rem 2rem',
                  marginBottom: '2rem', position: 'relative', textAlign: 'center',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.6)'
                }}>
                  <div style={{ fontSize: '0.7rem', letterSpacing: '4px', color: '#00d1ff', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    MR1Academy • Diplôme Numérique Vérifié
                  </div>
                  <h2 className="brand-font" style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '0.35rem' }}>
                    CERTIFICAT DE RÉUSSITE
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                    Décerné à
                  </p>
                  <div className="brand-font" style={{
                    fontSize: '2.2rem', fontWeight: 800,
                    background: 'linear-gradient(135deg, #fff, #c4b5fd, #38bdf8)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    marginBottom: '0.75rem'
                  }}>
                    {certPayload.studentName}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                    pour la validation complète de la formation et de l'examen final
                  </p>
                  <div className="brand-font" style={{ fontSize: '1.35rem', color: '#fff', fontWeight: 700, marginBottom: '1rem' }}>
                    « {certPayload.courseTitle} »
                  </div>

                  <div style={{
                    display: 'inline-flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center',
                    background: 'rgba(139,92,246,0.14)', border: '1px solid rgba(139,92,246,0.35)',
                    padding: '0.45rem 1.25rem', borderRadius: '99px', fontSize: '0.8rem', color: '#4ade80', fontWeight: 700,
                    marginBottom: '1.5rem'
                  }}>
                    <span>✓ Score : {score}%</span>
                    <span>•</span>
                    <span>{certPayload.modulesCount} vidéos validées ({certPayload.totalDuration})</span>
                  </div>

                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem',
                    fontSize: '0.78rem', color: '#94a3b8', flexWrap: 'wrap', gap: '1rem'
                  }}>
                    <div>Instructeur : <strong style={{ color: '#fff' }}>{certPayload.instructorName}</strong></div>
                    <div style={{ fontFamily: 'monospace', color: '#00d1ff', fontWeight: 700 }}>ID : {certPayload.certificateUid}</div>
                    <div>Délivré le <strong style={{ color: '#fff' }}>{certPayload.certifiedDate}</strong></div>
                  </div>
                </div>

                {/* ── Download & Navigation Buttons ── */}
                <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    className="btn-pro btn-pro-primary"
                    style={{ background: 'linear-gradient(135deg, #10b981, #00d1ff)', padding: '0.9rem 1.6rem', fontWeight: 800 }}
                    onClick={() => downloadCertificatePNG(certPayload)}
                  >
                    <Download size={18} /> Télécharger en Image HD (.PNG)
                  </button>
                  <button
                    className="btn-pro btn-pro-outline"
                    style={{ padding: '0.9rem 1.5rem', fontWeight: 700 }}
                    onClick={() => openCertificatePrintWindow(certPayload)}
                  >
                    <Printer size={18} /> Imprimer / Exporter en PDF
                  </button>
                  <button
                    className="btn-pro btn-pro-outline"
                    style={{ padding: '0.9rem 1.5rem' }}
                    onClick={() => navigate('/certificats')}
                  >
                    <Award size={18} /> Mes Certificats
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <RefreshCcw size={42} color="#f87171" />
                </div>
                <h1 className="brand-font" style={{ fontSize: '2.1rem', marginBottom: '0.75rem' }}>Score insuffisant ({score}%)</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: 480, marginInline: 'auto', lineHeight: 1.6 }}>
                  Un score minimum de <strong style={{ color: '#fbbf24' }}>80%</strong> est requis pour délivrer le certificat officiel MR1Academy.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button
                    className="btn-pro btn-pro-primary"
                    onClick={() => {
                      setSubmitted(false);
                      setCurrentIdx(0);
                      setAnswers({});
                    }}
                  >
                    <RefreshCcw size={18} /> Réessayer l'examen
                  </button>
                  <button className="btn-pro btn-pro-outline" onClick={() => navigate(`/course/${id}`)}>
                    Revoir la playlist
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-view">
      <div className="quiz-container" style={{ maxWidth: 800, margin: '1.5rem auto' }}>

        {/* Quiz Header */}
        <div style={{ marginBottom: '2.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#4ade80', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={16} /> Feu Vert Validé • Examen de Certification
            </span>
            <h1 className="brand-font" style={{ fontSize: '1.75rem', marginTop: '0.35rem' }}>{course?.title}</h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '1rem', fontWeight: 700 }}>Question {currentIdx + 1} / {questions.length}</p>
            <div style={{ width: 140, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, marginTop: '8px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #00d1ff)', width: `${((currentIdx + 1) / questions.length) * 100}%`, transition: 'width 0.3s ease' }} />
            </div>
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="glass-card"
            style={{ padding: '2.5rem', background: 'var(--bg-secondary)', borderRadius: '24px', border: '1px solid var(--glass-border)' }}
          >
            <h2 className="brand-font" style={{ fontSize: '1.35rem', marginBottom: '2rem', lineHeight: 1.4 }}>{currentQ?.q}</h2>

            <div style={{ display: 'grid', gap: '0.85rem' }}>
              {currentQ?.options.map((opt, i) => {
                const isSelected = answers[currentIdx] === i;
                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(currentIdx, i)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '1rem', width: '100%',
                      padding: '1rem 1.25rem', borderRadius: '14px', cursor: 'pointer',
                      textAlign: 'left', fontSize: '0.95rem', fontWeight: isSelected ? 700 : 500,
                      background: isSelected ? 'rgba(139,92,246,0.18)' : 'var(--bg-tertiary)',
                      border: isSelected ? '1px solid rgba(139,92,246,0.5)' : '1px solid var(--glass-border)',
                      color: isSelected ? '#fff' : 'var(--text-main)', transition: 'all 0.2s'
                    }}
                  >
                    <span style={{
                      width: 32, height: 32, borderRadius: '8px', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.82rem',
                      background: isSelected ? '#8b5cf6' : 'rgba(255,255,255,0.06)',
                      color: isSelected ? '#fff' : 'var(--text-muted)', flexShrink: 0
                    }}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
          <button
            className="btn-pro btn-pro-outline"
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx(currentIdx - 1)}
          >
            <ArrowLeft size={18} /> Précédent
          </button>

          {isLast ? (
            <button
              className="btn-pro btn-pro-primary"
              disabled={answers[currentIdx] === undefined}
              onClick={calculateScore}
            >
              Valider et Obtenir mon Certificat <CheckCircle2 size={18} />
            </button>
          ) : (
            <button
              className="btn-pro btn-pro-primary"
              disabled={answers[currentIdx] === undefined}
              onClick={() => setCurrentIdx(currentIdx + 1)}
            >
              Question suivante <ArrowRight size={18} />
            </button>
          )}
        </div>

      </div>
    </motion.div>
  );
};

export default Quiz;
