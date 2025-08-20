'use client'

import { UserPlus, Eye, Edit, Trash2 } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { getUsers } from '../dashboard/actions/get-users';
import Link from 'next/link';
import { deleteUser } from '../dashboard/actions/create-user';
import { toast } from 'sonner';

type User = {
  id: number;
  primeiro_nome?: string;
  ultimo_nome?: string;
  email?: string;
  telefone?: string;
  empresa?: string;
  licenca?: string;
  facebook?: string;
  linkedin?: string;
  instagram?: string;
  youtube?: string;
  sobre_mim?: string;
  created_at?: string;
  updated_at?: string;
  role: 'Agente' | 'Administrador' | null;
  status: 'active' | 'inactive';
};

type UsersManagementProps = {
  darkMode: boolean;
  initialUsers?: User[]; // Opcional: para SSR/SSG
};

export function UserManagement({ darkMode, initialUsers = [] }: UsersManagementProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [loading, setLoading] = useState(!initialUsers.length);
  const [error, setError] = useState<string | null>(null);

   const [isPending, startTransition] = useTransition()

  const handleDelete = ( userId: string) => {
    startTransition(async () => {
      const res = await deleteUser(userId);
      if (res.success) {
        toast.message("Usuário deletado com sucesso ✅")
      } else {
        toast.warning("Erro ao deletar: " + res.error)
      }
    })
  }

  useEffect(() => {
    if (!initialUsers.length) {
      fetchUsers();
      console.log('initial users:', initialUsers)
    }
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      // Transforme os dados conforme necessário para corresponder ao tipo User
      const transformedUsers = data.map((user: User) => ({
        ...user,
        status: user.status || 'active', // Defina um valor padrão se necessário
        role: user.role as 'Agente' | 'Administrador' | null
      }));
      setUsers(transformedUsers);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  console.log('users fetched from db:', users)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 rounded-lg ${darkMode ? 'bg-red-900/30' : 'bg-red-100'} text-red-600`}>
        {error}
        <button 
          onClick={fetchUsers} 
          className="ml-4 px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Gestão de Utilizadores
        </h2>
        <Link 
          href={`/admin/dashboard/users/create`}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors">
          <UserPlus className="w-4 h-4 mr-2" />
          Adicionar Utilizador
        </Link>
      </div>

      <div
        className={`rounded-xl border shadow-sm overflow-hidden ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}
                >
                  Utilizador
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}
                >
                  Tipo
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}
                >
                  Registado
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}
                >
                  Status
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}
                >
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className={`hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {user.primeiro_nome} {user.ultimo_nome}
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {user.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'Agente'
                          ? 'bg-purple-100 text-purple-800'
                          : user.role === 'Administrador'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {user.role || 'Desconhecido'}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex space-x-2">
                      <Link 
                        href={`/admin/dashboard/users/${user.id}`}
                        className="text-blue-600 hover:text-blue-800">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link 
                        href={`/admin/dashboard/users/edit/${user.id}`}
                        className="text-gray-600 hover:text-gray-800">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(user.id.toString())}
                        className="text-red-600 hover:text-red-800">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;