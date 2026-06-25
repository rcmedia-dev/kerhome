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
import { OrganizationJsonLd } from "@/components/json-ld";
import { Toaster } from "@/components/ui/sonner";
import { PageTransition } from "@/components/page-transition";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kercasa.com';

export const metadata: Metadata = {
  title: {
    default: "Kercasa - Seu lar, começa aqui",
    template: "%s | Kercasa",
  },
  description: "Plataforma imobiliária inteligente em Angola. Anuncie, compre ou arrende imóveis com o poder da IA. Kercasa — o seu lar começa aqui.",
  keywords: ["imóveis Angola", "comprar casa Angola", "arrendar imóvel", "agentes imobiliários", "Kercasa", "imobiliária online", "casa Luanda", "apartamento Benguela"],
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "Kercasa - Seu lar, começa aqui",
    description: "Plataforma imobiliária inteligente em Angola. Anuncie, compre ou arrende imóveis com o poder da IA.",
    url: SITE_URL,
    siteName: "Kercasa",
    locale: "pt_AO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kercasa - Seu lar, começa aqui",
    description: "Plataforma imobiliária inteligente em Angola. Anuncie, compre ou arrende imóveis com o poder da IA.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: SITE_URL,
  },
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
        <OrganizationJsonLd />
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
                <PageTransition>{children}</PageTransition>
              </main>
              <AuthDialog />
              <Footer />
              <MobileMenu />
              <FloatingActions />
            </div>
            <Toaster closeButton richColors position="top-right" />
          </LoaderProviders>
        </AuthProvider>
      </body>
    </html>
  );
}

