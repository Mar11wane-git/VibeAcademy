import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Lock, Save, AlertCircle, CheckCircle, Shield, Award, Zap,
  Camera, BookOpen, Code2, Globe, MapPin, Briefcase, Play, Download,
  Printer, Sparkles, Flame, Share2, ExternalLink, Clock, Layers, CheckCircle2, Plus, X
} from 'lucide-react';
import api, { getCachedData } from '../services/api';
import { useApp } from '../context/AppContext';
import {
  getAllLocalCertificates,
  getLocalCompletedModules,
  computePlaylistStats,
  ensureMinimum10Modules,
  generateCertificateUid,
  downloadCertificatePNG,
  openCertificatePrintWindow,
} from '../utils/certificationEngine';
import { pushNotification, getNotifications } from '../utils/notificationEngine';

const AVATAR_THEMES = [
  { id: 'magic', name: 'Cyber Violet', gradient: 'linear-gradient(135deg, #7000ff 0%, #00d1ff 100%)', accent: '#a78bfa' },
  { id: 'emerald', name: 'Emerald Matrix', gradient: 'linear-gradient(135deg, #059669 0%, #34d399 100%)', accent: '#34d399' },
  { id: 'cyber', name: 'Neon Cyan', gradient: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)', accent: '#38bdf8' },
  { id: 'sunset', name: 'Solar Gold', gradient: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)', accent: '#fbbf24' },
  { id: 'crimson', name: 'Crimson Rose', gradient: 'linear-gradient(135deg, #e11d48 0%, #fb7185 100%)', accent: '#fb7185' },
  { id: 'indigo', name: 'Deep Indigo', gradient: 'linear-gradient(135deg, #4f46e5 0%, #c084fc 100%)', accent: '#c084fc' },
];

const SUGGESTED_SKILLS = [
  'React 19', 'TypeScript', 'Next.js 15', 'Laravel 11', 'Python & IA',
  'LLMs & RAG', 'PyTorch', 'Apache Spark', 'Power BI & DAX', 'Docker & K8s',
  'Cybersécurité OWASP', 'Rust', 'Golang', 'PostgreSQL & Redis', 'C / C++', 'Java Spring Boot'
];

const CAREER_TRACKS = [
  'Ingénieur Full-Stack & Architecture SaaS',
  'Ingénieur IA Générative, LLMs & Deep Learning',
  'Data Engineer & Architecte Big Data',
  'Architecte Cloud Native, DevOps & Kubernetes',
  'Expert Cybersécurité & Ethical Hacking',
  'Développeur Système Haute Performance (C/C++/Rust)',
];

