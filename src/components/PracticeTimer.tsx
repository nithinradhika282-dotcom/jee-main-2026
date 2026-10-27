"use client";

import React, { useState, useEffect } from "react";
import { Timer } from "lucide-react";

interface PracticeTimerProps {
  active: boolean;
  resetKey: string | number;
  onTick?: (seconds: number) => void;
}

export const PracticeTimer = React.memo(function PracticeTimer({
  active,
  resetKey,
  onTick,
}: PracticeTimerProps) {
  const [seconds, setSeconds] = useState(0);

  // Reset timer whenever resetKey changes (new question)
  useEffect(() => {
    setSeconds(0);
    if (onTick) onTick(0);
  }, [resetKey, onTick]);

  // Tick interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (active) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          const next = prev + 1;
          if (onTick) onTick(next);
          return next;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [active, onTick]);

  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const formatted = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;

  return (
    <div className="flex items-center gap-1 text-[11px] font-mono bg-slate-800 text-sky-300 px-2 py-0.5 rounded border border-slate-700">
      <Timer size={12} className={active ? "animate-pulse" : ""} />
      <span>{formatted}</span>
    </div>
  );
});

export default PracticeTimer;
