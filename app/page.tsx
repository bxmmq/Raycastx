import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import PricingSection from "@/components/PricingSection";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

async function getPricing() {
  const fallback = { '1': 15, '7': 89, '30': 250, '365': 1500 };
  try {
    if (!pool || typeof pool.query !== 'function') {
      return fallback;
    }
    const result = await pool.query("SELECT value FROM settings WHERE key = $1", ['pricing']);
    const pricingRow = result.rows?.[0];
    if (!pricingRow) return fallback;
    return JSON.parse(pricingRow.value);
  } catch (e: any) {
    console.error("Database error in getPricing:", e?.message || e);
    return fallback;
  }
}

export default async function Home() {
  const pricing = await getPricing();
  const session = await getSession();

  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <PricingSection pricing={pricing} session={session} />
      
      <footer className="py-8 text-center text-gray-600 border-t border-white/10 mt-20 text-sm">
        <p>&copy; {new Date().getFullYear()} Raycast Canva PRO. All rights reserved.</p>
        <p className="mt-2 text-xs opacity-50">Not affiliated with Canva. This is an independent service.</p>
      </footer>
    </main>
  );
}
