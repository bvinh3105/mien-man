"use client";

import { useEffect, useState } from "react";

export default function HeroMotion() {
  const [loopKey, setLoopKey] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setLoopKey((k) => k + 1), 7000);
    return () => clearInterval(t);
  }, []);

  return (
    <div key={loopKey} className="relative w-full aspect-[4/3] bg-sage-50 rounded-3xl overflow-hidden">
      {/* Background hoop / khung thêu decorative */}
      <div className="absolute inset-6 rounded-full border-2 border-dashed border-sage-200 opacity-40" />
      <div className="absolute inset-12 rounded-full border border-sage-200 opacity-30" />

      {/* Card 1 — canvas fabric background (delay 0) */}
      <div
        className="mm-pop absolute left-[8%] top-[15%] w-[42%] aspect-[4/5] bg-cream rounded-2xl shadow-lg border border-sage-100"
        style={{ animationDelay: "0.1s", ["--mm-rot" as string]: "-4deg" }}
      >
        <div className="absolute inset-3 border border-dashed border-sage-300 rounded-xl flex items-center justify-center">
          <svg className="mm-stitch w-24 h-24 text-sage-500" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M20 60 Q30 20, 50 40 T80 60" strokeDasharray="4 4" />
            <path d="M30 75 L40 65 L50 75 L60 65 L70 75" strokeDasharray="3 3" />
          </svg>
        </div>
        <div className="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-sage-400 border-2 border-white" />
        <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-sage-400 border-2 border-white" />
        <div className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-sage-400 border-2 border-white" />
        <div className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-sage-400 border-2 border-white" />
      </div>

      {/* Card 2 — bag mockup (delay 0.35) */}
      <div
        className="mm-pop absolute right-[8%] top-[10%] w-[38%] aspect-square bg-sage-700 rounded-2xl shadow-xl overflow-hidden"
        style={{ animationDelay: "0.55s", ["--mm-rot" as string]: "5deg" }}
      >
        <div className="absolute top-0 left-1/4 w-2 h-8 bg-sage-800" />
        <div className="absolute top-0 right-1/4 w-2 h-8 bg-sage-800" />
        <div className="absolute inset-6 top-10 rounded-xl border-2 border-dashed border-cream/40 flex items-center justify-center">
          <span className="font-display italic text-cream text-2xl leading-none text-center">
            Miên<br />Man
          </span>
        </div>
      </div>

      {/* Card 3 — small floating thread spool (delay 0.7) */}
      <div
        className="mm-pop absolute left-[35%] bottom-[12%] w-[22%] aspect-square"
        style={{ animationDelay: "0.9s", ["--mm-rot" as string]: "-8deg" }}
      >
        <div className="mm-float w-full h-full">
          <div className="w-full h-full bg-white rounded-2xl shadow-lg border border-sage-100 flex items-center justify-center relative overflow-hidden">
            {/* thread reel */}
            <div className="w-3/4 aspect-square rounded-full bg-gradient-to-br from-sage-300 to-sage-500 relative">
              <div className="absolute inset-[15%] rounded-full bg-cream" />
              <div className="absolute inset-[35%] rounded-full bg-sage-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Card 4 — DIY hoop kit (delay 1.0) */}
      <div
        className="mm-pop absolute right-[6%] bottom-[8%] w-[30%] aspect-square"
        style={{ animationDelay: "1.15s", ["--mm-rot" as string]: "6deg" }}
      >
        <div className="mm-float w-full h-full" style={{ animationDelay: "1s" }}>
          <div className="w-full h-full bg-cream rounded-full shadow-xl border-8 border-sage-600 flex items-center justify-center relative">
            <svg className="w-16 h-16 text-sage-500" viewBox="0 0 100 100" fill="currentColor">
              <path d="M50 20 Q60 40 50 50 Q40 40 50 20 Z" />
              <path d="M35 45 Q45 55 40 65 Q30 55 35 45 Z" opacity="0.7" />
              <path d="M65 45 Q75 55 60 65 Q55 55 65 45 Z" opacity="0.7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Card 5 — needle popup label (delay 1.3) */}
      <div
        className="mm-pop absolute left-[6%] bottom-[5%] bg-white rounded-full shadow-lg border border-sage-100 px-3 py-2 flex items-center gap-2"
        style={{ animationDelay: "1.4s" }}
      >
        <div className="w-6 h-6 rounded-full bg-sage-500 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2 L11 8 L18 10 L11 12 L10 18 L9 12 L2 10 L9 8 Z" />
          </svg>
        </div>
        <span className="text-[10px] font-medium text-sage-700 uppercase tracking-wider">Thủ công</span>
      </div>

      {/* Card 6 — price/sold badge (delay 1.5) */}
      <div
        className="mm-pop absolute right-[2%] top-[45%] bg-sage-500 text-white rounded-2xl shadow-xl px-4 py-3 rotate-6"
        style={{ animationDelay: "1.6s", ["--mm-rot" as string]: "6deg" }}
      >
        <p className="text-[9px] uppercase tracking-widest opacity-80">Đã đặt</p>
        <p className="font-display text-lg font-bold leading-none">720.000đ</p>
      </div>

      {/* Card 7 — small sparkle (delay 1.7) */}
      <div
        className="mm-pop absolute left-[46%] top-[8%] w-8 h-8"
        style={{ animationDelay: "1.75s" }}
      >
        <svg className="w-full h-full text-sage-400" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" />
        </svg>
      </div>

      {/* Spotlight ring pulse */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ animation: "mmSpotlight 3s ease-in-out infinite", animationDelay: "1.8s" }}
      >
        <div className="absolute left-1/2 top-1/2 w-32 h-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sage-300/20 blur-2xl" />
      </div>
    </div>
  );
}
