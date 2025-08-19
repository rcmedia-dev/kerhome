import { getUserProfile } from '@/lib/actions/supabase-actions/get-user-profile';
import { UserProfileForm } from './client-component';

export default async function EditProfilePage({
  params,
}: {
  params: { userId: string };
}) {
    console.log("🔎 EditProfilePage params:", params);
  const profile = await getUserProfile(params.userId);

  if (!profile) {
    return (
        <div>
            <h1 className="text-2xl font-bold text-center mt-10">Perfil não encontrado</h1>
            <p className="text-center mt-4">O perfil solicitado não existe ou foi removido.</p>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-orange-950/20">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <UserProfileForm 
          userId={params.userId}
          initialData={{
            primeiro_nome: profile.primeiro_nome || '',
            ultimo_nome: profile.ultimo_nome || '',
            email: profile.email || '',
            username: profile.username || '',
            telefone: profile.telefone || '',
            empresa: profile.empresa || '',
            licenca: profile.licenca || '',
            website: profile.website || '',
            facebook: profile.facebook || '',
            linkedin: profile.linkedin || '',
            instagram: profile.instagram || '',
            youtube: profile.youtube || '',
            sobre_mim: profile.sobre_mim || '',
          }}
        />
      </div>
    </div>
  );
}