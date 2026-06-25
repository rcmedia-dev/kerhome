"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/lib/store/ui-store";
import { createClient } from "@/lib/supabase/client";

interface AuthDialogRef {
  open: () => void;
}

interface UserPlan {
  nome: string;
  limite: number;
  restante: number;
  destaques: boolean;
  destaquesPermitidos: number;
  pacote_agente_id: string;
}

interface CadastrarImovelButtonProps {
  user: any;
  userPlan: UserPlan | null;
}

export default function CadastrarImovelButton({
  user,
  userPlan,
}: CadastrarImovelButtonProps) {
  const router = useRouter();
  const [openDialog, setOpenDialog] = useState(false);
  const [openAgentDialog, setOpenAgentDialog] = useState(false);
  const { openAuthModal } = useUIStore();

  const checkingRef = useRef(false);

  const handleClick = async (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      openAuthModal();
      return;
    }

    // Se não for agente ou admin localmente, verificar do servidor antes de bloquear
    if (user.role !== "agent" && user.role !== "admin" && !checkingRef.current) {
      e.preventDefault();
      checkingRef.current = true;
      try {
        const supabase = createClient();
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        if (profile?.role === "agent" || profile?.role === "admin") {
          // Store desatualizada — atualiza e permite navegar
          const { useUserStore } = await import("@/lib/store/user-store");
          useUserStore.getState().updateUser({ role: profile.role });
          router.push("/dashboard/cadastrar-imovel");
          return;
        }
      } catch {
        // erro de rede — mostra o diálogo normal
      } finally {
        checkingRef.current = false;
      }
      setOpenAgentDialog(true);
      return;
    }

    if (userPlan && userPlan.restante <= 0) {
      e.preventDefault();
      setOpenDialog(true);
      return;
    }

    router.push("/dashboard/cadastrar-imovel");
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-sm font-medium text-white rounded-xl border border-purple-700 transition-all duration-200 shadow-sm"
      >
        Cadastrar Imóvel
      </button>

      {/* Dialog quando atingiu o limite */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Limite atingido</DialogTitle>
            <DialogDescription>
              Você já cadastrou o número máximo de imóveis permitido pelo seu plano.
              Para subir mais imóveis, atualize para um plano superior.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Fechar
            </Button>
            <Link href="/planos">
              <Button className="bg-purple-700 hover:bg-purple-800 rounded-xl">
                Atualizar Plano
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para não-agentes: redireciona para tornar-se agente */}
      <Dialog open={openAgentDialog} onOpenChange={setOpenAgentDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Tornar-se Agente</DialogTitle>
            <DialogDescription>
              Apenas agentes podem cadastrar imóveis na Kercasa. 
              Solicite tornar-se agente no seu dashboard para começar a anunciar propriedades.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpenAgentDialog(false)}>
              Fechar
            </Button>
            <Link href="/dashboard">
              <Button className="bg-purple-700 hover:bg-purple-800 rounded-xl">
                Ir para Dashboard
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

