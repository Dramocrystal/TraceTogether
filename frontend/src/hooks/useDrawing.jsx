import { useState } from 'react';

export const useDrawing = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const [isErasing, setIsErasing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);
  const [currentTool, setCurrentTool] = useState('pencil');
  const [drawingHistory, setDrawingHistory] = useState([]);

  const addToHistory = (drawingEvent) => {
    setDrawingHistory(prev => [...prev, drawingEvent]);
  };

  const startDrawing = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    setIsDrawing(true);
    setLastPosition({ x: offsetX, y: offsetY });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleColorChange = (newColor) => {
    setColor(newColor);
    setIsErasing(false);
  };

  const handleShapeDraw = () => {
    console.log('Hello Shapes!');
  };

  const handleLineWidthChange = (width) => {
    setLineWidth(width);
  };

  const handleToolChange = (tool) => {
    setCurrentTool(tool);
  };

  return {
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
    handleShapeDraw,
    setIsErasing,
    startDrawing,
    stopDrawing,
    handleToolChange,
  };
};