import React, { useEffect, useState, useRef } from 'react';

const ThreatTimeline = ({ timelineEvents }) => {
  const scrollRef = useRef(null);

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [timelineEvents]);

  return (
    <div className="bg-[#0c1120]/90 backdrop-blur-md rounded-xl border border-[#1E293B] flex flex-col h-full shadow-2xl overflow-hidden">
      <div className="p-4 border-b border-[#1E293B] bg-gradient-to-r from-[#0c1120] to-[#1a2235]">
        <h3 className="text-white font-semibold flex items-center tracking-wide">
          <span className="text-[#00D4FF] mr-2">◷</span>
          Threat Interception Timeline
          <span style={{ fontSize: '0.625rem', color: '#00FF9C', background: 'rgba(0, 255, 156, 0.1)', padding: '2px 8px', borderRadius: '9999px', display: 'flex', alignItems: 'center' }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', background: '#00FF9C', borderRadius: '50%', marginRight: '6px', animation: 'pulse 2s infinite' }}></span>
            LIVE MONITORING ACTIVE
          </span>
        </h3>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
        {timelineEvents.map((event, i) => (
          <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '24px', position: 'relative', animation: 'slideUp 0.3s ease' }}>
            {/* Timeline Line */}
            {i !== timelineEvents.length - 1 && (
              <div style={{ position: 'absolute', left: '7px', top: '24px', bottom: '-24px', width: '2px', background: '#1E293B' }}></div>
            )}
            
            {/* Timeline Node */}
            <div style={{ position: 'relative', zIndex: 10, marginTop: '6px' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: event.status === 'BLOCKED' ? '#FF3B3B' : '#00FF9C', boxShadow: `0 0 10px ${event.status === 'BLOCKED' ? 'rgba(255,59,59,0.5)' : 'rgba(0,255,156,0.5)'}` }}></div>
            </div>

            {/* Event Content */}
            <div style={{ flex: 1, background: 'rgba(0,0,0,0.4)', border: '1px solid #1E293B', borderRadius: '8px', padding: '16px' }}>
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
}

export default ThreatTimeline;
