import React, { useRef, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ToolBar from './ToolBar';
import NotificationContainer from './notification';
import { useDrawing } from './hooks/useDrawing';
import { useWebSocket } from './hooks/useWebSocket';
import { useCursor } from './hooks/useCursor';

const CANVAS_WIDTH = 3000;
const CANVAS_HEIGHT = 2000;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const ZOOM_SPEED = 0.001;

const DrawingCanvas = () => {
  // ... (previous state and ref declarations remain the same)
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
    setLastPosition,
    handleColorChange,
    handleLineWidthChange,
    handleShapeDraw,
    setIsErasing,
    startDrawing,
    stopDrawing,
  } = useDrawing();

  const { cursorPositions, setCursorPositions } = useCursor({
    overlayCanvasRef,
    username,
    zoom
  });

  const { handleMouseMove: wsHandleMouseMove } = useWebSocket({
    canvasRef,
    ws: useRef(null),
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
  }, [viewportSize]);

  const handleWheel = (e) => {
    e.preventDefault();
    
    // Calculate mouse position relative to the canvas's transformed position
    const mouseX = e.clientX - offset.x;
    const mouseY = e.clientY - offset.y;

    // Convert mouse position to canvas space (before zoom)
    const canvasX = mouseX / zoom;
    const canvasY = mouseY / zoom;

    // Calculate new zoom level
    const delta = -e.deltaY * ZOOM_SPEED;
    const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom + delta));
    
    if (newZoom !== zoom) {
      // Calculate new offset to keep the mouse point in the same position
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
      const canvasX = (e.clientX - offset.x) / zoom;
      const canvasY = (e.clientY - offset.y) / zoom;
      
      const modifiedEvent = {
        ...e,
        clientX: canvasX,
        clientY: canvasY
      };
      
      startDrawing(modifiedEvent);
    }
  };

  const handleMouseUp = (e) => {
    if (isPanning) {
      setIsPanning(false);
    } else {
      stopDrawing(e);
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      
      setOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    } else if (isDrawing) {
      const canvasX = (e.clientX - offset.x) / zoom;
      const canvasY = (e.clientY - offset.y) / zoom;
      
      const modifiedEvent = {
        ...e,
        clientX: canvasX,
        clientY: canvasY
      };
      
      wsHandleMouseMove(modifiedEvent);
    }
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
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
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
          onShapeDraw={handleShapeDraw}
          onLineWidthChange={handleLineWidthChange}
        />
      </div>
    </div>
  );
};

export default DrawingCanvas;