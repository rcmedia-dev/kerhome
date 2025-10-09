'use client'

import { UserPlus, Eye, Edit, Trash2, CheckCircle, XCircle, Mail, Phone, Building, Shield, User, Calendar, Crown, Zap, Star, Grid, List, Filter, Search, Download, MoreVertical, Ban, ShieldAlert, Clock } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { getUsers } from '../dashboard/actions/get-users';
import Link from 'next/link';
import { deleteUser } from '../dashboard/actions/create-user';
import { toast } from 'sonner';
import Image from 'next/image';

type User = {
  id: number;
  primeiro_nome?: string;
  ultimo_nome?: string;
  email?: string;
  telefone?: string;
  empresa?: string;
  role: 'Agente' | 'Administrador' | null;
  status: 'active' | 'inactive' | 'pending' | 'banned';
  created_at?: string;
  plano?: {
    nome: string;
    status: 'pending' | 'approved' | 'rejected';
  } | null;
  avatar?: string;
  banned_at?: string;
  ban_reason?: string;
};

type UsersManagementProps = {
  darkMode: boolean;
  initialUsers?: User[];
};

export function UserManagement({ darkMode, initialUsers = [] }: UsersManagementProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [loading, setLoading] = useState(!initialUsers.length);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive' | 'pending' | 'banned'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPending, startTransition] = useTransition();
  const [banDialog, setBanDialog] = useState<{ isOpen: boolean; userId: number | null; reason: string }>({
    isOpen: false,
    userId: null,
    reason: ''
  });

  const handleDelete = (userId: string) => {
    startTransition(async () => {
      const res = await deleteUser(userId);
      if (res.success) {
        toast.success('Usuário deletado com sucesso');
        setUsers((prev) => prev.filter((u) => u.id.toString() !== userId));
      } else {
        toast.error('Erro ao deletar: ' + res.error);
      }
    });
  };

  const handleBan = (userId: number) => {
    setBanDialog({
      isOpen: true,
      userId,
      reason: ''
    });
  };

  const confirmBan = () => {
    if (!banDialog.userId) return;

    startTransition(async () => {
      // Simular API call para banir usuário
      const res = { success: true };
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === banDialog.userId
              ? {
                  ...u,
                  status: 'banned',
                  banned_at: new Date().toISOString(),
                  ban_reason: banDialog.reason
                }
              : u
          )
        );
        toast.success('Usuário banido com sucesso');
        setBanDialog({ isOpen: false, userId: null, reason: '' });
      } else {
        toast.error('Erro ao banir usuário');
      }
    });
  };

  const handleUnban = (userId: number) => {
    startTransition(async () => {
      // Simular API call para desbanir usuário
      const res = { success: true };
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  status: 'active',
                  banned_at: undefined,
                  ban_reason: undefined
                }
              : u
          )
        );
        toast.success('Usuário desbanido com sucesso');
      } else {
        toast.error('Erro ao desbanir usuário');
      }
    });
  };

  const handlePlanoAction = (userId: number, action: 'approve' | 'reject') => {
    startTransition(async () => {
      const res = { success: true };
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId
              ? { ...u, plano: { ...u.plano!, status: action === 'approve' ? 'approved' : 'rejected' } }
              : u
          )
        );
        toast.success(action === 'approve' ? 'Plano aprovado' : 'Plano rejeitado');
      } else {
        toast.error('Erro ao atualizar plano');
      }
    });
  };

  useEffect(() => {
    if (!initialUsers.length) {
      fetchUsers();
    }
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      const transformedUsers = data.map((user: User) => ({
        ...user,
        status: user.status || 'active',
        role: user.role as 'Agente' | 'Administrador' | null,
      }));
      setUsers(transformedUsers);
    } catch (err) {
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    if (activeTab !== 'all' && user.status !== activeTab) return false;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.primeiro_nome?.toLowerCase().includes(searchLower) ||
        user.ultimo_nome?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.empresa?.toLowerCase().includes(searchLower) ||
        user.telefone?.includes(searchTerm)
      );
    }
    
    return true;
  });

  const countByStatus = (status: 'active' | 'inactive' | 'pending' | 'banned') =>
    users.filter(u => u.status === status).length;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active': return { color: 'bg-green-100 text-green-700', label: 'Ativo', icon: CheckCircle };
      case 'pending': return { color: 'bg-yellow-100 text-yellow-700', label: 'Pendente', icon: ClockIcon };
      case 'inactive': return { color: 'bg-red-100 text-red-700', label: 'Inativo', icon: XCircle };
      case 'banned': return { color: 'bg-red-100 text-red-700 border border-red-300', label: 'Banido', icon: Ban };
      default: return { color: 'bg-gray-100 text-gray-700', label: 'Desconhecido', icon: User };
    }
  };

  const getRoleConfig = (role: string) => {
    switch (role) {
      case 'Administrador': return { color: 'bg-blue-100 text-blue-700', icon: Shield };
      case 'Agente': return { color: 'bg-purple-100 text-purple-700', icon: User };
      default: return { color: 'bg-gray-100 text-gray-700', icon: User };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-10 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden animate-pulse h-80"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestão de Utilizadores</h1>
          <p className="text-gray-600">Gerencie todos os utilizadores da plataforma</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="flex-1 relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Pesquisar utilizadores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-xl transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-purple-100 text-purple-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-xl transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-purple-100 text-purple-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <List size={20} />
              </button>
              <button className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors">
                <Filter size={20} />
              </button>
              <button className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors">
                <Download size={20} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mt-4">
            {[
              { key: 'all', label: 'Todos', count: users.length },
              { key: 'active', label: 'Ativos', count: countByStatus('active') },
              { key: 'pending', label: 'Pendentes', count: countByStatus('pending') },
              { key: 'inactive', label: 'Inativos', count: countByStatus('inactive') },
              { key: 'banned', label: 'Banidos', count: countByStatus('banned') },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeTab === tab.key
                    ? "bg-white text-purple-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                }`}
              >
                {tab.label}
                <span className={`px-2 py-1 rounded-full text-xs ${
                  activeTab === tab.key 
                    ? "bg-purple-100 text-purple-600" 
                    : "bg-gray-200 text-gray-600"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {viewMode === 'grid' ? (
          <GridUsersView 
            users={filteredUsers} 
            onDelete={handleDelete}
            onBan={handleBan}
            onUnban={handleUnban}
            onPlanoAction={handlePlanoAction}
          />
        ) : (
          <ListView 
            users={filteredUsers} 
            onDelete={handleDelete}
            onBan={handleBan}
            onUnban={handleUnban}
            onPlanoAction={handlePlanoAction}
          />
        )}

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="col-span-full text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <User size={40} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum utilizador encontrado
            </h3>
            <p className="text-gray-600">
              {searchTerm ? 'Nenhum resultado para sua pesquisa.' : `Não há utilizadores com o status "${activeTab}" no momento.`}
            </p>
          </div>
        )}

        {/* Add User Button */}
        <div className="fixed bottom-6 right-6">
          <Link
            href="/admin/dashboard/users/create"
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 flex items-center gap-2 group"
          >
            <UserPlus size={20} />
            <span className="font-semibold">Adicionar</span>
          </Link>
        </div>

        {/* Ban Dialog */}
        {banDialog.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <Ban className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Banir Utilizador</h3>
                  <p className="text-sm text-gray-600">Tem certeza que deseja banir este utilizador?</p>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo do banimento (opcional)
                </label>
                <textarea
                  value={banDialog.reason}
                  onChange={(e) => setBanDialog(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Descreva o motivo do banimento..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setBanDialog({ isOpen: false, userId: null, reason: '' })}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmBan}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Ban size={16} />
                  Banir Utilizador
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Grid View Component
function GridUsersView({ users, onDelete, onBan, onUnban, onPlanoAction }: { 
  users: User[]; 
  onDelete: (id: string) => void; 
  onBan: (id: number) => void;
  onUnban: (id: number) => void;
  onPlanoAction: (id: number, action: 'approve' | 'reject') => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {users.map((user) => (
        <UserCard 
          key={user.id} 
          user={user} 
          onDelete={onDelete}
          onBan={onBan}
          onUnban={onUnban}
          onPlanoAction={onPlanoAction}
        />
      ))}
    </div>
  );
}

// List View Component
function ListView({ users, onDelete, onBan, onUnban, onPlanoAction }: { 
  users: User[]; 
  onDelete: (id: string) => void; 
  onBan: (id: number) => void;
  onUnban: (id: number) => void;
  onPlanoAction: (id: number, action: 'approve' | 'reject') => void;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Utilizador</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Contacto</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Estado</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Plano</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
                      {user.avatar ? (
                        <Image src={user.avatar} alt="" width={40} height={40} className="rounded-xl" />
                      ) : (
                        <User size={20} />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {user.primeiro_nome} {user.ultimo_nome}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{user.telefone || '-'}</div>
                  <div className="text-sm text-gray-500">{user.empresa || '-'}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusConfig(user.status).color}`}>
                    {getStatusConfig(user.status).label}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {user.plano ? (
                    <div className="text-sm">
                      <div className="font-medium">{user.plano.nome}</div>
                      <div className={`text-xs ${
                        user.plano.status === 'approved' ? 'text-green-600' :
                        user.plano.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {user.plano.status === 'approved' ? 'Aprovado' :
                         user.plano.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">Sem plano</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/dashboard/users/${user.id}`}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Eye size={16} />
                    </Link>
                    <Link
                      href={`/admin/dashboard/users/edit/${user.id}`}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit size={16} />
                    </Link>
                    {user.status === 'banned' ? (
                      <button
                        onClick={() => onUnban(user.id)}
                        className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                        title="Desbanir usuário"
                      >
                        <ShieldAlert size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={() => onBan(user.id)}
                        className="p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Banir usuário"
                      >
                        <Ban size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(user.id.toString())}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// User Card Component
function UserCard({ user, onDelete, onBan, onUnban, onPlanoAction }: { 
  user: User; 
  onDelete: (id: string) => void; 
  onBan: (id: number) => void;
  onUnban: (id: number) => void;
  onPlanoAction: (id: number, action: 'approve' | 'reject') => void;
}) {
  const roleConfig = getRoleConfig(user.role || '');
  const statusConfig = getStatusConfig(user.status);
  const RoleIcon = roleConfig.icon;
  const StatusIcon = statusConfig.icon;

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
      user.status === 'banned' ? 'border-red-300 bg-red-50' : ''
    }`}>
      <div className={`p-6 relative ${
        user.status === 'banned' 
          ? 'bg-gradient-to-r from-red-50 to-red-100' 
          : 'bg-gradient-to-r from-gray-50 to-gray-100'
      }`}>
        {user.status === 'banned' && (
          <div className="absolute top-4 left-4">
            <div className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <Ban size={12} />
              BANIDO
            </div>
          </div>
        )}
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white ${
            user.status === 'banned' 
              ? 'bg-gradient-to-br from-red-500 to-red-600' 
              : 'bg-gradient-to-br from-blue-500 to-purple-600'
          }`}>
            {user.avatar ? (
              <Image src={user.avatar} alt="" width={64} height={64} className="rounded-2xl" />
            ) : (
              <User size={32} />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {user.primeiro_nome} {user.ultimo_nome}
            </h3>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
        </div>
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${roleConfig.color} flex items-center gap-1`}>
            <RoleIcon size={12} />
            {user.role}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusConfig.color} flex items-center gap-1`}>
            <StatusIcon size={12} />
            {statusConfig.label}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Phone size={16} className="text-gray-400" />
            {user.telefone || 'Sem telefone'}
          </div>
          {user.empresa && (
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Building size={16} className="text-gray-400" />
              {user.empresa}
            </div>
          )}
          {user.status === 'banned' && user.ban_reason && (
            <div className="flex items-start gap-3 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              <Ban size={16} className="mt-0.5 flex-shrink-0" />
              <span className="font-medium">Motivo: {user.ban_reason}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
          <Link
            href={`/admin/dashboard/users/${user.id}`}
            className="flex-1 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
          >
            <Eye size={16} /> Ver
          </Link>
          <Link
            href={`/admin/dashboard/users/edit/${user.id}`}
            className="flex-1 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
          >
            <Edit size={16} /> Editar
          </Link>
          {user.status === 'banned' ? (
            <button
              onClick={() => onUnban(user.id)}
              className="px-3 py-2 text-sm font-medium rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
              title="Desbanir usuário"
            >
              <ShieldAlert size={16} />
            </button>
          ) : (
            <button
              onClick={() => onBan(user.id)}
              className="px-3 py-2 text-sm font-medium rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
              title="Banir usuário"
            >
              <Ban size={16} />
            </button>
          )}
          <button
            onClick={() => onDelete(user.id.toString())}
            className="px-3 py-2 text-sm font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getRoleConfig(role: string) {
  switch (role) {
    case 'Administrador': return { color: 'bg-blue-100 text-blue-700', icon: Shield };
    case 'Agente': return { color: 'bg-purple-100 text-purple-700', icon: User };
    default: return { color: 'bg-gray-100 text-gray-700', icon: User };
  }
}

function getStatusConfig(status: string) {
  switch (status) {
    case 'active': return { color: 'bg-green-100 text-green-700', label: 'Ativo', icon: CheckCircle };
    case 'pending': return { color: 'bg-yellow-100 text-yellow-700', label: 'Pendente', icon: Clock };
    case 'inactive': return { color: 'bg-red-100 text-red-700', label: 'Inativo', icon: XCircle };
    case 'banned': return { color: 'bg-red-100 text-red-700 border border-red-300', label: 'Banido', icon: Ban };
    default: return { color: 'bg-gray-100 text-gray-700', label: 'Desconhecido', icon: User };
  }
}

// Clock icon component
function ClockIcon(props: any) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export default UserManagement;