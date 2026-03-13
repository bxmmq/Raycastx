'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock as LockIcon, Loader2, ArrowRight, User } from 'lucide-react';
import Link from 'next/link';

interface AuthFormProps {
  type: 'login' | 'register';
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export default function AuthForm({ type, onSubmit, loading, error }: AuthFormProps) {
  const [formData, setFormData] = useState({
    first_name: '',
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="w-full max-w-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="glass p-10 rounded-[40px] border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.4)] relative overflow-hidden bg-white/[0.02]"
      >
        {/* Background Accents */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[var(--color-primary)]/20 rounded-full blur-[60px] pointer-events-none animate-pulse" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-[60px] pointer-events-none" />

        <div className="relative z-10">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-4xl font-serif font-black mb-3 text-white tracking-tight">
              {type === 'login' ? 'ยินดีต้อนรับกลับ' : 'สร้างบัญชีใหม่'}
            </h2>
            <div className="h-1.5 w-12 bg-[var(--color-primary)] rounded-full mb-4 shadow-[0_0_15px_var(--color-primary)] mx-auto md:ml-0" />
            <p className="text-gray-400 text-lg leading-relaxed">
              {type === 'login'
                ? 'เข้าสู่ระบบเพื่อจัดการพ็กเกจของคุณ'
                : 'รับสิทธิ์เข้าถึง Canva Pro ในราคาพิเศษ'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
              className="space-y-6"
            >
              {type === 'register' && (
                <motion.div
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0 },
                  }}
                  className="space-y-2.5"
                >
                  <label className="text-sm font-bold text-gray-400 ml-2 uppercase tracking-widest">ชื่อจริงไทย (ไม่ต้องใส่นามสกุล)</label>
                  <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[var(--color-primary)] transition-all duration-300" />
                    <input
                      type="text"
                      name="first_name"
                      required
                      placeholder="เช่น: สมชาย"
                      className="w-full bg-white/5 border border-white/10 rounded-[22px] py-5 pl-14 pr-6 text-white text-lg focus:outline-none focus:border-[var(--color-primary)]/50 focus:ring-4 focus:ring-[var(--color-primary)]/10 transition-all placeholder:text-gray-600"
                      value={formData.first_name}
                      onChange={handleChange}
                    />
                  </div>
                </motion.div>
              )}

              <motion.div
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 },
                }}
                className="space-y-2.5"
              >
                <label className="text-sm font-bold text-gray-400 ml-2 uppercase tracking-widest">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[var(--color-primary)] transition-all duration-300" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="name@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-[22px] py-5 pl-14 pr-6 text-white text-lg focus:outline-none focus:border-[var(--color-primary)]/50 focus:ring-4 focus:ring-[var(--color-primary)]/10 transition-all placeholder:text-gray-600"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 },
                }}
                className="space-y-2.5"
              >
                <label className="text-sm font-bold text-gray-400 ml-2 uppercase tracking-widest">Password</label>
                <div className="relative group">
                  <LockIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[var(--color-primary)] transition-all duration-300" />
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-[22px] py-5 pl-14 pr-6 text-white text-lg focus:outline-none focus:border-[var(--color-primary)]/50 focus:ring-4 focus:ring-[var(--color-primary)]/10 transition-all placeholder:text-gray-600"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </motion.div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-red-400 text-sm bg-red-400/10 p-4 rounded-2xl border border-red-400/20 text-center font-medium"
                >
                  {error}
                </motion.div>
              )}

              <motion.button
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black font-black py-5 rounded-[22px] hover:bg-gray-100 transition-all relative flex items-center justify-center group overflow-hidden shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span className="relative z-10 flex items-center gap-3 text-xl">
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      {type === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิกฟรี'}
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                    </>
                  )}
                </span>
              </motion.button>
            </motion.div>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            {type === 'login' ? (
              <p className="text-gray-400 text-lg">
                ยังไม่มีบัญชี?{' '}
                <Link href="/register" className="text-white font-black hover:text-[var(--color-primary)] transition-colors inline-flex items-center gap-1 group">
                  สมัครสมาชิก
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </p>
            ) : (
              <p className="text-gray-400 text-lg">
                มีบัญชีอยู่แล้ว?{' '}
                <Link href="/login" className="text-white font-black hover:text-[var(--color-primary)] transition-colors inline-flex items-center gap-1 group">
                  เข้าสู่ระบบ
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
