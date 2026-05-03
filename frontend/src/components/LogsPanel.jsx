import { useState, useEffect, useRef } from "react";

export default function LogsPanel({ logs, visible }) {
  const [displayedLogs, setDisplayedLogs] = useState([]);
  const [currentTyping, setCurrentTyping] = useState(-1);
  const [typedText, setTypedText] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    if (!visible || !logs || logs.length === 0) {
      setDisplayedLogs([]);
      setCurrentTyping(-1);
      setTypedText("");
      return;
    }

    setDisplayedLogs([]);
    setCurrentTyping(0);
    setTypedText("");

    let logIndex = 0;
    let charIndex = 0;
    let cancelled = false;

    function typeNext() {
      if (cancelled) return;
      if (logIndex >= logs.length) {
        setCurrentTyping(-1);
        return;
      }

      const currentLog = logs[logIndex];
      if (charIndex <= currentLog.length) {
        setCurrentTyping(logIndex);
        setTypedText(currentLog.slice(0, charIndex));
        charIndex++;
        setTimeout(typeNext, 25 + Math.random() * 15);
      } else {
        // Finished typing this log
        setDisplayedLogs((prev) => [...prev, currentLog]);
        logIndex++;
        charIndex = 0;
        setTypedText("");
        setTimeout(typeNext, 200);
      }
    }

    // Start typing after a small delay
    const startDelay = setTimeout(() => typeNext(), 600);

    return () => {
      cancelled = true;
      clearTimeout(startDelay);
    };
  }, [visible, logs]);

  // Auto-scroll
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [displayedLogs, typedText]);

  if (!visible) return null;

  const now = new Date();

  return (
    <div
      style={{
        borderRadius: 14,
        background: "rgba(0,0,0,0.45)",
        border: "1px solid rgba(0,212,255,0.15)",
        padding: "20px",
        animation: "slideUp 0.4s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <div
          style={{
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            color: "#00D4FF",
            textTransform: "uppercase",
          }}
        >
          📊 System Logs
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: "0.68rem",
            color: "var(--text3)",
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#00FF9C",
              animation: "pulse 2s infinite",
            }}
          />
          LIVE
        </div>
      </div>

      <div
        ref={containerRef}
        style={{
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
          fontSize: "0.78rem",
          lineHeight: 1.8,
          maxHeight: 220,
          overflowY: "auto",
          color: "#80e4ff",
        }}
      >
        {displayedLogs.map((log, i) => {
          const ts = new Date(
            now.getTime() - (displayedLogs.length - i) * 1200
          );
          return (
            <div key={i} style={{ animation: "fadeIn 0.2s ease" }}>
              <span style={{ color: "var(--text3)" }}>
                [{ts.toLocaleTimeString()}]
              </span>{" "}
              <span style={{ color: "#00FF9C" }}>✓</span>{" "}
              <span style={{ color: "#ddeeff" }}>{log}</span>
            </div>
          );
        })}

        {currentTyping >= 0 && currentTyping < (logs?.length || 0) && (
          <div>
            <span style={{ color: "var(--text3)" }}>
              [{now.toLocaleTimeString()}]
            </span>{" "}
            <span style={{ color: "#ffaa00" }}>▶</span>{" "}
            <span style={{ color: "#ffd070" }}>{typedText}</span>
            <span
              style={{
                display: "inline-block",
                width: 7,
                height: 14,
                background: "#00D4FF",
                marginLeft: 2,
                animation: "cursorBlink 0.8s step-end infinite",
                verticalAlign: "middle",
              }}
            />
          </div>
        )}

        {displayedLogs.length === (logs?.length || 0) &&
          currentTyping === -1 &&
          displayedLogs.length > 0 && (
            <div style={{ marginTop: 6 }}>
              <span style={{ color: "var(--text3)" }}>
                [{now.toLocaleTimeString()}]
              </span>{" "}
              <span style={{ color: "#00FF9C" }}>●</span>{" "}
              <span style={{ color: "#00FF9C", fontWeight: 600 }}>
                All security protocols executed successfully
              </span>
            </div>
          )}
      </div>
    </div>
  );
}
