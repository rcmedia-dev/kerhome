"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Logo e descrição */}
        <div>
          <Image src="/kerhome_logo.png" alt="Logo" width={120} height={40} className="mb-4" />
          <p className="text-sm text-gray-400">
            Plataforma confiável para compra, venda e arrendamento de imóveis em Angola.
          </p>
          <div className="flex gap-4 mt-4">
            <Link href="#" className="hover:text-white bg-purple-700 p-4 rounded-full">
              <Facebook className="w-5 h-5" />
            </Link>
            <Link href="#" className="hover:text-white bg-purple-700 p-4 rounded-full">
              <Instagram className="w-5 h-5" />
            </Link>
            <Link href="#" className="hover:text-white bg-purple-700 p-4 rounded-full">
              <Linkedin className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Navegação */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Navegação</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-white">Início</Link></li>
            <li><Link href="/comprar" className="hover:text-white">Comprar</Link></li>
            <li><Link href="/vender" className="hover:text-white">Vender</Link></li>
            <li><Link href="/arrendar" className="hover:text-white">Arrendar</Link></li>
            <li><Link href="/contato" className="hover:text-white">Contato</Link></li>
          </ul>
        </div>

        {/* Links úteis */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Informações</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/sobre" className="hover:text-white">Sobre nós</Link></li>
            <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
            <li><Link href="/termos" className="hover:text-white">Termos e condições</Link></li>
            <li><Link href="/politica" className="hover:text-white">Política de privacidade</Link></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Newsletter</h4>
          <p className="text-sm text-gray-400 mb-3">
            Receba dicas e novidades diretamente no seu email.
          </p>
          <form className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="email"
              placeholder="Seu email"
              className="w-full px-4 py-2 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              type="submit"
              className="w-full sm:w-auto cursor-pointer px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-md text-white font-medium"
            >
              Subscrever
            </button>
          </form>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-12 text-center text-sm text-gray-500 border-t border-gray-800 pt-6">
        © {new Date().getFullYear()} RC Media. Todos os direitos reservados.
      </div>
    </footer>
  );
}
