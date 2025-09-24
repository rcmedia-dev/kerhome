import { getPropertyById } from "@/lib/actions/get-properties";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const property = await getPropertyById(params.id);

  const title = property?.title || "Imóvel Incrível";
  const description = property?.description || "Dê uma olhada neste imóvel incrível!";
  const image = property?.image || "/placeholder-image.jpg";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://localhost:3000/comprar/${params.id}`,
      siteName: "Meu Site de Imóveis",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