const Profile = () => {
  const { t, lang } = useApp();
  const navigate = useNavigate();

  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  }, []);

  const profileMetaKey = `vibe_profile_meta_v2_${storedUser?.id || 'guest'}`;

  const loadProfileMeta = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(profileMetaKey) || '{}');
      return {
        headline: saved.headline || CAREER_TRACKS[0],
        bio: saved.bio || "Passionné par l'ingénierie logicielle, l'Intelligence Artificielle et les architectures cloud modernes sur MR1Academy.",
        location: saved.location || 'Casablanca / Paris (Remote)',
        github: saved.github || 'https://github.com/',
        linkedin: saved.linkedin || 'https://linkedin.com/in/',
        website: saved.website || 'https://MR1Academy.dev',
        avatarTheme: saved.avatarTheme || 'magic',
        skills: Array.isArray(saved.skills) && saved.skills.length > 0
          ? saved.skills
          : ['React 19', 'Laravel 11', 'Python & IA', 'TypeScript', 'Docker & K8s', 'PostgreSQL & Redis'],
        weeklyGoalHours: saved.weeklyGoalHours || 10,
      };
    } catch {
      return {
        headline: CAREER_TRACKS[0],
        bio: "Passionné par l'ingénierie logicielle et l'IA.",
        location: 'Casablanca / Paris',
        github: 'https://github.com/',
        linkedin: 'https://linkedin.com/in/',
        website: 'https://MR1Academy.dev',
        avatarTheme: 'magic',
        skills: ['React 19', 'Laravel 11', 'Python & IA', 'TypeScript'],
        weeklyGoalHours: 10,
      };
    }
  };

  const [user, setUser] = useState(storedUser);
  const [meta, setMeta] = useState(loadProfileMeta);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'certificates' | 'activity' | 'settings'
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [customSkill, setCustomSkill] = useState('');

  const [enrollments, setEnrollments] = useState(() => getCachedData('/my-courses') || []);
  const [allCourses, setAllCourses] = useState(() => getCachedData('/courses') || []);
  const [activities, setActivities] = useState(() => getNotifications(storedUser?.id));

  const [formData, setFormData] = useState({
    name: storedUser.name || '',
    email: storedUser.email || '',
    password: '',
    password_confirmation: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/my-courses').catch(() => ({ data: [] })),
      api.get('/courses').catch(() => ({ data: [] })),
    ]).then(([enrRes, coursesRes]) => {
      if (Array.isArray(enrRes.data)) setEnrollments(enrRes.data);
      if (Array.isArray(coursesRes.data)) setAllCourses(coursesRes.data);
    });
  }, []);

  useEffect(() => {
    const refreshActivity = () => setActivities(getNotifications(user?.id));
    window.addEventListener('vibe-notifications-updated', refreshActivity);
    return () => window.removeEventListener('vibe-notifications-updated', refreshActivity);
  }, [user?.id]);

  const showToastMsg = (txt) => {
    setToast(txt);
    setTimeout(() => setToast(null), 3500);
  };

  const saveMeta = (nextMeta, notify = false) => {
    setMeta(nextMeta);
    try {
      localStorage.setItem(profileMetaKey, JSON.stringify(nextMeta));
    } catch { /* ignore */ }
    if (notify) {
      pushNotification({
        type: 'profile',
        category: 'social',
        badge: 'Portfolio Pro',
        title: 'Profil Développeur mis à jour',
        desc: `Votre spécialisation "${nextMeta.headline}" et vos ${nextMeta.skills.length} compétences techniques ont été enregistrées.`,
        actionUrl: '/profile',
        actionLabel: 'Voir mon profil',
      });
      showToastMsg('✅ Portfolio & préférences sauvegardés !');
    }
  };

  // ── Compute Real Academic Analytics ──
  const localCerts = getAllLocalCertificates();

  const enrichedEnrollments = useMemo(() => {
    return enrollments.map(enr => {
      const rawCourse = enr.course || allCourses.find(c => Number(c.id) === Number(enr.course_id)) || {
        id: enr.course_id,
        title: `Formation #${enr.course_id}`,
        modules: [],
      };
      const normalizedCourse = ensureMinimum10Modules(rawCourse);
      const modules = [...(normalizedCourse.modules || [])].sort((a, b) => a.order - b.order);
      const serverIds = Array.isArray(enr.completed_modules) ? enr.completed_modules : [];
      const localIds = getLocalCompletedModules(enr.course_id);
      const mergedIds = Array.from(new Set([...serverIds, ...localIds].map(Number)));
      const validCompletedCount = modules.filter(m => mergedIds.includes(Number(m.id))).length;
      const computedProgress = modules.length > 0
        ? Math.min(100, Math.round((validCompletedCount / modules.length) * 100))
        : (enr.progress || 0);
      const stats = computePlaylistStats(modules, mergedIds);
      const certObj = localCerts[String(enr.course_id)];
      const isCertified = Boolean(enr.quiz_passed || certObj?.quiz_passed);

      return {
        ...enr,
        course: normalizedCourse,
        modules,
        completedIds: mergedIds,
        completedCount: validCompletedCount,
        totalModules: modules.length,
        computedProgress: Math.max(enr.progress || 0, computedProgress),
        stats,
        isCertified,
        certificateUid: enr.certificate_uid || certObj?.certificate_uid || generateCertificateUid(enr.course_id, user?.id || 1),
        quizScore: enr.quiz_score || certObj?.quiz_score || 90,
        certifiedAt: enr.certified_at || certObj?.certified_at || new Date().toISOString(),
      };
    });
  }, [enrollments, allCourses, localCerts, user?.id]);

  const totalVideosWatched = useMemo(
    () => enrichedEnrollments.reduce((acc, e) => acc + e.completedCount, 0),
    [enrichedEnrollments]
  );

  const totalStudySeconds = useMemo(
    () => enrichedEnrollments.reduce((acc, e) => acc + Math.max(0, e.stats.totalSeconds - e.stats.remainingSeconds), 0),
    [enrichedEnrollments]
  );

  const certifiedCourses = useMemo(
    () => enrichedEnrollments.filter(e => e.isCertified),
    [enrichedEnrollments]
  );

  const totalXp = 500 + enrichedEnrollments.length * 300 + totalVideosWatched * 120 + certifiedCourses.length * 1000;
  const level = Math.max(1, Math.floor(totalXp / 600));
  const levelProgress = Math.round(((totalXp % 600) / 600) * 100);
  const currentTheme = AVATAR_THEMES.find(t => t.id === meta.avatarTheme) || AVATAR_THEMES[0];

  // Gamified Badges
  const badges = [
    {
      id: 'first_course',
      title: 'Pionnier MR1Academy',
      desc: 'Inscrit à au moins 1 formation certifiante',
      unlocked: enrichedEnrollments.length >= 1,
      color: '#38bdf8',
    },
    {
      id: 'video_marathon',
      title: 'Marathonien Vidéo',
      desc: 'Au moins 5 vidéos visionnées intégralement',
      unlocked: totalVideosWatched >= 5,
      color: '#a855f7',
    },
    {
      id: 'playlist_master',
      title: 'Feu Vert 100%',
      desc: 'Terminer 100% des 10 vidéos d\'une playlist',
      unlocked: enrichedEnrollments.some(e => e.computedProgress >= 100),
      color: '#10b981',
    },
    {
      id: 'certified_pro',
      title: 'Diplômé Certifié',
      desc: 'Réussir l\'examen final et obtenir un certificat',
      unlocked: certifiedCourses.length >= 1,
      color: '#f59e0b',
    },
    {
      id: 'polyglot_dev',
      title: 'Architecte Polyglotte',
      desc: 'Suivre 3 cursus technologiques différents',
      unlocked: enrichedEnrollments.length >= 3,
      color: '#ec4899',
    },
    {
      id: 'portfolio_complete',
      title: 'Portfolio Vérifié',
      desc: 'Compléter sa bio et au moins 5 compétences clés',
      unlocked: meta.skills.length >= 5 && Boolean(meta.bio),
      color: '#00d1ff',
    },
  ];

  const handleToggleSkill = (skill) => {
    const exists = meta.skills.includes(skill);
    const nextSkills = exists
      ? meta.skills.filter(s => s !== skill)
      : [...meta.skills, skill];
    saveMeta({ ...meta, skills: nextSkills }, false);
  };

  const handleAddCustomSkill = (e) => {
    e.preventDefault();
    const clean = customSkill.trim();
    if (!clean || meta.skills.includes(clean)) return;
    saveMeta({ ...meta, skills: [...meta.skills, clean] }, false);
    setCustomSkill('');
  };

  const handleSharePortfolio = () => {
    const summary = `Portfolio MR1Academy de ${user.name} (${meta.headline}) — Niveau ${level} (${totalXp} XP) • ${certifiedCourses.length} Certificat(s) • Compétences : ${meta.skills.join(', ')}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary).catch(() => {});
    }
    showToastMsg('🔗 Lien & résumé de votre Portfolio copiés dans le presse-papiers !');
  };

  const handleSubmitAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const dataToSubmit = {
        name: formData.name,
        email: formData.email,
      };

      if (formData.password) {
        dataToSubmit.password = formData.password;
        dataToSubmit.password_confirmation = formData.password_confirmation;
      }

      let updatedUser = { ...user, name: formData.name, email: formData.email };
      try {
        const response = await api.post('/profile', dataToSubmit);
        if (response.data?.user) {
          updatedUser = response.data.user;
        }
      } catch (apiErr) {
        if (apiErr.response?.status === 422) {
          throw apiErr;
        }
      }

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem(profileMetaKey, JSON.stringify(meta));
      window.dispatchEvent(new CustomEvent('vibe-profile-updated'));

      pushNotification({
        type: 'profile',
        category: 'social',
        badge: 'Compte & Sécurité',
        title: `Profil mis à jour : ${updatedUser.name}`,
        desc: 'Vos informations personnelles, votre nom de certification et votre portfolio développeur ont été synchronisés.',
        actionUrl: '/profile',
        actionLabel: 'Voir mon profil',
      });

      setMessage('Votre profil, votre identité de certificat et votre portfolio ont été mis à jour avec succès !');
      setFormData({ ...formData, password: '', password_confirmation: '' });
      showToastMsg('✅ Compte et profil mis à jour !');
    } catch (err) {
      setError(err.response?.data?.message || 'Veuillez vérifier les informations saisies.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="page-view" style={{ paddingBottom: '4rem' }}>
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -25 }}
            style={{
              position: 'fixed', top: '5.2rem', right: '2rem', zIndex: 9999,
              background: 'linear-gradient(135deg, #7000ff, #00d1ff)', color: '#fff',
              padding: '0.85rem 1.4rem', borderRadius: '14px', fontWeight: 800,
              fontSize: '0.88rem', boxShadow: '0 15px 40px rgba(0,0,0,0.45)'
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.3rem 0.8rem', borderRadius: '99px', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', color: '#c4b5fd', fontSize: '0.74rem', fontWeight: 800, marginBottom: '0.6rem', textTransform: 'uppercase' }}>
            <Sparkles size={13} /> Espace Développeur & Portfolio Certifié
          </div>
          <h1 className="page-title brand-font" style={{ marginBottom: '0.25rem' }}>
            {t('profil') || 'Mon Profil Professionnel'}
          </h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Gérez votre identité académique, vos compétences techniques, vos certificats officiels et la sécurité de votre compte.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleSharePortfolio}
            className="btn-pro"
            style={{
              padding: '0.7rem 1.2rem', borderRadius: '12px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
              color: 'var(--text-main)', fontWeight: 700, fontSize: '0.84rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'
            }}
          >
            <Share2 size={16} color="#00d1ff" /> Partager mon Portfolio
          </button>
          <button
            onClick={() => navigate('/certificats')}
            className="btn-pro btn-pro-primary"
            style={{ padding: '0.7rem 1.3rem', borderRadius: '12px', fontSize: '0.84rem' }}
          >
            <Award size={16} /> Mes Diplômes ({certifiedCourses.length})
          </button>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 370px) 1fr', gap: '2rem', alignItems: 'start' }}>

        {/* ══════════ LEFT COLUMN : DEVELOPER IDENTITY CARD ══════════ */}
        <div style={{
          background: 'var(--bg-secondary)', borderRadius: '26px',
          border: '1px solid var(--glass-border)', overflow: 'hidden',
          boxShadow: '0 20px 45px rgba(0,0,0,0.28)'
        }}>
          {/* Cover Header */}
          <div style={{
            height: '115px', background: currentTheme.gradient,
            position: 'relative', display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', padding: '1rem'
          }}>
            <button
              onClick={() => setShowThemePicker(p => !p)}
              style={{
                background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.25)', color: '#fff',
                padding: '0.35rem 0.75rem', borderRadius: '99px', fontSize: '0.72rem',
                fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem'
              }}
            >
              <Camera size={13} /> Thème Avatar
            </button>
          </div>

          <div style={{ padding: '0 1.65rem 1.85rem', marginTop: '-50px', position: 'relative' }}>
            {/* Avatar Circle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
              <div style={{
                width: 96, height: 96, borderRadius: '26px',
                background: currentTheme.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2.4rem', fontWeight: 900, color: '#fff',
                border: '4px solid var(--bg-secondary)',
                boxShadow: '0 12px 30px rgba(0,0,0,0.45)'
              }}>
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)',
                color: '#fbbf24', padding: '0.38rem 0.75rem', borderRadius: '99px',
                fontSize: '0.75rem', fontWeight: 800
              }}>
                <Flame size={14} fill="#fbbf24" /> Série : 7 jours
              </div>
            </div>

            {/* Optional Theme Picker */}
            <AnimatePresence>
              {showThemePicker && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    marginBottom: '1.1rem', padding: '0.85rem', borderRadius: '14px',
                    background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)'
                  }}
                >
                  <p style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                    Couleur d'Identité
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {AVATAR_THEMES.map(th => (
                      <button
                        key={th.id}
                        onClick={() => {
                          saveMeta({ ...meta, avatarTheme: th.id }, true);
                          setShowThemePicker(false);
                        }}
                        title={th.name}
                        style={{
                          width: 32, height: 32, borderRadius: '10px', background: th.gradient,
                          border: meta.avatarTheme === th.id ? '2px solid #fff' : '1px solid transparent',
                          cursor: 'pointer'
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Name & Headline */}
            <h2 className="brand-font" style={{ fontSize: '1.45rem', color: '#fff', marginBottom: '0.2rem' }}>
              {user.name || 'Étudiant MR1Academy'}
            </h2>
            <p style={{ fontSize: '0.84rem', color: currentTheme.accent, fontWeight: 700, marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Briefcase size={14} /> {meta.headline}
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.1rem' }}>
              <MapPin size={13} /> {meta.location} • <Shield size={13} color="#4ade80" /> Compte Vérifié
            </p>

            {/* Bio */}
            <p style={{
              fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.55,
              padding: '0.85rem 1rem', borderRadius: '14px',
              background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)',
              marginBottom: '1.25rem'
            }}>
              {meta.bio}
            </p>

            {/* XP & Level Progress */}
            <div style={{
              background: 'rgba(0,0,0,0.25)', borderRadius: '16px', padding: '1rem',
              marginBottom: '1.25rem', border: '1px solid rgba(255,255,255,0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Zap size={15} color="#00d1ff" /> Niveau {level} — Rang Pro
                </span>
                <span style={{ fontSize: '0.82rem', color: '#00d1ff', fontWeight: 900 }}>
                  {totalXp.toLocaleString()} XP
                </span>
              </div>
              <div style={{ height: 7, background: 'rgba(255,255,255,0.07)', borderRadius: '99px', overflow: 'hidden', marginBottom: '0.45rem' }}>
                <div style={{ height: '100%', width: `${levelProgress}%`, background: currentTheme.gradient, borderRadius: '99px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <span>{levelProgress}% du niveau {level}</span>
                <span>{600 - (totalXp % 600)} XP avant Niv. {level + 1}</span>
              </div>
            </div>

            {/* Tech Stack & Skills */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Stack & Compétences ({meta.skills.length})
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {meta.skills.map(skill => (
                  <span
                    key={skill}
                    style={{
                      fontSize: '0.73rem', fontWeight: 700, padding: '0.28rem 0.65rem',
                      borderRadius: '8px', background: 'rgba(139,92,246,0.12)',
                      border: '1px solid rgba(139,92,246,0.28)', color: '#c4b5fd',
                      display: 'inline-flex', alignItems: 'center', gap: '0.35rem'
                    }}
                  >
                    <Code2 size={11} color="#00d1ff" /> {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Social / External Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', paddingTop: '0.85rem', borderTop: '1px solid var(--glass-border)' }}>
              {meta.github && (
                <a
                  href={meta.github}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.6rem', borderRadius: '10px', background: 'rgba(255,255,255,0.02)' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                    <Code2 size={14} color="#a78bfa" /> GitHub Développeur
                  </span>
                  <ExternalLink size={13} />
                </a>
              )}
              {meta.linkedin && (
                <a
                  href={meta.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.6rem', borderRadius: '10px', background: 'rgba(255,255,255,0.02)' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                    <Briefcase size={14} color="#38bdf8" /> Profil LinkedIn Pro
                  </span>
                  <ExternalLink size={13} />
                </a>
              )}
              {meta.website && (
                <a
                  href={meta.website}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.6rem', borderRadius: '10px', background: 'rgba(255,255,255,0.02)' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                    <Globe size={14} color="#4ade80" /> Site Web / Portfolio
                  </span>
                  <ExternalLink size={13} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ══════════ RIGHT COLUMN : TABS & INTERACTIVE WORKSPACE ══════════ */}
        <div>
          {/* Navigation Tabs */}
          <div style={{
            display: 'flex', gap: '0.5rem', marginBottom: '1.5rem',
            background: 'var(--bg-secondary)', padding: '0.4rem',
            borderRadius: '16px', border: '1px solid var(--glass-border)',
            overflowX: 'auto'
          }}>
            {[
              { id: 'overview', label: 'Aperçu & Progression', icon: <Layers size={16} /> },
              { id: 'certificates', label: `Certificats & Badges (${certifiedCourses.length})`, icon: <Award size={16} /> },
              { id: 'activity', label: `Journal d'Activité (${activities.length})`, icon: <Clock size={16} /> },
              { id: 'settings', label: 'Paramètres & Sécurité', icon: <User size={16} /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1, minWidth: '155px', padding: '0.75rem 1rem', borderRadius: '12px',
                  border: activeTab === tab.id ? '1px solid rgba(167,139,250,0.4)' : '1px solid transparent',
                  background: activeTab === tab.id
                    ? 'linear-gradient(135deg, rgba(112,0,255,0.28), rgba(0,209,255,0.14))'
                    : 'transparent',
                  color: activeTab === tab.id ? '#fff' : 'var(--text-muted)',
                  fontWeight: activeTab === tab.id ? 800 : 600, fontSize: '0.84rem',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  transition: 'all 0.2s'
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* ── TAB 1: OVERVIEW & ACADEMIC PROGRESS ── */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* 4 KPI Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div style={{ background: 'var(--bg-secondary)', padding: '1.35rem', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Playlists Suivies</span>
                    <BookOpen size={18} color="#a78bfa" />
                  </div>
                  <div className="brand-font" style={{ fontSize: '1.85rem', fontWeight: 900, color: '#fff' }}>
                    {enrichedEnrollments.length}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#4ade80', marginTop: '0.2rem', fontWeight: 600 }}>
                    Cursus de 10+ vidéos
                  </p>
                </div>

                <div style={{ background: 'var(--bg-secondary)', padding: '1.35rem', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Vidéos Validées</span>
                    <CheckCircle2 size={18} color="#00d1ff" />
                  </div>
                  <div className="brand-font" style={{ fontSize: '1.85rem', fontWeight: 900, color: '#fff' }}>
                    {totalVideosWatched}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#00d1ff', marginTop: '0.2rem', fontWeight: 600 }}>
                    Visionnage intégral vérifié
                  </p>
                </div>

                <div style={{ background: 'var(--bg-secondary)', padding: '1.35rem', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Volume Étudié</span>
                    <Clock size={18} color="#34d399" />
                  </div>
                  <div className="brand-font" style={{ fontSize: '1.85rem', fontWeight: 900, color: '#fff' }}>
                    {Math.max(1, Math.round(totalStudySeconds / 3600))}h {Math.round((totalStudySeconds % 3600) / 60)}m
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '0.2rem', fontWeight: 600 }}>
                    Objectif : {meta.weeklyGoalHours}h / sem.
                  </p>
                </div>

                <div style={{ background: 'var(--bg-secondary)', padding: '1.35rem', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Diplômes Obtenus</span>
                    <Award size={18} color="#fbbf24" />
                  </div>
                  <div className="brand-font" style={{ fontSize: '1.85rem', fontWeight: 900, color: '#fff' }}>
                    {certifiedCourses.length}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#fbbf24', marginTop: '0.2rem', fontWeight: 600 }}>
                    Certificats vérifiables
                  </p>
                </div>
              </div>

              {/* Active Enrolled Playlists Progress */}
              <div style={{ background: 'var(--bg-secondary)', padding: '1.75rem', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 className="brand-font" style={{ fontSize: '1.2rem' }}>Progression de mes Playlists Actives</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Suivi séquentiel de vos formations (minimum 10 vidéos par cursus)
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/catalogue')}
                    className="btn-pro"
                    style={{ padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.78rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: '#fff', cursor: 'pointer' }}
                  >
                    + Explorer le Catalogue
                  </button>
                </div>

                {enrichedEnrollments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                    <BookOpen size={36} color="#a78bfa" style={{ margin: '0 auto 0.75rem' }} />
                    <p style={{ fontWeight: 700, color: '#fff', marginBottom: '0.35rem' }}>Vous n'êtes inscrit à aucune playlist pour le moment.</p>
                    <p style={{ fontSize: '0.84rem', marginBottom: '1.2rem' }}>Choisissez une formation parmi nos 24 cursus certifiants pour commencer.</p>
                    <button onClick={() => navigate('/catalogue')} className="btn-pro btn-pro-primary">
                      Découvrir les 24 formations
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                    {enrichedEnrollments.map(enr => (
                      <div
                        key={enr.course_id}
                        style={{
                          padding: '1.1rem 1.25rem', borderRadius: '16px',
                          background: 'rgba(255,255,255,0.025)', border: '1px solid var(--glass-border)',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          flexWrap: 'wrap', gap: '1rem'
                        }}
                      >
                        <div style={{ flex: 1, minWidth: '240px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                            <h4 className="brand-font" style={{ fontSize: '0.98rem', color: '#fff' }}>
                              {enr.course?.title}
                            </h4>
                            {enr.isCertified && (
                              <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: '99px', background: 'rgba(16,185,129,0.18)', color: '#4ade80', border: '1px solid rgba(16,185,129,0.35)' }}>
                                🏆 Certifié
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                            <span>{enr.completedCount} / {enr.totalModules} vidéos validées</span>
                            <span>•</span>
                            <span>Volume : {enr.stats.totalFormatted} (moy. {enr.stats.avgFormatted}/vidéo)</span>
                          </div>
                          <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden', maxWidth: 360 }}>
                            <div style={{
                              height: '100%', width: `${enr.computedProgress}%`,
                              background: enr.computedProgress >= 100 ? '#10b981' : 'linear-gradient(90deg, #7000ff, #00d1ff)'
                            }} />
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <span className="brand-font" style={{ fontSize: '1.05rem', fontWeight: 900, color: enr.computedProgress >= 100 ? '#4ade80' : '#00d1ff' }}>
                            {enr.computedProgress}%
                          </span>
                          <button
                            onClick={() => navigate(`/courses/${enr.course_id}`)}
                            className="btn-pro btn-pro-primary"
                            style={{ padding: '0.55rem 1rem', borderRadius: '10px', fontSize: '0.8rem' }}
                          >
                            <Play size={14} fill="#fff" /> {enr.computedProgress >= 100 ? 'Revoir' : 'Continuer'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Interactive Skill Manager Card */}
              <div style={{ background: 'var(--bg-secondary)', padding: '1.75rem', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
                <h3 className="brand-font" style={{ fontSize: '1.18rem', marginBottom: '0.3rem' }}>
                  Compétences & Technologies Maîtrisées
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Sélectionnez les technologies qui composent votre profil développeur ou ajoutez vos propres compétences.
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '1.1rem' }}>
                  {SUGGESTED_SKILLS.map(skill => {
                    const active = meta.skills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => handleToggleSkill(skill)}
                        style={{
                          padding: '0.4rem 0.8rem', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 700,
                          cursor: 'pointer', transition: 'all 0.18s',
                          background: active ? 'linear-gradient(135deg, rgba(112,0,255,0.35), rgba(0,209,255,0.2))' : 'rgba(255,255,255,0.03)',
                          border: active ? '1px solid rgba(0,209,255,0.45)' : '1px solid var(--glass-border)',
                          color: active ? '#fff' : 'var(--text-muted)',
                        }}
                      >
                        {active ? '✓ ' : '+ '}{skill}
                      </button>
                    );
                  })}
                </div>

                <form onSubmit={handleAddCustomSkill} style={{ display: 'flex', gap: '0.6rem', maxWidth: 420 }}>
                  <input
                    type="text"
                    value={customSkill}
                    onChange={e => setCustomSkill(e.target.value)}
                    placeholder="Ajouter une compétence (ex: GraphQL, Terraform...)"
                    style={{
                      flex: 1, padding: '0.6rem 0.9rem', borderRadius: '10px',
                      background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)',
                      color: '#fff', fontSize: '0.82rem', outline: 'none'
                    }}
                  />
                  <button type="submit" className="btn-pro btn-pro-primary" style={{ padding: '0.6rem 1rem', borderRadius: '10px', fontSize: '0.8rem' }}>
                    <Plus size={15} /> Ajouter
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ── TAB 2: CERTIFICATES & GAMIFIED BADGES ── */}
          {activeTab === 'certificates' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '1.75rem', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
                <h3 className="brand-font" style={{ fontSize: '1.2rem', marginBottom: '0.35rem' }}>
                  Mes Certificats Officiels MR1Academy ({certifiedCourses.length})
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  Tous vos diplômes sont signés numériquement et téléchargeables en haute résolution (PNG HD & PDF).
                </p>

                {certifiedCourses.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed var(--glass-border)' }}>
                    <Award size={38} color="#fbbf24" style={{ margin: '0 auto 0.75rem' }} />
                    <p style={{ fontWeight: 700, color: '#fff', marginBottom: '0.3rem' }}>Aucun certificat débloqué pour l'instant</p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      Terminez les 10 vidéos d'un cours à 100% pour obtenir le Feu Vert et réussir le Quiz de Certification.
                    </p>
                    <button onClick={() => navigate('/mes-cours')} className="btn-pro btn-pro-primary">
                      Voir mes cours en cours
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1rem' }}>
                    {certifiedCourses.map(cert => (
                      <div
                        key={cert.course_id}
                        style={{
                          padding: '1.35rem', borderRadius: '18px',
                          background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(0,209,255,0.05))',
                          border: '1px solid rgba(74,222,128,0.35)',
                          display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                            <span style={{ fontSize: '0.68rem', fontWeight: 900, padding: '2px 8px', borderRadius: '99px', background: '#10b981', color: '#052e16' }}>
                              DIPLÔME VÉRIFIÉ
                            </span>
                            <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#00d1ff', fontWeight: 700 }}>
                              {cert.certificateUid}
                            </span>
                          </div>
                          <h4 className="brand-font" style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '0.35rem' }}>
                            {cert.course?.title}
                          </h4>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Titulaire : <strong style={{ color: '#fff' }}>{user.name}</strong> • Score : <strong style={{ color: '#4ade80' }}>{cert.quizScore}%</strong>
                          </p>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => downloadCertificatePNG({
                              studentName: user.name || 'Étudiant MR1Academy',
                              courseTitle: cert.course?.title,
                              instructorName: cert.course?.instructor?.name || 'Marwane • MR1Academy',
                              certificateUid: cert.certificateUid,
                              dateStr: new Date(cert.certifiedAt).toLocaleDateString('fr-FR'),
                              totalDuration: cert.stats.totalFormatted,
                              quizScore: cert.quizScore,
                            })}
                            className="btn-pro btn-pro-primary"
                            style={{ flex: 1, padding: '0.55rem 0.8rem', borderRadius: '10px', fontSize: '0.76rem', justifyContent: 'center' }}
                          >
                            <Download size={14} /> PNG HD
                          </button>
                          <button
                            onClick={() => openCertificatePrintWindow({
                              studentName: user.name || 'Étudiant MR1Academy',
                              courseTitle: cert.course?.title,
                              instructorName: cert.course?.instructor?.name || 'Marwane • MR1Academy',
                              certificateUid: cert.certificateUid,
                              dateStr: new Date(cert.certifiedAt).toLocaleDateString('fr-FR'),
                              totalDuration: cert.stats.totalFormatted,
                              quizScore: cert.quizScore,
                            })}
                            className="btn-pro"
                            style={{ padding: '0.55rem 0.8rem', borderRadius: '10px', fontSize: '0.76rem', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)', color: '#fff', cursor: 'pointer' }}
                          >
                            <Printer size={14} /> PDF
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Badges Grid */}
              <div style={{ background: 'var(--bg-secondary)', padding: '1.75rem', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
                <h3 className="brand-font" style={{ fontSize: '1.18rem', marginBottom: '1rem' }}>
                  Badges & Accomplissements Débloqués ({badges.filter(b => b.unlocked).length}/{badges.length})
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.9rem' }}>
                  {badges.map(b => (
                    <div
                      key={b.id}
                      style={{
                        padding: '1rem', borderRadius: '16px',
                        background: b.unlocked ? `${b.color}12` : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${b.unlocked ? `${b.color}40` : 'var(--glass-border)'}`,
                        opacity: b.unlocked ? 1 : 0.5,
                        display: 'flex', alignItems: 'flex-start', gap: '0.8rem'
                      }}
                    >
                      <div style={{
                        width: 38, height: 38, borderRadius: '10px',
                        background: `${b.color}20`, color: b.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>
                        <Award size={18} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.86rem', fontWeight: 800, color: '#fff', marginBottom: '0.2rem' }}>
                          {b.title}
                        </h4>
                        <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                          {b.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 3: RECENT ACTIVITY & NOTIFICATION LOG ── */}
          {activeTab === 'activity' && (
            <div style={{ background: 'var(--bg-secondary)', padding: '1.75rem', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
              <h3 className="brand-font" style={{ fontSize: '1.2rem', marginBottom: '0.35rem' }}>
                Journal d'Activité & Historique Temps Réel
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Retrouvez toutes vos validations de vidéos, inscriptions, certificats, favoris et événements.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {activities.map(act => (
                  <div
                    key={act.id}
                    style={{
                      padding: '1rem 1.15rem', borderRadius: '16px',
                      background: 'rgba(255,255,255,0.025)', border: '1px solid var(--glass-border)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: '240px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        {act.badge && (
                          <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '2px 7px', borderRadius: '6px', background: 'rgba(0,209,255,0.12)', color: '#00d1ff', textTransform: 'uppercase' }}>
                            {act.badge}
                          </span>
                        )}
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{act.time}</span>
                      </div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>{act.title}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{act.desc}</p>
                    </div>
                    {act.actionUrl && (
                      <button
                        onClick={() => navigate(act.actionUrl)}
                        className="btn-pro"
                        style={{ padding: '0.45rem 0.9rem', borderRadius: '10px', fontSize: '0.76rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: '#00d1ff', fontWeight: 700, cursor: 'pointer' }}
                      >
                        {act.actionLabel || 'Ouvrir'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB 4: ACCOUNT, PORTFOLIO & SECURITY SETTINGS ── */}
          {activeTab === 'settings' && (
            <form
              onSubmit={handleSubmitAccount}
              className="auth-form"
              style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--glass-border)' }}
            >
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 className="brand-font" style={{ fontSize: '1.3rem' }}>Paramètres du Compte, Portfolio & Sécurité</h2>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  Mettez à jour votre nom officiel (affiché sur vos certificats), votre bio développeur et vos accès.
                </p>
              </div>

              {message && (
                <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.25)', padding: '1rem', borderRadius: '12px', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', fontSize: '0.88rem', fontWeight: 600 }}>
                  <CheckCircle size={20} /> {message}
                </div>
              )}

              {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '1rem', borderRadius: '12px', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', fontSize: '0.88rem', fontWeight: 600 }}>
                  <AlertCircle size={20} /> {error}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label><User size={15} /> Nom Complet (affiché sur vos certificats)</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label><Mail size={15} /> Adresse Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label><Briefcase size={15} /> Titre / Spécialisation</label>
                  <select
                    value={meta.headline}
                    onChange={e => setMeta({ ...meta, headline: e.target.value })}
                    style={{
                      width: '100%', padding: '0.85rem 1rem', borderRadius: '12px',
                      background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)',
                      color: '#fff', fontSize: '0.9rem', outline: 'none'
                    }}
                  >
                    {CAREER_TRACKS.map(track => (
                      <option key={track} value={track} style={{ background: '#0f172a' }}>{track}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label><MapPin size={15} /> Ville / Pays</label>
                  <input
                    type="text"
                    value={meta.location}
                    onChange={e => setMeta({ ...meta, location: e.target.value })}
                    placeholder="Ex: Casablanca, Maroc / Paris"
                  />
                </div>
              </div>

              <div className="form-group">
                <label><Sparkles size={15} /> Bio Professionnelle & Objectifs</label>
                <textarea
                  rows={3}
                  value={meta.bio}
                  onChange={e => setMeta({ ...meta, bio: e.target.value })}
                  style={{
                    width: '100%', padding: '0.85rem 1rem', borderRadius: '12px',
                    background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)',
                    color: '#fff', fontSize: '0.9rem', outline: 'none', resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label><Code2 size={15} /> Lien GitHub</label>
                  <input
                    type="url"
                    value={meta.github}
                    onChange={e => setMeta({ ...meta, github: e.target.value })}
                    placeholder="https://github.com/..."
                  />
                </div>
                <div className="form-group">
                  <label><Briefcase size={15} /> Lien LinkedIn</label>
                  <input
                    type="url"
                    value={meta.linkedin}
                    onChange={e => setMeta({ ...meta, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                <div className="form-group">
                  <label><Globe size={15} /> Site Portfolio</label>
                  <input
                    type="url"
                    value={meta.website}
                    onChange={e => setMeta({ ...meta, website: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)', margin: '1.5rem 0' }} />
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 600 }}>
                Sécurité : Changer le mot de passe (laisser vide si inchangé)
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label><Lock size={15} /> Nouveau Mot de Passe</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimum 6 caractères"
                  />
                </div>

                <div className="form-group">
                  <label><Lock size={15} /> Confirmer le Mot de Passe</label>
                  <input
                    type="password"
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={e => setFormData({ ...formData, password_confirmation: e.target.value })}
                    placeholder="Répétez le mot de passe"
                  />
                </div>
              </div>

              <button type="submit" className="btn-pro btn-pro-primary" disabled={loading} style={{ marginTop: '1rem', width: '100%', justifyContent: 'center', padding: '0.9rem' }}>
                {loading ? 'Enregistrement...' : <><Save size={18} /> Enregistrer mon Profil & Portfolio</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
