// app/blog/[slug]/opengraph-image.tsx
import { getPropertyById } from '@/lib/actions/get-properties';
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export default async function Image({ params }: { params: { id: string } }) {
  const post = await getPropertyById(params.id);

  // URL absoluta da imagem
  const imageUrl =
    (post?.image as string | undefined)?.startsWith("http")
      ? post?.image
      : "https://via.placeholder.com/1200x630?text=Imóvel";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "white",
          fontFamily: "sans-serif",
        }}
      >
        {/* Imagem de capa como background */}
        <div
          style={{
            width: "100%",
            height: "65%",
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderBottom: "4px solid #eee",
          }}
        />

        {/* Conteúdo abaixo */}
        <div
          style={{
            flex: 1,
            padding: "30px",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: 54,
              fontWeight: "bold",
              marginBottom: "20px",
              color: "black",
            }}
          >
            {post?.title || "Imóvel incrível"}
          </h1>
          <p
            style={{
              fontSize: 28,
              color: "#444",
              lineHeight: 1.4,
              maxWidth: "90%",
              margin: "0 auto",
            }}
          >
            {post?.description || "Confira mais detalhes deste imóvel!"}
          </p>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
