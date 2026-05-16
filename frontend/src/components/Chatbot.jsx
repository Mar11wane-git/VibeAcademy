import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [msgInput, setMsgInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Bonjour ! Je suis VibeBot, l\'intelligence artificielle de VibeAcademy 🤖🚀. Comment puis-je vous guider aujourd\'hui ?' }
  ]);

  const quickQuestions = [
    "Où trouver mes favoris ?",
    "Comment réserver un mentor ?",
    "Où voir le calendrier ?",
    "Obtenir un certificat"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, isTyping]);

  const handleSend = () => {
    if (!msgInput.trim()) return;

    const userText = msgInput.trim();
    const newMsg = { id: Date.now(), sender: 'user', text: userText };
    setMessages(prev => [...prev, newMsg]);
    setMsgInput('');
    setIsTyping(true);

    // Mock AI Response Logic
    setTimeout(() => {
      const lower = userText.toLowerCase();
      
      let botResp = "Je suis désolé, je n'ai pas bien compris. Mais rappelez-vous : explorer notre **catalogue de cours** ou échanger avec la **communauté** est toujours une bonne idée ! 💡";

      if (lower.includes('mot de passe') || lower.includes('paramètre') || lower.includes('password') || lower.includes('settings')) {
        botResp = "Vous pouvez modifier votre mot de passe et vos informations personnelles depuis la page **Profil**, accessible via la barre latérale gauche ou le menu en haut à droite. ⚙️";
      } else if (lower.includes('certificat') || lower.includes('certificate') || lower.includes('diplome')) {
        botResp = "Les certificats 🎓 s'obtiennent en atteignant un score d'au moins **80% au quiz final** d'un cours. Vous pouvez consulter et télécharger vos certificats PDF dans l'onglet **Certificats**.";
      } else if (lower.includes('cours') || lower.includes('apprendre') || lower.includes('course') || lower.includes('learn')) {
        botResp = "Vous cherchez un cours ? 📚 Je vous recommande vivement notre **Catalogue** ! Utilisez les *filtres* pour trouver des cursus en **React JS**, **Laravel**, ou encore **Python**. N'oubliez pas cliquer sur le ❤️ pour sauvegarder !";
      } else if (lower.includes('bonjour') || lower.includes('salut') || lower.includes('hello') || lower.includes('hey')) {
        botResp = "Salutations ! 👋 Êtes-vous prêt pour une session de code intensive aujourd'hui ? Que voulez-vous apprendre ?";
      } else if (lower.includes('favoris') || lower.includes('favorites') || lower.includes('sauvegard')) {
        botResp = "Vos cours sauvegardés sont dans la section **Favoris** 💖. Astuce : cliquez sur le cœur sur n'importe quel cours dans le catalogue pour qu'il s'ajoute dynamiquement ici !";
      } else if (lower.includes('calendrier') || lower.includes('agenda') || lower.includes('live') || lower.includes('alerte')) {
        botResp = "L'onglet **Calendrier** 📅 répertorie tous nos événements (Live Coding, Webinaires, etc.). Vous pouvez y cliquer sur \"M'alerter\" pour un rappel, ou lier votre agenda directement avec **Google Sync** !";
      } else if (lower.includes('mentor') || lower.includes('coach') || lower.includes('expert') || lower.includes('prof')) {
        botResp = "Bloqué sur un projet ? 🚀 Rendez-vous dans la **Communauté**, onglet *Mentorat*. Vous pourrez y réserver une session privée de 30 minutes avec nos experts VibeAcademy !";
      } else if (lower.includes('projet') || lower.includes('showcase')) {
        botResp = "Vos projets personnels peuvent être mis en valeur dans l'onglet **Projets (Showcase)** de la page Communauté ! C'est le meilleur endroit pour recevoir les avis des autres développeurs. 💻";
      } else if (lower.includes('communaute') || lower.includes('forum') || lower.includes('discussion')) {
        botResp = "La **Communauté** 👥 est notre espace d'échange. Vous pouvez créer un nouveau sujet, *Aimer* (❤️) les posts, et partager vos expériences avec les autres membres !";
      } else if (lower.includes('admin') || lower.includes('administrateur')) {
        botResp = "Seuls les membres avec le statut **Administrateur** peuvent voir le panneau de contrôle 🛡️. Celui-ci permet d'ajouter/modifier des cours et de superviser la plateforme globale.";
      } else if (lower.includes('merci') || lower.includes('thank')) {
        botResp = "Je t'en prie ! C'est toujours un plaisir de t'aider sur la plateforme VibeAcademy. Bon code ! 💻🔥";
      } else if (lower.includes('bug') || lower.includes('erreur') || lower.includes('problème')) {
        botResp = "Aïe ! 🐞 Si vous rencontrez un bug, assurez-vous d'avoir rafraîchi la page. Si ça persiste, postez un message dans la **Communauté - Entraide**, un mentor ou moi-même viendrons vous aider !";
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: botResp }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        className="btn-pro btn-pro-primary"
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          boxShadow: '0 10px 25px rgba(139, 92, 246, 0.4)',
          border: '2px solid rgba(255,255,255,0.1)'
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle size={28} />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            style={{
              position: 'fixed',
              bottom: '5rem',
              right: '2rem',
              width: '380px',
              height: '550px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--glass-border)',
              borderRadius: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              zIndex: 10000
            }}
          >
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, var(--bg-tertiary), rgba(139, 92, 246, 0.15))', padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'var(--gradient-aurora)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <Bot size={22} />
                    </div>
                    <div>
                        <h3 className="brand-font" style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            VibeBot <Sparkles size={14} color="var(--accent-purple)" />
                        </h3>
                        <p style={{ fontSize: '0.75rem', color: '#4ade80', margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                           <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }}></span> En ligne
                        </p>
                    </div>
                </div>
                <button onClick={() => setIsOpen(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                    <X size={18} />
                </button>
            </div>

            {/* Chat Body */}
            <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#0a0a0f' }}>
                {messages.map((msg) => (
                    <div key={msg.id} style={{ display: 'flex', gap: '0.75rem', alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                        {msg.sender === 'bot' && (
                            <div style={{ width: 28, height: 28, borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)', flexShrink: 0 }}>
                                <Bot size={14} />
                            </div>
                        )}
                        <div style={{ 
                            background: msg.sender === 'user' ? 'var(--accent-purple)' : 'var(--bg-tertiary)',
                            color: 'white',
                            padding: '0.85rem 1.15rem',
                            borderRadius: '16px',
                            borderTopLeftRadius: msg.sender === 'bot' ? 0 : '16px',
                            borderTopRightRadius: msg.sender === 'user' ? 0 : '16px',
                            fontSize: '0.9rem',
                            lineHeight: 1.5,
                            border: msg.sender === 'bot' ? '1px solid var(--glass-border)' : 'none',
                            boxShadow: msg.sender === 'user' ? '0 4px 15px rgba(139, 92, 246, 0.3)' : 'none'
                        }}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                
                {isTyping && (
                    <div style={{ display: 'flex', gap: '0.75rem', alignSelf: 'flex-start' }}>
                         <div style={{ width: 28, height: 28, borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)' }}>
                            <Bot size={14} />
                        </div>
                        <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '16px', borderTopLeftRadius: 0, display: 'flex', gap: '0.3rem' }}>
                            <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} style={{ width: 6, height: 6, background: 'var(--text-muted)', borderRadius: '50%' }} />
                            <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} style={{ width: 6, height: 6, background: 'var(--text-muted)', borderRadius: '50%' }} />
                            <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} style={{ width: 6, height: 6, background: 'var(--text-muted)', borderRadius: '50%' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions Chips */}
            {!isTyping && messages.length < 5 && (
              <div style={{ padding: '0.75rem 1rem 0', background: '#0a0a0f', display: 'flex', gap: '0.5rem', overflowX: 'auto', flexWrap: 'wrap' }}>
                {quickQuestions.map((q, idx) => (
                  <button key={idx} onClick={() => { setMsgInput(q); }} style={{ background: 'transparent', border: '1px solid var(--glass-highlight)', color: 'var(--text-muted)', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', cursor: 'pointer', whiteSpace: 'nowrap', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderTop: '1px solid var(--glass-border)' }}>
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  style={{ display: 'flex', gap: '0.5rem', background: '#0f0b1e', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '0.5rem', alignItems: 'center', transition: 'border-color 0.2s' }}
                >
                    <input 
                        type="text" 
                        placeholder="Écrivez un message..." 
                        value={msgInput}
                        onChange={(e) => setMsgInput(e.target.value)}
                        style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', padding: '0.5rem 0.5rem', fontSize: '0.9rem', outline: 'none' }}
                    />
                    <button 
                        type="submit" 
                        disabled={!msgInput.trim() || isTyping}
                        style={{ background: msgInput.trim() ? 'var(--accent-purple)' : 'rgba(255,255,255,0.05)', color: msgInput.trim() ? 'white' : 'var(--text-muted-dark)', border: 'none', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: msgInput.trim() ? 'pointer' : 'default', transition: 'all 0.2s' }}
                    >
                        <Send size={16} style={{ marginLeft: '-2px' }} />
                    </button>
                </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
