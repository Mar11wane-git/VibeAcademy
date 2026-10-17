import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, MessageSquare, Heart, Share2, Award, Zap, Compass, Star, X,
  CheckCircle2, Search, Code2, Copy, Check, Plus, ExternalLink,
  Calendar as CalendarIcon, Clock, Trash2, Sparkles, Filter, Eye, BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useApp } from '../context/AppContext';
import { getCourseCover } from '../utils/certificationEngine';

const THREADS_STORAGE_KEY = 'vibe_community_threads_v2';
const PROJECTS_STORAGE_KEY = 'vibe_community_projects_v2';
const AGENDA_STORAGE_KEY = 'vibe_agenda_events_v2';

const FALLBACK_THREADS = [
  {
    id: 1,
    author: 'Yassine El Amrani',
    avatar: 'Y',
    title: 'Comment éviter les re-renders inutiles avec useMemo et React 19 ?',
    body: 'Je travaille sur le module avancé du cours React 19. J\'ai une liste de 2 000 éléments filtrés dynamiquement et je veux m\'assurer que mes composants enfants ne se re-rendent pas à chaque frappe clavier. Voici mon hook actuel :',
    code_snippet: "const visibleItems = useMemo(() => {\n  return items.filter(item => item.name.toLowerCase().includes(deferredQuery));\n}, [items, deferredQuery]);",
    code_lang: 'javascript',
    replies: 2,
    likes: 42,
    is_solved: true,
    views: 184,
    tag: 'React',
    time: 'Il y a 2h',
    replyList: [
      { id: 101, author: 'Coach Alex (Mentor)', avatar: 'C', text: 'Excellente approche ! Combine `useDeferredValue(query)` avec `React.memo` sur ton composant ligne. Avec le compilateur React 19, la mémoïsation est aussi automatisée si tes props restent pures.', is_solution: true, time: 'Il y a 1h' },
      { id: 102, author: 'Salma Benali', avatar: 'S', text: 'Merci ! Ça m\'a permis de valider la question 4 du Quiz React avec 100% !', is_solution: false, time: 'Il y a 30m' },
    ],
  },
  {
    id: 2,
    author: 'Karim Tazi',
    avatar: 'K',
    title: 'Optimisation requête N+1 dans Laravel 11 Eloquent API',
    body: 'Lors du chargement des playlists et de leurs modules vidéo dans mon contrôleur Laravel, je remarquais 15 requêtes SQL exécutées au lieu de 2. Voici la solution avec `with()` et sélection de colonnes :',
    code_snippet: "$courses = Course::with(['modules:id,course_id,title,duration'])\n    ->select('id', 'title', 'category', 'level')\n    ->latest()\n    ->get();",
    code_lang: 'php',
    replies: 1,
    likes: 37,
    is_solved: true,
    views: 142,
    tag: 'Laravel',
    time: 'Il y a 4h',
    replyList: [
      { id: 103, author: 'Mentor Sarah', avatar: 'M', text: 'Très propre ! Tu peux même ajouter `Model::preventLazyLoading(!app()->isProduction())` dans `AppServiceProvider` pour détecter automatiquement tout N+1.', is_solution: true, time: 'Il y a 3h' },
    ],
  },
  {
    id: 3,
    author: 'Amina Mansouri',
    avatar: 'A',
    title: 'Différence entre std::unique_ptr et std::shared_ptr en C++20 (RAII)',
    body: 'Je prépare le Quiz de certification du cours Langage C & C++20. Quelqu\'un a une règle simple pour savoir quand utiliser `std::unique_ptr` vs `std::shared_ptr` et `std::weak_ptr` ?',
    code_snippet: "auto node = std::make_unique<EngineNode>(1024);\n// Transfert explicite de propriété sans copie :\nauto owner2 = std::move(node);",
    code_lang: 'cpp',
    replies: 1,
    likes: 29,
    is_solved: true,
    views: 118,
    tag: 'C/C++',
    time: 'Il y a 6h',
    replyList: [
      { id: 104, author: 'Pr. Mehdi (Systèmes)', avatar: 'P', text: 'Règle d\'or : utilise `std::unique_ptr` par défaut (zéro surcoût mémoire). N\'utilise `std::shared_ptr` que si plusieurs objets partagent réellement le cycle de vie.', is_solution: true, time: 'Il y a 5h' },
    ],
  },
  {
    id: 4,
    author: 'Omar Berrada',
    avatar: 'O',
    title: 'Pipeline Data Science Python : Pandas vectorisation vs boucles for',
    body: 'Sur un dataset de 500 000 lignes, remplacer `.iterrows()` par une opération vectorisée NumPy/Pandas a réduit le temps d\'exécution de 14 secondes à 18 millisecondes !',
    code_snippet: "# Vectorisation ultra-rapide NumPy / Pandas\ndf['score_normalise'] = np.where(df['progress'] >= 100, df['quiz_score'] * 1.15, df['quiz_score'])",
    code_lang: 'python',
    replies: 1,
    likes: 54,
    is_solved: false,
    views: 230,
    tag: 'Python',
    time: 'Hier',
    replyList: [
      { id: 105, author: 'Nadia DataLead', avatar: 'N', text: 'Exactement ! La vectorisation délègue la boucle directement au code C précompilé de NumPy.', is_solution: false, time: 'Il y a 18h' },
    ],
  },
];

const FALLBACK_PROJECTS = [
  {
    id: 1,
    author_name: 'Sofia El Idrissi',
    author_role: 'Certifiée React 19 & Laravel 11',
    title: 'VibeCloud Monitor — Dashboard DevOps Temps Réel',
    description: 'Interface de télémétrie serveur temps réel avec WebSockets, graphiques SVG fluides, alertes automatiques et API REST Laravel 11 sécurisée par Sanctum.',
    category: 'React & Laravel',
    tech_stack: ['React 19', 'Laravel 11', 'WebSockets', 'Tailwind'],
    github_url: 'https://github.com/MR1Academy/vibecloud-monitor',
    demo_url: 'https://vibecloud-demo.vercel.app',
    likes: 86,
  },
  {
    id: 2,
    author_name: 'Mehdi Chraibi',
    author_role: 'Certifié Python Data Science & SQL',
    title: 'NeuroPredict AI — Analyse Prédictive Médicale',
    description: 'Pipeline complet de Machine Learning sous Python 3.12 (Pandas, Scikit-Learn, FastAPI) avec visualisation interactive des matrices de corrélation et export PDF.',
    category: 'Python & IA',
    tech_stack: ['Python 3.12', 'Scikit-Learn', 'Pandas', 'FastAPI'],
    github_url: 'https://github.com/MR1Academy/neuropredict-ai',
    demo_url: 'https://neuropredict-demo.vercel.app',
    likes: 74,
  },
  {
    id: 3,
    author_name: 'Youssef Bennani',
    author_role: 'Certifié Java 21 & Oracle Database',
    title: 'FinCore Engine — Microservices Bancaires Haute Fréquence',
    description: 'Architecture hexagonale sous Java 21 (Virtual Threads, Spring Boot 3) couplée à des procédures PL/SQL optimisées pour le traitement transactionnel.',
    category: 'Java & SQL',
    tech_stack: ['Java 21', 'Spring Boot 3', 'Oracle PL/SQL', 'Docker'],
    github_url: 'https://github.com/MR1Academy/fincore-engine',
    demo_url: 'https://fincore-docs.vercel.app',
    likes: 63,
  },
  {
    id: 4,
    author_name: 'Inès Berrada',
    author_role: 'Certifiée UI/UX Figma & CSS Architecture',
    title: 'Aura Design System — Kit Glassmorphism & Composants A11y',
    description: 'Bibliothèque de 60+ composants accessibles WCAG AAA avec tokens CSS variables, animations Framer Motion et fichier source Figma complet.',
    category: 'Figma & CSS3',
    tech_stack: ['Figma', 'CSS3 Grid', 'React', 'Framer Motion'],
    github_url: 'https://github.com/MR1Academy/aura-design-system',
    demo_url: 'https://aura-ui-demo.vercel.app',
    likes: 95,
  },
  {
    id: 5,
    author_name: 'Adam Ouazzani',
    author_role: 'Certifié C & C++20 Systèmes',
    title: 'VoxelRay — Moteur de Rendu 3D & Allocateur Mémoire C++20',
    description: 'Moteur de raytracing temps réel écrit en C++20 moderne utilisant les Smart Pointers, le multithreading std::jthread et une gestion mémoire sans fuite.',
    category: 'Langage C & C++',
    tech_stack: ['C++20', 'OpenGL', 'SIMD', 'CMake'],
    github_url: 'https://github.com/MR1Academy/voxelray-cpp20',
    demo_url: 'https://voxelray-showcase.vercel.app',
    likes: 112,
  },
  {
    id: 6,
    author_name: 'Kenza Alaoui',
    author_role: 'Certifiée C# 12 / .NET 8 & Node.js',
    title: 'SyncFlow ERP — Gestion de Projets Agiles Multi-Tenant',
    description: 'Application SaaS B2B avec backend .NET 8 Minimal APIs, Entity Framework Core, notifications temps réel et export iCalendar (.ics).',
    category: 'C# & .NET',
    tech_stack: ['C# 12', '.NET 8', 'EF Core', 'React'],
    github_url: 'https://github.com/MR1Academy/syncflow-dotnet',
    demo_url: 'https://syncflow-erp.vercel.app',
    likes: 58,
  },
];

