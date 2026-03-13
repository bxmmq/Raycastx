"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { MessageCircle, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import RefreshButton from './RefreshButton';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function PendingStatusClient({ durationDays }: { durationDays: number }) {
  const params = useParams();
  const router = useRouter();
  const email = params?.email ? decodeURIComponent(params.email as string) : "";
  
  const [hasPaid, setHasPaid] = useState(false);
  const [hasClickedMessenger, setHasClickedMessenger] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load persistence from localStorage
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined' && email) {
      const savedPaid = localStorage.getItem(`hasPaid_${email}`);
      const savedMessenger = localStorage.getItem(`hasClickedMessenger_${email}`);
      if (savedPaid === 'true') setHasPaid(true);
      if (savedMessenger === 'true') setHasClickedMessenger(true);
    }
  }, [email]);

  // Handle auto-refresh every 10 seconds to check for admin activation
  useEffect(() => {
    if (!mounted) return;
    
    const interval = setInterval(() => {
      router.refresh();
    }, 10000);

    return () => clearInterval(interval);
  }, [mounted, router]);

  const togglePaid = () => {
    const newState = !hasPaid;
    setHasPaid(newState);
    if (typeof window !== 'undefined' && email) {
      localStorage.setItem(`hasPaid_${email}`, String(newState));
    }
  };

  const toggleMessenger = () => {
    setHasClickedMessenger(true);
    if (typeof window !== 'undefined' && email) {
      localStorage.setItem(`hasClickedMessenger_${email}`, 'true');
    }
  };

  if (!mounted) return null;

  if (hasPaid) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6 py-4"
      >
        <div className="relative w-20 h-20 mx-auto mb-2">
          <div className="absolute inset-0 bg-[var(--color-primary)]/20 rounded-full blur-xl animate-pulse" />
          <div className="w-full h-full border-4 border-white/5 border-t-[var(--color-primary)] rounded-full animate-spin relative z-10 shadow-[0_0_20px_var(--color-primary)/20]" />
        </div>
        
        <div className="space-y-3">
          <h2 className="text-2xl font-black text-white tracking-tight">รอการอนุมัติ</h2>
          <div className="space-y-2">
            <p className="text-base text-gray-400 max-w-md mx-auto leading-relaxed">
              เราได้รับข้อมูลการชำระเงินของคุณแล้ว <br/>
              แอดมินกำลังเร่งดำเนินการเปิดใช้งานแพ็กเกจ
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[9px] font-black uppercase tracking-widest">
              Processing Order
            </div>
          </div>
        </div>
        
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 mt-6 flex flex-col items-center gap-3">
          <p className="text-xs text-gray-500 font-medium">หน้านี้จะอัปเดตอัตโนมัติเมื่ออนุมัติ</p>
          <div className="flex items-center gap-2">
             <RefreshButton />
          </div>
        </div>

        <div className="pt-4">
          <button 
            onClick={() => {
              setHasPaid(false);
              if (typeof window !== 'undefined' && email) {
                localStorage.setItem(`hasPaid_${email}`, 'false');
              }
            }}
            className="text-[10px] text-gray-600 hover:text-white transition-colors flex items-center gap-2 mx-auto font-bold uppercase tracking-widest group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> ย้อนกลับไปหน้าชำระเงิน
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 py-2"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-white">ขั้นตอนการชำระเงิน</h2>
        <p className="text-gray-400 text-base max-w-sm mx-auto leading-relaxed">
          สแกน QR Code และแจ้งหลักฐานการโอน <br/>
          เพื่อรับสิทธิ์ <span className="text-white font-bold underline decoration-[var(--color-primary)]/50">Canva Pro</span> ทันที
        </p>
      </div>

      <div className="relative group mx-auto max-w-[240px]">
        <div className="absolute -inset-4 bg-gradient-to-r from-[var(--color-primary)]/20 to-[var(--color-accent)]/20 blur-2xl rounded-[3rem] opacity-40 group-hover:opacity-60 transition-opacity duration-700" />
        <div className="relative bg-white rounded-[2rem] shadow-2xl overflow-hidden">
           <Image 
            src="/qrcode.png" 
            alt="Payment QR Code" 
            width={300}
            height={300}
            className="w-full h-auto block"
            unoptimized
          />
        </div>
        {/* Package badge */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-black border border-white/10 px-4 py-1.5 rounded-full shadow-2xl">
           <span className="text-[10px] font-black text-white uppercase tracking-widest whitespace-nowrap">
             Package: {
               durationDays === 1 ? '1 Day' : 
               durationDays === 7 ? '7 Days' : 
               durationDays === 180 ? '180 Days' : 
               durationDays === 365 ? '1 Year' : 
               `${durationDays} Days`
             }
           </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 max-w-sm mx-auto pt-6">
        <a 
          href="https://m.me/BomWorapon" 
          target="_blank" 
          rel="noopener noreferrer"
          onClick={toggleMessenger}
          className="group relative flex items-center justify-center gap-3 px-8 py-4 bg-[#0084FF] text-white text-base font-black rounded-2xl transition-all hover:scale-[1.02] active:scale-95 shadow-[0_15px_30px_rgba(0,132,255,0.3)] overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <MessageCircle className="w-5 h-5 relative z-10" />
          <span className="relative z-10">แจ้งโอนที่ Messenger</span>
        </a>

        <button 
          onClick={togglePaid}
          disabled={!hasClickedMessenger}
          className={`flex items-center justify-center gap-2 px-8 py-4 rounded-2xl transition-all border-2 ${
            hasClickedMessenger 
              ? 'bg-white/5 border-white/10 text-white font-black hover:bg-white/10 cursor-pointer text-sm shadow-xl' 
              : 'bg-transparent border-white/5 text-gray-600 font-bold cursor-not-allowed text-sm'
          }`}
        >
          <CheckCircle2 className={`w-5 h-5 ${hasClickedMessenger ? 'text-green-500' : 'text-gray-800'}`} />
          <span>ส่งสลิปเรียบร้อยแล้ว</span>
          {hasClickedMessenger && <ArrowRight className="w-4 h-4 ml-1 animate-bounce-x" />}
        </button>
      </div>
      
      <div className="flex items-center justify-center gap-2 text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-2">
        <ShieldCheck className="w-3.5 h-3.5" />
        Secure Payment via PromptPay
      </div>
    </motion.div>
  );
}
