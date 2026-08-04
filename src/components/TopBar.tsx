import React from 'react';
import { Activity, Sliders, EyeOff } from 'lucide-react';

interface TopBarProps {
  fps: number;
  trackedHandCount: number;
  pinnedCount: number;
  appMode: 'spawner' | 'vision_web';
  showSettingsPanel: boolean;
  setShowSettingsPanel: (show: boolean) => void;
  setIsUiHidden: (hide: boolean) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  fps,
  trackedHandCount,
  pinnedCount,
  appMode,
  showSettingsPanel,
  setShowSettingsPanel,
  setIsUiHidden
}) => {
  return (
    <div className="top-bar">
      <div className="top-bar-branding">
        <div className="top-bar-logo">
          <Activity className="icon-pulse" size={20} />
        </div>
        <div>
          <h1 className="top-bar-title">3D STRINGIFY AR • BY SCHRIS</h1>
          <p className="top-bar-subtitle">
            {appMode === 'spawner'
              ? '2 HANDS = SPAWN • PRAYER = PIN • FIST NEAR SHAPE = UNPIN / CRUMBLE'
              : 'VISION ENERGY WEB MODE'}
          </p>
        </div>
      </div>

      <div className="top-bar-status">
        <span className="badge badge-fps">FPS: {fps}</span>
        <span className="badge badge-hands">HANDS: {trackedHandCount}</span>
        <span className="badge badge-pinned">PINNED: {pinnedCount}</span>
        
        <button
          onClick={() => setShowSettingsPanel(!showSettingsPanel)}
          className={`btn btn-settings ${showSettingsPanel ? 'active' : ''}`}
        >
          <Sliders size={14} /> SETTINGS
        </button>
        
        <button
          onClick={() => setIsUiHidden(true)}
          className="btn btn-hide"
          title="Press 'H' key anytime to toggle UI"
        >
          <EyeOff size={14} /> [H] HIDE
        </button>
      </div>
    </div>
  );
};
