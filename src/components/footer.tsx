"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Linkedin, Send } from "lucide-react";

export default function Footer() {
  return (
    <footer className="flex flex-col md:flex-row min-h-[400px]">

      {/* 1. Sidebar Vertical (Esquerda) - Menu Principal */}
      <div className="w-full md:w-64 bg-purple-700 text-white p-10 flex flex-col justify-center">
        <h4 className="text-xl font-bold mb-8 border-b border-purple-500 pb-2">Menu</h4>
        <nav>
          <ul className="space-y-4 font-medium text-lg">
            <li>
              <Link href="/" className="hover:text-purple-200 transition-colors block">Início</Link>
            </li>
            <li>
              <Link href="/propriedades" className="hover:text-purple-200 transition-colors block">Propriedades</Link>
            </li>
            <li>
              <Link href="/noticias" className="hover:text-purple-200 transition-colors block">Notícias</Link>
            </li>
            <li>
              <Link href="/sobre" className="hover:text-purple-200 transition-colors block">Sobre nós</Link>
            </li>
            <li>
              <Link href="/contato" className="hover:text-purple-200 transition-colors block">Contato</Link>
            </li>
          </ul>
        </nav>

        <div className="mt-12 text-purple-200 text-sm">
          <Link href="/policy" className="hover:text-white block mb-2">Política de Privacidade</Link>
          <Link href="/terms" className="hover:text-white block">Termos e Condições</Link>
        </div>
      </div>

      {/* 2. Área Principal (Direita) - Cinza Escuro */}
      <div className="flex-1 bg-gray-900 text-gray-300 p-10 md:p-16 flex flex-col justify-between">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Logo e About */}
          <div className="space-y-6">
            {/* Ajuste do tamanho/logo aqui se necessario. Usei filter brightness para destacar no fundo escuro */}
            <div className="bg-white/10 p-4 rounded-xl inline-block backdrop-blur-sm w-fit">
              <Image src="/kercasa_logo.png" alt="Kercasa" width={140} height={50} className="object-contain" />
            </div>

            <h2 className="text-3xl font-bold text-white tracking-tight">
              Encontre o lar dos <br />
              <span className="text-purple-400">seus sonhos.</span>
            </h2>

            <p className="max-w-md text-gray-400 leading-relaxed">
              A plataforma líder em Angola para compra, venda e arrendamento de imóveis. Conectamos você às melhores oportunidades do mercado imobiliário.
            </p>

            <div className="flex gap-4 pt-4">
              <Link href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all">
                <Facebook size={20} />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all">
                <Instagram size={20} />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all">
                <Linkedin size={20} />
              </Link>
            </div>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col justify-center">
            <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700/50">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Send size={20} className="text-purple-500" />
                Newsletter
              </h3>
              <p className="text-gray-400 mb-6 text-sm">
                Receba as últimas novidades e oportunidades exclusivas diretamente no seu email. Sem spam.
              </p>
              <form className="space-y-3">
                <input
                  type="email"
                  placeholder="Seu melhor email"
                  className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
                <button className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 group">
                  Subscrever
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} RC Media. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <span>Feito com ❤️ em Angola</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
