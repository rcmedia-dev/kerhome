'use client';

import { BadgeDollarSign, HandCoins, KeyRound } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth-context";
import { useRef } from "react";
import { AuthDialog } from "./login-modal";

export default function ActionCardsSection() {
  const { user } = useAuth();
  const authDialogRef = useRef<any>(null);

  const handleVenderClick = () => {
    if (user) {
      window.location.href = '/cadastro-imovel';
    } else {
      authDialogRef.current?.open();
    }
  };

  const actions = [
    {
      title: 'Comprar casa',
      description: 'Encontre a casa perfeita para você e sua família com segurança e facilidade.',
      button: 'Comprar',
      icon: <BadgeDollarSign className="w-8 h-8 text-green-500" />,
      color: 'bg-green-500 hover:bg-green-600',
      href: '/comprar',
    },
    {
      title: 'Arrendar casa',
      description: 'Tem um imóvel disponível? Arrende com total apoio e visibilidade.',
      button: 'Arrendar',
      icon: <KeyRound className="w-8 h-8 text-yellow-500" />,
      color: 'bg-yellow-500 hover:bg-yellow-600 text-black',
      href: '/alugar',
    },
  ];

  return (
    <>
      <section className="py-16 bg-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {/* Mapear ações normais */}
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

            {/* Cartão personalizado para VENDER */}
            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="text-orange-500 text-3xl">
                  <HandCoins className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Vender casa
                </h3>
                <p className="text-sm text-gray-600">
                  Anuncie seu imóvel e alcance milhares de potenciais compradores.
                </p>
              </div>

              <AuthDialog
                ref={authDialogRef}
                trigger={
                  <button
                    className="bg-blue-500 hover:bg-blue-600 mt-6 w-full py-2 text-sm font-semibold text-white rounded-lg transition"
                    onClick={handleVenderClick}
                  >
                    Vender
                  </button>
                }
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
