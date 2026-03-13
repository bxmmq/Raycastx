"use client";

import React from 'react';

export default function PayButton() {
  return (
    <div className="pt-4">
      <button 
        className="px-10 py-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.3)] hover:scale-105 transition-all flex items-center gap-3 mx-auto group"
        onClick={() => alert("ระบบจ่ายเงินกำลังอยู่ระหว่างการพัฒนา กรุณาแจ้งหลักฐานการโอนเงินทาง Line แอดมิน")}
      >
        <svg className="w-6 h-6 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        จ่ายเงิน
      </button>
    </div>
  );
}
