import React from 'react';
import { Sliders, Zap, Move } from 'lucide-react';

interface SettingsPanelProps {
  appMode: 'spawner' | 'vision_web';
  setAppMode: (mode: 'spawner' | 'vision_web') => void;
  showOverlay: boolean;
  setShowOverlay: (show: boolean) => void;
  showEnergyWeb: boolean;
  setShowEnergyWeb: (show: boolean) => void;
  enableHandBridge: boolean;
  setEnableHandBridge: (enable: boolean) => void;
  connectionMode: 'skeleton' | 'fingertips' | 'complete_graph';
  setConnectionMode: (mode: 'skeleton' | 'fingertips' | 'complete_graph') => void;
  lineStyle: 'neon' | 'thin' | 'thick';
  setLineStyle: (style: 'neon' | 'thin' | 'thick') => void;
  cameraOpacity: number;
  setCameraOpacity: (opacity: number) => void;
  cameraFit: 'contain' | 'cover';
  setCameraFit: (fit: 'contain' | 'cover') => void;
  cameraZoom: number;
  setCameraZoom: (zoom: number) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  appMode,
  setAppMode,
  showOverlay,
  setShowOverlay,
  showEnergyWeb,
  setShowEnergyWeb,
  enableHandBridge,
  setEnableHandBridge,
  connectionMode,
  setConnectionMode,
  lineStyle,
  setLineStyle,
  cameraOpacity,
  setCameraOpacity,
  cameraFit,
  setCameraFit,
  cameraZoom,
  setCameraZoom
}) => {
  return (
    <div className="settings-panel">
      <h3 className="settings-title">
        <Sliders size={16} /> CAMERA & VISION SETTINGS
      </h3>

      {/* Application Mode Option */}
      <div className="settings-section">
        <label className="settings-label">APPLICATION MODE:</label>
        <div className="settings-grid grid-2">
          <button
            onClick={() => setAppMode('spawner')}
            className={`btn btn-toggle ${appMode === 'spawner' ? 'active' : ''}`}
          >
            SPAWNER MODE
          </button>
          <button
            onClick={() => setAppMode('vision_web')}
            className={`btn btn-toggle ${appMode === 'vision_web' ? 'active' : ''}`}
          >
            VISION WEB MODE
          </button>
        </div>
      </div>

      {/* Energy Web Overlays */}
      <div className="settings-section">
        <label className="settings-label">OVERLAY FEATURES:</label>
        <div className="settings-grid grid-3">
          <button
            onClick={() => setShowOverlay(!showOverlay)}
            className={`btn btn-toggle ${showOverlay ? 'active' : ''}`}
          >
            SKELETON
          </button>
          <button
            onClick={() => setShowEnergyWeb(!showEnergyWeb)}
            className={`btn btn-toggle ${showEnergyWeb ? 'active' : ''}`}
          >
            <Zap size={14} /> WEB
          </button>
          <button
            onClick={() => setEnableHandBridge(!enableHandBridge)}
            className={`btn btn-toggle ${enableHandBridge ? 'active' : ''}`}
          >
            <Move size={14} /> BRIDGE
          </button>
        </div>
      </div>

      {/* Connection Types */}
      <div className="settings-section">
        <label className="settings-label">ENERGY WEB TYPE:</label>
        <div className="settings-grid grid-3">
          {(['skeleton', 'fingertips', 'complete_graph'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setConnectionMode(mode)}
              className={`btn btn-toggle select-option ${connectionMode === mode ? 'active' : ''}`}
            >
              {mode.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Line Style Toggle */}
      <div className="settings-section">
        <label className="settings-label">LINE STYLE:</label>
        <div className="settings-grid grid-3">
          {(['neon', 'thin', 'thick'] as const).map((style) => (
            <button
              key={style}
              onClick={() => setLineStyle(style)}
              className={`btn btn-toggle select-option ${lineStyle === style ? 'active' : ''}`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Camera Feed Transparency */}
      <div className="settings-section">
        <div className="slider-label-row">
          <span>CAMERA TRANSPARENCY</span>
          <span>{Math.round(cameraOpacity * 100)}%</span>
        </div>
        <input
          type="range"
          min="0.0"
          max="1.0"
          step="0.05"
          value={cameraOpacity}
          onChange={(e) => setCameraOpacity(parseFloat(e.target.value))}
          className="settings-slider"
        />
      </div>

      {/* Camera Fit & Zoom */}
      <div className="settings-grid grid-2">
        <div className="settings-section">
          <label className="settings-label">CAMERA FIT:</label>
          <button
            onClick={() => setCameraFit(cameraFit === 'contain' ? 'cover' : 'contain')}
            className="btn btn-toggle btn-fit"
          >
            {cameraFit}
          </button>
        </div>
        <div className="settings-section">
          <div className="slider-label-row">
            <span>ZOOM</span>
            <span>{cameraZoom.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="2.0"
            step="0.1"
            value={cameraZoom}
            onChange={(e) => setCameraZoom(parseFloat(e.target.value))}
            className="settings-slider"
          />
        </div>
      </div>
    </div>
  );
};
