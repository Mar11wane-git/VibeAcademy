import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MessageSquare, Heart, Share2, Award, Zap, Compass, Star, X, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const threads = [
  { id: 1, author: 'Alice', avatar: 'A', title: 'Astuces pour réussir l\'examen React', replies: 2, likes: 120, tag: 'React', time: 'Il y a 2h', replyList: [{ id: 101, author: 'Mentor Paul', text: 'Je conseille de bien réviser les Hooks en premier !', time: 'Il y a 1h' }, { id: 102, author: 'Sarah', text: 'Merci pour le conseil !', time: 'Il y a 30m' }] },
  { id: 2, author: 'Bob Dev', avatar: 'B', title: 'Quel est le meilleur moment pour utiliser Redux ?', replies: 1, likes: 45, tag: 'Architecture', time: 'Il y a 5h', replyList: [{ id: 103, author: 'Alex', text: 'Quand ton state devient complexe et partagé entre des composants éloignés.', time: 'Il y a 4h' }] },
  { id: 3, author: 'Charlie', avatar: 'C', title: 'Problème avec useEffect : boucle infinie', replies: 0, likes: 15, tag: 'Entraide', time: 'Il y a 10h', replyList: [] },
  { id: 4, author: 'Diana Pro', avatar: 'D', title: 'Voici mon portfolio après 3 mois sur VibeAcademy !', replies: 1, likes: 300, tag: 'Showcase', time: 'Hier', replyList: [{ id: 104, author: 'Admin', text: 'C\'est fantastique Diana, très beau design glassmorphism !', time: 'Il y a 12h' }] }
];

