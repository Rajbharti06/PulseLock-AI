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

  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => setShow(true), 300);
      return () => clearTimeout(t);
    }
    setShow(false);
  }, [visible]);

  if (!result || !show) return null;

  const cfg =
    DECISION_CONFIG[result.decision] ||
    DECISION_CONFIG[result.decision === "WARN" ? "QUARANTINE" : "ALLOW"];

  return (
    <div
      style={{
        borderRadius: 16,
        padding: "32px 28px",
        textAlign: "center",
        background: cfg.bg,
        border: `2px solid ${cfg.border}`,
        boxShadow: cfg.glow,
        animation: "decisionReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Scanline effect */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)`,
          animation: "scanlineMove 2s ease infinite",
          opacity: 0.6,
        }}
      />

      <div style={{ fontSize: "3.5rem", marginBottom: 12, lineHeight: 1 }}>
        {cfg.icon}
      </div>

      <div
        style={{
          fontSize: "2.2rem",
          fontWeight: 900,
          color: cfg.color,
          letterSpacing: "0.08em",
          textShadow: `0 0 20px ${cfg.color}66`,
          marginBottom: 8,
        }}
      >
        {cfg.label}
      </div>

      <div
        style={{
          fontSize: "0.88rem",
          color: "var(--text2)",
          marginBottom: 16,
        }}
      >
        {cfg.desc}
      </div>

      {/* Confidence meter */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          padding: "8px 20px",
          borderRadius: 99,
          background: "rgba(0,0,0,0.3)",
          border: `1px solid ${cfg.border}`,
        }}
      >
        <span
          style={{ fontSize: "0.75rem", color: "var(--text2)", fontWeight: 600 }}
        >
          AI Confidence
        </span>
        <span
          style={{
            fontSize: "1.3rem",
            fontWeight: 800,
            color: cfg.color,
          }}
        >
          {Math.round((result.confidence || 0) * 100)}%
        </span>
      </div>

      {/* Reason */}
      <div
        style={{
          marginTop: 16,
          fontSize: "0.85rem",
          color: "var(--text2)",
          lineHeight: 1.6,
          maxWidth: 500,
          margin: "16px auto 0",
        }}
      >
        {result.reason}
      </div>
    </div>
  );
}
