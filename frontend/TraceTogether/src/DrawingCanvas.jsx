import React, { useRef, useState} from 'react';

const DrawingCanvas = () => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });


    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.lineWidth = 5;
        context.lineCap = 'round';
        context.strokeStyle = 'black';

        setIsDrawing(true);
        const {offsetX, offsetY } = e.nativeEvent;
        setLastPosition({x: offsetX, y: offsetY});

    };

    const draw = (e) => {
        if (!isDrawing) return;
        

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        const { offsetX, offsetY } = e.nativeEvent;


        context.beginPath();
        context.moveTo(lastPosition.x, lastPosition.y);
        context.lineTo(offsetX, offsetY);
        context.stroke();

        setLastPosition({ x: offsetX, y: offsetY });
    };

    const stopDrawing = () => {
        setIsDrawing(false);
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
        </div>
      );

}

export default DrawingCanvas;


