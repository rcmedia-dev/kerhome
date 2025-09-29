import Link from "next/link";
import { Upload } from "lucide-react";
import { AgentRequestButton } from "./dashboard";

type UserActionProps = {
  isLoading: boolean;
  isError: boolean;
  profile: any; // tipar melhor conforme teu schema
  user: any; // tipar melhor conforme teu schema
  displayName: string;
  queryClient: any;
  housesRemaining: number; // número de imóveis restantes que o user pode cadastrar
};

export function UserAction({
  isLoading,
  isError,
  profile,
  user,
  displayName,
  queryClient,
  housesRemaining,
}: UserActionProps) {
  if (isLoading) {
    return <span className="text-gray-500 text-sm">Carregando...</span>;
  }

  if (isError) {
    return <span className="text-red-500 text-sm">Erro ao carregar perfil</span>;
  }

  if (!profile?.role) {
    return <span className="text-gray-500 text-sm">Perfil sem role definida</span>;
  }

  // ===== Se for user comum
  if (profile.role === "user") {
    return (
      <AgentRequestButton 
        userId={user.id} 
        userName={displayName} 
        queryClient={queryClient} 
      />
    );
  }

  // ===== Se for agente
  if (profile.role === "agent") {
    if (housesRemaining === 0) {
      return (
        <span className="text-orange-600 text-sm font-medium">
          Você atingiu o limite de propriedades. Atualize seu plano para cadastrar mais imóveis.
        </span>
      );
    }

    return (
      <Link
        href="/dashboard/cadastrar-imovel"
        className="flex justify-center items-center px-3 sm:px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm md:text-base w-full md:w-auto mt-4 md:mt-0"
      >
        <Upload className="w-4 h-4 mr-2" />
        Enviar Propriedade
      </Link>
    );
  }

  return null;
}
