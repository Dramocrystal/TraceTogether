import React, { useRef, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ToolBar from './ToolBar';
import NotificationContainer from './notification';
import { useDrawing } from './hooks/useDrawing';
import { useDrawingWebSocket } from './hooks/useWebSocket';
import { useCursor } from './hooks/useCursor';
import { Copy, Share, Save } from 'lucide-react';
import './RoomCode.css';

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
  } = useDrawing();

  const { cursorPositions, setCursorPositions } = useCursor({
    overlayCanvasRef,
    username,
    zoom
  });

  const { handleMouseMove: handleDrawingMouseMove, handleMouseUp } = useDrawingWebSocket({
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
    addToHistory
  });

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
  }, [viewportSize, zoom]);

  const handleWheel = (e) => {
    e.preventDefault();
    
    const mouseX = e.clientX - offset.x;
    const mouseY = e.clientY - offset.y;
    const canvasX = mouseX / zoom;
    const canvasY = mouseY / zoom;

    const delta = -e.deltaY * ZOOM_SPEED;
    const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom + delta));
    
    if (newZoom !== zoom) {
      const newOffsetX = e.clientX - canvasX * newZoom;
      const newOffsetY = e.clientY - canvasY * newZoom;

      setZoom(newZoom);
      setOffset({
        x: newOffsetX,
        y: newOffsetY
      });
    }
  };

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
      
      startDrawing(modifiedEvent);
    }
  };

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    
    if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      
      setOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
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
    handleMouseUp(e);
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
        onWheel={handleWheel}
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