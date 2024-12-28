import React, { useRef, useState } from 'react';
import ToolBar from './ToolBar';

const DrawingCanvas = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const [isErasing, setIsErasing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2); // New state for line width


  const startDrawing = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    setIsDrawing(true);
    setLastPosition({ x: offsetX, y: offsetY });
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const { offsetX, offsetY } = e.nativeEvent;

    

    if (isErasing) {
      context.globalCompositeOperation = 'destination-out'; // Erase mode
    } else {
      context.globalCompositeOperation = 'source-over'; // Draw mode
      context.strokeStyle = color;
    }

    context.lineWidth = lineWidth;
    context.lineCap = 'round';
    context.beginPath();
    context.moveTo(lastPosition.x, lastPosition.y);
    context.lineTo(offsetX, offsetY);
    context.stroke();

    setLastPosition({ x: offsetX, y: offsetY });
  };


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
      <h1>Drawing Canvas</h1>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{ border: '1px solid black' }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />

      <ToolBar
        onColorChange={handleColorChange}
        onEraserToggle={setIsErasing}
        onShapeDraw={handleShapeDraw}
        onLineWidthChange={handleLineWidthChange}
      />
    </div>
  );

}

export default DrawingCanvas;


