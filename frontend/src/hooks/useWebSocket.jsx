import { useEffect, useRef } from 'react';
import { renderDrawing, renderCanvasHistory, renderRectangle } from '../utils/drawingUtils';
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
  currentTool,
  lastPosition,
  setLastPosition,
  setCursorPositions,
  drawingHistory,
  addToHistory,
  setDrawingHistory,
  strokeIdRef
}) => {
  const { sendMessage, addMessageListener } = useWebSocket();
  const messageHandlerRef = useRef(null);

  useEffect(() => {
    messageHandlerRef.current = (event) => {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'error':
          if (notificationRef.current) {
            notificationRef.current.addNotification(message.message, 'error');
          }
          break;

        case 'cursor':
          setCursorPositions(prev => ({
            ...prev,
            [message.username]: message.position
          }));
          break;

        case 'canvasHistory':
          if (message.history && Array.isArray(message.history)) {
            const context = canvasRef.current.getContext('2d');
            context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            renderCanvasHistory(message.history, canvasRef);
            message.history.forEach(event => {
              addToHistory(event);
            });
          }
          break;

        case 'drawing':
          const { start, end, color, lineWidth, isErasing, tool } = message;
          const context = canvasRef.current.getContext('2d');
          if (tool === 'rectangle') {
            renderRectangle(context, start, end, color, lineWidth);
          } else {
            renderDrawing(context, start, end, color, lineWidth, isErasing);
          }
          addToHistory(message);
          break;
        
          case 'undo': {
            setDrawingHistory(prev =>
              prev.filter(ev => ev.strokeId !== message.strokeId)
            );
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            renderCanvasHistory(
              drawingHistory.filter(ev => ev.strokeId !== message.strokeId),
              canvasRef
            );
            break;
          }


        case 'notification':
          if (notificationRef.current) {
            notificationRef.current.addNotification(message.message, message.JLType);
          }
          break;
      }
    };

    const cleanup = addMessageListener(messageHandlerRef.current);

    sendMessage({
      type: 'join',
      code: roomCode,
      name: username
    });

    return () => {
      cleanup();
      messageHandlerRef.current = null;
    };
  }, []);

  const handleMouseMove = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    const context = canvasRef.current.getContext('2d');
    const currentPosition = { x: offsetX, y: offsetY };
    
    sendMessage({
      type: 'cursor',
      username,
      position: { x: offsetX, y: offsetY },
    });
    
    if (isDrawing) {
      if (currentTool === 'rectangle') {
        // Clear the canvas
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        // Redraw all previous shapes from history
        drawingHistory.forEach(event => {
          if (event.tool === 'rectangle') {
            renderRectangle(context, event.start, event.end, event.color, event.lineWidth);
          } else {
            renderDrawing(context, event.start, event.end, event.color, event.lineWidth, event.isErasing);
          }
        });
        
        // Draw the current rectangle preview
        renderRectangle(
          context,
          lastPosition,
          currentPosition,
          color,
          lineWidth
        );
      } else {
        renderDrawing(
          context,
          lastPosition,
          currentPosition,
          isErasing ? null : color,
          lineWidth,
          isErasing
        );

        const drawingEvent = {
          type: 'drawing',
          tool: currentTool,
          start: lastPosition,
          end: currentPosition,
          color: isErasing ? null : color,
          lineWidth,
          isErasing,
          strokeId: strokeIdRef.current,
          owner: username
        };

        addToHistory(drawingEvent);
        sendMessage(drawingEvent);
      }

      if (currentTool !== 'rectangle') {
        setLastPosition(currentPosition);
      }
    }
  };

  const handleMouseUp = (e) => {
    if (isDrawing && currentTool === 'rectangle') {
      const { offsetX, offsetY } = e.nativeEvent;
      const rectangleEvent = {
        type: 'drawing',
        tool: 'rectangle',
        start: lastPosition,
        end: { x: offsetX, y: offsetY },
        color,
        lineWidth,
        strokeId: strokeIdRef.current,
        owner: username,
      };
      
      addToHistory(rectangleEvent);
      sendMessage(rectangleEvent);
    }
  };

  const undoStroke = () => {
  if (!drawingHistory.length) return;
  const myLast = [...drawingHistory].reverse()
                    .find(ev => ev.owner === username);
  if (!myLast) return;

  const { strokeId } = myLast;

  // 1 · local erase
  setDrawingHistory(prev => prev.filter(ev => ev.strokeId !== strokeId));
  const ctx = canvasRef.current.getContext('2d');
  ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  renderCanvasHistory(
    drawingHistory.filter(ev => ev.strokeId !== strokeId),
    canvasRef
  );

  // 2 · notify server
  sendMessage({ type: 'undo', strokeId });
};


  return { handleMouseMove, handleMouseUp, undoStroke };
};