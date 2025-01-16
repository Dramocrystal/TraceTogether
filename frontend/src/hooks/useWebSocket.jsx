import { useEffect, useRef } from 'react';
import { renderDrawing, renderCanvasHistory } from '../utils/drawingUtils';
import { useWebSocket } from '../WebSocketContext';

export const useDrawingWebSocket = ({ 
  canvasRef, 
  username, 
  roomCode, 
  notificationRef,
  isDrawing,
  color,
  lineWidth,
  isErasing,
  lastPosition,
  setLastPosition,
  setCursorPositions 
}) => {
  const { sendMessage, addMessageListener } = useWebSocket();
  const messageHandlerRef = useRef(null);

  useEffect(() => {
    // Define message handler
    messageHandlerRef.current = (event) => {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'cursor':
          setCursorPositions((prev) => ({
            ...prev,
            [message.username]: message.position,
          }));
          break;
          
        case 'drawing':
          const { start, end, color, lineWidth, isErasing } = message;
          const context = canvasRef.current.getContext('2d');
          renderDrawing(context, start, end, color, lineWidth, isErasing);
          break;
          
        case 'notification':
          // Add a check to prevent duplicate notifications
          if (notificationRef.current) {
            notificationRef.current.addNotification(message.message, message.JLType);
          }
          break;
          
        case 'canvasHistory':
          renderCanvasHistory(message.history, canvasRef);
          break;
      }
    };

    // Only add the listener once and store the cleanup function
    const cleanup = addMessageListener(messageHandlerRef.current);

    return () => {
      cleanup();
      messageHandlerRef.current = null;
    };
  }, []);

  const handleMouseMove = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    
    sendMessage({
      type: 'cursor',
      username,
      position: { x: offsetX, y: offsetY },
    });
    
    if (isDrawing) {
      const context = canvasRef.current.getContext('2d');
      const currentPosition = { x: offsetX, y: offsetY };
      
      renderDrawing(
        context,
        lastPosition,
        currentPosition,
        isErasing ? null : color,
        lineWidth,
        isErasing
      );

      sendMessage({
        type: 'drawing',
        start: lastPosition,
        end: currentPosition,
        color: isErasing ? null : color,
        lineWidth,
        isErasing,
      });

      setLastPosition(currentPosition);
    }
  };

  return { handleMouseMove };
};