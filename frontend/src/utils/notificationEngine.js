// ═══════════════════════════════════════════════════════════════════════════
// MR1Academy — Real-Time Multi-Event Notification Engine
// ═══════════════════════════════════════════════════════════════════════════

import { getAllLocalCertificates, getLocalFavoriteIds } from './certificationEngine';
import { getCachedData } from '../services/api';

const NOTIF_PREFIX = 'vibe_pro_notifications_v2_';

function getCurrentUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw && raw !== 'undefined' ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getStorageKey(userId) {
  const uid = userId || getCurrentUser()?.id || 'guest';
  return `${NOTIF_PREFIX}${uid}`;
}

export function formatRelativeTime(isoDate) {
  if (!isoDate) return "À l'instant";
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000));
  if (diffSec < 45) return "À l'instant";
  if (diffSec < 3600) return `Il y a ${Math.floor(diffSec / 60)} min`;
  if (diffSec < 86400) return `Il y a ${Math.floor(diffSec / 3600)} h`;
  const days = Math.floor(diffSec / 86400);
  if (days === 1) return 'Hier';
  if (days < 7) return `Il y a ${days} jours`;
  return new Date(isoDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

export function getNotifications(userId = null) {
  const user = getCurrentUser();
  const uid = userId || user?.id;
  if (!uid) return [];

  const key = getStorageKey(uid);
  let list = [];
  try {
    const raw = localStorage.getItem(key);
    if (raw) list = JSON.parse(raw);
  } catch {
    list = [];
  }

  if (!Array.isArray(list) || list.length === 0) {
    list = buildInitialNotifications(user);
    saveNotifications(list, uid);
  }

  // Enrich relative time dynamically
  return list.map(item => ({
    ...item,
    time: item.createdAt ? formatRelativeTime(item.createdAt) : (item.time || "À l'instant"),
  }));
}

export function saveNotifications(list, userId = null) {
  const uid = userId || getCurrentUser()?.id;
  if (!uid) return;
  try {
    localStorage.setItem(getStorageKey(uid), JSON.stringify(list.slice(0, 60)));
    window.dispatchEvent(new CustomEvent('vibe-notifications-updated'));
  } catch { /* ignore */ }
}

export function pushNotification({
  type = 'course',
  category = 'academique',
  title,
  desc,
  actionUrl = null,
  actionLabel = null,
  dedupeKey = null,
  badge = null,
}) {
  const user = getCurrentUser();
  if (!user?.id || !title) return null;

  const existing = getNotifications(user.id);
  if (dedupeKey && existing.some(n => n.dedupeKey === dedupeKey)) {
    return null;
  }

  const nowIso = new Date().toISOString();
  const newNotif = {
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type,
    category,
    title,
    desc: desc || '',
    actionUrl,
    actionLabel,
    dedupeKey,
    badge,
    createdAt: nowIso,
    time: "À l'instant",
    read: false,
  };

  const updated = [newNotif, ...existing].slice(0, 60);
  saveNotifications(updated, user.id);
  return newNotif;
}

export function markNotificationRead(id, userId = null) {
  const list = getNotifications(userId);
  const updated = list.map(n => (n.id === id ? { ...n, read: true } : n));
  saveNotifications(updated, userId);
  return updated;
}

export function markAllNotificationsRead(userId = null) {
  const list = getNotifications(userId);
  const updated = list.map(n => ({ ...n, read: true }));
  saveNotifications(updated, userId);
  return updated;
}

export function deleteNotification(id, userId = null) {
  const list = getNotifications(userId);
  const updated = list.filter(n => n.id !== id);
  saveNotifications(updated, userId);
  return updated;
}

function buildInitialNotifications(user) {
  const userName = user?.name || 'Étudiant';
  const now = Date.now();

  const initial = [
    {
      id: 'init_welcome_pro',
      dedupeKey: 'init_welcome_pro',
      type: 'welcome',
      category: 'system',
      badge: 'Plateforme',
      title: `Bienvenue sur MR1Academy Pro, ${userName} !`,
      desc: 'Explorez nos 24 formations certifiantes avec playlists de 10+ vidéos obligatoires, quiz officiel (seuil 75%) et certificat vérifiable.',
      actionUrl: '/catalogue',
      actionLabel: 'Explorer le Catalogue',
      createdAt: new Date(now - 2 * 60 * 1000).toISOString(),
      read: false,
    },
    {
      id: 'init_playlists_10',
      dedupeKey: 'init_playlists_10',
      type: 'course',
      category: 'academique',
      badge: 'Playlists 10+ Vidéos',
      title: 'Playlists enrichies : 10 vidéos par cursus & durée réelle',
      desc: 'Chaque formation dispose désormais d\'au moins 10 modules vidéo séquentiels avec synchronisation en temps réel de la durée exacte et déblocage progressif.',
      actionUrl: '/mes-cours',
      actionLabel: 'Voir mes playlists',
      createdAt: new Date(now - 12 * 60 * 1000).toISOString(),
      read: false,
    },
    {
      id: 'init_ai_catalog',
      dedupeKey: 'init_ai_catalog',
      type: 'system',
      category: 'academique',
      badge: 'Nouveaux Cursus',
      title: '12 Nouveaux Cursus IA, Data, Cloud & Cyber disponibles',
      desc: 'Ingénierie LLMs & RAG, Deep Learning PyTorch, Apache Spark & Kafka, Power BI DAX, Kubernetes, Pentest OWASP, Next.js 15, Flutter, Rust & Go.',
      actionUrl: '/catalogue',
      actionLabel: 'Découvrir les cursus',
      createdAt: new Date(now - 35 * 60 * 1000).toISOString(),
      read: false,
    },
    {
      id: 'init_agenda_live',
      dedupeKey: 'init_agenda_live',
      type: 'agenda',
      category: 'agenda',
      badge: 'Live Session',
      title: 'Session Live & Code Review disponible dans l\'Agenda',
      desc: 'Consultez votre Agenda Pro pour planifier vos créneaux de révision, ateliers live et examens de certification.',
      actionUrl: '/calendrier',
      actionLabel: 'Ouvrir mon Agenda',
      createdAt: new Date(now - 90 * 60 * 1000).toISOString(),
      read: false,
    },
    {
      id: 'init_community_hub',
      dedupeKey: 'init_community_hub',
      type: 'community',
      category: 'communaute',
      badge: 'Communauté',
      title: 'Hub d\'Entraide, Projets & Mentorat 1-on-1 actif',
      desc: 'Partagez votre code, posez vos questions techniques ou réservez un créneau de mentorat individuel avec nos instructeurs.',
      actionUrl: '/communaute',
      actionLabel: 'Rejoindre la Communauté',
      createdAt: new Date(now - 180 * 60 * 1000).toISOString(),
      read: true,
    },
  ];

  return initial;
}

/**
 * Synchronizes real notifications from user enrollments, certificates, favorites, and profile.
 */
export function syncSmartNotifications() {
  const user = getCurrentUser();
  if (!user?.id) return [];

  const myCourses = getCachedData('/my-courses') || [];
  const allCourses = getCachedData('/courses') || [];
  const localCerts = getAllLocalCertificates();
  const favIds = getLocalFavoriteIds();

  // 1. Notifications for earned certificates
  Object.values(localCerts).forEach(cert => {
    if (cert?.quiz_passed && cert?.course_id) {
      const courseObj = allCourses.find(c => Number(c.id) === Number(cert.course_id));
      const cTitle = cert.course_title || courseObj?.title || `Formation #${cert.course_id}`;
      pushNotification({
        type: 'certificate',
        category: 'academique',
        badge: 'Certificat Officiel',
        title: `🏆 Certificat obtenu : ${cTitle}`,
        desc: `Félicitations ! Vous avez réussi l'examen final (${cert.quiz_score || 85}%) et débloqué votre diplôme vérifiable (${cert.certificate_uid || 'VIBE-PRO'}).`,
        actionUrl: '/certificats',
        actionLabel: 'Télécharger mon Certificat',
        dedupeKey: `cert_earned_${cert.course_id}`,
      });
    }
  });

  // 2. Notifications for enrolled courses & 100% Feu Vert
  if (Array.isArray(myCourses)) {
    myCourses.slice(0, 4).forEach(enr => {
      const cTitle = enr?.course?.title || `Formation #${enr.course_id}`;
      if (enr.progress >= 100 && !enr.quiz_passed) {
        pushNotification({
          type: 'greenlight',
          category: 'academique',
          badge: '🟢 Feu Vert',
          title: `Feu Vert débloqué : ${cTitle}`,
          desc: `Vous avez visionné 100% des vidéos de la playlist "${cTitle}". Passez le Quiz final maintenant pour obtenir votre certificat !`,
          actionUrl: `/quiz/${enr.course_id}`,
          actionLabel: 'Passer le Quiz Certifiant',
          dedupeKey: `greenlight_${enr.course_id}`,
        });
      } else if (enr.progress > 0 && enr.progress < 100) {
        pushNotification({
          type: 'course',
          category: 'academique',
          badge: `Progression ${enr.progress}%`,
          title: `Continuez votre playlist : ${cTitle}`,
          desc: `Vous êtes à ${enr.progress}% sur "${cTitle}". Regardez la prochaine vidéo jusqu'à la fin pour débloquer la suite !`,
          actionUrl: `/courses/${enr.course_id}`,
          actionLabel: 'Reprendre la vidéo',
          dedupeKey: `progress_reminder_${enr.course_id}`,
        });
      }
    });
  }

  // 3. Notification for favorites count if user has favorites
  if (Array.isArray(favIds) && favIds.length > 0) {
    pushNotification({
      type: 'favorite',
      category: 'favoris',
      badge: `${favIds.length} Favori${favIds.length > 1 ? 's' : ''}`,
      title: `Vos ${favIds.length} formation${favIds.length > 1 ? 's' : ''} favorite${favIds.length > 1 ? 's' : ''} vous attendent`,
      desc: 'Organisez vos priorités d\'étude, ajoutez des notes personnelles et planifiez vos révisions depuis votre espace Favoris Pro.',
      actionUrl: '/favoris',
      actionLabel: 'Gérer mes Favoris',
      dedupeKey: 'smart_favorites_overview',
    });
  }

  return getNotifications(user.id);
}
