import pool from '@/lib/db';
import OrderListClient from '@/app/admin/OrderListClient';
import StatsCards from '@/app/admin/StatsCards';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  // Fetch stats
  const totalOrdersResult = await pool.query('SELECT COUNT(*) as count FROM orders');
  const totalOrders = { count: parseInt(totalOrdersResult.rows[0].count) };

  const pendingOrdersResult = await pool.query("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'");
  const pendingOrders = { count: parseInt(pendingOrdersResult.rows[0].count) };

  const activeUsersResult = await pool.query("SELECT COUNT(*) as count FROM orders WHERE status = 'active'");
  const activeUsers = { count: parseInt(activeUsersResult.rows[0].count) };
  
  // Estimate revenue (simplified)
  const pricingRowResult = await pool.query('SELECT value FROM settings WHERE key = $1', ['pricing']);
  const pricingRow = pricingRowResult.rows[0];
  const pricing = pricingRow ? JSON.parse(pricingRow.value) : { '1': 15, '7': 89, '30': 250, '365': 1500 };
  
  const ordersListResult = await pool.query("SELECT duration_days FROM orders WHERE status = 'active' OR status = 'expired'");
  const ordersList = ordersListResult.rows;
  const totalRevenue = ordersList.reduce((acc: any, order: any) => acc + (pricing[order.duration_days.toString()] || 0), 0);

  const stats = {
    totalOrders: totalOrders.count,
    pendingOrders: pendingOrders.count,
    activeUsers: activeUsers.count,
    totalRevenue
  };

  const ordersResult = await pool.query(`
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
  const orders = ordersResult.rows;

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
