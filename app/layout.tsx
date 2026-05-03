import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ConditionalNavbar from "@/components/layout/ConditionalNavbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cocoa Disease Detection | AI-Powered Plant Care",
  description: "AI-based cocoa disease detection system for early diagnosis and plant care",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <div suppressHydrationWarning>{children}</div>
        <ConditionalNavbar />
      </body>
    </html>
  );
}
