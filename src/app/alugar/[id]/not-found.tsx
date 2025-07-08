import Lottie from 'lottie-react';
import animationData from '@/../public/animation/not_found_animation.json';

export default function NotFound() {
  return (
    <section className="min-h-[60vh] flex flex-col items-center justify-center text-center py-16">
      <div className="w-full max-w-xs mx-auto mb-8">
        <Lottie animationData={animationData} loop={true} />
      </div>
      <h2 className="text-2xl font-bold mb-2 text-gray-800">Imóvel não encontrado</h2>
      <p className="text-gray-500 mb-6">O imóvel que você procura não existe ou foi removido.</p>
      <a href="/alugar" className="inline-block bg-purple-700 hover:bg-purple-800 text-white px-6 py-2 rounded-lg font-medium transition">Voltar para busca</a>
    </section>
  );
}
