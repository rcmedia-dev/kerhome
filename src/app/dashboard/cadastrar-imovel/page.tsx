'use client'

import { useAuth } from "@/components/auth-context";
import MultiStepForm from "@/components/multi-step-form";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <MultiStepForm userId={user?.id} />
      </div>
    </div>
  );
}