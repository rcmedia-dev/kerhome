'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import { getUserProfile } from '@/lib/actions/get-user-profile';
import { updateUserProfile } from '@/lib/actions/update-user-profile';
import { useAuth } from './auth-context';

export function ConfiguracoesConta() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    primeiro_nome: '',
    ultimo_nome: '',
    username: '',
    telefone: '',
    empresa: '',
    licenca: '',
    website: '',
    facebook: '',
    linkedin: '',
    instagram: '',
    youtube: '',
    sobre_mim: '',
  });

  // Buscar perfil
  useEffect(() => {
    if (!user?.id) return;

    async function fetchProfile() {
      const profile = await getUserProfile(user?.id);
      if (profile) setForm(profile);
    }

    fetchProfile();
  }, [user?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setLoading(true);
    const result = await updateUserProfile(user.id, form);

    if (result.success) {
      alert('Perfil atualizado com sucesso!');
    } else {
      alert(result.error || 'Erro ao atualizar perfil.');
    }

    setLoading(false);
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
              { label: 'Primeiro Nome', name: 'primeiro_nome' },
              { label: 'Último Nome', name: 'ultimo_nome' },
              { label: 'Email (Username)', name: 'username' },
              { label: 'Telefone', name: 'telefone' },
              { label: 'Empresa', name: 'empresa' },
              { label: 'Licença', name: 'licenca' },
              { label: 'Website', name: 'website' },
              { label: 'Facebook', name: 'facebook' },
              { label: 'LinkedIn', name: 'linkedin' },
              { label: 'Instagram', name: 'instagram' },
              { label: 'YouTube', name: 'youtube' },
            ].map(({ label, name }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700">{label}</label>
                <input
                  name={name}
                  value={(form as any)[name]}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
            ))}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Sobre Mim</label>
              <textarea
                name="sobre_mim"
                rows={4}
                value={form.sobre_mim}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-purple-700 text-white px-4 py-2 rounded-md hover:bg-purple-800"
          >
            {loading ? 'Salvando...' : 'Atualizar Perfil'}
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
