import { useState, useEffect } from "react";

const DECISION_CONFIG = {
  BLOCK: {
    icon: "🚫",
    label: "BLOCKED",
    color: "#FF3B3B",
    glow: "0 0 40px rgba(255,59,59,0.4), 0 0 80px rgba(255,59,59,0.15)",
    bg: "rgba(255,59,59,0.08)",
    border: "rgba(255,59,59,0.4)",
    desc: "Threat neutralized — patient data secured",
  },
  ALLOW: {
    icon: "✅",
    label: "ALLOWED",
    color: "#00FF9C",
    glow: "0 0 40px rgba(0,255,156,0.3), 0 0 80px rgba(0,255,156,0.1)",
    bg: "rgba(0,255,156,0.06)",
    border: "rgba(0,255,156,0.35)",
    desc: "Request verified — safe to proceed",
  },
  QUARANTINE: {
    icon: "⚠️",
    label: "QUARANTINED",
    color: "#FF6400",
    glow: "0 0 40px rgba(255,100,0,0.35), 0 0 80px rgba(255,100,0,0.12)",
    bg: "rgba(255,100,0,0.07)",
    border: "rgba(255,100,0,0.35)",
    desc: "Content isolated for compliance review",
  },
};

export default function DecisionCard({ result, visible }) {
  const [show, setShow] = useState(false);
  const [withoutPulseLock, setWithoutPulseLock] = useState(false);

  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => setShow(true), 300);
      return () => clearTimeout(t);
    }
    setShow(false);
    setWithoutPulseLock(false);
  }, [visible, result]);

  if (!result || !show) return null;

  const cfg =
    DECISION_CONFIG[result.decision] ||
    DECISION_CONFIG[result.decision === "WARN" ? "QUARANTINE" : "ALLOW"];

  const isBlocked = result.decision === "BLOCK" || result.decision === "WARN";

  if (withoutPulseLock && isBlocked) {
    return (
      <div
        className="w-full flex flex-col items-center justify-center p-12 rounded-2xl relative overflow-hidden animate-decisionReveal"
        style={{
          background: "rgba(255,0,0,0.15)",
          border: "2px solid #FF0000",
          boxShadow: "0 0 60px rgba(255,0,0,0.4)",
        }}
      >
        <div className="text-6xl mb-4">💀</div>
        <div className="text-4xl font-black text-red-500 tracking-widest mb-2 uppercase text-center" style={{ textShadow: "0 0 20px rgba(255,0,0,0.8)" }}>
          Data Breach Occurred
        </div>
        <div className="text-red-300 text-lg mb-8 text-center max-w-2xl">
          Sensitive patient records have been exfiltrated. Legal violation detected. Millions of dollars in compliance fines and loss of patient trust imminent.
        </div>
        
        <div className="bg-red-900/40 border border-red-500/50 p-6 rounded-xl w-full max-w-2xl text-left font-mono mb-8">
          <div className="text-red-400 font-bold mb-2">RAW LEAKED DATA:</div>
          <div className="text-white opacity-80 break-words text-sm">
            {result.reason || "Patient Name, DOB, Medical History, SSN exposed to unauthorized external server."}
          </div>
        </div>

        <button
          onClick={() => setWithoutPulseLock(false)}
          className="bg-[#00FF9C] hover:bg-[#00E676] text-black font-bold py-3 px-8 rounded-full shadow-[0_0_20px_rgba(0,255,156,0.4)] transition-all transform hover:scale-105 flex items-center gap-2"
        >
          <span>✅</span> Switch Back: Block with PulseLock
        </button>
      </div>
    );
  }

  return (
    <div
      className="w-full rounded-2xl p-10 text-center relative overflow-hidden animate-decisionReveal"
      style={{
        background: cfg.bg,
        border: `2px solid ${cfg.border}`,
        boxShadow: cfg.glow,
      }}
    >
      {/* Scanline effect */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-60 animate-scanlineMove"
        style={{
          background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)`,
        }}
      />

      <div className="text-6xl mb-4 leading-none">{cfg.icon}</div>

      <div
        className="text-5xl font-black tracking-widest mb-2 uppercase"
        style={{
          color: cfg.color,
          textShadow: `0 0 20px ${cfg.color}66`,
        }}
      >
        {cfg.label}
      </div>

      <div className="text-lg text-slate-300 mb-6 font-medium">
        {cfg.desc}
      </div>

      {/* Confidence meter */}
      <div
        className="inline-flex items-center gap-3 px-6 py-2 rounded-full mb-8"
        style={{
          background: "rgba(0,0,0,0.3)",
          border: `1px solid ${cfg.border}`,
        }}
      >
        <span className="text-sm text-slate-400 font-bold tracking-wide uppercase">
          AI Confidence
        </span>
        <span
          className="text-2xl font-black"
          style={{ color: cfg.color }}
        >
          {Math.round((result.confidence || 0) * 100)}%
        </span>
      </div>

      {isBlocked && (
        <div className="bg-black/40 border border-[#1E293B] rounded-xl p-4 mb-8 max-w-2xl mx-auto text-left">
          <div className="flex items-center text-[#FF3B3B] font-bold text-sm mb-2 uppercase tracking-wider">
            <span className="mr-2">🚨</span> Sensitive Data Detected
          </div>
          <div className="text-slate-300 text-sm font-mono leading-relaxed">
            {result.reason || "Patient Name, DOB, Medical History"}
          </div>
        </div>
      )}

      {isBlocked && (
        <button
          onClick={() => setWithoutPulseLock(true)}
          className="mx-auto flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-6 py-2 rounded border border-slate-600 transition-colors text-sm font-medium"
        >
          <span>👉</span> View "Without PulseLock"
        </button>
      )}
    </div>
  );
}
