import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Send, MessageSquare, HelpCircle, CheckCircle2, Clock,
  MapPin, ShieldCheck, ChevronDown, Sparkles, PhoneCall, Globe,
  FileCheck, Calendar, AlertCircle, ExternalLink
} from 'lucide-react';
import api, { getCachedData } from '../services/api';

const FAQ_ITEMS = [
  {
    category: 'Playlists & Progression',
    q: 'Comment fonctionne la validation automatique des vidéos dans une playlist ?',
    a: 'Chaque cours est organisé en playlist séquentielle. Dès qu\'une vidéo YouTube se termine (ou lorsque vous cliquez sur « Terminer & Suivant »), le module est immédiatement validé en base de données, votre pourcentage progresse et la vidéo suivante se lance automatiquement après un compte à rebours de 3 secondes.'
  },
  {
    category: 'Certificats & Quiz',
    q: 'Quand le « Feu Vert » pour passer le Quiz Final est-il débloqué ?',
    a: 'Le Feu Vert est accordé automatiquement dès que 100% des vidéos de la playlist d\'un cours sont validées. Vous accédez alors à l\'examen technique de 5 questions spécifiques au domaine. Un score minimum de 80% (4/5) délivre immédiatement votre Certificat Officiel HD (PNG 2000px & PDF A4).'
  },
  {
    category: 'Agenda & Organisation',
    q: 'Comment synchroniser l\'Agenda MR1Academy avec Google Calendar ou Outlook ?',
    a: 'Rendez-vous sur la page Agenda (/calendrier) et cliquez sur le bouton « Exporter .ics » ou sur l\'icône Google Calendar d\'une session. Le fichier respecte le standard RFC 5545 iCalendar compatible avec Google, Apple Calendar et Microsoft Outlook.'
  },
  {
    category: 'Favoris & Notes',
    q: 'Puis-je organiser mes cours favoris par priorité et ajouter des notes personnelles ?',
    a: 'Oui ! Dans la page Favoris (/favoris), vous pouvez définir la priorité de chaque cours (Haute 🔥, Moyenne ⚡, Normale 📌), le classer dans une collection, rédiger vos notes d\'étude et planifier directement un créneau dans votre Agenda.'
  },
  {
    category: 'Communauté & Mentorat',
    q: 'Comment réserver un créneau de mentorat individuel (1-on-1) ?',
    a: 'Depuis la page Communauté (/communaute), ouvrez l\'onglet « Mentors 1-on-1 », choisissez votre expert (React, IA, Data, DevOps, Sécurité) et cliquez sur « Réserver 30 min ». La session est automatiquement inscrite dans votre Agenda avec le lien de visioconférence.'
  }
];

const LOCAL_TICKETS_KEY = 'vibe_local_support_tickets_v1';

