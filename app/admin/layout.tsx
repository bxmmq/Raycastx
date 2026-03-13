'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Settings, Home, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: '/admin', icon: LayoutDashboard, label: 'คำสั่งซื้อ (Orders)' },
    { href: '/admin/pricing', icon: Settings, label: 'จัดการราคาโพร' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col md:flex-row text-white font-sans">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#111] border-b border-[#222] sticky top-0 z-40">
        <Link href="/" className="text-lg font-bold font-serif flex items-center gap-3">
          <img src="/icon.png" alt="Logo" className="w-6 h-6 object-contain" />
          <div><span className="text-gradient">Raycast</span> Admin</div>
        </Link>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#111] border-r border-[#222] p-6 flex-col h-screen sticky top-0">
        <Link href="/" className="mb-10 text-xl font-bold font-serif heading-spacing px-4 flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img src="/icon.png" alt="Logo" className="w-8 h-8 object-contain" />
          <div><span className="text-gradient">Raycast</span> Admin</div>
        </Link>

        <nav className="space-y-2 flex-grow">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href}
                href={link.href} 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                <link.icon size={20} className={isActive ? 'text-[var(--color-primary)]' : 'text-gray-500'} />
                <span>{link.label}</span>
              </Link>
            )
          })}
          
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors mt-4">
            <Home size={20} />
            <span>กลับสู่หน้าหลัก</span>
          </Link>
        </nav>
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-64 bg-[#111] border-r border-[#222] p-6 flex flex-col z-50 md:hidden shadow-2xl"
            >
              <div className="flex items-center justify-between mb-10">
                <Link href="/" className="text-xl font-bold font-serif flex items-center gap-3">
                  <img src="/icon.png" alt="Logo" className="w-8 h-8 object-contain" />
                  <div><span className="text-gradient">Raycast</span> Admin</div>
                </Link>
                <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>

              <nav className="space-y-2 flex-grow">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link 
                      key={link.href}
                      href={link.href} 
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                      <link.icon size={20} className={isActive ? 'text-[var(--color-primary)]' : 'text-gray-500'} />
                      <span>{link.label}</span>
                    </Link>
                  )
                })}
                
                <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors mt-4">
                  <Home size={20} />
                  <span>กลับสู่หน้าหลัก</span>
                </Link>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 p-4 md:p-10 overflow-y-auto w-full">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
