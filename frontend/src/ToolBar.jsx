import React, { useState } from 'react';
import { Pencil, Square, Circle, Eraser, TextCursorInput } from 'lucide-react';

const ToolBar = ({ onColorChange, onEraserToggle, onShapeDraw, onLineWidthChange }) => {
    const [isEraser, setIsEraser] = useState(false);
    const [selectedTool, setSelectedTool] = useState('pencil'); // Keeps track of the selected tool

    const defaultColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FFA500', '#000000'];

    const handleColorClick = (color) => {
        setIsEraser(false);
        setSelectedTool('pencil'); // Switch to pencil mode when selecting a color
        onColorChange(color);
    };

    const handleCustomColorChange = (e) => {
        setIsEraser(false);
        setSelectedTool('pencil'); // Switch to pencil mode when selecting a color
        onColorChange(e.target.value);
    };

    const toggleEraser = () => {
        const isNowEraser = !isEraser;
        setIsEraser(isNowEraser);
        setSelectedTool(isNowEraser ? 'eraser' : 'pencil'); // Switch tool based on eraser state
        onEraserToggle(isNowEraser);
    };

    const handleToolSelect = (tool) => {
        setSelectedTool(tool);
        setIsEraser(tool === 'eraser'); // Automatically enable eraser mode if eraser is selected
    };

    const handleLineWidthChange = (e) => {
        onLineWidthChange(Number(e.target.value));
    };

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px',
                border: '1px solid #ccc',
                background: '#f9f9f9',
                borderRadius: '8px',
            }}
        >
            {/* Tools */}
            <button
                onClick={() => handleToolSelect('pencil')}
                style={{
                    background: selectedTool === 'pencil' ? '#ddd' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                }}
            >
                <Pencil size={24} color={selectedTool === 'pencil' ? '#007bff' : '#000'} />
            </button>
            <button
                onClick={() => handleToolSelect('rectangle')}
                style={{
                    background: selectedTool === 'rectangle' ? '#ddd' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                }}
            >
                <Square size={24} color={selectedTool === 'rectangle' ? '#007bff' : '#000'} />
            </button>
            <button
                onClick={() => handleToolSelect('circle')}
                style={{
                    background: selectedTool === 'circle' ? '#ddd' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                }}
            >
                <Circle size={24} color={selectedTool === 'circle' ? '#007bff' : '#000'} />
            </button>
            <button onClick={toggleEraser} style={{ border: 'none', cursor: 'pointer' }}>
                <Eraser
                    size={24}
                    color={isEraser ? '#007bff' : '#000'}
                    style={{
                        background: isEraser ? '#ddd' : 'transparent',
                        borderRadius: '50%',
                    }}
                />
            </button>
            <button
                onClick={() => handleToolSelect('text')}
                style={{
                    background: selectedTool === 'text' ? '#ddd' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                }}
            >
                <TextCursorInput size={24} color={selectedTool === 'text' ? '#007bff' : '#000'} />
            </button>

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
                        border: selectedTool === 'pencil' && color === 'selected' ? '2px solid #007bff' : 'none',
                    }}
                ></div>
            ))}

            {/* Custom Color Picker */}
            <input type="color" onChange={handleCustomColorChange} style={{ cursor: 'pointer' }} />

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
