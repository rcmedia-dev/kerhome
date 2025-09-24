
import Head from "next/head";

// ===== COMPONENTE SKELETON =====
export function PropertySkeleton() {
  return (
    <>
      <Head>
        <title>Carregando imóvel...</title>
        <meta property="og:title" content="Imóvel Incrível" />
        <meta property="og:description" content="Dê uma olhada neste imóvel incrível!" />
        <meta property="og:image" content="/placeholder-image.jpg" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      
      <section className="min-h-screen bg-gray-50 text-gray-800 overflow-x-hidden">
        <div className="w-full h-[300px] sm:h-[400px] bg-gray-200 animate-pulse overflow-hidden border-b border-gray-200" />

        <div className="max-w-7xl mx-auto px-4 sm:px-5 py-8 sm:py-16">
          <div className="grid md:grid-cols-3 gap-8 sm:gap-12 items-start">
            <div className="md:col-span-2 space-y-8 sm:space-y-12 order-1 md:order-none">
              <div className="space-y-4 sm:space-y-6">
                <div className="h-7 w-32 bg-gray-300 rounded-full animate-pulse"></div>
                <div className="h-10 sm:h-12 w-3/4 bg-gray-300 rounded animate-pulse"></div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-300 rounded-full animate-pulse"></div>
                  <div className="h-4 w-48 sm:w-64 bg-gray-300 rounded animate-pulse"></div>
                </div>
                
                <div className="flex flex-wrap gap-4 sm:gap-6">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-300 rounded animate-pulse"></div>
                      <div className="h-4 w-16 sm:w-20 bg-gray-300 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
                
                <div className="h-8 w-40 bg-gray-300 rounded animate-pulse"></div>
              </div>

              <div className="space-y-4">
                <div className="w-full h-[300px] sm:h-[400px] bg-gray-300 rounded-3xl animate-pulse"></div>
                <div className="flex gap-3 overflow-x-auto">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-24 h-16 sm:w-32 sm:h-20 bg-gray-300 rounded-xl animate-pulse flex-shrink-0"></div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <div className="h-6 w-40 bg-gray-300 rounded animate-pulse mb-4"></div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-300 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex space-x-2 border-b overflow-x-auto">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-8 w-24 sm:w-32 bg-gray-300 rounded-t-md animate-pulse flex-shrink-0"></div>
                  ))}
                </div>
                
                <div className="space-y-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-300 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="h-8 w-40 bg-gray-300 rounded animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-300 rounded animate-pulse w-5/6"></div>
                  <div className="h-4 bg-gray-300 rounded animate-pulse w-4/6"></div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="h-8 w-40 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-300 rounded animate-pulse w-3/4"></div>
              </div>

              <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-xl border">
                <div className="h-8 w-48 bg-gray-300 rounded animate-pulse mx-auto mb-6"></div>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-300 rounded-lg animate-pulse"></div>
                  ))}
                  <div className="h-12 bg-gray-400 rounded-lg animate-pulse mt-4"></div>
                </div>
              </div>
            </div>

            <div className="hidden md:block md:col-span-1 space-y-6">
              <div className="bg-white border shadow-md rounded-2xl p-6">
                <div className="h-8 w-40 bg-gray-300 rounded animate-pulse mb-6"></div>
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-300 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              </div>

              <div className="bg-white border shadow-md rounded-2xl p-6">
                <div className="h-8 w-48 bg-gray-300 rounded animate-pulse mb-6"></div>
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-300 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>

              <div className="bg-white border shadow-md rounded-2xl p-6">
                <div className="h-8 w-48 bg-gray-300 rounded animate-pulse mb-6"></div>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-16 h-16 bg-gray-300 rounded-lg animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                        <div className="h-3 bg-gray-300 rounded animate-pulse w-3/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border shadow-md rounded-2xl p-6">
                <div className="h-8 w-48 bg-gray-300 rounded animate-pulse mb-6"></div>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-300 rounded-full animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                        <div className="h-3 bg-gray-300 rounded animate-pulse w-2/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};