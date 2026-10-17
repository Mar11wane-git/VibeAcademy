import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Chatbot from '../components/Chatbot';

const DashboardLayout = ({ children }) => (
  <div className="app" style={{ flexDirection: 'column' }}>
    <div className="main-content" style={{ width: '100%' }}>
      <div className="orb-1"></div>
      <div className="orb-2"></div>
      <Header />
      <div
        className="main-scroll-area"
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 5,
        }}
      >
        <div style={{ maxWidth: '1460px', width: '100%', margin: '0 auto', flex: '1 0 auto' }}>
          {children}
        </div>
        <Footer />
      </div>
    </div>
    <Chatbot />
  </div>
);

export default DashboardLayout;
