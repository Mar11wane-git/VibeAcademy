import React, { createContext, useState, useEffect, useContext } from 'react';
import { translations } from './translations';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'fr');
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('user');
      return u && u !== 'undefined' ? JSON.parse(u) : null;
    } catch { return null; }
  });

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // We don't navigate here because we don't have access to useNavigate in the provider
    // unless we wrap the provider in a Router or use a different pattern.
    // Callers will handle navigation.
  };

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.body.className = theme + '-mode';
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  const changeLang = (l) => setLang(l);
  const t = (key) => {
    if (!translations[lang]) return key;
    return translations[lang][key] || key;
  };

  return (
    <AppContext.Provider value={{ theme, lang, toggleTheme, changeLang, t, user, setUser, login, logout }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
