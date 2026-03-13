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
    <main className="min-h-screen flex flex-col items-center pt-32 md:pt-40 pb-20 px-4 sm:px-6 bg-[var(--background)] relative overflow-x-hidden">
      {/* Background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--color-primary)]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="glass p-10 rounded-3xl w-full max-w-2xl text-center relative z-10 border-t border-[var(--color-primary)]/30 shadow-2xl">
        <h1 className="text-3xl font-serif font-bold mb-6 heading-spacing">สถานะการสั่งซื้อของคุณ</h1>
        <p className="text-xl text-gray-400 mb-8 border-b border-white/5 pb-6">
          อีเมล: <span className="text-white font-medium bg-white/5 px-3 py-1 rounded-lg ml-2">{order.email}</span>
        </p>

        {order.status === 'pending' && (
          <PendingStatusClient durationDays={order.duration_days} />
        )}

        {order.status === 'active' && (
          <div className="space-y-6">
            <CountdownClient 
              startTime={order.start_time} 
              endTime={order.end_time} 
              durationDays={order.duration_days} 
            />

            {order.password && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <p className="text-sm text-gray-500 mb-2">บัญชีของคุณเตรียมไว้ให้แล้ว</p>
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs text-gray-400 uppercase tracking-wider">รหัสผ่านสำหรับเข้าใช้งาน:</span>
                  <div className="bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 px-6 py-3 rounded-xl text-xl font-bold text-[var(--color-primary)] shadow-[0_0_20px_var(--color-primary)/10]">
                    {order.password}
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 mt-4 italic">* กรุณาเก็บรหัสผ่านเป็นความลับ</p>
              </div>
            )}
          </div>
        )}

        {order.status === 'expired' && (
           <div className="space-y-6 py-8">
            <div className="w-20 h-20 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center text-4xl font-bold mx-auto border-4 border-red-500/50">!</div>
            <h2 className="text-2xl font-bold text-red-400">แพ็กเกจหมดอายุ (Expired)</h2>
            <p className="text-lg text-gray-400">
              แพ็กเกจ Canva Pro ของคุณหมดเวลาการใช้งานแล้ว
            </p>
            <a href="/" className="inline-block px-8 py-4 bg-white text-black font-bold rounded-xl mt-4 transition-transform hover:scale-105">
              ต่ออายุแพ็กเกจใหม่
            </a>
          </div>
        )}
      </div>
      
      <a href="/" className="mt-8 text-gray-500 hover:text-white transition-colors text-sm relative z-10">
        &larr; กลับหน้าหลัก
      </a>
    </main>
  );
}
