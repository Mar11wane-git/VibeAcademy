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

const AdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || user.is_admin === 0 || user.is_admin === false) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
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
        <Route path="/quiz/:id"    element={<DashboardLayout><Quiz /></DashboardLayout>} />
        <Route path="/admin/*"     element={<AdminRoute><AdminPanel /></AdminRoute>} />
        <Route path="/admin"       element={<AdminRoute><AdminPanel /></AdminRoute>} />
        <Route path="/catalogue"   element={<DashboardLayout><Catalogue /></DashboardLayout>} />
        <Route path="/communaute"  element={<DashboardLayout><Community /></DashboardLayout>} />
        <Route path="/calendrier"  element={<DashboardLayout><CalendarPage /></DashboardLayout>} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
