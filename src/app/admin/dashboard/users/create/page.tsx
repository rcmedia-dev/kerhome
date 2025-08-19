import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { UserForm } from './user-form';

export default function CreateUserPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-orange-950/20">
      <div className="max-w-md mx-auto p-4 sm:p-6">
        <div className="mb-8">
          <Link 
            href="/users" 
            className="inline-flex items-center px-4 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Link>
        </div>

        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 overflow-hidden p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Adicionar Novo Utilizador
          </h1>
          
          <UserForm />
        </div>
      </div>
    </div>
  );
}