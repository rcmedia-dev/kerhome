'use client'

import dynamic from 'next/dynamic'

const HeroCarousel = dynamic(() => import('./hero'), { ssr: false })

export default function HeroCarouselWrapper({ property }: { property: any }) {
  return <HeroCarousel property={property} />
}
