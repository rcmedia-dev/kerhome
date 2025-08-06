'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import { useAuth } from './auth-context';
import { getUserProfile, UserProfile } from '@/lib/actions/supabase-actions/get-user-profile';
import { updateUserProfile } from '@/lib/actions/supabase-actions/update-user-profile';
import { toast } from 'sonner';

export function ConfiguracoesConta() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<UserProfile>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Buscar perfil
  useEffect(() => {
    if (!user?.id) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const profile = await getUserProfile(user.id);
        if (profile) setForm(profile);
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsSubmitting(true);
    try {
      const success = await updateUserProfile({
        userId: user.id,
        profileData: form
      });

      if (success) {
        toast.success('Perfil atualizado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Erro ao atualizar perfil'
      );
    } finally {
      setIsSubmitting(false);
    }
  };


  if (loading) {
    return (
      <Card className="shadow-md mt-6">
        <CardContent className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-700"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md mt-6">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center text-gray-800">
          <Settings className="w-6 h-6 mr-3 text-purple-700" />
          Configurações da Conta
        </CardTitle>
        <CardDescription className="text-gray-500">
          Gerencie suas informações pessoais e profissionais
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Primeiro Nome', name: 'primeiro_nome', type: 'text' },
              { label: 'Último Nome', name: 'ultimo_nome', type: 'text' },
              { label: 'Email (Username)', name: 'email', type: 'email' },
              { label: 'Telefone', name: 'telefone', type: 'tel' },
              { label: 'Empresa', name: 'empresa', type: 'text' },
              { label: 'Licença', name: 'licenca', type: 'text' },
              { label: 'Website', name: 'website', type: 'url' },
              { label: 'Facebook', name: 'facebook', type: 'url' },
              { label: 'LinkedIn', name: 'linkedin', type: 'url' },
              { label: 'Instagram', name: 'instagram', type: 'text' },
              { label: 'YouTube', name: 'youtube', type: 'url' },
            ].map(({ label, name, type }) => (
              <div key={name}>
                <label htmlFor={name} className="block text-sm font-medium text-gray-700">
                  {label}
                </label>
                <input
                  id={name}
                  name={name}
                  type={type}
                  value={form[name as keyof UserProfile] || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2 focus:border-purple-500 focus:ring-purple-500"
                  disabled={isSubmitting}
                />
              </div>
            ))}

            <div className="md:col-span-2">
              <label htmlFor="sobre_mim" className="block text-sm font-medium text-gray-700">
                Sobre Mim
              </label>
              <textarea
                id="sobre_mim"
                name="sobre_mim"
                rows={4}
                value={form.sobre_mim || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2 focus:border-purple-500 focus:ring-purple-500"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="bg-purple-700 text-white px-4 py-2 rounded-md hover:bg-purple-800 disabled:bg-purple-400 transition-colors"
          >
            {isSubmitting ? 'Salvando...' : 'Atualizar Perfil'}
          </button>
        </form>
      </CardContent>
    </Card>
  );
}