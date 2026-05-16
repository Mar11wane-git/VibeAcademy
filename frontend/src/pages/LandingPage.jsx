import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Play, ChevronRight, GraduationCap, Award, Sparkles, Users, CheckCircle, CreditCard, Shield, Zap, X } from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, navigate }) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="payment-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="payment-modal" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', padding: '2.5rem', borderRadius: '24px', width: '100%', maxWidth: '450px', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
          
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Award size={32} color="var(--accent-main)" />
            </div>
            <h2 className="brand-font" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Obtenir la Certification</h2>
            <p style={{ color: 'var(--text-muted)' }}>Mettez en valeur vos compétences avec un certificat officiel vérifié.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            <button className="btn-pro btn-pro-outline" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><CreditCard size={20} /> Carte Bancaire</span>
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png" style={{ height: 20 }} alt="Mastercard" />
            </button>
            <button className="btn-pro btn-pro-outline" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Shield size={20} /> PayPal</span>
              <span style={{ color: '#0ea5e9', fontWeight: 800, fontStyle: 'italic' }}>PayPal</span>
            </button>
            <button className="btn-pro btn-pro-outline" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Zap size={20} /> Crypto (VibeCoin)</span>
              <span style={{ fontWeight: 800 }}>₿</span>
            </button>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '1.5rem' }}>
            Veuillez créer un compte avant de procéder au paiement.
          </p>

          <button className="btn-pro btn-pro-primary" style={{ width: '100%' }} onClick={() => navigate('/register')}>
            Créer un compte maintenant
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);

  React.useEffect(() => {
    if (localStorage.getItem('token') && localStorage.getItem('user')) {
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <div className="landing-page">
      <div className="orb-1"></div>
      <div className="orb-2"></div>
      
      {/* Top Navbar for Visitors */}
      <nav className="top-nav">
        <div className="brand cursor-pointer" style={{ marginBottom: 0 }}>
          <div className="brand-icon">
            <BookOpen size={20} strokeWidth={2.5} />
          </div>
          VibeAcademy
        </div>
        
        <div className="nav-links">
          <a href="#hero" className="nav-link">Accueil</a>
          <a href="#features" className="nav-link">Avantages</a>
          <a href="#tarifs" className="nav-link">Tarifs & Certificats</a>
          <div style={{ marginLeft: '1rem', display: 'flex', gap: '1rem' }}>
            <button className="btn-pro btn-pro-outline" onClick={() => navigate('/login')}>
              Se Connecter
            </button>
            <button className="btn-pro btn-pro-primary" onClick={() => navigate('/register')}>
              Inscription Gratuite <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div id="hero" className="hero-section" style={{ minHeight: '100vh', paddingTop: '120px' }}>
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hero-text"
        >
          <div className="hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}><Sparkles size={14} /> Apprentissage de pointe</div>
          <h1 className="landing-title brand-font">La plateforme <span className="text-gradient-animated">définitive</span> pour booster votre carrière</h1>
          <p className="landing-desc">
            Accédez à plus de 5,000 cours créés par des experts. Développez des compétences critiques en design, programmation, marketing, et plus encore.
          </p>
          <div className="hero-actions">
            <button className="btn-pro btn-pro-primary" onClick={() => navigate('/register')}>
              <Play size={18} fill="currentColor" />
              Découvrir les Cours
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>
              <div style={{ display: 'flex' }}>
                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100" alt="user" style={{width: 38, height: 38, borderRadius: '50%', border: '2px solid var(--bg-primary)', objectFit: 'cover'}} />
                <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100" alt="user" style={{width: 38, height: 38, borderRadius: '50%', border: '2px solid var(--bg-primary)', marginLeft: '-12px', objectFit: 'cover'}} />
                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100" alt="user" style={{width: 38, height: 38, borderRadius: '50%', border: '2px solid var(--bg-primary)', marginLeft: '-12px', objectFit: 'cover'}} />
              </div>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Users size={15} /> +120k Utilisateurs</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hero-graphics"
        >
          <motion.div 
            className="glass-floating-card fc-1"
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(139,92,246,0.5)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '0.75rem', borderRadius: '12px' }}>
                <GraduationCap size={24} color="var(--accent-blue)" />
              </div>
              <div>
                <h4 className="brand-font">Top Instructor</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Des professionnels vérifiés</p>
              </div>
            </div>
          </motion.div>
          
          <img className="main-graphic-img" src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000&auto=format&fit=crop" alt="Students learning" />
          
          <motion.div 
            className="glass-floating-card fc-2"
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(236,72,153,0.5)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: 'rgba(236, 72, 153, 0.2)', padding: '0.75rem', borderRadius: '12px' }}>
                <Award size={24} color="var(--accent-pink)" />
              </div>
              <div>
                <h4 className="brand-font">Certifications</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Validées mondialement</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div id="features" style={{ padding: '8rem 4rem', background: 'var(--bg-secondary)', borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 className="brand-font" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Pourquoi choisir VibeAcademy ?</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '4rem', maxWidth: '600px', margin: '0 auto 4rem' }}>Une méthode d'apprentissage pensée pour l'excellence et la rapidité.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            {[
              { icon: BookOpen, title: 'Contenu Premium', desc: 'Des centaines de ressources et vidéos de haute qualité, mises à jour chaque semaine.' },
              { icon: Shield, title: 'Apprentissage Sécurisé', desc: 'Votre progression est sauvegardée en temps réel. Naviguez à votre rythme.' },
              { icon: Award, title: 'Certifications Officielles', desc: 'Prouvez vos compétences avec un certificat professionnel.' }
            ].map((f, i) => (
              <div key={i} style={{ background: 'var(--bg-tertiary)', padding: '2rem', borderRadius: '20px', border: '1px solid var(--glass-border)', textAlign: 'left' }}>
                <div style={{ width: 50, height: 50, borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--accent-main)' }}>
                  <f.icon size={24} />
                </div>
                <h3 className="brand-font" style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing / Certificates Section */}
      <div id="tarifs" style={{ padding: '8rem 4rem', position: 'relative' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h2 className="brand-font" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Obtenez votre Certificat</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '4rem' }}>L'apprentissage est gratuit. Payez uniquement pour certifier vos compétences.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Free Plan */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '24px', padding: '3rem 2rem', textAlign: 'left' }}>
              <h3 className="brand-font" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Apprentissage</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem' }}>0€ <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ à vie</span></div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {['Accès illimité à tous les cours', 'Progression sauvegardée', 'Communauté de 120k membres', 'Pas de certificat inclus'].map((b, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
                     <CheckCircle size={18} color={i === 3 ? 'var(--text-muted-dark)' : 'var(--accent-alt)'} /> {b}
                  </li>
                ))}
              </ul>
              <button className="btn-pro btn-pro-outline" style={{ width: '100%' }} onClick={() => navigate('/register')}>Commencer gratuit</button>
            </div>

            {/* Pro Plan */}
            <motion.div 
              whileHover={{ scale: 1.02 }} 
              style={{ background: 'var(--gradient-aurora)', border: '1px solid var(--accent-glow)', borderRadius: '24px', padding: '3rem 2rem', textAlign: 'left', position: 'relative', boxShadow: '0 0 50px rgba(139, 92, 246, 0.3)' }}
            >
              <div style={{ position: 'absolute', top: '-15px', right: '2rem', background: 'var(--gradient-magic)', color: 'white', padding: '0.4rem 1rem', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>Recommandé</div>
              <h3 className="brand-font" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Certification Plus</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem' }}>49€ <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ certificat</span></div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {['Accès illimité à tous les cours', 'Passage du Quiz d\'évaluation', 'Certificat officiel VibeAcademy', 'Lien LinkedIn vérifiable'].map((b, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#f8fafc' }}>
                     <CheckCircle size={18} color="var(--accent-main)" /> {b}
                  </li>
                ))}
              </ul>
              <button className="btn-pro btn-pro-primary" style={{ width: '100%' }} onClick={() => setPaymentModalOpen(true)}>Acheter une certification</button>
            </motion.div>
          </div>
        </div>
      </div>

      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setPaymentModalOpen(false)} navigate={navigate} />

      {/* Footer */}
      <footer style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--glass-border)', padding: '2rem 4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>&copy; {new Date().getFullYear()} VibeAcademy. Tous droits réservés.</p>
      </footer>

    </div>
  );
};

export default LandingPage;
