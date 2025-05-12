import React, { useState } from 'react';
import { Pencil, Square, Eraser, SlidersHorizontal } from 'lucide-react';
import './ToolBar.css';

const ToolBar = ({ onColorChange, onEraserToggle, onLineWidthChange, onToolChange }) => {
    const [isEraser, setIsEraser] = useState(false);
    const [selectedTool, setSelectedTool] = useState('pencil');
    const [showLineWidthMenu, setShowLineWidthMenu] = useState(false);

    const defaultColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FFA500', '#000000'];

    const handleColorClick = (color) => {
        setIsEraser(false);
        onEraserToggle(false);
        onColorChange(color);
    };

    const handleCustomColorChange = (e) => {
        setIsEraser(false);
        onEraserToggle(false);
        onColorChange(e.target.value);
    };

    const handleToolSelect = (tool) => {
        setSelectedTool(tool);
        if (tool === 'eraser') {
            setIsEraser(true);
            onEraserToggle(true);
        } else {
            setIsEraser(false);
            onEraserToggle(false);
        }
        onToolChange(tool);
    };

    const toggleLineWidthMenu = () => {
        setShowLineWidthMenu(!showLineWidthMenu);
    };

    const handleLineWidthChange = (e) => {
        onLineWidthChange(Number(e.target.value));
    };

    return (
        <div className="toolbar">
            <div className="toolbar-section tools">
                <button
                    className={`tool-button ${selectedTool === 'pencil' ? 'active' : ''}`}
                    onClick={() => handleToolSelect('pencil')}
                >
                    <Pencil size={22} />
                </button>
                <button
                    className={`tool-button ${selectedTool === 'rectangle' ? 'active' : ''}`}
                    onClick={() => handleToolSelect('rectangle')}
                >
                    <Square size={22} />
                </button>
                <button
                    className={`tool-button ${isEraser ? 'active' : ''}`}
                    onClick={() => handleToolSelect('eraser')}
                >
                    <Eraser size={22} />
                </button>
            </div>

            <div className="toolbar-section colors">
                {defaultColors.map((color) => (
                    <div
                        key={color}
                        className="color-circle"
                        style={{ backgroundColor: color }}
                        onClick={() => handleColorClick(color)}
                    />
                ))}
                <input type="color" className="color-picker" onChange={handleCustomColorChange} />
            </div>

            <div className="toolbar-section line-width">
                <button className="line-width-toggle" onClick={toggleLineWidthMenu}>
                    <SlidersHorizontal size={22} />
                </button>
                {showLineWidthMenu && (
                    <div className="line-width-menu">
                        <input
                            type="range"
                            min="1"
                            max="50"
                            defaultValue="2"
                            onChange={handleLineWidthChange}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ToolBar;
