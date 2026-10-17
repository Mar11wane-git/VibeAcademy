import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon, Clock, Video, Bell, Plus,
  CheckCircle2, ChevronLeft, ChevronRight, Users, Zap, Award,
  BookOpen, Code2, Mic, Trophy, X, ExternalLink, Filter,
  Download, Upload, Trash2, Edit3, Search, MapPin, Link2,
  Check, Sparkles, ListFilter, LayoutGrid, Rows3, CalendarCheck
} from 'lucide-react';
import api from '../services/api';
import { useApp } from '../context/AppContext';

/* ─── Initial Seed Events (used if API is unreachable on first load) ─── */
const DEFAULT_EVENTS = [
  { id: 1, title: 'Live Coding: React Hooks & Custom Patterns', date: '2026-10-05', start_time: '18:00', end_time: '19:30', type: 'live', instructor: 'Coach Alex', location: 'Google Meet Live', meeting_url: 'https://meet.google.com/vibe-react-live', spots: 45, enrolled: 38, description: 'Deep dive dans useReducer, useContext, useMemo et la création de hooks personnalisés performants.', isEnrolled: true, hasReminder: true },
  { id: 2, title: 'Workshop: Déploiement Docker & CI/CD GitHub Actions', date: '2026-10-07', start_time: '14:00', end_time: '16:00', type: 'workshop', instructor: 'Mentor Karim', location: 'Discord Stage #devops', meeting_url: 'https://discord.gg/MR1Academy', spots: 30, enrolled: 27, description: 'Apprenez à containeriser une stack React + Laravel et automatiser le pipeline CI/CD en production.', isEnrolled: false, hasReminder: false },
  { id: 3, title: 'Code Review: API RESTful Node.js & Sécurité JWT', date: '2026-10-09', start_time: '14:30', end_time: '16:00', type: 'review', instructor: 'Mentor Sarah', location: 'Zoom Pro Room 2', meeting_url: 'https://zoom.us/j/vibe-review', spots: 20, enrolled: 19, description: 'Revue de code collective du projet n°3 avec analyse de sécurité OWASP et feedback architectural.', isEnrolled: false, hasReminder: false },
  { id: 4, title: 'Session Q&A: Carrière Dev Full-Stack & Négociation', date: '2026-10-12', start_time: '19:00', end_time: '20:30', type: 'qa', instructor: 'Équipe Vibe', location: 'YouTube Live Privé', meeting_url: 'https://meet.google.com/vibe-career-qa', spots: 100, enrolled: 64, description: 'Session interactive sur le marché tech, optimisation LinkedIn/GitHub et préparation aux entretiens.', isEnrolled: false, hasReminder: false },
  { id: 5, title: 'Masterclass: Architecture TypeScript Avancée', date: '2026-10-14', start_time: '18:00', end_time: '20:00', type: 'live', instructor: 'Coach Alex', location: 'Google Meet Live', meeting_url: 'https://meet.google.com/vibe-ts-master', spots: 50, enrolled: 42, description: 'Generics avancés, Utility Types, Type Guards et intégration stricte dans un projet React 19.', isEnrolled: true, hasReminder: false },
  { id: 6, title: 'Hackathon 48h: Challenge Agents IA & SaaS (Jour 1)', date: '2026-10-16', start_time: '09:00', end_time: '18:00', type: 'hackathon', instructor: 'Tous les Mentors', location: 'Discord HQ + Twitch', meeting_url: 'https://discord.gg/MR1Academy', spots: 60, enrolled: 55, description: 'Lancement du Hackathon 48h : formez votre équipe et concevez un SaaS propulsé par des LLMs.', isEnrolled: true, hasReminder: true },
  { id: 7, title: 'Hackathon 48h: Démos & Jury Final (Jour 2)', date: '2026-10-17', start_time: '10:00', end_time: '18:00', type: 'hackathon', instructor: 'Jury MR1Academy', location: 'Discord Stage Principal', meeting_url: 'https://discord.gg/MR1Academy', spots: 60, enrolled: 56, description: 'Pitch de 5 minutes par équipe devant le jury professionnel, délibérations en direct et remise des prix.', isEnrolled: true, hasReminder: true },
  { id: 8, title: 'Workshop: Design System Figma to React', date: '2026-10-19', start_time: '15:00', end_time: '17:00', type: 'workshop', instructor: 'Designer Nora', location: 'Google Meet + Figma Live', meeting_url: 'https://meet.google.com/vibe-figma-code', spots: 25, enrolled: 21, description: 'Tokens de design, variantes accessibles et implémentation pixel-perfect avec Framer Motion.', isEnrolled: false, hasReminder: false },
  { id: 9, title: 'Live Coding: Next.js & Server Actions en Production', date: '2026-10-21', start_time: '18:00', end_time: '19:30', type: 'live', instructor: 'Coach Alex', location: 'Google Meet Live', meeting_url: 'https://meet.google.com/vibe-nextjs', spots: 45, enrolled: 33, description: 'React Server Components, Streaming SSR, Server Actions et stratégies de cache haute performance.', isEnrolled: false, hasReminder: true },
  { id: 10, title: 'Mock Interview: Algorithmes & System Design', date: '2026-10-23', start_time: '19:00', end_time: '20:30', type: 'qa', instructor: 'Mentor Karim', location: 'Zoom Pro Room 1', meeting_url: 'https://zoom.us/j/vibe-interview', spots: 40, enrolled: 28, description: 'Simulation d\'entretien technique en conditions réelles avec résolution live au tableau blanc.', isEnrolled: false, hasReminder: false },
  { id: 11, title: 'Code Review: Dashboard Analytics Full-Stack', date: '2026-10-24', start_time: '14:30', end_time: '16:00', type: 'review', instructor: 'Mentor Sarah', location: 'Google Meet Live', meeting_url: 'https://meet.google.com/vibe-review-4', spots: 20, enrolled: 18, description: 'Analyse des performances de requêtes SQL, agrégations et rendu graphique temps réel.', isEnrolled: false, hasReminder: false },
  { id: 12, title: 'Workshop: Tests E2E & Unitaires (Vitest / Playwright)', date: '2026-10-26', start_time: '14:00', end_time: '16:00', type: 'workshop', instructor: 'Coach Alex', location: 'Google Meet Live', meeting_url: 'https://meet.google.com/vibe-testing', spots: 30, enrolled: 16, description: 'Stratégie TDD, mocking d\'API et automatisation de tests E2E sur vos applications React.', isEnrolled: false, hasReminder: false },
  { id: 13, title: 'Masterclass: Clean Architecture & Principes SOLID', date: '2026-10-28', start_time: '18:00', end_time: '20:00', type: 'live', instructor: 'Mentor Karim', location: 'Google Meet Live', meeting_url: 'https://meet.google.com/vibe-clean-arch', spots: 50, enrolled: 31, description: 'Découplage métier, injection de dépendances et refactoring de code legacy.', isEnrolled: false, hasReminder: false },
  { id: 14, title: 'Cérémonie Officielle: Remise des Certificats Octobre', date: '2026-10-30', start_time: '17:00', end_time: '18:30', type: 'ceremony', instructor: 'Direction MR1Academy', location: 'Amphithéâtre Virtuel', meeting_url: 'https://meet.google.com/vibe-ceremony', spots: 200, enrolled: 156, description: 'Célébration des diplômés du mois, présentation des meilleurs projets de fin d\'études et networking.', isEnrolled: true, hasReminder: true },
];

