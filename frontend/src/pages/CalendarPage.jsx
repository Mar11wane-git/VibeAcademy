import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon, Clock, Video, Bell, Plus, MoreHorizontal,
  CheckCircle2, ChevronLeft, ChevronRight, Users, Zap, Award,
  BookOpen, Code2, Mic, Trophy, X, MapPin, ExternalLink, Filter
} from 'lucide-react';

/* ─── Real events for October 2026 ─── */
const EVENTS = [
  { id: 1, title: 'Live Coding: React Hooks Avancé', date: '2026-10-05', time: '18:00 - 19:30', type: 'live', instructor: 'Coach Alex', spots: 45, enrolled: 38, description: 'Deep dive dans useReducer, useContext et les patterns avancés de hooks custom.' },
  { id: 2, title: 'Workshop: Déploiement Docker & CI/CD', date: '2026-10-07', time: '14:00 - 16:00', type: 'workshop', instructor: 'Mentor Karim', spots: 30, enrolled: 27, description: 'Apprenez à containeriser vos apps et automatiser le déploiement.' },
  { id: 3, title: 'Correction Projet: API REST Node.js', date: '2026-10-09', time: '14:30 - 15:30', type: 'review', instructor: 'Mentor Sarah', spots: 20, enrolled: 20, description: 'Revue de code collective du projet n°3 avec feedback personnalisé.' },
  { id: 4, title: 'Session Q&A: Carrière Dev Junior', date: '2026-10-10', time: '19:00 - 20:00', type: 'qa', instructor: 'Équipe Vibe', spots: 100, enrolled: 64, description: 'Questions ouvertes sur le marché du travail, CV, et portfolios.' },
  { id: 5, title: 'Masterclass: TypeScript pour React', date: '2026-10-13', time: '18:00 - 20:00', type: 'live', instructor: 'Coach Alex', spots: 50, enrolled: 42, description: 'Typage strict, generics et intégration TS dans un projet React existant.' },
  { id: 6, title: 'Hackathon: 48h Challenge IA', date: '2026-10-16', time: '09:00 - 18:00', type: 'hackathon', instructor: 'Tous les mentors', spots: 60, enrolled: 55, description: 'Compétition d\'équipe — créez une app IA en 48h. Prix à la clé !' },
  { id: 7, title: 'Hackathon: 48h Challenge IA (Jour 2)', date: '2026-10-17', time: '09:00 - 18:00', type: 'hackathon', instructor: 'Tous les mentors', spots: 60, enrolled: 55, description: 'Suite et fin du hackathon — présentations et délibérations.' },
  { id: 8, title: 'Workshop: Figma to Code', date: '2026-10-19', time: '15:00 - 17:00', type: 'workshop', instructor: 'Designer Nora', spots: 25, enrolled: 21, description: 'Transformer un design Figma en composants React pixel-perfect.' },
  { id: 9, title: 'Live Coding: Next.js 15 & Server Actions', date: '2026-10-21', time: '18:00 - 19:30', type: 'live', instructor: 'Coach Alex', spots: 45, enrolled: 33, description: 'Nouvelles features du framework: RSC, Server Actions, et Parallel Routes.' },
  { id: 10, title: 'Session Q&A: Préparation Entretiens Tech', date: '2026-10-23', time: '19:00 - 20:30', type: 'qa', instructor: 'Mentor Karim', spots: 40, enrolled: 28, description: 'Simulation d\'entretiens techniques et tips pour réussir.' },
  { id: 11, title: 'Correction Projet: Dashboard Analytics', date: '2026-10-24', time: '14:30 - 15:30', type: 'review', instructor: 'Mentor Sarah', spots: 20, enrolled: 18, description: 'Revue du projet n°4 — data visualization avec Recharts.' },
  { id: 12, title: 'Workshop: Tests Unitaires avec Vitest', date: '2026-10-26', time: '14:00 - 16:00', type: 'workshop', instructor: 'Coach Alex', spots: 30, enrolled: 15, description: 'Écrire des tests robustes pour vos composants React et fonctions utilitaires.' },
  { id: 13, title: 'Masterclass: Architecture Clean Code', date: '2026-10-28', time: '18:00 - 20:00', type: 'live', instructor: 'Mentor Karim', spots: 50, enrolled: 29, description: 'Principes SOLID, patterns de design et refactoring en pratique.' },
  { id: 14, title: 'Cérémonie: Remise des Certificats', date: '2026-10-30', time: '17:00 - 18:30', type: 'ceremony', instructor: 'Direction Vibe', spots: 200, enrolled: 156, description: 'Célébration des apprenants ayant complété le cursus complet VibeAcademy.' },
];

