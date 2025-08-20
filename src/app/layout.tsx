import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth-context";
import { Toaster } from "@/components/ui/sonner";
import LayoutClient from "@/components/layout-client";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'Kercasa - Seu lar, começa aqui',
  icons: {
    icon: '/favicon.png', // caminho relativo à pasta /public
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <LayoutClient>{children}</LayoutClient>
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
