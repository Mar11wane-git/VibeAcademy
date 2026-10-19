import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Play, ChevronRight, GraduationCap, Award,
  Sparkles, Users, CheckCircle, Shield, ListVideo, Bot, Calendar,
  Menu, X
} from 'lucide-react';
import { getCourseCover, COURSE_COVER_PRESETS } from '../utils/certificationEngine';
import Footer from '../components/Footer';
import VibeLogo from '../components/VibeLogo';

const LandingPage = () => {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    if (localStorage.getItem('token') && localStorage.getItem('user')) {
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <div className="landing-page">
      <div className="orb-1"></div>
      <div className="orb-2"></div>

      {/* Top Navbar for Visitors */}
      <nav className="top-nav">
        <VibeLogo size={40} onClick={() => navigate('/')} />

        <div className="nav-links landing-nav-desktop">
          <a href="#hero" className="nav-link">Accueil</a>
          <a href="#courses-showcase" className="nav-link">Formations (24)</a>
          <a href="#features" className="nav-link">Technologie</a>
          <a href="#certifications" className="nav-link">Certifications</a>
          <button
            onClick={() => navigate('/apropos')}
            className="nav-link"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}
          >
            À Propos
          </button>
          <button
            onClick={() => navigate('/contact')}
            className="nav-link"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}
          >
            Contact
          </button>
          <div style={{ marginLeft: '1rem', display: 'flex', gap: '1rem' }}>
            <button className="btn-pro btn-pro-outline" onClick={() => navigate('/login')}>
              Se Connecter
            </button>
            <button className="btn-pro btn-pro-primary" onClick={() => navigate('/register')}>
              Commencer Maintenant <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="landing-mobile-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid var(--glass-border)',
            borderRadius: '12px',
            width: 42,
            height: 42,
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              style={{
                position: 'fixed',
                top: '70px',
                left: 0,
                right: 0,
                background: 'rgba(6, 6, 14, 0.98)',
                backdropFilter: 'blur(25px)',
                WebkitBackdropFilter: 'blur(25px)',
                borderBottom: '1px solid var(--glass-border)',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                zIndex: 999,
              }}
            >
              <a href="#hero" onClick={() => setMenuOpen(false)} className="nav-link" style={{ fontSize: '1.05rem', padding: '0.4rem 0' }}>Accueil</a>
              <a href="#courses-showcase" onClick={() => setMenuOpen(false)} className="nav-link" style={{ fontSize: '1.05rem', padding: '0.4rem 0' }}>Formations (24)</a>
              <a href="#features" onClick={() => setMenuOpen(false)} className="nav-link" style={{ fontSize: '1.05rem', padding: '0.4rem 0' }}>Technologie</a>
              <a href="#certifications" onClick={() => setMenuOpen(false)} className="nav-link" style={{ fontSize: '1.05rem', padding: '0.4rem 0' }}>Certifications</a>
              <button
                onClick={() => { navigate('/apropos'); setMenuOpen(false); }}
                className="nav-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '1.05rem', textAlign: 'left', padding: '0.4rem 0' }}
              >
                À Propos
              </button>
              <button
                onClick={() => { navigate('/contact'); setMenuOpen(false); }}
                className="nav-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '1.05rem', textAlign: 'left', padding: '0.4rem 0' }}
              >
                Contact
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <button className="btn-pro btn-pro-outline" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { navigate('/login'); setMenuOpen(false); }}>
                  Se Connecter
                </button>
                <button className="btn-pro btn-pro-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { navigate('/register'); setMenuOpen(false); }}>
                  Commencer Maintenant <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <div id="hero" className="hero-section" style={{ minHeight: '100vh', paddingTop: '120px' }}>
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hero-text"
        >
          <div className="hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={14} /> Plateforme Académique &amp; IA Intégrée
          </div>
          <h1 className="landing-title brand-font">
            La plateforme <span className="text-gradient-animated">définitive</span> pour maîtriser le code &amp; l&apos;architecture
          </h1>
          <p className="landing-desc">
            Apprenez avec des playlists vidéo séquentielles, un assistant IA intelligent disponible 24h/24, un agenda pro synchronisé et des certificats officiels haute définition délivrés dès la validation de vos compétences.
          </p>
          <div className="hero-actions">
            <button className="btn-pro btn-pro-primary" onClick={() => navigate('/register')}>
              <Play size={18} fill="currentColor" />
              Accéder aux Formations
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>
              <div style={{ display: 'flex' }}>
                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100" alt="user" style={{ width: 38, height: 38, borderRadius: '50%', border: '2px solid var(--bg-primary)', objectFit: 'cover' }} />
                <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100" alt="user" style={{ width: 38, height: 38, borderRadius: '50%', border: '2px solid var(--bg-primary)', marginLeft: '-12px', objectFit: 'cover' }} />
                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100" alt="user" style={{ width: 38, height: 38, borderRadius: '50%', border: '2px solid var(--bg-primary)', marginLeft: '-12px', objectFit: 'cover' }} />
              </div>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Users size={15} /> +120k Apprenants</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hero-graphics"
        >
          <motion.div
            className="glass-floating-card fc-1"
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(139,92,246,0.5)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '0.75rem', borderRadius: '12px' }}>
                <GraduationCap size={24} color="var(--accent-blue)" />
              </div>
              <div>
                <h4 className="brand-font">Playlists Pro</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Validation séquentielle auto</p>
              </div>
            </div>
          </motion.div>

          <img className="main-graphic-img" src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000&auto=format&fit=crop" alt="Students learning" />

          <motion.div
            className="glass-floating-card fc-2"
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(236,72,153,0.5)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: 'rgba(236, 72, 153, 0.2)', padding: '0.75rem', borderRadius: '12px' }}>
                <Award size={24} color="var(--accent-pink)" />
              </div>
              <div>
                <h4 className="brand-font">Certificats HD</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Export PNG &amp; PDF vectoriel</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Course Visual Gallery Showcase */}
      <div id="courses-showcase" className="landing-section landing-section-showcase" style={{ maxWidth: '1320px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#00d1ff', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            CURRICULUM INGÉNIEUR &amp; DESIGN
          </span>
          <h2 className="brand-font landing-section-title" style={{ marginTop: '0.5rem', marginBottom: '0.8rem' }}>
            Des formations complètes sur les technologies les plus demandées
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '680px', margin: '0 auto' }}>
            Chaque parcours combine une playlist vidéo structurée, un suivi précis de durée moyenne par épisode et un examen de certification.
          </p>
        </div>

        <div className="landing-cards-grid" style={{ display: 'grid', gap: '1.75rem' }}>
          {COURSE_COVER_PRESETS.slice(0, 6).map((preset, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -6 }}
              onClick={() => navigate('/register')}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--glass-border)',
                borderRadius: '22px',
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: '0 16px 36px rgba(0,0,0,0.28)',
              }}
            >
              <div style={{ height: '195px', overflow: 'hidden', position: 'relative' }}>
                <img
                  src={getCourseCover({ title: preset.title })}
                  alt={preset.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ padding: '1.35rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.7px' }}>
                    {preset.label}
                  </span>
                  <h4 className="brand-font" style={{ fontSize: '1.05rem', fontWeight: 800, marginTop: '0.25rem' }}>
                    {preset.title}
                  </h4>
                </div>
                <div style={{ width: 38, height: 38, borderRadius: '11px', background: 'rgba(112,0,255,0.15)', color: '#c4b5fd', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ChevronRight size={18} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="landing-section landing-section-features" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 className="brand-font landing-section-title" style={{ marginBottom: '1rem' }}>Pourquoi choisir MR1Academy ?</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', marginBottom: '4rem', maxWidth: '650px', margin: '0 auto 4rem' }}>
            Un écosystème technique complet conçu pour accélérer votre progression.
          </p>

          <div className="landing-features-grid" style={{ display: 'grid', gap: '1.75rem' }}>
            {[
              { icon: ListVideo, title: 'Playlists Séquentielles', desc: 'Calcul automatique de la durée moyenne, validation d’épisode et passage fluide à la vidéo suivante.' },
              { icon: Bot, title: 'Assistant IA VibeGPT', desc: 'Posez vos questions sur les cours, le code, les algorithmes ou votre progression à notre IA intégrée.' },
              { icon: Calendar, title: 'Agenda Pro RFC 5545', desc: 'Planifiez vos révisions avec Drag & Drop, export iCalendar (.ics) et synchronisation Google/Outlook.' },
              { icon: Shield, title: 'Certification Vérifiable', desc: 'Débloquez le Feu Vert à 100%, validez le quiz technique et téléchargez votre diplôme officiel.' }
            ].map((f, i) => (
              <div key={i} style={{ background: 'var(--bg-tertiary)', padding: '2rem', borderRadius: '20px', border: '1px solid var(--glass-border)', textAlign: 'left' }}>
                <div style={{ width: 50, height: 50, borderRadius: '12px', background: 'rgba(139, 92, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--accent-main)' }}>
                  <f.icon size={24} />
                </div>
                <h3 className="brand-font" style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.92rem' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Academic Certification Workflow Section (100% Free, Zero Payment) */}
      <div id="certifications" className="landing-section landing-section-certifications" style={{ position: 'relative' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#4ade80', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            VALIDATION OFFICIELLE DES ACQUIS
          </span>
          <h2 className="brand-font landing-section-title" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
            Comment obtenir votre Certificat MR1Academy ?
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '3.5rem', maxWidth: '680px', margin: '0 auto 3.5rem' }}>
            Toutes nos formations et certifications sont intégralement accessibles aux étudiants inscrits. Votre diplôme s&apos;obtient au mérite académique en 3 étapes :
          </p>

          <div className="landing-steps-grid" style={{ display: 'grid', gap: '2rem', textAlign: 'left' }}>
            {[
              {
                step: 'ÉTAPE 01',
                title: 'Suivre la Playlist Vidéo',
                color: '#00d1ff',
                items: [
                  'Visionnez chaque module dans l’ordre séquentiel',
                  'Durée moyenne et temps restant calculés en direct',
                  'Enchaînement automatique d’une vidéo à la suivante'
                ]
              },
              {
                step: 'ÉTAPE 02',
                title: 'Obtenir le Feu Vert (100%)',
                color: '#a855f7',
                items: [
                  'Validation complète de tous les modules du cours',
                  'Déverrouillage immédiat de l’examen final',
                  'Questions techniques adaptées à la spécialité du cours'
                ]
              },
              {
                step: 'ÉTAPE 03',
                title: 'Diplôme HD & ID Unique',
                color: '#4ade80',
                items: [
                  'Score minimum requis de 80% au Quiz officiel',
                  'Génération d’un identifiant unique VIBE-YYYY-XXXX',
                  'Téléchargement immédiat en PNG 2000px et PDF A4'
                ]
              }
            ].map((card, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '24px',
                  padding: '2.25rem 2rem',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 900, color: card.color, letterSpacing: '1.5px', marginBottom: '0.6rem' }}>
                  {card.step}
                </div>
                <h3 className="brand-font" style={{ fontSize: '1.4rem', marginBottom: '1.4rem' }}>{card.title}</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  {card.items.map((item, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.45 }}>
                      <CheckCircle size={17} color={card.color} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '3.5rem' }}>
            <button className="btn-pro btn-pro-primary" style={{ padding: '1rem 2.4rem', fontSize: '1rem' }} onClick={() => navigate('/register')}>
              Créer mon compte étudiant <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
