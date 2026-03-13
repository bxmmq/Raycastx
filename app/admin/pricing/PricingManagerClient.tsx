"use client";

import { useState } from "react";
import { Pricing } from "@/components/PricingSection";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Save, Clock, DollarSign, Calendar } from "lucide-react";

export default function PricingManagerClient({ initialPricing }: { initialPricing: Pricing }) {
  const [pricing, setPricing] = useState<Pricing>(initialPricing);
  const [isSaving, setIsSaving] = useState(false);
  const [newDays, setNewDays] = useState("");
  const [newPrice, setNewPrice] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pricing })
      });
      if (res.ok) {
        alert("บันทึกราคาสำเร็จ การเปลี่ยนแปลงจะแสดงบนหน้าร้านทันที");
      } else {
        alert("เกิดข้อผิดพลาดในการบันทึก");
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddPackage = () => {
    const days = parseInt(newDays);
    const price = parseInt(newPrice);
    if (!days || isNaN(price) || days <= 0 || price < 0) {
      return alert("กรุณากรอกจำนวนวันและราคาให้ถูกต้อง");
    }
    if (pricing[days.toString()]) {
      return alert("แพ็กเกจจำนวนวันนี้มีอยู่แล้ว");
    }
    setPricing({ ...pricing, [days.toString()]: price });
    setNewDays("");
    setNewPrice("");
  };

  const handleRemovePackage = (days: string) => {
    if (confirm(`คุณต้องการลบแพ็กเกจ ${days} วัน ใช่หรือไม่?`)) {
      const updated = { ...pricing };
      delete updated[days];
      setPricing(updated);
    }
  };

  const formatDaysLabel = (days: string) => {
    const d = parseInt(days);
    if (d === 1) return "รายวัน";
    if (d === 7) return "รายสัปดาห์";
    if (d === 30) return "รายเดือน";
    if (d === 180) return "ครึ่งปี";
    if (d === 365) return "รายปี";
    return `${d} วัน`;
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Existing Packages */}
      <form onSubmit={handleSave} className="bg-[#111] p-6 md:p-10 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--color-primary)]/5 rounded-full blur-[100px] pointer-events-none -mr-48 -mt-48" />
        
        <div className="flex items-center gap-3 mb-8">
           <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center border border-[var(--color-primary)]/20">
             <DollarSign className="w-5 h-5 text-[var(--color-primary)]" />
           </div>
           <div>
             <h2 className="text-2xl font-bold font-serif text-white">จัดการราคาปัจจุบัน</h2>
             <p className="text-gray-500 text-sm mt-1">ปรับราคาสำหรับแพ็กเกจที่มีอยู่ หรือลบแพ็กเกจที่ไม่ต้องการ</p>
           </div>
        </div>

        <div className="space-y-4 relative z-10">
          <AnimatePresence>
            {Object.keys(pricing).sort((a,b) => parseInt(a) - parseInt(b)).map((days) => (
              <motion.div 
                key={days} 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white/[0.02] border border-white/5 hover:border-[var(--color-primary)]/30 hover:bg-white/[0.04] p-5 rounded-2xl transition-all gap-4 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:bg-[var(--color-primary)]/10 group-hover:text-[var(--color-primary)] transition-all">
                    <Calendar className="w-6 h-6 text-gray-400 group-hover:text-[var(--color-primary)] transition-colors" />
                  </div>
                  <div>
                    <label className="block text-lg font-bold text-white mb-1 flex items-center gap-2">
                      {formatDaysLabel(days)} <span className="text-gray-500 font-mono text-sm font-normal">({days} วัน)</span>
                    </label>
                    <p className="text-xs text-gray-500">แพ็กเกจพรีเมียม {days} วัน</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex items-center flex-1 sm:flex-none">
                    <span className="absolute left-4 text-[var(--color-primary)] font-bold pointer-events-none">฿</span>
                    <input 
                      type="number" 
                      value={pricing[days] || 0}
                      onChange={(e) => setPricing({ ...pricing, [days]: parseInt(e.target.value) || 0 })}
                      className="w-full sm:w-40 bg-black/60 border border-white/10 rounded-xl px-4 py-3 pl-10 text-right text-lg font-bold text-white focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all placeholder:text-gray-600"
                      min="0"
                      required
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => handleRemovePackage(days)}
                    className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors border border-red-500/20"
                    title="ลบแพ็กเกจ"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {Object.keys(pricing).length === 0 && (
             <div className="text-center py-10 text-gray-500 bg-white/5 rounded-2xl border border-white/5 border-dashed">
               ไม่มีแพ็กเกจในระบบ กรุณาเพิ่มด้านล่าง
             </div>
          )}
        </div>
        
        <div className="mt-10 pt-6 border-t border-white/5 flex justify-end">
          <button 
            type="submit" 
            disabled={isSaving}
            className="flex items-center justify-center w-full sm:w-auto gap-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white font-black px-8 py-4 rounded-xl hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:scale-100 shadow-[0_10px_30px_rgba(var(--color-primary-rgb),0.3)]"
          >
            <Save className="w-5 h-5" />
            {isSaving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลงทั้งหมด"}
          </button>
        </div>
      </form>

      {/* Add New Package */}
      <div className="bg-[#111] p-6 md:p-8 rounded-[2rem] border border-[var(--color-primary)]/20 shadow-xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[var(--color-primary)]/10 rounded-full blur-[80px] pointer-events-none -mr-20 -mt-20" />
         
         <div className="flex items-center gap-3 mb-6 relative z-10">
           <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center border border-[var(--color-primary)]/20">
             <Plus className="w-5 h-5 text-[var(--color-primary)]" />
           </div>
           <div>
             <h3 className="text-xl font-bold text-white">เพิ่มแพ็กเกจใหม่</h3>
             <p className="text-sm text-gray-400">สร้างตัวเลือกจำนวนวันเพิ่มเติม เช่น 60 วัน, 180 วัน</p>
           </div>
         </div>

         <div className="flex flex-col md:flex-row items-end gap-4 relative z-10">
           <div className="w-full md:flex-1">
              <label className="block text-sm font-medium text-gray-400 mb-2">จำนวนวัน (Days)</label>
              <div className="relative">
                 <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                 <input 
                    type="number" 
                    value={newDays}
                    onChange={(e) => setNewDays(e.target.value)}
                    placeholder="เช่น: 60"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 pl-12 text-white focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
                    min="1"
                 />
              </div>
           </div>
           <div className="w-full md:flex-1">
              <label className="block text-sm font-medium text-gray-400 mb-2">ราคา (Baht)</label>
              <div className="relative">
                 <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                 <input 
                    type="number" 
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="เช่น: 150"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 pl-12 text-white focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
                    min="0"
                 />
              </div>
           </div>
           <button 
              type="button"
              onClick={handleAddPackage}
              className="w-full md:w-auto h-[50px] bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 text-[var(--color-primary)] font-bold px-8 rounded-xl transition-all border border-[var(--color-primary)]/30 flex items-center justify-center gap-2 shrink-0"
           >
             <Plus className="w-5 h-5" />
             เพิ่มแพ็กเกจ
           </button>
         </div>
      </div>
    </div>
  );
}
