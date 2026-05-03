import React, { useEffect, useRef } from 'react';

const ThreatTimeline = ({ timelineEvents }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [timelineEvents]);

  return (
    <div className="timeline-container">
      <div className="timeline-header">
        <h3 className="timeline-title">
          <span style={{ color: '#00D4FF', marginRight: '8px' }}>◷</span>
          Threat Interception Timeline
          <span className="timeline-live-badge">
            <span className="timeline-dot-pulse"></span>
            LIVE MONITORING ACTIVE
          </span>
        </h3>
      </div>
      <div ref={scrollRef} className="timeline-content">
        {timelineEvents.map((event, i) => (
          <div key={i} className="timeline-event">
            {i !== timelineEvents.length - 1 && (
              <div className="timeline-line"></div>
            )}
            
            <div className="timeline-node-wrap">
              <div className={`timeline-node ${event.status === 'BLOCKED' ? 'blocked' : 'safe'}`}></div>
            </div>

            <div className="timeline-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ color: event.status === 'BLOCKED' ? '#FF3B3B' : '#00FF9C', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.05em' }}>
                  {event.status}
                </span>
                <span style={{ color: '#64748b', fontSize: '0.75rem', fontFamily: 'monospace' }}>{event.timestamp}</span>
              </div>
              <div style={{ color: '#e2e8f0', fontWeight: 500, fontSize: '0.875rem', marginBottom: '4px' }}>{event.threatType}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '250px' }}>
                {event.requestBody}
              </div>
            </div>
          </div>
        ))}

        {timelineEvents.length === 0 && (
          <div style={{ color: '#64748b', fontSize: '0.875rem', textAlign: 'center', marginTop: '32px', fontStyle: 'italic' }}>
            Awaiting network traffic...
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreatTimeline;
