import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ToolBar from './ToolBar';
import { use } from 'react';

const DrawingCanvas = () => {
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const [isErasing, setIsErasing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);
  
  const location = useLocation();
  const { username, roomCode } = location.state;
  const [cursorPositions, setCursorPositions] = useState({})
  const ws = useRef(null);

  useEffect(() => {

    ws.current = new WebSocket('ws://localhost:5000/socket/');

    ws.current.onopen = () => {
      console.log('Connected to WebSocket');
      ws.current.send(JSON.stringify({ type: 'join', code: roomCode, name: username }));
    };

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'cursor') {
        setCursorPositions((prev) => ({
          ...prev,
          [message.username]: message.position,
        }));
      } else if (message.type === 'drawing') {
        const { start, end, color, lineWidth, isErasing } = message;

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        renderDrawing(context, start, end, color, lineWidth, isErasing);
      }
    };

    ws.current.onclose = () => {
      console.log('Disconnected from WebSocket');
    };

    return () => {
      ws.current.close();
    };


  }, [roomCode, username]);

  const sendCursorPosition = (x, y) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: 'cursor',
          username,
          position: { x, y },
        })
      );
    }
  };

  const startDrawing = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    setIsDrawing(true);
    setLastPosition({ x: offsetX, y: offsetY });
  };

  const drawOnCanvas = (x, y) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (isDrawing) {
      renderDrawing(
        context, 
        lastPosition, 
        { x, y }, 
        isErasing ? null : color, 
        lineWidth,
         isErasing
        );

      //Send the drawing event
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(
          JSON.stringify({
            type: 'drawing',
            start: lastPosition,
            end: { x, y },
            color: isErasing ? null : color,
            lineWidth,
            isErasing,
          })
        );
      }
  
      setLastPosition({ x, y });
    }
  };

  const handleMouseMove = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;

    sendCursorPosition(offsetX, offsetY);
    drawOnCanvas(offsetX, offsetY);
  };
  

  const renderCursors = () => {
    const overlayCanvas = overlayCanvasRef.current;
    const context = overlayCanvas.getContext('2d');

    context.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    Object.keys(cursorPositions).forEach((user) => {
      const { x, y } = cursorPositions[user];
      context.fillStyle = 'red';
      context.beginPath();
      context.arc(x, y, 5, 0, Math.PI * 2); // Small dot for cursor
      context.fill();
      context.fillStyle = 'black';
      context.fillText(user, x + 10, y); // Display username offset from the dot
    });
  };

  const renderDrawing = (context, start, end, color, lineWidth, isErasing) => {
    context.globalCompositeOperation = isErasing ? 'destination-out' : 'source-over';
    context.strokeStyle = color || '#000000'; // Default to black for erasing
    context.lineWidth = lineWidth;
    context.lineCap = 'round';
  
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
  };
  
  
  useEffect(() => {
    if (overlayCanvasRef.current) {
      renderCursors();
    }
  }, [cursorPositions]);

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleColorChange = (newColor) => {
    setColor(newColor);
    console.log('Selected Color:', newColor);
    setIsErasing(false);
  };

  const handleShapeDraw = () => {
    console.log('Hello Shapes!');
  };

  const handleLineWidthChange = (width) => {
    setLineWidth(width);
    console.log("Line Width: ", width);
  };

  return (
    <div style={{ textAlign: 'center' }}>
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