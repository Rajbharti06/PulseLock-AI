import { useState, useEffect } from "react";

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
  const [showItems, setShowItems] = useState([]);

  const isBlocked =
    result &&
    ["BLOCK", "QUARANTINE", "DELETE"].includes(result.decision);
  const items = isBlocked ? (result.impact || IMPACT_ITEMS.map((i) => i.label)).map((text, idx) => ({
    ...IMPACT_ITEMS[idx % IMPACT_ITEMS.length],
    label: text,
  })) : SAFE_ITEMS;

  useEffect(() => {
    if (!visible) {
      setShowItems([]);
      return;
    }

    setShowItems([]);
    items.forEach((_, i) => {
      setTimeout(() => {
        setShowItems((prev) => [...prev, i]);
      }, 400 + i * 300);
    });
  }, [visible, result?.decision]);

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
              opacity: showItems.includes(i) ? 1 : 0,
              transform: showItems.includes(i)
                ? "translateX(0)"
                : "translateX(-20px)",
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