const TYPE_CONFIG = {
  live:      { label: 'Live Coding',  color: '#00d1ff', icon: Code2, bg: 'rgba(0,209,255,0.1)',  border: 'rgba(0,209,255,0.3)' },
  workshop:  { label: 'Workshop',     color: '#a78bfa', icon: BookOpen, bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.3)' },
  review:    { label: 'Correction',   color: '#f59e0b', icon: Award, bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)' },
  qa:        { label: 'Q&A',          color: '#4ade80', icon: Mic, bg: 'rgba(74,222,128,0.1)',   border: 'rgba(74,222,128,0.3)' },
  hackathon: { label: 'Hackathon',    color: '#ec4899', icon: Trophy, bg: 'rgba(236,72,153,0.1)',  border: 'rgba(236,72,153,0.3)' },
  ceremony:  { label: 'Cérémonie',    color: '#fbbf24', icon: Award, bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.3)' },
};

const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

/* ─── Helpers ─── */
const pad = n => String(n).padStart(2, '0');
const dateKey = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

function getCalendarDays(year, month) {
  const first = new Date(year, month, 1);
  let startDay = first.getDay() - 1;
  if (startDay < 0) startDay = 6;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i = startDay - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, current: false });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, current: true });
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) cells.push({ day: d, current: false });
  return cells;
}

