import Head from "next/head";

// ===== COMPONENTE ERROR STATE =====
export function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <>
      <Head>
        <title>Erro ao carregar imóvel</title>
        <meta name="description" content="Erro ao carregar detalhes do imóvel" />
      </Head>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-xl shadow-md max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Erro ao carregar</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={onRetry}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    </>
  );
};