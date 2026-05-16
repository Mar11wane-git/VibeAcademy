import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, RefreshCcw, Download, Sparkles, Trophy } from 'lucide-react';
import api from '../services/api';

const QUIZ_DATA = {
  1: [ // React JS
    { q: "Quel hook est utilisé pour gérer l'état dans un composant fonctionnel ?", options: ["useEffect", "useState", "useContext", "useReducer"], correct: 1 },
    { q: "Comment passer des données d'un composant parent à un enfant ?", options: ["Via l'état", "Via les props", "Via Redux uniquement", "Via les cookies"], correct: 1 },
    { q: "Que signifie JSX ?", options: ["JavaScript XML", "Java Syntax Extension", "JSON Standard XML", "JavaScript Xtra"], correct: 0 },
    { q: "Quel cycle de vie remplace useEffect avec un tableau de dépendances vide ?", options: ["componentDidUpdate", "componentWillUnmount", "componentDidMount", "render"], correct: 2 },
    { q: "React est une bibliothèque maintenue par ?", options: ["Google", "Microsoft", "Meta (Facebook)", "Apple"], correct: 2 },
    { q: "Que permet le hook useMemo ?", options: ["Mémoriser une fonction", "Déclencher un effet", "Mémoriser une valeur recalculée", "Modifier le DOM"], correct: 2 },
    { q: "Qu'est-ce que le Virtual DOM ?", options: ["Un DOM stocké en base de données", "Une représentation en mémoire du DOM réel", "Un DOM caché dans le navigateur", "Une API de rendu 3D"], correct: 1 },
    { q: "À quoi sert principalement useRef ?", options: ["À conserver une valeur sans déclencher de rendu", "À requêter une base de données", "À router des pages", "À importer des images"], correct: 0 },
    { q: "Qu'est-ce qu'un HOC (Higher-Order Component) ?", options: ["Une balise HTML standard", "Une fonction retournant un composant", "Un hook personnalisé", "Un gestionnaire d'état"], correct: 1 },
    { q: "Quelle fonction permet de charger un composant de manière asynchrone ?", options: ["React.async", "React.defer", "React.lazy", "React.await"], correct: 2 }
  ],
  2: [ // Laravel
    { q: "Quel outil est utilisé pour gérer les dépendances PHP ?", options: ["NPM", "Composer", "Maven", "Pip"], correct: 1 },
    { q: "Comment s'appelle l'ORM de Laravel ?", options: ["Eloquent", "Doctrine", "Hibernate", "Prisma"], correct: 0 },
    { q: "Quel est le moteur de template par défaut de Laravel ?", options: ["Twig", "Smarty", "Blade", "EJS"], correct: 2 },
    { q: "Quelle commande artisan permet de créer un contrôleur ?", options: ["make:controller", "create:controller", "generate:controller", "add:controller"], correct: 0 },
    { q: "Le fichier de configuration des routes API est ?", options: ["web.php", "api.php", "routes.php", "config.php"], correct: 1 },
    { q: "Que fait la commande `php artisan migrate` ?", options: ["Supprime la base", "Crée une copie de la base", "Exécute les migrations de base de données", "Génère un modèle"], correct: 2 },
    { q: "Quel est le rôle d'un Middleware dans Laravel ?", options: ["Gérer l'interface graphique", "Filtrer les requêtes HTTP entrantes", "Compiler le CSS", "Créer des requêtes SQL complexes"], correct: 1 },
    { q: "Comment récupérer tous les utilisateurs via Eloquent ?", options: ["User::all()", "User::get()", "DB::table('users')->all()", "User->all()"], correct: 0 },
    { q: "Quel design pattern Laravel implémente-t-il massivement ?", options: ["Singleton", "Factory", "MVC (Modèle-Vue-Contrôleur)", "MVVM"], correct: 2 },
    { q: "Quelle façade gère les éléments de la requête HTTP entrante ?", options: ["Response", "Route", "Request", "Auth"], correct: 2 }
  ],
  6: [ // CSS Glassmorphism
    { q: "Quelle propriété CSS est la base du Glassmorphism ?", options: ["backdrop-filter", "blur", "opacity", "background-clip"], correct: 0 },
    { q: "Quelle valeur de flou est typique pour un effet de verre ?", options: ["2px", "10px-20px", "100px", "0px"], correct: 1 },
    { q: "Pour le texte sur un fond vitré, il est préférable d'utiliser ?", options: ["Une couleur vive", "Un contraste élevé (Blanc/Noir)", "Une faible opacité", "Une ombre énorme"], correct: 1 },
    { q: "Glassmorphism utilise souvent une bordure ?", options: ["Épaisse et colorée", "Semi-transparente et fine", "Pointillée", "Pas de bordure"], correct: 1 },
    { q: "Le mode sombre est-il compatible avec le Glassmorphism ?", options: ["Non", "Oui, avec des fonds sombres et translucides", "Uniquement sur Safari", "Seulement avec Tailwind"], correct: 1 },
    { q: "Quel code correspond à un blanc avec 50% d'opacité ?", options: ["rgba(255, 255, 255, 0.5)", "#ffffff10", "rgb(255, 255, 255)", "#50ffffff"], correct: 0 },
    { q: "Quel attribut HTML est clé pour gérer la profondeur des calques (Layering) en verre ?", options: ["display", "position + z-index", "margin", "padding"], correct: 1 },
    { q: "Comment éviter que les DANS un élément vitré soient eux-mêmes floutés ?", options: ["Utiliser backdrop-filter au lieu de filter", "Mettre z-index: -1", "Ajouter opacity: 1", "Ce n'est pas possible"], correct: 0 },
    { q: "Quel est l'avantage visuel principal du Glassmorphism ?", options: ["Imiter le bois", "Cacher complètement le fond", "Créer une hiérarchie visuelle via la profondeur", "Rendre le site plus rapide"], correct: 2 },
    { q: "Quel système d'exploitation récent a fortement popularisé le Glassmorphism ?", options: ["Windows XP", "macOS Big Sur & iOS", "Ubuntu 14", "Android 4"], correct: 1 }
  ]
};

