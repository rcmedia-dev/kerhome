"use client";

import { useState } from "react";
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
  authDialogRef: React.RefObject<AuthDialogRef | null>;
  userPlan: UserPlan | null;
}

export default function CadastrarImovelButton({
  user,
  authDialogRef,
  userPlan,
}: CadastrarImovelButtonProps) {
  const router = useRouter();
  const [openDialog, setOpenDialog] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      authDialogRef.current?.open();
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
              <Button className="bg-purple-700 hover:bg-purple-800">
                Atualizar Plano
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
