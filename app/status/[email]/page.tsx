import db from '@/lib/db';
import { notFound } from 'next/navigation';
import CountdownClient from './CountdownClient';
import PendingStatusClient from './PendingStatusClient';

export const dynamic = 'force-dynamic';

export default async function StatusPage({ params }: { params: Promise<{ email: string }> }) {
  const { email } = await params;
  const decodedEmail = decodeURIComponent(email);

  const stmt = db.prepare(`
    SELECT * FROM orders 
    WHERE email = ? 
    ORDER BY created_at DESC LIMIT 1
  `);
  const order = stmt.get(decodedEmail) as any;

  if (!order) {
    notFound();
  }

  return (
    <main className="min-h-screen flex flex-col items-center pt-20 md:pt-28 pb-12 px-4 sm:px-6 bg-[#030303] relative overflow-hidden">
      {/* Premium Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[var(--color-primary)]/15 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[4000ms]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[var(--color-accent)]/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[6000ms]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(0,196,204,0.05)_0%,transparent_70%)] pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        <div className="glass p-6 md:p-10 rounded-[2.5rem] text-center border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.8)] backdrop-blur-3xl relative overflow-hidden">
          {/* Subtle Inner Glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />
          
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-serif font-black mb-6 heading-spacing text-white tracking-tight">
              สถานะการสั่งซื้อ
            </h1>
            
            <div className="flex flex-col items-center gap-2 mb-8 pb-8 border-b border-white/5">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Account Email</span>
              <div className="px-5 py-2 rounded-xl bg-white/[0.03] border border-white/10 shadow-inner group transition-all hover:border-[var(--color-primary)]/30">
                <span className="text-base md:text-lg text-white font-bold tracking-tight">
                  {order.email}
                </span>
              </div>
            </div>

            <div className="min-h-[250px] flex flex-col justify-center">
              {order.status === 'pending' && (
                <PendingStatusClient durationDays={order.duration_days} />
              )}

              {order.status === 'active' && (
                <div className="space-y-10 py-4">
                  <CountdownClient 
                    startTime={order.start_time} 
                    endTime={order.end_time} 
                    durationDays={order.duration_days} 
                  />

                  {order.password && (
                    <div className="bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 rounded-[2.5rem] p-8 md:p-10 mt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                      <div className="flex flex-col items-center gap-6">
                        <div className="space-y-1">
                          <p className="text-xs font-black text-[var(--color-primary)] uppercase tracking-[0.2em]">Access Granted</p>
                          <h3 className="text-xl font-bold text-white">บัญชีของคุณพร้อมใช้งานแล้ว</h3>
                        </div>
                        
                        <div className="w-full space-y-3">
                          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Your Secret Password:</span>
                          <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
                            <div className="relative bg-[#0a0a0a] border border-white/10 px-8 py-5 rounded-2xl text-2xl md:text-3xl font-black text-white shadow-2xl tracking-wider">
                              {order.password}
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-[11px] text-gray-500 italic max-w-[200px] leading-relaxed">
                          * กรุณาเก็บรหัสผ่านเป็นความลับสูงสุดเพื่อความปลอดภัยของบัญชี
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {order.status === 'expired' && (
                <div className="space-y-8 py-10 animate-in zoom-in-95 duration-500">
                  <div className="w-24 h-24 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto border border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.2)]">
                    <span className="text-5xl font-black italic">!</span>
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-3xl font-black text-white">แพ็กเกจหมดอายุ</h2>
                    <p className="text-gray-400 text-lg leading-relaxed">
                      เวลาการใช้งาน Canva Pro ของคุณสิ้นสุดลงแล้ว <br/> 
                      ต่ออายุเพื่อใช้งานฟีเจอร์พรีเมียมต่อได้ทันที
                    </p>
                  </div>
                  <a href="/" className="inline-flex px-12 py-5 bg-white text-black font-black text-lg rounded-2xl transition-all hover:scale-105 shadow-[0_20px_40px_rgba(255,255,255,0.2)]">
                    ต่ออายุแพ็กเกจใหม่
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <a href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-all text-sm font-bold group">
            <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> กลับหน้าหลัก
          </a>
        </div>
      </div>
    </main>
  );
}
