import type { Metadata } from "next";
import { Bai_Jamjuree } from "next/font/google";
import "./globals.css";
import LenisProvider from "@/components/LenisProvider";
import PageTransition from "@/components/PageTransition";

import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";

const baiJamjuree = Bai_Jamjuree({
  variable: "--font-bai-jamjuree",
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Raycast | Canva PRO",
  description: "Premium Canva Pro subscriptions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={cn("dark font-sans", baiJamjuree.variable)}>
      <body
        className={`${baiJamjuree.variable} antialiased`}
      >
        <LenisProvider>
          <Navbar />
          <PageTransition>
            {children}
          </PageTransition>
        </LenisProvider>
      </body>
    </html>
  );
}
