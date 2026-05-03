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
        </h3>
        <p className="text-slate-400 text-xs mt-1 font-mono">LIVE MONITORING ACTIVE</p>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs custom-scrollbar"
      >
        {timelineEvents.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
            <span className="text-2xl mb-2">🛡️</span>
            <p>Awaiting network traffic...</p>
          </div>
        ) : (
          timelineEvents.map((event, index) => {
            const isBlocked = event.status === 'BLOCKED';
            
            return (
              <div 
                key={index} 
                className={`relative pl-4 border-l-2 ${isBlocked ? 'border-[#FF3B3B]' : 'border-[#00FF9C]'} animate-slideInRight`}
                style={{ animationDelay: '0.1s' }}
              >
                {/* Timeline Node */}
                <div 
                  className={`absolute -left-[5px] top-1 w-2 h-2 rounded-full ${isBlocked ? 'bg-[#FF3B3B] shadow-[0_0_8px_#FF3B3B]' : 'bg-[#00FF9C] shadow-[0_0_8px_#00FF9C]'}`}
                ></div>
                
                <div className="mb-1 flex justify-between items-center">
                  <span className="text-slate-500">{event.timestamp}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isBlocked 
                      ? 'bg-[#FF3B3B]/20 text-[#FF3B3B] border border-[#FF3B3B]/30' 
                      : 'bg-[#00FF9C]/20 text-[#00FF9C] border border-[#00FF9C]/30'
                  }`}>
                    {event.status}
                  </span>
                </div>
                
                <div className="text-white font-sans text-sm mb-1">{event.threatType}</div>
                <div className="text-slate-400 truncate w-full" title={event.requestBody}>
                  {`> ${event.requestBody}`}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ThreatTimeline;
