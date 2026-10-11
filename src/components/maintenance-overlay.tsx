"use client";

import { useEffect } from "react";

export function MaintenanceOverlay() {
  useEffect(() => {
    const lines = document.querySelectorAll<HTMLElement>(".maint-line");
    const interval = setInterval(() => {
      lines.forEach((el) => {
        if (Math.random() < 0.02) {
          el.style.transform = `translate(${Math.random() * 4 - 2}px, ${
            Math.random() * 2 - 1
          }px)`;
          setTimeout(() => {
            el.style.transform = "";
          }, 80);
        }
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .maint-root {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: #0a0c0f;
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Share Tech Mono', 'Courier New', monospace, 'VT323', monospace;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 1rem;
        }
        .maint-root::before {
          content: "";
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: repeating-linear-gradient(
            0deg,
            rgba(0, 255, 0, 0.03) 0px,
            rgba(0, 255, 0, 0.03) 1px,
            transparent 1px,
            transparent 3px
          );
          pointer-events: none;
          z-index: 10;
          animation: maint-scanline 8s linear infinite;
        }
        @keyframes maint-scanline {
          0% { background-position: 0 0; }
          100% { background-position: 0 30px; }
        }
        .maint-root::after {
          content: "";
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at 50% 50%, rgba(0, 20, 0, 0.4) 0%, rgba(0, 0, 0, 0.9) 100%);
          pointer-events: none;
          z-index: 5;
        }
        .maint-container {
          position: relative;
          z-index: 20;
          width: 100%;
          max-width: 1400px;
          padding: 2rem 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          border: 2px solid #0f0;
          box-shadow: 0 0 20px #0f0, 0 0 60px rgba(0, 255, 0, 0.3), inset 0 0 20px rgba(0, 255, 0, 0.1);
          background: rgba(0, 8, 0, 0.75);
          backdrop-filter: blur(2px);
          border-radius: 12px;
          transform: scale(0.98);
          animation: maint-flicker 4s infinite alternate;
        }
        @keyframes maint-flicker {
          0% { opacity: 0.95; box-shadow: 0 0 15px #0f0, 0 0 40px rgba(0, 255, 0, 0.2), inset 0 0 15px rgba(0, 255, 0, 0.1); }
          25% { opacity: 1; }
          50% { opacity: 0.98; box-shadow: 0 0 25px #0f0, 0 0 70px rgba(0, 255, 0, 0.4), inset 0 0 25px rgba(0, 255, 0, 0.2); }
          75% { opacity: 1; }
          100% { opacity: 0.96; box-shadow: 0 0 15px #0f0, 0 0 40px rgba(0, 255, 0, 0.2), inset 0 0 15px rgba(0, 255, 0, 0.1); }
        }
        .maint-text {
          color: #0f0;
          text-shadow: 0 0 5px #0f0, 0 0 15px #0f0, 0 0 30px #0f0;
          font-size: clamp(1rem, 5vw, 2.2rem);
          line-height: 1.5;
          letter-spacing: 2px;
          word-break: break-word;
          text-transform: uppercase;
          font-weight: 700;
          margin-bottom: 1rem;
          font-family: 'Share Tech Mono', 'Courier New', 'VT323', monospace;
        }
        .maint-message { display: flex; flex-direction: column; gap: 0.5rem; }
        .maint-line { display: block; position: relative; }
        .maint-cursor {
          display: inline-block;
          width: 10px;
          height: 1.2em;
          background: #0f0;
          vertical-align: middle;
          margin-left: 8px;
          box-shadow: 0 0 10px #0f0, 0 0 20px #0f0;
          animation: maint-blink 1s step-end infinite;
        }
        @keyframes maint-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .maint-author {
          margin-top: 2rem;
          font-size: clamp(0.9rem, 4vw, 1.8rem);
          color: #0f0;
          text-shadow: 0 0 8px #0f0, 0 0 20px #0f0;
          letter-spacing: 4px;
          text-transform: uppercase;
          border-top: 1px dashed #0f0;
          padding-top: 1.5rem;
          width: 100%;
          font-weight: 500;
          animation: maint-pulse 2s infinite alternate;
        }
        @keyframes maint-pulse {
          from { text-shadow: 0 0 5px #0f0, 0 0 15px #0f0; opacity: 0.9; }
          to { text-shadow: 0 0 15px #0f0, 0 0 40px #0f0, 0 0 60px #0f0; opacity: 1; }
        }
        .maint-prompt { color: #0f0; font-weight: bold; margin-right: 8px; opacity: 0.8; }
        .maint-glitch-border {
          position: absolute;
          top: 10px; left: 10px; right: 10px; bottom: 10px;
          border: 1px solid rgba(0, 255, 0, 0.3);
          pointer-events: none;
          border-radius: 8px;
        }
        @media (max-width: 480px) {
          .maint-container { padding: 1.5rem 1rem; border-width: 1px; box-shadow: 0 0 10px #0f0, 0 0 30px rgba(0, 255, 0, 0.2); }
          .maint-text { letter-spacing: 1px; line-height: 1.4; }
          .maint-author { letter-spacing: 2px; }
        }
        .maint-glitch { animation: maint-glitch 3s infinite; }
        @keyframes maint-glitch {
          0%, 100% { transform: translate(0); }
          95% { transform: translate(0); }
          96% { transform: translate(2px, 1px); }
          97% { transform: translate(-2px, -1px); }
          98% { transform: translate(1px, -2px); }
          99% { transform: translate(-1px, 2px); }
        }
        .maint-window { width: 100%; }
        .maint-ascii { font-size: 0.8rem; color: #0f0; opacity: 0.5; margin-bottom: 0.5rem; letter-spacing: 4px; }
        .maint-header { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-bottom: 1rem; color: #0f0; opacity: 0.7; font-size: 0.8rem; letter-spacing: 2px; }
        .maint-header span { border: 1px solid #0f0; padding: 2px 8px; border-radius: 20px; background: rgba(0, 255, 0, 0.05); }
        .maint-footer { margin-top: 1.2rem; font-size: 0.7rem; color: #0f0; opacity: 0.5; letter-spacing: 2px; }
      `}</style>
      <div
        className="maint-root"
        role="alert"
        aria-label="Site em manutenção"
      >
        <div className="maint-container maint-glitch">
          <div className="maint-glitch-border" />

          <div className="maint-header">
            <span>root@5c4rf4c3:~#</span>
            <span>bash</span>
            <span>legion</span>
          </div>

          <div className="maint-ascii">
            [ SYSTEM ] [ MESSAGE ] [ ENCRYPTED ]
          </div>

          <div className="maint-window">
            <div className="maint-text maint-message">
              <span className="maint-line">
                <span className="maint-prompt">&gt;</span> ENQUANTO OS MAIS
                VULNERAVEIS
              </span>
              <span className="maint-line">
                <span className="maint-prompt">&gt;</span> NAO TEM ONDE MORAR,
                VOCES
              </span>
              <span className="maint-line">
                <span className="maint-prompt">&gt;</span> ALIMENTAM A MAQUINA DO
                ESTADO
              </span>
              <span className="maint-line">
                <span className="maint-prompt">&gt;</span> E FOMENTAM A POBREZA.
              </span>
              <span className="maint-line" style={{ marginTop: "0.8rem" }}>
                <span className="maint-prompt">&gt;</span> MAS ISTO VAI MUDAR
                <span className="maint-cursor" />
              </span>
            </div>
          </div>

          <div className="maint-author">BY 5C4RF4C3 L3G10N</div>

          <div className="maint-footer">
            [ PROCESSANDO ... ] [ CONEXAO SEGURA ]
          </div>
        </div>
      </div>
    </>
  );
}

export default MaintenanceOverlay;
