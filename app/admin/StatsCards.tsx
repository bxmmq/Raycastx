"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Clock, Users, DollarSign } from "lucide-react";

interface StatsProps {
  stats: {
    totalOrders: number;
    pendingOrders: number;
    activeUsers: number;
    totalRevenue: number;
  };
}

export default function StatsCards({ stats }: StatsProps) {
  const cards = [
    {
      title: "คำสั่งซื้อทั้งหมด",
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      title: "รอการตรวจสอบ",
      value: stats.pendingOrders,
      icon: Clock,
      color: "bg-yellow-500/10 text-yellow-500",
    },
    {
      title: "ผู้ใช้ที่ใช้งานอยู่",
      value: stats.activeUsers,
      icon: Users,
      color: "bg-green-500/10 text-green-500",
    },
    {
      title: "รายได้รวม (ประมาณ)",
      value: `${stats.totalRevenue.toLocaleString()} ฿`,
      icon: DollarSign,
      color: "bg-purple-500/10 text-purple-500",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
    >
      {cards.map((card, idx) => (
        <motion.div
          key={idx}
          variants={item}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${card.color}`}>
              <card.icon className="w-6 h-6" />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-400 font-medium">{card.title}</p>
            <h3 className="text-3xl font-bold mt-1">{card.value}</h3>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
