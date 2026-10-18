import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Send, Bot, Sparkles, Maximize2, Minimize2,
  RotateCcw, Copy, Check, ExternalLink, Code2,
  GraduationCap, BookOpen, KeyRound, Square
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { generateVibeAiResponse } from '../utils/vibeAiEngine';

const CHAT_HISTORY_KEY = 'vibe_gpt_history_v3';
const OPENAI_KEY_STORAGE = 'vibe_gpt_custom_api_key';

const QUICK_PROMPTS = [
  { label: '📊 Ma progression', prompt: 'Où j’en suis dans mes cours et mes certificats ?' },
  { label: '📚 Liste des cours', prompt: 'Quels sont tous les cours disponibles sur MR1Academy ?' },
  { label: '⚛️ Code React 19', prompt: 'Explique-moi React 19 avec un exemple de code complet' },
  { label: '☕ Java & Spring', prompt: 'Explique-moi Java 21 et Spring Boot avec du code' },
  { label: '🐍 Python & IA', prompt: 'Comment entraîner un modèle Machine Learning en Python ?' },
  { label: '🎯 Préparer un Quiz', prompt: 'Prépare-moi au quiz de certification React et Laravel' },
  { label: '🏆 Feu Vert & Diplôme', prompt: 'Comment fonctionne le Feu Vert et le Certificat HD ?' },
  { label: '🚀 Roadmap Carrière', prompt: 'Donne-moi un plan d’étude complet pour devenir ingénieur Fullstack' },
];

