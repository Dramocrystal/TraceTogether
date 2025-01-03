import React, { useRef } from 'react';
import { useLocation } from 'react-router-dom';
import ToolBar from './ToolBar';
import NotificationContainer from './notification';
import { useDrawing } from './hooks/useDrawing';
import { useWebSocket } from './hooks/useWebSocket';
import { useCursor } from './hooks/useCursor';

const DrawingCanvas = () => {
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const notificationRef = useRef(null);
  
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
    username
  });

  const { handleMouseMove } = useWebSocket({
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

  return (
    <div style={{ textAlign: 'center' }}>
      <NotificationContainer ref={notificationRef} />
      <div style={{ position: 'relative', width: 800, height: 600 }}>
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          style={{ border: '1px solid black', position: 'absolute', top: 0, left: 0 }}
          onMouseDown={startDrawing}
          onMouseMove={handleMouseMove}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
        <canvas
          ref={overlayCanvasRef}
          width={800}
          height={600}
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
        />
      </div>

      <ToolBar
        onColorChange={handleColorChange}
        onEraserToggle={setIsErasing}
        onShapeDraw={handleShapeDraw}
        onLineWidthChange={handleLineWidthChange}
      />
    </div>
  );
};

export default DrawingCanvas;