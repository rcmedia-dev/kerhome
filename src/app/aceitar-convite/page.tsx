import { createClient } from '@/lib/supabase/server';
import { getInviteByToken } from '@/lib/functions/supabase-actions/agency-invites';
import { Building2, XCircle, LogIn, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ClientInviteActions } from './client-actions';

// Ignorar a cache para forçar a avaliação local a cada visita e proteger os cookies de sessão
export const dynamic = 'force-dynamic';

export default async function AceitarConvitePage({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  const resolvedParams = await searchParams;
  const token = typeof resolvedParams.token === 'string' ? resolvedParams.token : undefined;
  
  // 1. Validar a presença do token
  if (!token) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erro no Convite</h1>
          <p className="text-gray-600 mb-8">Link de convite inválido ou nulo.</p>
          <Link href="/" className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all">
            Voltar ao Início
          </Link>
        </div>
      </div>
    );
  }

  // 2. Obter a sessão atual através do servidor
  // Esta verificação fresca elimina o "loop" que o client-side sofria
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 3. Obter os dados do convite (usa AdminClient por baixo dos panos = bypass RLS)
  const { invite, error: inviteError } = await getInviteByToken(token);

  if (inviteError || !invite) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Convite Inválido</h1>
          <p className="text-gray-600 mb-8">{inviteError || 'Este convite não existe ou já expirou.'}</p>
          <Link href="/" className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all">
            Voltar ao Início
          </Link>
        </div>
      </div>
    );
  }

  if (invite.status !== 'pending') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Convite Indisponível</h1>
          <p className="text-gray-600 mb-8">O convite já foi processado ({invite.status === 'accepted' ? 'aceite' : 'recusado'}).</p>
          <Link href={user ? '/dashboard' : '/login'} className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all">
            Ir para a minha conta
          </Link>
        </div>
      </div>
    );
  }

  // 4. Se NÃO estiver logado, verificar na BD se o seu email existe
  if (!user) {
    // Usamos o AdminClient p/ bypass a RLS se a tabela profiles não for lida anonimamente
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const supabaseAdmin = await createAdminClient();
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', invite.email)
      .single();

    if (!profile) {
      // Não tem conta: Redirecionar para /signup com os dados no search param
      redirect(`/signup?token=${token}&email=${encodeURIComponent(invite.email)}`);
    }
  }

  // 5. Se logado, verificar se o utilizador já está vinculado
  let userAlreadyTiedToAgency = false;
  let existingAgencyName = "";

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('imobiliaria_id, imobiliarias!profiles_imobiliaria_id_fkey(nome)')
      .eq('id', user.id)
      .single();

    if (profile?.imobiliaria_id) {
      userAlreadyTiedToAgency = true;
      const agencyData = profile.imobiliarias as any;
      existingAgencyName = (Array.isArray(agencyData) ? agencyData[0]?.nome : agencyData?.nome) || "Outra Agência (ID Privado)";
      
      // Se ele já pertence a EXACTAMENTE esta agência, atualizar a message no UI
      if (profile.imobiliaria_id === invite.imobiliaria_id) {
         await supabase.from('agency_invites').update({ status: 'accepted' }).eq('id', invite.id);
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 text-center relative overflow-hidden">
        {/* Banner Decorativo */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-600 to-orange-500"></div>

        <div className="w-20 h-20 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-6 mt-4 border border-purple-100">
          <Building2 className="w-10 h-10 text-purple-700" />
        </div>

        <h1 className="text-2xl font-black text-gray-900 mb-2">Convite de Agência</h1>
        <p className="text-gray-500 mb-8 text-sm leading-relaxed px-4">
          Você foi convidado para se juntar à equipa da agência <span className="font-bold text-gray-900">{invite.imobiliaria.nome}</span> no Kercasa.
        </p>

        {!user ? (
          // NAO ESTA LOGADO
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl text-center mb-4">
              <p className="text-xs text-orange-800 font-bold mb-1">Passo Necessário</p>
              <p className="text-[11px] text-orange-700/80">
                Para aceitar ou recusar, você deve estar logado na sua conta de corretor.
              </p>
            </div>
            
            <Link
              href={`/login?redirect=/aceitar-convite?token=${token}`}
              className="w-full py-4 bg-[#820AD1] hover:bg-[#6A08AA] text-white rounded-xl font-extrabold transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
            >
              Fazer Login / Criar Conta
              <LogIn className="w-4 h-4" />
            </Link>
          </div>
        ) : userAlreadyTiedToAgency ? (
          // LOGADO MAS JA TEM AGENCIA
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl text-center mb-4">
              <p className="text-[13px] text-blue-800 font-bold mb-2">Conta Verificada</p>
              <p className="text-xs text-blue-700/80 leading-relaxed">
                Você já faz parte da agência <strong>{existingAgencyName}</strong>. 
                Se for a agência do convite, o seu status já está regularizado!
              </p>
            </div>
            
            <Link
              href="/dashboard"
              className="w-full py-4 bg-[#820AD1] hover:bg-[#6A08AA] text-white rounded-xl font-black transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
            >
              Ir para o Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          // LOGADO E VERIFICADO: Renderizar cliente actions
          <ClientInviteActions token={token} userEmail={user.email || 'Email Desconhecido'} />
        )}

        <div className="mt-8 pt-6 border-t border-gray-50">
          <p className="text-[10px] text-gray-400 font-medium">
            Kercasa © 2026 • Plataforma Imobiliária Segura
          </p>
        </div>
      </div>
    </div>
  );
}
