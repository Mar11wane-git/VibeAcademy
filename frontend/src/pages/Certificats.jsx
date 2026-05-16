import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Download, RefreshCw, CheckCircle, XCircle, Clock, Brain, Trophy, Share2, Target, Lock } from 'lucide-react';
import api from '../services/api';

// ─── Quiz Questions per course ───────────────────────────────────────────────
const QUIZ_BANK = {
  default: [
    { q: "Qu'est-ce qu'une API REST ?", opts: ["Un framework CSS", "Une interface de communication basée sur HTTP", "Un type de base de données", "Un langage de programmation"], ans: 1 },
    { q: "Quel code HTTP signifie 'succès' ?", opts: ["404", "500", "200", "301"], ans: 2 },
    { q: "Qu'est-ce que JSON ?", opts: ["Java Source Object Notation", "JavaScript Object Notation", "Java Script Only Notation", "Aucune de celles-ci"], ans: 1 },
    { q: "Qu'est-ce qu'une base de données relationnelle ?", opts: ["Une BD sans tables", "Une BD organisée en tableaux avec des relations", "Une BD NoSQL", "Un fichier texte"], ans: 1 },
    { q: "Quel est le rôle d'un backend ?", opts: ["Afficher l'interface", "Gérer la logique métier et les données", "Styliser les pages", "Aucun rôle"], ans: 1 },
  ],
  react: [
    { q: "Qu'est-ce que JSX dans React ?", opts: ["Un fichier JSON", "Une syntaxe JavaScript qui ressemble à HTML", "Un framework CSS", "Un type de hook"], ans: 1 },
    { q: "À quoi sert le hook useState ?", opts: ["Gérer les routes", "Faire des requêtes HTTP", "Gérer l'état local d'un composant", "Styler les composants"], ans: 2 },
    { q: "Qu'est-ce que useEffect ?", opts: ["Un hook pour les effets de bord", "Un hook pour les styles", "Un composant React", "Une bibliothèque"], ans: 0 },
    { q: "Comment passe-t-on des données à un composant enfant ?", opts: ["Via les states", "Via les props", "Via les hooks", "Via le contexte"], ans: 1 },
    { q: "Que retourne une fonction composant React ?", opts: ["Un objet JSON", "Du XML", "Du JSX ou null", "Un tableau"], ans: 2 },
    { q: "Quelle est la bonne façon de conditionner un rendu ?", opts: ["{if condition}", "{condition && <Composant />}", "if(condition) return", "condition ? Composant"], ans: 1 },
    { q: "À quoi sert React Router ?", opts: ["Gérer les états", "Faire des requêtes API", "Gérer la navigation entre pages", "Créer des animations"], ans: 2 },
    { q: "Qu'est-ce que framer-motion ?", opts: ["Une bibliothèque d'animations React", "Un framework backend", "Un gestionnaire d'état", "Un ORM"], ans: 0 },
    { q: "Quelle méthode met à jour un état en React ?", opts: ["setState()", "La fonction retournée par useState()", "updateState()", "Les deux A et B"], ans: 1 },
    { q: "Quel hook permet de mémoriser une valeur calculée ?", opts: ["useCallback", "useRef", "useMemo", "useState"], ans: 2 },
  ],
  laravel: [
    { q: "Que signifie MVC dans Laravel ?", opts: ["Model View Controller", "Multiple View Component", "Model Variable Code", "Main View Creator"], ans: 0 },
    { q: "Quel fichier contient les routes API de Laravel ?", opts: ["routes/web.php", "routes/api.php", "app/routes.php", "config/routes.php"], ans: 1 },
    { q: "Qu'est-ce qu'Eloquent dans Laravel ?", opts: ["Un système de cache", "Un ORM pour interagir avec la base de données", "Un système d'authentification", "Un template engine"], ans: 1 },
    { q: "Quelle commande crée une migration ?", opts: ["php artisan make:migration", "php artisan migrate", "php artisan create:migration", "php artisan new:migration"], ans: 0 },
    { q: "À quoi sert Sanctum ?", opts: ["Gérer les fichiers", "Créer des jobs", "Authentification API par token", "Envoyer des emails"], ans: 2 },
    { q: "Quelle commande lance le serveur Laravel ?", opts: ["php artisan start", "php artisan run", "php artisan serve", "php start"], ans: 2 },
    { q: "Que fait 'php artisan migrate:fresh --seed' ?", opts: ["Sauvegarde la base de données", "Réinitialise et repeuple la base", "Met à jour les dépendances", "Lance les tests"], ans: 1 },
    { q: "Qu'est-ce qu'un Middleware dans Laravel ?", opts: ["Un modèle de données", "Un filtre qui s'exécute avant/après les requêtes", "Un type de contrôleur", "Un service tiers"], ans: 1 },
    { q: "Quelle méthode Eloquent retourne tous les enregistrements ?", opts: ["Model::find()", "Model::all()", "Model::get()", "Model::list()"], ans: 1 },
    { q: "Qu'est-ce que le fichier .env dans Laravel ?", opts: ["Un fichier de routes", "Un fichier de configuration d'environnement", "Un fichier de modèles", "Un fichier de vues"], ans: 1 },
  ],
  uiux: [
    { q: "Que signifie UX ?", opts: ["User eXperience", "Universal eXchange", "User eXpert", "Unique eXecution"], ans: 0 },
    { q: "Qu'est-ce qu'un wireframe ?", opts: ["Un prototype haute fidélité", "Une maquette fil de fer basse fidélité", "Un code HTML", "Un fichier CSS"], ans: 1 },
    { q: "Qu'est-ce que le Glassmorphism ?", opts: ["Un style avec effet de verre translucide", "Une police d'écriture", "Un framework CSS", "Un type d'animation"], ans: 0 },
    { q: "Que désigne 'UI' ?", opts: ["User Interface", "Universal Integration", "User Input", "Unique Interface"], ans: 0 },
    { q: "Qu'est-ce que la règle des 8px en design ?", opts: ["Les marges doivent faire 8px", "Les éléments sont alignés sur une grille de 8px", "La police minimale est 8px", "Un bouton fait 8px de haut"], ans: 1 },
  ],
};

