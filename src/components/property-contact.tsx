'use client'

import AgentCardWithChat from "@/components/agent-card-with-chat";
import { useUserStore } from "@/lib/store/user-store";
import { TPropertyResponseSchema } from "@/lib/types/property";

// ===== COMPONENTE PROPERTY CONTACT =====
export function PropertyContact({
  property,
  ownerDetails,
}: {
  property: TPropertyResponseSchema;
  ownerDetails: any;
}) {
  const { user } = useUserStore(); // 👈 pega o user da store

  console.log("🔍 PropertyContact props:", {
    propertyId: property?.id,
    ownerDetails,
    userId: user?.id,
  });

  if (!ownerDetails) {
    return (
      <div className="bg-white rounded-xl p-5 shadow-sm border text-gray-500">
        Nenhum corretor disponível para este imóvel.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Entre em contato com o corretor
      </h3>
      <AgentCardWithChat
        ownerData={ownerDetails}
        propertyId={property.id}
        userId={user?.id} 
      />
    </div>
  );
}
