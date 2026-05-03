import React from 'react';

const TopBar = () => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      background: '#080C18',
      borderBottom: '1px solid #1E293B',
      padding: '8px 24px',
      fontSize: '0.75rem',
      fontFamily: 'monospace',
      letterSpacing: '0.05em',
      zIndex: 50,
      position: 'sticky',
      top: 0
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', color: '#00FF9C' }}>
          <span style={{ position: 'relative', display: 'flex', height: '8px', width: '8px', marginRight: '8px' }}>
            <span style={{ position: 'absolute', display: 'inline-flex', height: '100%', width: '100%', borderRadius: '50%', background: '#00FF9C', opacity: 0.75, animation: 'pulse 2s infinite' }}></span>
            <span style={{ position: 'relative', display: 'inline-flex', borderRadius: '50%', height: '8px', width: '8px', background: '#00FF9C' }}></span>
          </span>
          SYSTEM ACTIVE
        </div>
        <div style={{ display: 'flex', alignItems: 'center', color: '#00D4FF' }}>
          <span style={{ marginRight: '8px' }}>🧠</span>
          AI LEARNING: ON
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', color: '#FF3B3B', fontWeight: 'bold' }}>
        <span style={{ marginRight: '8px' }}>🛡️</span>
        ZERO TRUST MODE: ENFORCED
      </div>
    </div>
  );
};

export default TopBar;
