'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Check, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'success' | 'warning';
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'ยืนยัน',
  cancelText = 'ยกเลิก',
  type = 'warning'
}: ConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Background Glow */}
            <div className={`absolute -top-24 -left-24 w-48 h-48 rounded-full blur-[80px] opacity-20 ${
              type === 'danger' ? 'bg-red-500' : type === 'success' ? 'bg-green-500' : 'bg-[var(--color-primary)]'
            }`} />

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 border scale-110 shadow-lg ${
                type === 'danger' 
                  ? 'bg-red-500/10 border-red-500/20 text-red-500 shadow-red-500/10' 
                  : type === 'success'
                  ? 'bg-green-500/10 border-green-500/20 text-green-500 shadow-green-500/10'
                  : 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/20 text-[var(--color-primary)] shadow-[var(--color-primary)]/10'
              }`}>
                {type === 'danger' ? <AlertCircle className="w-10 h-10" /> : type === 'success' ? <Check className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
              </div>

              <h3 className="text-2xl font-black text-white mb-2 tracking-tight">{title}</h3>
              <p className="text-gray-400 mb-8 leading-relaxed">{message}</p>

              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all border border-white/10"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`flex-1 px-6 py-4 rounded-2xl font-black transition-all shadow-xl active:scale-95 ${
                    type === 'danger'
                      ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20'
                      : 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white shadow-[var(--color-primary)]/20'
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
            
            {/* Close button */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