const getQuizQuestions = (title = '') => {
  const t = title.toLowerCase();
  if (t.includes('react')) return QUIZ_BANK.react;
  if (t.includes('laravel')) return QUIZ_BANK.laravel;
  if (t.includes('ui') || t.includes('ux') || t.includes('design')) return QUIZ_BANK.uiux;
  return QUIZ_BANK.default;
};

// ─── Certificate Download ────────────────────────────────────────────────────
const downloadCertificate = (userName, courseName, score) => {
  const certWindow = window.open('', '_blank');
  certWindow.document.write(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Certificat – ${courseName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;700;800&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Outfit',sans-serif; background:#0a0a0c; display:flex; align-items:center; justify-content:center; min-height:100vh; }
    .page { width:900px; min-height:620px; padding:60px 70px; background:linear-gradient(135deg,#0f0b1e,#0a0a14); border-radius:24px; position:relative; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; }
    .border { position:absolute; inset:0; border-radius:24px; border:3px solid transparent; background:linear-gradient(135deg,#ffffff,#3b82f6,#ec4899) border-box; -webkit-mask:linear-gradient(#fff 0 0) padding-box,linear-gradient(#fff 0 0); -webkit-mask-composite:destination-out; }
    .corner { position:absolute; width:60px; height:60px; border-color:#ffffff; border-style:solid; }
    .tl { top:20px; left:20px; border-width:3px 0 0 3px; border-radius:8px 0 0 0; }
    .tr { top:20px; right:20px; border-width:3px 3px 0 0; border-radius:0 8px 0 0; }
    .bl { bottom:20px; left:20px; border-width:0 0 3px 3px; border-radius:0 0 0 8px; }
    .br { bottom:20px; right:20px; border-width:0 3px 3px 0; border-radius:0 0 8px 0; }
    .icon-seal { width:96px; height:96px; background:linear-gradient(135deg,#ffffff,#ec4899); border-radius:24px; display:flex; align-items:center; justify-content:center; margin:0 auto 1.5rem; box-shadow:0 0 40px rgba(255, 255, 255,0.4); }
    .top-label { font-size:0.85rem; letter-spacing:6px; color:#64748b; text-transform:uppercase; margin-bottom:1.5rem; }
    .present { font-size:1rem; color:#94a3b8; margin-bottom:0.5rem; }
    .student-name { font-size:3.5rem; font-weight:800; background:linear-gradient(135deg,#fff,#c4b5fd); -webkit-background-clip:text; -webkit-text-fill-color:transparent; margin:0.5rem 0 0.75rem; line-height:1.1; }
    .for { font-size:1rem; color:#94a3b8; margin-bottom:0.75rem; }
    .course-name { font-size:1.8rem; font-weight:700; background:linear-gradient(135deg,#3b82f6,#ffffff,#ec4899); -webkit-background-clip:text; -webkit-text-fill-color:transparent; margin-bottom:2rem; }
    .score-bar { background:rgba(255, 255, 255,0.15); border:1px solid rgba(255, 255, 255,0.3); border-radius:12px; padding:0.6rem 2rem; color:#a78bfa; font-weight:700; font-size:1.1rem; display:inline-block; margin-bottom:2rem; }
    .divider { width:200px; height:1px; background:linear-gradient(90deg,transparent,#ffffff,transparent); margin:1.5rem auto; }
    .footer-row { display:flex; justify-content:space-between; align-items:flex-end; width:100%; margin-top:1.5rem; }
    .sig-block { text-align:center; }
    .sig-line { width:160px; height:1px; background:rgba(255,255,255,0.15); margin:0.5rem auto; }
    .sig-name { font-size:0.85rem; color:#64748b; }
    .brand { font-size:1.5rem; font-weight:800; background:linear-gradient(135deg,#ffffff,#ec4899); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
  </style>
</head>
<body>
  <div class="page">
    <div class="border"></div>
    <div class="corner tl"></div><div class="corner tr"></div>
    <div class="corner bl"></div><div class="corner br"></div>
    <div class="icon-seal">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
      </svg>
    </div>
    <div class="top-label">Certificat de Réussite</div>
    <div class="present">Ce certificat est décerné avec fierté à</div>
    <div class="student-name">${userName}</div>
    <div class="for">pour avoir réussi avec succès le cours</div>
    <div class="course-name">${courseName}</div>
    <div class="score-bar">Score du quiz : ${score}% — Mention Excellente</div>
    <div class="divider"></div>
    <div class="footer-row">
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-name">Directeur Pédagogique</div>
      </div>
      <div class="brand">VibeAcademy</div>
      <div style="font-size:0.85rem; color:#64748b; text-align:right;">
        Délivré le<br/><strong>${new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
      </div>
    </div>
  </div>
  <script>setTimeout(() => { window.print(); }, 500);</script>
</body>
</html>`);
  certWindow.document.close();
};

// ─── Quiz Component ───────────────────────────────────────────────────────────
const Quiz = ({ course, onPass, onFail }) => {
  const questions = getQuizQuestions(course.title);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(20);
  const timerRef = useRef(null);

  useEffect(() => {
    setTimeLeft(20);
    timerRef.current = setInterval(() => {
      setTimeLeft(p => {
        if (p <= 1) { handleNext(null); return 20; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [currentQ]);

  const handleNext = (choice) => {
    clearInterval(timerRef.current);
    const newAnswers = [...answers, choice];
    setAnswers(newAnswers);
    setSelected(null);
    if (currentQ + 1 >= questions.length) {
      const correct = newAnswers.filter((a, i) => a === questions[i].ans).length;
      const score = Math.round((correct / questions.length) * 100);
      setTimeout(() => (score >= 80 ? onPass(score) : onFail(score)), 300);
    } else {
      setCurrentQ(p => p + 1);
    }
  };

  const q = questions[currentQ];
  const timerPct = (timeLeft / 20) * 100;
  const timerColor = timeLeft > 10 ? 'var(--accent-blue)' : timeLeft > 5 ? '#f59e0b' : '#ef4444';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          <Brain size={18} color="var(--accent-purple)" />
          Question {currentQ + 1} / {questions.length}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: `${timerColor}18`, border: `1px solid ${timerColor}44`, padding: '0.4rem 1rem', borderRadius: '8px' }}>
          <Clock size={15} color={timerColor} />
          <span style={{ color: timerColor, fontWeight: 700, fontSize: '1rem', fontVariantNumeric: 'tabular-nums' }}>{timeLeft}s</span>
        </div>
      </div>

      {/* Progress */}
      <div style={{ height: 5, background: 'var(--glass-bg)', borderRadius: '99px', marginBottom: '0.75rem' }}>
        <motion.div style={{ height: '100%', borderRadius: '99px', background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-purple))' }}
          animate={{ width: `${(currentQ / questions.length) * 100}%` }} transition={{ duration: 0.3 }} />
      </div>

      {/* Timer bar */}
      <div style={{ height: 3, background: 'var(--glass-bg)', borderRadius: '99px', marginBottom: '2.5rem' }}>
        <motion.div style={{ height: '100%', borderRadius: '99px', background: timerColor, transition: 'background 0.3s' }}
          animate={{ width: `${timerPct}%` }} transition={{ duration: 1 }} />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div key={currentQ}
          initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }}
          transition={{ type: 'spring', stiffness: 220, damping: 26 }}
          style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '20px', padding: '2.5rem', marginBottom: '1.5rem' }}>
          <h2 className="brand-font" style={{ fontSize: '1.45rem', lineHeight: 1.4 }}>{q.q}</h2>
        </motion.div>
      </AnimatePresence>

      {/* Options */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {q.opts.map((opt, i) => (
          <motion.button key={`${currentQ}-${i}`}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => { setSelected(i); setTimeout(() => handleNext(i), 300); }}
            style={{
              background: selected === i ? 'rgba(255, 255, 255,0.15)' : 'var(--bg-tertiary)',
              border: `1px solid ${selected === i ? 'rgba(255, 255, 255,0.6)' : 'var(--glass-border)'}`,
              color: 'white', padding: '1rem 1.25rem', borderRadius: '14px', textAlign: 'left',
              fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 500,
              boxShadow: selected === i ? '0 0 20px rgba(255, 255, 255,0.2)' : 'none',
            }}>
            <span style={{ background: 'rgba(255, 255, 255,0.12)', border: '1px solid rgba(255, 255, 255,0.25)', color: '#a78bfa', padding: '0.2rem 0.65rem', borderRadius: '6px', fontSize: '0.8rem', marginRight: '0.75rem', fontWeight: 700 }}>
              {['A', 'B', 'C', 'D'][i]}
            </span>
            {opt}
          </motion.button>
        ))}
      </div>

      <button className="btn-pro btn-pro-outline" style={{ marginTop: '2rem', width: '100%' }} onClick={() => handleNext(null)}>
        Passer cette question
      </button>
    </motion.div>
  );
};

// ─── Main Certificats Page ────────────────────────────────────────────────────
const Certificats = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [phase, setPhase] = useState('list');
  const [finalScore, setFinalScore] = useState(0);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    api.get('/my-enrollments')
      .then(res => setEnrollments(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const startQuiz = (enrollment) => { setSelected(enrollment); setPhase('quiz'); };
  const handlePass = (score) => { setFinalScore(score); setPhase('pass'); };
  const handleFail = (score) => { setFinalScore(score); setPhase('fail'); };

  // ── List Phase ──────────────────────────────────────────────────────────────
  if (phase === 'list') {
    const passedQuizzesCount = 0; // Mock: we can imagine localstorage stores passed quizzes
    
    return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title brand-font" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            Certifications & Évaluations <Award size={28} color="var(--accent-main)" />
          </h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Validez officiellement vos acquis pédagogiques.</p>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', background: 'var(--bg-secondary)', padding: '1rem 2rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
          <div>
             <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '1px' }}>Certificats Obtenus</span>
             <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>0</div>
          </div>
          <div style={{ width: 1, background: 'var(--glass-border)' }}></div>
          <div>
             <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '1px' }}>Heures Certifiées</span>
             <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>0h</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-center">
          <div className="loader-wrapper">
            <div className="loader-pro"></div>
            <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Vérification de vos admissions...</p>
          </div>
        </div>
      ) : enrollments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'var(--glass-bg)', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
          <div style={{ width: 80, height: 80, borderRadius: '20px', background: 'rgba(255, 255, 255,0.1)', border: '1px solid rgba(255, 255, 255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Award size={36} color="var(--accent-purple)" />
          </div>
          <h2 className="brand-font" style={{ marginBottom: '0.75rem' }}>Aucun cours inscrit</h2>
          <p style={{ color: 'var(--text-muted)' }}>Inscrivez-vous à un cours pour pouvoir passer le quiz de certification.</p>
        </div>
      ) : (
        <div className="course-grid">
          {enrollments.map((enrollment, i) => {
            const course = enrollment.course;
            if (!course) return null;
            return (
              <motion.div key={enrollment.id}
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                style={{ background: 'linear-gradient(135deg, rgba(20,20,30,0.9), rgba(30,25,45,0.7))', border: '1px solid var(--glass-border)', borderRadius: '24px', padding: '2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -30, right: -20, opacity: 0.04 }}>
                  <Award size={120} />
                </div>
                <div style={{ width: 64, height: 64, borderRadius: '18px', background: 'linear-gradient(135deg, rgba(255, 255, 255,0.2), rgba(59,130,246,0.2))', border: '1px solid rgba(255, 255, 255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                  <Award size={28} color="var(--accent-purple)" />
                </div>
                <h3 className="brand-font" style={{ marginBottom: '0.5rem', lineHeight: 1.3 }}>{course.title}</h3>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <span style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>Questions: 10</span>
                    <span style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>Chrono: 20s/q</span>
                </div>

                <div style={{ background: 'var(--glass-bg)', borderRadius: '12px', padding: '0.75rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Progression du cours</span>
                      <span style={{ color: enrollment.progress === 100 ? '#4ade80' : 'var(--text-main)', fontWeight: 700 }}>{enrollment.progress || 0}%</span>
                  </div>
                  <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${enrollment.progress || 0}%`, background: enrollment.progress === 100 ? '#4ade80' : 'var(--accent-main)' }} />
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Progression : {enrollment.progress || 0}%</p>
                </div>
                <motion.button
                  className={`btn-pro ${enrollment.progress === 100 ? 'btn-pro-primary' : 'btn-pro-outline'}`}
                  style={{ width: '100%', opacity: enrollment.progress === 100 ? 1 : 0.6 }}
                  whileHover={enrollment.progress === 100 ? { scale: 1.02 } : {}}
                  whileTap={enrollment.progress === 100 ? { scale: 0.97 } : {}}
                  onClick={() => enrollment.progress === 100 && startQuiz(enrollment)}
                  disabled={enrollment.progress < 100}>
                  {enrollment.progress === 100 ? <><Brain size={18} /> Passer le Quiz Final</> : <><Lock size={16} /> Finissez le cours</>}
                </motion.button>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted-dark)', marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                  <Target size={12} /> Minimum 80% requis pour le certificat
                </p>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
  }

  // ── Quiz Phase ──────────────────────────────────────────────────────────────
  if (phase === 'quiz') return (
    <div className="page-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 className="page-title brand-font" style={{ marginBottom: '0.25rem' }}>Quiz de Certification</h1>
          <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Brain size={15} /> {selected.course?.title}</p>
        </div>
        <button className="btn-pro btn-pro-outline" onClick={() => setPhase('list')}>
          <XCircle size={16} /> Annuler
        </button>
      </div>
      <Quiz course={selected.course} onPass={handlePass} onFail={handleFail} />
    </div>
  );

  // ── Pass Phase ──────────────────────────────────────────────────────────────
  if (phase === 'pass') return (
    <div className="page-view" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
      <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        style={{ textAlign: 'center', maxWidth: 560 }}>
        <motion.div animate={{ rotate: [0, -10, 10, -5, 5, 0] }} transition={{ delay: 0.5, duration: 0.8 }}
          style={{ width: 100, height: 100, borderRadius: '28px', background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(59,130,246,0.2))', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', boxShadow: '0 0 40px rgba(34,197,94,0.2)' }}>
          <Trophy size={48} color="#4ade80" />
        </motion.div>

        <h1 className="brand-font" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Félicitations !</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem', lineHeight: 1.6 }}>
          Vous avez obtenu <strong style={{ color: '#4ade80' }}>{finalScore}%</strong> au quiz de<br />
          <strong style={{ color: 'white' }}>«&nbsp;{selected.course?.title}&nbsp;»</strong>.<br />
          Votre certificat est prêt à être téléchargé.
        </p>

        <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '20px', padding: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: '#4ade80' }}>{finalScore}%</div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4ade80', fontWeight: 700 }}>
              <CheckCircle size={20} /> Réussi
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Mention Excellente</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <motion.button className="btn-pro btn-pro-primary" style={{ fontSize: '1.05rem', padding: '1rem 2rem' }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
            onClick={() => downloadCertificate(user.name || 'Étudiant', selected.course?.title, finalScore)}>
            <Download size={20} /> Télécharger le Certificat
          </motion.button>
          <button className="btn-pro btn-pro-outline" onClick={() => setPhase('list')}>Retour</button>
        </div>
      </motion.div>
    </div>
  );

  // ── Fail Phase ──────────────────────────────────────────────────────────────
  if (phase === 'fail') return (
    <div className="page-view" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        style={{ textAlign: 'center', maxWidth: 520 }}>
        <div style={{ width: 100, height: 100, borderRadius: '28px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
          <XCircle size={48} color="#f87171" />
        </div>
        <h1 className="brand-font" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Score insuffisant</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '2rem', lineHeight: 1.6 }}>
          Vous avez obtenu <strong style={{ color: '#f87171' }}>{finalScore}%</strong>.<br />
          Un minimum de <strong style={{ color: '#fbbf24' }}>80%</strong> est requis.<br />
          Révisez le cours et réessayez.
        </p>

        <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: '#f87171' }}>{finalScore}%</div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171', fontWeight: 700 }}>
              <XCircle size={18} /> Non réussi
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Minimum requis : 80%</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <motion.button className="btn-pro btn-pro-primary" whileHover={{ scale: 1.05 }}
            onClick={() => setPhase('quiz')}>
            <RefreshCw size={18} /> Réessayer le Quiz
          </motion.button>
          <button className="btn-pro btn-pro-outline" onClick={() => setPhase('list')}>Retour</button>
        </div>
      </motion.div>
    </div>
  );
};

export default Certificats;
