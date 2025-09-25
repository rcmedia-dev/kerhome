// app/properties/[id]/opengraph-image.tsx
import { getPropertyById } from '@/lib/actions/get-properties'
import { ImageResponse } from 'next/og'
 
// Image metadata
export const alt = 'Imóvel - Kerhome.ao'
export const size = {
  width: 1200,
  height: 630,
}
 
export const contentType = 'image/png'
 
// Image generation
export default async function OgImage({ 
  params 
}: { 
  params: Promise<{ id: string }>
}) {
  // Extrai o ID da propriedade
  const { id } = await params
  
  const response = await getPropertyById(id)
 
  // Dados fallback caso não encontre o imóvel
  const title = response?.title || 'Imóvel Incrível'
  const description = response?.description 
    ? response.description.slice(0, 120) + '...' 
    : 'Descubra este imóvel exclusivo na Kerhome'
  const imageUrl = response?.image || null
  const price = response?.price 
    ? new Intl.NumberFormat('pt-AO', { 
        style: 'currency', 
        currency: 'AOA' 
      }).format(response.price)
    : 'Sob Consulta'
  const location = response?.cidade || response?.endereco || 'Angola'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          position: 'relative',
          backgroundColor: '#1a365d',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Imagem de fundo do imóvel */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          />
        )}

        {/* Overlay para contraste */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
          }}
        />

        {/* Conteúdo principal */}
        <div
          style={{
            position: 'relative',
            padding: '60px',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            width: '100%',
          }}
        >
          {/* Preço em destaque */}
          <div
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '36px',
              fontWeight: 'bold',
              alignSelf: 'flex-start',
              marginBottom: '10px',
            }}
          >
            {price}
          </div>

          {/* Título */}
          <h1
            style={{
              fontSize: '64px',
              fontWeight: 'bold',
              margin: 0,
              lineHeight: 1.1,
              maxWidth: '90%',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            {title}
          </h1>

          {/* Localização */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '28px',
              opacity: 0.9,
            }}
          >
            <span>📍</span>
            <span>{location}</span>
          </div>

          {/* Descrição */}
          <p
            style={{
              fontSize: '28px',
              margin: 0,
              lineHeight: 1.3,
              maxWidth: '80%',
              opacity: 0.95,
            }}
          >
            {description}
          </p>

          {/* Rodapé com marca */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              marginTop: '30px',
              paddingTop: '20px',
              borderTop: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  backgroundColor: 'white',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  color: '#1a365d',
                  fontSize: '24px',
                }}
              >
                K
              </div>
              <span
                style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                }}
              >
                Kerhome.ao
              </span>
            </div>

            <div
              style={{
                fontSize: '24px',
                opacity: 0.8,
              }}
            >
              {id ? `Ref: ${id.slice(0, 8)}` : 'Imóvel Exclusivo'}
            </div>
          </div>
        </div>

        {/* Badge de canto */}
        <div
          style={{
            position: 'absolute',
            top: '40px',
            right: '40px',
            backgroundColor: 'rgba(255,255,255,0.95)',
            color: '#1a365d',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '24px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          🏠 Disponível
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}