"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { MessageCircle, CheckCircle2 } from 'lucide-react';
import RefreshButton from './RefreshButton';
import { useParams, useRouter } from 'next/navigation';

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
      console.log("Checking for status updates...");
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
      <div className="space-y-6 py-8 animate-in fade-in duration-500">
        <div className="w-20 h-20 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto shadow-[0_0_30px_var(--color-primary)]"></div>
        <h2 className="text-2xl font-bold text-[var(--color-primary)]">รอการอนุมัติ (Pending)</h2>
        <p className="text-lg text-gray-400 max-w-md mx-auto leading-relaxed">
          ระบบได้รับคำสั่งซื้อแพ็กเกจ <strong className="text-white bg-white/10 px-2 py-0.5 rounded">
            {durationDays === 180 ? 'ครึ่งปี (180 วัน)' : durationDays === 365 ? 'รายปี (365 วัน)' : durationDays === 30 ? 'รายเดือน (30 วัน)' : `${durationDays} วัน`}
          </strong> ของคุณแล้ว<br/>
          กรุณารอแอดมินดำเนินการอัปเกรดบัญชี (เวลาใช้งานจะเริ่มนับหลังจากเปิดใช้งาน)
        </p>
        
        <div className="bg-black/40 rounded-xl p-4 mt-6 text-sm text-gray-500 inline-block border border-white/5">
          สถานะจะอัปเดตอัตโนมัติเมื่อแอดมินอนุมัติ 
          <RefreshButton />
        </div>

        <div className="pt-4">
          <button 
            onClick={() => {
              setHasPaid(false);
              if (typeof window !== 'undefined' && email) {
                localStorage.setItem(`hasPaid_${email}`, 'false');
              }
            }}
            className="text-sm text-gray-500 hover:text-white underline decoration-white/20 hover:decoration-white transition-all underline-offset-4"
          >
            ลืมส่งสลิป? ย้อนกลับไปหน้าชำระเงิน
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white">กรุณาชำระเงิน</h2>
        <p className="text-gray-400">สแกน QR Code ด้านล่างเพื่อชำระเงินสำหรับแพ็กเกจ {durationDays === 180 ? 'ครึ่งปี (180 วัน)' : durationDays === 365 ? 'รายปี (365 วัน)' : durationDays === 30 ? 'รายเดือน (30 วัน)' : `${durationDays} วัน`}</p>
      </div>

      <div className="mx-auto flex justify-center">
        <Image 
          src="/qrcode.png" 
          alt="Payment QR Code" 
          width={400}
          height={400}
          className="w-full max-w-[280px] sm:max-w-[320px] h-auto rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.1)]"
          unoptimized
        />
      </div>

      <div className="flex flex-col gap-4 max-w-sm mx-auto pt-4">
        <a 
          href="https://m.me/BomWorapon" 
          target="_blank" 
          rel="noopener noreferrer"
          onClick={toggleMessenger}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-[#0084FF] hover:bg-[#0073e6] text-white text-lg font-bold rounded-2xl transition-all hover:scale-105 shadow-[0_10px_20px_rgba(0,132,255,0.3)]"
        >
          <MessageCircle className="w-6 h-6" />
          ส่งสลิปที่นี่ (Messenger)
        </a>

        <button 
          onClick={togglePaid}
          disabled={!hasClickedMessenger}
          className={`flex items-center justify-center gap-2 px-8 py-4 rounded-2xl transition-all border ${
            hasClickedMessenger 
              ? 'bg-white/5 hover:bg-white/10 text-white font-bold border-white/10 cursor-pointer shadow-lg' 
              : 'bg-transparent text-gray-600 font-medium border-white/5 cursor-not-allowed'
          }`}
        >
          <CheckCircle2 className={`w-5 h-5 ${hasClickedMessenger ? 'text-green-500' : 'text-gray-700'}`} />
          ฉันส่งสลิปเรียบร้อยแล้ว
        </button>
      </div>
    </div>
  );
}