import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth-context";
import "@n8n/chat/style.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import TopBar from "@/components/top-bar";
import { AuthDialog } from "@/components/login-modal";
import { ChatWidget } from "@/components/chat/chat-widget";
import FloatingActions from "@/components/floating-actions";
import GoogleAnalyticsClient from "@/components/google-analytics";
import { MobileMenu } from "@/components/mobile-menu";
import LoaderProviders from "@/app/providers";

export const metadata: Metadata = {
  title: "Kercasa - Seu lar, começa aqui",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body className="antialiased font-sans" suppressHydrationWarning>
        <AuthProvider>
          <LoaderProviders>
            <div id="global-layout-root" className="flex flex-col min-h-screen">
              <ChatWidget />
              {/* Desktop: TopBar + Header stacked */}
              <div className="hidden md:flex sticky top-0 z-50 w-full flex-col [&_header]:top-10 shrink-0">
                <TopBar />
                <Header />
              </div>
              {/* Mobile: Header only */}
              <div id="global-mobile-header" className="md:hidden shrink-0">
                <Header />
              </div>
              <main className="flex-1 min-h-0 pb-14">
                <GoogleAnalyticsClient />
                {children}
              </main>
              <AuthDialog />
              <Footer />
              <MobileMenu />
              <FloatingActions />
            </div>
          </LoaderProviders>
        </AuthProvider>
      </body>
    </html>
  );
}

