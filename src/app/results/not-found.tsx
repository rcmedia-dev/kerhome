
// Página de fallback para rota /results/not-found do Next.js App Router
"use client";
import Lottie from 'lottie-react';
import animationData from '@/../public/animation/not_found_animation.json';

export default function NotFound() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-10 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-full max-w-xs mx-auto mb-8">
        <Lottie animationData={animationData} loop={true} />
      </div>
      <h2 className="text-2xl font-bold mb-2 text-gray-800">Nenhum imóvel encontrado</h2>
      <p className="text-gray-500 mb-6">Não encontramos imóveis para sua busca. Tente outros filtros ou palavras-chave.</p>
      <a href="/" className="inline-block bg-purple-700 hover:bg-purple-800 text-white px-6 py-2 rounded-lg font-medium transition">Voltar para a Home</a>
    </section>
  );
}
