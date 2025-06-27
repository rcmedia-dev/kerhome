import { BadgeDollarSign, HandCoins, KeyRound } from "lucide-react";
import Link from "next/link";

 export default function ActionCardsSection() {
  const actions = [
  {
    title: 'Comprar casa',
    description: 'Encontre a casa perfeita para você e sua família com segurança e facilidade.',
    button: 'Comprar',
    icon: <BadgeDollarSign className="w-8 h-8 text-green-500" />,
    color: 'bg-green-500 hover:bg-green-600',
    href: '/comprar', // ✅ link para compra
  },
  {
    title: 'Vender casa',
    description: 'Anuncie seu imóvel e alcance milhares de potenciais compradores.',
    button: 'Vender',
    icon: <HandCoins className="w-8 h-8 text-blue-500" />,
    color: 'bg-blue-500 hover:bg-blue-600',
    href: '/login', // ✅ link para formulário de anúncio
  },
  {
    title: 'Arrendar casa',
    description: 'Tem um imóvel disponível? Arrende com total apoio e visibilidade.',
    button: 'Arrendar',
    icon: <KeyRound className="w-8 h-8 text-yellow-500" />,
    color: 'bg-yellow-500 hover:bg-yellow-600 text-black',
    href: '/alugar', // ✅ link para alugar
  },
];


  return (
   <section className="py-16 bg-gray-100">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {actions.map((action, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition flex flex-col justify-between h-full"
          >
            <div className="space-y-4">
              <div className="text-orange-500 text-3xl">{action.icon}</div>
              <h3 className="text-xl font-semibold text-gray-800">
                {action.title}
              </h3>
              <p className="text-sm text-gray-600">{action.description}</p>
            </div>
            <Link
              href={action.href}
              className={`${action.color} mt-6 w-full py-2 text-center text-sm font-semibold text-white rounded-lg transition`}
            >
              {action.button}
            </Link>
          </div>
        ))}
      </div>
    </div>
  </section>
  );
}