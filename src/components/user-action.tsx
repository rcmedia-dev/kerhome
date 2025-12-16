import Link from "next/link";
import { Upload, Loader2, AlertCircle, User, Crown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { AgentRequestButton } from "@/components/agent-request-button";
import { QueryClient } from "@tanstack/react-query";
import { UserProfile } from "@/lib/store/user-store";

export interface UserActionProps {
  isLoading: boolean;
  isError: boolean;
  profile: UserProfile;
  user: UserProfile;
  displayName: string;
  queryClient: QueryClient | null;
  housesRemaining: number;
}

// Componente de loading animado
const AnimatedLoader = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex items-center space-x-2 text-gray-500"
  >
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
      <Loader2 className="w-4 h-4" />
    </motion.div>
    <span className="text-sm">Carregando...</span>
  </motion.div>
);

// Componente de erro animado
const AnimatedError = () => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-center space-x-2 text-red-500 bg-red-50 px-3 py-2 rounded-lg border border-red-200"
  >
    <AlertCircle className="w-4 h-4" />
    <span className="text-sm font-medium">Erro ao carregar perfil</span>
  </motion.div>
);

// Badge para mostrar o papel do usuário
const RoleBadge = ({ role }: { role: string }) => (
  <motion.span
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    className={cn(
      "px-2 py-1 rounded-full text-xs font-semibold capitalize",
      role === "agent"
        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm"
        : "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm"
    )}
  >
    {role === "agent" ? "Agente" : "Usuário"}
  </motion.span>
);

// Botão de upload com animação
const UploadPropertyButton = ({ housesRemaining }: { housesRemaining: number }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <Link
      href="/dashboard/cadastrar-imovel"
      className={cn(
        "flex items-center justify-center px-4 py-3 rounded-xl transition-all duration-200 font-medium shadow-sm",
        housesRemaining === 0
          ? "bg-gray-400 cursor-not-allowed text-gray-200"
          : "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white hover:shadow-md"
      )}
    >
      <motion.div
        whileHover={{ y: -1 }}
        transition={{ duration: 0.2 }}
        className="flex items-center space-x-2"
      >
        <Upload className="w-4 h-4" />
        <span>Enviar Propriedade</span>
      </motion.div>
    </Link>
  </motion.div>
);

// Mensagem de limite atingido
const LimitReachedMessage = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4 max-w-sm"
  >
    <div className="flex items-start space-x-3">
      <div className="p-2 bg-orange-100 rounded-lg">
        <Crown className="w-4 h-4 text-orange-600" />
      </div>
      <div className="flex-1">
        <h4 className="text-orange-800 font-semibold text-sm mb-1">
          Limite Atingido
        </h4>
        <p className="text-orange-700 text-xs leading-relaxed">
          Você atingiu o limite de propriedades. Atualize seu plano para cadastrar mais imóveis.
        </p>
      </div>
    </div>
  </motion.div>
);

// Container principal com animação de entrada
const ActionContainer = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="flex flex-col items-end space-y-3"
  >
    {children}
  </motion.div>
);

export function UserAction({
  isLoading,
  isError,
  profile,
  user,
  displayName,
  queryClient,
  housesRemaining,
}: UserActionProps) {
  // Estados de loading
  if (isLoading) {
    return (
      <ActionContainer>
        <AnimatedLoader />
      </ActionContainer>
    );
  }

  if (isError) {
    return (
      <ActionContainer>
        <AnimatedError />
      </ActionContainer>
    );
  }

  if (!profile?.role) {
    return (
      <ActionContainer>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center space-x-2 text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200"
        >
          <User className="w-4 h-4" />
          <span className="text-sm">Perfil sem role definida</span>
        </motion.div>
      </ActionContainer>
    );
  }

  return (
    <ActionContainer delay={0.2}>
      {/* Badge do papel do usuário */}
      <div className="flex items-center space-x-3">
        <RoleBadge role={profile.role} />
      </div>

      <AnimatePresence mode="wait">
        {/* ===== Usuário comum ===== */}
        {profile.role === "user" && (
          <motion.div
            key="user-action"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <AgentRequestButton
              userId={user.id}
              userName={displayName}
              queryClient={queryClient}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </ActionContainer>
  );
}