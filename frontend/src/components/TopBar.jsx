import React from 'react';

const TopBar = () => {
  return (
    <div className="flex items-center justify-between w-full bg-[#080C18] border-b border-[#1E293B] py-2 px-6 text-xs font-mono tracking-wider z-50 sticky top-0">
      <div className="flex items-center space-x-6">
        <div className="flex items-center text-[#00FF9C]">
          <span className="relative flex h-2 w-2 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF9C] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FF9C]"></span>
          </span>
          SYSTEM ACTIVE
        </div>
        <div className="flex items-center text-[#00D4FF]">
          <span className="mr-2">🧠</span>
          AI LEARNING: ON
        </div>
      </div>
      
      <div className="flex items-center text-[#FF3B3B] font-bold">
        <span className="mr-2">🛡️</span>
        ZERO TRUST MODE: ENFORCED
      </div>
    </div>
  );
};

export default TopBar;
