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

  export const renderRectangle = (context, start, end, color, lineWidth) => {
    context.globalCompositeOperation = 'source-over';
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    
    const width = end.x - start.x;
    const height = end.y - start.y;
    
    context.beginPath();
    context.rect(start.x, start.y, width, height);
    context.stroke();
  };
  
  export const renderCanvasHistory = (history, canvasRef) => {
    const context = canvasRef.current.getContext('2d');
    history.forEach((drawingEvent) => {
      const { start, end, color, lineWidth, isErasing, tool } = drawingEvent;
      
      if (tool === 'rectangle') {
        renderRectangle(context, start, end, color, lineWidth);
      } else {
        renderDrawing(context, start, end, color, lineWidth, isErasing);
      }
    });
  };