const Community = () => {
  const [activeTab, setActiveTab] = useState('Discussions');
  const [toast, setToast] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMentorModalOpen, setIsMentorModalOpen] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [localThreads, setLocalThreads] = useState([]);

  // Fetch threads directly from the database on mount
  useEffect(() => {
    api.get('/community/threads').then(res => setLocalThreads(res.data)).catch(console.error);
  }, []);

  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');

  const handleLike = async (id, e) => {
    e.stopPropagation();
    try {
      const thread = localThreads.find(t => t.id === id);
      if(thread.liked) {
        await api.post(`/community/threads/${id}/unlike`);
        setLocalThreads(prev => prev.map(t => t.id === id ? { ...t, likes: t.likes - 1, liked: false } : t));
        showToast('J\'aime retiré');
      } else {
        await api.post(`/community/threads/${id}/like`);
        setLocalThreads(prev => prev.map(t => t.id === id ? { ...t, likes: t.likes + 1, liked: true } : t));
        showToast('Vous avez aimé ce sujet ❤️');
      }
    } catch(err) { console.error(err); }
  };

  const submitReply = async (id, e) => {
    e.preventDefault();
    if(!replyText.trim()) return;
    try {
      const resp = await api.post(`/community/threads/${id}/reply`, { text: replyText });
      const newReply = { id: resp.data.id, author: 'Moi', text: replyText, time: 'À l\'instant' };
      setLocalThreads(prev => prev.map(t => t.id === id ? { ...t, replies: t.replies + 1, replyList: [...(t.replyList || []), newReply] } : t));
      setReplyText('');
      showToast('Réponse ajoutée avec succès !');
    } catch(err) { console.error(err); }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if(newTopic.trim() === '') return;
    try {
      const resp = await api.post('/community/threads', { title: newTopic, tag: 'Discussion' });
      // Fetch fresh threads from DB to see it formatted perfectly
      api.get('/community/threads').then(res => setLocalThreads(res.data));
      setIsModalOpen(false);
      setNewTopic('');
      showToast('Nouveau sujet publié avec succès !');
    } catch(err) { console.error(err); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-view">
      
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
            style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999, background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.4)', color: '#4ade80', padding: '1rem 1.5rem', borderRadius: '14px', fontWeight: 700, backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={18}/> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMentorModalOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', padding: '3rem', width: '90%', maxWidth: '500px', borderRadius: '32px', textAlign: 'center' }}>
                <Compass size={48} color="#a78bfa" style={{ marginBottom: '1.5rem' }} />
                <h2 className="brand-font" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Réserver un Mentor</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Choisissez un créneau de 30 minutes avec un expert VibeAcademy pour débloquer votre progression.</p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={() => { setIsMentorModalOpen(false); showToast('Session réservée avec succès !'); }} className="btn-pro btn-pro-primary" style={{ flex: 1, justifyContent: 'center' }}>Réserver maintenant</button>
                  <button onClick={() => setIsMentorModalOpen(false)} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '0.8rem', borderRadius: '14px', cursor: 'pointer' }}>Annuler</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title brand-font text-gradient-animated" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={28} />
            Communauté Vibe
          </h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Échangez avec d'autres étudiants et experts.</p>
        </div>
        <button className="btn-pro btn-pro-primary" style={{ gap: '0.5rem' }} onClick={() => setIsModalOpen(true)}>
          <MessageSquare size={16} /> Nouveau Sujet
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '2rem' }}>
        {['Discussions', 'Projets (Showcase)', 'Mentorat'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ padding: '0.5rem 1.2rem', background: activeTab === tab ? 'rgba(112,0,255,0.1)' : 'transparent', border: activeTab === tab ? '1px solid rgba(112,0,255,0.3)' : '1px solid transparent', color: activeTab === tab ? '#a78bfa' : 'var(--text-muted)', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', transition: '0.2s' }}>
            {tab}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '2rem' }}>
        
        {/* Main Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {activeTab === 'Discussions' && localThreads.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', padding: '1.5rem', borderRadius: '20px', transition: '0.2s', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-purple)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #7000ff, #00d1ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#fff' }}>{t.avatar}</div>
                  <div>
                    <p style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.1rem' }}>{t.author}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.time}</p>
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem', background: 'rgba(112,0,255,0.1)', color: '#a78bfa', borderRadius: '20px', fontWeight: '700' }}>{t.tag}</span>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1rem' }}>{t.title}</h3>
              <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <span onClick={(e) => { e.stopPropagation(); setActiveReplyId(activeReplyId === t.id ? null : t.id); }} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: activeReplyId === t.id ? '#a78bfa' : '' }} className="hover-color-accent"><MessageSquare size={16} /> {t.replies} réponses</span>
                <span onClick={(e) => handleLike(t.id, e)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: t.liked ? '#ef4444' : '' }} className="hover-color-accent"><Heart size={16} fill={t.liked ? '#ef4444' : 'none'} color={t.liked ? '#ef4444' : 'currentColor'} /> {t.likes} j'aime</span>
                <span onClick={(e) => { e.stopPropagation(); showToast('Lien copié dans le presse-papier !'); }} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', marginLeft: 'auto' }} className="hover-color-accent"><Share2 size={16} /> Partager</span>
              </div>
              <AnimatePresence>
                {activeReplyId === t.id && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ marginTop: '1.5rem', overflow: 'hidden' }}>
                    
                    {t.replyList && t.replyList.length > 0 && (
                      <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', background: '#0a0a0f', padding: '1rem', borderRadius: '16px', border: '1px solid var(--glass-border)', maxHeight: '200px', overflowY: 'auto' }}>
                        {t.replyList.map((r, idx) => (
                           <div key={idx} style={{ display: 'flex', gap: '0.8rem' }}>
                             <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(to right, #ec4899, #8b5cf6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, flexShrink: 0 }}>{r.author[0]}</div>
                             <div style={{ flex: 1 }}>
                               <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>{r.author} <span style={{ fontWeight: 400, opacity: 0.7, marginLeft: '0.5rem' }}>{r.time}</span></p>
                               <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '0.2rem', lineHeight: '1.4' }}>{r.text}</p>
                             </div>
                           </div>
                        ))}
                      </div>
                    )}

                    <form onSubmit={(e) => submitReply(t.id, e)} style={{ display: 'flex', gap: '0.5rem', background: '#0a0a0f', padding: '0.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }} onClick={e => e.stopPropagation()}>
                      <input type="text" placeholder="Écrire votre réponse..." value={replyText} onChange={e => setReplyText(e.target.value)} style={{ flex: 1, background: 'transparent', border: 'none', padding: '0.5rem 1rem', color: 'var(--text-main)', outline: 'none', fontSize: '0.9rem' }} autoFocus />
                      <button type="submit" className="btn-pro btn-pro-primary" style={{ padding: '0 1rem', borderRadius: '12px' }} disabled={!replyText.trim()}>Envoyer</button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}

          {activeTab === 'Projets (Showcase)' && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[1, 2, 3, 4].map(p => (
                   <div key={p} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '16px' }}>
                      <div style={{ width: '100%', height: '120px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <Star size={24} color="var(--text-muted)" opacity={0.5} />
                      </div>
                      <h4 style={{ color: 'var(--text-main)' }}>Projet Frontend #{p}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Par l'étudiant {p}</p>
                   </div>
                ))}
             </motion.div>
          )}

          {activeTab === 'Mentorat' && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {['Jean Dupont (Expert React)', 'Marie Curie (UI/UX Lead)'].map((m, i) => (
                   <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                         <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'linear-gradient(to right, #00d1ff, #7000ff)' }}></div>
                         <div><p style={{ fontWeight: 800 }}>{m}</p><p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Disponible aujourd'hui</p></div>
                      </div>
                      <button onClick={() => setIsMentorModalOpen(true)} className="btn-pro btn-pro-primary">Réserver</button>
                   </div>
                ))}
             </motion.div>
          )}
        </div>

        {/* Sidebar Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', padding: '1.5rem', borderRadius: '20px' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text-main)' }}><Award size={18} color="#fbbf24" /> Top Contributeurs</h4>
            {['Sarah Jenkins', 'Alex Rivera', 'John Doe'].map((name, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', borderBottom: i !== 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: '700' }}>{i + 1}</div>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{name}</span>
                <Zap size={14} color="#f59e0b" style={{ marginLeft: 'auto' }} />
              </div>
            ))}
          </div>

          <div style={{ background: 'linear-gradient(135deg, rgba(112,0,255,0.1), rgba(0,209,255,0.05))', border: '1px solid rgba(112,0,255,0.2)', padding: '1.5rem', borderRadius: '20px' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-main)' }}><Compass size={18} color="#a78bfa" /> Vibe Mentors</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Réservez une session 1-on-1 avec un expert pour débloquer votre progression.</p>
            <button onClick={() => { setActiveTab('Mentorat'); window.scrollTo(0, 0); }} className="btn-pro btn-pro-outline" style={{ width: '100%', justifyContent: 'center', borderColor: '#a78bfa', color: '#a78bfa' }}>Découvrir</button>
          </div>
        </div>

      </div>

      {/* Modal Nouveau Sujet */}
      <AnimatePresence>
        {isModalOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', padding: '3rem', width: '90%', maxWidth: '500px', borderRadius: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                   <h2 className="brand-font" style={{ fontSize: '1.5rem' }}>Nouveau Sujet</h2>
                   <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
                </div>
                <form onSubmit={handleCreateTopic} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                   <div>
                     <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Titre du sujet</label>
                     <input type="text" value={newTopic} onChange={e => setNewTopic(e.target.value)} placeholder="De quoi souhaitez-vous discuter ?" style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '14px', color: 'var(--text-main)', outline: 'none' }} required />
                   </div>
                   <button type="submit" className="btn-pro btn-pro-primary" style={{ width: '100%', justifyContent: 'center' }}>Publier la discussion</button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default Community;
