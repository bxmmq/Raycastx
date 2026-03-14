import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import PricingSection from "@/components/PricingSection";
import pool from "@/lib/db";

// Remove db call from render path to avoid errors during build if db is not ready 
// or if we use generateStaticParams. Since it's a dynamic page (using SQLite), 
// we should enforce dynamic rendering if we want real-time prices, 
// but Next.js might cache it. Let's use `unstable_noStore` or `export const dynamic = 'force-dynamic'`
export const dynamic = 'force-dynamic';

async function getPricing() {
  try {
    const result = await pool.query("SELECT value FROM settings WHERE key = $1", ['pricing']);
    const pricingRow = result.rows[0];
    if (!pricingRow) {
      return { '1': 15, '7': 89, '30': 250, '365': 1500 };
    }
    return JSON.parse(pricingRow.value);
  } catch (e) {
    console.error("Database error:", e);
    return { '1': 15, '7': 89, '30': 250, '365': 1500 }; // Fallback
  }
}

import { getSession } from "@/lib/auth";

// ... (getPricing function remains)

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
