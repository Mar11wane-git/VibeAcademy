import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, Video, Bell, Plus, MoreHorizontal, CheckCircle2 } from 'lucide-react';

const events = [
  { id: 1, title: 'Live Coding: React Avancé', time: 'Aujourd\'hui, 18:00', type: 'webinar', instructor: 'Coach Alex' },
  { id: 2, title: 'Correction de Projet n°3', time: 'Demain, 14:30', type: 'review', instructor: 'Mentor Sarah' },
  { id: 3, title: 'Session Q&A', time: 'Ven. 22 Oct, 19:00', type: 'qa', instructor: 'Équipe Vibe' }
];

const CalendarPage = () => {
  const [viewMode, setViewMode] = useState('Mois');
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, type: '', data: null });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const openModal = (type, data = null) => {
    setModal({ isOpen: true, type, data });
  };

  const closeModal = () => setModal({ isOpen: false, type: '', data: null });

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
        {modal.isOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', padding: '2.5rem', width: '90%', maxWidth: '400px', borderRadius: '24px', textAlign: 'center' }}>
                
                {modal.type === 'sync' && (
                  <>
                    <CalendarIcon size={48} color="#00d1ff" style={{ marginBottom: '1rem' }} />
                    <h2 className="brand-font" style={{ marginBottom: '1rem' }}>Synchronisation Google Agenda</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Voulez-vous lier votre compte Google pour synchroniser tous vos cours et sessions VibeAcademy ?</p>
                    <button onClick={() => { closeModal(); showToast('Google Agenda connecté avec succès !'); }} className="btn-pro btn-pro-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: '0.5rem' }}>Autoriser l'accès</button>
                    <button onClick={closeModal} style={{ width: '100%', padding: '0.8rem', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-main)', borderRadius: '14px', cursor: 'pointer' }}>Annuler</button>
                  </>
                )}

                {modal.type === 'alert' && (
                  <>
                    <Bell size={48} color="#f59e0b" style={{ marginBottom: '1rem' }} />
                    <h2 className="brand-font" style={{ marginBottom: '1rem' }}>Activer l'alerte</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Vous recevrez une notification 15 minutes avant le début de : <strong>{modal.data?.title}</strong></p>
                    <button onClick={() => { closeModal(); showToast(`Rappel programmé pour ${modal.data?.title}`); }} className="btn-pro btn-pro-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: '0.5rem' }}>Confirmer</button>
                    <button onClick={closeModal} style={{ width: '100%', padding: '0.8rem', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-main)', borderRadius: '14px', cursor: 'pointer' }}>Fermer</button>
                  </>
                )}

                {modal.type === 'options' && (
                  <>
                    <h2 className="brand-font" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>Options</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <button onClick={() => { closeModal(); showToast('Événement partagé avec succès.'); }} style={{ width: '100%', padding: '1rem', background: 'var(--bg-tertiary)', border: 'none', color: 'var(--text-main)', borderRadius: '10px', textAlign: 'left', cursor: 'pointer' }}>Partager l'événement</button>
                      <button onClick={() => { closeModal(); showToast('Événement masqué du calendrier.'); }} style={{ width: '100%', padding: '1rem', background: 'var(--bg-tertiary)', border: 'none', color: '#f87171', borderRadius: '10px', textAlign: 'left', cursor: 'pointer' }}>Masquer l'événement</button>
                      <button onClick={closeModal} style={{ width: '100%', padding: '1rem', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-main)', borderRadius: '10px', textAlign: 'center', cursor: 'pointer', marginTop: '1rem' }}>Annuler</button>
                    </div>
                  </>
                )}

                {modal.type === 'all' && (
                  <>
                    <h2 className="brand-font" style={{ marginBottom: '1.5rem' }}>Planning Complet</h2>
                    <div style={{ maxHeight: '300px', overflowY: 'auto', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                      {events.map((ev, i) => (
                        <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                           <p style={{ fontWeight: 800, color: 'var(--text-main)' }}>{ev.title}</p>
                           <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ev.time} - {ev.instructor}</p>
                        </div>
                      ))}
                    </div>
                    <button onClick={closeModal} className="btn-pro btn-pro-primary" style={{ width: '100%', justifyContent: 'center' }}>Fermer le planning</button>
                  </>
                )}

             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 className="page-title brand-font text-gradient-animated" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarIcon size={28} />
            Agenda & Sessions
          </h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Ne manquez aucune masterclass ou révision en direct.</p>
        </div>
        <button className="btn-pro btn-pro-primary" style={{ gap: '0.5rem' }} onClick={() => openModal('sync')}>
          <Plus size={16} /> Ajouter à Google Sync
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '2rem' }}>
        
        {/* Main Calendar View Placeholder */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column', minHeight: '500px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 className="brand-font" style={{ fontSize: '1.2rem' }}>Octobre 2026</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setViewMode('Mois')} style={{ background: viewMode === 'Mois' ? 'rgba(112,0,255,0.1)' : 'var(--bg-tertiary)', border: viewMode === 'Mois' ? '1px solid rgba(112,0,255,0.3)' : 'none', color: viewMode === 'Mois' ? '#a78bfa' : 'var(--text-main)', padding: '0.5rem 1rem', borderRadius: '10px', cursor: 'pointer', transition: '0.2s', fontWeight: 600 }}>Mois</button>
              <button onClick={() => setViewMode('Semaine')} style={{ background: viewMode === 'Semaine' ? 'rgba(112,0,255,0.1)' : 'var(--bg-tertiary)', border: viewMode === 'Semaine' ? '1px solid rgba(112,0,255,0.3)' : 'none', color: viewMode === 'Semaine' ? '#a78bfa' : 'var(--text-main)', padding: '0.5rem 1rem', borderRadius: '10px', cursor: 'pointer', transition: '0.2s', fontWeight: 600 }}>Semaine</button>
            </div>
          </div>
          <div style={{ flex: 1, border: '2px dashed rgba(255,255,255,0.05)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
             {/* Grille calendrier mockup */}
             <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', color: 'var(--text-muted)' }}>
                <CalendarIcon size={48} opacity={0.2} />
               <p>Vue calendrier {viewMode.toLowerCase()} interactif activée !</p>
             </div>
          </div>
        </div>

        {/* Upcoming Events Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3 className="brand-font" style={{ fontSize: '1.2rem' }}>À venir</h3>
            <button onClick={() => openModal('all')} style={{ background: 'none', border: 'none', color: '#a78bfa', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 700 }}>Tout voir</button>
          </div>
          
          {events.map((ev, i) => (
            <motion.div key={ev.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', padding: '1.25rem', borderRadius: '20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: ev.type === 'webinar' ? '#00d1ff' : ev.type === 'review' ? '#f59e0b' : '#7000ff' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <h4 style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1rem', paddingRight: '2rem' }}>{ev.title}</h4>
                <MoreHorizontal size={16} color="var(--text-muted)" style={{ cursor: 'pointer' }} onClick={() => openModal('options', ev)} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={14} color="#a78bfa" /> <span>{ev.time}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Video size={14} color="#4ade80" /> <span>{ev.instructor}</span>
                </div>
              </div>
              <button onClick={() => openModal('alert', ev)} style={{ marginTop: '1.25rem', width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.6rem', borderRadius: '10px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', transition: '0.2s', fontSize: '0.85rem', fontWeight: 600 }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}>
                <Bell size={14} /> M'alerter
              </button>
            </motion.div>
          ))}
        </div>

      </div>
    </motion.div>
  );
};

export default CalendarPage;
