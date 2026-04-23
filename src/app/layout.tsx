import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth-context";
import { Toaster } from "@/components/ui/sonner";
import "@n8n/chat/style.css";
import LayoutClient from "@/components/layout-client";
import LoaderProviders from "@/app/providers";
import { MobileMenu } from "@/components/mobile-menu";
import GoogleAnalyticsClient from "@/components/google-analytics";

export const metadata: Metadata = {
  title: "Kercasa - Seu lar, começa aqui",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body className="antialiased font-sans" suppressHydrationWarning>
        <AuthProvider>
          <LoaderProviders>
            <LayoutClient>
              <main className="pb-14"> {/* ðŸ‘ˆ dá espaço pro menu fixo */}
                <GoogleAnalyticsClient />
                {children}
              </main>
              <Toaster richColors position="top-right" />
              <MobileMenu /> {/* ðŸ‘ˆ aqui o menu aparece em todas as páginas */}
            </LayoutClient>
          </LoaderProviders>
        </AuthProvider>
      </body>
    </html>
  );
}