const CalendarPage = () => {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(9); // October = 9 (0-indexed)
  const [viewMode, setViewMode] = useState('Mois');
  const [selectedDay, setSelectedDay] = useState(null);
  const [activeFilters, setActiveFilters] = useState(new Set(Object.keys(TYPE_CONFIG)));
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, type: '', data: null });
  const [alertedEvents, setAlertedEvents] = useState(new Set());

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };
  const openModal  = (type, data = null) => setModal({ isOpen: true, type, data });
  const closeModal = () => setModal({ isOpen: false, type: '', data: null });

  const toggleFilter = (key) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const filteredEvents = useMemo(() => EVENTS.filter(e => activeFilters.has(e.type)), [activeFilters]);
  const eventsByDate = useMemo(() => {
    const map = {};
    filteredEvents.forEach(ev => { (map[ev.date] ||= []).push(ev); });
    return map;
  }, [filteredEvents]);

  const calendarDays = useMemo(() => getCalendarDays(year, month), [year, month]);

  const today = new Date();
  const todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate());
  const selectedKey = selectedDay ? dateKey(year, month, selectedDay) : null;
  const selectedEvents = selectedKey ? (eventsByDate[selectedKey] || []) : [];

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); setSelectedDay(null); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); setSelectedDay(null); };

  /* upcoming events (sorted, next 5) */
  const upcoming = useMemo(() => {
    const ref = new Date(year, month, selectedDay || today.getDate());
    return filteredEvents
      .filter(e => new Date(e.date) >= new Date(ref.toISOString().split('T')[0]))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
  }, [filteredEvents, year, month, selectedDay]);

  /* stats */
  const totalSessions = EVENTS.length;
  const totalEnrolled = EVENTS.reduce((s, e) => s + e.enrolled, 0);
  const liveCount = EVENTS.filter(e => e.type === 'live').length;

  /* week view helpers */
  const getWeekEvents = () => {
    const refDay = selectedDay || today.getDate();
    const refDate = new Date(year, month, refDay);
    const dayOfWeek = refDate.getDay() === 0 ? 6 : refDate.getDay() - 1;
    const monday = new Date(refDate);
    monday.setDate(refDate.getDate() - dayOfWeek);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const key = dateKey(d.getFullYear(), d.getMonth(), d.getDate());
      days.push({ date: d, key, events: eventsByDate[key] || [] });
    }
    return days;
  };

  const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8h-20h

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-view">

      {/* ═══ TOAST ═══ */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
            style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999, background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.35)', color: '#4ade80', padding: '1rem 1.5rem', borderRadius: '14px', fontWeight: 700, backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            <CheckCircle2 size={18}/> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ MODAL ═══ */}
      <AnimatePresence>
        {modal.isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeModal}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', padding: '2.5rem', width: '90%', maxWidth: '480px', borderRadius: '24px', position: 'relative' }}>
              <button onClick={closeModal} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'rgba(255,255,255,0.06)', border: 'none', color: 'var(--text-muted)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={16}/></button>

              {modal.type === 'sync' && (
                <>
                  <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(0,209,255,0.1)', border: '1px solid rgba(0,209,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <CalendarIcon size={28} color="#00d1ff"/>
                  </div>
                  <h2 className="brand-font" style={{ marginBottom: '0.5rem', fontSize: '1.4rem' }}>Google Calendar Sync</h2>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.6, fontSize: '0.95rem' }}>Synchronisez automatiquement toutes vos sessions, workshops et live codings avec votre Google Agenda pour ne rien manquer.</p>
                  <button onClick={() => { closeModal(); showToast('Google Agenda connecté avec succès !'); }} className="btn-pro btn-pro-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: '0.75rem', padding: '0.9rem' }}>
                    <ExternalLink size={16}/> Autoriser l'accès Google
                  </button>
                  <button onClick={closeModal} style={{ width: '100%', padding: '0.8rem', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-main)', borderRadius: '12px', cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem' }}>Annuler</button>
                </>
              )}

              {modal.type === 'event' && modal.data && (() => {
                const ev = modal.data;
                const cfg = TYPE_CONFIG[ev.type];
                const IconComp = cfg.icon;
                const pct = Math.round((ev.enrolled / ev.spots) * 100);
                return (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: cfg.bg, border: `1px solid ${cfg.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconComp size={22} color={cfg.color}/>
                      </div>
                      <span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, padding: '0.3rem 0.9rem', borderRadius: '99px', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{cfg.label}</span>
                    </div>
                    <h2 className="brand-font" style={{ marginBottom: '0.5rem', fontSize: '1.35rem', lineHeight: 1.3 }}>{ev.title}</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.6, fontSize: '0.92rem' }}>{ev.description}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                      {[
                        { icon: <CalendarIcon size={14} color={cfg.color}/>, text: new Date(ev.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }) },
                        { icon: <Clock size={14} color={cfg.color}/>, text: ev.time },
                        { icon: <Video size={14} color={cfg.color}/>, text: ev.instructor },
                        { icon: <Users size={14} color={cfg.color}/>, text: `${ev.enrolled}/${ev.spots} inscrits` },
                      ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '0.6rem 0.8rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                          {item.icon} {item.text}
                        </div>
                      ))}
                    </div>
                    {/* Enrollment bar */}
                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <span>Inscription</span>
                        <span style={{ color: pct >= 90 ? '#f87171' : cfg.color, fontWeight: 700 }}>{pct}%</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
                          style={{ height: '100%', borderRadius: '99px', background: pct >= 90 ? 'linear-gradient(90deg, #f59e0b, #f87171)' : `linear-gradient(90deg, ${cfg.color}, ${cfg.color}88)` }}/>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button onClick={() => { closeModal(); showToast(`Inscrit à "${ev.title}" ✓`); }} className="btn-pro btn-pro-primary" style={{ flex: 1, justifyContent: 'center', padding: '0.85rem' }}>
                        <Zap size={16}/> S'inscrire
                      </button>
                      <button onClick={() => { setAlertedEvents(prev => new Set(prev).add(ev.id)); closeModal(); showToast(`Rappel activé pour "${ev.title}"`); }}
                        style={{ width: '48px', background: alertedEvents.has(ev.id) ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${alertedEvents.has(ev.id) ? 'rgba(245,158,11,0.3)' : 'var(--glass-border)'}`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: alertedEvents.has(ev.id) ? '#f59e0b' : 'var(--text-muted)', transition: '0.2s' }}>
                        <Bell size={18}/>
                      </button>
                    </div>
                  </>
                );
              })()}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ HEADER ═══ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title brand-font text-gradient-animated" style={{ marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CalendarIcon size={28}/> Agenda & Sessions
          </h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Planifiez, réservez et ne manquez aucune masterclass.</p>
        </div>
        <button className="btn-pro btn-pro-primary" style={{ gap: '0.5rem' }} onClick={() => openModal('sync')}>
          <Plus size={16}/> Sync Google Agenda
        </button>
      </div>

      {/* ═══ QUICK STATS ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Sessions ce mois', value: totalSessions, icon: <CalendarIcon size={18}/>, color: '#00d1ff' },
          { label: 'Participants inscrits', value: totalEnrolled, icon: <Users size={18}/>, color: '#a78bfa' },
          { label: 'Live Codings', value: liveCount, icon: <Zap size={18}/>, color: '#ec4899' },
          { label: 'Taux de remplissage', value: `${Math.round((totalEnrolled / EVENTS.reduce((s, e) => s + e.spots, 0)) * 100)}%`, icon: <Trophy size={18}/>, color: '#4ade80' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: `${stat.color}15`, border: `1px solid ${stat.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>{stat.icon}</div>
            <div>
              <div className="brand-font" style={{ fontSize: '1.35rem', fontWeight: 800 }}>{stat.value}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ═══ MAIN GRID ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '1.5rem' }}>

        {/* ──── LEFT: Calendar ──── */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '20px', padding: '1.75rem', display: 'flex', flexDirection: 'column' }}>

          {/* Calendar header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button onClick={prevMonth} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', transition: '0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                <ChevronLeft size={16}/>
              </button>
              <h2 className="brand-font" style={{ fontSize: '1.15rem', minWidth: '160px', textAlign: 'center' }}>{MONTHS_FR[month]} {year}</h2>
              <button onClick={nextMonth} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', transition: '0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                <ChevronRight size={16}/>
              </button>
            </div>
            <div style={{ display: 'flex', gap: '0.35rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
              {['Mois', 'Semaine'].map(v => (
                <button key={v} onClick={() => setViewMode(v)} style={{
                  background: viewMode === v ? 'rgba(139,92,246,0.15)' : 'transparent',
                  border: viewMode === v ? '1px solid rgba(139,92,246,0.3)' : '1px solid transparent',
                  color: viewMode === v ? '#a78bfa' : 'var(--text-muted)',
                  padding: '0.45rem 1rem', borderRadius: '9px', cursor: 'pointer', transition: '0.2s', fontWeight: 600, fontSize: '0.82rem', fontFamily: 'Inter, sans-serif'
                }}>{v}</button>
              ))}
            </div>
          </div>

          {/* ── MONTH VIEW ── */}
          {viewMode === 'Mois' && (
            <>
              {/* Day headers */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '0.5rem' }}>
                {DAYS_FR.map(d => (
                  <div key={d} style={{ textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', padding: '0.5rem 0' }}>{d}</div>
                ))}
              </div>
              {/* Day cells */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', flex: 1 }}>
                {calendarDays.map((cell, i) => {
                  const key = cell.current ? dateKey(year, month, cell.day) : null;
                  const dayEvents = key ? (eventsByDate[key] || []) : [];
                  const isToday = key === todayKey;
                  const isSelected = cell.current && cell.day === selectedDay;
                  return (
                    <motion.div key={i} whileHover={{ scale: cell.current ? 1.05 : 1 }} whileTap={{ scale: cell.current ? 0.97 : 1 }}
                      onClick={() => cell.current && setSelectedDay(cell.day === selectedDay ? null : cell.day)}
                      style={{
                        position: 'relative', padding: '0.5rem', borderRadius: '12px', cursor: cell.current ? 'pointer' : 'default',
                        minHeight: '68px', transition: '0.2s',
                        background: isSelected ? 'rgba(139,92,246,0.12)' : isToday ? 'rgba(0,209,255,0.06)' : 'transparent',
                        border: isSelected ? '1px solid rgba(139,92,246,0.35)' : isToday ? '1px solid rgba(0,209,255,0.2)' : '1px solid transparent',
                      }}>
                      <div style={{
                        fontSize: '0.85rem', fontWeight: isToday || isSelected ? 800 : 500,
                        color: !cell.current ? 'rgba(255,255,255,0.15)' : isToday ? '#00d1ff' : isSelected ? '#a78bfa' : 'var(--text-main)',
                        marginBottom: '0.3rem',
                      }}>{cell.day}</div>
                      {dayEvents.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          {dayEvents.slice(0, 2).map(ev => (
                            <div key={ev.id} style={{
                              fontSize: '0.62rem', fontWeight: 600, padding: '2px 5px', borderRadius: '4px',
                              background: TYPE_CONFIG[ev.type].bg, color: TYPE_CONFIG[ev.type].color,
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer',
                              border: `1px solid ${TYPE_CONFIG[ev.type].border}`,
                            }}
                              onClick={(e) => { e.stopPropagation(); openModal('event', ev); }}>
                              {ev.title.length > 18 ? ev.title.slice(0, 18) + '…' : ev.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600, paddingLeft: '3px' }}>+{dayEvents.length - 2} de plus</div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}

          {/* ── WEEK VIEW ── */}
          {viewMode === 'Semaine' && (() => {
            const weekDays = getWeekEvents();
            return (
              <div style={{ flex: 1, overflowX: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '50px repeat(7, 1fr)', minWidth: '700px' }}>
                  {/* Header row */}
                  <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0.5rem' }}></div>
                  {weekDays.map((wd, i) => {
                    const isToday2 = wd.key === todayKey;
                    return (
                      <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0.5rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{DAYS_FR[i]}</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: isToday2 ? 800 : 600, color: isToday2 ? '#00d1ff' : 'var(--text-main)', marginTop: '0.2rem' }}>{wd.date.getDate()}</div>
                      </div>
                    );
                  })}
                  {/* Time rows */}
                  {hours.map(h => (
                    <React.Fragment key={h}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', padding: '0.75rem 0.25rem', textAlign: 'right', borderRight: '1px solid rgba(255,255,255,0.04)' }}>{pad(h)}:00</div>
                      {weekDays.map((wd, j) => {
                        const eventsAtHour = wd.events.filter(ev => {
                          const startH = parseInt(ev.time.split(':')[0]);
                          return startH === h;
                        });
                        return (
                          <div key={j} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', borderRight: '1px solid rgba(255,255,255,0.03)', padding: '2px', minHeight: '40px', position: 'relative' }}>
                            {eventsAtHour.map(ev => {
                              const cfg = TYPE_CONFIG[ev.type];
                              return (
                                <div key={ev.id} onClick={() => openModal('event', ev)}
                                  style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: '6px', padding: '3px 5px', fontSize: '0.62rem', fontWeight: 600, color: cfg.color, cursor: 'pointer', marginBottom: '2px', lineHeight: 1.3 }}>
                                  {ev.title.length > 20 ? ev.title.slice(0, 20) + '…' : ev.title}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Day detail panel */}
          <AnimatePresence>
            {selectedDay && selectedEvents.length > 0 && viewMode === 'Mois' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
                <h3 className="brand-font" style={{ fontSize: '0.95rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CalendarIcon size={16} color="#a78bfa"/>
                  {selectedDay} {MONTHS_FR[month]} — {selectedEvents.length} session{selectedEvents.length > 1 ? 's' : ''}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedEvents.map(ev => {
                    const cfg = TYPE_CONFIG[ev.type];
                    const IconComp = cfg.icon;
                    return (
                      <motion.div key={ev.id} whileHover={{ x: 4 }} onClick={() => openModal('event', ev)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: '0.2s' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: cfg.bg, border: `1px solid ${cfg.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <IconComp size={16} color={cfg.color}/>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={11}/> {ev.time} · {ev.instructor}
                          </div>
                        </div>
                        <ChevronRight size={16} color="var(--text-muted)"/>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* ──── RIGHT: Sidebar ──── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Filters */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '1.25rem' }}>
            <h3 className="brand-font" style={{ fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={14} color="#a78bfa"/> Filtres
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
                const active = activeFilters.has(key);
                return (
                  <button key={key} onClick={() => toggleFilter(key)} style={{
                    background: active ? cfg.bg : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${active ? cfg.border : 'rgba(255,255,255,0.06)'}`,
                    color: active ? cfg.color : 'var(--text-muted)',
                    padding: '0.35rem 0.75rem', borderRadius: '99px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, transition: '0.2s', fontFamily: 'Inter, sans-serif',
                    opacity: active ? 1 : 0.6,
                  }}>{cfg.label}</button>
                );
              })}
            </div>
          </div>

          {/* Upcoming */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 className="brand-font" style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={14} color="#ec4899"/> À venir
              </h3>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>{upcoming.length} sessions</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1, overflowY: 'auto' }}>
              {upcoming.length === 0 && (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>Aucune session à venir avec les filtres actuels.</div>
              )}
              {upcoming.map((ev, i) => {
                const cfg = TYPE_CONFIG[ev.type];
                const IconComp = cfg.icon;
                const d = new Date(ev.date);
                const pct = Math.round((ev.enrolled / ev.spots) * 100);
                return (
                  <motion.div key={ev.id} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                    onClick={() => openModal('event', ev)}
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '14px', cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: '0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = cfg.border; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}>
                    {/* accent line */}
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: cfg.color }}/>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.7rem' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: cfg.bg, border: `1px solid ${cfg.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <IconComp size={16} color={cfg.color}/>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.83rem', marginBottom: '0.25rem', lineHeight: 1.3 }}>{ev.title}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                          <Clock size={10}/> {d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })} · {ev.time.split(' - ')[0]}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ flex: 1, height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: cfg.color, borderRadius: '99px', transition: '0.3s' }}/>
                          </div>
                          <span style={{ fontSize: '0.65rem', color: pct >= 90 ? '#f87171' : 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                            {pct >= 90 ? 'Presque complet' : `${ev.enrolled}/${ev.spots}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Sync CTA */}
          <div style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(236,72,153,0.06))', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '16px', padding: '1.25rem', textAlign: 'center' }}>
            <CalendarIcon size={28} color="#a78bfa" style={{ marginBottom: '0.5rem' }}/>
            <h4 className="brand-font" style={{ fontSize: '0.9rem', marginBottom: '0.3rem' }}>Ne manquez rien</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: 1.5 }}>Synchronisez votre agenda pour recevoir des rappels automatiques.</p>
            <button onClick={() => openModal('sync')} style={{
              width: '100%', padding: '0.65rem', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#a78bfa', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', transition: '0.2s', fontFamily: 'Inter, sans-serif'
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.25)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.15)'; }}>
              Connecter Google Agenda
            </button>
          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default CalendarPage;
