import { useState, useEffect } from 'react';

export const useCursor = ({ overlayCanvasRef }) => {
  const [cursorPositions, setCursorPositions] = useState({});

  const renderCursors = () => {
    const overlayCanvas = overlayCanvasRef.current;
    if (!overlayCanvas) return;

    const context = overlayCanvas.getContext('2d');
    context.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    
    Object.entries(cursorPositions).forEach(([user, position]) => {
      const { x, y } = position;
      context.fillStyle = 'red';
      context.beginPath();
      context.arc(x, y, 5, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = 'black';
      context.fillText(user, x + 10, y);
    });
  };

  useEffect(() => {
    renderCursors();
  }, [cursorPositions]);

  return { 
    cursorPositions,
    setCursorPositions 
  };
};