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
      <div className="dc-breach-container">
        <div style={{ fontSize: '3.75rem', marginBottom: '16px' }}>💀</div>
        <div className="dc-breach-title">
          Data Breach Occurred
        </div>
        <div className="dc-breach-desc">
          Sensitive patient records have been exfiltrated. Legal violation detected. Millions of dollars in compliance fines and loss of patient trust imminent.
        </div>
        
        <div className="dc-breach-data-box">
          <div style={{ color: '#f87171', fontWeight: 'bold', marginBottom: '8px' }}>RAW LEAKED DATA:</div>
          <div style={{ color: 'white', opacity: 0.8, wordBreak: 'break-word', fontSize: '0.875rem' }}>
            {result.reason || "Patient Name, DOB, Medical History, SSN exposed to unauthorized external server."}
          </div>
        </div>

        <button
          onClick={() => setWithoutPulseLock(false)}
          className="dc-breach-btn"
        >
          <span>✅</span> Switch Back: Block with PulseLock
        </button>
      </div>
    );
  }

  return (
    <div
      className="dc-container"
      style={{
        background: cfg.bg,
        border: `2px solid ${cfg.border}`,
        boxShadow: cfg.glow,
      }}
    >
      {/* Scanline effect */}
      <div
        className="dc-scanline"
        style={{
          background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)`,
        }}
      />

      <div style={{ fontSize: '3.75rem', marginBottom: '16px', lineHeight: 1 }}>{cfg.icon}</div>

      <div
        className="dc-title"
        style={{
          color: cfg.color,
          textShadow: `0 0 20px ${cfg.color}66`,
        }}
      >
        {cfg.label}
      </div>

      <div style={{ fontSize: '1.125rem', color: '#cbd5e1', marginBottom: '24px', fontWeight: 500 }}>
        {cfg.desc}
      </div>

      {/* Confidence meter */}
      <div
        className="dc-confidence"
        style={{
          border: `1px solid ${cfg.border}`,
        }}
      >
        <span style={{ fontSize: '0.875rem', color: '#94a3b8', fontWeight: 'bold', letterSpacing: '0.025em', textTransform: 'uppercase' }}>
          AI Confidence
        </span>
        <span
          style={{ fontSize: '1.5rem', fontWeight: 900, color: cfg.color }}
        >
          {Math.round((result.confidence || 0) * 100)}%
        </span>
      </div>

      {isBlocked && (
        <div className="dc-consequence-box">
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', color: '#FF3B3B', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <span style={{ marginRight: '8px' }}>🚨</span> Sensitive Data Detected
            </div>
            <div style={{ color: '#cbd5e1', fontSize: '0.875rem', fontFamily: 'monospace', lineHeight: 1.6 }}>
              {result.reason || "Patient Name, DOB, Medical History"}
            </div>
          </div>
          
          <div style={{ width: '1px', background: '#1e293b' }}></div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', color: '#94a3b8', fontWeight: 'bold', fontSize: '0.75rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <span style={{ marginRight: '8px' }}>⚠️</span> If Not Blocked:
            </div>
            <ul style={{ color: '#cbd5e1', fontSize: '0.75rem', fontFamily: 'monospace', listStyle: 'none', padding: 0, margin: 0, lineHeight: 1.5 }}>
              <li>• Patient identity exposed</li>
              <li>• Medical records leaked</li>
              <li>• Regulatory violation (HIPAA)</li>
              <li style={{ color: '#FF3B3B', fontWeight: 'bold' }}>• Financial damage risk: HIGH</li>
            </ul>
          </div>
        </div>
      )}

      {isBlocked && (
        <button
          onClick={() => setWithoutPulseLock(true)}
          className="dc-view-without-btn"
        >
          <span>👉</span> View "Without PulseLock"
        </button>
      )}
    </div>
  );
}
