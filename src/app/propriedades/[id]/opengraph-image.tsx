// app/blog/[slug]/opengraph-image.tsx
import { getPropertyById } from '@/lib/functions/get-properties';
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export default async function Image({ params }: { params: { id: string } }) {
  // Busca os dados do imóvel
  const post = await getPropertyById(params.id);

  // Escolhe a primeira imagem do imóvel (se existir)
 // Escolhe a primeira imagem do imóvel (se existir)
const imageUrl =
  (post?.image as string | undefined) ||
  "https://via.placeholder.com/1200x630?text=Imóvel";


  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "white",
          padding: "40px",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          fontFamily: "sans-serif",
        }}
      >
        {/* Imagem */}
        <img
          src={imageUrl}
          alt="Imagem do Imóvel"
          style={{
            width: "100%",
            height: "60%",
            objectFit: "cover",
            borderRadius: "16px",
            marginBottom: "30px",
          }}
        />

        {/* Título */}
        <div
          style={{
            fontSize: 54,
            fontWeight: "bold",
            color: "black",
            marginBottom: "20px",
          }}
        >
          {post?.title || "Imóvel incrível"}
        </div>

        {/* Descrição */}
        <div
          style={{
            fontSize: 28,
            color: "#444",
            maxWidth: "90%",
            lineHeight: 1.4,
          }}
        >
          {post?.description || "Confira mais detalhes deste imóvel!"}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