const TYPE_CONFIG = {
  live:      { label: 'Live Coding',    color: '#00d1ff', icon: Code2,    bg: 'rgba(0,209,255,0.1)',   border: 'rgba(0,209,255,0.3)' },
  workshop:  { label: 'Workshop',       color: '#a78bfa', icon: BookOpen, bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.3)' },
  review:    { label: 'Code Review',    color: '#f59e0b', icon: Award,    bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)' },
  qa:        { label: 'Q&A / Carrière', color: '#4ade80', icon: Mic,      bg: 'rgba(74,222,128,0.1)',  border: 'rgba(74,222,128,0.3)' },
  hackathon: { label: 'Hackathon',      color: '#ec4899', icon: Trophy,   bg: 'rgba(236,72,153,0.1)',  border: 'rgba(236,72,153,0.3)' },
  study:     { label: 'Session Perso',  color: '#38bdf8', icon: Sparkles, bg: 'rgba(56,189,248,0.1)',  border: 'rgba(56,189,248,0.3)' },
  ceremony:  { label: 'Cérémonie',      color: '#fbbf24', icon: Award,    bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.3)' },
};

const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const STORAGE_KEY = 'vibe_agenda_events_v2';

/* ─── Real Calendar Helpers & RFC 5545 iCalendar (.ics) Engine ─── */
const pad = n => String(n).padStart(2, '0');
const dateKey = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

