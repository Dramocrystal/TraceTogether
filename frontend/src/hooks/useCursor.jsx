import { useState, useEffect } from 'react';

export const useCursor = ({ overlayCanvasRef, zoom }) => {
  const [cursorPositions, setCursorPositions] = useState({});

  const renderCursors = () => {
    const overlayCanvas = overlayCanvasRef.current;
    if (!overlayCanvas) return;

    const context = overlayCanvas.getContext('2d');
    context.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    
    Object.entries(cursorPositions).forEach(([user, position]) => {
      const { x, y } = position;
      const cursorSize = Math.max(8 / zoom, 8);
      const fontSize = Math.max(16 / zoom, 16);
      context.fillStyle = 'red';
      context.beginPath();
      context.arc(x, y, cursorSize, 0, Math.PI * 2);
      context.fill();
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