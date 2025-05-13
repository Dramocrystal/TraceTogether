import React, { useRef, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ToolBar from './ToolBar';
import NotificationContainer from './notification';
import { useDrawing } from './hooks/useDrawing';
import { useDrawingWebSocket } from './hooks/useWebSocket';
import { useCursor } from './hooks/useCursor';
import { Copy, Share, Save } from 'lucide-react';
import './RoomCode.css';
import { renderDrawing, renderRectangle } from './utils/drawingUtils';

const CANVAS_WIDTH = 3000;
const CANVAS_HEIGHT = 2000;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const ZOOM_SPEED = 0.001;

const DrawingCanvas = () => {
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const notificationRef = useRef(null);
  const containerRef = useRef(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

  const location = useLocation();
  const { username, roomCode } = location.state;

  const strokeIdRef = useRef(null);

  const {
    isDrawing,
    lastPosition,
    color,
    lineWidth,
    isErasing,
    currentTool,
    drawingHistory,
    addToHistory,
    setLastPosition,
    handleColorChange,
    handleLineWidthChange,
    handleToolChange,
    setIsErasing,
    startDrawing,
    stopDrawing,
    setDrawingHistory
  } = useDrawing();

  const { cursorPositions, setCursorPositions } = useCursor({
    overlayCanvasRef,
    username,
    zoom
  });

  const { handleMouseMove: handleDrawingMouseMove, handleMouseUp, undoStroke } = useDrawingWebSocket({
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
  });

  useEffect(() => {
  const onKey = e => {
    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault();
      undoStroke();            // --- NEW ---
    }
  };
  window.addEventListener('keydown', onKey);
  return () => window.removeEventListener('keydown', onKey);
}, [undoStroke]);

  useEffect(() => {
    const updateViewportSize = () => {
      const toolbarHeight = 64;
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight - toolbarHeight
      });
    };

    updateViewportSize();
    window.addEventListener('resize', updateViewportSize);
    return () => window.removeEventListener('resize', updateViewportSize);
  }, []);

  useEffect(() => {
    if (viewportSize.width && viewportSize.height) {
      setOffset({
        x: (viewportSize.width - CANVAS_WIDTH * zoom) / 2,
        y: (viewportSize.height - CANVAS_HEIGHT * zoom) / 2
      });
    }
  }, [viewportSize]);

  useEffect(() => {
    const context = canvasRef.current.getContext('2d');
    // Clear the canvas
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    // Redraw from history
    drawingHistory.forEach(event => {
      if (event.tool === 'rectangle') {
        renderRectangle(context, event.start, event.end, event.color, event.lineWidth);
      } else {
        renderDrawing(context, event.start, event.end, event.color, event.lineWidth, event.isErasing);
      }
    });
  }, [drawingHistory]);


  
  const handleWheel = (e) => {
  e.preventDefault();

  const containerRect = containerRef.current.getBoundingClientRect();
  const mouseX = e.clientX - containerRect.left;
  const mouseY = e.clientY - containerRect.top;

  const worldX = (mouseX - offset.x) / zoom;
  const worldY = (mouseY - offset.y) / zoom;

  const delta = -e.deltaY * ZOOM_SPEED;
  const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom + delta));
  if (newZoom === zoom) return;

  // Try to zoom around mouse
  let newOffsetX = mouseX - worldX * newZoom;
  let newOffsetY = mouseY - worldY * newZoom;

  const canvasDisplayWidth = CANVAS_WIDTH * newZoom;
  const canvasDisplayHeight = CANVAS_HEIGHT * newZoom;

  // If canvas becomes smaller than viewport, center it
  if (canvasDisplayWidth < viewportSize.width) {
    newOffsetX = (viewportSize.width - canvasDisplayWidth) / 2;
  } else {
    const minX = viewportSize.width - canvasDisplayWidth - PAN_MARGIN;
    const maxX = PAN_MARGIN;
    newOffsetX = clamp(newOffsetX, minX, maxX);
  }

  if (canvasDisplayHeight < viewportSize.height) {
    newOffsetY = (viewportSize.height - canvasDisplayHeight) / 2;
  } else {
    const minY = viewportSize.height - canvasDisplayHeight - PAN_MARGIN;
    const maxY = PAN_MARGIN;
    newOffsetY = clamp(newOffsetY, minY, maxY);
  }

  setZoom(newZoom);
  setOffset({ x: newOffsetX, y: newOffsetY });
};



  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheelWrapper = (e) => handleWheel(e);
    container.addEventListener('wheel', handleWheelWrapper, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheelWrapper);
    };
  }, [handleWheel]);

  // Add global mouse up listener to handle mouse release outside canvas
  useEffect(() => {
    const handleGlobalMouseUp = (e) => {
      if (isDrawing) {
        handleMouseUp(e);
        stopDrawing(e);
      }
      if (isPanning) {
        setIsPanning(false);
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDrawing, isPanning, handleMouseUp, stopDrawing]);

  const handleMouseDown = (e) => {
    if (e.button === 1) {
      e.preventDefault();
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    } else {
      const rect = canvasRef.current.getBoundingClientRect();
      const scaleX = canvasRef.current.width / rect.width;
      const scaleY = canvasRef.current.height / rect.height;
      
      const offsetX = (e.clientX - rect.left) * scaleX;
      const offsetY = (e.clientY - rect.top) * scaleY;
      
      const modifiedEvent = {
        ...e,
        nativeEvent: {
          ...e.nativeEvent,
          offsetX,
          offsetY
        }
      };
      strokeIdRef.current = (crypto.randomUUID && crypto.randomUUID()) ||
  (Date.now().toString(36) + Math.random().toString(36).slice(2));
      startDrawing(modifiedEvent);
    }
  };
  const PAN_MARGIN = 200;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const handleMouseMove = (e) => {
  const rect = canvasRef.current.getBoundingClientRect();
  const scaleX = canvasRef.current.width / rect.width;
  const scaleY = canvasRef.current.height / rect.height;

  if (isPanning) {
    const deltaX = e.clientX - lastPanPoint.x;
    const deltaY = e.clientY - lastPanPoint.y;

    setOffset(prev => {
      const newX = prev.x + deltaX;
      const newY = prev.y + deltaY;

      const minX = viewportSize.width - CANVAS_WIDTH * zoom - PAN_MARGIN;
      const minY = viewportSize.height - CANVAS_HEIGHT * zoom - PAN_MARGIN;
      const maxX = PAN_MARGIN;
      const maxY = PAN_MARGIN;

      return {
        x: clamp(newX, minX, maxX),
        y: clamp(newY, minY, maxY),
      };
    });

    setLastPanPoint({ x: e.clientX, y: e.clientY });
  } else {
    const offsetX = (e.clientX - rect.left) * scaleX;
    const offsetY = (e.clientY - rect.top) * scaleY;

    const modifiedEvent = {
      ...e,
      nativeEvent: {
        ...e.nativeEvent,
        offsetX,
        offsetY
      }
    };

    handleDrawingMouseMove(modifiedEvent);
  }
};


  const handleCanvasMouseUp = (e) => {
    if (isPanning) {
      setIsPanning(false);
    } else {
      handleMouseUp(e);
      stopDrawing(e);
    }
  };

  const handleMouseLeave = (e) => {
    // Don't stop drawing when leaving canvas - this will be handled by the global mouse up event
    // Just update cursor position instead
    setCursorPositions(prev => {
      const newPositions = { ...prev };
      delete newPositions[username];
      return newPositions;
    });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    notificationRef.current.addNotification(
      'Room code copied to clipboard!',
      'success',
      2000
    );
  };

  const handleExportCanvas = () => {
    const canvas = canvasRef.current;
  
    // Create a new temporary canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
  
    const ctx = tempCanvas.getContext('2d');
  
    // Fill the background with white
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
  
    ctx.drawImage(canvas, 0, 0);
  
    // Export
    const image = tempCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = 'drawing.png';
    link.click();
  };
  
  return (
    <div ref={containerRef} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <NotificationContainer ref={notificationRef} />

      <div className="room-code-container">
        <div className="room-code-content">
          <span className="room-code-label">Room Code:</span>
          <span className="room-code-value">{roomCode}</span>
        </div>
        <button
          onClick={handleCopyCode}
          className="copy-button"
          title="Copy room code"
        >
          <Copy size={20} />
        </button>
        <button
          onClick={handleExportCanvas}
          title="Export drawing"
          className="share-button"
        >
          <Save size={20} />
        </button>
      </div>
      
      <div 
        style={{ 
          position: 'relative', 
          flex: 1,
          background: '#f0f0f0'
        }}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            border: '2px solid #666',
            background: 'white'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleMouseLeave}
        />
        <canvas
          ref={overlayCanvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            pointerEvents: 'none'
          }}
        />
      </div>

      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(255, 255, 255, 0.8)',
        borderTop: '1px solid #e5e5e5',
        backdropFilter: 'blur(8px)'
      }}>
        <ToolBar
          onColorChange={handleColorChange}
          onEraserToggle={setIsErasing}
          onLineWidthChange={handleLineWidthChange}
          onToolChange={handleToolChange}
        />
      </div>
    </div>
  );
};

export default DrawingCanvas;