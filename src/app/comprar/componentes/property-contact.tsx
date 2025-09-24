import AgentCardWithChat from "@/components/agent-card-with-chat";
import { TPropertyResponseSchema } from "@/lib/types/property";

// ===== COMPONENTE PROPERTY CONTACT =====
export function PropertyContact({ property, ownerDetails, user }: { 
  property: TPropertyResponseSchema; 
  ownerDetails: any; 
  user: any;
}) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Entre em contato com o corretor
      </h3>
      <AgentCardWithChat ownerData={ownerDetails} propertyId={property.id} userId={user?.id}/>
    </div>
  );
};