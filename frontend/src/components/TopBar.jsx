import React from 'react';

const TopBar = () => {
  return (
    <div className="cinematic-topbar">
      <div className="cinematic-topbar-left">
        <div className="cinematic-topbar-sys">
          <span style={{ position: 'relative', display: 'flex', height: '8px', width: '8px', marginRight: '8px' }}>
            <span style={{ position: 'absolute', display: 'inline-flex', height: '100%', width: '100%', borderRadius: '50%', background: '#00FF9C', opacity: 0.75, animation: 'pulse 2s infinite' }}></span>
            <span style={{ position: 'relative', display: 'inline-flex', borderRadius: '50%', height: '8px', width: '8px', background: '#00FF9C' }}></span>
          </span>
          SYSTEM ACTIVE
        </div>
        <div className="cinematic-topbar-ai">
          <span style={{ marginRight: '8px' }}>🧠</span>
          AI LEARNING: ON
        </div>
      </div>
      
      <div className="cinematic-topbar-zt">
        <span style={{ marginRight: '8px' }}>🛡️</span>
        ZERO TRUST MODE: ENFORCED
      </div>
    </div>
  );
};

export default TopBar;
