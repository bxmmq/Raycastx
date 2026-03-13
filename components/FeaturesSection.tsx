"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles, Zap, Image as ImageIcon, Crown } from "lucide-react";

const features = [
  {
    icon: Crown,
    title: "ฟีเจอร์พรีเมียมครบครัน",
    description: "เข้าถึงเทมเพลต รูปภาพ วิดีโอ และกราฟิกนับล้านชิ้นที่ออกแบบมาอย่างมืออาชีพ"
  },
  {
    icon: Sparkles,
    title: "AI อัจฉริยะ (Magic Studio)",
    description: "เครื่องมือ AI สำหรับแก้ไขภาพ สร้างข้อความ และลบพื้นหลังในคลิกเดียว"
  },
  {
    icon: Zap,
    title: "ทำงานได้รวดเร็วยิ่งขึ้น",
    description: "เครื่องมือลบพื้นหลังอัตโนมัติ (Background Remover) และปรับขนาดอัตโนมัติ (Magic Resize)"
  },
  {
    icon: ImageIcon,
    title: "พื้นที่เก็บข้อมูล 1TB",
    description: "พื้นที่ระดับพรีเมียม ให้คุณจัดเก็บและจัดการโปรเจกต์ของทีมได้อย่างจุใจ"
  }
];

export default function FeaturesSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section ref={containerRef} className="relative py-32 px-6 w-full max-w-7xl mx-auto">
      <div className="text-center mb-24">
        <motion.h2
          className="text-4xl md:text-5xl font-serif font-bold heading-spacing mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          ทำไมถึงต้องใช้ <span className="text-gradient">Canva Pro</span> ?
        </motion.h2>
        <motion.p
          className="text-xl text-gray-400 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.1 }}
        >
          ปลดปล่อยศักยภาพความคิดสร้างสรรค์ของคุณได้อย่างเต็มรูปแบบ ด้วยฟีเจอร์ระดับพรีเมียมที่ตอบโจทย์ทุกงานออกแบบ
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="glass p-8 rounded-3xl group transition-all duration-300 hover:-translate-y-2 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/0 to-[var(--color-accent)]/0 group-hover:from-[var(--color-primary)]/10 group-hover:to-[var(--color-accent)]/10 transition-colors duration-500" />

            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 relative z-10 transition-all group-hover:scale-110 duration-300">
              <feature.icon className="w-7 h-7 text-[var(--color-primary)] shadow-sm" />
            </div>
            <h3 className="text-2xl font-bold mb-4 font-serif relative z-10">{feature.title}</h3>
            <p className="text-gray-400 leading-relaxed text-lg relative z-10">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
