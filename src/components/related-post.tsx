
// Client Component para posts relacionados
'use client'
import { getPosts } from '@/lib/actions/supabase-actions/news-actions'
import { Noticia } from '@/lib/types/noticia'
import Link from 'next/link'
import React from 'react'
import Image from 'next/image'

export default function RelatedPosts({ currentPostId }: { currentPostId: string }) {
  const [relatedPosts, setRelatedPosts] = React.useState<Noticia[]>([])

  React.useEffect(() => {
    async function fetchRelated() {
      const allPosts = await getPosts()
      setRelatedPosts(allPosts.filter(post => post.id !== currentPostId).slice(0, 3))
    }
    fetchRelated()
  }, [currentPostId])

  if (relatedPosts.length === 0) return null

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Artigos relacionados</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedPosts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`}>
            <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg border border-gray-100">
              {post.coverImage?.url && (
                <Image src={post.coverImage.url} alt={post.title} width={400} height={200} className="object-cover w-full h-40" />
              )}
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{post.title}</h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
