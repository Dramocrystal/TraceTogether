import React, { useState } from 'react';

const ToolBar = ({ onColorChange, onEraserToggle, onShapeDraw, onLineWidthChange }) => {
    const [isEraser, setIsEraser] = useState(false);

    const defaultColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FFA500', '#000000'];

    const handleColorClick = (color) => {
        setIsEraser(false);
        onColorChange(color);
    };

    const handleCustomColorChange = (e) => {
        setIsEraser(false);
        onColorChange(e.target.value);
    };

    const toggleEraser = () => {
        setIsEraser((prev) => !prev);
        onEraserToggle(!isEraser);
    };

    const handleLineWidthChange = (e) => {
        onLineWidthChange(Number(e.target.value));
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', border: '1px solid #ccc' }}>
            {/* Default Colors */}
            {defaultColors.map((color) => (
                <div
                    key={color}
                    onClick={() => handleColorClick(color)}
                    style={{
                        width: '20px',
                        height: '20px',
                        backgroundColor: color,
                        borderRadius: '50%',
                        cursor: 'pointer',
                    }}
                ></div>
            ))}

            {/* Custom Color Picker */}
            <input
                type="color"
                onChange={handleCustomColorChange}
                style={{ cursor: 'pointer' }}
            />

            {/* Eraser Button */}
            <button onClick={toggleEraser}>
                {isEraser ? 'Drawing Mode' : 'Eraser'}
            </button>

            {/* Shape Button */}
            <button onClick={onShapeDraw}>Draw Shapes</button>

            {/* Line Width Slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <label htmlFor="lineWidth">Line Width:</label>
                <input
                    id="lineWidth"
                    type="range"
                    min="1"
                    max="50"
                    defaultValue="2"
                    onChange={handleLineWidthChange}
                    style={{ cursor: 'pointer' }}
                />
            </div>
        </div>
    );
};

export default ToolBar;