const MENTORS = [
  {
    id: 'm1',
    name: 'Coach Alex',
    role: 'Staff Frontend Architect — React 19 & TypeScript',
    specialties: ['React 19', 'TypeScript', 'Next.js', 'Performance'],
    rating: '4.98',
    sessions: 340,
    availability: 'Disponible aujourd\'hui · 18:00',
    color: '#00d1ff',
    bio: 'Ex-Tech Lead SaaS. Vous accompagne sur l\'architecture React, les Custom Hooks, la préparation aux entretiens et vos projets de certification.',
  },
  {
    id: 'm2',
    name: 'Mentor Sarah',
    role: 'Principal Backend Engineer — Laravel 11, Node.js & SQL',
    specialties: ['Laravel 11', 'Node.js', 'SQL / Oracle', 'Architecture API'],
    rating: '4.96',
    sessions: 285,
    availability: 'Disponible demain · 14:30',
    color: '#ef4444',
    bio: 'Spécialiste des API RESTful haute performance, sécurité Sanctum/JWT, optimisation de schémas relationnels et revue de code clean architecture.',
  },
  {
    id: 'm3',
    name: 'Pr. Mehdi',
    role: 'Systems & Enterprise Architect — C/C++20, Java 21 & C#',
    specialties: ['C / C++20', 'Java 21', 'C# .NET 8', 'Algorithmique'],
    rating: '4.99',
    sessions: 410,
    availability: 'Disponible Jeudi · 17:00',
    color: '#a78bfa',
    bio: 'Docteur en informatique système. Débogage mémoire RAII, multithreading, architecture Spring Boot / .NET et préparation aux concours techniques.',
  },
  {
    id: 'm4',
    name: 'Nadia DataLead',
    role: 'Lead AI & Data Scientist — Python 3.12, Pandas & ML',
    specialties: ['Python 3.12', 'Pandas / NumPy', 'Scikit-Learn', 'RAG & LLMs'],
    rating: '4.97',
    sessions: 195,
    availability: 'Disponible Vendredi · 16:00',
    color: '#4ade80',
    bio: 'Ingénieure Machine Learning. Vous aide à structurer vos pipelines de données, optimiser vos modèles prédictifs et réussir la certification Python.',
  },
  {
    id: 'm5',
    name: 'Designer Nora',
    role: 'Principal Product Designer — Figma, Design Systems & CSS3',
    specialties: ['Figma Auto-Layout', 'Design System', 'CSS Glassmorphism', 'UX Audit'],
    rating: '4.95',
    sessions: 220,
    availability: 'Disponible Samedi · 15:00',
    color: '#ec4899',
    bio: 'Créatrice de Design Systems B2B. Audit complet de vos maquettes Figma, accessibilité WCAG AAA et intégration pixel-perfect.',
  },
];

const TAG_COLORS = {
  React:        { bg: 'rgba(0, 209, 255, 0.12)', border: 'rgba(0, 209, 255, 0.35)', text: '#00d1ff' },
  Laravel:      { bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.35)', text: '#f87171' },
  Python:       { bg: 'rgba(74, 222, 128, 0.12)', border: 'rgba(74, 222, 128, 0.35)', text: '#4ade80' },
  Java:         { bg: 'rgba(249, 115, 22, 0.12)', border: 'rgba(249, 115, 22, 0.35)', text: '#fb923c' },
  'C/C++':      { bg: 'rgba(59, 130, 246, 0.12)', border: 'rgba(59, 130, 246, 0.35)', text: '#60a5fa' },
  SQL:          { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.35)', text: '#fbbf24' },
  Architecture: { bg: 'rgba(167, 139, 250, 0.12)', border: 'rgba(167, 139, 250, 0.35)', text: '#c4b5fd' },
  Showcase:     { bg: 'rgba(236, 72, 153, 0.12)', border: 'rgba(236, 72, 153, 0.35)', text: '#f472b6' },
  Entraide:     { bg: 'rgba(56, 189, 248, 0.12)', border: 'rgba(56, 189, 248, 0.35)', text: '#38bdf8' },
  Discussion:   { bg: 'rgba(139, 92, 246, 0.12)', border: 'rgba(139, 92, 246, 0.35)', text: '#a78bfa' },
};

const CATEGORIES = ['Tous', 'React', 'Laravel', 'Python', 'Java', 'C/C++', 'SQL', 'Architecture', 'Entraide', 'Showcase'];

