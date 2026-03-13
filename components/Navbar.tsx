'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { User, LogIn, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const [session, setSession] = useState<{ isLoggedIn: boolean; role: string | null }>({
    isLoggedIn: false,
    role: null
  });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        console.log('NAVBAR_SESSION_DEBUG:', data);
        setSession({
          isLoggedIn: !!data.user,
          role: data.user?.role || null
        });
      } catch (e) {
        setSession({ isLoggedIn: false, role: null });
      }
    };
    checkAuth();
  }, [pathname]);

  console.log('NAVBAR_RENDER_STATE:', { session, pathname });

  // Hide navbar on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] p-4 md:p-6 flex justify-center pointer-events-none">
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`pointer-events-auto px-4 md:px-8 py-2 md:py-3 rounded-full border border-white/10 flex items-center gap-3 md:gap-6 shadow-2xl transition-all duration-300 ${
          scrolled ? 'bg-black/80 backdrop-blur-xl md:py-2 md:gap-8' : 'bg-black/40 md:bg-white/5 backdrop-blur-md'
        }`}
      >
        <Link href="/" className="group flex items-center">
          <Image 
            src="/icon.png" 
            alt="Raycast Logo" 
            width={40} 
            height={40} 
            className="w-10 h-10 object-contain group-hover:scale-110 transition-transform flex-shrink-0"
          />
        </Link>
        
        <div className="h-4 w-[1px] bg-white/10" />

        <div className="flex items-center gap-3 md:gap-6">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors text-xs md:text-sm font-medium whitespace-nowrap">
            หน้าหลัก
          </Link>

          {session.isLoggedIn && session.role === 'admin' && (
            <Link href="/admin" className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all text-xs md:text-sm font-bold border border-white/10 group whitespace-nowrap">
              <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-[var(--color-primary)]" />
              <span>Admin</span>
            </Link>
          )}
          
          {session.isLoggedIn ? (
            <Link href="/dashboard" className="flex items-center gap-1.5 md:gap-2 px-4 py-2 md:px-6 md:py-2.5 bg-[var(--color-primary)] text-black hover:scale-105 rounded-full transition-all text-xs md:text-sm font-black shadow-[0_0_20px_var(--color-primary)]/40 relative group overflow-hidden whitespace-nowrap">
               <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
               <LayoutDashboard className="w-3.5 h-3.5 md:w-4 md:h-4 relative z-10" />
               <span className="relative z-10">เช็คเวลา</span>
               <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-black animate-pulse relative z-10 ml-1" />
            </Link>
          ) : (
            <Link href="/login" className="flex items-center gap-1.5 md:gap-2 px-5 py-2 md:px-6 md:py-2.5 bg-white text-black hover:bg-gray-200 rounded-full transition-all text-xs md:text-sm font-bold shadow-xl whitespace-nowrap">
              <LogIn className="w-3.5 h-3.5 md:w-4 md:h-4" />
              เข้าสู่ระบบ
            </Link>
          )}
        </div>
      </motion.div>
    </nav>
  );
}
