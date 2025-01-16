import { useState, useEffect } from 'react';

export const useCursor = ({ overlayCanvasRef, username, zoom }) => {
  const [cursorPositions, setCursorPositions] = useState({});

  const renderCursors = () => {
    const overlayCanvas = overlayCanvasRef.current;
    if (!overlayCanvas) return;

    const context = overlayCanvas.getContext('2d');
    context.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    
    Object.entries(cursorPositions).forEach(([user, position]) => {
      if (!position) return;
      
      const { x, y } = position;
      const cursorSize = Math.max(8 / zoom, 8);
      const fontSize = Math.max(16 / zoom, 16);
      
      // Draw cursor
      context.fillStyle = user === username ? '#FF4444' : '#2196F3';
      context.beginPath();
      context.arc(x, y, cursorSize, 0, Math.PI * 2);
      context.fill();
      
      // Draw username
      context.fillStyle = 'black';
      context.font = `${fontSize}px Arial`;
      context.fillText(user, x + cursorSize + 5, y + cursorSize / 2);
    });
  };

  useEffect(() => {
    renderCursors();
  }, [cursorPositions, zoom]);

  return { 
    cursorPositions,
    setCursorPositions 
  };
};