import { useState, useEffect } from "react";

export default function LearningPanel({ learning, visible }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible && learning) {
      const t = setTimeout(() => setShow(true), 500);
      return () => clearTimeout(t);
    }
    setShow(false);
  }, [visible, learning]);

  if (!visible || !learning || !show) return null;

  const noUpdate = learning === "No update required";

  return (
    <div
      style={{
        borderRadius: 14,
        padding: "20px 24px",
        background: noUpdate
          ? "rgba(0,212,255,0.05)"
          : "linear-gradient(135deg, rgba(0,212,255,0.08) 0%, rgba(0,255,156,0.05) 100%)",
        border: `1px solid ${noUpdate ? "rgba(0,212,255,0.2)" : "rgba(0,255,156,0.3)"}`,
        animation: "slideUp 0.4s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: noUpdate
              ? "rgba(0,212,255,0.12)"
              : "rgba(0,255,156,0.12)",
            border: `1px solid ${noUpdate ? "rgba(0,212,255,0.3)" : "rgba(0,255,156,0.3)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.1rem",
          }}
        >
          {noUpdate ? "🧠" : "🔄"}
        </div>
        <div>
          <div
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: noUpdate ? "#00D4FF" : "#00FF9C",
              textTransform: "uppercase",
            }}
          >
            {noUpdate ? "AI Status" : "Self-Learning Update"}
          </div>
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--text2)",
            }}
          >
            {noUpdate
              ? "No new rules required"
              : "New security rule created"}
          </div>
        </div>
      </div>

      <div
        style={{
          padding: "12px 16px",
          borderRadius: 10,
          background: "rgba(0,0,0,0.3)",
          border: `1px solid ${noUpdate ? "rgba(0,212,255,0.15)" : "rgba(0,255,156,0.2)"}`,
        }}
      >
        <div
          style={{
            fontFamily:
              "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
            fontSize: "0.8rem",
            color: noUpdate ? "#80e4ff" : "#80ffb8",
            lineHeight: 1.6,
          }}
        >
          {noUpdate ? (
            <span>
              <span style={{ color: "var(--text3)" }}>rule_update:</span>{" "}
              none_required
              <br />
              <span style={{ color: "var(--text3)" }}>ai_state:</span>{" "}
              monitoring
            </span>
          ) : (
            <span>
              <span style={{ color: "var(--text3)" }}>new_rule:</span>{" "}
              {learning}
              <br />
              <span style={{ color: "var(--text3)" }}>status:</span>{" "}
              <span style={{ color: "#00FF9C" }}>applied</span>
              <br />
              <span style={{ color: "var(--text3)" }}>ai_state:</span>{" "}
              <span style={{ color: "#ffaa00" }}>learning</span>
            </span>
          )}
        </div>
      </div>

      {!noUpdate && (
        <div
          style={{
            marginTop: 10,
            fontSize: "0.75rem",
            color: "var(--text3)",
            textAlign: "center",
          }}
        >
          PulseLock will apply this rule to all future requests automatically
        </div>
      )}
    </div>
  );
}
