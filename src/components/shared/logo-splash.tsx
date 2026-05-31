'use client';

import { useEffect, useState } from 'react';

const R = 78;
const C = parseFloat((Math.PI * 2 * R).toFixed(2)); // 490.09

export function LogoSplash() {
  const [show, setShow] = useState(false);

  // Show only when the login form set the 'fresh_login' flag.
  // Consume the flag immediately so refresh doesn't re-trigger.
  useEffect(() => {
    if (sessionStorage.getItem('fresh_login')) {
      sessionStorage.removeItem('fresh_login');
      setShow(true);
    }
  }, []);

  // Dismiss after animation completes
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => setShow(false), 3900);
    return () => clearTimeout(t);
  }, [show]);

  if (!show) return null;

  return (
    <>
      <style>{STYLES}</style>
      <div className="lspl" role="presentation" aria-hidden="true">
        {/* Ambient glow bloom */}
        <div className="lspl__glow" />

        {/* Logo mark */}
        <div className="lspl__mark">
          {/* Horizontal beam of light that sweeps through the mark */}
          <div className="lspl__beam" />

          <svg viewBox="0 0 160 160" width={160} height={160}>
            {/* Soft outer halo */}
            <circle
              cx={80} cy={80} r={79.5}
              fill="none"
              stroke="rgba(201,168,122,0.07)"
              strokeWidth={9}
            />
            {/* Circle fill — materialises after ring */}
            <circle
              cx={80} cy={80} r={R}
              className="lspl__fill"
              fill="#3D302A"
            />
            {/* Ring that traces itself clockwise from 12 o'clock */}
            <circle
              cx={80} cy={80} r={R}
              className="lspl__ring"
              fill="none"
              stroke="#C9A87A"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C}
              transform="rotate(-90 80 80)"
            />
          </svg>

          {/* Monogram — emerges after circle is complete */}
          <div className="lspl__text">
            <span className="lspl__monogram">
              DD<sup>2</sup>
            </span>
            {/* Shimmer sweep — clipped to circle via border-radius on parent */}
            <span className="lspl__shimmer" aria-hidden="true" />
          </div>
        </div>

        {/* Platform wordmark */}
        <p className="lspl__wordmark">GESTIÓN FINCA</p>
      </div>
    </>
  );
}

const STYLES = `
/* ═══════════════════════════════════════════════
   LOGO SPLASH — premium intro screen
   Total duration: ~3.9 s
   ═══════════════════════════════════════════════ */

.lspl {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
  background-color: #0C0A09;
  animation: lspl-fade-out 1s cubic-bezier(0.4, 0, 1, 1) 2.9s forwards;
}

/* Radial bloom that pulses at peak */
.lspl__glow {
  position: absolute;
  width: 520px;
  height: 520px;
  border-radius: 50%;
  background: radial-gradient(
    circle at center,
    rgba(201, 168, 122, 0.055) 0%,
    transparent 62%
  );
  pointer-events: none;
  animation: lspl-glow-pulse 2.2s ease-in-out 1.8s;
}

/* Mark wrapper */
.lspl__mark {
  position: relative;
  width: 160px;
  height: 160px;
}

/* Light beam that sweeps top-to-bottom */
.lspl__beam {
  position: absolute;
  left: -32px;
  right: -32px;
  height: 1px;
  top: 50%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(201, 168, 122, 0.55) 28%,
    rgba(255, 248, 230, 0.48) 50%,
    rgba(201, 168, 122, 0.55) 72%,
    transparent 100%
  );
  filter: blur(0.6px);
  opacity: 0;
  animation: lspl-beam-sweep 0.85s ease 0.85s;
}

/* Circle fill */
.lspl__fill {
  opacity: 0;
  animation: lspl-fill-in 0.95s ease 0.42s forwards;
}

/* Tracing ring */
.lspl__ring {
  animation: lspl-ring-trace 1.15s cubic-bezier(0.4, 0, 0.2, 1) 0.18s forwards;
}

/* Text container — border-radius clips shimmer to circle shape */
.lspl__text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 50%;
  opacity: 0;
  animation: lspl-text-in 1.05s cubic-bezier(0.22, 1, 0.36, 1) 1.28s forwards;
}

/* DD² monogram */
.lspl__monogram {
  font-family: var(--font-display, Georgia, serif);
  font-size: 50px;
  font-weight: 400;
  color: #EDE4D2;
  letter-spacing: -0.015em;
  line-height: 1;
}

.lspl__monogram sup {
  font-size: 0.43em;
  vertical-align: super;
  letter-spacing: 0;
}

/* Shimmer highlight — clipped to circle by parent border-radius */
.lspl__shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    108deg,
    transparent 32%,
    rgba(255, 248, 230, 0.22) 50%,
    transparent 68%
  );
  transform: translateX(-135%);
  animation: lspl-shimmer-pass 1.2s ease 2.05s;
  pointer-events: none;
}

/* Platform wordmark */
.lspl__wordmark {
  margin: 0;
  font-family: var(--font-mono, monospace);
  font-size: 9px;
  letter-spacing: 0.44em;
  color: rgba(201, 168, 122, 0.42);
  text-transform: uppercase;
  opacity: 0;
  animation: lspl-wordmark-in 0.95s ease 1.95s forwards;
}

/* ── Keyframes ─────────────────────────────────── */

@keyframes lspl-fade-out {
  to { opacity: 0; }
}

@keyframes lspl-glow-pulse {
  0%   { opacity: 0;   transform: scale(0.9); }
  48%  { opacity: 1;   transform: scale(1.06); }
  100% { opacity: 0;   transform: scale(1.0); }
}

@keyframes lspl-beam-sweep {
  0%   { opacity: 0;   transform: translateY(-58px); }
  16%  { opacity: 1; }
  84%  { opacity: 1; }
  100% { opacity: 0;   transform: translateY(58px); }
}

@keyframes lspl-fill-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes lspl-ring-trace {
  to { stroke-dashoffset: 0; }
}

@keyframes lspl-text-in {
  0%   { opacity: 0; filter: blur(7px); transform: scale(0.95); }
  100% { opacity: 1; filter: blur(0);   transform: scale(1);    }
}

@keyframes lspl-shimmer-pass {
  0%   { transform: translateX(-135%); }
  100% { transform: translateX(135%); }
}

@keyframes lspl-wordmark-in {
  0%   { opacity: 0; letter-spacing: 0.58em; }
  100% { opacity: 1; letter-spacing: 0.44em; }
}

/* Accessible: minimal motion variant */
@media (prefers-reduced-motion: reduce) {
  .lspl {
    animation: lspl-fade-out 0.2s ease 0.8s forwards;
  }
  .lspl__ring     { animation: none; stroke-dashoffset: 0; }
  .lspl__fill     { animation: none; opacity: 1; }
  .lspl__text     { animation: none; opacity: 1; }
  .lspl__wordmark { animation: none; opacity: 1; }
  .lspl__beam,
  .lspl__shimmer,
  .lspl__glow     { display: none; }
}
`;
