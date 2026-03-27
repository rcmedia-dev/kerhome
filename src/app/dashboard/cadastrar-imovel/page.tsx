'use client'

import MultiStepForm from "@/components/multi-step-form";
import { useUserStore } from "@/lib/store/user-store";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user } = useUserStore();
  const { userAgency, isLoading } = useDashboardData(user?.id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <MultiStepForm 
          userId={user?.id} 
          agentName={user?.primeiro_nome as string} 
          userAgency={userAgency?.data}
        />
      </div>
    </div>
  );
}
