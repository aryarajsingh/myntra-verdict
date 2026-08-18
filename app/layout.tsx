import type { ReactNode } from "react";
import { Fraunces, Outfit } from "next/font/google";
import { CaseCloser } from "@/components/CaseCloser";
import { TourProvider } from "@/components/LayoutTour";
import { SiteNav } from "@/components/SiteNav";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-ui",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
  variable: "--font-display",
});

export const metadata = {
  title: "Verdict — Myntra Growth case",
  description: "NextLeap case: wishlist → 30-day purchase, no coupons. Not the Myntra app.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${fraunces.variable}`}>
      <body className={outfit.className}>
        <TourProvider>
          <SiteNav />
          {children}
          <CaseCloser />
        </TourProvider>
      </body>
    </html>
  );
}
