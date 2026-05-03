import { useState, useEffect } from "react";

export default function SystemStatusPanel() {
  const [lastScan, setLastScan] = useState(2);

  useEffect(() => {
    const iv = setInterval(() => {
      setLastScan((prev) => {
        if (prev >= 12) return 1;
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  const items = [
    {
      label: "System Status",
      value: "ACTIVE",
      color: "#00FF9C",
      dot: true,
    },
    {
      label: "Threat Level",
      value: "HIGH",
      color: "#FF3B3B",
      dot: false,
    },
    {
      label: "AI State",
      value: "LEARNING",
      color: "#ffaa00",
      dot: false,
    },
    {
      label: "Last Scan",
      value: `${lastScan}s ago`,
      color: "#00D4FF",
      dot: false,
    },
  ];

  return (
    <div
      style={{
        borderRadius: 14,
        padding: "20px",
        background: "rgba(0,0,0,0.3)",
        border: "1px solid rgba(0,212,255,0.15)",
        animation: "slideUp 0.3s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#00FF9C",
            animation: "pulse 2s infinite",
          }}
        />
        <span
          style={{
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            color: "#00D4FF",
            textTransform: "uppercase",
          }}
        >
          System Status
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 14px",
              borderRadius: 8,
              background: "rgba(0,0,0,0.25)",
              border: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <span
              style={{
                fontSize: "0.78rem",
                color: "var(--text2)",
                fontWeight: 500,
              }}
            >
              {item.label}
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {item.dot && (
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: item.color,
                    boxShadow: `0 0 8px ${item.color}`,
                    animation: "pulse 2s infinite",
                  }}
                />
              )}
              <span
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: item.color,
                  letterSpacing: "0.04em",
                }}
              >
                {item.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* A2A mini pipeline */}
      <div style={{ marginTop: 16 }}>
        <div
          style={{
            fontSize: "0.68rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: "var(--text3)",
            marginBottom: 10,
            textTransform: "uppercase",
          }}
        >
          A2A Pipeline
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 0,
            justifyContent: "center",
          }}
        >
          {[
            { label: "Diagnosis", icon: "🤖" },
            { label: "PulseLock", icon: "🛡️" },
            { label: "Decision", icon: "⚡" },
            { label: "Execute", icon: "✅" },
          ].map((step, i, arr) => (
            <div
              key={step.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 0,
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background:
                      i === 1
                        ? "rgba(0,212,255,0.15)"
                        : "rgba(255,255,255,0.04)",
                    border: `1px solid ${i === 1 ? "rgba(0,212,255,0.3)" : "rgba(255,255,255,0.08)"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.85rem",
                    margin: "0 auto 4px",
                  }}
                >
                  {step.icon}
                </div>
                <div
                  style={{
                    fontSize: "0.58rem",
                    color:
                      i === 1 ? "#00D4FF" : "var(--text3)",
                    fontWeight: i === 1 ? 700 : 400,
                  }}
                >
                  {step.label}
                </div>
              </div>
              {i < arr.length - 1 && (
                <div
                  style={{
                    width: 14,
                    height: 1,
                    background: "rgba(0,212,255,0.3)",
                    margin: "0 2px",
                    marginBottom: 16,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
