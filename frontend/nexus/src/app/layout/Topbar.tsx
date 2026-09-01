"use client";

import { Bell } from "lucide-react";
import { useEffect, useState } from "react";

export default function Topbar() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString("en-GB"));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-12 bg-[#0B1E3A] text-white flex items-center justify-between px-8 text-xs font-mono">
      <div className="flex items-center gap-5 text-white/50">
        <span>BEIRUT / 33.8938° N 35.5018° E</span>
        <span className="text-white/20">|</span>
        <span>SYNC {time}</span>
      </div>

      <div className="flex items-center gap-4 font-sans">
        <button className="text-white/50 hover:text-white">
          <Bell size={16} />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="text-right">
            <div className="text-xs font-medium leading-none">Maya Aoun</div>
            <div className="text-[10px] text-white/40 mt-1 tracking-wide">OPS · ADMIN</div>
          </div>
          <div className="w-7 h-7 rounded-full bg-[#3F84E5] flex items-center justify-center text-[11px] font-semibold">
            MA
          </div>
        </div>
      </div>
    </header>
  );
}