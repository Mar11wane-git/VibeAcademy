// ═══════════════════════════════════════════════════════════════════════════
// MR1Academy — Real Playlist Analytics, Course Quiz Bank & Certificate Engine
// ═══════════════════════════════════════════════════════════════════════════

const CERT_STORAGE_KEY = 'vibe_certificates_v2';
const PROGRESS_STORAGE_KEY = 'vibe_course_progress_v2';
const YT_REAL_DURATIONS_KEY = 'vibe_yt_real_durations_v2';

// Verified durations only (confirmed from the real YouTube player).
// All other videos get their exact duration synced live from the YouTube IFrame API
// (infoDelivery.duration) and persisted in localStorage.
const KNOWN_YOUTUBE_DURATIONS = {
  'KJgsSFOSQv0': '3:46:13',
};

export function extractYouTubeId(url) {
  if (!url) return null;
  const str = String(url);
  const m = str.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

export function formatDurationClock(totalSec) {
  const sec = Math.max(0, Math.round(Number(totalSec) || 0));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function getRealYouTubeDurations() {
  try {
    const stored = JSON.parse(localStorage.getItem(YT_REAL_DURATIONS_KEY) || '{}');
    return { ...KNOWN_YOUTUBE_DURATIONS, ...stored };
  } catch {
    return { ...KNOWN_YOUTUBE_DURATIONS };
  }
}

export function saveRealYouTubeDuration(videoUrlOrId, durationSeconds) {
  const sec = Math.round(Number(durationSeconds) || 0);
  if (sec <= 0) return null;
  const ytId = extractYouTubeId(videoUrlOrId) || String(videoUrlOrId);
  const formatted = formatDurationClock(sec);
  try {
    const stored = JSON.parse(localStorage.getItem(YT_REAL_DURATIONS_KEY) || '{}');
    if (stored[ytId] !== formatted) {
      stored[ytId] = formatted;
      localStorage.setItem(YT_REAL_DURATIONS_KEY, JSON.stringify(stored));
    }
  } catch { /* ignore */ }
  return formatted;
}

export function getEffectiveModuleDuration(module, customMap = null) {
  if (!module) return '20:00';
  const map = customMap || getRealYouTubeDurations();
  if (module.id && map[`mod_${module.id}`]) {
    return map[`mod_${module.id}`];
  }
  const ytId = extractYouTubeId(module.video_url);
  if (ytId && map[ytId]) {
    return map[ytId];
  }
  return module.duration || '22:00';
}

export function ensureMinimum10Modules(course) {
  if (!course) return course;
  const existing = Array.isArray(course.modules) ? [...course.modules].sort((a, b) => a.order - b.order) : [];
  if (existing.length >= 10) return course;

  const extraTemplates = [
    ['Architecture Modulaire,Bonnes Pratiques & Structuration Pro', '24:15', 'https://www.youtube.com/watch?v=O6P86uwfdR0'],
    ['Gestion des Données, Optimisation Mémoire & Structures Avancées', '27:40', 'https://www.youtube.com/watch?v=TNhaISOUy6Q'],
    ['Sécurité Applicative, Validation des Entrées & Gestion d\'Erreurs', '23:20', 'https://www.youtube.com/watch?v=7Q17ubqLfaM'],
    ['Communication Réseau, APIs & Traitement Asynchrone', '29:10', 'https://www.youtube.com/watch?v=LRE0fL-d2o8'],
    ['Profiling de Performance, Cache & Scalabilité Haute Fréquence', '26:35', 'https://www.youtube.com/watch?v=jgpVdJB2sKQ'],
    ['Tests Unitaires, Tests d\'Intégration & Débogage Industriel', '25:50', 'https://www.youtube.com/watch?v=vZm0lHciFsQ'],
    ['Automatisation CI/CD, Conteneurisation & Mise en Production', '31:15', 'https://www.youtube.com/watch?v=8aGhZQkoFbQ'],
  ];

  const filled = [...existing];
  let order = filled.length + 1;
  let tplIdx = 0;
  while (filled.length < 10) {
    const tpl = extraTemplates[tplIdx % extraTemplates.length];
    filled.push({
      id: Number(course.id || 1) * 1000 + order,
      course_id: course.id,
      title: tpl[0],
      duration: tpl[1],
      video_url: tpl[2],
      order,
    });
    order += 1;
    tplIdx += 1;
  }
  return { ...course, modules: filled };
}

/* ─── 1. Playlist Duration & Average Calculation Engine ─── */
export function parseDurationToSeconds(durationStr) {
  if (!durationStr) return 900; // default 15 min
  const str = String(durationStr).trim();
  // Format "MM:SS" or "HH:MM:SS"
  if (str.includes(':')) {
    const parts = str.split(':').map(Number);
    if (parts.length === 3) {
      return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
    }
    if (parts.length === 2) {
      return (parts[0] || 0) * 60 + (parts[1] || 0);
    }
  }
  // Format "25 min" or "1h 30m"
  const hMatch = str.match(/(\d+)\s*h/i);
  const mMatch = str.match(/(\d+)\s*m/i);
  if (hMatch || mMatch) {
    return (hMatch ? parseInt(hMatch[1], 10) * 3600 : 0) + (mMatch ? parseInt(mMatch[1], 10) * 60 : 0);
  }
  const num = parseFloat(str);
  return !isNaN(num) ? Math.round(num * 60) : 900;
}

export function formatSecondsHuman(totalSec, compact = false) {
  const sec = Math.max(0, Math.round(totalSec));
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;

  if (hours > 0) {
    return compact ? `${hours}h ${String(minutes).padStart(2, '0')}m` : `${hours}h ${minutes} min`;
  }
  if (minutes > 0) {
    return compact && seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes} min`;
  }
  return `${seconds} sec`;
}

export function computePlaylistStats(modules = [], completedIds = [], customDurationsMap = null) {
  if (!modules.length) {
    return {
      totalSeconds: 0,
      avgSeconds: 0,
      remainingSeconds: 0,
      totalFormatted: '0 min',
      avgFormatted: '0 min',
      remainingFormatted: '0 min',
      totalHoursDecimal: 0,
    };
  }

  const map = customDurationsMap || getRealYouTubeDurations();
  let totalSeconds = 0;
  let remainingSeconds = 0;

  modules.forEach(m => {
    const effectiveDur = getEffectiveModuleDuration(m, map);
    const d = parseDurationToSeconds(effectiveDur);
    totalSeconds += d;
    if (!completedIds.includes(Number(m.id)) && !completedIds.includes(m.id)) {
      remainingSeconds += d;
    }
  });

  const avgSeconds = Math.round(totalSeconds / modules.length);

  return {
    totalSeconds,
    avgSeconds,
    remainingSeconds,
    totalFormatted: formatSecondsHuman(totalSeconds, true),
    avgFormatted: formatSecondsHuman(avgSeconds, false),
    remainingFormatted: formatSecondsHuman(remainingSeconds, true),
    totalHoursDecimal: Math.max(0.5, +(totalSeconds / 3600).toFixed(1)),
  };
}

/* ─── 2. Local + Cloud Progress & Certificate Sync ─── */
export function getLocalCompletedModules(courseId) {
  try {
    const all = JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY) || '{}');
    return Array.isArray(all[courseId]) ? all[courseId] : [];
  } catch {
    return [];
  }
}

export function saveLocalCompletedModules(courseId, moduleIds) {
  try {
    const all = JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY) || '{}');
    all[courseId] = Array.from(new Set(moduleIds));
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(all));
  } catch { /* ignore */ }
}

export function getAllLocalCertificates() {
  try {
    return JSON.parse(localStorage.getItem(CERT_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export function getLocalCertificate(courseId) {
  const all = getAllLocalCertificates();
  return all[String(courseId)] || null;
}

export function saveLocalCertificate(courseId, certData) {
  try {
    const all = getAllLocalCertificates();
    all[String(courseId)] = {
      ...all[String(courseId)],
      ...certData,
      course_id: Number(courseId),
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(CERT_STORAGE_KEY, JSON.stringify(all));
    return all[String(courseId)];
  } catch {
    return certData;
  }
}

export function generateCertificateUid(courseId, userId = 1) {
  const year = new Date().getFullYear();
  const cPart = String(courseId).padStart(2, '0');
  const uPart = String(userId).padStart(2, '0');
  const rand = Math.abs((courseId * 7919 + userId * 104729 + 1337) % 1679616)
    .toString(36)
    .toUpperCase()
    .padStart(4, '0');
  return `VIBE-${year}-${cPart}${uPart}-${rand}`;
}

/* ─── 2B. Pro Course Cover Artwork & Tech Stack Identity Engine ─── */
function escapeXml(unsafe) {
  return String(unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const TECH_THEMES = {
  java: {
    key: 'java',
    badge: 'JAVA 21 LTS & SPRING BOOT',
    category: 'Java & Backend',
    level: 'Architecture POO',
    symbol: 'JAVA 21 LTS',
    codeSnippet: [
      { text: '@SpringBootApplication', color: '#fbbf24' },
      { text: 'public class VibeEngine {', color: '#f97316' },
      { text: '  public static void main() {}', color: '#e2e8f0' },
      { text: '}', color: '#f97316' },
    ],
    bgStart: '#0b0f19',
    bgMid: '#1e1b4b',
    bgEnd: '#431407',
    accent: '#f97316',
    accentAlt: '#38bdf8',
    logoSvg: `
      <g transform="translate(0, 0)">
        <!-- Glowing backdrop -->
        <circle cx="0" cy="0" r="56" fill="url(#logoGlow)" opacity="0.85"/>
        <circle cx="0" cy="0" r="46" fill="#0f172a" stroke="#f97316" stroke-width="2.2" stroke-opacity="0.7"/>
        <!-- Official Java Coffee Cup + Steam Vector -->
        <path d="M-20,6 C-20,23 16,23 16,6 L13,-8 L-17,-8 Z" fill="url(#accentGrad)" opacity="0.9"/>
        <path d="M15,-5 C26,-5 26,9 15,9" fill="none" stroke="#f97316" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M-7,-14 C-13,-22 -1,-25 -7,-33" fill="none" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/>
        <path d="M4,-12 C-2,-20 10,-23 4,-31" fill="none" stroke="#fb923c" stroke-width="3" stroke-linecap="round"/>
        <path d="M-24,22 Q-2,28 22,22" fill="none" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round"/>
      </g>
    `,
  },
  python: {
    key: 'python',
    badge: 'PYTHON 3.12 • DATA SCIENCE & IA',
    category: 'Python & IA',
    level: 'Data Science & ML',
    symbol: 'PYTHON 3.12',
    codeSnippet: [
      { text: 'import pandas as pd', color: '#38bdf8' },
      { text: 'from sklearn.ensemble import RF', color: '#facc15' },
      { text: 'model = RF(n_estimators=200)', color: '#e2e8f0' },
      { text: 'model.fit(X_train, y_train)', color: '#4ade80' },
    ],
    bgStart: '#041022',
    bgMid: '#0c2d48',
    bgEnd: '#1e293b',
    accent: '#facc15',
    accentAlt: '#38bdf8',
    logoSvg: `
      <g transform="translate(0, 0)">
        <circle cx="0" cy="0" r="56" fill="url(#logoGlow)" opacity="0.85"/>
        <circle cx="0" cy="0" r="46" fill="#091526" stroke="#38bdf8" stroke-width="2.2" stroke-opacity="0.7"/>
        <!-- Official Python Dual Snakes Emblem -->
        <path d="M-2,-28 C-17,-28 -19,-21 -19,-14 L-19,-6 L0,-6 L0,-3 L-23,-3 C-30,-3 -33,4 -31,14 C-29,23 -23,26 -15,26 L-9,26 L-9,17 C-9,10 -3,5 4,5 L18,5 C23,5 26,1 26,-5 L26,-16 C26,-23 19,-28 -2,-28 Z" fill="#38bdf8" transform="scale(0.82)"/>
        <path d="M2,28 C17,28 19,21 19,14 L19,6 L0,6 L0,3 L23,3 C30,3 33,-4 31,-14 C29,-23 23,-26 15,-26 L9,-26 L9,-17 C9,-10 3,-5 -4,-5 L-18,-5 C-23,-5 -26,-1 -26,5 L-26,16 C-26,23 -19,28 2,28 Z" fill="#facc15" transform="scale(0.82)"/>
        <circle cx="-8" cy="-16" r="2.6" fill="#091526"/>
        <circle cx="8" cy="16" r="2.6" fill="#091526"/>
      </g>
    `,
  },
  react: {
    key: 'react',
    badge: 'REACT 19 • ARCHITECTURE MODERNE',
    category: 'React & Web',
    level: 'Frontend & Hooks',
    symbol: 'REACT 19',
    codeSnippet: [
      { text: 'const [state, setState] = useState(0);', color: '#00d8ff' },
      { text: 'useEffect(() => {', color: '#c084fc' },
      { text: '  syncPlaylistProgress(courseId);', color: '#e2e8f0' },
      { text: '}, [courseId]);', color: '#c084fc' },
    ],
    bgStart: '#030b17',
    bgMid: '#082f49',
    bgEnd: '#1e1b4b',
    accent: '#00d8ff',
    accentAlt: '#a855f7',
    logoSvg: `
      <g transform="translate(0, 0)">
        <circle cx="0" cy="0" r="56" fill="url(#logoGlow)" opacity="0.85"/>
        <circle cx="0" cy="0" r="46" fill="#050d1a" stroke="#00d8ff" stroke-width="2" stroke-opacity="0.6"/>
        <ellipse cx="0" cy="0" rx="34" ry="13" fill="none" stroke="#00d8ff" stroke-width="2.8"/>
        <ellipse cx="0" cy="0" rx="34" ry="13" fill="none" stroke="#00d8ff" stroke-width="2.8" transform="rotate(60)"/>
        <ellipse cx="0" cy="0" rx="34" ry="13" fill="none" stroke="#a855f7" stroke-width="2.8" transform="rotate(120)"/>
        <circle cx="0" cy="0" r="7" fill="#00d8ff"/>
      </g>
    `,
  },
  laravel: {
    key: 'laravel',
    badge: 'LARAVEL 11 • API & FULLSTACK',
    category: 'Laravel & PHP',
    level: 'Architecture MVC',
    symbol: 'LARAVEL 11',
    codeSnippet: [
      { text: 'Route::middleware("auth:sanctum")', color: '#ff2d20' },
      { text: '  ->post("/courses/certify",', color: '#fbbf24' },
      { text: '  [EnrollmentController::class]);', color: '#e2e8f0' },
      { text: '// Eloquent ORM & REST API', color: '#94a3b8' },
    ],
    bgStart: '#160508',
    bgMid: '#3b0a14',
    bgEnd: '#0f172a',
    accent: '#ff2d20',
    accentAlt: '#f59e0b',
    logoSvg: `
      <g transform="translate(0, 0)">
        <circle cx="0" cy="0" r="56" fill="url(#logoGlow)" opacity="0.85"/>
        <circle cx="0" cy="0" r="46" fill="#180609" stroke="#ff2d20" stroke-width="2.2" stroke-opacity="0.7"/>
        <polygon points="0,-28 25,-14 25,14 0,28 -25,14 -25,-14" fill="rgba(255,45,32,0.18)" stroke="#ff2d20" stroke-width="3" stroke-linejoin="round"/>
        <polyline points="-25,-14 0,1 25,-14" fill="none" stroke="#f59e0b" stroke-width="2.6"/>
        <line x1="0" y1="1" x2="0" y2="28" stroke="#f59e0b" stroke-width="2.6"/>
      </g>
    `,
  },
  node: {
    key: 'node',
    badge: 'NODE.JS • EXPRESS & TEMPS RÉEL',
    category: 'Node & Cloud',
    level: 'Microservices V8',
    symbol: 'NODE.JS V20',
    codeSnippet: [
      { text: 'app.post("/api/stream", async (req, res) => {', color: '#4ade80' },
      { text: '  const jwt = await verifyToken(req);', color: '#22d3ee' },
      { text: '  return res.status(200).json({ ok: true });', color: '#e2e8f0' },
      { text: '});', color: '#4ade80' },
    ],
    bgStart: '#04140d',
    bgMid: '#063624',
    bgEnd: '#0f172a',
    accent: '#4ade80',
    accentAlt: '#22d3ee',
    logoSvg: `
      <g transform="translate(0, 0)">
        <circle cx="0" cy="0" r="56" fill="url(#logoGlow)" opacity="0.85"/>
        <polygon points="0,-42 36,-21 36,21 0,42 -36,21 -36,-21" fill="#062e1e" stroke="#4ade80" stroke-width="3"/>
        <polygon points="0,-30 26,-15 26,15 0,30 -26,15 -26,-15" fill="url(#accentGrad)" opacity="0.25"/>
        <text x="0" y="8" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="22" font-weight="900">JS</text>
      </g>
    `,
  },
  csharp: {
    key: 'csharp',
    badge: 'C# 12 & .NET 8 CORE',
    category: 'C# & .NET',
    level: 'Enterprise Cloud',
    symbol: 'C# .NET 8',
    codeSnippet: [
      { text: 'var builder = WebApplication.Create();', color: '#c084fc' },
      { text: 'builder.Services.AddDbContext<AppDb>();', color: '#38bdf8' },
      { text: 'var app = builder.Build();', color: '#e2e8f0' },
      { text: 'await app.RunAsync();', color: '#4ade80' },
    ],
    bgStart: '#110629',
    bgMid: '#2e1065',
    bgEnd: '#0f172a',
    accent: '#a855f7',
    accentAlt: '#38bdf8',
    logoSvg: `
      <g transform="translate(0, 0)">
        <circle cx="0" cy="0" r="56" fill="url(#logoGlow)" opacity="0.85"/>
        <polygon points="0,-42 36,-21 36,21 0,42 -36,21 -36,-21" fill="#1e0b45" stroke="#a855f7" stroke-width="3"/>
        <text x="0" y="9" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="25" font-weight="900">C#</text>
      </g>
    `,
  },
  cpp: {
    key: 'cpp',
    badge: 'C / C++20 • SYSTÈMES & MÉMOIRE',
    category: 'C & C++',
    level: 'Pointeurs & Allocation',
    symbol: 'LANGAGE C / C++',
    codeSnippet: [
      { text: '#include <stdio.h>', color: '#38bdf8' },
      { text: '#include <stdlib.h>', color: '#38bdf8' },
      { text: 'int *ptr = (int*)malloc(sizeof(int)*64);', color: '#60a5fa' },
      { text: 'free(ptr); // Memoire optimisee', color: '#4ade80' },
    ],
    bgStart: '#040d21',
    bgMid: '#0f2557',
    bgEnd: '#090d16',
    accent: '#3b82f6',
    accentAlt: '#00d1ff',
    logoSvg: `
      <g transform="translate(0, 0)">
        <circle cx="0" cy="0" r="56" fill="url(#logoGlow)" opacity="0.9"/>
        <!-- Official C Hexagon Shield -->
        <polygon points="0,-44 38,-22 38,22 0,44 -38,22 -38,-22" fill="#0f296b" stroke="#00d1ff" stroke-width="3"/>
        <polygon points="0,-44 38,-22 0,0 -38,-22" fill="#3b82f6" opacity="0.45"/>
        <path d="M14,-12 A20,20 0 1,0 14,12" fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round"/>
      </g>
    `,
  },
  oracle: {
    key: 'oracle',
    badge: 'ORACLE 21c • SQL & PL/SQL',
    category: 'SQL & Database',
    level: 'DBA & Optimisation',
    symbol: 'ORACLE SQL',
    codeSnippet: [
      { text: 'SELECT c.title, AVG(e.quiz_score)', color: '#f87171' },
      { text: 'FROM courses c INNER JOIN enrollments e', color: '#fbbf24' },
      { text: 'ON c.id = e.course_id', color: '#e2e8f0' },
      { text: 'GROUP BY c.id ORDER BY 2 DESC;', color: '#4ade80' },
    ],
    bgStart: '#1a0606',
    bgMid: '#3f1111',
    bgEnd: '#0f172a',
    accent: '#f87171',
    accentAlt: '#fbbf24',
    logoSvg: `
      <g transform="translate(0, 0)">
        <circle cx="0" cy="0" r="56" fill="url(#logoGlow)" opacity="0.85"/>
        <circle cx="0" cy="0" r="46" fill="#1f0909" stroke="#f87171" stroke-width="2.2"/>
        <ellipse cx="0" cy="-16" rx="24" ry="8" fill="#f87171" opacity="0.35" stroke="#fbbf24" stroke-width="2.5"/>
        <path d="M-24,-16 L-24,16 C-24,22 24,22 24,16 L24,-16" fill="none" stroke="#f87171" stroke-width="2.8"/>
        <path d="M-24,0 C-24,6 24,6 24,0" fill="none" stroke="#fbbf24" stroke-width="2.5"/>
      </g>
    `,
  },
  uiux: {
    key: 'uiux',
    badge: 'FIGMA • UI/UX & DESIGN SYSTEMS',
    category: 'UI/UX & Design',
    level: 'AutoLayout & Prototypes',
    symbol: 'FIGMA PRO',
    codeSnippet: [
      { text: 'DesignSystem.tokens({', color: '#ec4899' },
      { text: '  surface: "glassmorphism-24px",', color: '#c084fc' },
      { text: '  grid: "AutoLayout 8pt Responsive"', color: '#38bdf8' },
      { text: '});', color: '#ec4899' },
    ],
    bgStart: '#180524',
    bgMid: '#3b0764',
    bgEnd: '#31102f',
    accent: '#ec4899',
    accentAlt: '#a855f7',
    logoSvg: `
      <g transform="translate(0, 0)">
        <circle cx="0" cy="0" r="56" fill="url(#logoGlow)" opacity="0.85"/>
        <circle cx="0" cy="0" r="46" fill="#190726" stroke="#ec4899" stroke-width="2.2"/>
        <!-- Official Figma 5-petal geometry -->
        <rect x="-16" y="-24" width="16" height="16" rx="8" fill="#f24e1e"/>
        <rect x="0" y="-24" width="16" height="16" rx="8" fill="#ff7262"/>
        <rect x="-16" y="-8" width="16" height="16" rx="8" fill="#a259ff"/>
        <circle cx="8" cy="0" r="8" fill="#1abcfe"/>
        <path d="M-16,8 L0,8 L0,16 A8,8 0 1,1 -16,16 Z" fill="#0acf83"/>
      </g>
    `,
  },
  css: {
    key: 'css',
    badge: 'CSS3 • GLASSMORPHISM & MOTION',
    category: 'UI/UX & Design',
    level: 'Animations 60FPS',
    symbol: 'CSS3 STUDIO',
    codeSnippet: [
      { text: '.glass-card {', color: '#38bdf8' },
      { text: '  backdrop-filter: blur(24px);', color: '#ec4899' },
      { text: '  border: 1px solid rgba(255,255,255,0.2);', color: '#e2e8f0' },
      { text: '}', color: '#38bdf8' },
    ],
    bgStart: '#061126',
    bgMid: '#1e1b4b',
    bgEnd: '#2e1065',
    accent: '#38bdf8',
    accentAlt: '#ec4899',
    logoSvg: `
      <g transform="translate(0, 0)">
        <circle cx="0" cy="0" r="56" fill="url(#logoGlow)" opacity="0.85"/>
        <circle cx="0" cy="0" r="46" fill="#08142c" stroke="#38bdf8" stroke-width="2.2"/>
        <rect x="-22" y="-18" width="30" height="24" rx="6" fill="#38bdf8" opacity="0.35" stroke="#38bdf8" stroke-width="2.5"/>
        <rect x="-8" y="-4" width="30" height="24" rx="6" fill="#ec4899" opacity="0.45" stroke="#ec4899" stroke-width="2.5"/>
      </g>
    `,
  },
  ai_llm: {
    key: 'ai_llm',
    badge: 'IA GÉNÉRATIVE • LLMs, RAG & AGENTS',
    category: 'IA & Deep Learning',
    level: 'LangChain & OpenAI',
    symbol: 'GEN-AI & RAG',
    codeSnippet: [
      { text: 'const agent = createReActAgent({', color: '#c084fc' },
      { text: '  llm: new ChatOpenAI({ model: "gpt-4o" }),', color: '#38bdf8' },
      { text: '  retriever: vectorStore.asRetriever(4)', color: '#4ade80' },
      { text: '});', color: '#c084fc' },
    ],
    bgStart: '#0b0420',
    bgMid: '#260d57',
    bgEnd: '#062436',
    accent: '#c084fc',
    accentAlt: '#22d3ee',
    logoSvg: `
      <g transform="translate(0, 0)">
        <circle cx="0" cy="0" r="56" fill="url(#logoGlow)" opacity="0.9"/>
        <polygon points="0,-42 36,-21 36,21 0,42 -36,21 -36,-21" fill="#13072e" stroke="#c084fc" stroke-width="2.6"/>
        <line x1="-18" y1="-14" x2="18" y2="14" stroke="#22d3ee" stroke-width="2.2"/>
        <line x1="-18" y1="14" x2="18" y2="-14" stroke="#22d3ee" stroke-width="2.2"/>
        <line x1="0" y1="-26" x2="0" y2="26" stroke="#c084fc" stroke-width="2.2"/>
        <circle cx="0" cy="0" r="10" fill="#c084fc"/>
        <circle cx="-18" cy="-14" r="5" fill="#22d3ee"/>
        <circle cx="18" cy="-14" r="5" fill="#22d3ee"/>
        <circle cx="-18" cy="14" r="5" fill="#22d3ee"/>
        <circle cx="18" cy="14" r="5" fill="#22d3ee"/>
        <circle cx="0" cy="-26" r="5" fill="#f472b6"/>
        <circle cx="0" cy="26" r="5" fill="#f472b6"/>
      </g>
    `,
  },
  deeplearning: {
    key: 'deeplearning',
    badge: 'PYTORCH • DEEP LEARNING & VISION',
    category: 'IA & Deep Learning',
    level: 'CNN, ViT & GPU CUDA',
    symbol: 'PYTORCH AI',
    codeSnippet: [
      { text: 'import torch.nn as nn', color: '#fb923c' },
      { text: 'model = VisionTransformer(depth=12).cuda()', color: '#38bdf8' },
      { text: 'loss = criterion(model(images), labels)', color: '#e2e8f0' },
      { text: 'loss.backward(); optimizer.step()', color: '#4ade80' },
    ],
    bgStart: '#1c0804',
    bgMid: '#431407',
    bgEnd: '#1e1b4b',
    accent: '#fb923c',
    accentAlt: '#ec4899',
    logoSvg: `
      <g transform="translate(0, 0)">
        <circle cx="0" cy="0" r="56" fill="url(#logoGlow)" opacity="0.88"/>
        <circle cx="0" cy="0" r="45" fill="#1c0905" stroke="#fb923c" stroke-width="2.5"/>
        <path d="M0,-26 C16,-14 22,6 12,20 C4,30 -14,28 -20,16 C-26,4 -16,-14 0,-26 Z" fill="rgba(251,146,60,0.22)" stroke="#fb923c" stroke-width="3"/>
        <circle cx="7" cy="-12" r="4.5" fill="#ec4899"/>
        <circle cx="-4" cy="8" r="6" fill="#fb923c"/>
      </g>
    `,
  },
  data_eng: {
    key: 'data_eng',
    badge: 'BIG DATA • SPARK, KAFKA & AIRFLOW',
    category: 'Data & Big Data',
    level: 'Data Lakehouse & ETL',
    symbol: 'SPARK & KAFKA',
    codeSnippet: [
      { text: 'df = spark.readStream.format("kafka")', color: '#22d3ee' },
      { text: '  .option("subscribe", "events_realtime")', color: '#fbbf24' },
      { text: '  .load().groupBy("region").count()', color: '#e2e8f0' },
      { text: 'df.writeStream.format("parquet").start()', color: '#4ade80' },
    ],
    bgStart: '#03131f',
    bgMid: '#083344',
    bgEnd: '#1e1b4b',
    accent: '#22d3ee',
    accentAlt: '#f59e0b',
    logoSvg: `
      <g transform="translate(0, 0)">
        <circle cx="0" cy="0" r="56" fill="url(#logoGlow)" opacity="0.88"/>
        <circle cx="0" cy="0" r="45" fill="#061b29" stroke="#22d3ee" stroke-width="2.4"/>
        <polygon points="0,-28 8,-8 28,-8 12,5 18,25 0,13 -18,25 -12,5 -28,-8 -8,-8" fill="rgba(34,211,238,0.22)" stroke="#f59e0b" stroke-width="2.5"/>
      </g>
    `,
  },
  bi_analytics: {
    key: 'bi_analytics',
    badge: 'DATA ANALYTICS • POWER BI & DAX',
    category: 'Data & Big Data',
    level: 'Dashboards & KPIs',
    symbol: 'POWER BI PRO',
    codeSnippet: [
      { text: 'Revenu YoY % = ', color: '#facc15' },
      { text: 'VAR Curr = SUM(Sales[Amount])', color: '#38bdf8' },
      { text: 'VAR Prev = CALCULATE(Curr, SAMEPERIODLASTYEAR())', color: '#e2e8f0' },
      { text: 'RETURN DIVIDE(Curr - Prev, Prev)', color: '#4ade80' },
    ],
    bgStart: '#1a1203',
    bgMid: '#422006',
    bgEnd: '#0f172a',
    accent: '#facc15',
    accentAlt: '#f97316',
    logoSvg: `
      <g transform="translate(0, 0)">
        <circle cx="0" cy="0" r="56" fill="url(#logoGlow)" opacity="0.88"/>
        <circle cx="0" cy="0" r="45" fill="#1c1404" stroke="#facc15" stroke-width="2.4"/>
        <rect x="-22" y="2" width="10" height="20" rx="3" fill="#f97316"/>
        <rect x="-5" y="-10" width="10" height="32" rx="3" fill="#eab308"/>
        <rect x="12" y="-22" width="10" height="44" rx="3" fill="#fef08a"/>
      </g>
    `,
  },
  devops: {
    key: 'devops',
    badge: 'DEVOPS • DOCKER, KUBERNETES & AWS',
    category: 'Cloud & DevOps',
    level: 'Clusters K8s & CI/CD',
    symbol: 'KUBERNETES',
    codeSnippet: [
      { text: 'apiVersion: apps/v1', color: '#38bdf8' },
      { text: 'kind: Deployment', color: '#60a5fa' },
      { text: 'spec: { replicas: 6, strategy: "Rolling" }', color: '#e2e8f0' },
      { text: '# Terraform + GitHub Actions CI/CD', color: '#4ade80' },
    ],
    bgStart: '#030d24',
    bgMid: '#1e3a8a',
    bgEnd: '#09152b',
    accent: '#38bdf8',
    accentAlt: '#6366f1',
    logoSvg: `
      <g transform="translate(0, 0)">
        <circle cx="0" cy="0" r="56" fill="url(#logoGlow)" opacity="0.88"/>
        <polygon points="0,-42 33,-26 41,10 18,39 -18,39 -41,10 -33,-26" fill="#0b1d4a" stroke="#38bdf8" stroke-width="2.8"/>
        <circle cx="0" cy="0" r="16" fill="none" stroke="#ffffff" stroke-width="3"/>
        <line x1="0" y1="-28" x2="0" y2="28" stroke="#38bdf8" stroke-width="2.6"/>
        <line x1="-26" y1="-14" x2="26" y2="14" stroke="#38bdf8" stroke-width="2.6"/>
        <line x1="-26" y1="14" x2="26" y2="-14" stroke="#38bdf8" stroke-width="2.6"/>
      </g>
    `,
  },
  cyber: {
    key: 'cyber',
    badge: 'CYBERSÉCURITÉ • PENTEST & OWASP',
    category: 'Cybersécurité',
    level: 'Ethical Hacking & Zero-Trust',
    symbol: 'CYBER SEC',
    codeSnippet: [
      { text: 'nmap -sV -sC -p- target.vibe.internal', color: '#10b981' },
      { text: 'const hash = await argon2.hash(secret);', color: '#34d399' },
      { text: 'verifyZeroTrustPolicy(jwt, tlsCert);', color: '#e2e8f0' },
      { text: '// OWASP Top 10 Shield Active', color: '#4ade80' },
    ],
    bgStart: '#021710',
    bgMid: '#064e3b',
    bgEnd: '#090d16',
    accent: '#10b981',
    accentAlt: '#22d3ee',
    logoSvg: `
      <g transform="translate(0, 0)">
        <circle cx="0" cy="0" r="56" fill="url(#logoGlow)" opacity="0.88"/>
        <path d="M0,-38 L30,-24 L30,4 C30,24 0,38 0,38 C0,38 -30,24 -30,4 L-30,-24 Z" fill="#042f24" stroke="#10b981" stroke-width="3"/>
        <rect x="-10" y="-4" width="20" height="16" rx="3" fill="#10b981"/>
        <path d="M-6,-4 L-6,-11 A6,6 0 0,1 6,-11 L6,-4" fill="none" stroke="#ffffff" stroke-width="2.8"/>
      </g>
    `,
  },
  nextjs: {
    key: 'nextjs',
    badge: 'NEXT.JS 15 & TYPESCRIPT 5 • SAAS',
    category: 'React & Web',
    level: 'SSR, App Router & Prisma',
    symbol: 'NEXT.JS 15 TS',
    codeSnippet: [
      { text: 'export async function createSaasProject(', color: '#38bdf8' },
      { text: '  input: z.infer<typeof ProjectSchema>', color: '#c084fc' },
      { text: ') { "use server";', color: '#fbbf24' },
      { text: '  return prisma.project.create({ data: input }); }', color: '#4ade80' },
    ],
    bgStart: '#050814',
    bgMid: '#1e293b',
    bgEnd: '#1e1b4b',
    accent: '#38bdf8',
    accentAlt: '#e2e8f0',
    logoSvg: `
      <g transform="translate(0, 0)">
        <circle cx="0" cy="0" r="56" fill="url(#logoGlow)" opacity="0.85"/>
        <circle cx="0" cy="0" r="45" fill="#090d16" stroke="#38bdf8" stroke-width="2.5"/>
        <text x="0" y="9" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="25" font-weight="900">TS</text>
      </g>
    `,
  },
  flutter: {
    key: 'flutter',
    badge: 'FLUTTER 3 & DART • MOBILE IOS/ANDROID',
    category: 'Mobile & Flutter',
    level: 'Cross-Platform 120FPS',
    symbol: 'FLUTTER 3',
    codeSnippet: [
      { text: 'class VibeMobileApp extends ConsumerWidget {', color: '#38bdf8' },
      { text: '  @override Widget build(context, ref) {', color: '#60a5fa' },
      { text: '    return MaterialApp.router(theme: dark);', color: '#e2e8f0' },
      { text: '  }', color: '#38bdf8' },
    ],
    bgStart: '#031229',
    bgMid: '#0c4a6e',
    bgEnd: '#1e1b4b',
    accent: '#38bdf8',
    accentAlt: '#06b6d4',
    logoSvg: `
      <g transform="translate(0, 0)">
        <circle cx="0" cy="0" r="56" fill="url(#logoGlow)" opacity="0.88"/>
        <circle cx="0" cy="0" r="45" fill="#061a33" stroke="#38bdf8" stroke-width="2.4"/>
        <polygon points="6,-26 -22,2 -10,14 30,-26" fill="#38bdf8"/>
        <polygon points="6,2 -10,18 6,30 30,2" fill="#06b6d4"/>
      </g>
    `,
  },
  rust: {
    key: 'rust',
    badge: 'RUST • SYSTÈMES SÛRS & CONCURRENCE',
    category: 'C & C++',
    level: 'Ownership & Tokio Async',
    symbol: 'RUST CARG0',
    codeSnippet: [
      { text: '#[tokio::main]', color: '#fbbf24' },
      { text: 'async fn process(data: &mut Vec<u8>) -> Result<()> {', color: '#fb923c' },
      { text: '  let slice = &data[..]; // Zero-copy borrow', color: '#e2e8f0' },
      { text: '  Ok(()) }', color: '#4ade80' },
    ],
    bgStart: '#1a0a04',
    bgMid: '#431407',
    bgEnd: '#111827',
    accent: '#fb923c',
    accentAlt: '#facc15',
    logoSvg: `
      <g transform="translate(0, 0)">
        <circle cx="0" cy="0" r="56" fill="url(#logoGlow)" opacity="0.88"/>
        <circle cx="0" cy="0" r="42" fill="#1c0d06" stroke="#fb923c" stroke-width="4" stroke-dasharray="10 5"/>
        <text x="0" y="9" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="23" font-weight="900">RS</text>
      </g>
    `,
  },
  golang: {
    key: 'golang',
    badge: 'GOLANG • MICROSERVICES & GRPC',
    category: 'Node & Cloud',
    level: 'Goroutines & Haute Perf',
    symbol: 'GOLANG 1.22',
    codeSnippet: [
      { text: 'ch := make(chan Event, 1024)', color: '#22d3ee' },
      { text: 'go func() { ch <- stream.Read() }()', color: '#38bdf8' },
      { text: 'select { case ev := <-ch: handle(ev) }', color: '#e2e8f0' },
      { text: '// Concurrent gRPC Microservice', color: '#4ade80' },
    ],
    bgStart: '#031824',
    bgMid: '#0e7490',
    bgEnd: '#0f172a',
    accent: '#22d3ee',
    accentAlt: '#38bdf8',
    logoSvg: `
      <g transform="translate(0, 0)">
        <circle cx="0" cy="0" r="56" fill="url(#logoGlow)" opacity="0.88"/>
        <circle cx="0" cy="0" r="45" fill="#052130" stroke="#22d3ee" stroke-width="2.5"/>
        <text x="0" y="9" text-anchor="middle" fill="#22d3ee" font-family="sans-serif" font-size="26" font-weight="900">GO</text>
      </g>
    `,
  },
  web3: {
    key: 'web3',
    badge: 'WEB3 • BLOCKCHAIN & SOLIDITY',
    category: 'Web3 & Blockchain',
    level: 'Smart Contracts EVM',
    symbol: 'ETHEREUM',
    codeSnippet: [
      { text: 'pragma solidity ^0.8.24;', color: '#a855f7' },
      { text: 'contract VibeVault is ReentrancyGuard {', color: '#38bdf8' },
      { text: '  mapping(address => uint256) public balances;', color: '#e2e8f0' },
      { text: '}', color: '#a855f7' },
    ],
    bgStart: '#0f0526',
    bgMid: '#311068',
    bgEnd: '#09152b',
    accent: '#a855f7',
    accentAlt: '#38bdf8',
    logoSvg: `
      <g transform="translate(0, 0)">
        <circle cx="0" cy="0" r="56" fill="url(#logoGlow)" opacity="0.88"/>
        <circle cx="0" cy="0" r="45" fill="#13082e" stroke="#a855f7" stroke-width="2.4"/>
        <polygon points="0,-30 20,0 0,10 -20,0" fill="#a855f7" opacity="0.85"/>
        <polygon points="0,14 20,4 0,30 -20,4" fill="#38bdf8" opacity="0.85"/>
      </g>
    `,
  },
};

export function getCourseTechMeta(courseOrTitle) {
  const title = (typeof courseOrTitle === 'string' ? courseOrTitle : (courseOrTitle?.title || '')).toLowerCase();
  const desc = (typeof courseOrTitle === 'object' ? (courseOrTitle?.description || '') : '').toLowerCase();
  const text = `${title} ${desc}`;

  if (text.includes('llm') || text.includes('rag') || text.includes('ia générative') || text.includes('langchain')) return TECH_THEMES.ai_llm;
  if (text.includes('pytorch') || text.includes('deep learning') || text.includes('computer vision')) return TECH_THEMES.deeplearning;
  if (text.includes('spark') || text.includes('kafka') || text.includes('data engineering') || text.includes('big data')) return TECH_THEMES.data_eng;
  if (text.includes('power bi') || text.includes('dax') || text.includes('data analytics') || text.includes('storytelling')) return TECH_THEMES.bi_analytics;
  if (text.includes('kubernetes') || text.includes('devops') || text.includes('terraform')) return TECH_THEMES.devops;
  if (text.includes('cybersécurité') || text.includes('pentest') || text.includes('hacking') || text.includes('owasp')) return TECH_THEMES.cyber;
  if (text.includes('next.js') || text.includes('typescript')) return TECH_THEMES.nextjs;
  if (text.includes('flutter') || text.includes('dart') || text.includes('mobile')) return TECH_THEMES.flutter;
  if (text.includes('rust') || text.includes('tokio')) return TECH_THEMES.rust;
  if (text.includes('golang') || /\bgo\b/.test(title) || text.includes('grpc')) return TECH_THEMES.golang;
  if (text.includes('web3') || text.includes('blockchain') || text.includes('solidity') || text.includes('ethereum')) return TECH_THEMES.web3;
  if (text.includes('java') || text.includes('spring')) return TECH_THEMES.java;
  if (text.includes('python') || text.includes('data') || text.includes('machine learning') || text.includes('ia')) return TECH_THEMES.python;
  if (text.includes('c#') || text.includes('.net') || text.includes('asp.net')) return TECH_THEMES.csharp;
  if (text.includes('c++') || text.includes('langage c') || /\bc\b/.test(title)) return TECH_THEMES.cpp;
  if (text.includes('laravel') || text.includes('php') || text.includes('sanctum')) return TECH_THEMES.laravel;
  if (text.includes('node') || text.includes('express') || text.includes('mongo')) return TECH_THEMES.node;
  if (text.includes('oracle') || text.includes('postgresql') || text.includes('sql') || text.includes('dba') || text.includes('base de données')) return TECH_THEMES.oracle;
  if (text.includes('css') || text.includes('glassmorphism') || text.includes('tailwind')) return TECH_THEMES.css;
  if (text.includes('ui') || text.includes('ux') || text.includes('figma') || text.includes('design')) return TECH_THEMES.uiux;
  return TECH_THEMES.react;
}

const COVER_CACHE = new Map();

export function getCourseCover(course) {
  const rawTitle = typeof course === 'string' ? course : (course?.title || 'MR1Academy Masterclass');
  const meta = getCourseTechMeta(course);
  const cacheKey = `${meta.key}:${rawTitle}`;
  if (COVER_CACHE.has(cacheKey)) {
    return COVER_CACHE.get(cacheKey);
  }

  // Split title cleanly into up to 2 concise lines BEFORE XML-escaping
  const cleanWords = String(rawTitle).trim().split(/\s+/);
  const rawLines = [];
  let current = '';
  cleanWords.forEach(w => {
    if ((current + ' ' + w).trim().length > 22 && rawLines.length < 1) {
      rawLines.push(current.trim());
      current = w;
    } else {
      current = (current + ' ' + w).trim();
    }
  });
  if (current) rawLines.push(current);

  const line0 = escapeXml((rawLines[0] || '').slice(0, 26));
  const line1 = escapeXml((rawLines[1] || '').slice(0, 28));

  const safeBadge = escapeXml(meta.badge);
  const safeLevel = escapeXml(meta.level);
  const safeSymbol = escapeXml(meta.symbol);
  const safeCategory = escapeXml(meta.category);
  const codeItems = meta.codeSnippet || [];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${meta.bgStart}"/>
        <stop offset="50%" stop-color="${meta.bgMid}"/>
        <stop offset="100%" stop-color="${meta.bgEnd}"/>
      </linearGradient>
      <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${meta.accent}"/>
        <stop offset="100%" stop-color="${meta.accentAlt}"/>
      </linearGradient>
      <linearGradient id="glassCard" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.12"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0.03"/>
      </linearGradient>
      <radialGradient id="logoGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${meta.accent}" stop-opacity="0.65"/>
        <stop offset="100%" stop-color="${meta.accent}" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="glowCenter" cx="28%" cy="48%" r="48%">
        <stop offset="0%" stop-color="${meta.accent}" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="${meta.accent}" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="glowRight" cx="78%" cy="35%" r="50%">
        <stop offset="0%" stop-color="${meta.accentAlt}" stop-opacity="0.32"/>
        <stop offset="100%" stop-color="${meta.accentAlt}" stop-opacity="0"/>
      </radialGradient>
    </defs>

    <!-- 1. Deep 3D Mesh Background -->
    <rect width="800" height="450" fill="url(#bg)"/>
    <rect width="800" height="450" fill="url(#glowCenter)"/>
    <rect width="800" height="450" fill="url(#glowRight)"/>

    <!-- 2. Perspective Cyber Grid & Glowing Nodes -->
    <g stroke="#ffffff" stroke-opacity="0.05" stroke-width="1">
      <line x1="0" y1="90" x2="800" y2="90"/>
      <line x1="0" y1="180" x2="800" y2="180"/>
      <line x1="0" y1="270" x2="800" y2="270"/>
      <line x1="0" y1="360" x2="800" y2="360"/>
      <line x1="160" y1="0" x2="160" y2="450"/>
      <line x1="320" y1="0" x2="320" y2="450"/>
      <line x1="480" y1="0" x2="480" y2="450"/>
      <line x1="640" y1="0" x2="640" y2="450"/>
    </g>

    <!-- Ambient Tech Orbits -->
    <circle cx="195" cy="215" r="125" fill="none" stroke="${meta.accent}" stroke-opacity="0.22" stroke-width="1.5" stroke-dasharray="8 6"/>
    <circle cx="195" cy="215" r="158" fill="none" stroke="${meta.accentAlt}" stroke-opacity="0.12" stroke-width="1"/>

    <!-- 3. Left-Center Hero: Giant 3D Tech Brand Emblem Pedestal -->
    <g transform="translate(195, 200) scale(1.55)">
      ${meta.logoSvg || ''}
    </g>

    <!-- Floating Tech Stack Pill Below Logo (Bottom-Left Safe Zone) -->
    <g transform="translate(45, 342)">
      <rect width="300" height="64" rx="16" fill="#070a14" fill-opacity="0.86" stroke="${meta.accent}" stroke-opacity="0.55" stroke-width="1.5"/>
      <rect x="14" y="14" width="6" height="36" rx="3" fill="url(#accentGrad)"/>
      <text x="32" y="31" fill="${meta.accent}" font-family="sans-serif" font-size="11" font-weight="900" letter-spacing="1.2">${safeBadge}</text>
      <text x="32" y="50" fill="#ffffff" font-family="sans-serif" font-size="14.5" font-weight="800">${line0}${line1 ? ' · ' + line1 : ''}</text>
    </g>

    <!-- 4. Right Side: Modern Dark VSCode / macOS IDE Window (Safe Zone x:395..760, y:78..348) -->
    <g transform="translate(395, 82)">
      <!-- Drop Shadow & Outer Glass Frame -->
      <rect x="6" y="10" width="365" height="255" rx="20" fill="#000000" fill-opacity="0.45"/>
      <rect width="365" height="255" rx="20" fill="#070a14" fill-opacity="0.92" stroke="#ffffff" stroke-opacity="0.18" stroke-width="1.5"/>

      <!-- IDE Top Bar -->
      <rect width="365" height="40" rx="20" fill="#ffffff" fill-opacity="0.04"/>
      <circle cx="24" cy="20" r="6" fill="#ef4444"/>
      <circle cx="44" cy="20" r="6" fill="#f59e0b"/>
      <circle cx="64" cy="20" r="6" fill="#22c55e"/>
      <rect x="92" y="10" width="145" height="20" rx="6" fill="#ffffff" fill-opacity="0.06"/>
      <text x="164" y="24" text-anchor="middle" fill="#cbd5e1" font-family="monospace" font-size="11" font-weight="700">${safeSymbol}</text>
      <text x="345" y="24" text-anchor="end" fill="${meta.accentAlt}" font-family="sans-serif" font-size="10.5" font-weight="800">${safeLevel}</text>
      <line x1="0" y1="40" x2="365" y2="40" stroke="#ffffff" stroke-opacity="0.08"/>

      <!-- Line Numbers + Syntax Highlighted Code -->
      <g font-family="monospace" font-size="13">
        <text x="18" y="74" fill="#475569">01</text>
        <text x="46" y="74" fill="${codeItems[0]?.color || meta.accent}" font-weight="700">${escapeXml(codeItems[0]?.text || '')}</text>

        <text x="18" y="104" fill="#475569">02</text>
        <text x="46" y="104" fill="${codeItems[1]?.color || '#e2e8f0'}">${escapeXml(codeItems[1]?.text || '')}</text>

        <text x="18" y="134" fill="#475569">03</text>
        <text x="46" y="134" fill="${codeItems[2]?.color || meta.accentAlt}">${escapeXml(codeItems[2]?.text || '')}</text>

        <text x="18" y="164" fill="#475569">04</text>
        <text x="46" y="164" fill="${codeItems[3]?.color || '#4ade80'}" font-weight="700">${escapeXml(codeItems[3]?.text || '')}</text>
      </g>

      <!-- IDE Bottom Status Bar -->
      <line x1="0" y1="194" x2="365" y2="194" stroke="#ffffff" stroke-opacity="0.07"/>
      <rect x="18" y="208" width="160" height="32" rx="9" fill="url(#glassCard)" stroke="${meta.accent}" stroke-opacity="0.6" stroke-width="1.2"/>
      <circle cx="34" cy="224" r="4.5" fill="#4ade80"/>
      <text x="98" y="228" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="11" font-weight="800">${safeCategory}</text>

      <rect x="192" y="208" width="154" height="32" rx="9" fill="#22c55e" fill-opacity="0.14" stroke="#4ade80" stroke-opacity="0.45" stroke-width="1.2"/>
      <text x="269" y="228" text-anchor="middle" fill="#4ade80" font-family="sans-serif" font-size="11" font-weight="800">VIBE ACADEMY PRO</text>
    </g>

    <!-- Bottom Neon Accent Bar -->
    <rect x="0" y="440" width="800" height="10" fill="url(#accentGrad)"/>
  </svg>`;

  let result;
  try {
    const base64 = window.btoa(unescape(encodeURIComponent(svg)));
    result = `data:image/svg+xml;base64,${base64}`;
  } catch {
    result = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }
  COVER_CACHE.set(cacheKey, result);
  return result;
}

export const COURSE_COVER_PRESETS = [
  { label: 'React 19 & Web', title: 'React 19 — Architecture & Hooks Avancés' },
  { label: 'Java 21 & Spring', title: 'Java 21 LTS & Spring Boot Microservices' },
  { label: 'Python & Data IA', title: 'Python pour la Data Science & Machine Learning' },
  { label: 'Laravel 11 & API', title: 'Laravel 11 — Architecture Fullstack & Sanctum' },
  { label: 'C / C++ Systèmes', title: 'Langage C & C++20 — Programmation Système' },
  { label: 'C# & .NET 8', title: 'C# 12 & ASP.NET Core — Applications Entreprise' },
  { label: 'Node.js & Cloud', title: 'Node.js, Express & Architecture Temps Réel' },
  { label: 'Oracle SQL & DBA', title: 'Oracle Database & SQL Avancé — Administration' },
  { label: 'Figma & UI/UX', title: 'UI/UX Design Pro — Figma & Design Systems' },
  { label: 'CSS3 & Motion', title: 'CSS Avancé, Glassmorphism & Animations 60fps' },
];

/* ─── 3. Comprehensive Domain-Specific Quiz Bank ─── */
const QUIZ_BANK = {
  java: [
    { q: "Quelle est la fonction du composant JVM (Java Virtual Machine) ?", options: ["Compiler le code source .java en .class", "Exécuter le bytecode Java sur n'importe quelle plateforme", "Gérer uniquement les bases de données", "Éditer le code source"], correct: 1 },
    { q: "Quel mot-clé est utilisé pour hériter d'une classe en Java ?", options: ["implements", "inherits", "extends", "super"], correct: 2 },
    { q: "En Java, quelle est la taille d'un type primitif `int` ?", options: ["16 bits", "32 bits", "64 bits", "8 bits"], correct: 1 },
    { q: "Quelle annotation Spring Boot combine @Configuration, @EnableAutoConfiguration et @ComponentScan ?", options: ["@SpringApplication", "@SpringBootApplication", "@EnableSpringBoot", "@RestController"], correct: 1 },
    { q: "Quelle collection Java n'autorise aucun élément en doublon ?", options: ["ArrayList", "LinkedList", "HashSet", "Vector"], correct: 2 },
    { q: "Comment déclare-t-on une constante en Java ?", options: ["const int MAX = 10;", "final int MAX = 10;", "static int MAX = 10;", "let MAX = 10;"], correct: 1 },
    { q: "Quel principe POO permet à une sous-classe de redéfinir une méthode de sa classe mère ?", options: ["L'encapsulation", "Le polymorphisme (Overriding)", "L'abstraction statique", "La sérialisation"], correct: 1 },
    { q: "Quelle interface est utilisée dans Spring Data JPA pour les opérations CRUD standards ?", options: ["JpaRepository", "CrudDao", "HibernateSession", "EntityManagerFactory"], correct: 0 },
  ],
  python: [
    { q: "Quelle bibliothèque Python est la référence pour la manipulation de DataFrames ?", options: ["Matplotlib", "Pandas", "Flask", "PyGame"], correct: 1 },
    { q: "Que retourne l'expression `[x**2 for x in range(4)]` en Python ?", options: ["[1, 4, 9, 16]", "[0, 1, 4, 9]", "[0, 2, 4, 6]", "(0, 1, 4, 9)"], correct: 1 },
    { q: "Quelle structure de données Python est immuable (immutable) ?", options: ["list", "dict", "set", "tuple"], correct: 3 },
    { q: "Dans Scikit-learn, quelle méthode permet d'entraîner un modèle de Machine Learning ?", options: ["model.train(X, y)", "model.fit(X, y)", "model.learn(X, y)", "model.predict(X)"], correct: 1 },
    { q: "Comment définit-on une fonction anonyme en Python ?", options: ["def()", "arrow =>", "lambda", "func"], correct: 2 },
    { q: "Quel objet NumPy représente un tableau multidimensionnel homogène ?", options: ["DataFrame", "Series", "ndarray", "TensorList"], correct: 2 },
    { q: "Quel mot-clé permet de gérer proprement l'ouverture et la fermeture d'un fichier ?", options: ["using", "with", "try-open", "defer"], correct: 1 },
  ],
  c_cpp: [
    { q: "En langage C, quel opérateur permet d'obtenir l'adresse mémoire d'une variable ?", options: ["*", "&", "->", "::"], correct: 1 },
    { q: "Quelle fonction standard du langage C permet d'allouer dynamiquement de la mémoire dans le tas (heap) ?", options: ["alloc()", "malloc()", "memnew()", "create()"], correct: 1 },
    { q: "Quelle fonction doit obligatoirement être appelée après `malloc()` pour éviter une fuite mémoire ?", options: ["delete()", "clear()", "free()", "release()"], correct: 2 },
    { q: "En C++, quel pointeur intelligent garantit une propriété unique de la ressource allouée ?", options: ["std::shared_ptr", "std::unique_ptr", "std::weak_ptr", "std::auto_ptr"], correct: 1 },
    { q: "Quel conteneur de la STL C++ stocke des éléments de manière contiguë en mémoire ?", options: ["std::list", "std::map", "std::vector", "std::set"], correct: 2 },
    { q: "Que représente le caractère `'\\0'` dans une chaîne de caractères en C ?", options: ["Un retour à la ligne", "La fin de la chaîne (Null terminator)", "Un espace vide", "Une erreur mémoire"], correct: 1 },
  ],
  csharp_dotnet: [
    { q: "En C# / .NET, quelle technologie permet d'interroger des collections de manière déclarative ?", options: ["LINQ", "JSX", "PDO", "Hibernate"], correct: 0 },
    { q: "Quel couple de mots-clés est utilisé en C# pour la programmation asynchrone ?", options: ["defer / yield", "async / await", "thread / lock", "future / promise"], correct: 1 },
    { q: "Quel est l'ORM officiel de Microsoft pour ASP.NET Core ?", options: ["Entity Framework Core", "Eloquent", "Prisma", "Sequelize"], correct: 0 },
    { q: "En C#, quelle est la différence entre une `interface` et une `class` ?", options: ["Une classe peut implémenter plusieurs interfaces", "Une interface contient des constructeurs d'état", "Une interface ne peut pas avoir de méthodes", "Aucune différence"], correct: 0 },
    { q: "Quel fichier configure le pipeline HTTP et l'injection de dépendances dans ASP.NET Core 8 ?", options: ["Program.cs", "Index.php", "Server.js", "Kernel.java"], correct: 0 },
  ],
  react: [
    { q: "Quel hook est utilisé pour gérer l'état local dans un composant fonctionnel React ?", options: ["useEffect", "useState", "useContext", "useRef"], correct: 1 },
    { q: "Comment transmet-on des données d'un composant parent vers un composant enfant ?", options: ["Via les props", "Via localStorage uniquement", "Via le DOM direct", "Via les cookies"], correct: 0 },
    { q: "Quel hook permet de mémoriser une valeur calculée coûteuse entre les rendus ?", options: ["useCallback", "useMemo", "useEffect", "useLayoutEffect"], correct: 1 },
    { q: "Quel tableau de dépendances de `useEffect` exécute l'effet uniquement au montage du composant ?", options: ["Aucun tableau", "Un tableau vide `[]`", "`[null]`", "`[true]`"], correct: 1 },
    { q: "À quoi sert principalement le hook `useRef` ?", options: ["Déclencher un re-rendu forcé", "Conserver une référence mutable ou cibler un élément DOM sans re-rendu", "Remplacer Redux", "Créer des routes"], correct: 1 },
    { q: "Pourquoi la prop `key` est-elle indispensable lors d'un `.map()` en React ?", options: ["Pour le style CSS", "Pour aider React à identifier quels éléments ont changé dans le Virtual DOM", "Pour trier le tableau", "Pour rendre la liste cliquable"], correct: 1 },
  ],
  laravel: [
    { q: "Comment s'appelle l'ORM intégré par défaut dans le framework Laravel ?", options: ["Doctrine", "Eloquent", "Prisma", "TypeORM"], correct: 1 },
    { q: "Quel package officiel Laravel fournit l'authentification par tokens pour les SPA et API ?", options: ["Laravel Sanctum", "Laravel Blade", "Laravel Mix", "Laravel Dusk"], correct: 0 },
    { q: "Quel est le rôle d'un Middleware dans Laravel ?", options: ["Gérer le rendu CSS", "Inspecter et filtrer les requêtes HTTP entrantes avant le contrôleur", "Créer des tables SQL", "Compiler du JavaScript"], correct: 1 },
    { q: "Quelle commande Artisan exécute toutes les migrations en attente ?", options: ["php artisan make:migration", "php artisan migrate", "php artisan db:seed", "php artisan serve"], correct: 1 },
    { q: "Où sont déclarées les routes stateless préfixées par `/api` dans Laravel ?", options: ["routes/web.php", "routes/api.php", "config/app.php", "app/Http/Kernel.php"], correct: 1 },
    { q: "Quelle méthode Eloquent permet de charger les relations à l'avance (Eager Loading) pour éviter le problème N+1 ?", options: ["Model::join()", "Model::with()", "Model::loadAll()", "Model::include()"], correct: 1 },
  ],
  node: [
    { q: "Sur quel moteur JavaScript repose l'environnement d'exécution Node.js ?", options: ["SpiderMonkey", "V8 de Google Chrome", "JavaScriptCore", "Chakra"], correct: 1 },
    { q: "Quel mécanisme permet à Node.js de gérer des milliers d'opérations I/O non bloquantes sur un seul thread ?", options: ["Le Multi-Threading natif", "L'Event Loop (Boucle d'événements)", "Le Garbage Collector", "Les Web Workers CSS"], correct: 1 },
    { q: "Dans Express.js, quelle est la signature standard d'un middleware ?", options: ["(req, res, next)", "(request, response)", "(ctx, err)", "(app, router)"], correct: 0 },
    { q: "Quel ODM est couramment utilisé avec Node.js pour modéliser des documents MongoDB ?", options: ["Sequelize", "Mongoose", "Eloquent", "Hibernate"], correct: 1 },
    { q: "Que contient la deuxième partie d'un token JWT (`Header.Payload.Signature`) ?", options: ["La clé privée du serveur", "Les claims (données encodées en Base64Url)", "Le mot de passe en clair", "Le certificat SSL"], correct: 1 },
  ],
  uiux_css: [
    { q: "Quelle propriété CSS est indispensable pour créer l'effet de flou d'arrière-plan du Glassmorphism ?", options: ["filter: blur()", "backdrop-filter: blur()", "opacity: 0.5", "mix-blend-mode: overlay"], correct: 1 },
    { q: "Dans Figma, quelle fonctionnalité permet de créer des interfaces responsives qui s'adaptent au contenu ?", options: ["Auto Layout", "Pixel Grid", "Flatten Selection", "Mask Group"], correct: 0 },
    { q: "Qu'est-ce qu'un Design System ?", options: ["Un simple fichier de logo", "Une bibliothèque centralisée de composants réutilisables, tokens et règles UX/UI", "Un éditeur de code", "Un hébergeur web"], correct: 1 },
    { q: "En CSS Grid, que signifie l'unité `1fr` ?", options: ["1 frame par seconde", "1 fraction de l'espace disponible dans la grille", "1 rem fixe", "100 pixels"], correct: 1 },
    { q: "Quel ratio de contraste minimum WCAG AA est recommandé pour du texte normal accessible ?", options: ["1.5 : 1", "4.5 : 1", "10 : 1", "2 : 1"], correct: 1 },
  ],
  sql_oracle: [
    { q: "Quelle clause SQL permet de filtrer les résultats d'une fonction d'agrégation après un `GROUP BY` ?", options: ["WHERE", "HAVING", "ORDER BY", "DISTINCT"], correct: 1 },
    { q: "Quelle jointure SQL retourne uniquement les lignes qui ont une correspondance dans les deux tables ?", options: ["LEFT OUTER JOIN", "INNER JOIN", "FULL OUTER JOIN", "CROSS JOIN"], correct: 1 },
    { q: "Dans Oracle Database, qu'est-ce que PL/SQL ?", options: ["Un protocole réseau", "Une extension procédurale du langage SQL propre à Oracle", "Un outil de design", "Un format de fichier JSON"], correct: 1 },
    { q: "Quelle propriété ACID garantit qu'une transaction est exécutée entièrement ou pas du tout ?", options: ["Atomicité", "Cohérence", "Isolation", "Durabilité"], correct: 0 },
    { q: "Quel objet de base de données accélère considérablement les recherches `SELECT` sur une colonne ?", options: ["Un Trigger", "Un Index (B-Tree)", "Une Séquence", "Un Synonyme"], correct: 1 },
  ],
  ai_llm: [
    { q: "Que signifie l'acronyme RAG en ingénierie IA Générative ?", options: ["Random Algorithm Generation", "Retrieval-Augmented Generation", "Recursive Agent Graph", "Realtime API Gateway"], correct: 1 },
    { q: "Quel est le rôle d'un modèle d'Embeddings dans une architecture RAG ?", options: ["Compresser des images JPEG", "Convertir du texte en vecteurs numériques capturant le sens sémantique", "Remplacer le serveur HTTP", "Chiffrer les mots de passe"], correct: 1 },
    { q: "Quelle architecture de réseau de neurones est à la base des LLMs modernes (GPT, Claude, Llama) ?", options: ["L'architecture Transformer avec mécanisme de Self-Attention", "Les arbres de décision", "La régression linéaire simple", "Le tri rapide Quicksort"], correct: 0 },
    { q: "Quelle méthode de Fine-Tuning permet d'entraîner un LLM efficacement en gelant les poids de base et en ajoutant des matrices de faible rang ?", options: ["LoRA / QLoRA (Low-Rank Adaptation)", "Full Backpropagation", "K-Means Clustering", "Dropout 100%"], correct: 0 },
    { q: "Qu'est-ce que le Function Calling (ou Tool Use) dans un Agent IA ?", options: ["La capacité du LLM à générer un appel structuré (JSON) vers des outils ou APIs externes", "Un appel téléphonique vocal", "Une erreur de compilation", "Une boucle infinie"], correct: 0 },
  ],
  deeplearning: [
    { q: "Dans PyTorch, quelle méthode calcule automatiquement les gradients de la fonction de coût par rétropropagation ?", options: ["loss.backward()", "loss.forward()", "model.eval()", "torch.no_grad()"], correct: 0 },
    { q: "Quel type de réseau de neurones est particulièrement adapté à l'analyse d'images et à la Computer Vision ?", options: ["CNN (Convolutional Neural Network) & Vision Transformers", "Un tableur Excel", "Une file FIFO simple", "Un arbre binaire de recherche"], correct: 0 },
    { q: "À quoi sert l'appel `optimizer.zero_grad()` dans une boucle d'entraînement PyTorch ?", options: ["À réinitialiser les gradients accumulés avant l'étape de rétropropagation suivante", "À supprimer le modèle de la mémoire GPU", "À arrêter le programme", "À sauvegarder le dataset"], correct: 0 },
    { q: "Quelle fonction d'activation remplace toutes les valeurs négatives par zéro : $f(x) = \\max(0, x)$ ?", options: ["Sigmoid", "ReLU (Rectified Linear Unit)", "Tanh", "Softmax"], correct: 1 },
    { q: "Comment transférer un modèle PyTorch sur la carte graphique NVIDIA pour l'accélération matérielle ?", options: ["model.to('cuda')", "model.to('cpu_only')", "model.enable_html()", "model.sort()"], correct: 0 },
  ],
  data_eng: [
    { q: "Quel est l'avantage principal d'Apache Spark par rapport au MapReduce traditionnel sur disque ?", options: ["Le traitement distribué en mémoire vive (In-Memory) ultra-rapide via les DataFrames/RDD", "Il ne fonctionne que sur un seul cœur CPU", "Il remplace le navigateur web", "Il ne supporte pas SQL"], correct: 0 },
    { q: "Quel est le rôle d'Apache Kafka dans une architecture Data moderne ?", options: ["Une plateforme distribuée de streaming d'événements temps réel à très haut débit", "Un éditeur d'images vectorielles", "Un gestionnaire de mots de passe", "Un compilateur C++"], correct: 0 },
    { q: "Quel format de fichier orienté colonnes est le standard pour le stockage analytique performant dans un Data Lakehouse ?", options: ["Apache Parquet", "Fichier .txt non structuré", "Image .bmp", "Audio .wav"], correct: 0 },
    { q: "Dans Apache Airflow, comment appelle-t-on le graphe orienté sans cycle qui définit l'ordonnancement d'un pipeline de données ?", options: ["Un DAG (Directed Acyclic Graph)", "Un DOM", "Un CSS", "Un JWT"], correct: 0 },
    { q: "En modélisation décisionnelle (Power BI / Data Warehouse), qu'est-ce qu'un Schéma en Étoile (Star Schema) ?", options: ["Une table de faits centrale entourée de tables de dimensions", "Une seule table sans clé primaire", "Un fichier JSON imbriqué", "Un câble réseau"], correct: 0 },
  ],
  devops: [
    { q: "Quel est l'intérêt d'un build Docker Multi-Stage ?", options: ["Réduire drastiquement la taille et la surface d'attaque de l'image finale de production", "Rendre l'image 10 fois plus lourde", "Désactiver le réseau", "Supprimer le code source"], correct: 0 },
    { q: "Dans Kubernetes, quelle est la plus petite unité déployable qui encapsule un ou plusieurs conteneurs ?", options: ["Un Pod", "Un Cluster entier", "Un DataCenter", "Un Hyperviseur"], correct: 0 },
    { q: "Quel outil d'Infrastructure as Code (IaC) permet de provisionner des ressources Cloud de manière déclarative ?", options: ["Terraform", "Photoshop", "VLC Media Player", "Postman"], correct: 0 },
    { q: "Quel composant Kubernetes expose les services HTTP/HTTPS vers l'extérieur du cluster avec routage par domaine ?", options: ["Un Ingress", "Un ConfigMap", "Un Secret", "Un PersistentVolume"], correct: 0 },
    { q: "Quel couple d'outils open-source est la référence pour le monitoring de métriques et la visualisation de dashboards DevOps ?", options: ["Prometheus & Grafana", "Word & Excel", "Git & SVN", "FTP & Telnet"], correct: 0 },
  ],
  cyber: [
    { q: "Quelle est la protection fondamentale contre les attaques par Injection SQL (SQLi) ?", options: ["Utiliser systématiquement des requêtes préparées (Prepared Statements / Paramétrées)", "Cacher le formulaire avec du CSS", "Changer la couleur du site", "Utiliser HTTP au lieu de HTTPS"], correct: 0 },
    { q: "En quoi consiste une vulnérabilité XSS (Cross-Site Scripting) ?", options: ["L'injection de scripts malveillants exécutés dans le navigateur des autres utilisateurs", "Une panne électrique du serveur", "Un câble Ethernet débranché", "Une mise à jour Windows"], correct: 0 },
    { q: "Quel algorithme moderne est recommandé par l'OWASP pour le hachage sécurisé des mots de passe ?", options: ["Argon2id (ou bcrypt avec coût élevé)", "MD5 sans sel", "Base64 simple", "CRC32"], correct: 0 },
    { q: "Quel est le principe fondamental d'une architecture de sécurité Zero-Trust ?", options: ["Ne jamais faire confiance implicitement, toujours vérifier et authentifier chaque requête (« Never Trust, Always Verify »)", "Autoriser tout le trafic interne sans mot de passe", "Désactiver le pare-feu", "Partager une seule clé admin"], correct: 0 },
    { q: "Quel outil en ligne de commande est le standard pour l'exploration réseau et l'audit des ports ouverts ?", options: ["Nmap", "calc.exe", "notepad", "mkdir"], correct: 0 },
  ],
  flutter: [
    { q: "Dans Flutter, quelle est la différence entre un `StatelessWidget` et un `StatefulWidget` ?", options: ["Un StatefulWidget possède un objet `State` mutable qui redessine l'UI via `setState()`, contrairement au StatelessWidget immuable", "StatelessWidget est réservé à iOS uniquement", "StatefulWidget ne peut pas afficher de texte", "Aucune différence"], correct: 0 },
    { q: "Quel moteur graphique haute performance permet à Flutter de compiler et dessiner ses interfaces à 120 FPS ?", options: ["Impeller / Skia", "Internet Explorer 6", "Apache Tomcat", "Microsoft Access"], correct: 0 },
    { q: "En Dart 3, à quoi sert le Sound Null Safety (`String?` vs `String`) ?", options: ["À garantir à la compilation qu'une variable non-nullable ne pourra jamais provoquer d'erreur Null Reference", "À ralentir l'application", "À supprimer les types", "À convertir le code en PHP"], correct: 0 },
    { q: "Quel package moderne est recommandé pour le State Management réactif et compile-safe dans Flutter ?", options: ["Riverpod (ou Bloc)", "jQuery", "Bootstrap", "Laravel Mix"], correct: 0 },
    { q: "Quel widget Flutter permet d'afficher efficacement une très longue liste d'éléments en ne construisant que ceux visibles à l'écran ?", options: ["ListView.builder", "Column simple", "Container fixe", "SizedBox"], correct: 0 },
  ],
  rust_go: [
    { q: "Comment Rust garantit-il la sécurité mémoire sans utiliser de Garbage Collector ?", options: ["Grâce au système d'Ownership, de Borrowing et de Lifetimes vérifié à la compilation", "En redémarrant le PC toutes les 5 minutes", "En interdisant les fonctions", "En utilisant une machine virtuelle Java"], correct: 0 },
    { q: "En Rust, quel type énuméré est utilisé pour représenter une opération pouvant réussir (`Ok(T)`) ou échouer (`Err(E)`) ?", options: ["Result<T, E>", "Nullable", "Exception", "Void"], correct: 0 },
    { q: "En Go (Golang), comment lance-t-on l'exécution concurrente ultra-légère d'une fonction ?", options: ["Avec le mot-clé `go maFonction()` (Goroutine)", "Avec `new Thread().start()`", "Avec `fork()`", "Avec `async_run()`"], correct: 0 },
    { q: "Quel mécanisme natif de Go permet à deux Goroutines de communiquer et de se synchroniser en toute sécurité ?", options: ["Les Channels (`chan`)", "Les fichiers .ini", "Les cookies navigateur", "Les variables globales non protégées"], correct: 0 },
    { q: "Quel framework d'appel de procédures à distance basé sur HTTP/2 et Protocol Buffers est massivement utilisé avec Go ?", options: ["gRPC", "SOAP XML 1999", "FTP", "Telnet"], correct: 0 },
  ],
  web3: [
    { q: "Quel langage est la référence pour écrire des Smart Contracts sur la machine virtuelle Ethereum (EVM) ?", options: ["Solidity", "HTML5", "CSS3", "Bash"], correct: 0 },
    { q: "Sur Ethereum, à quoi sert le « Gas » ?", options: ["À mesurer et rémunérer la puissance de calcul nécessaire à l'exécution d'une transaction ou d'un Smart Contract", "À refroidir l'écran", "À compresser les images", "À héberger des vidéos MP4"], correct: 0 },
    { q: "Quel standard Ethereum définit l'interface des jetons fongibles (Tokens) ?", options: ["ERC-20", "HTTP-404", "ISO-9001", "UTF-8"], correct: 0 },
    { q: "Quelle attaque classique sur les Smart Contracts consiste à rappeler une fonction de retrait avant la mise à jour du solde ?", options: ["L'attaque par Réentrance (Reentrancy)", "Le DDoS DNS", "Le Phishing par SMS", "Le dépassement d'écran"], correct: 0 },
    { q: "Dans Solidity, que représente la variable globale `msg.sender` ?", options: ["L'adresse Ethereum du compte ou du contrat qui a appelé directement la fonction", "L'adresse IP du routeur Wi-Fi", "Le mot de passe de l'utilisateur", "Le nom du navigateur"], correct: 0 },
  ],
};

export function getCourseQuestions(courseOrTitle) {
  const title = (typeof courseOrTitle === 'string' ? courseOrTitle : (courseOrTitle?.title || '')).toLowerCase();
  const desc = (typeof courseOrTitle === 'object' ? (courseOrTitle?.description || '') : '').toLowerCase();
  const text = `${title} ${desc}`;

  if (text.includes('llm') || text.includes('rag') || text.includes('ia générative') || text.includes('langchain')) return QUIZ_BANK.ai_llm;
  if (text.includes('pytorch') || text.includes('deep learning') || text.includes('computer vision')) return QUIZ_BANK.deeplearning;
  if (text.includes('spark') || text.includes('kafka') || text.includes('data engineering') || text.includes('power bi') || text.includes('dax') || text.includes('big data')) return QUIZ_BANK.data_eng;
  if (text.includes('kubernetes') || text.includes('devops') || text.includes('terraform') || text.includes('docker')) return QUIZ_BANK.devops;
  if (text.includes('cybersécurité') || text.includes('pentest') || text.includes('hacking') || text.includes('owasp')) return QUIZ_BANK.cyber;
  if (text.includes('flutter') || text.includes('dart') || text.includes('mobile')) return QUIZ_BANK.flutter;
  if (text.includes('rust') || text.includes('golang') || /\bgo\b/.test(title) || text.includes('grpc')) return QUIZ_BANK.rust_go;
  if (text.includes('web3') || text.includes('blockchain') || text.includes('solidity') || text.includes('ethereum')) return QUIZ_BANK.web3;
  if (text.includes('java') || text.includes('spring')) return QUIZ_BANK.java;
  if (text.includes('python') || text.includes('data') || text.includes('machine learning')) return QUIZ_BANK.python;
  if (text.includes('c#') || text.includes('.net') || text.includes('asp.net')) return QUIZ_BANK.csharp_dotnet;
  if (text.includes('c++') || text.includes('langage c') || /\bc\b/.test(title)) return QUIZ_BANK.c_cpp;
  if (text.includes('laravel') || text.includes('php') || text.includes('sanctum')) return QUIZ_BANK.laravel;
  if (text.includes('node') || text.includes('express') || text.includes('mongo')) return QUIZ_BANK.node;
  if (text.includes('oracle') || text.includes('postgresql') || text.includes('sql') || text.includes('base de données')) return QUIZ_BANK.sql_oracle;
  if (text.includes('ui') || text.includes('ux') || text.includes('figma') || text.includes('css') || text.includes('glassmorphism')) return QUIZ_BANK.uiux_css;
  return QUIZ_BANK.react;
}

/* ─── 4. High-DPI HTML5 Canvas Certificate Generator (.PNG Download) ─── */
export function downloadCertificatePNG({
  studentName = 'Étudiant MR1Academy',
  courseTitle = 'Formation Complète',
  instructorName = 'Expert Certifié MR1Academy',
  score = 100,
  certificateUid = 'VIBE-2026-01-PRO',
  certifiedDate = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
  totalDuration = '2h 30m',
  modulesCount = 5,
}) {
  const canvas = document.createElement('canvas');
  canvas.width = 2000;
  canvas.height = 1414;
  const ctx = canvas.getContext('2d');

  // 1. Deep Luxury Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  bgGrad.addColorStop(0, '#05050d');
  bgGrad.addColorStop(0.5, '#0d0922');
  bgGrad.addColorStop(1, '#060a17');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle radial glows
  const glow1 = ctx.createRadialGradient(400, 300, 50, 400, 300, 650);
  glow1.addColorStop(0, 'rgba(139, 92, 246, 0.22)');
  glow1.addColorStop(1, 'rgba(139, 92, 246, 0)');
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const glow2 = ctx.createRadialGradient(1600, 1100, 50, 1600, 1100, 650);
  glow2.addColorStop(0, 'rgba(0, 209, 255, 0.18)');
  glow2.addColorStop(1, 'rgba(0, 209, 255, 0)');
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Ornamental Outer & Inner Frames
  const borderGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  borderGrad.addColorStop(0, '#8b5cf6');
  borderGrad.addColorStop(0.5, '#00d1ff');
  borderGrad.addColorStop(1, '#ec4899');

  ctx.strokeStyle = borderGrad;
  ctx.lineWidth = 6;
  ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 2;
  ctx.strokeRect(84, 84, canvas.width - 168, canvas.height - 168);

  // Corner accents
  const corners = [
    [60, 60, 1, 1],
    [canvas.width - 60, 60, -1, 1],
    [60, canvas.height - 60, 1, -1],
    [canvas.width - 60, canvas.height - 60, -1, -1],
  ];
  ctx.strokeStyle = '#00d1ff';
  ctx.lineWidth = 5;
  corners.forEach(([cx, cy, dx, dy]) => {
    ctx.beginPath();
    ctx.moveTo(cx, cy + dy * 70);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + dx * 70, cy);
    ctx.stroke();
  });

  // 3. Top Seal / Brand Header
  ctx.textAlign = 'center';
  ctx.fillStyle = '#00d1ff';
  ctx.font = '700 24px Outfit, Inter, sans-serif';
  ctx.fillText('V I B E A C A D E M Y   •   O F F I C I A L   C E R T I F I C A T I O N', canvas.width / 2, 195);

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 68px Outfit, Inter, sans-serif';
  ctx.fillText('CERTIFICAT DE RÉUSSITE', canvas.width / 2, 290);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '400 28px Inter, sans-serif';
  ctx.fillText('Ce diplôme officiel est décerné avec honneur à', canvas.width / 2, 375);

  // 4. Student Name
  const nameGrad = ctx.createLinearGradient(600, 420, 1400, 520);
  nameGrad.addColorStop(0, '#ffffff');
  nameGrad.addColorStop(0.5, '#c4b5fd');
  nameGrad.addColorStop(1, '#38bdf8');
  ctx.fillStyle = nameGrad;
  ctx.font = '800 86px Outfit, Inter, sans-serif';
  ctx.fillText(studentName, canvas.width / 2, 495);

  // Decorative divider under name
  ctx.strokeStyle = borderGrad;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(650, 535);
  ctx.lineTo(1350, 535);
  ctx.stroke();

  // 5. Course Title & Achievement Details
  ctx.fillStyle = '#94a3b8';
  ctx.font = '400 28px Inter, sans-serif';
  ctx.fillText('pour avoir complété 100% de la playlist pédagogique et validé l\'examen final du cursus', canvas.width / 2, 615);

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 54px Outfit, Inter, sans-serif';
  ctx.fillText(`« ${courseTitle} »`, canvas.width / 2, 705);

  // Metrics Pill Box
  ctx.fillStyle = 'rgba(139, 92, 246, 0.14)';
  ctx.strokeStyle = 'rgba(139, 92, 246, 0.45)';
  ctx.lineWidth = 2;
  const pillW = 980;
  const pillH = 78;
  const pillX = (canvas.width - pillW) / 2;
  const pillY = 765;
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, pillH, 20);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#4ade80';
  ctx.font = '700 28px Inter, sans-serif';
  ctx.fillText(
    `Score d'examen : ${score}%   •   ${modulesCount} Modules Validés   •   Volume : ${totalDuration}`,
    canvas.width / 2,
    pillY + 49
  );

  // 6. Official Gold/Cyan Badge Seal in Center Bottom
  const sealX = canvas.width / 2;
  const sealY = 1045;
  const sealGrad = ctx.createRadialGradient(sealX, sealY, 10, sealX, sealY, 85);
  sealGrad.addColorStop(0, '#f59e0b');
  sealGrad.addColorStop(1, '#7c3aed');
  ctx.fillStyle = sealGrad;
  ctx.beginPath();
  ctx.arc(sealX, sealY, 78, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(sealX, sealY, 66, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 22px Outfit, sans-serif';
  ctx.fillText('VIBE PRO', sealX, sealY - 6);
  ctx.font = '700 18px Inter, sans-serif';
  ctx.fillText('VERIFIED', sealX, sealY + 22);

  // 7. Signatures & Serial Verification Block
  // Left: Instructor Signature
  ctx.textAlign = 'center';
  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'italic 700 34px Georgia, serif';
  ctx.fillText(instructorName, 420, 1040);

  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(220, 1065);
  ctx.lineTo(620, 1065);
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 22px Inter, sans-serif';
  ctx.fillText('Instructeur & Jury Pédagogique', 420, 1105);

  // Right: Date & Serial ID
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 26px Inter, sans-serif';
  ctx.fillText(`Délivré le ${certifiedDate}`, 1580, 1035);

  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath();
  ctx.moveTo(1380, 1065);
  ctx.lineTo(1780, 1065);
  ctx.stroke();

  ctx.fillStyle = '#00d1ff';
  ctx.font = '700 22px monospace';
  ctx.fillText(`ID: ${certificateUid}`, 1580, 1105);

  // Bottom verification footer
  ctx.fillStyle = '#64748b';
  ctx.font = '500 20px Inter, sans-serif';
  ctx.fillText(
    `Certificat authentifié numériquement par MR1Academy • Norme ISO/CEI Formation • Code de vérification : ${certificateUid}`,
    canvas.width / 2,
    1280
  );

  // Trigger PNG download
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `Certificat-${courseTitle.replace(/[^a-z0-9]/gi, '_')}-${certificateUid}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* ─── 5. Printable Vector PDF Certificate Window ─── */
export function openCertificatePrintWindow({
  studentName = 'Étudiant MR1Academy',
  courseTitle = 'Formation Complète',
  instructorName = 'Expert Certifié MR1Academy',
  score = 100,
  certificateUid = 'VIBE-2026-01-PRO',
  certifiedDate = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
  totalDuration = '2h 30m',
  modulesCount = 5,
}) {
  const certWindow = window.open('', '_blank');
  if (!certWindow) return;
  certWindow.document.write(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Certificat Officiel – ${courseTitle} (${certificateUid})</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Outfit:wght@500;700;800&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    @page { size: A4 landscape; margin: 0; }
    body { font-family:'Outfit',sans-serif; background:#05050d; color:#fff; display:flex; align-items:center; justify-content:center; min-height:100vh; padding: 20px; }
    .cert-sheet { width:1050px; height:740px; padding:52px 68px; background:linear-gradient(135deg,#070714 0%,#100b28 55%,#070c1a 100%); border-radius:24px; position:relative; display:flex; flex-direction:column; align-items:center; justify-content:space-between; text-align:center; border:3px solid #8b5cf6; box-shadow: 0 25px 70px rgba(0,0,0,0.8); overflow:hidden; }
    .inner-frame { position:absolute; inset:16px; border:1px solid rgba(0,209,255,0.25); border-radius:16px; pointer-events:none; }
    .badge-top { font-size:0.78rem; letter-spacing:5px; color:#00d1ff; font-weight:700; text-transform:uppercase; }
    .main-title { font-size:2.6rem; font-weight:800; letter-spacing:1px; margin-top:0.3rem; }
    .subtitle { font-family:'Inter',sans-serif; color:#94a3b8; font-size:0.95rem; }
    .student { font-size:3.2rem; font-weight:800; background:linear-gradient(135deg,#ffffff,#c4b5fd,#38bdf8); -webkit-background-clip:text; -webkit-text-fill-color:transparent; padding:0.2rem 0; border-bottom:2px solid rgba(139,92,246,0.45); min-width:480px; }
    .course { font-size:1.75rem; font-weight:800; color:#fff; margin:0.3rem 0; }
    .metrics { display:inline-flex; gap:1.5rem; background:rgba(139,92,246,0.14); border:1px solid rgba(139,92,246,0.4); padding:0.65rem 1.75rem; border-radius:99px; font-family:'Inter',sans-serif; font-size:0.88rem; font-weight:700; color:#4ade80; }
    .footer { display:flex; justify-content:space-between; align-items:flex-end; width:100%; margin-top:1rem; padding-top:1rem; border-top:1px solid rgba(255,255,255,0.08); font-family:'Inter',sans-serif; }
    .sig-box { text-align:center; width:240px; }
    .sig-script { font-family:Georgia,serif; font-style:italic; font-size:1.35rem; color:#e2e8f0; margin-bottom:0.35rem; }
    .sig-line { height:1px; background:rgba(255,255,255,0.2); margin-bottom:0.35rem; }
    .sig-label { font-size:0.75rem; color:#94a3b8; }
    .seal { width:84px; height:84px; border-radius:50%; background:linear-gradient(135deg,#f59e0b,#7c3aed); display:flex; flex-direction:column; align-items:center; justify-content:center; font-weight:800; font-size:0.7rem; border:3px solid #fff; box-shadow:0 0 30px rgba(139,92,246,0.5); }
    .uid { font-family:monospace; color:#00d1ff; font-size:0.85rem; font-weight:700; margin-top:4px; }
  </style>
</head>
<body>
  <div class="cert-sheet">
    <div class="inner-frame"></div>
    <div>
      <div class="badge-top">MR1Academy • Organisme de Certification Tech</div>
      <div class="main-title">CERTIFICAT DE RÉUSSITE</div>
      <div class="subtitle" style="margin-top:0.4rem;">Ce diplôme officiel est décerné avec honneur à</div>
    </div>

    <div class="student">${studentName}</div>

    <div>
      <div class="subtitle">pour avoir complété l'intégralité de la playlist vidéo et réussi l'examen final du cursus</div>
      <div class="course">« ${courseTitle} »</div>
      <div class="metrics" style="margin-top:0.65rem;">
        <span>✓ Score Final : ${score}%</span>
        <span>•</span>
        <span>${modulesCount} Modules Validés</span>
        <span>•</span>
        <span>Durée : ${totalDuration}</span>
      </div>
    </div>

    <div class="footer">
      <div class="sig-box">
        <div class="sig-script">${instructorName}</div>
        <div class="sig-line"></div>
        <div class="sig-label">Instructeur & Directeur Pédagogique</div>
      </div>

      <div class="seal">
        <span>VIBE PRO</span>
        <span style="font-size:0.6rem;opacity:0.9;">CERTIFIED</span>
      </div>

      <div class="sig-box">
        <div style="font-size:0.85rem;font-weight:700;color:#fff;">Délivré le ${certifiedDate}</div>
        <div class="uid">ID: ${certificateUid}</div>
        <div class="sig-line" style="margin-top:0.35rem;"></div>
        <div class="sig-label">Signature & Empreinte Numérique</div>
      </div>
    </div>
  </div>
  <script>setTimeout(() => { window.print(); }, 450);</script>
</body>
</html>`);
  certWindow.document.close();
}

// ─── 6. Favorites & Study Collections Persistence (Server + Local Sync) ───
const LOCAL_FAV_IDS_KEY = 'vibe_local_fav_ids_v1';
const LOCAL_FAV_META_KEY = 'vibe_local_fav_meta_v1';

export function getLocalFavoriteIds() {
  try {
    const raw = JSON.parse(localStorage.getItem(LOCAL_FAV_IDS_KEY) || '[]');
    return Array.isArray(raw) ? raw.map(Number).filter(Boolean) : [];
  } catch {
    return [];
  }
}

export function setLocalFavoriteIds(ids) {
  try {
    const unique = Array.from(new Set((ids || []).map(Number).filter(Boolean)));
    localStorage.setItem(LOCAL_FAV_IDS_KEY, JSON.stringify(unique));
    return unique;
  } catch {
    return [];
  }
}

export function toggleLocalFavoriteId(courseId, forceState = null) {
  const numId = Number(courseId);
  const current = getLocalFavoriteIds();
  const exists = current.includes(numId);
  const nextState = forceState !== null ? Boolean(forceState) : !exists;
  const nextIds = nextState
    ? Array.from(new Set([...current, numId]))
    : current.filter(id => id !== numId);
  setLocalFavoriteIds(nextIds);
  return { favorited: nextState, ids: nextIds };
}

export function getAllLocalFavoritesMeta() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_FAV_META_KEY) || '{}');
  } catch {
    return {};
  }
}

export function getLocalFavoriteMeta(courseId) {
  const all = getAllLocalFavoritesMeta();
  return all[String(courseId)] || {
    priority: 'medium',
    collection: 'À étudier',
    personal_note: '',
  };
}

export function saveLocalFavoriteMeta(courseId, patch) {
  try {
    const all = getAllLocalFavoritesMeta();
    const current = all[String(courseId)] || {
      priority: 'medium',
      collection: 'À étudier',
      personal_note: '',
    };
    const updated = { ...current, ...patch, updatedAt: new Date().toISOString() };
    all[String(courseId)] = updated;
    localStorage.setItem(LOCAL_FAV_META_KEY, JSON.stringify(all));
    return updated;
  } catch {
    return patch;
  }
}

