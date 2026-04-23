"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import TopBar from "@/components/top-bar";
import { AuthDialog } from "./login-modal";

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboardPage = pathname.startsWith("/admin/dashboard") || pathname.includes("/dashboard/cadastrar-imovel");

  return (
    <>
      {!isDashboardPage && (
        <>
          {/* Desktop Double Header */}
          <div className="hidden md:flex sticky top-0 z-50 w-full flex-col [&_header]:top-10">
            <TopBar />
            <Header />
          </div>
          {/* Mobile Header Only */}
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

