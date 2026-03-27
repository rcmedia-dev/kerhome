'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  requestAgencyUpgradeAction, 
  uploadLogoAction 
} from '@/lib/functions/supabase-actions/admin-imobiliaria-actions';
import { toast } from 'sonner';
import { Building2, MapPin, Globe, Mail, Phone, MessageSquare, Image as ImageIcon, Loader2, ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import Link from 'next/link';
import { useUserStore } from '@/lib/store/user-store';
import { AuthDialog } from '@/components/login-modal';

interface AuthDialogRef {
  open: () => void;
}

export default function RegistarImobiliariaPage() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useUserStore();
  const authDialogRef = useRef<AuthDialogRef>(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    nome: '',
    cidade: '',
    bairro: '',
    email: '',
    telefone: '',
    whatsapp: '',
    website: '',
    descricao: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      return authDialogRef.current?.open();
    }
    
    if (!formData.nome || !formData.cidade) {
      return toast.error('Nome e Cidade são obrigatórios.');
    }

    setLoading(true);
    try {
      let logoUrl = '';
      if (logoFile) {
        const logoFormData = new FormData();
        logoFormData.append('file', logoFile);
        const uploadRes = await uploadLogoAction(logoFormData);
        if (!uploadRes.success) throw new Error(uploadRes.error);
        logoUrl = uploadRes.url || '';
      }

      // Gerar slug básico
      const slug = formData.nome
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const res = await requestAgencyUpgradeAction(user.id, {
        ...formData,
        slug,
        logo: logoUrl
      });

      if (!res.success) throw new Error(res.error);

      setSuccess(true);
      toast.success('Pedido de upgrade enviado com sucesso!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      toast.error('Erro ao processar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
      </div>
    );
  }

  // Estado: Não Logado
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 pt-32 pb-20 px-4">
        <AuthDialog ref={authDialogRef} />
        <div className="max-w-xl mx-auto bg-white/40 backdrop-blur-3xl rounded-[3rem] p-12 text-center shadow-2xl border border-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-600 to-orange-500"></div>
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <Lock className="w-10 h-10 text-purple-600" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-6">Autenticação Necessária</h1>
          <p className="text-gray-500 mb-10 font-medium leading-relaxed">
            Para tornar a sua agência parceira do Kercasa, primeiro precisa de ter uma conta ativa na nossa plataforma.
          </p>
          <button 
            onClick={() => authDialogRef.current?.open()}
            className="w-full bg-orange-500 text-white py-5 rounded-2xl font-black text-lg hover:bg-purple-800 transition-all shadow-xl shadow-orange-500/20"
          >
            Entrar / Criar Conta
          </button>
          <p className="mt-6 text-sm text-gray-400">
            Dúvidas? <Link href="/contato" className="text-purple-600 font-bold hover:underline">Contacte o suporte</Link>
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 pt-32 pb-20 px-4">
        <div className="max-w-2xl mx-auto bg-white/70 backdrop-blur-2xl rounded-[3rem] p-12 text-center shadow-2xl border border-white">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-6 tracking-tight">Pedido Enviado!</h1>
          <p className="text-lg text-gray-600 mb-10 leading-relaxed font-medium">
            O seu pedido de upgrade para Conta Imobiliária foi recebido. Os nossos administradores irão analisar a sua candidatura e a sua conta será atualizada assim que for aprovada.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/imobiliarias"
              className="px-8 py-4 bg-purple-700 text-white rounded-2xl font-black hover:bg-orange-500 transition-all shadow-xl shadow-purple-200"
            >
              Voltar ao Diretório
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 pt-32 pb-20">
      <main className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-xs font-black uppercase tracking-widest mb-6 inline-block">
            Seja um Parceiro Kercasa
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
            Torne a sua <span className="bg-gradient-to-r from-purple-700 to-orange-500 bg-clip-text text-transparent">Agência Parceira</span>
          </h1>
          <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto">
            Upgrade de conta para imobiliária: publique em nome da sua marca, tenha um diretório exclusivo e destaque a sua presença em Angola.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white/40 backdrop-blur-3xl rounded-[3rem] p-8 md:p-12 shadow-2xl border border-white/60 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-600 to-orange-500 opacity-50"></div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Nome da Imobiliária */}
              <div className="space-y-2">
                <label className="text-sm font-black text-purple-900 uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> Nome da Agência *
                </label>
                <input
                  name="nome"
                  required
                  placeholder="Ex: Imobiliária Horizonte"
                  value={formData.nome}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-white/60 border border-purple-100 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all outline-none font-medium placeholder:text-gray-300 shadow-sm"
                />
              </div>

              {/* Cidade */}
              <div className="space-y-2">
                <label className="text-sm font-black text-purple-900 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Cidade Sede *
                </label>
                <input
                  name="cidade"
                  required
                  placeholder="Ex: Luanda"
                  value={formData.cidade}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-white/60 border border-purple-100 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all outline-none font-medium placeholder:text-gray-300 shadow-sm"
                />
              </div>

              {/* Bairro */}
              <div className="space-y-2">
                <label className="text-sm font-black text-purple-900 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Bairro/Zona
                </label>
                <input
                  name="bairro"
                  placeholder="Ex: Talatona"
                  value={formData.bairro}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-white/60 border border-purple-100 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all outline-none font-medium placeholder:text-gray-300 shadow-sm"
                />
              </div>

              {/* Website */}
              <div className="space-y-2">
                <label className="text-sm font-black text-purple-900 uppercase tracking-wider flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Website Oficial
                </label>
                <input
                  name="website"
                  placeholder="ex: www.suaimobiliaria.co.ao"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-white/60 border border-purple-100 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all outline-none font-medium placeholder:text-gray-300 shadow-sm"
                />
              </div>

              {/* E-mail */}
              <div className="space-y-2">
                <label className="text-sm font-black text-purple-900 uppercase tracking-wider flex items-center gap-2">
                  <Mail className="w-4 h-4" /> E-mail Comercial
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="geral@agencia.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-white/60 border border-purple-100 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all outline-none font-medium placeholder:text-gray-300 shadow-sm"
                />
              </div>

              {/* Telefone */}
              <div className="space-y-2">
                <label className="text-sm font-black text-purple-900 uppercase tracking-wider flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Telefone de Contacto
                </label>
                <input
                  name="telefone"
                  placeholder="+244 9..."
                  value={formData.telefone}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-white/60 border border-purple-100 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all outline-none font-medium placeholder:text-gray-300 shadow-sm"
                />
              </div>

              {/* Logo Upload */}
              <div className="md:col-span-2 space-y-4">
                <label className="text-sm font-black text-purple-900 uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> Logótipo da Agência
                </label>
                <div className="relative group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-full px-6 py-8 bg-orange-50/30 border-2 border-dashed border-orange-200 rounded-[2rem] flex flex-col items-center justify-center gap-3 group-hover:bg-orange-50 group-hover:border-orange-400 transition-all">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md text-orange-500">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-orange-700">
                      {logoFile ? logoFile.name : 'Clique ou arraste o logo aqui'}
                    </p>
                    <p className="text-[10px] text-orange-400 font-black uppercase tracking-widest">
                      JPG, PNG ou WEBP (Max 1MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Descrição */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-black text-purple-900 uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Sobre a Agência
                </label>
                <textarea
                  name="descricao"
                  rows={4}
                  placeholder="Fale-nos um pouco sobre o portefólio e história da sua empresa..."
                  value={formData.descricao}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-white/60 border border-purple-100 rounded-3xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all outline-none font-medium placeholder:text-gray-300 resize-none shadow-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white py-6 rounded-[2rem] font-black text-xl hover:bg-purple-800 transition-all duration-500 shadow-2xl shadow-orange-500/20 disabled:opacity-50 flex items-center justify-center gap-4 group"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  A Enviar...
                </>
              ) : (
                <>
                  Solicitar Upgrade
                  <ArrowRight className="w-7 h-7 transition-transform group-hover:translate-x-2" />
                </>
              )}
            </button>
          </form>
        </div>
        
        <p className="text-center mt-12 text-sm text-gray-400 font-medium italic">
          Ao submeter, a sua conta será marcada como 'Pendente de Aprovaçao' e a nossa equipa entrará em contacto para finalizar o processo.
        </p>
      </main>
    </div>
  );
}

