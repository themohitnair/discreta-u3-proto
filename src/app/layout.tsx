import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

import './globals.css'
import Navigation from "@/components/Navigation";

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
  });

  export const metadata: Metadata = {
    title: "Discreta (Prototype)",
    description: "Gamified Learning",
  };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={geistMono.className}>
        <Navigation />
        {children}
      </body>
    </html>
  )
}


