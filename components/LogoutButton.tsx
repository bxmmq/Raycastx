'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LogOut, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (res.ok) {
        setShowToast(true);
        // Wait for animation then redirect
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        setIsLoggingOut(false);
        alert('เกิดข้อผิดพลาดในการออกจากระบบ');
      }
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  const toastContent = (
    <AnimatePresence>
      {showToast && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20, x: "-50%" }}
          animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, scale: 0.9, y: 20, x: "-50%" }}
          className="fixed bottom-12 left-1/2 z-[9999] min-w-[320px] p-1 rounded-[2.5rem] bg-gradient-to-b from-white/20 to-transparent shadow-[0_40px_80px_rgba(0,0,0,0.8)] backdrop-blur-3xl border border-white/10 pointer-events-none"
        >
          <div className="bg-[#0a0a0a]/90 rounded-[2.3rem] p-6 flex items-center gap-5 overflow-hidden relative">
            <div className="w-14 h-14 rounded-3xl bg-green-500/10 flex items-center justify-center border border-green-500/20 relative overflow-hidden group shrink-0">
               <div className="absolute inset-0 bg-green-500/5 animate-pulse" />
               <CheckCircle2 className="w-8 h-8 text-green-500 relative z-10" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-black text-xl tracking-tight">ออกจากระบบแล้ว</span>
              <span className="text-gray-500 text-sm font-medium">กำลังพาคุณกลับหน้าหลักอย่างปลอดภัย...</span>
            </div>
            
            {/* Refined subtle loading bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, ease: "linear" }}
                className="h-full bg-gradient-to-r from-green-500/50 via-green-500 to-green-500/50"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button 
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="flex items-center justify-center gap-2 px-8 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all rounded-2xl border border-red-500/20 font-bold group disabled:opacity-50 w-full sm:w-auto"
      >
        <LogOut className={`w-5 h-5 ${isLoggingOut ? 'animate-pulse' : 'group-hover:-translate-x-1 transition-transform'}`} />
        {isLoggingOut ? 'กำลังออกจากระบบ...' : 'ออกจากระบบ'}
      </button>

      {mounted && createPortal(toastContent, document.body)}
    </>
  );
}
