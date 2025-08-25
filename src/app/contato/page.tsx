'use client';

import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <section className="bg-gradient-to-br from-purple-50 via-white to-white min-h-screen py-24 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Lado esquerdo — Informações */}
        <div className="space-y-8">
          <h1 className="text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
            Entre em contacto <br />
            com a <span className="text-purple-700">Ker<span className='text-orange-500'>casa</span></span>
          </h1>

          <p className="text-lg text-gray-600 max-w-lg">
            Precisa de ajuda com a compra, venda ou aluguel de um imóvel? Nossa equipe está pronta
            para atendê-lo com profissionalismo e agilidade.
          </p>

          <div className="space-y-5 text-gray-700 text-base">
            <div className="flex items-center gap-4">
              <Phone className="text-orange-500 w-5 h-5" />
              <span>+244 929 884 781</span>
            </div>
            <div className="flex items-center gap-4">
              <Mail className="text-orange-500 w-5 h-5" />
              <span>geral@rcmedia.ao</span>
            </div>
            <div className="flex items-center gap-4">
              <MapPin className="text-orange-500 w-5 h-5" />
              <span>Largo do Kinaxixi, Primeira Conservatória do Registro Civil</span>
            </div>
          </div>
        </div>

        {/* Lado direito — Formulário */}
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 w-full">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Envie sua mensagem</h2>

          <form className="space-y-6">
            <div className="relative">
              <input
                id="name"
                type="text"
                required
                placeholder=" "
                className="peer w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-700 focus:ring-1 focus:ring-purple-700"
              />
              <label
                htmlFor="name"
                className="absolute left-4 top-3 text-gray-500 text-sm transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-purple-700"
              >
                Seu Nome
              </label>
            </div>

            <div className="relative">
              <input
                id="email"
                type="email"
                required
                placeholder=" "
                className="peer w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-700 focus:ring-1 focus:ring-purple-700"
              />
              <label
                htmlFor="email"
                className="absolute left-4 top-3 text-gray-500 text-sm transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-purple-700"
              >
                Seu Email
              </label>
            </div>

            <div className="relative">
              <textarea
                id="message"
                rows={5}
                required
                placeholder=" "
                className="peer w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-700 focus:ring-1 focus:ring-purple-700 resize-none"
              />
              <label
                htmlFor="message"
                className="absolute left-4 top-3 text-gray-500 text-sm transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-purple-700"
              >
                Sua Mensagem
              </label>
            </div>

            <button
              type="submit"
              className="cursor-pointer w-full py-3 rounded-xl bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600 transition duration-300 shadow-md"
            >
              Enviar Mensagem
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
