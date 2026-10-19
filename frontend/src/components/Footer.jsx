import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, ShieldCheck, Sparkles, ArrowUp, Mail, CheckCircle2,
  Globe, Award, Calendar, Users, Compass, HelpCircle, FileText,
  Lock, ExternalLink, Terminal, Cpu, Heart
} from 'lucide-react';
import VibeLogo from './VibeLogo';

const LEGAL_DOCS = {
  terms: {
    title: 'Charte Académique & Conditions Générales d\'Utilisation',
    badge: 'CONFORMITÉ ACADÉMIQUE MR1Academy',
    sections: [
      {
        h: '1. Accès Intégral aux Cursus & Playlists',
        p: 'MR1Academy met à disposition de tous les étudiants inscrits 24 cursus d\'ingénierie complets (IA Générative, Data Engineering, DevOps, Cybersécurité, Développement Web/Mobile et Systèmes). Chaque cours est structuré sous forme de playlist séquentielle.'
      },
      {
        h: '2. Règles de Validation & Feu Vert (100%)',
        p: 'La validation d\'un module s\'effectue automatiquement à la fin du visionnage ou via le bouton de validation de fin de chapitre. L\'accès à l\'examen final de certification (« Feu Vert ») requiert 100% de progression sur la playlist du cours.'
      },
      {
        h: '3. Authenticité des Certificats Officiels',
        p: 'Un score minimal de 80% au Quiz Final débloque l\'émission d\'un Certificat Officiel doté d\'un identifiant unique vérifiable (format VIBE-YYYY-XXXX). Tout certificat peut être vérifié publiquement sur la page À Propos.'
      }
    ]
  },
  privacy: {
    title: 'Politique de Confidentialité & Protection des Données (RGPD)',
    badge: 'PROTECTION DES DONNÉES & SÉCURITÉ',
    sections: [
      {
        h: '1. Données Collectées',
        p: 'Nous collectons uniquement les données strictement nécessaires à votre progression pédagogique : profil étudiant, modules complétés, scores de quiz, certificats délivrés, événements d\'agenda et discussions communautaires.'
      },
      {
        h: '2. Stockage Hybride & Chiffrement',
        p: 'L\'authentification est protégée par Laravel Sanctum et le hachage Bcrypt. Vos préférences et progressions bénéficient d\'une synchronisation hybride temps réel (Serveur MySQL + Cache Local SWR) garantissant zéro perte de données.'
      },
      {
        h: '3. Vos Droits',
        p: 'Vous pouvez à tout moment modifier vos informations depuis votre Profil, exporter votre agenda au format standard iCalendar (.ics) ou contacter notre équipe Support via la page Contact.'
      }
    ]
  },
  security: {
    title: 'Architecture Technique & Sécurité de la Plateforme',
    badge: 'INFRASTRUCTURE HAUTE DISPONIBILITÉ',
    sections: [
      {
        h: '1. Stack Technologique Pro',
        p: 'Propulsé par React 19 + Vite côté Frontend (avec moteur de cache Stale-While-Revalidate instantané) et Laravel 11 + MySQL côté Backend API REST.'
      },
      {
        h: '2. Protection OWASP & API',
        p: 'Toutes les routes sensibles sont protégées par authentification Token Sanctum, validation stricte des schémas et requêtes SQL préparées Eloquent ORM.'
      }
    ]
  }
};

