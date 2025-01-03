export const renderDrawing = (context, start, end, color, lineWidth, isErasing) => {
    context.globalCompositeOperation = isErasing ? 'destination-out' : 'source-over';
    context.strokeStyle = color || '#000000';
    context.lineWidth = lineWidth;
    context.lineCap = 'round';
  
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
  };
  
  export const renderCanvasHistory = (history, canvasRef) => {
    const context = canvasRef.current.getContext('2d');
    history.forEach((drawingEvent) => {
      const { start, end, color, lineWidth, isErasing } = drawingEvent;
      renderDrawing(context, start, end, color, lineWidth, isErasing);
    });
  };