// app/blog/[slug]/opengraph-image.tsx
import { getPropertyById } from '@/lib/actions/get-properties';
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export default async function Image({ params }: { params: { id: string } }) {
  // Fetch data related to the blog post using params.slug
  const post = await getPropertyById(params.id); 

  return new ImageResponse(
    (
      <div style={{ display: 'flex', fontSize: 60, color: 'black', background: 'white', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        {post?.title}
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}