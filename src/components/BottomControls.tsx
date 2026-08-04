import React from 'react';
import { Sparkles, Trash2, Move } from 'lucide-react';
import type { SavedShape } from '../types';

interface BottomControlsProps {
  savedShapes: SavedShape[];
  selectedShape: 'cube' | 'pyramid' | 'sphere' | 'torus' | 'octahedron';
  setSelectedShape: (shape: 'cube' | 'pyramid' | 'sphere' | 'torus' | 'octahedron') => void;
  colorTheme: 'error' | 'natural';
  setColorTheme: (theme: 'error' | 'natural') => void;
  enableHandBridge: boolean;
  setEnableHandBridge: (enable: boolean) => void;
  pinCurrentHoverShape: () => void;
  clearAllShapes: () => void;
}

export const BottomControls: React.FC<BottomControlsProps> = ({
  savedShapes,
  selectedShape,
  setSelectedShape,
  colorTheme,
  setColorTheme,
  enableHandBridge,
  setEnableHandBridge,
  pinCurrentHoverShape,
  clearAllShapes
}) => {
  return (
    <div className="bottom-panel">
      {/* SHAPE SELECTOR */}
      <div className="shape-selector">
        <span className="panel-label">SHAPE:</span>
        <div className="shape-buttons">
          {(['cube', 'pyramid', 'sphere', 'torus', 'octahedron'] as const).map((shape) => {
            const isPinned = savedShapes.some((s) => s.type === shape);
            return (
              <button
                key={shape}
                onClick={() => setSelectedShape(shape)}
                className={`btn btn-shape ${selectedShape === shape ? 'active' : ''} ${isPinned ? 'pinned' : ''}`}
              >
                {shape} {isPinned && '(PINNED)'}
              </button>
            );
          })}
        </div>
      </div>

      {/* COLOR SCHEME & TOGGLES */}
      <div className="action-controls">
        <div className="theme-toggle-group">
          <button
            onClick={() => setColorTheme('error')}
            className={`btn btn-theme-toggle hazard ${colorTheme === 'error' ? 'active' : ''}`}
          >
            HAZARD
          </button>
          <button
            onClick={() => setColorTheme('natural')}
            className={`btn btn-theme-toggle natural ${colorTheme === 'natural' ? 'active' : ''}`}
          >
            WHITE
          </button>
        </div>

        <button
          onClick={() => setEnableHandBridge(!enableHandBridge)}
          className={`btn btn-action-bridge ${enableHandBridge ? 'active' : ''}`}
        >
          <Move size={14} /> HAND BRIDGE
        </button>

        <button
          onClick={pinCurrentHoverShape}
          className="btn btn-pin"
        >
          <Sparkles size={14} /> PIN SHAPE
        </button>

        {savedShapes.length > 0 && (
          <button
            onClick={clearAllShapes}
            className="btn btn-clear-all"
          >
            <Trash2 size={14} /> CLEAR ALL
          </button>
        )}
      </div>
    </div>
  );
};
