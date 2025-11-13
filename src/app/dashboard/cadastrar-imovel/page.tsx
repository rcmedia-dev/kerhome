'use client'

import MultiStepForm from "@/components/multi-step-form";
import { useUserStore } from "@/lib/store/user-store";

export default function Home() {
  const { user } = useUserStore();

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <MultiStepForm userId={user?.id} agentName={user?.primeiro_nome as string} />
      </div>
    </div>
  );
}