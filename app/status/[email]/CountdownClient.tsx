"use client";

import { useState, useEffect } from "react";
import { Check } from "lucide-react";

export default function CountdownClient({ startTime, endTime, durationDays }: { startTime: string, endTime: string, durationDays: number }) {
  const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const end = new Date(endTime).getTime();
      const now = new Date().getTime();
      const difference = end - now;

      if (difference > 0) {
        setTimeLeft({
          d: Math.floor(difference / (1000 * 60 * 60 * 24)),
          h: Math.floor((difference / (1000 * 60 * 60)) % 24),
          m: Math.floor((difference / 1000 / 60) % 60),
          s: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft(null); // Expired
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  if (!timeLeft) {
    return (
       <div className="space-y-6">
        <h2 className="text-2xl font-bold text-red-400">หมดอายุหรือกำลังอัปเดตสถานะ...</h2>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">รีเฟรช</button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-[var(--color-primary)] mb-6 text-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center shrink-0 border border-[var(--color-primary)]/30">
            <Check className="w-5 h-5" />
          </div>
          <span className="font-black text-xl sm:text-2xl tracking-tight">เปิดใช้งานแล้ว</span>
        </div>
        <span className="text-sm sm:text-lg font-bold opacity-70 bg-white/5 px-4 py-1 rounded-full border border-white/5 whitespace-nowrap">
          แพ็กเกจ {durationDays} วัน
        </span>
      </div>

      <div className="grid grid-cols-4 gap-4 md:gap-8 max-w-3xl mx-auto">
        {[
          { label: 'วัน', val: timeLeft.d, color: 'from-blue-500/10' },
          { label: 'ชั่วโมง', val: timeLeft.h, color: 'from-purple-500/10' },
          { label: 'นาที', val: timeLeft.m, color: 'from-pink-500/10' },
          { label: 'วินาที', val: timeLeft.s, color: 'from-orange-500/10' }
        ].map((time, i) => (
          <div key={i} className="flex flex-col items-center group">
            <div className="glass w-full aspect-square md:aspect-auto md:h-32 rounded-[32px] flex flex-col items-center justify-center relative overflow-hidden border border-white/10 group-hover:border-[var(--color-primary)]/30 transition-all duration-500 bg-white/5 shadow-2xl">
              <div className={`absolute inset-0 bg-gradient-to-t ${time.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <span className="text-4xl md:text-5xl font-mono font-black text-white relative z-10 tracking-tighter tabular-nums drop-shadow-2xl">
                {time.val.toString().padStart(2, '0')}
              </span>
              
              <div className="absolute top-2 right-4 w-1 h-1 rounded-full bg-white/20" />
              <div className="absolute bottom-2 left-4 w-1 h-1 rounded-full bg-white/20" />
            </div>
            <span className="mt-4 text-xs md:text-sm font-bold text-gray-500 uppercase tracking-[0.2em] group-hover:text-white transition-colors duration-300">{time.label}</span>
          </div>
        ))}
      </div>

      <p className="text-gray-500 mt-8 font-mono text-sm">
        สิ้นสุด: {new Date(endTime).toLocaleString('th-TH')}
      </p>
    </div>
  );
}
