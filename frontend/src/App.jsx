// App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { WebSocketProvider } from './WebSocketContext';
import './App.css';
import DrawingCanvas from './DrawingCanvas';
import HostJoinPage from './HostJoinPage';

const AppContent = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      navigate('/mobile-unsupported');
    }
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<HostJoinPage />} />
      <Route path="/canvas" element={<DrawingCanvas />} />
      <Route
  path="/mobile-unsupported"
  element={
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        padding: '2rem',
        textAlign: 'center',
        backgroundColor: '#f9fafb', // light gray
        color: '#111827', // dark text
        fontFamily: 'Segoe UI, Roboto, sans-serif'
      }}
    >
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🚫 Mobile Not Supported</h1>
      <p style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
        This app isn’t available on mobile devices yet.
      </p>
      <p style={{ fontSize: '1rem' }}>
        Want to help build it? Contribute on{' '}
        <a
          href="https://github.com/Dramocrystal/TraceTogether"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}
              >
                GitHub
              </a>
              .
            </p>
          </div>
        }
      />

    </Routes>
  );
};

const App = () => {
  return (
    <WebSocketProvider>
      <Router>
        <AppContent />
      </Router>
    </WebSocketProvider>
  );
};

export default App;
