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
import { OrganizationJsonLd, WebsiteJsonLd } from "@/components/json-ld";
import { Toaster } from "@/components/ui/sonner";
import { PageTransition } from "@/components/page-transition";
import { SplashScreenClient } from "@/components/splash-screen-client";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kercasa.com';

export const metadata: Metadata = {
  title: {
    default: "Kercasa — Imóveis em Angola | Comprar, Vender e Arrendar Casas",
    template: "%s | Kercasa",
  },
  description: "Plataforma imobiliária inteligente em Angola. Encontre casas, apartamentos e vivendas para comprar ou arrendar em Luanda, Benguela, Huíla e mais. Milhares de imóveis verificados.",
  keywords: ["imóveis Angola", "comprar casa Angola", "arrendar imóvel", "agentes imobiliários", "Kercasa", "imobiliária online", "casa Luanda", "apartamento Benguela", "vivenda Talatona", "imóveis Kilamba"],
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "Kercasa — Imóveis em Angola | Comprar, Vender e Arrendar Casas",
    description: "Plataforma imobiliária inteligente em Angola. Encontre casas, apartamentos e vivendas para comprar ou arrendar em Luanda, Benguela, Huíla e mais.",
    url: SITE_URL,
    siteName: "Kercasa",
    locale: "pt_AO",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/kercasa_logo.png`,
        width: 1200,
        height: 630,
        alt: "Kercasa — Plataforma Imobiliária em Angola",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kercasa — Imóveis em Angola | Comprar, Vender e Arrendar Casas",
    description: "Plataforma imobiliária inteligente em Angola. Encontre casas, apartamentos e vivendas para comprar ou arrendar.",
    images: [`${SITE_URL}/kercasa_logo.png`],
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
        <SplashScreenClient />
        <OrganizationJsonLd />
        <WebsiteJsonLd />
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

