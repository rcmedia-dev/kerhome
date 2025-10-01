'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import { updateUserProfile } from '@/lib/actions/supabase-actions/update-user-profile';
import { toast } from 'sonner';
import { UserProfile } from '@/lib/store/user-store';

type SettingsProps = {
  profile: UserProfile;
};

export function ConfiguracoesConta({ profile }: SettingsProps) {
  const [form, setForm] = useState<Partial<UserProfile>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;

    setIsSubmitting(true);
    try {
      const success = await updateUserProfile({
        userId: profile.id,
        profileData: form,
      });

      if (success) {
        toast.success('Perfil atualizado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error(
        error instanceof Error ? error.message : 'Erro ao atualizar perfil'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
                <label
                  htmlFor={name}
                  className="block text-sm font-medium text-gray-700"
                >
                  {label}
                </label>
                <input
                  id={name}
                  name={name}
                  type={type}
                  value={
                    (form[name as keyof UserProfile] as string | number) || ''
                  }
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2 focus:border-purple-500 focus:ring-purple-500"
                  disabled={isSubmitting}
                />
              </div>
            ))}

            <div className="md:col-span-2">
              <label
                htmlFor="sobre_mim"
                className="block text-sm font-medium text-gray-700"
              >
                Sobre Mim
              </label>
              <textarea
                id="sobre_mim"
                name="sobre_mim"
                rows={4}
                value={(form.sobre_mim as string) || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2 focus:border-purple-500 focus:ring-purple-500"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-purple-700 text-white px-4 py-2 rounded-md hover:bg-purple-800 disabled:bg-purple-400 transition-colors"
          >
            {isSubmitting ? 'Salvando...' : 'Atualizar Perfil'}
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
