'use client';

import { enviarMensagem } from '@/lib/actions/message-action';
import { useState } from 'react';

function ContactForm({ userIdLogado, adminId }: { userIdLogado?: string; adminId: string }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [status, setStatus] = useState<'idle' | 'enviando' | 'sucesso' | 'erro'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setStatus('enviando');

  if (!userIdLogado) {
    setStatus('erro');
    return;
  }

  const conteudo = `Mensagem: ${mensagem}`;

  const res = await enviarMensagem({
    deId: userIdLogado,  // Agora garantido como string
    paraId: adminId,
    conteudo,
  });

  if (res.sucesso) {
    setStatus('sucesso');
    setNome('');
    setEmail('');
    setMensagem('');
  } else {
    setStatus('erro');
  }
};

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {/* Campo Nome */}
      <div className="relative">
        <input
          type="text"
          id="name"
          placeholder=" "
          required
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="peer w-full px-4 py-3 border border-gray-300 rounded-lg text-sm 
                   focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
        />
        <label
          htmlFor="name"
          className="absolute left-4 top-3 text-gray-500 text-sm transition-all
                   peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base
                   peer-placeholder-shown:text-gray-400 peer-focus:top-2
                   peer-focus:text-sm peer-focus:text-orange-500"
        >
          Nome
        </label>
      </div>

      {/* Campo Email */}
      <div className="relative">
        <input
          type="email"
          id="email"
          placeholder=" "
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="peer w-full px-4 py-3 border border-gray-300 rounded-lg text-sm 
                   focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
        />
        <label
          htmlFor="email"
          className="absolute left-4 top-3 text-gray-500 text-sm transition-all
                   peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base
                   peer-placeholder-shown:text-gray-400 peer-focus:top-2
                   peer-focus:text-sm peer-focus:text-orange-500"
        >
          Email
        </label>
      </div>

      {/* Campo Mensagem */}
      <div className="relative">
        <textarea
          id="message"
          placeholder=" "
          required
          rows={4}
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          className="peer w-full px-4 py-3 border border-gray-300 rounded-lg text-sm 
                   focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
        />
        <label
          htmlFor="message"
          className="absolute left-4 top-3 text-gray-500 text-sm transition-all
                   peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base
                   peer-placeholder-shown:text-gray-400 peer-focus:top-2
                   peer-focus:text-sm peer-focus:text-orange-500"
        >
          Mensagem
        </label>
      </div>

      {/* Botão Enviar */}
      <button
        type="submit"
        disabled={status === 'enviando'}
        className="w-full py-3 text-sm font-semibold text-white bg-orange-500 
                 hover:bg-orange-600 rounded-lg shadow transition"
      >
        {status === 'enviando' ? 'Enviando...' : 'Enviar'}
      </button>

      {status === 'sucesso' && (
        <p className="text-green-600 text-sm text-center">Mensagem enviada com sucesso!</p>
      )}
      {status === 'erro' && (
        <p className="text-red-600 text-sm text-center">Erro ao enviar a mensagem.</p>
      )}
    </form>
  );
}

export default ContactForm;