const Community = () => {
  const { user } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('Discussions');
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'solved' | 'open'
  const [copiedId, setCopiedId] = useState(null);

  // Threads state with instant fallback + API sync
  const [localThreads, setLocalThreads] = useState(() => {
    try {
      const saved = localStorage.getItem(THREADS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { /* fallback */ }
    return FALLBACK_THREADS;
  });

  // Showcase Projects state with instant fallback + API sync
  const [projects, setProjects] = useState(() => {
    try {
      const saved = localStorage.getItem(PROJECTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { /* fallback */ }
    return FALLBACK_PROJECTS;
  });

  // Modals
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [mentorModal, setMentorModal] = useState({ isOpen: false, mentor: null });

  // Forms
  const [topicForm, setTopicForm] = useState({
    title: '',
    tag: 'React',
    body: '',
    code_snippet: '',
    code_lang: 'javascript',
  });

  const [projectForm, setProjectForm] = useState({
    title: '',
    category: 'React & Laravel',
    description: '',
    tech_stack_raw: 'React 19, Laravel 11, Tailwind',
    github_url: 'https://github.com/',
    demo_url: 'https://',
  });

  const [bookingForm, setBookingForm] = useState({
    topic: 'Revue de code & Architecture projet',
    date: '2026-10-22',
    start_time: '18:00',
    end_time: '18:45',
    notes: '',
  });

  const [activeReplyId, setActiveReplyId] = useState(1);
  const [replyText, setReplyText] = useState('');

  // Sync Threads & Projects from Backend API
  useEffect(() => {
    api.get('/community/threads')
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setLocalThreads(res.data);
          localStorage.setItem(THREADS_STORAGE_KEY, JSON.stringify(res.data));
        }
      })
      .catch(() => { /* keep fallback/local threads */ });

    api.get('/community/projects')
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setProjects(res.data);
          localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(res.data));
        }
      })
      .catch(() => { /* keep fallback/local projects */ });
  }, []);

  const persistThreads = (updater) => {
    setLocalThreads(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem(THREADS_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const persistProjects = (updater) => {
    setProjects(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleCopyCode = (id, code, e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast('Extrait de code copié dans le presse-papier !');
  };

  // Like / Unlike Thread
  const handleLikeThread = async (id, e) => {
    e.stopPropagation();
    const target = localThreads.find(t => t.id === id);
    if (!target) return;
    const willLike = !target.liked;

    persistThreads(prev =>
      prev.map(t =>
        t.id === id ? { ...t, likes: Math.max(0, (t.likes || 0) + (willLike ? 1 : -1)), liked: willLike } : t
      )
    );

    try {
      await api.post(`/community/threads/${id}/${willLike ? 'like' : 'unlike'}`);
    } catch { /* persisted locally */ }

    showToast(willLike ? 'Discussion recommandée ❤️' : 'Recommandation retirée');
  };

  // Toggle Solved Status
  const handleToggleSolved = async (id, e) => {
    e.stopPropagation();
    persistThreads(prev =>
      prev.map(t => (t.id === id ? { ...t, is_solved: !t.is_solved } : t))
    );
    try {
      await api.post(`/community/threads/${id}/solve`);
    } catch { /* persisted locally */ }
    showToast('Statut de résolution mis à jour ✓');
  };

  // Delete Thread
  const handleDeleteThread = async (id, e) => {
    e.stopPropagation();
    persistThreads(prev => prev.filter(t => t.id !== id));
    try {
      await api.delete(`/community/threads/${id}`);
    } catch { /* deleted locally */ }
    showToast('Discussion supprimée.');
  };

  // Submit Reply
  const submitReply = async (id, e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    const authorName = user?.name || 'Étudiant Vibe';
    const optimisticReply = {
      id: Date.now(),
      author: authorName,
      avatar: authorName[0].toUpperCase(),
      text: replyText,
      is_solution: false,
      time: 'À l\'instant',
    };

    persistThreads(prev =>
      prev.map(t =>
        t.id === id
          ? { ...t, replies: (t.replies || 0) + 1, replyList: [...(t.replyList || []), optimisticReply] }
          : t
      )
    );
    const sentText = replyText;
    setReplyText('');
    showToast('Votre réponse a été publiée !');

    try {
      await api.post(`/community/threads/${id}/reply`, {
        text: sentText,
        author_name: authorName,
      });
    } catch { /* saved locally */ }
  };

  // Create New Technical Thread
  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (!topicForm.title.trim()) return;
    const authorName = user?.name || 'Étudiant Vibe';

    const tempThread = {
      id: Date.now(),
      author: authorName,
      avatar: authorName[0].toUpperCase(),
      title: topicForm.title.trim(),
      body: topicForm.body.trim(),
      code_snippet: topicForm.code_snippet.trim(),
      code_lang: topicForm.code_lang || 'javascript',
      tag: topicForm.tag || 'React',
      replies: 0,
      likes: 1,
      is_solved: false,
      views: 1,
      time: 'À l\'instant',
      replyList: [],
    };

    persistThreads(prev => [tempThread, ...prev]);
    setIsTopicModalOpen(false);
    setTopicForm({ title: '', tag: 'React', body: '', code_snippet: '', code_lang: 'javascript' });
    showToast('Nouveau sujet technique publié avec succès !');

    try {
      const res = await api.post('/community/threads', {
        title: tempThread.title,
        body: tempThread.body,
        code_snippet: tempThread.code_snippet,
        code_lang: tempThread.code_lang,
        tag: tempThread.tag,
        author_name: authorName,
      });
      if (res.data && res.data.id) {
        persistThreads(prev => prev.map(t => (t.id === tempThread.id ? res.data : t)));
      }
    } catch { /* persisted locally */ }
  };

  // Create Showcase Project
  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectForm.title.trim() || !projectForm.description.trim()) return;
    const authorName = user?.name || 'Étudiant Vibe';
    const stack = projectForm.tech_stack_raw
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const newProj = {
      id: Date.now(),
      author_name: authorName,
      author_role: 'Développeur Certifié MR1Academy',
      title: projectForm.title.trim(),
      description: projectForm.description.trim(),
      category: projectForm.category,
      tech_stack: stack.length ? stack : ['React 19', 'Laravel 11'],
      github_url: projectForm.github_url || 'https://github.com',
      demo_url: projectForm.demo_url || 'https://MR1Academy.io',
      likes: 1,
      liked: true,
    };

    persistProjects(prev => [newProj, ...prev]);
    setIsProjectModalOpen(false);
    setProjectForm({
      title: '',
      category: 'React & Laravel',
      description: '',
      tech_stack_raw: 'React 19, Laravel 11, Tailwind',
      github_url: 'https://github.com/',
      demo_url: 'https://',
    });
    showToast(`Projet "${newProj.title}" publié dans le Showcase ! 🚀`);

    try {
      const res = await api.post('/community/projects', {
        title: newProj.title,
        description: newProj.description,
        category: newProj.category,
        tech_stack: newProj.tech_stack,
        github_url: newProj.github_url,
        demo_url: newProj.demo_url,
        author_name: authorName,
      });
      if (res.data && res.data.id) {
        persistProjects(prev => prev.map(p => (p.id === newProj.id ? res.data : p)));
      }
    } catch { /* saved locally */ }
  };

  // Like Showcase Project
  const handleLikeProject = async (id) => {
    const target = projects.find(p => p.id === id);
    if (!target) return;
    const willLike = !target.liked;

    persistProjects(prev =>
      prev.map(p =>
        p.id === id ? { ...p, likes: Math.max(0, (p.likes || 0) + (willLike ? 1 : -1)), liked: willLike } : p
      )
    );
    if (willLike) {
      try {
        await api.post(`/community/projects/${id}/like`);
      } catch { /* saved locally */ }
      showToast('Vote ajouté au projet ! ⭐');
    }
  };

  // Book 1-on-1 Mentor Session -> Synchronized directly with Agenda (/api/agenda/events + localStorage)
  const handleBookMentor = async (e) => {
    e.preventDefault();
    const mentor = mentorModal.mentor;
    if (!mentor) return;

    const eventPayload = {
      title: `Mentorat 1-on-1: ${bookingForm.topic} (${mentor.name})`,
      date: bookingForm.date || '2026-10-22',
      start_time: bookingForm.start_time || '18:00',
      end_time: bookingForm.end_time || '18:45',
      type: 'review',
      instructor: mentor.name,
      location: 'Google Meet 1-on-1 Privé',
      meeting_url: 'https://meet.google.com/vibe-mentorat-1on1',
      spots: 1,
      enrolled: 1,
      description: `Session de mentorat individuel avec ${mentor.name} (${mentor.role}). Notes: ${bookingForm.notes || 'Revue de code et conseils carrière.'}`,
      isEnrolled: true,
      hasReminder: true,
    };

    // Save to Agenda LocalStorage immediately
    try {
      const existingRaw = localStorage.getItem(AGENDA_STORAGE_KEY);
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      const newAgendaItem = { ...eventPayload, id: Date.now(), time: `${eventPayload.start_time} - ${eventPayload.end_time}` };
      localStorage.setItem(AGENDA_STORAGE_KEY, JSON.stringify([...existing, newAgendaItem]));
    } catch { /* ignore */ }

    // Also persist to Backend Agenda API
    try {
      await api.post('/agenda/events', eventPayload);
    } catch { /* saved locally */ }

    setMentorModal({ isOpen: false, mentor: null });
    showToast(`Session réservée avec ${mentor.name} et ajoutée à votre Agenda (${bookingForm.date}) !`);
  };

  // Filtered Threads
  const filteredThreads = useMemo(() => {
    return localThreads.filter(t => {
      if (selectedCategory !== 'Tous' && (t.tag || '').toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      if (statusFilter === 'solved' && !t.is_solved) return false;
      if (statusFilter === 'open' && t.is_solved) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = (t.title || '').toLowerCase().includes(q);
        const inBody = (t.body || '').toLowerCase().includes(q);
        const inAuthor = (t.author || '').toLowerCase().includes(q);
        const inTag = (t.tag || '').toLowerCase().includes(q);
        if (!inTitle && !inBody && !inAuthor && !inTag) return false;
      }
      return true;
    });
  }, [localThreads, selectedCategory, statusFilter, searchQuery]);

  const solvedCount = localThreads.filter(t => t.is_solved).length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-view">

      {/* ═══ TOAST NOTIFICATION ═══ */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            style={{
              position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999,
              background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(74,222,128,0.45)',
              color: '#4ade80', padding: '1rem 1.5rem', borderRadius: '14px', fontWeight: 700,
              backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', gap: '0.6rem',
              boxShadow: '0 15px 35px rgba(0,0,0,0.5)'
            }}
          >
            <CheckCircle2 size={18} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ PAGE HEADER ═══ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
            <h1 className="page-title brand-font text-gradient-animated" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Users size={28} /> Hub Communauté & Ingénierie
            </h1>
            <span style={{
              fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.7rem', borderRadius: '99px',
              background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80'
            }}>
              ● Entraide & Showcase Live
            </span>
          </div>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Partagez votre code, résolvez des bugs techniques, exposez vos projets certifiés et réservez vos sessions 1-on-1 avec nos mentors.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          {activeTab === 'Projets (Showcase)' ? (
            <button className="btn-pro btn-pro-primary" style={{ gap: '0.5rem' }} onClick={() => setIsProjectModalOpen(true)}>
              <Plus size={16} /> Publier mon Projet
            </button>
          ) : (
            <button className="btn-pro btn-pro-primary" style={{ gap: '0.5rem' }} onClick={() => setIsTopicModalOpen(true)}>
              <MessageSquare size={16} /> Nouveau Sujet Technique
            </button>
          )}
        </div>
      </div>

      {/* ═══ COMMUNITY KPI STATS ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(185px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Discussions techniques', value: localThreads.length, icon: <MessageSquare size={18} />, color: '#00d1ff' },
          { label: 'Problèmes résolus ✓', value: solvedCount, icon: <CheckCircle2 size={18} />, color: '#4ade80' },
          { label: 'Projets Showcase', value: projects.length, icon: <Code2 size={18} />, color: '#ec4899' },
          { label: 'Mentors Seniors 1-on-1', value: MENTORS.length, icon: <Compass size={18} />, color: '#a78bfa' },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
              borderRadius: '16px', padding: '1.05rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.95rem'
            }}
          >
            <div style={{
              width: 42, height: 42, borderRadius: '12px',
              background: `${stat.color}15`, border: `1px solid ${stat.color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color
            }}>
              {stat.icon}
            </div>
            <div>
              <div className="brand-font" style={{ fontSize: '1.35rem', fontWeight: 800 }}>{stat.value}</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 500 }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ═══ NAVIGATION TABS ═══ */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1.5rem',
        flexWrap: 'wrap', gap: '1rem'
      }}>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          {[
            { id: 'Discussions', label: `Discussions & Code (${localThreads.length})`, icon: <MessageSquare size={15} /> },
            { id: 'Projets (Showcase)', label: `Projets Showcase (${projects.length})`, icon: <Sparkles size={15} /> },
            { id: 'Mentorat', label: `Mentorat 1-on-1 (${MENTORS.length})`, icon: <Compass size={15} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.6rem 1.15rem',
                background: activeTab === tab.id ? 'rgba(112,0,255,0.16)' : 'rgba(255,255,255,0.02)',
                border: activeTab === tab.id ? '1px solid rgba(139,92,246,0.45)' : '1px solid var(--glass-border)',
                color: activeTab === tab.id ? '#c4b5fd' : 'var(--text-muted)',
                borderRadius: '12px', fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.45rem', transition: '0.2s'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        {activeTab === 'Discussions' && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
            borderRadius: '12px', padding: '0.5rem 0.9rem', minWidth: '250px'
          }}>
            <Search size={15} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Rechercher un sujet, langage, auteur..."
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
        )}
      </div>

      {/* ═══ MAIN LAYOUT GRID ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '1.75rem' }}>

        {/* ──── LEFT COLUMN: ACTIVE TAB CONTENT ──── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>

          {/* ── TAB 1: DISCUSSIONS & CODE ── */}
          {activeTab === 'Discussions' && (
            <>
              {/* Category & Status Filter Bar */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                gap: '0.75rem', flexWrap: 'wrap', background: 'var(--bg-secondary)',
                border: '1px solid var(--glass-border)', padding: '0.75rem 1rem', borderRadius: '16px'
              }}>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {CATEGORIES.map(cat => {
                    const active = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        style={{
                          padding: '0.32rem 0.75rem', borderRadius: '99px', fontSize: '0.74rem',
                          fontWeight: 700, cursor: 'pointer', transition: '0.15s',
                          background: active ? 'rgba(0,209,255,0.15)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${active ? 'rgba(0,209,255,0.4)' : 'rgba(255,255,255,0.06)'}`,
                          color: active ? '#00d1ff' : 'var(--text-muted)'
                        }}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {[
                    { id: 'all', label: 'Tous' },
                    { id: 'solved', label: '✓ Résolus' },
                    { id: 'open', label: 'En cours' },
                  ].map(st => (
                    <button
                      key={st.id}
                      onClick={() => setStatusFilter(st.id)}
                      style={{
                        padding: '0.3rem 0.65rem', borderRadius: '8px', fontSize: '0.72rem',
                        fontWeight: 600, cursor: 'pointer',
                        background: statusFilter === st.id ? 'rgba(74,222,128,0.14)' : 'transparent',
                        border: `1px solid ${statusFilter === st.id ? 'rgba(74,222,128,0.35)' : 'transparent'}`,
                        color: statusFilter === st.id ? '#4ade80' : 'var(--text-muted)'
                      }}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {filteredThreads.length === 0 ? (
                <div style={{
                  background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
                  borderRadius: '20px', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)'
                }}>
                  Aucune discussion trouvée pour ce filtre. Cliquez sur <strong>"Nouveau Sujet Technique"</strong> pour lancer la discussion !
                </div>
              ) : (
                filteredThreads.map((t, i) => {
                  const tagStyle = TAG_COLORS[t.tag] || TAG_COLORS.Discussion;
                  const isExpanded = activeReplyId === t.id;
                  return (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      style={{
                        background: 'var(--bg-secondary)',
                        border: t.is_solved ? '1px solid rgba(74,222,128,0.28)' : '1px solid var(--glass-border)',
                        padding: '1.5rem', borderRadius: '20px', transition: '0.2s'
                      }}
                    >
                      {/* Author & Badges Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.9rem', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <div style={{
                            width: 42, height: 42, borderRadius: '12px',
                            background: 'linear-gradient(135deg, #7000ff, #00d1ff)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 800, color: '#fff', fontSize: '0.95rem', flexShrink: 0
                          }}>
                            {t.avatar || (t.author ? t.author[0].toUpperCase() : 'V')}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>{t.author}</span>
                              <span style={{
                                fontSize: '0.65rem', padding: '2px 7px', borderRadius: '99px',
                                background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontWeight: 600
                              }}>
                                Membre Vibe
                              </span>
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '2px' }}>
                              <span>{t.time}</span>
                              <span>•</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <Eye size={12} /> {t.views || 24} vues
                              </span>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <button
                            onClick={(e) => handleToggleSolved(t.id, e)}
                            title="Basculer le statut Résolu"
                            style={{
                              fontSize: '0.72rem', padding: '0.28rem 0.75rem', borderRadius: '99px',
                              fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem',
                              background: t.is_solved ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.04)',
                              border: `1px solid ${t.is_solved ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.08)'}`,
                              color: t.is_solved ? '#4ade80' : 'var(--text-muted)'
                            }}
                          >
                            <CheckCircle2 size={13} /> {t.is_solved ? 'Résolu ✓' : 'Marquer résolu'}
                          </button>

                          <span style={{
                            fontSize: '0.73rem', padding: '0.28rem 0.8rem',
                            background: tagStyle.bg, border: `1px solid ${tagStyle.border}`,
                            color: tagStyle.text, borderRadius: '99px', fontWeight: 700
                          }}>
                            {t.tag}
                          </span>

                          <button
                            onClick={(e) => handleDeleteThread(t.id, e)}
                            title="Supprimer ce sujet"
                            style={{
                              background: 'transparent', border: 'none', color: 'var(--text-muted)',
                              cursor: 'pointer', padding: '0.25rem', opacity: 0.6
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Title & Technical Body */}
                      <h3
                        onClick={() => setActiveReplyId(isExpanded ? null : t.id)}
                        style={{ fontSize: '1.12rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.55rem', cursor: 'pointer', lineHeight: 1.35 }}
                      >
                        {t.title}
                      </h3>

                      {t.body && (
                        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: t.code_snippet ? '0.85rem' : '1rem' }}>
                          {t.body}
                        </p>
                      )}

                      {/* Optional Syntax Code Block */}
                      {t.code_snippet && (
                        <div style={{
                          background: '#070913', border: '1px solid rgba(0,209,255,0.2)',
                          borderRadius: '14px', overflow: 'hidden', marginBottom: '1rem'
                        }}>
                          <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '0.45rem 0.9rem', background: 'rgba(255,255,255,0.03)',
                            borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.72rem', color: '#94a3b8'
                          }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: '#00d1ff', textTransform: 'uppercase' }}>
                              <Code2 size={13} /> {t.code_lang || 'code'}
                            </span>
                            <button
                              onClick={(e) => handleCopyCode(t.id, t.code_snippet, e)}
                              style={{
                                background: 'rgba(255,255,255,0.06)', border: 'none', color: '#e2e8f0',
                                padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.7rem',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600
                              }}
                            >
                              {copiedId === t.id ? <><Check size={12} color="#4ade80" /> Copié</> : <><Copy size={12} /> Copier</>}
                            </button>
                          </div>
                          <pre style={{
                            margin: 0, padding: '0.9rem 1rem', fontSize: '0.8rem',
                            color: '#e2e8f0', overflowX: 'auto', fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                            lineHeight: 1.55
                          }}>
                            <code>{t.code_snippet}</code>
                          </pre>
                        </div>
                      )}

                      {/* Action Footer */}
                      <div style={{ display: 'flex', gap: '1.25rem', color: 'var(--text-muted)', fontSize: '0.83rem', alignItems: 'center', paddingTop: '0.25rem' }}>
                        <button
                          onClick={() => setActiveReplyId(isExpanded ? null : t.id)}
                          style={{
                            background: isExpanded ? 'rgba(139,92,246,0.14)' : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${isExpanded ? 'rgba(139,92,246,0.35)' : 'rgba(255,255,255,0.07)'}`,
                            color: isExpanded ? '#c4b5fd' : 'var(--text-muted)',
                            padding: '0.4rem 0.85rem', borderRadius: '10px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.8rem'
                          }}
                        >
                          <MessageSquare size={15} /> {t.replies || (t.replyList ? t.replyList.length : 0)} réponse(s)
                        </button>

                        <button
                          onClick={(e) => handleLikeThread(t.id, e)}
                          style={{
                            background: t.liked ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${t.liked ? 'rgba(239,68,68,0.35)' : 'rgba(255,255,255,0.07)'}`,
                            color: t.liked ? '#f87171' : 'var(--text-muted)',
                            padding: '0.4rem 0.85rem', borderRadius: '10px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.8rem'
                          }}
                        >
                          <Heart size={15} fill={t.liked ? '#f87171' : 'none'} /> {t.likes || 0} Utile
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard?.writeText(window.location.href);
                            showToast('Lien de la discussion copié dans le presse-papier !');
                          }}
                          style={{
                            background: 'transparent', border: 'none', color: 'var(--text-muted)',
                            cursor: 'pointer', marginLeft: 'auto', display: 'flex', alignItems: 'center',
                            gap: '0.35rem', fontSize: '0.8rem', fontWeight: 600
                          }}
                        >
                          <Share2 size={15} /> Partager
                        </button>
                      </div>

                      {/* Replies Drawer */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{ marginTop: '1.15rem', overflow: 'hidden' }}
                          >
                            {t.replyList && t.replyList.length > 0 && (
                              <div style={{
                                marginBottom: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.75rem',
                                background: 'rgba(5, 7, 15, 0.7)', padding: '1rem', borderRadius: '14px',
                                border: '1px solid var(--glass-border)'
                              }}>
                                {t.replyList.map((r, idx) => (
                                  <div
                                    key={r.id || idx}
                                    style={{
                                      display: 'flex', gap: '0.75rem', padding: '0.65rem',
                                      borderRadius: '10px',
                                      background: r.is_solution ? 'rgba(74,222,128,0.06)' : 'rgba(255,255,255,0.015)',
                                      border: r.is_solution ? '1px solid rgba(74,222,128,0.25)' : '1px solid transparent'
                                    }}
                                  >
                                    <div style={{
                                      width: 30, height: 30, borderRadius: '9px',
                                      background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                                      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      fontSize: '0.75rem', fontWeight: 800, flexShrink: 0
                                    }}>
                                      {(r.author || 'M')[0].toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                          {r.author}
                                        </span>
                                        {r.is_solution && (
                                          <span style={{
                                            fontSize: '0.65rem', padding: '1px 7px', borderRadius: '99px',
                                            background: 'rgba(74,222,128,0.18)', color: '#4ade80', fontWeight: 700
                                          }}>
                                            ✓ Solution validée
                                          </span>
                                        )}
                                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{r.time}</span>
                                      </div>
                                      <p style={{ margin: '0.3rem 0 0', fontSize: '0.86rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                                        {r.text}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            <form
                              onSubmit={(e) => submitReply(t.id, e)}
                              style={{
                                display: 'flex', gap: '0.5rem', background: '#090b14',
                                padding: '0.45rem', borderRadius: '14px', border: '1px solid var(--glass-border)'
                              }}
                            >
                              <input
                                type="text"
                                placeholder="Ajouter une réponse technique ou une piste de solution..."
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                style={{
                                  flex: 1, background: 'transparent', border: 'none',
                                  padding: '0.5rem 0.85rem', color: 'var(--text-main)', outline: 'none', fontSize: '0.86rem'
                                }}
                              />
                              <button
                                type="submit"
                                className="btn-pro btn-pro-primary"
                                style={{ padding: '0.5rem 1.1rem', borderRadius: '10px', fontSize: '0.82rem' }}
                                disabled={!replyText.trim()}
                              >
                                Répondre
                              </button>
                            </form>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })
              )}
            </>
          )}

          {/* ── TAB 2: PROJETS ÉTUDIANTS (SHOWCASE PRO) ── */}
          {activeTab === 'Projets (Showcase)' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}
            >
              {projects.map((p, idx) => {
                const coverSvg = getCourseCover({ title: `${p.category} ${p.title}`, category: p.category });
                return (
                  <motion.div
                    key={p.id || idx}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    style={{
                      background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
                      borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      {/* High-res SVG Tech Cover */}
                      <div style={{ position: 'relative', height: '165px', overflow: 'hidden', borderBottom: '1px solid var(--glass-border)' }}>
                        <img
                          src={coverSvg}
                          alt={p.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <span style={{
                          position: 'absolute', top: '0.75rem', right: '0.75rem',
                          background: 'rgba(10, 14, 26, 0.85)', backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(0,209,255,0.35)', color: '#00d1ff',
                          padding: '0.25rem 0.7rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 700
                        }}>
                          {p.category}
                        </span>
                      </div>

                      <div style={{ padding: '1.25rem' }}>
                        <h3 className="brand-font" style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.45rem', lineHeight: 1.3 }}>
                          {p.title}
                        </h3>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: '0.9rem' }}>
                          {p.description}
                        </p>

                        {/* Tech Stack Pills */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
                          {(Array.isArray(p.tech_stack) ? p.tech_stack : ['React', 'Laravel']).map((tech, tIdx) => (
                            <span
                              key={tIdx}
                              style={{
                                fontSize: '0.68rem', padding: '0.2rem 0.55rem', borderRadius: '6px',
                                background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.28)',
                                color: '#c4b5fd', fontWeight: 600
                              }}
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer: Author + Links + Upvote */}
                    <div style={{
                      padding: '0.9rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)',
                      background: 'rgba(255,255,255,0.015)', display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between', gap: '0.5rem'
                    }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.author_name}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#4ade80', fontWeight: 600 }}>
                          🎓 {p.author_role || 'Certifié MR1Academy'}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                        <a
                          href={p.github_url || 'https://github.com'}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Code Source GitHub"
                          style={{
                            width: 32, height: 32, borderRadius: '8px', background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--glass-border)', color: 'var(--text-main)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none'
                          }}
                        >
                          <Code2 size={14} />
                        </a>
                        <a
                          href={p.demo_url || 'https://MR1Academy.io'}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Démo Live"
                          style={{
                            width: 32, height: 32, borderRadius: '8px', background: 'rgba(0,209,255,0.1)',
                            border: '1px solid rgba(0,209,255,0.3)', color: '#00d1ff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none'
                          }}
                        >
                          <ExternalLink size={14} />
                        </a>
                        <button
                          onClick={() => handleLikeProject(p.id)}
                          style={{
                            padding: '0.35rem 0.65rem', borderRadius: '8px', cursor: 'pointer',
                            background: p.liked ? 'rgba(245,158,11,0.18)' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${p.liked ? 'rgba(245,158,11,0.45)' : 'var(--glass-border)'}`,
                            color: p.liked ? '#fbbf24' : 'var(--text-main)', fontSize: '0.75rem', fontWeight: 700,
                            display: 'flex', alignItems: 'center', gap: '0.3rem'
                          }}
                        >
                          <Star size={13} fill={p.liked ? '#fbbf24' : 'none'} color="#fbbf24" /> {p.likes}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* ── TAB 3: MENTORAT 1-ON-1 (SYNCHRONISÉ AVEC L'AGENDA) ── */}
          {activeTab === 'Mentorat' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(0,209,255,0.08), rgba(139,92,246,0.08))',
                border: '1px solid rgba(0,209,255,0.25)', borderRadius: '16px', padding: '1rem 1.25rem',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <CalendarIcon size={20} color="#00d1ff" />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>
                    Chaque session 1-on-1 réservée ici est <strong>automatiquement synchronisée dans votre Agenda Pro</strong> (avec lien Google Meet & export .ics).
                  </span>
                </div>
                <button
                  onClick={() => navigate('/calendrier')}
                  style={{
                    background: 'rgba(0,209,255,0.14)', border: '1px solid rgba(0,209,255,0.35)',
                    color: '#00d1ff', padding: '0.45rem 0.9rem', borderRadius: '10px',
                    fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  Ouvrir mon Agenda &rarr;
                </button>
              </div>

              {MENTORS.map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: '1.25rem', background: 'var(--bg-secondary)', padding: '1.5rem',
                    borderRadius: '20px', border: '1px solid var(--glass-border)', flexWrap: 'wrap'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.1rem', flex: '1 1 380px' }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: '16px',
                      background: `linear-gradient(135deg, ${m.color}, #7000ff)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 900, fontSize: '1.25rem', flexShrink: 0
                    }}>
                      {m.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                        <h3 className="brand-font" style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>{m.name}</h3>
                        <span style={{
                          fontSize: '0.72rem', padding: '2px 8px', borderRadius: '99px',
                          background: 'rgba(251,191,36,0.14)', color: '#fbbf24', fontWeight: 700
                        }}>
                          ★ {m.rating} ({m.sessions} sessions)
                        </span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: m.color, fontWeight: 700, marginBottom: '0.45rem' }}>
                        {m.role}
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '0.65rem' }}>
                        {m.bio}
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
                        {m.specialties.map((sp, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '0.68rem', padding: '0.2rem 0.6rem', borderRadius: '6px',
                              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                              color: 'var(--text-main)', fontWeight: 600
                            }}
                          >
                            {sp}
                          </span>
                        ))}
                        <span style={{ fontSize: '0.74rem', color: '#4ade80', fontWeight: 700, marginLeft: '0.4rem' }}>
                          ● {m.availability}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setMentorModal({ isOpen: true, mentor: m })}
                    className="btn-pro btn-pro-primary"
                    style={{ whiteSpace: 'nowrap', gap: '0.45rem' }}
                  >
                    <CalendarIcon size={15} /> Planifier 1-on-1
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* ──── RIGHT COLUMN: SIDEBAR WIDGETS ──── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Top Contributors Leaderboard */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', padding: '1.35rem', borderRadius: '20px' }}>
            <h4 className="brand-font" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-main)' }}>
              <Award size={18} color="#fbbf24" /> Top Contributeurs du Mois
            </h4>
            {[
              { name: 'Sofia El Idrissi', pts: '1 420 XP', badge: 'React & Laravel' },
              { name: 'Yassine El Amrani', pts: '1 180 XP', badge: 'React 19' },
              { name: 'Adam Ouazzani', pts: '995 XP', badge: 'C++20 Systèmes' },
              { name: 'Mehdi Chraibi', pts: '870 XP', badge: 'Python & IA' },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0',
                  borderBottom: i !== 3 ? '1px solid rgba(255,255,255,0.05)' : 'none'
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: '8px',
                  background: i === 0 ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.06)',
                  color: i === 0 ? '#fbbf24' : 'var(--text-main)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 800
                }}>
                  #{i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>{item.name}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Certifié {item.badge}</div>
                </div>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#4ade80' }}>{item.pts}</span>
              </div>
            ))}
          </div>

          {/* Showcase Callout Card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(236,72,153,0.1), rgba(112,0,255,0.08))',
            border: '1px solid rgba(236,72,153,0.28)', padding: '1.35rem', borderRadius: '20px'
          }}>
            <h4 className="brand-font" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.45rem' }}>
              <Sparkles size={17} color="#f472b6" /> Exposez vos Projets
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem' }}>
              Vous avez validé une playlist à 100% et obtenu votre certificat ? Partagez votre dépôt GitHub avec la communauté !
            </p>
            <button
              onClick={() => {
                setActiveTab('Projets (Showcase)');
                setIsProjectModalOpen(true);
              }}
              className="btn-pro btn-pro-primary"
              style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem' }}
            >
              <Plus size={15} /> Publier un Projet
            </button>
          </div>

          {/* Mentorat & Agenda Shortcut */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,209,255,0.08), rgba(112,0,255,0.08))',
            border: '1px solid rgba(0,209,255,0.25)', padding: '1.35rem', borderRadius: '20px'
          }}>
            <h4 className="brand-font" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.45rem' }}>
              <Compass size={17} color="#00d1ff" /> Mentorat & Agenda Live
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem' }}>
              Réservez un créneau de revue de code ou rejoignez les prochaines sessions live dans votre Agenda.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                onClick={() => setActiveTab('Mentorat')}
                className="btn-pro btn-pro-outline"
                style={{ width: '100%', justifyContent: 'center', borderColor: '#00d1ff', color: '#00d1ff', fontSize: '0.8rem' }}
              >
                Voir les 5 Mentors Seniors
              </button>
              <button
                onClick={() => navigate('/calendrier')}
                style={{
                  width: '100%', padding: '0.6rem', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)',
                  color: 'var(--text-main)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer'
                }}
              >
                📅 Ouvrir l'Agenda Pro
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ═══ MODAL 1: NOUVEAU SUJET TECHNIQUE ═══ */}
      <AnimatePresence>
        {isTopicModalOpen && (
          <div
            onClick={() => setIsTopicModalOpen(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(10px)', zIndex: 3000, display: 'flex',
              alignItems: 'center', justifyContent: 'center', padding: '1rem'
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
                padding: '2.25rem', width: '100%', maxWidth: '560px', borderRadius: '24px',
                maxHeight: '90vh', overflowY: 'auto'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 className="brand-font" style={{ fontSize: '1.35rem', margin: 0 }}>Publier un Sujet Technique</h2>
                <button onClick={() => setIsTopicModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={22} />
                </button>
              </div>

              <form onSubmit={handleCreateTopic} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                      Titre de la question ou discussion *
                    </label>
                    <input
                      type="text"
                      required
                      value={topicForm.title}
                      onChange={e => setTopicForm({ ...topicForm, title: e.target.value })}
                      placeholder="Ex: Optimisation mémoire avec std::unique_ptr en C++20"
                      style={{
                        width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)',
                        padding: '0.75rem 0.9rem', borderRadius: '12px', color: 'var(--text-main)', outline: 'none', fontSize: '0.88rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                      Technologie
                    </label>
                    <select
                      value={topicForm.tag}
                      onChange={e => setTopicForm({ ...topicForm, tag: e.target.value })}
                      style={{
                        width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)',
                        padding: '0.75rem 0.8rem', borderRadius: '12px', color: 'var(--text-main)', outline: 'none', fontSize: '0.88rem'
                      }}
                    >
                      {CATEGORIES.filter(c => c !== 'Tous').map(cat => (
                        <option key={cat} value={cat} style={{ background: '#0f0f1a', color: '#fff' }}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                    Description détaillée / Contexte
                  </label>
                  <textarea
                    rows={3}
                    value={topicForm.body}
                    onChange={e => setTopicForm({ ...topicForm, body: e.target.value })}
                    placeholder="Expliquez votre problème technique, l'erreur rencontrée ou votre astuce..."
                    style={{
                      width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)',
                      padding: '0.75rem 0.9rem', borderRadius: '12px', color: 'var(--text-main)', outline: 'none',
                      fontSize: '0.88rem', fontFamily: 'inherit', resize: 'vertical'
                    }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      Extrait de code (Optionnel)
                    </label>
                    <select
                      value={topicForm.code_lang}
                      onChange={e => setTopicForm({ ...topicForm, code_lang: e.target.value })}
                      style={{
                        background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)',
                        padding: '0.2rem 0.5rem', borderRadius: '8px', color: '#00d1ff', fontSize: '0.74rem', outline: 'none'
                      }}
                    >
                      <option value="javascript">JavaScript / React</option>
                      <option value="php">PHP / Laravel</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="cpp">C / C++</option>
                      <option value="csharp">C# / .NET</option>
                      <option value="sql">SQL / PL-SQL</option>
                      <option value="css">CSS3</option>
                    </select>
                  </div>
                  <textarea
                    rows={4}
                    value={topicForm.code_snippet}
                    onChange={e => setTopicForm({ ...topicForm, code_snippet: e.target.value })}
                    placeholder="// Collez votre extrait de code ici..."
                    style={{
                      width: '100%', background: '#070913', border: '1px solid rgba(0,209,255,0.25)',
                      padding: '0.75rem 0.9rem', borderRadius: '12px', color: '#e2e8f0', outline: 'none',
                      fontSize: '0.82rem', fontFamily: "'JetBrains Mono', monospace", resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="submit" className="btn-pro btn-pro-primary" style={{ flex: 1, justifyContent: 'center' }}>
                    Publier la discussion
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsTopicModalOpen(false)}
                    style={{
                      padding: '0.75rem 1.25rem', background: 'transparent',
                      border: '1px solid var(--glass-border)', color: 'var(--text-muted)',
                      borderRadius: '12px', cursor: 'pointer', fontWeight: 600
                    }}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══ MODAL 2: PUBLIER UN PROJET SHOWCASE ═══ */}
      <AnimatePresence>
        {isProjectModalOpen && (
          <div
            onClick={() => setIsProjectModalOpen(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(10px)', zIndex: 3000, display: 'flex',
              alignItems: 'center', justifyContent: 'center', padding: '1rem'
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
                padding: '2.25rem', width: '100%', maxWidth: '540px', borderRadius: '24px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 className="brand-font" style={{ fontSize: '1.35rem', margin: 0 }}>Publier mon Projet dans le Showcase</h2>
                <button onClick={() => setIsProjectModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={22} />
                </button>
              </div>

              <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                    Nom du Projet *
                  </label>
                  <input
                    type="text"
                    required
                    value={projectForm.title}
                    onChange={e => setProjectForm({ ...projectForm, title: e.target.value })}
                    placeholder="Ex: VibeAnalytics — Dashboard SaaS React & Laravel"
                    style={{
                      width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)',
                      padding: '0.75rem 0.9rem', borderRadius: '12px', color: 'var(--text-main)', outline: 'none', fontSize: '0.88rem'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                      Domaine / Stack principale
                    </label>
                    <select
                      value={projectForm.category}
                      onChange={e => setProjectForm({ ...projectForm, category: e.target.value })}
                      style={{
                        width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)',
                        padding: '0.75rem 0.8rem', borderRadius: '12px', color: 'var(--text-main)', outline: 'none', fontSize: '0.86rem'
                      }}
                    >
                      <option value="React & Laravel" style={{ background: '#0f0f1a' }}>React & Laravel</option>
                      <option value="Python & IA" style={{ background: '#0f0f1a' }}>Python & IA</option>
                      <option value="Java & SQL" style={{ background: '#0f0f1a' }}>Java 21 & SQL</option>
                      <option value="Langage C & C++" style={{ background: '#0f0f1a' }}>Langage C & C++20</option>
                      <option value="C# & .NET" style={{ background: '#0f0f1a' }}>C# 12 & .NET 8</option>
                      <option value="Figma & CSS3" style={{ background: '#0f0f1a' }}>Figma & CSS3</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                      Technologies (séparées par virgule)
                    </label>
                    <input
                      type="text"
                      value={projectForm.tech_stack_raw}
                      onChange={e => setProjectForm({ ...projectForm, tech_stack_raw: e.target.value })}
                      placeholder="React 19, Laravel 11, MySQL"
                      style={{
                        width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)',
                        padding: '0.75rem 0.9rem', borderRadius: '12px', color: 'var(--text-main)', outline: 'none', fontSize: '0.86rem'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                    Description technique & Fonctionnalités *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={projectForm.description}
                    onChange={e => setProjectForm({ ...projectForm, description: e.target.value })}
                    placeholder="Décrivez l'architecture, les défis résolus et les fonctionnalités clés..."
                    style={{
                      width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)',
                      padding: '0.75rem 0.9rem', borderRadius: '12px', color: 'var(--text-main)', outline: 'none',
                      fontSize: '0.88rem', fontFamily: 'inherit'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                      Lien GitHub
                    </label>
                    <input
                      type="text"
                      value={projectForm.github_url}
                      onChange={e => setProjectForm({ ...projectForm, github_url: e.target.value })}
                      placeholder="https://github.com/..."
                      style={{
                        width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)',
                        padding: '0.72rem 0.85rem', borderRadius: '12px', color: 'var(--text-main)', outline: 'none', fontSize: '0.84rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                      Lien Démo Live
                    </label>
                    <input
                      type="text"
                      value={projectForm.demo_url}
                      onChange={e => setProjectForm({ ...projectForm, demo_url: e.target.value })}
                      placeholder="https://mon-projet.vercel.app"
                      style={{
                        width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)',
                        padding: '0.72rem 0.85rem', borderRadius: '12px', color: 'var(--text-main)', outline: 'none', fontSize: '0.84rem'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="submit" className="btn-pro btn-pro-primary" style={{ flex: 1, justifyContent: 'center' }}>
                    Publier dans le Showcase
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsProjectModalOpen(false)}
                    style={{
                      padding: '0.75rem 1.25rem', background: 'transparent',
                      border: '1px solid var(--glass-border)', color: 'var(--text-muted)',
                      borderRadius: '12px', cursor: 'pointer', fontWeight: 600
                    }}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══ MODAL 3: RÉSERVER UN MENTOR 1-ON-1 (SYNC AGENDA) ═══ */}
      <AnimatePresence>
        {mentorModal.isOpen && mentorModal.mentor && (
          <div
            onClick={() => setMentorModal({ isOpen: false, mentor: null })}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(10px)', zIndex: 3000, display: 'flex',
              alignItems: 'center', justifyContent: 'center', padding: '1rem'
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
                padding: '2.25rem', width: '100%', maxWidth: '500px', borderRadius: '24px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '12px',
                    background: `linear-gradient(135deg, ${mentorModal.mentor.color}, #7000ff)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 800
                  }}>
                    {mentorModal.mentor.name[0]}
                  </div>
                  <div>
                    <h2 className="brand-font" style={{ fontSize: '1.2rem', margin: 0 }}>
                      Session 1-on-1 avec {mentorModal.mentor.name}
                    </h2>
                    <div style={{ fontSize: '0.76rem', color: mentorModal.mentor.color, fontWeight: 600 }}>
                      {mentorModal.mentor.role}
                    </div>
                  </div>
                </div>
                <button onClick={() => setMentorModal({ isOpen: false, mentor: null })} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleBookMentor} style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem', marginTop: '1.25rem' }}>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                    Objet de la session *
                  </label>
                  <input
                    type="text"
                    required
                    value={bookingForm.topic}
                    onChange={e => setBookingForm({ ...bookingForm, topic: e.target.value })}
                    placeholder="Ex: Revue de code React & préparation Quiz"
                    style={{
                      width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)',
                      padding: '0.75rem 0.9rem', borderRadius: '12px', color: 'var(--text-main)', outline: 'none', fontSize: '0.88rem'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.65rem' }}>
                  <div>
                    <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                      Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={bookingForm.date}
                      onChange={e => setBookingForm({ ...bookingForm, date: e.target.value })}
                      style={{
                        width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)',
                        padding: '0.7rem 0.75rem', borderRadius: '12px', color: 'var(--text-main)', outline: 'none', fontSize: '0.84rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                      Début
                    </label>
                    <input
                      type="time"
                      required
                      value={bookingForm.start_time}
                      onChange={e => setBookingForm({ ...bookingForm, start_time: e.target.value })}
                      style={{
                        width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)',
                        padding: '0.7rem 0.75rem', borderRadius: '12px', color: 'var(--text-main)', outline: 'none', fontSize: '0.84rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                      Fin
                    </label>
                    <input
                      type="time"
                      required
                      value={bookingForm.end_time}
                      onChange={e => setBookingForm({ ...bookingForm, end_time: e.target.value })}
                      style={{
                        width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)',
                        padding: '0.7rem 0.75rem', borderRadius: '12px', color: 'var(--text-main)', outline: 'none', fontSize: '0.84rem'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                    Questions ou lien GitHub à partager au mentor
                  </label>
                  <textarea
                    rows={2}
                    value={bookingForm.notes}
                    onChange={e => setBookingForm({ ...bookingForm, notes: e.target.value })}
                    placeholder="Précisez les points que vous souhaitez aborder..."
                    style={{
                      width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)',
                      padding: '0.75rem 0.9rem', borderRadius: '12px', color: 'var(--text-main)', outline: 'none',
                      fontSize: '0.86rem', fontFamily: 'inherit'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="submit" className="btn-pro btn-pro-primary" style={{ flex: 1, justifyContent: 'center', gap: '0.45rem' }}>
                    <CalendarIcon size={15} /> Confirmer & Ajouter à l'Agenda
                  </button>
                  <button
                    type="button"
                    onClick={() => setMentorModal({ isOpen: false, mentor: null })}
                    style={{
                      padding: '0.75rem 1.15rem', background: 'transparent',
                      border: '1px solid var(--glass-border)', color: 'var(--text-muted)',
                      borderRadius: '12px', cursor: 'pointer', fontWeight: 600
                    }}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default Community;