/* ─── Rich Markdown & Code Block Renderer ─── */
const RichMessageContent = ({ text, onCopyCode, copiedIndex }) => {
  if (!text) return null;

  // Split by fenced code blocks ```lang ... ```
  const segments = text.split(/(```[\s\S]*?```)/g);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
      {segments.map((seg, idx) => {
        if (seg.startsWith('```') && seg.endsWith('```')) {
          const lines = seg.slice(3, -3).trim().split('\n');
          const firstLine = lines[0]?.trim() || '';
          const hasLang = /^[a-zA-Z0-9+#_-]+$/.test(firstLine);
          const lang = hasLang ? firstLine.toUpperCase() : 'CODE';
          const codeBody = hasLang ? lines.slice(1).join('\n') : lines.join('\n');

          return (
            <div
              key={idx}
              style={{
                background: '#070913',
                border: '1px solid rgba(168, 85, 247, 0.28)',
                borderRadius: '12px',
                overflow: 'hidden',
                margin: '0.25rem 0',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.4rem 0.85rem',
                  background: 'rgba(255, 255, 255, 0.04)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  color: '#a78bfa',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Code2 size={13} /> {lang}
                </span>
                <button
                  type="button"
                  onClick={() => onCopyCode(codeBody, idx)}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: copiedIndex === idx ? '#4ade80' : '#e2e8f0',
                    borderRadius: '6px',
                    padding: '0.2rem 0.5rem',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  {copiedIndex === idx ? <Check size={12} /> : <Copy size={12} />}
                  {copiedIndex === idx ? 'Copié !' : 'Copier'}
                </button>
              </div>
              <pre
                style={{
                  margin: 0,
                  padding: '0.85rem 1rem',
                  overflowX: 'auto',
                  fontFamily: 'monospace',
                  fontSize: '0.78rem',
                  lineHeight: 1.55,
                  color: '#e2e8f0',
                }}
              >
                <code>{codeBody}</code>
              </pre>
            </div>
          );
        }

        // Render normal markdown lines
        const paragraphs = seg.split('\n').filter(l => l.trim() !== '');
        return (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.38rem' }}>
            {paragraphs.map((line, lIdx) => {
              const trimmed = line.trim();
              if (trimmed === '---') {
                return <hr key={lIdx} style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '0.35rem 0' }} />;
              }
              if (trimmed.startsWith('### ')) {
                return (
                  <h4 key={lIdx} className="brand-font" style={{ fontSize: '0.98rem', fontWeight: 900, color: '#fff', margin: '0.2rem 0 0.1rem' }}>
                    {formatInlineMarkdown(trimmed.slice(4))}
                  </h4>
                );
              }
              if (trimmed.startsWith('#### ')) {
                return (
                  <h5 key={lIdx} style={{ fontSize: '0.84rem', fontWeight: 800, color: '#c4b5fd', margin: '0.25rem 0 0.05rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {formatInlineMarkdown(trimmed.slice(5))}
                  </h5>
                );
              }
              if (trimmed.startsWith('- ')) {
                return (
                  <div key={lIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem', paddingLeft: '0.2rem' }}>
                    <span style={{ color: '#00d1ff', fontWeight: 900, marginTop: '1px' }}>•</span>
                    <span style={{ flex: 1 }}>{formatInlineMarkdown(trimmed.slice(2))}</span>
                  </div>
                );
              }
              return (
                <p key={lIdx} style={{ margin: 0, lineHeight: 1.55 }}>
                  {formatInlineMarkdown(line)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

function formatInlineMarkdown(str) {
  // Handle **bold** and `inline code`
  const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: '#fff', fontWeight: 800 }}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          style={{
            background: 'rgba(112, 0, 255, 0.22)',
            color: '#67e8f9',
            padding: '0.1rem 0.38rem',
            borderRadius: '5px',
            fontFamily: 'monospace',
            fontSize: '0.82em',
            border: '1px solid rgba(103, 232, 249, 0.2)',
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

const Chatbot = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [customApiKey, setCustomApiKey] = useState(() => localStorage.getItem(OPENAI_KEY_STORAGE) || '');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const firstName = user?.name ? user.name.split(' ')[0] : 'Apprenant';

  const getInitialMessage = useCallback(() => [
    {
      id: 1,
      text: `### 👋 Bonjour ${firstName} ! Je suis **VibeGPT**\n\nVotre assistant IA intelligent intégré à **MR1Academy**.\n\nJe peux vous aider sur :\n- 📚 **Tous les cours, playlists vidéo, quiz et certificats** de la plateforme\n- 💻 **La génération et l'explication de code** (*React, Java, Python, Laravel, C/C++, C#, Node.js, SQL, CSS*)\n- 🧮 **Les calculs mathématiques, l'algorithmique et votre plan de carrière**\n\nPosez-moi n'importe quelle question ci-dessous !`,
      sender: 'bot',
      actions: [
        { label: 'Explorer le Catalogue', path: '/catalogue' },
        { label: 'Voir mes Certificats', path: '/certificats' },
      ],
    },
  ], [firstName]);

  const [messages, setMessages] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CHAT_HISTORY_KEY) || 'null');
      return Array.isArray(saved) && saved.length > 0 ? saved : getInitialMessage();
    } catch {
      return getInitialMessage();
    }
  });

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [contextData, setContextData] = useState({ courses: [], enrollments: [], agendaEvents: [], user });

  const messagesEndRef = useRef(null);
  const streamTimerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, streamingText, isOpen]);

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages.slice(-30)));
    } catch { /* ignore */ }
  }, [messages]);

  // Fetch live platform data when chatbot opens so RAG knows every course & user progress
  useEffect(() => {
    if (!isOpen) return;
    let mounted = true;

    const loadContext = async () => {
      try {
        const [coursesRes, myRes, agendaRes] = await Promise.all([
          api.get('/courses').catch(() => ({ data: [] })),
          localStorage.getItem('token') ? api.get('/my-courses').catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
          localStorage.getItem('token') ? api.get('/agenda/events').catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        ]);

        if (!mounted) return;
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        setContextData({
          courses: Array.isArray(coursesRes.data) ? coursesRes.data : [],
          enrollments: Array.isArray(myRes.data) ? myRes.data : [],
          agendaEvents: Array.isArray(agendaRes.data) ? agendaRes.data : [],
          user: currentUser,
        });
      } catch { /* ignore */ }
    };

    loadContext();
    return () => {
      mounted = false;
    };
  }, [isOpen]);

  const stopStreaming = () => {
    if (streamTimerRef.current) {
      clearInterval(streamTimerRef.current);
      streamTimerRef.current = null;
    }
    setIsTyping(false);
    setStreamingText('');
  };

  const triggerQuery = async (queryText) => {
    const trimmed = (queryText || '').trim();
    if (!trimmed || isTyping) return;

    const userMsg = { id: crypto.randomUUID(), text: trimmed, sender: 'user' };
    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInput('');
    setIsTyping(true);
    setStreamingText('');

    const aiReply = await generateVibeAiResponse({
      query: trimmed,
      history: updatedHistory,
      contextData,
      customApiKey,
    });

    const fullText = aiReply.text || '';
    const words = fullText.split(' ');
    let idx = 0;

    if (streamTimerRef.current) clearInterval(streamTimerRef.current);

    streamTimerRef.current = setInterval(() => {
      idx += 5; // fast ChatGPT-like token chunking
      if (idx >= words.length) {
        clearInterval(streamTimerRef.current);
        streamTimerRef.current = null;
        setStreamingText('');
        setIsTyping(false);
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            text: fullText,
            sender: 'bot',
            actions: aiReply.actions || [],
          },
        ]);
      } else {
        setStreamingText(words.slice(0, idx).join(' '));
      }
    }, 28);
  };

  const handleSend = (e) => {
    e.preventDefault();
    triggerQuery(input);
  };

  const handleResetChat = () => {
    stopStreaming();
    const fresh = getInitialMessage();
    setMessages(fresh);
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(fresh));
  };

  const handleCopyCode = (code, idx) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSaveApiKey = (val) => {
    setCustomApiKey(val);
    localStorage.setItem(OPENAI_KEY_STORAGE, val.trim());
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <motion.button
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        title="Ouvrir VibeGPT — Assistant IA"
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '62px',
          height: '62px',
          borderRadius: '20px',
          background: 'var(--gradient-magic)',
          border: '1px solid rgba(255,255,255,0.28)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 12px 35px rgba(112, 0, 255, 0.55)',
          zIndex: 9999,
        }}
      >
        {isOpen ? <X size={26} /> : <Bot size={30} />}
        {!isOpen && (
          <span
            style={{
              position: 'absolute',
              top: '-6px',
              right: '-6px',
              background: '#10b981',
              color: '#052e16',
              fontSize: '0.62rem',
              fontWeight: 900,
              padding: '2px 6px',
              borderRadius: '99px',
              border: '2px solid #090d16',
            }}
          >
            IA
          </span>
        )}
      </motion.button>

      {/* VibeGPT Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 35, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            style={{
              position: 'fixed',
              bottom: isExpanded ? '1.5rem' : '6.4rem',
              right: isExpanded ? '1.5rem' : '2rem',
              width: isExpanded ? 'min(880px, calc(100vw - 3rem))' : 'min(430px, calc(100vw - 2.5rem))',
              height: isExpanded ? 'min(84vh, 820px)' : '610px',
              background: 'rgba(10, 12, 24, 0.96)',
              backdropFilter: 'blur(26px)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              borderRadius: '24px',
              boxShadow: '0 25px 70px rgba(0, 0, 0, 0.75), 0 0 40px rgba(112, 0, 255, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              zIndex: 9998,
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '1rem 1.25rem',
                background: 'linear-gradient(135deg, rgba(112, 0, 255, 0.28), rgba(0, 209, 255, 0.12))',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: '13px',
                    background: 'var(--gradient-magic)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 6px 18px rgba(112, 0, 255, 0.45)',
                  }}
                >
                  <Sparkles size={20} color="#fff" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <h4 className="brand-font" style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#fff' }}>
                      VibeGPT Studio
                    </h4>
                    <span
                      style={{
                        fontSize: '0.62rem',
                        fontWeight: 900,
                        padding: '0.12rem 0.45rem',
                        borderRadius: '6px',
                        background: 'rgba(74, 222, 128, 0.16)',
                        color: '#4ade80',
                        border: '1px solid rgba(74, 222, 128, 0.35)',
                      }}
                    >
                      PRO • RAG
                    </span>
                  </div>
                  <span style={{ fontSize: '0.73rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }}></span>
                    Connecté à {contextData.courses.length || 8} formations &amp; Code Engine
                  </span>
                </div>
              </div>

              {/* Header Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <button
                  type="button"
                  onClick={() => setShowApiConfig(!showApiConfig)}
                  title="Configurer une clé API externe (Optionnel)"
                  style={{
                    background: showApiConfig ? 'rgba(168,85,247,0.28)' : 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: customApiKey ? '#4ade80' : '#cbd5e1',
                    width: 32,
                    height: 32,
                    borderRadius: '9px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <KeyRound size={15} />
                </button>
                <button
                  type="button"
                  onClick={handleResetChat}
                  title="Nouvelle conversation"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#cbd5e1',
                    width: 32,
                    height: 32,
                    borderRadius: '9px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <RotateCcw size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  title={isExpanded ? 'Réduire la fenêtre' : 'Mode Plein Écran / Studio'}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#cbd5e1',
                    width: 32,
                    height: 32,
                    borderRadius: '9px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Fermer"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#cbd5e1',
                    width: 32,
                    height: 32,
                    borderRadius: '9px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Optional API Key Bar */}
            {showApiConfig && (
              <div
                style={{
                  padding: '0.75rem 1.15rem',
                  background: 'rgba(112, 0, 255, 0.12)',
                  borderBottom: '1px solid rgba(168, 85, 247, 0.25)',
                  fontSize: '0.76rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 800, color: '#e2e8f0' }}>
                    Clé API OpenAI (Optionnel — le moteur VibeGPT local est déjà actif par défaut)
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowApiConfig(false)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.72rem' }}
                  >
                    Fermer
                  </button>
                </div>
                <input
                  type="password"
                  placeholder="sk-... (Laisser vide pour utiliser le moteur VibeGPT intégré)"
                  value={customApiKey}
                  onChange={e => handleSaveApiKey(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.75rem',
                    borderRadius: '8px',
                    background: 'rgba(0,0,0,0.45)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#fff',
                    fontSize: '0.78rem',
                    outline: 'none',
                  }}
                />
              </div>
            )}

            {/* Quick Prompt Suggestions Bar */}
            <div
              style={{
                display: 'flex',
                gap: '0.45rem',
                overflowX: 'auto',
                padding: '0.65rem 1rem',
                background: 'rgba(255, 255, 255, 0.02)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                scrollbarWidth: 'none',
              }}
            >
              {QUICK_PROMPTS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => triggerQuery(item.prompt)}
                  disabled={isTyping}
                  style={{
                    flexShrink: 0,
                    padding: '0.32rem 0.7rem',
                    borderRadius: '99px',
                    background: 'rgba(112, 0, 255, 0.14)',
                    border: '1px solid rgba(168, 85, 247, 0.28)',
                    color: '#e2e8f0',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: isTyping ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Messages Area */}
            <div
              style={{
                flex: 1,
                padding: '1.15rem',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              {messages.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: msg.sender === 'user' ? '82%' : '92%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.45rem',
                  }}
                >
                  <div
                    style={{
                      background:
                        msg.sender === 'user'
                          ? 'var(--gradient-magic)'
                          : 'rgba(255, 255, 255, 0.045)',
                      color: '#f8fafc',
                      padding: msg.sender === 'user' ? '0.75rem 1rem' : '0.95rem 1.1rem',
                      borderRadius:
                        msg.sender === 'user'
                          ? '18px 18px 4px 18px'
                          : '18px 18px 18px 4px',
                      fontSize: '0.86rem',
                      border:
                        msg.sender === 'bot'
                          ? '1px solid rgba(255, 255, 255, 0.09)'
                          : 'none',
                      boxShadow:
                        msg.sender === 'user'
                          ? '0 8px 22px rgba(112, 0, 255, 0.3)'
                          : '0 6px 18px rgba(0, 0, 0, 0.22)',
                    }}
                  >
                    {msg.sender === 'user' ? (
                      <span style={{ lineHeight: 1.5 }}>{msg.text}</span>
                    ) : (
                      <RichMessageContent
                        text={msg.text}
                        onCopyCode={handleCopyCode}
                        copiedIndex={copiedIndex}
                      />
                    )}
                  </div>

                  {/* Interactive Action Chips under Bot Replies */}
                  {msg.sender === 'bot' && Array.isArray(msg.actions) && msg.actions.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', paddingLeft: '0.2rem' }}>
                      {msg.actions.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          type="button"
                          onClick={() => {
                            if (act.path) {
                              navigate(act.path);
                              if (!isExpanded) setIsOpen(false);
                            } else if (act.prompt) {
                              triggerQuery(act.prompt);
                            }
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.34rem 0.72rem',
                            borderRadius: '10px',
                            background: 'rgba(0, 209, 255, 0.1)',
                            border: '1px solid rgba(0, 209, 255, 0.3)',
                            color: '#67e8f9',
                            fontSize: '0.73rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                          }}
                        >
                          {act.path ? <ExternalLink size={12} /> : <Sparkles size={12} />}
                          {act.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Live Streaming Bubble */}
              {isTyping && (
                <div
                  style={{
                    alignSelf: 'flex-start',
                    maxWidth: '92%',
                    background: 'rgba(255, 255, 255, 0.045)',
                    padding: '0.95rem 1.1rem',
                    borderRadius: '18px 18px 18px 4px',
                    border: '1px solid rgba(168, 85, 247, 0.25)',
                    color: '#f8fafc',
                    fontSize: '0.86rem',
                  }}
                >
                  {streamingText ? (
                    <RichMessageContent
                      text={streamingText}
                      onCopyCode={handleCopyCode}
                      copiedIndex={copiedIndex}
                    />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a78bfa', fontSize: '0.8rem', fontWeight: 700 }}>
                      <Sparkles size={15} /> VibeGPT réfléchit et analyse vos cours...
                    </div>
                  )}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleSend}
              style={{
                padding: '0.9rem 1rem',
                background: 'rgba(7, 9, 19, 0.95)',
                borderTop: '1px solid rgba(255, 255, 255, 0.09)',
                display: 'flex',
                gap: '0.6rem',
                alignItems: 'center',
              }}
            >
              <input
                type="text"
                placeholder="Posez une question sur un cours, demandez du code (React, Java, Python, SQL...)..."
                value={input}
                onChange={e => setInput(e.target.value)}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  padding: '0.78rem 1rem',
                  borderRadius: '14px',
                  color: 'white',
                  outline: 'none',
                  fontSize: '0.86rem',
                }}
              />
              {isTyping ? (
                <button
                  type="button"
                  onClick={stopStreaming}
                  title="Arrêter la génération"
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '13px',
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.45)',
                    color: '#f87171',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Square size={16} fill="currentColor" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '13px',
                    background: input.trim() ? 'var(--gradient-magic)' : 'rgba(255,255,255,0.06)',
                    border: 'none',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: input.trim() ? 'pointer' : 'not-allowed',
                    opacity: input.trim() ? 1 : 0.5,
                  }}
                >
                  <Send size={18} />
                </button>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
