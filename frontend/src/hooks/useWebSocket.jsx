import { useEffect } from 'react';
import { renderDrawing, renderCanvasHistory } from '../utils/drawingUtils';

export const useWebSocket = ({ 
  canvasRef, 
  ws, 
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
  const handleWebSocketMessage = (message) => {
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
        notificationRef.current?.addNotification(message.message, message.JLType);
        break;
        
      case 'canvasHistory':
        renderCanvasHistory(message.history, canvasRef);
        break;
    }
  };

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:5000/socket/');

    ws.current.onopen = () => {
      console.log('Connected to WebSocket');
      ws.current.send(JSON.stringify({ type: 'join', code: roomCode, name: username }));
    };

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      handleWebSocketMessage(message);
    };

    ws.current.onclose = () => {
      ws.current.send(JSON.stringify({ type: 'join', code: roomCode, name: username }));
      console.log('Disconnected from WebSocket');
    };

    return () => {
      ws.current.close();
    };
  }, [roomCode, username]);

  const sendDrawingEvent = (start, end) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: 'drawing',
          start,
          end,
          color: isErasing ? null : color,
          lineWidth,
          isErasing,
        })
      );
    }
  };

  const sendCursorPosition = (x, y) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: 'cursor',
          username,
          position: { x, y },
        })
      );
    }
  };

  const handleMouseMove = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    sendCursorPosition(offsetX, offsetY);
    
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

      sendDrawingEvent(lastPosition, currentPosition);
      setLastPosition(currentPosition);
    }
  };

  return { handleMouseMove };
};