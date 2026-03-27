'use client'

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, CheckCircle2, XCircle, Trash2, ShieldCheck, ShieldAlert, Loader2, Plus, X } from 'lucide-react';
import { getImobiliariasWithOwnersAction } from '@/lib/functions/supabase-actions/get-imobiliarias-admin-action';
import { toast } from 'sonner';
import { useState } from 'react';
import { 
  createImobiliariaAction, 
  updateImobiliariaAction,
  toggleImobiliariaVerificationAction, 
  deleteImobiliariaAction,
  uploadLogoAction,
  updateImobiliariaStatusAction
} from '@/lib/functions/supabase-actions/admin-imobiliaria-actions';
import { Pencil, ChevronDown, Check, X as CloseIcon, MoreVertical } from 'lucide-react';

interface Props {
  darkMode: boolean;
}

export default function ImobiliariasManagement({ darkMode }: Props) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [formData, setFormData] = useState({
    nome: '', slug: '', cidade: '', bairro: '', email: '', whatsapp: '', telefone: '', website: '', descricao: '', logo: '', status: 'approved'
  });

  const handleEditClick = (imob: any) => {
    setFormData({
      nome: imob.nome || '',
      slug: imob.slug || '',
      cidade: imob.cidade || '',
      bairro: imob.bairro || '',
      email: imob.email || '',
      whatsapp: imob.whatsapp || '',
      telefone: imob.telefone || '',
      website: imob.website || '',
      descricao: imob.descricao || '',
      logo: imob.logo || '',
      status: imob.status || 'approved'
    });
    setEditingId(imob.id);
    setLogoFile(null);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ nome: '', slug: '', cidade: '', bairro: '', email: '', whatsapp: '', telefone: '', website: '', descricao: '', logo: '', status: 'approved' });
    setEditingId(null);
    setLogoFile(null);
    setShowForm(false);
  };

  // Fetch imobiliarias via server action (uses admin client to bypass RLS)
  const { data: imobiliarias, isLoading, error } = useQuery({
    queryKey: ['admin-imobiliarias'],
    queryFn: () => getImobiliariasWithOwnersAction(),
    staleTime: 2 * 60 * 1000,
  });

  const toggleVerification = useMutation({
    mutationFn: async ({ id, verificada }: { id: string, verificada: boolean }) => {
      const confirmAction = window.confirm(
        verificada 
          ? 'Tem a certeza que deseja remover a verificação desta imobiliária? Ela deixará de ter o selo de destaque.' 
          : 'Confirmar Verificação? Esta imobiliária passará a exibir o selo de confiança Kercasa.'
      );
      
      if (!confirmAction) return;

      const res = await toggleImobiliariaVerificationAction(id, verificada);
      if (!res.success) throw new Error(res.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-imobiliarias'] });
      toast.success('Status de verificação atualizado.');
    },
    onError: (err: any) => {
      if (err.message === 'Action cancelled') return;
      toast.error('Erro ao atualizar verificação: ' + err.message);
    }
  });

  // Update Status
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const res = await updateImobiliariaStatusAction(id, status);
      if (!res.success) throw new Error(res.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-imobiliarias'] });
      toast.success('Status da imobiliária atualizado com sucesso.');
    },
    onError: (err: any) => {
      toast.error('Erro ao atualizar status: ' + err.message);
    }
  });

  // Delete Imobiliaria
  const deleteImobiliaria = useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteImobiliariaAction(id);
      if (!res.success) throw new Error(res.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-imobiliarias'] });
      toast.success('Imobiliária eliminada com sucesso.');
    },
    onError: () => {
      toast.error('Ocorreu um erro ao excluir a imobiliária.');
    }
  });

  // Create Imobiliaria
  const createImobiliaria = useMutation({
    mutationFn: async (data: typeof formData) => {
      setUploadingLogo(true);
      let finalLogoUrl = data.logo;

      if (logoFile) {
        const logoFormData = new FormData();
        logoFormData.append('file', logoFile);
        const uploadRes = await uploadLogoAction(logoFormData);
        if (!uploadRes.success) throw new Error('Erro ao enviar imagem: ' + uploadRes.error);
        finalLogoUrl = uploadRes.url || '';
      }

      setUploadingLogo(false);
      const finalSlug = data.slug || data.nome.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const res = await createImobiliariaAction({ ...data, slug: finalSlug, logo: finalLogoUrl });
      if (!res.success) throw new Error(res.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-imobiliarias'] });
      toast.success('Imobiliária criada com sucesso.');
      resetForm();
    },
    onError: (err: any) => {
      setUploadingLogo(false);
      toast.error('Erro ao criar imobiliária: ' + err.message);
    }
  });

  // Update Imobiliaria
  const updateImobiliaria = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!editingId) throw new Error("ID não encontrado para edição.");
      setUploadingLogo(true);
      let finalLogoUrl = data.logo;

      if (logoFile) {
        const logoFormData = new FormData();
        logoFormData.append('file', logoFile);
        const uploadRes = await uploadLogoAction(logoFormData);
        if (!uploadRes.success) throw new Error('Erro ao enviar imagem: ' + uploadRes.error);
        finalLogoUrl = uploadRes.url || '';
      }

      setUploadingLogo(false);
      const finalSlug = data.slug || data.nome.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const res = await updateImobiliariaAction(editingId, { ...data, slug: finalSlug, logo: finalLogoUrl });
      if (!res.success) throw new Error(res.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-imobiliarias'] });
      toast.success('Imobiliária atualizada com sucesso.');
      resetForm();
    },
    onError: (err: any) => {
      setUploadingLogo(false);
      toast.error('Erro ao atualizar imobiliária: ' + err.message);
    }
  });

  // Handle Input Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 rounded-lg bg-red-50 border border-red-200">
        Erro ao carregar imobiliárias.
      </div>
    );
  }

  const pendingCount = imobiliarias?.filter(i => i.status === 'pending').length || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Pedidos de Imobiliárias
          </h2>
          {pendingCount > 0 && (
            <p className="text-orange-600 text-sm font-medium mt-0.5">
              {pendingCount} pedido{pendingCount > 1 ? 's' : ''} aguardando análise
            </p>
          )}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${ 
            darkMode ? 'border-gray-600 text-gray-400 hover:bg-gray-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
          }`}
        >
          {showForm ? 'Ocultar Ações Avançadas' : 'Ações Avançadas (Admin)'}
        </button>
      </div>

      {showForm && (
        <div className={`p-4 rounded-xl border-2 border-dashed ${ darkMode ? 'border-gray-600 bg-gray-800/50' : 'border-gray-200 bg-gray-50' }`}>
          <p className={`text-xs mb-4 font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Criação Manual de Imobiliária (uso interno apenas)</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Nome da Empresa *</label>
              <input type="text" name="nome" required value={formData.nome} onChange={handleChange} className={`w-full p-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Slug (URL amigável)</label>
              <input type="text" name="slug" placeholder="Ex: minha-imobiliaria (vazio = auto)" value={formData.slug} onChange={handleChange} className={`w-full p-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Cidade *</label>
              <input type="text" name="cidade" required value={formData.cidade} onChange={handleChange} className={`w-full p-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Bairro</label>
              <input type="text" name="bairro" value={formData.bairro} onChange={handleChange} className={`w-full p-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className={`w-full p-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>WhatsApp</label>
              <input type="text" name="whatsapp" value={formData.whatsapp} onChange={handleChange} className={`w-full p-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Logo (Imagem)</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)} 
                className={`w-full p-2 border rounded-lg file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`} 
              />
              {formData.logo && !logoFile && (
                <p className="text-xs text-green-600 mt-1">Imagem atual preservada. Adicione uma nova para substituir.</p>
              )}
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Website (https://...)</label>
              <input type="text" name="website" placeholder="ex: angoluxe.co.ao" value={formData.website} onChange={handleChange} className={`w-full p-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`} />
            </div>
            <div className="md:col-span-1">
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status de Aprovação</label>
              <select name="status" value={formData.status} onChange={handleChange as any} className={`w-full p-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`}>
                <option value="pending">Pendente</option>
                <option value="approved">Aprovado</option>
                <option value="rejected">Rejeitado</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Descrição</label>
              <textarea name="descricao" rows={3} value={formData.descricao} onChange={handleChange} className={`w-full p-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`} />
            </div>
          </div>
          <button
            onClick={() => {
              if(!formData.nome || !formData.cidade) return toast.error('Nome e Cidade são obrigatórios.');
              if(editingId) {
                updateImobiliaria.mutate(formData);
              } else {
                createImobiliaria.mutate(formData);
              }
            }}
            disabled={createImobiliaria.isPending || uploadingLogo || updateImobiliaria.isPending}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold transition-colors disabled:opacity-50 flex items-center justify-center min-w-[180px]"
          >
            {(createImobiliaria.isPending || updateImobiliaria.isPending || uploadingLogo) ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              editingId ? 'Atualizar Imobiliária' : 'Salvar Imobiliária'
            )}
          </button>
        </div>
      )}

      <div className={`overflow-x-auto rounded-xl border shadow-sm ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-700'}>
              <th className="p-4 font-semibold text-sm">Empresa / Solicitante</th>
              <th className="p-4 font-semibold text-sm">Localização</th>
              <th className="p-4 font-semibold text-sm">Contatos</th>
              <th className="p-4 font-semibold text-sm">Verificação</th>
              <th className="p-4 font-semibold text-sm">Status Admin</th>
              <th className="p-4 font-semibold text-sm text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {imobiliarias?.map((imob) => (
              <tr
                key={imob.id}
                className={`transition-colors ${darkMode ? 'divide-gray-700 hover:bg-gray-750' : 'hover:bg-gray-50'}`}
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                      {imob.logo ? (
                        <img src={imob.logo} alt={imob.nome} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {imob.nome}
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        /{imob.slug}
                      </p>
                      {/* Show owner info for pending requests */}
                      {imob.status === 'pending' && (imob as any).owner && (
                        <div className="mt-1.5 px-2 py-1 bg-orange-50 border border-orange-100 rounded-lg">
                          <p className="text-[10px] font-bold text-orange-700 uppercase tracking-wide">Solicitante</p>
                          <p className="text-xs text-gray-700 font-medium">
                            {(imob as any).owner.primeiro_nome} {(imob as any).owner.ultimo_nome}
                          </p>
                          <p className="text-[10px] text-gray-500">{(imob as any).owner.email}</p>
                          {(imob as any).owner.telefone && (
                            <p className="text-[10px] text-gray-500">{(imob as any).owner.telefone}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {imob.cidade || '-'} {imob.bairro ? `(${imob.bairro})` : ''}
                  </p>
                </td>
                <td className="p-4">
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {imob.email || imob.telefone || imob.whatsapp || '-'}
                  </p>
                </td>
                 <td className="p-4">
                  <button 
                    onClick={() => toggleVerification.mutate({ id: imob.id, verificada: imob.verificada })}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all transform hover:scale-105 active:scale-95 border ${
                      imob.verificada 
                        ? 'bg-orange-100 text-orange-700 border-orange-200' 
                        : 'bg-gray-100 text-gray-400 border-gray-200 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 animate-pulse'
                    }`}
                  >
                    {imob.verificada ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                    {imob.verificada ? 'Verificada' : 'Não Verificada'}
                  </button>
                </td>
                <td className="p-4">
                  <div className="relative group/status">
                    <button className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all ${
                      imob.status === 'approved' 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : imob.status === 'pending'
                        ? 'bg-orange-100 text-orange-700 border border-orange-200 animate-pulse'
                        : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      {imob.status === 'approved' ? 'Aprovada' : imob.status === 'pending' ? 'Aguardando' : 'Rejeitada'}
                      <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                    </button>
                    
                    {/* Dropdown Menu (Glassmorphism) */}
                    <div className="absolute left-0 mt-2 w-48 rounded-2xl shadow-2xl border border-white/20 bg-white/80 backdrop-blur-xl z-50 opacity-0 invisible group-hover/status:opacity-100 group-hover/status:visible transition-all duration-300 transform origin-top-left scale-95 group-hover/status:scale-100 p-2 space-y-1">
                      <button
                        onClick={() => updateStatus.mutate({ id: imob.id, status: 'approved' })}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-green-700 hover:bg-green-50 rounded-xl transition-colors"
                      >
                        <Check className="w-4 h-4" /> Aprovar Agência
                      </button>
                      <button
                        onClick={() => updateStatus.mutate({ id: imob.id, status: 'pending' })}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-orange-700 hover:bg-orange-50 rounded-xl transition-colors"
                      >
                        <Loader2 className="w-4 h-4" /> Marcar Pendente
                      </button>
                      <button
                        onClick={() => updateStatus.mutate({ id: imob.id, status: 'rejected' })}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <XCircle className="w-4 h-4" /> Rejeitar Agência
                      </button>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEditClick(imob)}
                      className="p-2 rounded-xl text-purple-600 hover:bg-purple-100 bg-purple-50 transition-all shadow-sm border border-purple-100 group"
                      title="Editar Dados"
                    >
                      <Pencil className="w-4 h-4 transition-transform group-hover:scale-110" />
                    </button>
                    
                    <button
                      onClick={() => {
                        if (window.confirm(`Tem a certeza que deseja eliminar a imobiliária ${imob.nome}?`)) {
                          deleteImobiliaria.mutate(imob.id);
                        }
                      }}
                      className="p-2 rounded-xl text-red-600 hover:bg-red-100 bg-red-50 transition-all shadow-sm border border-red-100 group"
                      title="Eliminar Imobiliária"
                    >
                      <Trash2 className="w-4 h-4 transition-transform group-hover:scale-110" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            
            {imobiliarias?.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  Nenhuma imobiliária registada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

