"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import TopBar from "@/components/top-bar";
import { AuthDialog } from "./login-modal";
import { ChatWidget } from "./chat/chat-widget";

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboardPage =
    pathname.startsWith("/admin/dashboard") ||
    pathname.includes("/dashboard/cadastrar-imovel");

  return (
    <>
      {/* Chat widget rendered ONCE for the entire app — prevents double portal from dual Header mount */}
      <ChatWidget />

      {!isDashboardPage && (
        <>
          {/* Desktop: TopBar + Header stacked */}
          <div className="hidden md:flex sticky top-0 z-50 w-full flex-col [&_header]:top-10">
            <TopBar />
            <Header />
          </div>
          {/* Mobile: Header only */}
          <div className="md:hidden">
            <Header />
          </div>
        </>
      )}

      {children}
      <AuthDialog />
      {!isDashboardPage && <Footer />}
    </>
  );
}
