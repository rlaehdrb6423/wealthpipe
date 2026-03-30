"use client";

import { useEffect, useRef } from "react";

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (t: number) => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const cx = w * 0.5;
      const cy = h * 0.54;
      const angle = t * 0.00035;

      for (let i = 7; i >= 0; i--) {
        const z = i / 7;
        const sc = 0.55 + z * 0.55;
        const alpha = 0.025 + z * 0.055;
        const ox = Math.sin(angle + i * 0.45) * 28 * z;
        const oy = Math.cos(angle * 0.6 + i * 0.3) * 14 * z;
        const pw = 400 * sc;
        const ph = 290 * sc;
        const rx = cx + ox - pw / 2;
        const ry = cy + oy - ph / 2;
        const rr = 24 * sc;

        ctx.save();
        ctx.translate(cx + ox, cy + oy);
        ctx.rotate(angle * 0.25 + i * 0.12);
        ctx.translate(-(cx + ox), -(cy + oy));

        ctx.beginPath();
        ctx.moveTo(rx + rr, ry);
        ctx.lineTo(rx + pw - rr, ry);
        ctx.quadraticCurveTo(rx + pw, ry, rx + pw, ry + rr);
        ctx.lineTo(rx + pw, ry + ph - rr);
        ctx.quadraticCurveTo(rx + pw, ry + ph, rx + pw - rr, ry + ph);
        ctx.lineTo(rx + rr, ry + ph);
        ctx.quadraticCurveTo(rx, ry + ph, rx, ry + ph - rr);
        ctx.lineTo(rx, ry + rr);
        ctx.quadraticCurveTo(rx, ry, rx + rr, ry);
        ctx.closePath();

        const g = ctx.createRadialGradient(cx + ox, cy + oy, 0, cx + ox, cy + oy, pw * 0.6);
        g.addColorStop(0, `rgba(255,255,255,${alpha * 1.8})`);
        g.addColorStop(0.6, `rgba(255,255,255,${alpha * 0.5})`);
        g.addColorStop(1, `rgba(255,255,255,0)`);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle = `rgba(255,255,255,${alpha * 2.5})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.restore();
      }

      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 240);
      cg.addColorStop(0, "rgba(255,255,255,0.06)");
      cg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = cg;
      ctx.fillRect(0, 0, w, h);
    };

    const loop = (t: number) => {
      draw(t);
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="hero-canvas"
    />
  );
}
