import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LandingPage    from './pages/LandingPage';
import AuthPage       from './pages/AuthPage';
import Dashboard      from './pages/Dashboard';
import MesCours       from './pages/MesCours';
import Favoris        from './pages/Favoris';
import Certificats    from './pages/Certificats';
import Profile       from './pages/Profile';
import Settings      from './pages/Settings';
import CoursePlayer  from './pages/CoursePlayer';
import Quiz          from './pages/Quiz';
import AdminPanel    from './pages/AdminPanel';
import Catalogue     from './pages/Catalogue';
import Community     from './pages/Community';
import CalendarPage  from './pages/CalendarPage';
import AboutPage     from './pages/AboutPage';
import ContactPage   from './pages/ContactPage';

import DashboardLayout from './layouts/DashboardLayout';
import { Navigate } from 'react-router-dom';

// Redirect authenticated users away from the landing/auth pages
const HomeRoute = () => {
  const token = localStorage.getItem('token');
  const user  = JSON.parse(localStorage.getItem('user'));
  if (token && user) {
    return <Navigate to={user.is_admin ? '/admin' : '/dashboard'} replace />;
  }
  return <LandingPage />;
};

import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error("Global Error:", error, errorInfo); }

  handleReset = () => {
    try {
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith('vibe_') || k.startsWith('mr1_api_') || k.includes('cache') || k.includes('ticket')) {
          localStorage.removeItem(k);
        }
      });
    } catch { /* ignore */ }
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#030308', color: '#fff', textAlign: 'center', padding: '2rem' }}>
          <div style={{ width: 64, height: 64, borderRadius: '20px', background: 'rgba(112,0,255,0.15)', border: '1px solid rgba(112,0,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: '1.2rem' }}>
            ⚡
          </div>
          <h1 className="brand-font" style={{ fontSize: '2.5rem', color: '#a855f7', marginBottom: '0.5rem' }}>Système Interrompu</h1>
          <p style={{ color: '#94a3b8', margin: '0.5rem 0 1.8rem', maxWidth: '520px', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Une anomalie temporaire a été détectée dans le cache du navigateur. Cliquez ci-dessous pour réinitialiser le cache et restaurer instantanément le système.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="btn-pro btn-pro-primary" onClick={this.handleReset}>
              Réinitialiser le cache & Recharger
            </button>
            <button
              className="btn-pro"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
              onClick={() => { window.location.href = '/dashboard'; }}
            >
              Aller au Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const AdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || user.is_admin === 0 || user.is_admin === false) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/"         element={<HomeRoute />} />
          <Route path="/login"    element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />

          {/* Protected Dashboard Routes */}
          <Route path="/dashboard"   element={<DashboardLayout><Dashboard /></DashboardLayout>} />
          <Route path="/mes-cours"   element={<DashboardLayout><MesCours /></DashboardLayout>} />
          <Route path="/favoris"     element={<DashboardLayout><Favoris /></DashboardLayout>} />
          <Route path="/certificats" element={<DashboardLayout><Certificats /></DashboardLayout>} />
          <Route path="/profile"     element={<DashboardLayout><Profile /></DashboardLayout>} />
          <Route path="/settings"    element={<DashboardLayout><Settings /></DashboardLayout>} />
          <Route path="/course/:id"  element={<DashboardLayout><CoursePlayer /></DashboardLayout>} />
          <Route path="/course/:id/quiz" element={<DashboardLayout><Quiz /></DashboardLayout>} />
          <Route path="/quiz/:id"    element={<DashboardLayout><Quiz /></DashboardLayout>} />
          <Route path="/admin/*"     element={<AdminRoute><AdminPanel /></AdminRoute>} />
          <Route path="/admin"       element={<AdminRoute><AdminPanel /></AdminRoute>} />
          <Route path="/catalogue"   element={<DashboardLayout><Catalogue /></DashboardLayout>} />
          <Route path="/communaute"  element={<DashboardLayout><Community /></DashboardLayout>} />
          <Route path="/community"   element={<DashboardLayout><Community /></DashboardLayout>} />
          <Route path="/calendrier"  element={<DashboardLayout><CalendarPage /></DashboardLayout>} />
          <Route path="/calendar"    element={<DashboardLayout><CalendarPage /></DashboardLayout>} />
          <Route path="/apropos"     element={<DashboardLayout><AboutPage /></DashboardLayout>} />
          <Route path="/about"       element={<DashboardLayout><AboutPage /></DashboardLayout>} />
          <Route path="/contact"     element={<DashboardLayout><ContactPage /></DashboardLayout>} />
          <Route path="/support"     element={<DashboardLayout><ContactPage /></DashboardLayout>} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
