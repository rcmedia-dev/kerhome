import Head from "next/head";

// ===== COMPONENTE NOT FOUND STATE =====
export function NotFoundState()  {
  return (
    <>
      <Head>
        <title>Imóvel não encontrado</title>
      </Head>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-xl shadow-md max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Imóvel não encontrado</h2>
          <p className="text-gray-600">O imóvel que você está procurando não existe ou foi removido.</p>
        </div>
      </div>
    </>
  );
};