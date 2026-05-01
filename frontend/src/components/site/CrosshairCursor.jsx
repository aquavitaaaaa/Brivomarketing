import { useEffect, useState, useRef } from "react";

/**
 * CrosshairCursor — replaces the default cursor with a lime crosshair
 * that scopes-up when hovering interactive elements.
 */
export default function CrosshairCursor() {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const [visible, setVisible] = useState(false);
  const [scoped, setScoped] = useState(false);
  const enabledRef = useRef(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) {
      enabledRef.current = false;
      return;
    }

    const onMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY });
      setVisible(true);
      const el = e.target;
      const interactive =
        el && (el.closest("button, a, [role='button'], .cursor-target, label"));
      const text =
        el && el.closest("input, textarea, [contenteditable='true']");
      setScoped(!!interactive && !text);
    };
    const onOut = () => setVisible(false);

    window.addEventListener("mousemove", onMove);
    document.documentElement.addEventListener("mouseleave", onOut);
    document.documentElement.classList.add("custom-cursor-on");

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onOut);
      document.documentElement.classList.remove("custom-cursor-on");
    };
  }, []);

  if (!visible || !enabledRef.current) return null;

  const ringSize = scoped ? 56 : 26;
  const dotSize = 4;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9998] hidden md:block"
      aria-hidden="true"
    >
      {/* Outer ring (scopes up on hover) */}
      <div
        className="absolute transition-[width,height,opacity] duration-200 ease-out"
        style={{
          width: ringSize,
          height: ringSize,
          left: pos.x - ringSize / 2,
          top: pos.y - ringSize / 2,
          opacity: scoped ? 1 : 0.85,
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle
            cx="50"
            cy="50"
            r={scoped ? 38 : 12}
            stroke="#CCFF00"
            strokeWidth="2"
            fill="none"
          />
          <line x1="50" y1="0" x2="50" y2={scoped ? 18 : 38} stroke="#CCFF00" strokeWidth="2" />
          <line x1="50" y1={scoped ? 82 : 62} x2="50" y2="100" stroke="#CCFF00" strokeWidth="2" />
          <line x1="0" y1="50" x2={scoped ? 18 : 38} y2="50" stroke="#CCFF00" strokeWidth="2" />
          <line x1={scoped ? 82 : 62} y1="50" x2="100" y2="50" stroke="#CCFF00" strokeWidth="2" />
        </svg>
      </div>
      {/* Center dot */}
      <div
        className="absolute rounded-full bg-[#CCFF00]"
        style={{
          width: dotSize,
          height: dotSize,
          left: pos.x - dotSize / 2,
          top: pos.y - dotSize / 2,
          boxShadow: "0 0 8px rgba(204,255,0,0.85)",
        }}
      />
    </div>
  );
}
