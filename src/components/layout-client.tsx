"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { N8nChat } from "@/components/n8n-chat"; // importa o chat no lugar do FloatingChat

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboardPage = pathname.startsWith("/admin/dashboard");

  return (
    <>
      {!isDashboardPage && <Header />}
      {children}
      {!isDashboardPage && <Footer />}
    </>
  );
}
