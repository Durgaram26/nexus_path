import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';
import ThemeInitializer from '@/components/ThemeInitializer';

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Profectus - Learning & Career Path Platform",
  description: "A professional learning management system for students, faculty, and administrators to manage career paths, courses, and academic progress.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${geistMono.variable} antialiased font-sans`}>
        <ThemeInitializer />
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
