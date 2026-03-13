"use client";

import { useState } from "react";
import { X, CalendarDays, Clock, ShieldCheck, Mail, Info, Copy, Check, Trash2, PackageMinus } from "lucide-react";
import ConfirmationModal from "@/components/ConfirmationModal";

export type Order = {
  id: number;
  email: string;
  duration_days: number | null;
  status: string;
  start_time: string | null;
  end_time: string | null;
  created_at: string;
  password?: string | null;
};

export default function OrderListClient({ initialOrders, availablePackages = [1, 7, 30, 365] }: { initialOrders: Order[], availablePackages?: number[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [editingPassword, setEditingPassword] = useState("");
  const [isResettingAccount, setIsResettingAccount] = useState(false);
  const [copiedEmailId, setCopiedEmailId] = useState<number | null>(null);
  const [grantOrderModalId, setGrantOrderModalId] = useState<number | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const sortedOrders = [...orders].sort((a, b) => {
    if (!sortConfig) return 0;
    
    if (sortConfig.key === 'id') {
      return sortConfig.direction === 'asc' ? a.id - b.id : b.id - a.id;
    }
    
    if (sortConfig.key === 'package') {
      if (!a.duration_days && !b.duration_days) return 0;
      if (!a.duration_days) return 1; // Always at bottom
      if (!b.duration_days) return -1; // Always at bottom
      
      return sortConfig.direction === 'asc' 
        ? a.duration_days - b.duration_days 
        : b.duration_days - a.duration_days;
    }

    if (sortConfig.key === 'status') {
      const weight = { 'pending': 1, 'active': 2, 'expired': 3, 'none': 4 };
      const weightA = weight[a.status as keyof typeof weight] || 5;
      const weightB = weight[b.status as keyof typeof weight] || 5;
      return sortConfig.direction === 'asc' ? weightA - weightB : weightB - weightA;
    }
    
    return 0;
  });

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const formatDuration = (days: number | null) => {
    if (!days) return "ไม่มี";
    if (days === 180) return "ครึ่งปี (180 วัน)";
    if (days === 365) return "รายปี (365 วัน)";
    if (days === 30) return "รายเดือน (30 วัน)";
    if (days === 7) return "รายสัปดาห์ (7 วัน)";
    if (days === 1) return "รายวัน (1 วัน)";
    return `${days} วัน`;
  };
  
  // Custom Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void;
    type: 'danger' | 'success' | 'warning';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning'
  });

  const requestConfirm = (config: Omit<typeof confirmModal, 'isOpen'>) => {
    setConfirmModal({ ...config, isOpen: true });
  };

  const handleResetAccountPassword = async (id: number) => {
    if (!editingPassword) return alert("กรุณากรอกรหัสผ่านใหม่ก่อนกดรีเซ็ต");
    
    requestConfirm({
      title: 'รีเซ็ตรหัสผ่าน?',
      message: `ยืนยันการตั้งรหัสผ่านใหม่สำหรับ "บัญชีเข้าระบบเว็บ" ของลูกค้า (${viewOrder?.email})?`,
      confirmText: 'ยืนยันรีเซ็ต',
      type: 'warning',
      onConfirm: async () => {
        setIsResettingAccount(true);
        try {
          const res = await fetch(`/api/admin/orders`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, action: 'reset_account_password', password: editingPassword })
          });
          if (res.ok) {
            alert("รีเซ็ตระหัสผ่านบัญชีเว็บเรียบร้อยแล้ว! ลูกค้าสามารถใช้รหัสผ่านนี้ Login ได้ทันที");
          } else {
            const errorData = await res.json().catch(() => ({}));
            alert(`รีเซ็ตไม่สำเร็จ: ${errorData.error || res.statusText || 'กรุณาลองใหม่อีกครั้ง'}`);
          }
        } catch (err) {
          console.error(err);
          alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
        } finally {
          setIsResettingAccount(false);
        }
      }
    });
  };

  const handleCopyEmail = (email: string, id: number) => {
    navigator.clipboard.writeText(email);
    setCopiedEmailId(id);
    setTimeout(() => setCopiedEmailId(null), 2000);
  };


  const handleActivate = async (id: number, durationDays: number) => {
    const password = "";// Removed prompt
    
    requestConfirm({
      title: 'เปิดใช้งาน Canva?',
      message: 'ยืนยันการเปิดใช้งาน Canva Pro สำหรับลูกค้านี้?',
      confirmText: 'เปิดใช้งานทันที',
      type: 'success',
      onConfirm: async () => {
        setLoadingId(id);
        try {
          const res = await fetch(`/api/admin/orders`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, action: 'activate', duration_days: durationDays, password: password || undefined })
          });
          if (res.ok) {
            const updated = await res.json();
            setOrders(orders.map(o => o.id === id ? { 
              ...o, 
              id: updated.id || o.id, 
              status: 'active', 
              start_time: updated.start_time, 
              end_time: updated.end_time 
            } : o));
          } else {
            alert("อัปเดตสถานะไม่สำเร็จ");
          }
        } catch (err) {
          console.error(err);
          alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
        } finally {
          setLoadingId(null);
        }
      }
    });
  };

  const handleDelete = async (id: number, action: 'delete_account' | 'delete_package') => {
    const isPackageOnly = action === 'delete_package';
    
    requestConfirm({
      title: isPackageOnly ? 'ลบแพ็กเกจ?' : 'ต้องการลบบัญชี?',
      message: isPackageOnly 
        ? 'คุณแน่ใจหรือไม่ที่จะลบแพ็กเกจนี้? ลูกค้าจะยังสามารถเข้าสู่ระบบได้ แต่ต้องสั่งซื้อแพ็กเกจใหม่' 
        : 'คุณแน่ใจหรือไม่ที่จะลบรายชื่อนี้? ข้อมูลบัญชีและคำสั่งซื้อทั้งหมดจะถูกลบทิ้งถาวร',
      confirmText: isPackageOnly ? 'ลบแค่แพ็กเกจ' : 'ลบบัญชีถาวร',
      type: isPackageOnly ? 'warning' : 'danger',
      onConfirm: async () => {
        setLoadingId(id);
        try {
          const res = await fetch(`/api/admin/orders`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, action })
          });
          if (res.ok) {
            if (isPackageOnly) {
              setOrders(orders.map(o => o.id === id ? { 
                ...o, 
                status: 'none', 
                duration_days: null, 
                start_time: null, 
                end_time: null, 
                password: null 
              } : o));
            } else {
              setOrders(orders.filter(o => o.id !== id));
            }
          } else {
            alert("ลบไม่สำเร็จ");
          }
        } catch (err) {
          console.error(err);
          alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
        } finally {
          setLoadingId(null);
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="mb-6 flex gap-4">
        <div className="bg-[#111] px-6 py-4 rounded-xl border border-white/5 flex-1 max-w-xs shadow-xl">
          <div className="text-sm text-gray-400 mb-1">คำสั่งซื้อทั้งหมด (กำลังใช้งาน)</div>
          <div className="text-3xl font-bold text-white">{orders.filter(o => o.status === 'active').length}</div>
        </div>
        <div className="bg-[#111] px-6 py-4 rounded-xl border border-[var(--color-primary)]/30 flex-1 max-w-xs bg-[var(--color-primary)]/5 shadow-xl">
          <div className="text-sm text-[var(--color-primary)] mb-1">รออนุมัติ</div>
          <div className="text-3xl font-bold text-white">{orders.filter(o => o.status === 'pending').length}</div>
        </div>
      </div>

      <div className="bg-[#111] rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-white/[0.02] text-gray-500 text-[11px] uppercase tracking-wider font-bold">
            <tr>
              <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors select-none" onClick={() => requestSort('id')}>
                ลูกค้า / ID {sortConfig?.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-4 text-center cursor-pointer hover:text-white transition-colors select-none" onClick={() => requestSort('package')}>
                แพ็กเกจ {sortConfig?.key === 'package' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-4 text-center">รหัสผ่าน</th>
              <th className="px-4 py-4 text-center cursor-pointer hover:text-white transition-colors select-none" onClick={() => requestSort('status')}>
                สถานะ {sortConfig?.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-4 text-right">การจัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 whitespace-nowrap text-sm">
          {sortedOrders.map(order => (
            <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
              <td className="px-6 py-4">
                <div className="flex flex-col max-w-[180px] sm:max-w-xs overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold tracking-tight truncate leading-tight" title={order.email}>{order.email}</span>
                    <button
                      onClick={() => handleCopyEmail(order.email, order.id)}
                      className="p-1 text-gray-500 hover:text-white hover:bg-white/10 rounded-md transition-all shrink-0"
                      title="คัดลอกอีเมล"
                    >
                      {copiedEmailId === order.id ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <span className="text-[12px] text-gray-400 font-mono mt-0.5">#{order.id} • {new Date(order.created_at).toLocaleDateString('th-TH')}</span>
                </div>
              </td>
              <td className="px-4 py-4 text-center">
                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${order.duration_days ? 'bg-white/10 text-white' : 'bg-white/5 text-gray-600'}`}>
                  {formatDuration(order.duration_days)}
                </span>
              </td>
              <td className="px-4 py-4 text-center">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${order.password ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-gray-500/10 text-gray-500 border-gray-500/20'}`}>
                  {order.password ? 'มี' : 'ไม่มี'}
                </span>
              </td>
              <td className="px-4 py-4 text-center">
                {order.status === 'none' && <span className="text-gray-500 text-[11px] font-bold opacity-60">NEW</span>}
                {order.status === 'pending' && <span className="text-yellow-500 text-[11px] font-bold">PENDING</span>}
                {order.status === 'active' && <span className="text-[var(--color-primary)] text-[11px] font-bold">ACTIVE</span>}
                {order.status === 'expired' && <span className="text-red-500 text-[11px] font-bold">EXPIRED</span>}
              </td>
              <td className="px-6 py-4 text-right italic">
                <div className="flex items-center justify-end gap-2">
                  {order.status === 'none' && (
                    <button 
                      onClick={() => setGrantOrderModalId(order.id)}
                      disabled={loadingId === order.id}
                      className="bg-white/10 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-white/20 transition-all disabled:opacity-50"
                    >
                      มอบแพ็กเกจ
                    </button>
                  )}
                  {order.status === 'pending' && (
                    <button 
                      onClick={() => handleActivate(order.id, order.duration_days || 30)}
                      disabled={loadingId === order.id}
                      className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white px-4 py-2 rounded-lg text-sm font-bold hover:shadow-[0_0_15px_var(--color-primary)] transition-all disabled:opacity-50"
                    >
                      {loadingId === order.id ? 'กำลังเปิด...' : 'เปิดใช้งาน'}
                    </button>
                  )}
                  {order.status === 'active' && order.end_time && (
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-gray-500 text-sm border border-white/10 px-3 py-1 rounded-lg">ใช้งานอยู่</span>
                      <span className="text-xs text-gray-600 font-mono">ถึง: {new Date(order.end_time).toLocaleDateString('th-TH')}</span>
                    </div>
                  )}
                  
                  <button
                    onClick={() => {
                      setViewOrder(order);
                      setEditingPassword(order.password || "");
                    }}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                    title="ดูรายละเอียด / ตั้งรหัสผ่าน"
                  >
                    <Info className="w-4 h-4" />
                  </button>

                  {order.status !== 'none' && (
                    <button 
                      onClick={() => handleDelete(order.id, 'delete_package')}
                      disabled={loadingId === order.id}
                      className="p-2 text-gray-500 hover:text-yellow-500 hover:bg-yellow-500/10 rounded-xl transition-all disabled:opacity-50"
                      title="ลบแค่แพ็กเกจ (บัญชีลูกค้ายังคงอยู่)"
                    >
                      <PackageMinus className="w-4 h-4" />
                    </button>
                  )}

                  <button 
                    onClick={() => handleDelete(order.id, 'delete_account')}
                    disabled={loadingId === order.id}
                    className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-50"
                    title="ลบบัญชีและข้อมูลทั้งหมดถาวร"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan={5} className="p-12 text-center text-gray-500 bg-white/[0.01]">
                ไม่มีรายชื่อในระบบ
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

      {/* Order Details Modal */}
      {viewOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setViewOrder(null)}>
          <div 
            className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center border border-[var(--color-primary)]/20">
                  <Info className="w-5 h-5 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-serif text-white">รายละเอียดคำสั่งซื้อ</h3>
                  <p className="text-sm text-gray-500 font-mono">#{viewOrder?.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setViewOrder(null)}
                className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              
              <div className="grid gap-4">
                {/* Email row */}
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="bg-white/10 p-2 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-300" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">อีเมลลูกค้า</p>
                    <p className="text-sm font-medium text-white break-all">{viewOrder?.email}</p>
                  </div>
                </div>

                {/* Status & Package row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div className="bg-white/10 p-2 rounded-lg">
                      <ShieldCheck className="w-5 h-5 text-[var(--color-primary)]" />
                    </div>
                    <div>
                      <div className="flex items-center">
                        {viewOrder?.status === 'pending' && <span className="text-yellow-500 text-sm font-medium">รอเปิดใช้งาน</span>}
                        {viewOrder?.status === 'active' && <span className="text-[var(--color-primary)] text-sm font-medium">ใช้งานอยู่</span>}
                        {viewOrder?.status === 'expired' && <span className="text-red-500 text-sm font-medium">หมดอายุ</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div className="bg-white/10 p-2 rounded-lg">
                      <CalendarDays className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">แพ็กเกจ</p>
                      <p className="text-sm font-medium text-white">{formatDuration(viewOrder?.duration_days)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timing Information */}
              <div className="bg-white/5 rounded-2xl border border-white/5 p-5 space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)]/5 rounded-bl-[100px] pointer-events-none" />
                
                <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-[var(--color-primary)]" />
                  ข้อมูลเวลาอย่างละเอียด
                </h4>

                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                    <span className="text-gray-500">เวลาทำการสั่งซื้อ:</span>
                    <span className="text-white font-mono break-words text-right max-w-[60%]">
                      {viewOrder?.created_at ? new Date(viewOrder.created_at).toLocaleString('th-TH', { 
                        year: 'numeric', month: 'long', day: 'numeric', 
                        hour: '2-digit', minute: '2-digit', second: '2-digit' 
                      }) : '-'}
                    </span>
                  </div>
                  
                  {viewOrder?.start_time ? (
                    <div className="flex justify-between items-center pb-3 border-b border-white/5">
                      <span className="text-gray-500">เวลาที่เริ่มใช้งาน:</span>
                      <span className="text-[var(--color-primary)] font-mono text-right break-words max-w-[60%]">
                        {new Date(viewOrder.start_time).toLocaleString('th-TH', { 
                          year: 'numeric', month: 'long', day: 'numeric', 
                          hour: '2-digit', minute: '2-digit', second: '2-digit' 
                        })}
                      </span>
                    </div>
                  ) : null}

                  {viewOrder?.end_time ? (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">เวลาสิ้นสุดการใช้งาน:</span>
                      <span className="text-red-400 font-mono text-right break-words max-w-[60%]">
                        {new Date(viewOrder.end_time).toLocaleString('th-TH', { 
                          year: 'numeric', month: 'long', day: 'numeric', 
                          hour: '2-digit', minute: '2-digit', second: '2-digit' 
                        })}
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">เวลาสิ้นสุดการใช้งาน:</span>
                      <span className="text-gray-600 italic">ยังไม่กำหนด</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Password Management */}
              <div className="bg-white/5 rounded-2xl border border-[var(--color-primary)]/20 p-5 space-y-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[var(--color-primary)]" />
                    รีเซ็ตรหัสผ่านลูกค้า
                  </h4>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[11px] text-gray-500 uppercase tracking-wider font-bold">กรอกรหัสผ่านใหม่ที่นี่</label>
                    <input
                      type="text"
                      value={editingPassword}
                      onChange={(e) => setEditingPassword(e.target.value)}
                      placeholder="เช่น: bom123456"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[var(--color-primary)] transition-all placeholder:text-gray-700"
                    />
                  </div>

                  <button
                    onClick={() => viewOrder && handleResetAccountPassword(viewOrder.id)}
                    disabled={isResettingAccount || !editingPassword}
                    className="w-full flex items-center justify-center gap-2 bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 text-white py-3 rounded-xl text-sm font-bold transition-all border border-[var(--color-primary)]/20 disabled:opacity-30"
                  >
                    <Mail className="w-4 h-4 text-[var(--color-primary)]" />
                    <span>{isResettingAccount ? "..." : "ยืนยันการตั้งรหัสผ่านใหม่"}</span>
                  </button>
                </div>

                <p className="text-[10px] text-center text-gray-500 italic leading-relaxed">
                  * ใช้สำหรับเปลี่ยนรหัสผ่านที่ลูกค้าใช้ Login เข้าเว็บไซต์ Raycast <br/>
                  (รหัสผ่านจะถูกเข้ารหัส Hashed เพื่อความปลอดภัย)
                </p>
              </div>

            </div>
            
            {/* Footer */}
            <div className="p-6 pt-0">
              <button 
                onClick={() => setViewOrder(null)}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 rounded-xl transition-colors"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grant Order Modal */}
      {grantOrderModalId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setGrantOrderModalId(null)}>
          <div 
            className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <PackageMinus className="w-5 h-5 text-[var(--color-primary)]" />
                เลือกแพ็กเกจที่ต้องการมอบ
              </h3>
              <button onClick={() => setGrantOrderModalId(null)} className="p-2 text-gray-500 hover:text-white rounded-full"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-3">
              {availablePackages.map(days => (
                <button
                  key={days}
                  onClick={() => {
                    handleActivate(grantOrderModalId, days);
                    setGrantOrderModalId(null);
                  }}
                  className="w-full py-4 px-6 rounded-2xl bg-white/5 hover:bg-[var(--color-primary)]/20 hover:border-[var(--color-primary)]/50 border border-white/5 text-white font-bold transition-all text-left flex justify-between items-center group"
                >
                  <span>{formatDuration(days)}</span>
                  <span className="text-gray-500 group-hover:text-[var(--color-primary)] transition-colors">→</span>
                </button>
              ))}
              {availablePackages.length === 0 && (
                <div className="text-center text-gray-500 py-4">ยังไม่ได้ตั้งราคาในระบบ</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        type={confirmModal.type}
      />
    </div>
    </div>
  );
}
