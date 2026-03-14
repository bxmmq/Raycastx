import pool from '@/lib/db';
import PricingManagerClient from './PricingManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminPricingPage() {
  const result = await pool.query("SELECT value FROM settings WHERE key = 'pricing'");
  const pricingRow = result.rows[0];

  let pricing = { '1': 15, '7': 89, '30': 250, '365': 1500 };
  if (pricingRow) {
    pricing = JSON.parse(pricingRow.value);
  }

  return (
    <div>
      <h1 className="text-3xl font-bold font-serif mb-8 heading-spacing">ตั้งราคาแพ็กเกจ Canva Pro</h1>
      <PricingManagerClient initialPricing={pricing} />
    </div>
  );
}
