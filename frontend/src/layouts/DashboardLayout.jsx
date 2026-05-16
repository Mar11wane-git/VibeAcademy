import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Chatbot from '../components/Chatbot';

const DashboardLayout = ({ children }) => (
  <div className="app">
    <Sidebar />
    <div className="main-content">
      <div className="orb-1"></div>
      <div className="orb-2"></div>
      <Header />
      {children}
    </div>
    <Chatbot />
  </div>
);

export default DashboardLayout;
