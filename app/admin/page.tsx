import db from '@/lib/db';
import OrderListClient from '@/app/admin/OrderListClient';
import StatsCards from '@/app/admin/StatsCards';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  // Fetch stats
  const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get() as { count: number };
  const pendingOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'").get() as { count: number };
  const activeUsers = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'active'").get() as { count: number };
  
  // Estimate revenue (simplified)
  const pricingRow = db.prepare('SELECT value FROM settings WHERE key = ?').get('pricing') as { value: string } | undefined;
  const pricing = pricingRow ? JSON.parse(pricingRow.value) : { '1': 15, '7': 89, '30': 250, '365': 1500 };
  
  const ordersList = db.prepare("SELECT duration_days FROM orders WHERE status = 'active' OR status = 'expired'").all() as { duration_days: number }[];
  const totalRevenue = ordersList.reduce((acc, order) => acc + (pricing[order.duration_days.toString()] || 0), 0);

  const stats = {
    totalOrders: totalOrders.count,
    pendingOrders: pendingOrders.count,
    activeUsers: activeUsers.count,
    totalRevenue
  };

  const stmt = db.prepare(`
    SELECT 
      COALESCE(o.id, -u.id) as id, 
      u.email, 
      o.duration_days, 
      COALESCE(o.status, 'none') as status, 
      o.start_time, 
      o.end_time, 
      COALESCE(o.created_at, u.created_at) as created_at,
      o.password
    FROM users u
    LEFT JOIN orders o ON u.email = o.email
    ORDER BY created_at DESC 
    LIMIT 200
  `);
  const orders = stmt.all();

  const availablePackages = Object.keys(pricing).map(Number).sort((a, b) => a - b);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold font-serif mb-12 heading-spacing">
        แดชบอร์ดผู้ดูแลระบบ
      </h1>
      
      <StatsCards stats={stats} />
      
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">รายการคำสั่งซื้อล่าสุด</h2>
        <OrderListClient initialOrders={orders as any[]} availablePackages={availablePackages} />
      </div>
    </div>
  );
}
