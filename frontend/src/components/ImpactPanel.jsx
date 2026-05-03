import { useState, useEffect, useMemo } from "react";

const IMPACT_ITEMS = [
  {
    icon: "🛡️",
    label: "Patient Protected",
    desc: "Sensitive health data secured from unauthorized access",
    color: "#00FF9C",
  },
  {
    icon: "🔒",
    label: "Data Secured",
    desc: "PHI encryption and containment protocols activated",
    color: "#00D4FF",
  },
  {
    icon: "🚫",
    label: "Breach Prevented",
    desc: "Exfiltration attempt blocked before data left the system",
    color: "#FF3B3B",
  },
];

const SAFE_ITEMS = [
  {
    icon: "✅",
    label: "Safe Operation",
    desc: "No threats detected — request cleared for processing",
    color: "#00FF9C",
  },
];

export default function ImpactPanel({ result, visible }) {
  const [revealedCount, setRevealedCount] = useState(0);

  const isBlocked =
    !!result &&
    ["BLOCK", "QUARANTINE", "DELETE"].includes(result.decision);

  const items = useMemo(() => {
    if (!result) return SAFE_ITEMS;
    if (!["BLOCK", "QUARANTINE", "DELETE"].includes(result.decision)) {
      return SAFE_ITEMS;
    }
    const labels = result.impact || IMPACT_ITEMS.map((i) => i.label);
    return labels.map((text, idx) => ({
      ...IMPACT_ITEMS[idx % IMPACT_ITEMS.length],
      label: text,
    }));
  }, [result]);

  const itemKey = useMemo(
    () => items.map((i) => i.label).join("|"),
    [items],
  );

  useEffect(() => {
    if (!visible) {
      const id = window.setTimeout(() => setRevealedCount(0), 0);
      return () => clearTimeout(id);
    }
    const timers = [];
    timers.push(window.setTimeout(() => setRevealedCount(0), 0));
    items.forEach((_, i) => {
      timers.push(
        window.setTimeout(() => setRevealedCount(i + 1), 400 + i * 300),
      );
    });
    return () => timers.forEach((t) => clearTimeout(t));
  }, [visible, itemKey, items]);

  if (!visible || !result) return null;

  return (
    <div
      style={{
        borderRadius: 14,
        padding: "24px",
        background: isBlocked
          ? "linear-gradient(135deg, rgba(255,59,59,0.06) 0%, rgba(255,100,0,0.04) 100%)"
          : "linear-gradient(135deg, rgba(0,255,156,0.06) 0%, rgba(0,212,255,0.04) 100%)",
        border: `1px solid ${isBlocked ? "rgba(255,59,59,0.25)" : "rgba(0,255,156,0.25)"}`,
        animation: "slideUp 0.4s ease",
      }}
    >
      <div
        style={{
          fontSize: "0.72rem",
          fontWeight: 700,
          letterSpacing: "0.12em",
          color: isBlocked ? "#FF3B3B" : "#00FF9C",
          marginBottom: 16,
          textTransform: "uppercase",
        }}
      >
        {isBlocked ? "🔍 Impact Analysis" : "✓ Impact Assessment"}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 16px",
              borderRadius: 10,
              background: "rgba(0,0,0,0.25)",
              border: `1px solid ${item.color}30`,
              opacity: i < revealedCount ? 1 : 0,
              transform:
                i < revealedCount ? "translateX(0)" : "translateX(-20px)",
              transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: `${item.color}15`,
                border: `1px solid ${item.color}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.3rem",
                flexShrink: 0,
              }}
            >
              {item.icon}
            </div>
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  color: item.color,
                  marginBottom: 2,
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontSize: "0.78rem",
                  color: "var(--text2)",
                  lineHeight: 1.4,
                }}
              >
                {item.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
