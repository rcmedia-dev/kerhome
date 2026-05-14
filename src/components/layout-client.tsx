"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import TopBar from "@/components/top-bar";
import { AuthDialog } from "./login-modal";
import { ChatWidget } from "./chat/chat-widget";
import { cn } from "@/lib/utils";
import GoogleAnalyticsClient from "@/components/google-analytics";
import { MobileMenu } from "@/components/mobile-menu";

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboardPage =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin/dashboard");

  return (
    <div className={cn(
      "flex flex-col min-h-screen",
      isDashboardPage && "h-screen overflow-hidden"
    )}>
      {/* Chat widget rendered ONCE for the entire app — prevents double portal from dual Header mount */}
      <ChatWidget />

      {/* Desktop: TopBar + Header stacked */}
      <div className="hidden md:flex sticky top-0 z-50 w-full flex-col [&_header]:top-10 shrink-0">
        <TopBar />
        <Header />
      </div>
      {/* Mobile: Header only */}
      <div className="md:hidden shrink-0">
        <Header />
      </div>

      <main className={cn(
        "flex-1 min-h-0",
        !isDashboardPage && "pb-14"
      )}>
        <GoogleAnalyticsClient />
        {children}
      </main>

      <AuthDialog />
      {!isDashboardPage && (
        <>
          <Footer />
          <MobileMenu />
        </>
      )}
    </div>
  );
}
