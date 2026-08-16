import type { ReactNode } from "react";
import { Assistant } from "next/font/google";
import { PrototypeBanner } from "@/components/PrototypeBanner";
import "./globals.css";

const assistant = Assistant({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "Verdict — Myntra Growth case",
  description: "Wishlist-to-purchase in 30 days. Concept prototype. Not the Myntra app.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={assistant.className}>
        <PrototypeBanner />
        {children}
      </body>
    </html>
  );
}