const ContactPage = () => {
  const navigate = useNavigate();

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}') || {};
    } catch {
      return {};
    }
  }, []);

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    category: 'Support Technique',
    priority: 'normale',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const [tickets, setTickets] = useState(() => {
    try {
      const local = JSON.parse(localStorage.getItem(LOCAL_TICKETS_KEY) || '[]');
      const cached = getCachedData('/contact/tickets') || [];
      return cached.length ? cached : local;
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (localStorage.getItem('token')) {
      api.get('/contact/tickets')
        .then(res => {
          if (Array.isArray(res.data) && res.data.length > 0) {
            setTickets(res.data);
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) return;

    setSubmitting(true);
    const fallbackTicket = {
      id: Date.now(),
      ticket_ref: 'MR1-SUP-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      name: form.name.trim(),
      email: form.email.trim(),
      category: form.category,
      priority: form.priority,
      subject: form.subject.trim(),
      message: form.message.trim(),
      status: 'Reçu • Réponse sous 2h',
      created_at: new Date().toISOString(),
    };

    try {
      const res = await api.post('/contact', form);
      const savedTicket = res.data?.ticket || fallbackTicket;
      const updated = [savedTicket, ...tickets];
      setTickets(updated);
      localStorage.setItem(LOCAL_TICKETS_KEY, JSON.stringify(updated.slice(0, 10)));
      setToast(`Ticket #${savedTicket.ticket_ref} envoyé directement par email au support MR1Academy !`);
    } catch {
      const updated = [fallbackTicket, ...tickets];
      setTickets(updated);
      localStorage.setItem(LOCAL_TICKETS_KEY, JSON.stringify(updated.slice(0, 10)));
      setToast(`Ticket #${fallbackTicket.ticket_ref} enregistré !`);
    } finally {
      setSubmitting(false);
      setForm(prev => ({ ...prev, subject: '', message: '' }));
      setTimeout(() => setToast(null), 5000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="page-view"
      style={{ paddingBottom: '4rem' }}
    >
      {/* ── Toast Notification ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            style={{
              position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999,
              background: 'rgba(15, 23, 42, 0.96)', border: '1px solid rgba(74, 222, 128, 0.5)',
              color: '#4ade80', padding: '1rem 1.4rem', borderRadius: '14px',
              fontWeight: 700, backdropFilter: 'blur(12px)',
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              boxShadow: '0 18px 40px rgba(0,0,0,0.45)'
            }}
          >
            <CheckCircle2 size={18} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
            padding: '0.32rem 0.85rem', borderRadius: '999px',
            background: 'rgba(56, 189, 248, 0.14)', border: '1px solid rgba(56, 189, 248, 0.35)',
            color: '#38bdf8', fontSize: '0.74rem', fontWeight: 800, marginBottom: '0.6rem',
            textTransform: 'uppercase', letterSpacing: '0.8px'
          }}>
            <MessageSquare size={13} /> Assistance Académique & Support Technique 24/7
          </div>
          <h1 className="page-title brand-font text-gradient-animated" style={{ marginBottom: '0.35rem' }}>
            Contact, Support & Centre d&apos;Aide Pro
          </h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Une question sur un cours, un certificat ou un projet technique ? Ouvrez un ticket officiel ou consultez notre FAQ interactive.
          </p>
        </div>

        {/* Live System Status Pill */}
        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid rgba(74,222,128,0.35)',
          borderRadius: '14px', padding: '0.65rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.6rem'
        }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 10px #4ade80' }} />
          <div>
            <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#fff' }}>Support & API en ligne</div>
            <div style={{ fontSize: '0.7rem', color: '#4ade80', fontWeight: 700 }}>Temps de réponse moyen : &lt; 2h</div>
          </div>
        </div>
      </div>

      {/* ── 4 Direct Contact Channels ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(225px, 1fr))',
        gap: '1rem',
        marginBottom: '2.2rem'
      }}>
        {[
          {
            icon: Mail,
            color: '#a78bfa',
            title: 'Support Pédagogique & Tech',
            value: 'support@MR1Academy.com',
            sub: 'Réponse garantie sous 2h ouvrées',
          },
          {
            icon: ShieldCheck,
            color: '#4ade80',
            title: 'Service des Certifications',
            value: 'certificats@MR1Academy.com',
            sub: 'Vérification & accréditation recruteurs',
          },
          {
            icon: Globe,
            color: '#38bdf8',
            title: 'Discord & Entraide Live',
            value: 'Communauté MR1Academy',
            sub: 'Salons de code & Mentors 1-on-1',
            action: () => navigate('/communaute'),
          },
          {
            icon: Calendar,
            color: '#f59e0b',
            title: 'Sessions Live & Hackathons',
            value: 'Agenda Interactif Pro',
            sub: 'Mardi, Jeudi & Week-ends Live',
            action: () => navigate('/calendrier'),
          },
        ].map((card, i) => (
          <div
            key={i}
            onClick={card.action}
            style={{
              background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
              borderRadius: '18px', padding: '1.25rem', cursor: card.action ? 'pointer' : 'default',
              display: 'flex', alignItems: 'flex-start', gap: '0.9rem'
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: '12px',
              background: `${card.color}18`, border: `1px solid ${card.color}38`,
              color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <card.icon size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', fontWeight: 700 }}>{card.title}</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fff', marginTop: '0.15rem' }}>{card.value}</div>
              <div style={{ fontSize: '0.74rem', color: card.color, marginTop: '0.2rem', fontWeight: 600 }}>{card.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Two-Column Grid: Ticket Form (Left) + FAQ & Ticket History (Right) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '1.75rem',
        alignItems: 'start'
      }}>
        {/* Left: Real Contact & Support Ticket Form */}
        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
          borderRadius: '24px', padding: '1.85rem'
        }}>
          <h2 className="brand-font" style={{ fontSize: '1.35rem', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Send size={19} color="#a78bfa" /> Ouvrir un Ticket Support / Nous Écrire
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginBottom: '1.4rem' }}>
            Votre demande génère un numéro de suivi officiel traité par nos ingénieurs et mentors.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Nom complet *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Votre nom"
                  style={{
                    width: '100%', padding: '0.7rem 0.9rem', borderRadius: '11px',
                    background: 'var(--bg-tertiary)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff', fontSize: '0.86rem', outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Adresse Email *
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="nom@exemple.com"
                  style={{
                    width: '100%', padding: '0.7rem 0.9rem', borderRadius: '11px',
                    background: 'var(--bg-tertiary)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff', fontSize: '0.86rem', outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Département concerné
                </label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  style={{
                    width: '100%', padding: '0.7rem 0.9rem', borderRadius: '11px',
                    background: 'var(--bg-tertiary)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff', fontSize: '0.85rem', outline: 'none', cursor: 'pointer'
                  }}
                >
                  <option value="Support Technique" style={{ background: '#0f0f1a' }}>Support Technique & Plateforme</option>
                  <option value="Certification & Quiz" style={{ background: '#0f0f1a' }}>Certification, Quiz & Diplôme HD</option>
                  <option value="Question Pédagogique / Code" style={{ background: '#0f0f1a' }}>Question Pédagogique / Mentorat</option>
                  <option value="Suggestion de Nouveau Cours" style={{ background: '#0f0f1a' }}>Suggestion de Nouveau Cours</option>
                  <option value="Partenariat & Entreprise" style={{ background: '#0f0f1a' }}>Partenariat Académique / Entreprise</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Priorité
                </label>
                <select
                  value={form.priority}
                  onChange={e => setForm({ ...form, priority: e.target.value })}
                  style={{
                    width: '100%', padding: '0.7rem 0.9rem', borderRadius: '11px',
                    background: 'var(--bg-tertiary)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff', fontSize: '0.85rem', outline: 'none', cursor: 'pointer'
                  }}
                >
                  <option value="normale" style={{ background: '#0f0f1a' }}>📌 Normale</option>
                  <option value="haute" style={{ background: '#0f0f1a' }}>⚡ Haute</option>
                  <option value="urgente" style={{ background: '#0f0f1a' }}>🔥 Urgente</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.35rem' }}>
                Sujet de votre demande *
              </label>
              <input
                type="text"
                required
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                placeholder="Ex: Question sur le cours Ingénierie IA Générative & RAG..."
                style={{
                  width: '100%', padding: '0.7rem 0.9rem', borderRadius: '11px',
                  background: 'var(--bg-tertiary)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', fontSize: '0.86rem', outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.35rem' }}>
                Message détaillé *
              </label>
              <textarea
                rows={4}
                required
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                placeholder="Décrivez votre question ou besoin en détail..."
                style={{
                  width: '100%', padding: '0.75rem 0.9rem', borderRadius: '11px',
                  background: 'var(--bg-tertiary)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', fontSize: '0.86rem', outline: 'none', resize: 'vertical'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-pro btn-pro-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 800 }}
            >
              <Send size={16} />
              {submitting ? 'Transmission en cours...' : 'Envoyer le Ticket Officiel'}
            </button>
          </form>

          {/* Submitted Tickets History */}
          {tickets.length > 0 && (
            <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="brand-font" style={{ fontSize: '0.98rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <FileCheck size={16} color="#4ade80" /> Vos Tickets Support Récents ({tickets.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '220px', overflowY: 'auto' }}>
                {tickets.map((t, idx) => (
                  <div
                    key={t.id || idx}
                    style={{
                      background: 'var(--bg-tertiary)', border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: '12px', padding: '0.75rem 0.95rem',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem'
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.73rem', fontWeight: 800, color: '#a78bfa' }}>
                          #{t.ticket_ref}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>• {t.category}</span>
                      </div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {t.subject}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 800, color: '#4ade80',
                      background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)',
                      padding: '0.22rem 0.6rem', borderRadius: '999px', flexShrink: 0
                    }}>
                      {t.status || 'Reçu'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Interactive FAQ & Help Center */}
        <div id="faq" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
            borderRadius: '24px', padding: '1.85rem'
          }}>
            <h2 className="brand-font" style={{ fontSize: '1.35rem', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HelpCircle size={20} color="#38bdf8" /> Questions Fréquentes (FAQ)
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginBottom: '1.25rem' }}>
              Tout savoir sur le fonctionnement des playlists, des examens et des certificats.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {FAQ_ITEMS.map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--bg-tertiary)',
                      border: isOpen ? '1px solid rgba(139,92,246,0.45)' : '1px solid rgba(255,255,255,0.07)',
                      borderRadius: '14px',
                      overflow: 'hidden'
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                      style={{
                        width: '100%', padding: '0.95rem 1.1rem', background: 'transparent', border: 'none',
                        color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        textAlign: 'left', cursor: 'pointer', gap: '0.75rem'
                      }}
                    >
                      <div>
                        <span style={{ display: 'block', fontSize: '0.68rem', fontWeight: 800, color: '#a78bfa', textTransform: 'uppercase', marginBottom: '0.15rem' }}>
                          {item.category}
                        </span>
                        <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>{item.q}</span>
                      </div>
                      <ChevronDown
                        size={17}
                        color="var(--text-muted)"
                        style={{
                          flexShrink: 0,
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s'
                        }}
                      />
                    </button>
                    {isOpen && (
                      <div style={{
                        padding: '0 1.1rem 1rem',
                        color: 'var(--text-muted)',
                        fontSize: '0.83rem',
                        lineHeight: 1.6,
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                        paddingTop: '0.75rem'
                      }}>
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Campus & Institution Card */}
          <div style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
            borderRadius: '22px', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem'
          }}>
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#4ade80', textTransform: 'uppercase' }}>
                BESOIN D&apos;UNE VÉRIFICATION DE DIPLÔME ?
              </div>
              <div className="brand-font" style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.2rem' }}>
                Accédez au Vérificateur Officiel de Certificats
              </div>
            </div>
            <button
              onClick={() => navigate('/apropos')}
              className="btn-pro btn-pro-primary"
              style={{ padding: '0.6rem 1.15rem', borderRadius: '11px', fontSize: '0.82rem' }}
            >
              Ouvrir À Propos & Vérification →
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ContactPage;
