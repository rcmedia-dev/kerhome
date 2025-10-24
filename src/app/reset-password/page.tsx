'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Lock, CheckCircle, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ResetPassword() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isValidToken, setIsValidToken] = useState(true);

  // Verificar se há uma sessão ativa (usuário autenticado via link mágico)
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsValidToken(false);
        setError('Sessão expirada ou inválida. Solicite um novo link de recuperação.');
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    const calculateStrength = (password: string) => {
      let strength = 0;
      if (password.length >= 8) strength += 25;
      if (/[A-Z]/.test(password)) strength += 25;
      if (/[a-z]/.test(password)) strength += 25;
      if (/[0-9]/.test(password)) strength += 25;
      if (/[^A-Za-z0-9]/.test(password)) strength += 25;
      return Math.min(strength, 100);
    };

    setPasswordStrength(calculateStrength(formData.password));
  }, [formData.password]);

  const getPasswordStrengthColor = (strength: number) => {
    if (strength < 25) return 'bg-red-500';
    if (strength < 50) return 'bg-orange-500';
    if (strength < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength < 25) return 'Muito fraca';
    if (strength < 50) return 'Fraca';
    if (strength < 75) return 'Moderada';
    return 'Forte';
  };

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

    return {
      isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
      requirements: {
        minLength: password.length >= minLength,
        hasUpperCase,
        hasLowerCase,
        hasNumbers,
        hasSpecialChar
      }
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validações
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    const { isValid } = validatePassword(formData.password);
    if (!isValid) {
      setError('A senha não atende aos requisitos mínimos de segurança');
      return;
    }

    setIsLoading(true);

    try {
      // Atualizar a senha do usuário usando Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Fazer logout para forçar novo login com a nova senha
      await supabase.auth.signOut();
      
      setIsSubmitted(true);

      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        router.push('/');
      }, 3000);

    } catch (err) {
      console.error('Erro ao redefinir senha:', err);
      
      if (err instanceof Error) {
        switch (err.message) {
          case 'Password should be at least 6 characters':
            setError('A senha deve ter pelo menos 6 caracteres');
            break;
          case 'Auth session missing':
            setError('Sessão expirada. Solicite um novo link de recuperação.');
            setIsValidToken(false);
            break;
          default:
            setError(err.message || 'Erro ao redefinir senha. Tente novamente.');
        }
      } else {
        setError('Erro inesperado. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-orange-500" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Senha Redefinida!
            </h1>
            <p className="text-gray-600 mb-6">
              Sua senha foi redefinida com sucesso. Você será redirecionado para a página inicial em instantes.
            </p>

            <div className="space-y-4">
              <Link
                href="/"
                className="flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para a página inicial
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { requirements } = validatePassword(formData.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Card do Formulário */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-700 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Nova Senha
              </h1>
              <p className="text-gray-600">
                Crie uma nova senha para sua conta
              </p>
            </div>

            {!isValidToken && (
              <div className="mb-6 bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
                <div className="flex items-center gap-2 text-orange-800 text-sm justify-center">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Link expirado ou inválido</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Nova Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-700 focus:border-purple-700 transition-all duration-200 bg-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Digite sua nova senha"
                    disabled={!isValidToken || isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    disabled={!isValidToken || isLoading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {formData.password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Força da senha:</span>
                      <span className={`font-medium ${
                        passwordStrength < 25 ? 'text-red-600' :
                        passwordStrength < 50 ? 'text-orange-500' :
                        passwordStrength < 75 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {getPasswordStrengthText(passwordStrength)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`}
                        style={{ width: `${passwordStrength}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-700 focus:border-purple-700 transition-all duration-200 bg-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Confirme sua nova senha"
                    disabled={!isValidToken || isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    disabled={!isValidToken || isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                
                {formData.confirmPassword && (
                  <div className="mt-2">
                    {formData.password === formData.confirmPassword ? (
                      <p className="text-green-600 text-sm flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Senhas coincidem
                      </p>
                    ) : (
                      <p className="text-red-600 text-sm">
                        As senhas não coincidem
                      </p>
                    )}
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-red-800 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !isValidToken}
                className="w-full bg-gradient-to-r from-purple-700 to-orange-500 text-white py-3 px-4 rounded-xl hover:from-purple-800 hover:to-orange-600 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-700/25"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Redefinindo Senha...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Redefinir Senha
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Ao redefinir sua senha, você concorda com nossos{' '}
                <Link href="/terms" className="text-purple-700 hover:text-purple-800 font-medium">
                  Termos de Serviço
                </Link>
              </p>
            </div>
          </div>

          {/* Card dos Requisitos da Senha */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Requisitos de Segurança
              </h2>
              <p className="text-gray-600 text-sm">
                Para sua segurança, sua senha deve atender aos seguintes critérios:
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-gradient-to-br from-purple-50 to-orange-50 rounded-xl p-4 border border-purple-100">
                <h3 className="font-semibold text-purple-700 mb-3 text-sm uppercase tracking-wide">
                  Requisitos Obrigatórios
                </h3>
                <div className="space-y-3">
                  <div className={`flex items-center gap-3 p-2 rounded-lg ${
                    requirements.minLength ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'
                  }`}>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      requirements.minLength ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                    <span className="text-sm font-medium">Mínimo 8 caracteres</span>
                    {requirements.minLength && (
                      <CheckCircle className="w-4 h-4 text-green-500 ml-auto flex-shrink-0" />
                    )}
                  </div>
                  
                  <div className={`flex items-center gap-3 p-2 rounded-lg ${
                    requirements.hasUpperCase ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'
                  }`}>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      requirements.hasUpperCase ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                    <span className="text-sm font-medium">Letra maiúscula (A-Z)</span>
                    {requirements.hasUpperCase && (
                      <CheckCircle className="w-4 h-4 text-green-500 ml-auto flex-shrink-0" />
                    )}
                  </div>
                  
                  <div className={`flex items-center gap-3 p-2 rounded-lg ${
                    requirements.hasLowerCase ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'
                  }`}>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      requirements.hasLowerCase ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                    <span className="text-sm font-medium">Letra minúscula (a-z)</span>
                    {requirements.hasLowerCase && (
                      <CheckCircle className="w-4 h-4 text-green-500 ml-auto flex-shrink-0" />
                    )}
                  </div>
                  
                  <div className={`flex items-center gap-3 p-2 rounded-lg ${
                    requirements.hasNumbers ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'
                  }`}>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      requirements.hasNumbers ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                    <span className="text-sm font-medium">Número (0-9)</span>
                    {requirements.hasNumbers && (
                      <CheckCircle className="w-4 h-4 text-green-500 ml-auto flex-shrink-0" />
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-2 text-sm">Dicas de Segurança</h3>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Use uma senha única para esta conta</li>
                  <li>• Evite sequências óbvias (123456, abcdef)</li>
                  <li>• Considere usar um gerenciador de senhas</li>
                  <li>• Ative a autenticação de dois fatores</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {!isValidToken && (
          <div className="mt-6 bg-orange-50 border border-orange-200 rounded-xl p-4 text-center max-w-2xl mx-auto">
            <p className="text-orange-800 text-sm mb-2">
              Link de recuperação inválido ou expirado.
            </p>
            <Link
              href="/forgot-password"
              className="text-purple-700 hover:text-purple-800 font-medium text-sm inline-block"
            >
              Solicitar novo link
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}