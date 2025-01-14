import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WebSocketProvider } from './WebSocketContext';
import './App.css'
import DrawingCanvas from './DrawingCanvas';
import HostJoinPage from './HostJoinPage';


const App = () => {
  return (
    <WebSocketProvider>
    <Router>
      <Routes>
        {/* Homepage */}
        <Route path="/" element={<HostJoinPage />} />

        {/* Canvas Page */}
        <Route path="/canvas" element={<DrawingCanvas />} />
      </Routes>
    </Router>
    </WebSocketProvider>
  );
};

export default App
