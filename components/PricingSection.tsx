"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, LogIn, ArrowRight, ShieldCheck, Loader2, CheckCircle2, Sparkles, Zap, Crown, Star } from "lucide-react";
import Link from "next/link";

export type Pricing = {
  [duration: string]: number;
};

const getIconForDays = (days: string) => {
  switch (days) {
    case "1": return <Zap className="w-5 h-5" />;
    case "7": return <Star className="w-5 h-5" />;
    case "30": return <Sparkles className="w-5 h-5" />;
    case "365": return <Crown className="w-5 h-5" />;
    default: return <CheckCircle2 className="w-5 h-5" />;
  }
};

export default function PricingSection({ pricing, session }: { pricing: Pricing, session: any }) {
  const [selectedDuration, setSelectedDuration] = useState<string>("30");
  const userEmail = session?.user?.email || "";
  const [email, setEmail] = useState(userEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (userEmail) setEmail(userEmail);
  }, [userEmail]);

  // Ensure selectedDuration is valid initially
  useEffect(() => {
    if (pricing && !pricing[selectedDuration] && Object.keys(pricing).length > 0) {
       setSelectedDuration(Object.keys(pricing)[0]);
    }
  }, [pricing, selectedDuration]);

  const durationLabels: Record<string, string> = {
    "1": "รายวัน (1 วัน)",
    "7": "รายสัปดาห์ (7 วัน)",
    "30": "รายเดือน (30 วัน)",
    "180": "ครึ่งปี (180 วัน)",
    "365": "รายปี (365 วัน)",
  };

  const getLabel = (days: string) => durationLabels[days] || `${days} วัน`;

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, duration_days: parseInt(selectedDuration) })
      });
      
      if (res.ok) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(`hasPaid_${email}`);
          localStorage.removeItem(`hasClickedMessenger_${email}`);
        }
        window.location.href = `/status/${encodeURIComponent(email)}`;
      } else {
        const data = await res.json();
        setErrorMessage(data.error || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="pricing" className="relative py-32 px-4 md:px-8 w-full max-w-7xl mx-auto overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[var(--color-primary)]/10 blur-[150px] rounded-[100%] pointer-events-none" />

      <div className="text-center mb-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm font-bold mb-6"
        >
          <Sparkles className="w-4 h-4" />
          <span>คุ้มค่าที่สุดในตลาด</span>
        </motion.div>
        <motion.h2 
          className="text-4xl md:text-6xl font-serif font-black heading-spacing mb-6 text-white"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.1 }}
        >
          เลือกแพ็กเกจที่ <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]">เหมาะสมกับคุณ</span>
        </motion.h2>
        <motion.p
          className="text-gray-400 text-lg max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          อัปเกรดบัญชีส่วนตัวของคุณให้เป็นพรีเมียม สนุกกับฟีเจอร์ทุกอย่างของ Canva Pro อย่างเต็มรูปแบบในราคาที่เอื้อมถึง
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start relative z-10">
        
        {/* Pricing Options */}
        <div className="lg:col-span-7 space-y-5">
          {Object.entries(pricing).sort((a,b) => parseInt(a[0]) - parseInt(b[0])).map(([days, price], index) => {
            const isSelected = selectedDuration === days;
            const isPopular = days === "30";

            return (
              <motion.div
                key={days}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => setSelectedDuration(days)}
                className={`relative p-1 rounded-3xl cursor-pointer transition-all duration-500 group ${
                  isSelected ? 'scale-[1.02] shadow-[0_20px_50px_rgba(var(--color-primary-rgb),0.2)]' : 'hover:scale-[1.01]'
                }`}
              >
                {/* Border Gradient (Only visible when selected) */}
                <div className={`absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] opacity-0 transition-opacity duration-500 rounded-3xl ${isSelected ? 'opacity-100' : 'group-hover:opacity-50'}`} />
                
                {/* Card Content */}
                <div className={`relative flex flex-row justify-between items-center h-full p-4 sm:p-8 rounded-[1.4rem] backdrop-blur-xl transition-colors duration-500 ${
                  isSelected ? 'bg-[#0f0f13] border-transparent' : 'bg-white/[0.02] border border-white/10 group-hover:bg-white/[0.05]'
                }`}>
                  
                  {isPopular && (
                    <div className="absolute top-0 sm:-top-3 right-4 sm:right-8 -translate-y-1/2 sm:translate-y-0 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-[9px] sm:text-xs font-black px-3 py-1 sm:px-4 sm:py-1.5 rounded-full shadow-xl text-white uppercase tracking-wider z-20">
                      ยอดนิยม (Best Value)
                    </div>
                  )}

                  <div className="flex items-center gap-3 sm:gap-6 min-w-0 flex-1">
                    <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-colors duration-500 shrink-0 ${
                      isSelected ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]' : 'bg-white/5 text-gray-400 group-hover:text-white'
                    }`}>
                      {getIconForDays(days)}
                    </div>
                    <div className="min-w-0 pr-2">
                      <h3 className={`text-base sm:text-2xl font-bold font-serif sm:mb-1 truncate transition-colors duration-500 ${isSelected ? 'text-white' : 'text-gray-200 group-hover:text-white'}`}>
                        {getLabel(days)}
                      </h3>
                      <p className={`text-[10px] sm:text-sm truncate transition-colors duration-500 ${isSelected ? 'text-gray-300' : 'text-gray-500 group-hover:text-gray-400'}`}>
                        อัปเกรดบัญชีเดิมของคุณทันที
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-baseline justify-end gap-0.5 sm:gap-1">
                      <span className="text-sm sm:text-lg text-gray-500 font-bold mb-0.5 sm:mb-1">฿</span>
                      <span className={`text-2xl sm:text-4xl font-black tracking-tight transition-colors duration-500 ${isSelected ? 'text-[var(--color-primary)]' : 'text-white'}`}>
                        {price}
                      </span>
                    </div>
                    {isSelected && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }} 
                        className="text-[9px] sm:text-[11px] text-[var(--color-primary)] font-medium sm:mt-1"
                      >
                        ✔ เลือกแล้ว
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Checkout Form */}
        <div className="lg:col-span-5 relative">
          <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ duration: 0.6, delay: 0.3 }}
             className="sticky top-28 rounded-[2.5rem] bg-gradient-to-b from-white/10 to-white/5 p-[1px] shadow-2xl"
          >
            <div className="bg-[#0a0a0c] p-8 sm:p-10 rounded-[2.4rem] relative overflow-hidden backdrop-blur-3xl h-full">
              
              {/* Checkout Glow */}
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-[var(--color-primary)]/20 rounded-full blur-[80px] pointer-events-none" />

              <h3 className="text-2xl sm:text-3xl font-black font-serif mb-8 text-white flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-[var(--color-primary)]" />
                สรุปคำสั่งซื้อ
              </h3>
              
              {!session ? (
                <div className="py-10 flex flex-col items-center text-center space-y-6">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                    <Lock className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-2">คุณยังไม่ได้เข้าสู่ระบบ</h4>
                    <p className="text-gray-400 text-sm max-w-[250px] mx-auto">
                      เข้าสู่ระบบหรือสมัครสมาชิก เพื่อดำเนินการสั่งซื้อแพ็กเกจ
                    </p>
                  </div>
                  <div className="w-full space-y-3 pt-4">
                    <Link 
                      href="/login" 
                      className="w-full py-4 bg-[var(--color-primary)] text-black text-lg font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_10px_30px_rgba(var(--color-primary-rgb),0.3)] flex items-center justify-center gap-2"
                    >
                      เข้าสู่ระบบเลย
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link href="/register" className="w-full py-4 bg-white/5 text-white text-sm font-bold rounded-2xl hover:bg-white/10 transition-colors flex items-center justify-center border border-white/10">
                      สร้างบัญชีใหม่
                    </Link>
                  </div>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedDuration}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between items-center p-5 rounded-2xl bg-white/5 border border-white/5">
                        <span className="text-gray-400 text-sm font-medium">แพ็กเกจที่เลือก</span>
                        <span className="font-bold text-lg text-white">{getLabel(selectedDuration)}</span>
                      </div>
                      <div className="flex justify-between items-center p-5 rounded-2xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--color-primary)]/5 to-transparent animate-[shimmer_2s_infinite]" />
                        <span className="text-gray-300 font-bold text-sm relative z-10">ยอดที่ต้องชำระ</span>
                        <div className="relative z-10 flex items-baseline gap-1">
                          <span className="font-black text-3xl text-white">{pricing[selectedDuration]}</span>
                          <span className="text-[var(--color-primary)] font-bold text-sm">THB</span>
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleOrder} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                          บัญชีที่จะอัปเกรด (Canva Pro)
                        </label>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            readOnly
                            value={email}
                            className="w-full pl-12 pr-12 py-4 rounded-2xl bg-black/60 border border-white/10 text-white font-medium outline-none cursor-not-allowed opacity-80"
                          />
                          <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                        </div>
                        {errorMessage && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold flex items-start gap-2"
                          >
                            <span className="shrink-0 mt-0.5">⚠️</span> {errorMessage}
                          </motion.div>
                        )}
                      </div>
                      
                      <button
                        type="submit"
                        disabled={isSubmitting || !pricing[selectedDuration]}
                        className="w-full py-5 bg-white text-black text-lg font-black rounded-2xl relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_15px_30px_rgba(255,255,255,0.15)] hover:scale-[1.02] active:scale-95 transition-all"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {isSubmitting ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> กำลังสร้างรายการ...</>
                          ) : (
                            <><Lock className="w-5 h-5" /> ชำระเงินอย่างปลอดภัย</>
                          )}
                        </span>
                      </button>
                      
                      <div className="text-center pt-2">
                        <p className="text-[10px] text-gray-500 leading-relaxed">
                          *ระบบจะนำคุณไปสู่หน้าชำระเงิน การอัปเกรดจะเสร็จสิ้นภายใน 5-15 นาทีหลังจากชำระเงินสำเร็จ
                        </p>
                      </div>
                    </form>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
