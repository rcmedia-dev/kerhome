'use client'

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { createUser } from '../../actions/create-user';

export function UserForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      // Extrair os dados do formulário
      const data = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        primeiro_nome: formData.get("primeiro_nome") as string,
        ultimo_nome: formData.get("ultimo_nome") as string,
        telefone: formData.get("telefone") as string,
        role: formData.get("role") as "Agente" | "Administrador",
      }

      return await createUser(data)
    },
    null // estado inicial
  )

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    } else if (state?.success) {
      toast.success('Utilizador criado com sucesso!');
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="primeiro_nome" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Primeiro Nome *
          </label>
          <input
            type="text"
            id="primeiro_nome"
            name="primeiro_nome"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            required
          />
        </div>

        <div>
          <label htmlFor="ultimo_nome" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Último Nome *
          </label>
          <input
            type="text"
            id="ultimo_nome"
            name="ultimo_nome"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            required
          />
        </div>

        <div>
          <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Telefone
          </label>
          <input
            type="tel"
            id="telefone"
            name="telefone"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tipo de Utilizador *
          </label>
          <select
            id="role"
            name="role"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            required
          >
            <option value="">Selecione uma opção</option>
            <option value="Agente">Agente</option>
            <option value="Administrador">Administrador</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <Link
          href="/users"
          className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Cancelar
        </Link>
        
        <SubmitButton>
          Criar Utilizador
        </SubmitButton>
      </div>
    </form>
  );
}


export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center justify-center"
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Processando...
        </>
      ) : (
        children
      )}
    </button>
  );
}
