import db from '@/lib/db';
import PricingManagerClient from './PricingManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminPricingPage() {
  const stmt = db.prepare("SELECT value FROM settings WHERE key = 'pricing'");
  const result = stmt.get() as { value: string } | undefined;

  let pricing = { '1': 15, '7': 89, '30': 250, '365': 1500 };
  if (result) {
    pricing = JSON.parse(result.value);
  }

  return (
    <div>
      <h1 className="text-3xl font-bold font-serif mb-8 heading-spacing">ตั้งราคาแพ็กเกจ Canva Pro</h1>
      <PricingManagerClient initialPricing={pricing} />
    </div>
  );
}
