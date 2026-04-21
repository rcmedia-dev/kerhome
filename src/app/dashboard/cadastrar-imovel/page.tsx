'use client'

import MultiStepForm from "@/components/multi-step-form";
import { useUserStore } from "@/lib/store/user-store";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user } = useUserStore();
  const { userAgency, isLoading } = useDashboardData(user?.id);
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-100 py-4 lg:py-[4dvh] flex flex-col justify-center overflow-hidden z-40">
      {/* Absolute Back Button */}
      <div className="absolute top-4 left-4 lg:top-6 lg:left-6 z-50">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2.5 bg-white/90 backdrop-blur-md hover:bg-white text-gray-700 hover:text-purple-600 rounded-full shadow-sm hover:shadow-md transition-all font-semibold text-sm group"
        >
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          Voltar
        </button>
      </div>

      <div className="container mx-auto px-4 mt-16 lg:mt-0 h-full lg:h-[92dvh] flex flex-col justify-center">
        <MultiStepForm 
          userId={user?.id} 
          agentName={user?.primeiro_nome as string} 
          userAgency={userAgency?.data}
        />
      </div>
    </div>
  );
}