const Footer = () => {
  const navigate = useNavigate();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [activeLegalKey, setActiveLegalKey] = useState(null);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) return;
    setSubscribed(true);
    try {
      const list = JSON.parse(localStorage.getItem('vibe_newsletter_subs') || '[]');
      if (!list.includes(newsletterEmail.trim())) {
        list.push(newsletterEmail.trim());
        localStorage.setItem('vibe_newsletter_subs', JSON.stringify(list));
      }
    } catch { /* ignore */ }
    setNewsletterEmail('');
    setTimeout(() => setSubscribed(false), 5000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const mainEl = document.querySelector('.main-content');
    if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const go = (path) => {
    navigate(path);
    scrollToTop();
  };

  return (
    <footer
      className="site-footer"
      style={{
        marginTop: 'auto',
        background: 'linear-gradient(180deg, rgba(10, 10, 22, 0.92) 0%, rgba(5, 5, 13, 0.99) 100%)',
        borderTop: '1px solid var(--glass-border)',
        padding: '3.2rem 2.5rem 2rem',
        position: 'relative',
        zIndex: 5,
        color: 'var(--text-main)'
      }}
    >
      <div style={{ maxWidth: '1340px', margin: '0 auto' }}>
        {/* ── Top Newsletter & Live Status Banner ── */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.025)',
            border: '1px solid var(--glass-border)',
            borderRadius: '22px',
            padding: '1.6rem 2rem',
            marginBottom: '2.8rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem'
          }}
        >
          <div style={{ maxWidth: '540px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.73rem', fontWeight: 800, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '0.35rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 10px #4ade80' }} />
              Tous les systèmes opérationnels • 24 Cursus Certifiants Actifs
            </div>
            <h3 className="brand-font" style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>
              Restez à la pointe de l&apos;IA, de la Data et du Cloud
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', margin: 0 }}>
              Recevez chaque semaine nos nouveaux labs pratiques, feuilles de route techniques et sessions Live Mentors.
            </p>
          </div>

          <form onSubmit={handleNewsletterSubmit} style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', flex: '1', maxWidth: '430px', justifyContent: 'flex-end' }}>
            {subscribed ? (
              <div style={{
                width: '100%', padding: '0.75rem 1.1rem', borderRadius: '12px',
                background: 'rgba(74, 222, 128, 0.14)', border: '1px solid rgba(74, 222, 128, 0.4)',
                color: '#4ade80', fontWeight: 700, fontSize: '0.85rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}>
                <CheckCircle2 size={17} /> Inscription confirmée à la Newsletter MR1Academy !
              </div>
            ) : (
              <>
                <div style={{
                  flex: 1, minWidth: '210px', display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: 'var(--bg-tertiary)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px', padding: '0.55rem 0.9rem'
                }}>
                  <Mail size={15} color="var(--text-muted)" />
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={e => setNewsletterEmail(e.target.value)}
                    placeholder="votre.email@domaine.com"
                    style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '0.84rem', width: '100%' }}
                  />
                </div>
                <button
                  type="submit"
                  className="btn-pro btn-pro-primary"
                  style={{ padding: '0.6rem 1.25rem', borderRadius: '12px', fontSize: '0.84rem', fontWeight: 700 }}
                >
                  S&apos;abonner
                </button>
              </>
            )}
          </form>
        </div>

        {/* ── 4-Column Main Links Grid ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '2.2rem',
            paddingBottom: '2.5rem',
            borderBottom: '1px solid rgba(255,255,255,0.07)'
          }}
        >
          {/* Col 1: Brand & Metrics */}
          <div>
            <div style={{ marginBottom: '0.9rem' }}>
              <VibeLogo size={38} onClick={() => go('/dashboard')} />
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              Plateforme d&apos;ingénierie logicielle, d&apos;Intelligence Artificielle et de Data Science avec playlists séquentielles, mentorat Live et certifications vérifiables.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.25rem 0.6rem', borderRadius: '7px', background: 'rgba(139,92,246,0.14)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.3)' }}>
                24 Cursus Pro
              </span>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.25rem 0.6rem', borderRadius: '7px', background: 'rgba(56,189,248,0.14)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)' }}>
                110+ Vidéos HD
              </span>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.25rem 0.6rem', borderRadius: '7px', background: 'rgba(74,222,128,0.14)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' }}>
                100% Gratuit
              </span>
            </div>
          </div>

          {/* Col 2: Filières Technologiques */}
          <div>
            <h4 className="brand-font" style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.9rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Cpu size={15} color="#a78bfa" /> Filières d&apos;Excellence
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.83rem' }}>
              {[
                { label: 'IA Générative, LLMs & RAG', path: '/catalogue' },
                { label: 'Deep Learning & PyTorch', path: '/catalogue' },
                { label: 'Big Data, Spark & Kafka', path: '/catalogue' },
                { label: 'Data Analytics & Power BI', path: '/catalogue' },
                { label: 'DevOps, Docker & Kubernetes', path: '/catalogue' },
                { label: 'Cybersécurité & Pentest OWASP', path: '/catalogue' },
              ].map((item, i) => (
                <li key={i}>
                  <button
                    onClick={() => go(item.path)}
                    style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.83rem', textAlign: 'left', transition: 'color 0.2s' }}
                    onMouseOver={e => (e.currentTarget.style.color = '#c4b5fd')}
                    onMouseOut={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Navigation Plateforme */}
          <div>
            <h4 className="brand-font" style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.9rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Compass size={15} color="#38bdf8" /> Espace Étudiant
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.83rem' }}>
              {[
                { label: 'Tableau de Bord Pro', path: '/dashboard' },
                { label: 'Catalogue des 24 Cours', path: '/catalogue' },
                { label: 'Mes Playlists en Cours', path: '/mes-cours' },
                { label: 'Agenda Live & Export .ics', path: '/calendrier' },
                { label: 'Communauté, Code & Mentors', path: '/communaute' },
                { label: 'Favoris & Study Planner', path: '/favoris' },
                { label: 'Certificats Officiels HD', path: '/certificats' },
              ].map((item, i) => (
                <li key={i}>
                  <button
                    onClick={() => go(item.path)}
                    style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.83rem', textAlign: 'left' }}
                    onMouseOver={e => (e.currentTarget.style.color = '#38bdf8')}
                    onMouseOut={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Institution, À Propos & Support */}
          <div>
            <h4 className="brand-font" style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.9rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={15} color="#4ade80" /> Institution & Support
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.83rem' }}>
              <li>
                <button
                  onClick={() => go('/apropos')}
                  style={{ background: 'none', border: 'none', padding: 0, color: '#e2e8f0', fontWeight: 700, cursor: 'pointer', fontSize: '0.83rem', textAlign: 'left' }}
                >
                  À Propos de MR1Academy →
                </button>
              </li>
              <li>
                <button
                  onClick={() => go('/apropos')}
                  style={{ background: 'none', border: 'none', padding: 0, color: '#4ade80', fontWeight: 700, cursor: 'pointer', fontSize: '0.83rem', textAlign: 'left' }}
                >
                  ✓ Vérifier un Certificat Officiel
                </button>
              </li>
              <li>
                <button
                  onClick={() => go('/contact')}
                  style={{ background: 'none', border: 'none', padding: 0, color: '#e2e8f0', fontWeight: 700, cursor: 'pointer', fontSize: '0.83rem', textAlign: 'left' }}
                >
                  Contact & Support Technique 24/7 →
                </button>
              </li>
              <li>
                <button
                  onClick={() => go('/contact')}
                  style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.83rem', textAlign: 'left' }}
                >
                  FAQ & Centre d&apos;Aide
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveLegalKey('terms')}
                  style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.83rem', textAlign: 'left' }}
                >
                  Charte Académique & CGU
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveLegalKey('privacy')}
                  style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.83rem', textAlign: 'left' }}
                >
                  Confidentialité & RGPD
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom Bar: Copyright + Legal Links + Back to Top ── */}
        <div
          style={{
            paddingTop: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.78rem',
            color: 'var(--text-muted)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span>© {new Date().getFullYear()} <strong style={{ color: '#fff' }}>MR1Academy Pro</strong>. Tous droits réservés.</span>
            <span>•</span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.2rem 0.65rem',
              borderRadius: '99px',
              background: 'linear-gradient(135deg, rgba(112,0,255,0.2), rgba(0,209,255,0.15))',
              border: '1px solid rgba(0,209,255,0.3)',
              color: '#fff',
              fontWeight: 800
            }}>
              Fondé &amp; Développé par <strong style={{ color: '#00d1ff', letterSpacing: '0.5px' }}>MAROUANE EL HAMDAOUI</strong>
            </span>
            <span>•</span>
            <span>Excellence académique &amp; ingénierie logicielle.</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveLegalKey('terms')}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.78rem' }}
            >
              CGU
            </button>
            <button
              onClick={() => setActiveLegalKey('privacy')}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.78rem' }}
            >
              Confidentialité
            </button>
            <button
              onClick={() => setActiveLegalKey('security')}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.78rem' }}
            >
              Sécurité
            </button>
            <button
              onClick={scrollToTop}
              title="Remonter en haut de la page"
              style={{
                background: 'rgba(139,92,246,0.16)',
                border: '1px solid rgba(139,92,246,0.38)',
                color: '#c4b5fd',
                borderRadius: '10px',
                padding: '0.4rem 0.75rem',
                fontSize: '0.76rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <ArrowUp size={14} /> Haut
            </button>
          </div>
        </div>
      </div>

      {/* ── Interactive Legal / Charter Modal ── */}
      <AnimatePresence>
        {activeLegalKey && LEGAL_DOCS[activeLegalKey] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveLegalKey(null)}
            style={{
              position: 'fixed', inset: 0, zIndex: 99999,
              background: 'rgba(4, 4, 12, 0.82)', backdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
            }}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%', maxWidth: '580px',
                background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
                borderRadius: '24px', padding: '2rem', boxShadow: '0 24px 60px rgba(0,0,0,0.65)'
              }}
            >
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#a78bfa', letterSpacing: '1px' }}>
                {LEGAL_DOCS[activeLegalKey].badge}
              </span>
              <h3 className="brand-font" style={{ fontSize: '1.4rem', marginTop: '0.35rem', marginBottom: '1.25rem', color: '#fff' }}>
                {LEGAL_DOCS[activeLegalKey].title}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                {LEGAL_DOCS[activeLegalKey].sections.map((sec, idx) => (
                  <div key={idx} style={{ background: 'var(--bg-tertiary)', padding: '1rem 1.15rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#e2e8f0', marginBottom: '0.35rem' }}>{sec.h}</h4>
                    <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.55, margin: 0 }}>{sec.p}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setActiveLegalKey(null)}
                className="btn-pro btn-pro-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
              >
                Fermer
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
};

export default Footer;