function safeDateString(rawDate) {
  if (!rawDate) return '2026-10-17';
  const str = String(rawDate).trim().slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const parsed = new Date(rawDate);
  if (!isNaN(parsed.getTime())) {
    return dateKey(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  }
  return '2026-10-17';
}

function safeFormatDate(rawDate, options = { weekday: 'short', day: 'numeric', month: 'short' }) {
  const clean = safeDateString(rawDate);
  const [y, m, d] = clean.split('-').map(Number);
  const dt = new Date(y || 2026, (m || 10) - 1, d || 17);
  if (isNaN(dt.getTime())) return clean;
  return dt.toLocaleDateString('fr-FR', options);
}

function formatMeetingUrl(url) {
  const raw = String(url || '').trim();
  if (!raw) return 'https://meet.google.com/vibe-live';
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

function normalizeEvent(ev) {
  if (!ev || typeof ev !== 'object') return normalizeEvent(DEFAULT_EVENTS[0]);
  const start = ev.start_time || (ev.time ? String(ev.time).split(' - ')[0] : '18:00') || '18:00';
  const end = ev.end_time || (ev.time && String(ev.time).includes(' - ') ? String(ev.time).split(' - ')[1] : '19:30') || '19:30';
  return {
    ...ev,
    id: ev.id ?? Date.now(),
    title: ev.title || 'Session MR1Academy',
    date: safeDateString(ev.date),
    start_time: start,
    end_time: end,
    time: `${start} - ${end}`,
    type: TYPE_CONFIG[ev.type] ? ev.type : 'live',
    instructor: ev.instructor || 'Coach Alex',
    location: ev.location || 'Google Meet Live',
    meeting_url: formatMeetingUrl(ev.meeting_url),
    spots: Math.max(1, Number(ev.spots) || 50),
    enrolled: Math.max(0, Number(ev.enrolled) || 1),
    description: ev.description || '',
    isEnrolled: Boolean(ev.isEnrolled),
    hasReminder: Boolean(ev.hasReminder),
  };
}

function toICSDateTime(dateStr, timeStr = '18:00') {
  const clean = safeDateString(dateStr);
  const [y, m, d] = clean.split('-').map(Number);
  const [hh, mm] = String(timeStr || '18:00').split(':').map(Number);
  return `${y || 2026}${pad(m || 10)}${pad(d || 17)}T${pad(hh || 18)}${pad(mm || 0)}00`;
}

function buildICSContent(eventsList) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MR1Academy//Pro Agenda Engine v2.0//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:MR1Academy Agenda',
    'X-WR-TIMEZONE:Europe/Paris',
  ];

  eventsList.forEach(ev => {
    const dtStart = toICSDateTime(ev.date, ev.start_time);
    const dtEnd = toICSDateTime(ev.date, ev.end_time);
    const uid = `vibe-event-${ev.id}-${ev.date}@MR1Academy.io`;
    const cleanDesc = (ev.description || '').replace(/\r?\n/g, '\\n');
    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${toICSDateTime('2026-10-17', '00:00')}Z`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${ev.title}`,
      `DESCRIPTION:${cleanDesc} — Intervenant: ${ev.instructor} — Lien: ${ev.meeting_url || ''}`,
      `LOCATION:${ev.location || 'MR1Academy Online'}`,
      ev.meeting_url ? `URL:${ev.meeting_url}` : 'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-PT15M',
      'ACTION:DISPLAY',
      `DESCRIPTION:Rappel MR1Academy: ${ev.title} dans 15 minutes`,
      'END:VALARM',
      'END:VEVENT'
    );
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

function downloadICSFile(eventsList, filename = 'MR1Academy-agenda.ics') {
  const ics = buildICSContent(eventsList);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function parseICSFile(icsText) {
  const blocks = icsText.split('BEGIN:VEVENT').slice(1);
  return blocks.map((block, idx) => {
    const getField = (name) => {
      const match = block.match(new RegExp(`^${name}(?:;[^:]*)?:(.*)$`, 'm'));
      return match ? match[1].trim() : '';
    };
    const summary = getField('SUMMARY') || `Événement importé #${idx + 1}`;
    const dtStartRaw = getField('DTSTART');
    const dtEndRaw = getField('DTEND');
    const location = getField('LOCATION') || 'Importé (.ics)';
    const description = getField('DESCRIPTION').replace(/\\n/g, '\n') || 'Événement importé depuis un fichier iCalendar (.ics).';

    let date = '2026-10-20';
    let start_time = '18:00';
    let end_time = '19:00';

    if (dtStartRaw && dtStartRaw.length >= 8) {
      date = `${dtStartRaw.slice(0, 4)}-${dtStartRaw.slice(4, 6)}-${dtStartRaw.slice(6, 8)}`;
      if (dtStartRaw.includes('T') && dtStartRaw.length >= 13) {
        start_time = `${dtStartRaw.slice(9, 11)}:${dtStartRaw.slice(11, 13)}`;
      }
    }
    if (dtEndRaw && dtEndRaw.includes('T') && dtEndRaw.length >= 13) {
      end_time = `${dtEndRaw.slice(9, 11)}:${dtEndRaw.slice(11, 13)}`;
    }

    return normalizeEvent({
      id: Date.now() + idx,
      title: summary,
      date,
      start_time,
      end_time,
      type: 'study',
      instructor: 'Agenda Externe',
      location,
      meeting_url: 'https://meet.google.com',
      spots: 50,
      enrolled: 1,
      description,
      isEnrolled: true,
      hasReminder: true,
    });
  });
}

function buildGoogleCalendarUrl(ev) {
  const start = toICSDateTime(ev.date, ev.start_time);
  const end = toICSDateTime(ev.date, ev.end_time);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `[MR1Academy] ${ev.title}`,
    dates: `${start}/${end}`,
    details: `${ev.description || ''}\n\nIntervenant: ${ev.instructor}\nLien direct: ${ev.meeting_url || ''}`,
    location: ev.location || 'Google Meet Live',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function buildOutlookCalendarUrl(ev) {
  const startIso = `${ev.date}T${ev.start_time || '18:00'}:00`;
  const endIso = `${ev.date}T${ev.end_time || '19:30'}:00`;
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: `[MR1Academy] ${ev.title}`,
    startdt: startIso,
    enddt: endIso,
    body: `${ev.description || ''} — Intervenant: ${ev.instructor} (${ev.meeting_url || ''})`,
    location: ev.location || 'MR1Academy Online',
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

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

const EMPTY_FORM = {
  title: '',
  date: '2026-10-17',
  start_time: '18:00',
  end_time: '19:30',
  type: 'live',
  instructor: '',
  location: 'Google Meet Live',
  meeting_url: 'https://meet.google.com/vibe-live',
  spots: 40,
  description: '',
};

const CalendarPage = () => {
  const { user } = useApp();
  const fileInputRef = useRef(null);

  const [events, setEvents] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.map(normalizeEvent);
      }
    } catch { /* fallback */ }
    return DEFAULT_EVENTS.map(normalizeEvent);
  });

  const [apiSynced, setApiSynced] = useState(false);
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(9); // October (0-indexed)
  const [viewMode, setViewMode] = useState('Mois'); // 'Mois' | 'Semaine' | 'Planning'
  const [scopeTab, setScopeTab] = useState('all'); // 'all' | 'enrolled' | 'reminders'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDay, setSelectedDay] = useState(17);
  const [activeFilters, setActiveFilters] = useState(new Set(Object.keys(TYPE_CONFIG)));
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, type: '', data: null });
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [draggedEventId, setDraggedEventId] = useState(null);
  const [dragOverDay, setDragOverDay] = useState(null);

  /* ─── Sync with Backend API + Merge with LocalStorage ─── */
  useEffect(() => {
    api.get('/agenda/events')
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          const remoteNormalized = res.data.map(normalizeEvent);
          setEvents(prev => {
            const remoteIds = new Set(remoteNormalized.map(r => String(r.id)));
            const remoteTitlesDates = new Set(remoteNormalized.map(r => `${r.title}__${r.date}`));
            // Keep any locally created events (e.g., Mentorat bookings or offline sessions) not yet on backend
            const customLocal = prev.filter(
              loc => Number(loc.id) > 1000000000 && !remoteIds.has(String(loc.id)) && !remoteTitlesDates.has(`${loc.title}__${loc.date}`)
            );
            const merged = [...remoteNormalized, ...customLocal];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
            return merged;
          });
          setApiSynced(true);
        }
      })
      .catch(() => {
        // Offline / local mode fallback
        setApiSynced(false);
      });
  }, []);

  const persistEvents = (updater) => {
    setEvents(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const openModal = (type, data = null) => setModal({ isOpen: true, type, data });
  const closeModal = () => {
    setModal({ isOpen: false, type: '', data: null });
    setEditingId(null);
  };

  /* ─── Open Create / Edit Form Modal ─── */
  const openCreateModal = (prefillDate = null) => {
    const defaultDate = prefillDate || (selectedDay ? dateKey(year, month, selectedDay) : dateKey(year, month, 17));
    setEditingId(null);
    setFormData({
      ...EMPTY_FORM,
      date: defaultDate,
      instructor: user?.name || 'Coach Alex',
    });
    setModal({ isOpen: true, type: 'form', data: null });
  };

  const openEditModal = (ev) => {
    setEditingId(ev.id);
    setFormData({
      title: ev.title || '',
      date: safeDateString(ev.date),
      start_time: ev.start_time || '18:00',
      end_time: ev.end_time || '19:30',
      type: ev.type || 'live',
      instructor: ev.instructor || '',
      location: ev.location || 'Google Meet Live',
      meeting_url: ev.meeting_url || 'https://meet.google.com/vibe-live',
      spots: ev.spots || 40,
      description: ev.description || '',
    });
    setModal({ isOpen: true, type: 'form', data: ev });
  };

  /* ─── Save (Create or Update) Event ─── */
  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const cleanDate = safeDateString(formData.date);
    const [targetY, targetM, targetD] = cleanDate.split('-').map(Number);
    if (targetY && targetM && targetD) {
      setYear(targetY);
      setMonth(targetM - 1);
      setSelectedDay(targetD);
    }

    const payload = {
      ...formData,
      date: cleanDate,
      meeting_url: formatMeetingUrl(formData.meeting_url),
    };

    if (editingId) {
      const updatedLocal = normalizeEvent({
        ...events.find(ev => ev.id === editingId),
        ...payload,
        id: editingId,
      });
      persistEvents(prev => prev.map(ev => ev.id === editingId ? updatedLocal : ev));
      try {
        const res = await api.put(`/agenda/events/${editingId}`, payload);
        if (res.data) {
          persistEvents(prev => prev.map(ev => ev.id === editingId ? normalizeEvent(res.data) : ev));
        }
      } catch { /* saved locally */ }
      closeModal();
      showToast(`Session "${formData.title}" mise à jour !`);
    } else {
      const tempId = Date.now();
      const newLocal = normalizeEvent({
        ...payload,
        id: tempId,
        enrolled: 1,
        isEnrolled: true,
        hasReminder: true,
      });
      persistEvents(prev => [...prev, newLocal]);
      try {
        const res = await api.post('/agenda/events', payload);
        if (res.data) {
          persistEvents(prev => prev.map(ev => ev.id === tempId ? normalizeEvent(res.data) : ev));
        }
      } catch { /* saved locally */ }
      closeModal();
      showToast(`Session "${formData.title}" ajoutée à l'agenda !`);
    }
  };

  /* ─── Delete Event ─── */
  const handleDeleteEvent = async (ev) => {
    persistEvents(prev => prev.filter(item => item.id !== ev.id));
    try {
      await api.delete(`/agenda/events/${ev.id}`);
    } catch { /* deleted locally */ }
    closeModal();
    showToast(`Session "${ev.title}" supprimée.`);
  };

  /* ─── Toggle Enrollment ─── */
  const handleToggleEnroll = async (ev, e) => {
    if (e) e.stopPropagation();
    const willEnroll = !ev.isEnrolled;
    if (willEnroll && ev.enrolled >= ev.spots) {
      showToast('Cette session est déjà complète.');
      return;
    }

    const updated = {
      ...ev,
      isEnrolled: willEnroll,
      enrolled: willEnroll ? ev.enrolled + 1 : Math.max(0, ev.enrolled - 1),
    };
    persistEvents(prev => prev.map(item => item.id === ev.id ? updated : item));
    if (modal.isOpen && modal.data?.id === ev.id) {
      setModal(m => ({ ...m, data: updated }));
    }

    try {
      await api.post(`/agenda/events/${ev.id}/toggle-enroll`);
    } catch { /* local state already updated */ }

    showToast(willEnroll ? `Inscrit à "${ev.title}" ✓` : `Désinscrit de "${ev.title}"`);
  };

  /* ─── Toggle Reminder + Real Web Notification API ─── */
  const handleToggleReminder = async (ev, e) => {
    if (e) e.stopPropagation();
    const willRemind = !ev.hasReminder;
    const updated = { ...ev, hasReminder: willRemind };

    persistEvents(prev => prev.map(item => item.id === ev.id ? updated : item));
    if (modal.isOpen && modal.data?.id === ev.id) {
      setModal(m => ({ ...m, data: updated }));
    }

    if (willRemind && 'Notification' in window) {
      try {
        let perm = Notification.permission;
        if (perm === 'default') {
          perm = await Notification.requestPermission();
        }
        if (perm === 'granted') {
          new Notification('Rappel MR1Academy Activé 🔔', {
            body: `${ev.title} — ${ev.date} à ${ev.start_time} (${ev.instructor})`,
          });
        }
      } catch { /* ignore notification errors */ }
    }

    try {
      await api.post(`/agenda/events/${ev.id}/toggle-reminder`);
    } catch { /* persisted locally */ }

    showToast(willRemind ? `Rappel intelligent activé pour "${ev.title}" 🔔` : `Rappel désactivé pour "${ev.title}"`);
  };

  /* ─── Drag & Drop Rescheduling on Month Grid ─── */
  const handleDropOnDay = async (dayNumber) => {
    setDragOverDay(null);
    if (!draggedEventId || !dayNumber) return;
    const newDate = dateKey(year, month, dayNumber);
    const targetEv = events.find(ev => ev.id === draggedEventId);
    setDraggedEventId(null);
    if (!targetEv || targetEv.date === newDate) return;

    const updated = { ...targetEv, date: newDate };
    persistEvents(prev => prev.map(ev => ev.id === updated.id ? updated : ev));
    setSelectedDay(dayNumber);
    showToast(`"${targetEv.title}" déplacé au ${dayNumber} ${MONTHS_FR[month]}`);

    try {
      await api.put(`/agenda/events/${targetEv.id}`, { date: newDate });
    } catch { /* saved locally */ }
  };

  /* ─── Import .ics File ─── */
  const handleImportICS = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const imported = parseICSFile(String(evt.target?.result || ''));
        if (imported.length === 0) {
          showToast('Aucun événement VEVENT trouvé dans ce fichier .ics');
          return;
        }
        persistEvents(prev => [...prev, ...imported]);
        closeModal();
        showToast(`${imported.length} session(s) importée(s) depuis ${file.name} !`);
      } catch {
        showToast('Erreur lors de la lecture du fichier .ics');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const toggleFilter = (key) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  /* ─── Filtered Events ─── */
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      if (!activeFilters.has(e.type)) return false;
      if (scopeTab === 'enrolled' && !e.isEnrolled) return false;
      if (scopeTab === 'reminders' && !e.hasReminder) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = e.title.toLowerCase().includes(q);
        const matchInstructor = (e.instructor || '').toLowerCase().includes(q);
        const matchDesc = (e.description || '').toLowerCase().includes(q);
        if (!matchTitle && !matchInstructor && !matchDesc) return false;
      }
      return true;
    });
  }, [events, activeFilters, scopeTab, searchQuery]);

  const eventsByDate = useMemo(() => {
    const map = {};
    filteredEvents.forEach(ev => {
      (map[ev.date] ||= []).push(ev);
    });
    Object.values(map).forEach(list => list.sort((a, b) => (a.start_time || '').localeCompare(b.start_time || '')));
    return map;
  }, [filteredEvents]);

  const calendarDays = useMemo(() => getCalendarDays(year, month), [year, month]);

  const today = new Date();
  const todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate());
  const selectedKey = selectedDay ? dateKey(year, month, selectedDay) : null;
  const selectedEvents = selectedKey ? (eventsByDate[selectedKey] || []) : [];

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  };
  const goToToday = () => {
    // Check if current browser month has events; otherwise jump to October 2026 where main live schedule lives, or toggle between them
    const currentY = today.getFullYear();
    const currentM = today.getMonth();
    if (year === currentY && month === currentM) {
      setYear(2026);
      setMonth(9);
      setSelectedDay(17);
      showToast('Affichage du planning principal (Octobre 2026)');
    } else {
      setYear(currentY);
      setMonth(currentM);
      setSelectedDay(today.getDate());
    }
  };

  /* Upcoming events */
  const upcoming = useMemo(() => {
    const refKey = selectedKey || dateKey(year, month, 1);
    const future = filteredEvents
      .filter(e => e.date >= refKey)
      .sort((a, b) => a.date.localeCompare(b.date) || (a.start_time || '').localeCompare(b.start_time || ''));
    if (future.length > 0) return future.slice(0, 6);
    return filteredEvents
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date) || (a.start_time || '').localeCompare(b.start_time || ''))
      .slice(0, 6);
  }, [filteredEvents, selectedKey, year, month]);

  /* Stats */
  const myEnrolledCount = events.filter(e => e.isEnrolled).length;
  const myRemindersCount = events.filter(e => e.hasReminder).length;
  const totalEnrolled = events.reduce((s, e) => s + (Number(e.enrolled) || 0), 0);
  const totalSpots = events.reduce((s, e) => s + (Number(e.spots) || 1), 0);

  /* Week view helpers */
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

  const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 08:00 - 20:00

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-view">
      {/* Hidden .ics file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".ics,text/calendar"
        style={{ display: 'none' }}
        onChange={handleImportICS}
      />

      {/* ═══ TOAST ═══ */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            style={{
              position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999,
              background: 'rgba(15, 23, 42, 0.92)', border: '1px solid rgba(74,222,128,0.45)',
              color: '#4ade80', padding: '1rem 1.5rem', borderRadius: '14px', fontWeight: 700,
              backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', gap: '0.6rem',
              fontSize: '0.9rem', boxShadow: '0 15px 35px rgba(0,0,0,0.5)'
            }}
          >
            <CheckCircle2 size={18} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ MODALS (Event Detail, Create/Edit Form, Calendar Sync/Export) ═══ */}
      <AnimatePresence>
        {modal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)',
              backdropFilter: 'blur(12px)', zIndex: 3000, display: 'flex',
              alignItems: 'center', justifyContent: 'center', padding: '1rem'
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
                padding: '2.25rem', width: '100%', maxWidth: modal.type === 'form' ? '560px' : '500px',
                borderRadius: '24px', position: 'relative', maxHeight: '90vh', overflowY: 'auto'
              }}
            >
              <button
                onClick={closeModal}
                style={{
                  position: 'absolute', top: '1.25rem', right: '1.25rem',
                  background: 'rgba(255,255,255,0.06)', border: 'none', color: 'var(--text-muted)',
                  width: '34px', height: '34px', borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>

              {/* ── 1. SYNC & EXPORT / IMPORT .ICS MODAL ── */}
              {modal.type === 'sync' && (
                <>
                  <div style={{
                    width: '60px', height: '60px', borderRadius: '18px',
                    background: 'rgba(0,209,255,0.1)', border: '1px solid rgba(0,209,255,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem'
                  }}>
                    <CalendarIcon size={28} color="#00d1ff" />
                  </div>
                  <h2 className="brand-font" style={{ marginBottom: '0.4rem', fontSize: '1.4rem' }}>
                    Synchronisation & Standard iCalendar (.ics)
                  </h2>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.6, fontSize: '0.9rem' }}>
                    Exportez vos sessions au format universel <strong>RFC 5545 (.ics)</strong> compatible avec Google Calendar, Apple Calendar, Outlook et Thunderbird, ou importez un planning externe.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <button
                      onClick={() => {
                        downloadICSFile(filteredEvents, 'MR1Academy-planning-complet.ics');
                        showToast(`${filteredEvents.length} sessions exportées en .ics !`);
                      }}
                      className="btn-pro btn-pro-primary"
                      style={{ width: '100%', justifyContent: 'center', padding: '0.9rem' }}
                    >
                      <Download size={16} /> Télécharger tout l'agenda (.ics)
                    </button>

                    <button
                      onClick={() => {
                        const myEvs = events.filter(e => e.isEnrolled);
                        downloadICSFile(myEvs.length ? myEvs : filteredEvents, 'mes-sessions-MR1Academy.ics');
                        showToast('Vos sessions inscrites ont été exportées (.ics) !');
                      }}
                      style={{
                        width: '100%', padding: '0.85rem', background: 'rgba(139,92,246,0.12)',
                        border: '1px solid rgba(139,92,246,0.35)', color: '#c4b5fd', borderRadius: '12px',
                        cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: '0.6rem', fontSize: '0.9rem'
                      }}
                    >
                      <CalendarCheck size={16} /> Exporter uniquement mes inscriptions ({myEnrolledCount})
                    </button>

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        width: '100%', padding: '0.85rem', background: 'rgba(255,255,255,0.04)',
                        border: '1px solid var(--glass-border)', color: 'var(--text-main)', borderRadius: '12px',
                        cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: '0.6rem', fontSize: '0.9rem'
                      }}
                    >
                      <Upload size={16} color="#00d1ff" /> Importer un fichier iCalendar (.ics)
                    </button>
                  </div>

                  <button
                    onClick={closeModal}
                    style={{
                      width: '100%', padding: '0.75rem', background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)',
                      borderRadius: '12px', cursor: 'pointer', fontWeight: 500, fontSize: '0.85rem'
                    }}
                  >
                    Fermer
                  </button>
                </>
              )}

              {/* ── 2. CREATE / EDIT EVENT FORM MODAL ── */}
              {modal.type === 'form' && (
                <form onSubmit={handleSaveEvent}>
                  <h2 className="brand-font" style={{ marginBottom: '0.35rem', fontSize: '1.35rem' }}>
                    {editingId ? 'Modifier la session' : 'Planifier une nouvelle session'}
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                    Configurez les horaires, le lien visio et la capacité de votre événement.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                        Titre de la session *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Live Coding: Architecture Microservices"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        style={{
                          width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
                          background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)',
                          color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none'
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                          Catégorie
                        </label>
                        <select
                          value={formData.type}
                          onChange={e => setFormData({ ...formData, type: e.target.value })}
                          style={{
                            width: '100%', padding: '0.75rem 0.9rem', borderRadius: '12px',
                            background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)',
                            color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none'
                          }}
                        >
                          {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                            <option key={key} value={key} style={{ background: '#0f0f1a', color: '#fff' }}>
                              {cfg.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                          Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.date}
                          onChange={e => setFormData({ ...formData, date: e.target.value })}
                          style={{
                            width: '100%', padding: '0.72rem 0.9rem', borderRadius: '12px',
                            background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)',
                            color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                          Début
                        </label>
                        <input
                          type="time"
                          required
                          value={formData.start_time}
                          onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                          style={{
                            width: '100%', padding: '0.72rem 0.8rem', borderRadius: '12px',
                            background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)',
                            color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                          Fin
                        </label>
                        <input
                          type="time"
                          required
                          value={formData.end_time}
                          onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                          style={{
                            width: '100%', padding: '0.72rem 0.8rem', borderRadius: '12px',
                            background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)',
                            color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                          Places max
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="1000"
                          value={formData.spots}
                          onChange={e => setFormData({ ...formData, spots: Number(e.target.value) })}
                          style={{
                            width: '100%', padding: '0.72rem 0.8rem', borderRadius: '12px',
                            background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)',
                            color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                          Intervenant / Mentor
                        </label>
                        <input
                          type="text"
                          placeholder="Coach Alex"
                          value={formData.instructor}
                          onChange={e => setFormData({ ...formData, instructor: e.target.value })}
                          style={{
                            width: '100%', padding: '0.72rem 0.9rem', borderRadius: '12px',
                            background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)',
                            color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                          Plateforme / Salle
                        </label>
                        <input
                          type="text"
                          placeholder="Google Meet / Discord"
                          value={formData.location}
                          onChange={e => setFormData({ ...formData, location: e.target.value })}
                          style={{
                            width: '100%', padding: '0.72rem 0.9rem', borderRadius: '12px',
                            background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)',
                            color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none'
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                        Lien de visioconférence (Google Meet, Zoom, Discord)
                      </label>
                      <input
                        type="text"
                        placeholder="https://meet.google.com/..."
                        value={formData.meeting_url}
                        onChange={e => setFormData({ ...formData, meeting_url: e.target.value })}
                        style={{
                          width: '100%', padding: '0.72rem 0.9rem', borderRadius: '12px',
                          background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)',
                          color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                        Programme & Description
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Détaillez les sujets abordés et les prérequis..."
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        style={{
                          width: '100%', padding: '0.75rem 0.9rem', borderRadius: '12px',
                          background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)',
                          color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none', resize: 'vertical',
                          fontFamily: 'inherit'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                    <button type="submit" className="btn-pro btn-pro-primary" style={{ flex: 1, justifyContent: 'center', padding: '0.85rem' }}>
                      <Check size={16} /> {editingId ? 'Enregistrer les modifications' : 'Créer la session'}
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      style={{
                        padding: '0.85rem 1.25rem', background: 'transparent',
                        border: '1px solid var(--glass-border)', color: 'var(--text-muted)',
                        borderRadius: '12px', cursor: 'pointer', fontWeight: 600
                      }}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              )}

              {/* ── 3. EVENT DETAIL MODAL ── */}
              {modal.type === 'event' && modal.data && (() => {
                const ev = modal.data;
                const cfg = TYPE_CONFIG[ev.type] || TYPE_CONFIG.live;
                const IconComp = cfg.icon;
                const pct = Math.min(100, Math.round((ev.enrolled / Math.max(1, ev.spots)) * 100));
                return (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingRight: '2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '46px', height: '46px', borderRadius: '14px',
                          background: cfg.bg, border: `1px solid ${cfg.border}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <IconComp size={22} color={cfg.color} />
                        </div>
                        <span style={{
                          background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
                          padding: '0.3rem 0.85rem', borderRadius: '99px', fontSize: '0.75rem',
                          fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase'
                        }}>
                          {cfg.label}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => openEditModal(ev)}
                          title="Modifier cette session"
                          style={{
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            color: 'var(--text-main)', width: '34px', height: '34px', borderRadius: '10px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                          }}
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(ev)}
                          title="Supprimer cette session"
                          style={{
                            background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)',
                            color: '#f87171', width: '34px', height: '34px', borderRadius: '10px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <h2 className="brand-font" style={{ marginBottom: '0.5rem', fontSize: '1.35rem', lineHeight: 1.3 }}>
                      {ev.title}
                    </h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.6, fontSize: '0.9rem' }}>
                      {ev.description}
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '1.25rem' }}>
                      {[
                        { icon: <CalendarIcon size={14} color={cfg.color} />, text: safeFormatDate(ev.date, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }) },
                        { icon: <Clock size={14} color={cfg.color} />, text: `${ev.start_time} - ${ev.end_time}` },
                        { icon: <Video size={14} color={cfg.color} />, text: ev.instructor },
                        { icon: <MapPin size={14} color={cfg.color} />, text: ev.location || 'Google Meet Live' },
                      ].map((item, i) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem',
                          color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)',
                          padding: '0.6rem 0.75rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                          {item.icon} <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.text}</span>
                        </div>
                      ))}
                    </div>

                    {/* Capacity bar */}
                    <div style={{ marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <span>Places réservées ({ev.enrolled}/{ev.spots})</span>
                        <span style={{ color: pct >= 90 ? '#f87171' : cfg.color, fontWeight: 700 }}>{pct}%</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          style={{
                            height: '100%', borderRadius: '99px',
                            background: pct >= 90 ? 'linear-gradient(90deg, #f59e0b, #f87171)' : `linear-gradient(90deg, ${cfg.color}, ${cfg.color}88)`
                          }}
                        />
                      </div>
                    </div>

                    {/* Primary Actions: Enroll + Reminder + Join Live */}
                    <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '1rem' }}>
                      <button
                        onClick={(e) => handleToggleEnroll(ev, e)}
                        className="btn-pro btn-pro-primary"
                        style={{
                          flex: 1, justifyContent: 'center', padding: '0.85rem',
                          background: ev.isEnrolled ? 'rgba(74,222,128,0.18)' : undefined,
                          border: ev.isEnrolled ? '1px solid rgba(74,222,128,0.45)' : undefined,
                          color: ev.isEnrolled ? '#4ade80' : '#fff',
                        }}
                      >
                        {ev.isEnrolled ? <><CheckCircle2 size={16} /> Inscrit (Annuler)</> : <><Zap size={16} /> Réserver ma place</>}
                      </button>

                      {ev.meeting_url && (
                        <a
                          href={ev.meeting_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: '0 1rem', background: 'rgba(0,209,255,0.12)',
                            border: '1px solid rgba(0,209,255,0.35)', color: '#00d1ff',
                            borderRadius: '12px', display: 'flex', alignItems: 'center',
                            gap: '0.4rem', textDecoration: 'none', fontWeight: 700, fontSize: '0.82rem'
                          }}
                        >
                          <Link2 size={15} /> Rejoindre
                        </a>
                      )}

                      <button
                        onClick={(e) => handleToggleReminder(ev, e)}
                        title="Activer le rappel navigateur"
                        style={{
                          width: '46px', background: ev.hasReminder ? 'rgba(245,158,11,0.18)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${ev.hasReminder ? 'rgba(245,158,11,0.4)' : 'var(--glass-border)'}`,
                          borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', color: ev.hasReminder ? '#f59e0b' : 'var(--text-muted)'
                        }}
                      >
                        <Bell size={18} />
                      </button>
                    </div>

                    {/* External Calendar Deep Links (Google, Outlook, .ics) */}
                    <div style={{
                      borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem',
                      display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem'
                    }}>
                      <a
                        href={buildGoogleCalendarUrl(ev)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '0.55rem', borderRadius: '10px', background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.07)', color: 'var(--text-main)',
                          textDecoration: 'none', fontSize: '0.75rem', fontWeight: 600,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem'
                        }}
                      >
                        <ExternalLink size={12} color="#00d1ff" /> Google Cal
                      </a>
                      <a
                        href={buildOutlookCalendarUrl(ev)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '0.55rem', borderRadius: '10px', background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.07)', color: 'var(--text-main)',
                          textDecoration: 'none', fontSize: '0.75rem', fontWeight: 600,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem'
                        }}
                      >
                        <ExternalLink size={12} color="#a78bfa" /> Outlook
                      </a>
                      <button
                        onClick={() => {
                          downloadICSFile([ev], `vibe-${ev.id}.ics`);
                          showToast('Fichier .ics téléchargé !');
                        }}
                        style={{
                          padding: '0.55rem', borderRadius: '10px', background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.07)', color: 'var(--text-main)',
                          fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem'
                        }}
                      >
                        <Download size={12} color="#4ade80" /> Fichier .ics
                      </button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ PAGE HEADER ═══ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
            <h1 className="page-title brand-font text-gradient-animated" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <CalendarIcon size={28} /> Agenda Pro & Sessions Live
            </h1>
            <span style={{
              fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: '99px',
              background: apiSynced ? 'rgba(74,222,128,0.12)' : 'rgba(0,209,255,0.12)',
              border: `1px solid ${apiSynced ? 'rgba(74,222,128,0.3)' : 'rgba(0,209,255,0.3)'}`,
              color: apiSynced ? '#4ade80' : '#00d1ff'
            }}>
              {apiSynced ? '● Sync Cloud + .ICS' : '● Sync Local + .ICS'}
            </span>
          </div>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Planifiez vos sessions, glissez-déposez vos événements et synchronisez avec Google Calendar, Outlook ou iCalendar (.ics).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => openModal('sync')}
            style={{
              padding: '0.75rem 1.15rem', borderRadius: '10px', background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--glass-border)', color: 'var(--text-main)', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}
          >
            <Download size={16} color="#00d1ff" /> Sync / .ICS
          </button>
          <button
            className="btn-pro btn-pro-primary"
            style={{ gap: '0.5rem' }}
            onClick={() => openCreateModal()}
          >
            <Plus size={16} /> Nouvelle Session
          </button>
        </div>
      </div>

      {/* ═══ QUICK STATS ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(185px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Sessions planifiées', value: events.length, icon: <CalendarIcon size={18} />, color: '#00d1ff' },
          { label: 'Mes inscriptions', value: myEnrolledCount, icon: <CalendarCheck size={18} />, color: '#4ade80' },
          { label: 'Rappels actifs', value: myRemindersCount, icon: <Bell size={18} />, color: '#f59e0b' },
          { label: 'Taux d\'occupation', value: `${Math.round((totalEnrolled / Math.max(1, totalSpots)) * 100)}%`, icon: <Users size={18} />, color: '#a78bfa' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{
              background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
              borderRadius: '16px', padding: '1.1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem'
            }}
          >
            <div style={{
              width: '42px', height: '42px', borderRadius: '12px',
              background: `${stat.color}15`, border: `1px solid ${stat.color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color
            }}>
              {stat.icon}
            </div>
            <div>
              <div className="brand-font" style={{ fontSize: '1.35rem', fontWeight: 800 }}>{stat.value}</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 500 }}>{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ═══ TOOLBAR: SEARCH + SCOPE TABS ═══ */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap',
        background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
        padding: '0.75rem 1rem', borderRadius: '16px'
      }}>
        {/* Scope Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: `Toutes (${events.length})` },
            { id: 'enrolled', label: `Mes Inscriptions (${myEnrolledCount})` },
            { id: 'reminders', label: `Mes Rappels (${myRemindersCount})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setScopeTab(tab.id)}
              style={{
                padding: '0.45rem 0.95rem', borderRadius: '10px', cursor: 'pointer',
                fontSize: '0.8rem', fontWeight: 600, transition: '0.2s',
                background: scopeTab === tab.id ? 'rgba(139,92,246,0.18)' : 'transparent',
                border: scopeTab === tab.id ? '1px solid rgba(139,92,246,0.4)' : '1px solid transparent',
                color: scopeTab === tab.id ? '#c4b5fd' : 'var(--text-muted)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)',
          borderRadius: '10px', padding: '0.45rem 0.85rem', minWidth: '240px', flex: '0 1 300px'
        }}>
          <Search size={15} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Rechercher une session, mentor..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text-main)', fontSize: '0.83rem', width: '100%'
            }}
          />
          {searchQuery && (
            <X size={14} color="var(--text-muted)" style={{ cursor: 'pointer' }} onClick={() => setSearchQuery('')} />
          )}
        </div>
      </div>

      {/* ═══ MAIN GRID ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 330px', gap: '1.5rem', alignItems: 'start', width: '100%' }}>

        {/* ──── LEFT: Calendar Container ──── */}
        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
          borderRadius: '20px', padding: '1.5rem', display: 'flex', flexDirection: 'column',
          minWidth: 0, width: '100%', overflow: 'hidden', boxSizing: 'border-box'
        }}>

          {/* Calendar Navigation Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <button
                onClick={prevMonth}
                style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  width: '34px', height: '34px', borderRadius: '10px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-main)'
                }}
              >
                <ChevronLeft size={16} />
              </button>
              <h2 className="brand-font" style={{ fontSize: '1.15rem', minWidth: '155px', textAlign: 'center', margin: 0 }}>
                {MONTHS_FR[month]} {year}
              </h2>
              <button
                onClick={nextMonth}
                style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  width: '34px', height: '34px', borderRadius: '10px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-main)'
                }}
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={goToToday}
                style={{
                  marginLeft: '0.25rem', padding: '0.4rem 0.75rem', borderRadius: '8px',
                  background: 'rgba(0,209,255,0.08)', border: '1px solid rgba(0,209,255,0.25)',
                  color: '#00d1ff', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
                }}
              >
                Aujourd'hui
              </button>
            </div>

            {/* View Switcher: Mois | Semaine | Planning */}
            <div style={{
              display: 'flex', gap: '0.3rem', background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px', padding: '4px', border: '1px solid rgba(255,255,255,0.06)'
            }}>
              {[
                { id: 'Mois', icon: <LayoutGrid size={13} /> },
                { id: 'Semaine', icon: <Rows3 size={13} /> },
                { id: 'Planning', icon: <ListFilter size={13} /> },
              ].map(v => (
                <button
                  key={v.id}
                  onClick={() => setViewMode(v.id)}
                  style={{
                    background: viewMode === v.id ? 'rgba(139,92,246,0.18)' : 'transparent',
                    border: viewMode === v.id ? '1px solid rgba(139,92,246,0.35)' : '1px solid transparent',
                    color: viewMode === v.id ? '#c4b5fd' : 'var(--text-muted)',
                    padding: '0.4rem 0.85rem', borderRadius: '9px', cursor: 'pointer',
                    fontWeight: 600, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem'
                  }}
                >
                  {v.icon} {v.id}
                </button>
              ))}
            </div>
          </div>

          {/* ── 1. MONTH VIEW (Strictly aligned 7 equal columns, zero overflow) ── */}
          {viewMode === 'Mois' && (
            <div style={{ width: '100%', minWidth: 0, overflow: 'hidden' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                gap: '6px',
                marginBottom: '0.5rem',
                width: '100%'
              }}>
                {DAYS_FR.map(d => (
                  <div key={d} style={{
                    textAlign: 'center', fontSize: '0.72rem', fontWeight: 800,
                    color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px',
                    padding: '0.45rem 0', background: 'rgba(255,255,255,0.02)', borderRadius: '8px',
                    minWidth: 0
                  }}>
                    {d}
                  </div>
                ))}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                gridAutoRows: '96px',
                gap: '6px',
                width: '100%'
              }}>
                {calendarDays.map((cell, i) => {
                  const key = cell.current ? dateKey(year, month, cell.day) : null;
                  const dayEvents = key ? (eventsByDate[key] || []) : [];
                  const isToday = key === todayKey;
                  const isSelected = cell.current && cell.day === selectedDay;
                  const isDragOver = cell.current && dragOverDay === cell.day;

                  return (
                    <div
                      key={i}
                      onClick={() => cell.current && setSelectedDay(cell.day === selectedDay ? null : cell.day)}
                      onDoubleClick={() => cell.current && openCreateModal(dateKey(year, month, cell.day))}
                      onDragOver={(e) => {
                        if (cell.current) {
                          e.preventDefault();
                          setDragOverDay(cell.day);
                        }
                      }}
                      onDragLeave={() => setDragOverDay(null)}
                      onDrop={() => cell.current && handleDropOnDay(cell.day)}
                      title={cell.current ? 'Clic: voir le détail · Double-clic: créer une session · Glisser-déposer: déplacer' : ''}
                      style={{
                        position: 'relative', padding: '0.45rem 0.5rem', borderRadius: '12px',
                        cursor: cell.current ? 'pointer' : 'default',
                        height: '96px', minWidth: 0, width: '100%', overflow: 'hidden',
                        boxSizing: 'border-box', display: 'flex', flexDirection: 'column',
                        transition: '0.15s',
                        background: isDragOver
                          ? 'rgba(0,209,255,0.14)'
                          : isSelected
                            ? 'rgba(139,92,246,0.14)'
                            : isToday
                              ? 'rgba(0,209,255,0.07)'
                              : cell.current
                                ? 'rgba(255,255,255,0.02)'
                                : 'rgba(255,255,255,0.006)',
                        border: isDragOver
                          ? '1px dashed #00d1ff'
                          : isSelected
                            ? '1px solid rgba(139,92,246,0.45)'
                            : isToday
                              ? '1px solid rgba(0,209,255,0.35)'
                              : '1px solid rgba(255,255,255,0.04)',
                      }}
                    >
                      <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        marginBottom: '0.3rem', flexShrink: 0
                      }}>
                        <span style={{
                          fontSize: '0.78rem', fontWeight: isToday || isSelected ? 800 : 600,
                          width: isToday ? '22px' : 'auto', height: isToday ? '22px' : 'auto',
                          borderRadius: isToday ? '6px' : 0,
                          background: isToday ? 'rgba(0,209,255,0.2)' : 'transparent',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          color: !cell.current ? 'rgba(255,255,255,0.16)' : isToday ? '#00d1ff' : isSelected ? '#c4b5fd' : 'var(--text-main)',
                        }}>
                          {cell.day}
                        </span>
                        {cell.current && dayEvents.some(e => e.isEnrolled) && (
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', flexShrink: 0 }} title="Vous êtes inscrit à une session ce jour" />
                        )}
                      </div>

                      {dayEvents.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0, width: '100%', overflow: 'hidden' }}>
                          {dayEvents.slice(0, 2).map(ev => {
                            const cfg = TYPE_CONFIG[ev.type] || TYPE_CONFIG.live;
                            return (
                              <div
                                key={ev.id}
                                draggable
                                onDragStart={(e) => {
                                  e.stopPropagation();
                                  setDraggedEventId(ev.id);
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openModal('event', ev);
                                }}
                                title={`${ev.start_time} - ${ev.end_time} • ${ev.title}`}
                                style={{
                                  fontSize: '0.64rem', fontWeight: 600, padding: '3px 5px', borderRadius: '6px',
                                  background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
                                  borderLeft: `3px solid ${cfg.color}`,
                                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                  cursor: 'grab', width: '100%', minWidth: 0, boxSizing: 'border-box',
                                  display: 'block'
                                }}
                              >
                                <strong style={{ marginRight: '3px' }}>{ev.start_time}</strong>
                                {ev.title}
                              </div>
                            );
                          })}
                          {dayEvents.length > 2 && (
                            <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', fontWeight: 700, paddingLeft: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              +{dayEvents.length - 2} autre(s)
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── 2. WEEK VIEW ── */}
          {viewMode === 'Semaine' && (() => {
            const weekDays = getWeekEvents();
            return (
              <div style={{ flex: 1, overflowX: 'auto', minWidth: 0, width: '100%' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '54px repeat(7, minmax(0, 1fr))', minWidth: '680px' }}>
                  <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0.5rem' }} />
                  {weekDays.map((wd, i) => {
                    const isToday2 = wd.key === todayKey;
                    return (
                      <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0.5rem', textAlign: 'center', minWidth: 0 }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{DAYS_FR[i]}</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: isToday2 ? 800 : 600, color: isToday2 ? '#00d1ff' : 'var(--text-main)', marginTop: '0.15rem' }}>
                          {wd.date.getDate()}
                        </div>
                      </div>
                    );
                  })}

                  {hours.map(h => (
                    <React.Fragment key={h}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', padding: '0.65rem 0.35rem', textAlign: 'right', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
                        {pad(h)}:00
                      </div>
                      {weekDays.map((wd, j) => {
                        const eventsAtHour = wd.events.filter(ev => parseInt((ev.start_time || '18:00').split(':')[0], 10) === h);
                        return (
                          <div
                            key={j}
                            onDoubleClick={() => openCreateModal(wd.key)}
                            style={{
                              borderBottom: '1px solid rgba(255,255,255,0.03)',
                              borderRight: '1px solid rgba(255,255,255,0.03)',
                              padding: '3px', minHeight: '42px', position: 'relative',
                              minWidth: 0, overflow: 'hidden'
                            }}
                          >
                            {eventsAtHour.map(ev => {
                              const cfg = TYPE_CONFIG[ev.type] || TYPE_CONFIG.live;
                              return (
                                <div
                                  key={ev.id}
                                  onClick={() => openModal('event', ev)}
                                  style={{
                                    background: cfg.bg, border: `1px solid ${cfg.border}`,
                                    borderRadius: '6px', padding: '4px 6px', fontSize: '0.64rem',
                                    fontWeight: 600, color: cfg.color, cursor: 'pointer', marginBottom: '2px',
                                    minWidth: 0, overflow: 'hidden'
                                  }}
                                >
                                  <div>{ev.start_time} - {ev.end_time}</div>
                                  <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.title}</div>
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

          {/* ── 3. CHRONOLOGICAL PLANNING / LIST VIEW ── */}
          {viewMode === 'Planning' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, maxHeight: '540px', overflowY: 'auto', paddingRight: '0.25rem' }}>
              {filteredEvents.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Aucune session trouvée pour ces critères.
                </div>
              ) : (
                filteredEvents
                  .slice()
                  .sort((a, b) => a.date.localeCompare(b.date) || (a.start_time || '').localeCompare(b.start_time || ''))
                  .map(ev => {
                    const cfg = TYPE_CONFIG[ev.type] || TYPE_CONFIG.live;
                    const IconComp = cfg.icon;
                    return (
                      <div
                        key={ev.id}
                        onClick={() => openModal('event', ev)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          gap: '1rem', padding: '1rem 1.15rem', borderRadius: '14px',
                          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                          cursor: 'pointer', transition: '0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', minWidth: 0 }}>
                          <div style={{
                            width: '42px', height: '42px', borderRadius: '12px',
                            background: cfg.bg, border: `1px solid ${cfg.border}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                          }}>
                            <IconComp size={18} color={cfg.color} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>{ev.title}</span>
                              {ev.isEnrolled && (
                                <span style={{
                                  fontSize: '0.65rem', padding: '2px 7px', borderRadius: '99px',
                                  background: 'rgba(74,222,128,0.15)', color: '#4ade80', fontWeight: 700
                                }}>
                                  Inscrit
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                              <span>📅 {safeFormatDate(ev.date, { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                              <span>⏰ {ev.start_time} - {ev.end_time}</span>
                              <span>👤 {ev.instructor}</span>
                              <span>📍 {ev.location}</span>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                          <button
                            onClick={(e) => handleToggleEnroll(ev, e)}
                            style={{
                              padding: '0.45rem 0.85rem', borderRadius: '9px', cursor: 'pointer',
                              fontSize: '0.76rem', fontWeight: 700,
                              background: ev.isEnrolled ? 'rgba(74,222,128,0.15)' : 'rgba(139,92,246,0.15)',
                              border: `1px solid ${ev.isEnrolled ? 'rgba(74,222,128,0.35)' : 'rgba(139,92,246,0.35)'}`,
                              color: ev.isEnrolled ? '#4ade80' : '#c4b5fd'
                            }}
                          >
                            {ev.isEnrolled ? 'Inscrit ✓' : 'S\'inscrire'}
                          </button>
                          <button
                            onClick={(e) => handleToggleReminder(ev, e)}
                            style={{
                              width: '34px', height: '34px', borderRadius: '9px', cursor: 'pointer',
                              background: ev.hasReminder ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)',
                              border: `1px solid ${ev.hasReminder ? 'rgba(245,158,11,0.35)' : 'rgba(255,255,255,0.08)'}`,
                              color: ev.hasReminder ? '#f59e0b' : 'var(--text-muted)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                          >
                            <Bell size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          )}

          {/* Selected Day Detail Drawer (Month View) */}
          <AnimatePresence>
            {selectedDay && viewMode === 'Mois' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ marginTop: '1.15rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h3 className="brand-font" style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CalendarIcon size={16} color="#a78bfa" />
                    {selectedDay} {MONTHS_FR[month]} {year} — {selectedEvents.length} session(s)
                  </h3>
                  <button
                    onClick={() => openCreateModal(dateKey(year, month, selectedDay))}
                    style={{
                      background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)',
                      color: '#c4b5fd', padding: '0.35rem 0.75rem', borderRadius: '8px',
                      fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem'
                    }}
                  >
                    <Plus size={13} /> Ajouter ce jour
                  </button>
                </div>

                {selectedEvents.length === 0 ? (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Aucune session prévue ce jour. Cliquez sur "Ajouter ce jour" pour planifier un événement ou une session d'étude.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedEvents.map(ev => {
                      const cfg = TYPE_CONFIG[ev.type] || TYPE_CONFIG.live;
                      const IconComp = cfg.icon;
                      return (
                        <div
                          key={ev.id}
                          onClick={() => openModal('event', ev)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem',
                            borderRadius: '12px', background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer'
                          }}
                        >
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '10px',
                            background: cfg.bg, border: `1px solid ${cfg.border}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                          }}>
                            <IconComp size={16} color={cfg.color} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {ev.title}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Clock size={11} /> {ev.start_time} - {ev.end_time} · {ev.instructor} · {ev.location}
                            </div>
                          </div>
                          <button
                            onClick={(e) => handleToggleEnroll(ev, e)}
                            style={{
                              padding: '0.35rem 0.7rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 700,
                              background: ev.isEnrolled ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.05)',
                              border: `1px solid ${ev.isEnrolled ? 'rgba(74,222,128,0.35)' : 'rgba(255,255,255,0.1)'}`,
                              color: ev.isEnrolled ? '#4ade80' : 'var(--text-main)', cursor: 'pointer'
                            }}
                          >
                            {ev.isEnrolled ? 'Inscrit ✓' : 'Réserver'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ──── RIGHT: Sidebar (Categories + Upcoming + Sync) ──── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Category Filters */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '1.25rem' }}>
            <h3 className="brand-font" style={{ fontSize: '0.9rem', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={14} color="#a78bfa" /> Catégories
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
                const active = activeFilters.has(key);
                return (
                  <button
                    key={key}
                    onClick={() => toggleFilter(key)}
                    style={{
                      background: active ? cfg.bg : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${active ? cfg.border : 'rgba(255,255,255,0.06)'}`,
                      color: active ? cfg.color : 'var(--text-muted)',
                      padding: '0.35rem 0.75rem', borderRadius: '99px', cursor: 'pointer',
                      fontSize: '0.74rem', fontWeight: 600, transition: '0.2s', opacity: active ? 1 : 0.55
                    }}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upcoming Sessions */}
          <div style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
            borderRadius: '16px', padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 className="brand-font" style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={14} color="#ec4899" /> Prochaines Sessions
              </h3>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {upcoming.length} affichée(s)
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', flex: 1, overflowY: 'auto' }}>
              {upcoming.length === 0 && (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                  Aucune session à venir pour les filtres sélectionnés.
                </div>
              )}

              {upcoming.map((ev) => {
                const cfg = TYPE_CONFIG[ev.type] || TYPE_CONFIG.live;
                const IconComp = cfg.icon;
                const pct = Math.min(100, Math.round((ev.enrolled / Math.max(1, ev.spots)) * 100));

                return (
                  <div
                    key={ev.id}
                    onClick={() => openModal('event', ev)}
                    style={{
                      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                      padding: '0.95rem', borderRadius: '14px', cursor: 'pointer', position: 'relative', overflow: 'hidden'
                    }}
                  >
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: cfg.color }} />
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.7rem' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: cfg.bg, border: `1px solid ${cfg.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>
                        <IconComp size={16} color={cfg.color} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.2rem', lineHeight: 1.3 }}>
                          {ev.title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.45rem' }}>
                          <Clock size={10} /> {safeFormatDate(ev.date, { weekday: 'short', day: 'numeric', month: 'short' })} · {ev.start_time}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                          <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: cfg.color, borderRadius: '99px' }} />
                          </div>
                          <span style={{ fontSize: '0.65rem', color: ev.isEnrolled ? '#4ade80' : 'var(--text-muted)', fontWeight: 700 }}>
                            {ev.isEnrolled ? 'Inscrit ✓' : `${ev.enrolled}/${ev.spots}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Export / iCalendar Card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.09), rgba(0,209,255,0.06))',
            border: '1px solid rgba(139,92,246,0.25)', borderRadius: '16px', padding: '1.2rem', textAlign: 'center'
          }}>
            <CalendarIcon size={26} color="#00d1ff" style={{ marginBottom: '0.4rem' }} />
            <h4 className="brand-font" style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
              Interopérabilité iCalendar (.ics)
            </h4>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: 1.45 }}>
              Exportez ou importez vos sessions vers Google Calendar, Apple Calendar et Outlook.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => {
                  downloadICSFile(filteredEvents, 'MR1Academy-agenda.ics');
                  showToast('Fichier .ics généré et téléchargé !');
                }}
                style={{
                  flex: 1, padding: '0.6rem', background: 'rgba(0,209,255,0.14)',
                  border: '1px solid rgba(0,209,255,0.35)', color: '#00d1ff',
                  borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '0.76rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem'
                }}
              >
                <Download size={13} /> Exporter .ics
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  flex: 1, padding: '0.6rem', background: 'rgba(139,92,246,0.15)',
                  border: '1px solid rgba(139,92,246,0.35)', color: '#c4b5fd',
                  borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '0.76rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem'
                }}
              >
                <Upload size={13} /> Importer .ics
              </button>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default CalendarPage;
