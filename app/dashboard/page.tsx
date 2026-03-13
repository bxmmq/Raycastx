import Link from 'next/link';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import CountdownClient from '@/app/status/[email]/CountdownClient';
import LogoutButton from '@/components/LogoutButton';
import { User, Mail, CreditCard, Clock, Lock as LockIcon } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const { user } = session;

  // Fetch the latest order for this user email
  const order = db.prepare(`
    SELECT * FROM orders 
    WHERE email = ? 
    ORDER BY created_at DESC LIMIT 1
  `).get(user.email) as any;

  return (
    <main className="min-h-screen p-6 pt-32 bg-[#030303] relative overflow-hidden flex flex-col items-center text-white">
      {/* Background gradients */}
      <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-[var(--color-primary)]/10 rounded-full blur-[150px] pointer-events-none -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-[var(--color-primary)]/5 rounded-full blur-[120px] pointer-events-none -ml-48 -mb-48" />

      <div className="w-full max-w-5xl relative z-10 transition-all duration-500">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white/[0.02] border border-white/5 p-6 sm:p-8 rounded-[2.5rem] mb-8 gap-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)]/5 to-transparent opacity-50" />
          
          <div className="flex items-center gap-6 relative z-10 w-full sm:w-auto">
            <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 flex items-center justify-center shadow-lg shrink-0 overflow-hidden group">
              <div className="absolute inset-0 bg-[var(--color-primary)]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <User className="w-8 h-8 text-[var(--color-primary)] relative z-10" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight leading-tight">
                สวัสดีคุณลูกค้า
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                <span className="text-gray-400 text-sm font-medium">ออนไลน์และพร้อมใช้งาน</span>
              </div>
            </div>
          </div>
          
          <div className="shrink-0 relative z-10 w-full sm:w-auto">
            <LogoutButton />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {[
            { 
              label: 'อีเมลสมาชิก', 
              value: user.email, 
              icon: Mail, 
              color: 'blue',
              bg: 'from-blue-500/10 to-transparent'
            },
            { 
              label: 'แพ็กเกจปัจจุบัน', 
              value: order ? `Canva Pro ${order.duration_days === 180 ? 'ครึ่งปี (180 วัน)' : order.duration_days === 365 ? 'รายปี (365 วัน)' : order.duration_days === 30 ? 'รายเดือน (30 วัน)' : `${order.duration_days} วัน`}` : 'ยังไม่มีแพ็กเกจ', 
              icon: CreditCard, 
              color: 'purple',
              bg: 'from-purple-500/10 to-transparent'
            },
            { 
              label: 'สถานะบัญชี', 
              value: !order ? 'ยังไม่เริ่มใช้งาน' : order.status === 'active' ? 'กำลังใช้งาน' : order.status === 'pending' ? 'รออนุมัติ' : 'หมดอายุ', 
              icon: Clock, 
              color: order?.status === 'active' ? 'green' : 'yellow',
              bg: order?.status === 'active' ? 'from-green-500/10 to-transparent' : 'from-yellow-500/10 to-transparent'
            }
          ].map((stat, i) => (
            <div key={i} className="glass group p-5 rounded-[24px] border border-white/5 flex items-center gap-4 hover:border-[var(--color-primary)]/30 hover:bg-white/[0.03] transition-all duration-300 relative overflow-hidden">
               <div className={`absolute inset-0 bg-gradient-to-br ${stat.bg} opacity-0 group-hover:opacity-100 transition-opacity`} />
               <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center relative z-10 transition-transform duration-500 group-hover:scale-110 shrink-0">
                  <stat.icon className={`w-6 h-6 text-white`} />
               </div>
                <div className="relative z-10 w-full overflow-hidden">
                  <p className="text-gray-500 text-[10px] font-bold mb-0.5 uppercase tracking-wider">{stat.label}</p>
                  <p 
                    className={`text-white font-bold leading-tight truncate ${stat.label === 'อีเมลสมาชิก' ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'}`}
                    title={stat.value}
                  >
                    {stat.value}
                  </p>
                </div>
            </div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="glass p-1 md:p-1.5 rounded-[48px] border border-white/5 shadow-[0_30px_60px_rgba(0,0,0,0.5)] bg-white/5">
          <div className="p-10 md:p-16 rounded-[44px] border border-white/10 bg-[#0a0a0a] text-center relative overflow-hidden">
             {/* Decorative glow */}
             <div className="absolute -top-24 -left-24 w-64 h-64 bg-[var(--color-primary)]/20 rounded-full blur-[80px] opacity-30 pointer-events-none" />
             <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[var(--color-primary)]/10 rounded-full blur-[80px] opacity-20 pointer-events-none" />

             {!order ? (
                <div className="py-12 flex flex-col items-center">
                  <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center mb-8 border border-white/10">
                    <CreditCard className="w-12 h-12 text-gray-500" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">ยินดีต้อนรับสู่ Raycast แบบ Pro</h2>
                  <p className="text-gray-400 mb-10 text-lg max-w-md mx-auto">
                    ยกระดับงานดีไซน์ของคุณด้วยเครื่องมือระดับพรีเมียม <br/> เริ่มต้นใช้งานได้ในไม่กี่นาที
                  </p>
                  <Link href="/" className="px-12 py-5 bg-white text-black font-black text-lg rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-[0_15px_40px_rgba(255,255,255,0.2)]">
                    สั่งซื้อแพ็กเกจเลย
                  </Link>
                </div>
             ) : order.status === 'pending' ? (
                <div className="py-12 space-y-8 flex flex-col items-center">
                  <div className="relative">
                    <div className="w-32 h-32 border-4 border-[var(--color-primary)]/20 border-t-[var(--color-primary)] rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Clock className="w-12 h-12 text-[var(--color-primary)]" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-4xl font-bold text-white mb-4">กำลังเตรียมแพ็กเกจ...</h2>
                    <p className="text-gray-400 text-xl max-w-lg mx-auto leading-relaxed">
                      แอดมินกำลังดำเนินการอัปเกรดบัญชี <span className="text-[var(--color-primary)] font-bold underline decoration-wavy underline-offset-4">{order.email}</span> ให้กับคุณ
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-gray-400">
                    <span className="flex h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                    สถานะปัจจุบัน: รอการอนุมัติ
                  </div>
                </div>
             ) : order.status === 'active' ? (
                <div className="py-8">
                   <div className="flex flex-col items-center mb-12">
                     <span className="text-[var(--color-primary)] font-serif italic text-lg mb-2 tracking-[0.3em] uppercase opacity-60">Time Remaining</span>
                     <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">เวลาที่เหลือของคุณ</h2>
                   </div>
                   <CountdownClient 
                     startTime={order.start_time} 
                     endTime={order.end_time} 
                     durationDays={order.duration_days} 
                   />
                </div>
             ) : (
                <div className="py-12 space-y-8 flex flex-col items-center">
                   <div className="w-24 h-24 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center border-4 border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                      <LockIcon className="w-12 h-12" />
                   </div>
                   <div>
                     <h2 className="text-3xl font-bold text-white mb-3">แพ็กเกจของคุณหมดอายุแล้ว</h2>
                     <p className="text-gray-400 text-lg">เพลิดเพลินกับ Canva Pro ต่อเนื่อง ด้วยการสมัครใหม่ได้ทันที</p>
                   </div>
                   <Link href="/" className="px-12 py-5 bg-[var(--color-primary)] text-white font-black text-lg rounded-2xl transition-all hover:scale-105 shadow-[0_15px_40px_rgba(var(--color-primary-rgb),0.3)]">
                     ต่ออายุแพ็กเกจ
                   </Link>
                </div>
             )}
          </div>
        </div>

        <div className="mt-16 text-center text-gray-600 font-medium">
           <p className="opacity-60">&copy; 2026 Raycast Canva PRO. All rights reserved.</p>
        </div>
      </div>
    </main>
  );
}