const getRandomQuestions = (courseId, count = 5) => {
  const pool = QUIZ_DATA[courseId] || QUIZ_DATA[1];
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const Quiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, enrollsRes] = await Promise.all([
          api.get(`/courses/${id}`),
          api.get('/my-enrollments')
        ]);
        
        const enrollment = enrollsRes.data.find(e => e.course_id === parseInt(id));
        if (!enrollment || enrollment.progress < 100) {
          setError("Vous devez terminer 100% du cours avant de passer l'examen.");
          setLoading(false);
          return;
        }

        setCourse(courseRes.data);
        setQuestions(getRandomQuestions(id)); 
      } catch (err) {
        setError("Erreur lors du chargement de l'examen.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSelect = (qIdx, optIdx) => {
    setAnswers({ ...answers, [qIdx]: optIdx });
  };

  const calculateScore = () => {
    let s = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correct) s++;
    });
    const percentage = (s / questions.length) * 100;
    setScore(percentage);
    setSubmitted(true);
  };

  if (loading) return <div className="page-view flex-center"><div className="loader"></div></div>;
  if (error) return (
    <div className="page-view flex-center">
      <div className="glass-card" style={{ maxWidth: 500, padding: '3rem', textAlign: 'center' }}>
        <AlertCircle size={48} color="#f87171" style={{ margin: '0 auto 1.5rem' }} />
        <h2 className="brand-font" style={{ marginBottom: '1rem' }}>Accès Refusé</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{error}</p>
        <button className="btn-pro btn-pro-primary" onClick={() => navigate(`/course/${id}`)}>
          Retourner au cours
        </button>
      </div>
    </div>
  );

  const currentQ = questions[currentIdx];
  const isLast = currentIdx === questions.length - 1;

  if (submitted) {
    const passed = score >= 80;
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="page-view flex-center">
        <div className="glass-card" style={{ maxWidth: 600, padding: '4rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          {passed && <div className="aurora-glow" style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle, rgba(255, 255, 255,0.15) 0%, transparent 70%)', zIndex: 0 }} />}
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            {passed ? (
              <>
                <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg, #4ade80, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', boxShadow: '0 0 40px rgba(34,197,94,0.4)' }}>
                  <Trophy size={50} color="white" />
                </div>
                <h1 className="brand-font" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Félicitations !</h1>
                <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>Score : <span style={{ color: '#4ade80', fontWeight: 800 }}>{score}%</span></p>
                <div style={{ padding: '2rem', borderRadius: '24px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', marginBottom: '2.5rem', textAlign: 'left' }}>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}><CheckCircle2 size={18} color="#4ade80" /> Examen réussi avec succès.</p>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Sparkles size={18} color="var(--accent-purple)" /> Certificat disponible immédiatement.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn-pro btn-pro-primary" style={{ flex: 1 }} onClick={() => navigate('/certificats')}>
                    <Download size={18} /> Télécharger mon Certificat
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                  <RefreshCcw size={50} color="#f87171" />
                </div>
                <h1 className="brand-font" style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>Presque réussi !</h1>
                <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>Score : <span style={{ color: '#f87171', fontWeight: 800 }}>{score}%</span></p>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>Il vous faut au moins 80% pour obtenir la certification. Révisez le cours et réessayez.</p>
                <button className="btn-pro btn-pro-primary" onClick={() => { setSubmitted(false); setCurrentIdx(0); setAnswers({}); setQuestions(getRandomQuestions(id)); }}>
                  Réessayer l'examen
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-view">
      <div className="quiz-container" style={{ maxWidth: 800, margin: '2rem auto' }}>
        
        {/* Quiz Header */}
        <div style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--accent-purple)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px' }}>Examen de Certification</span>
            <h1 className="brand-font" style={{ fontSize: '1.8rem', marginTop: '0.5rem' }}>{course?.title}</h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>Question {currentIdx + 1} / {questions.length}</p>
            <div style={{ width: 120, height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, marginTop: '8px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'var(--accent-purple)', width: `${((currentIdx + 1) / questions.length) * 100}%` }}></div>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="glass-card" style={{ padding: '3rem' }}>
            
            <h2 className="brand-font" style={{ fontSize: '1.4rem', marginBottom: '2.5rem', lineHeight: 1.4 }}>{currentQ?.q}</h2>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              {currentQ?.options.map((opt, i) => (
                <button 
                  key={i}
                  className={`quiz-opt ${answers[currentIdx] === i ? 'active' : ''}`}
                  onClick={() => handleSelect(currentIdx, i)}
                >
                  <div className="opt-indicator">
                    {String.fromCharCode(65 + i)}
                  </div>
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'space-between' }}>
          <button 
            className="btn-pro btn-pro-outline" 
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx(currentIdx - 1)}>
            <ArrowLeft size={18} /> Précédent
          </button>

          {isLast ? (
            <button 
              className="btn-pro btn-pro-primary" 
              disabled={answers[currentIdx] === undefined}
              onClick={calculateScore}>
              Terminer l'examen <CheckCircle2 size={18} />
            </button>
          ) : (
            <button 
              className="btn-pro btn-pro-primary" 
              disabled={answers[currentIdx] === undefined}
              onClick={() => setCurrentIdx(currentIdx + 1)}>
              Suivant <ArrowRight size={18} />
            </button>
          )}
        </div>

      </div>
    </motion.div>
  );
};

export default Quiz;
