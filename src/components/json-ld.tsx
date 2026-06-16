export function OrganizationJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Kercasa',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://kercasa.com',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://kercasa.com'}/logo.png`,
    description: 'Plataforma imobiliária em Angola. Compre, arrende ou anuncie imóveis com inteligência artificial.',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+244-XXX-XXX-XXX',
      contactType: 'customer service',
    },
    sameAs: [
      'https://facebook.com/kercasa',
      'https://instagram.com/kercasa',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function RealEstateListingJsonLd({
  property,
  url,
}: {
  property: any;
  url: string;
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description?.substring(0, 200),
    url,
    image: property.image || (Array.isArray(property.gallery) && property.gallery.length > 0 ? property.gallery[0] : undefined),
    datePosted: property.created_at,
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: property.unidade_preco === 'dolar' ? 'USD' : 'AOA',
      availability: 'https://schema.org/InStock',
    },
    ...(property.bedrooms || property.bathrooms || property.size ? {
      floorSize: property.size ? { '@type': 'QuantitativeValue', value: property.size, unitText: 'm²' } : undefined,
      numberOfBedrooms: property.bedrooms,
      numberOfBathrooms: property.bathrooms,
      numberOfRooms: property.bedrooms ? property.bedrooms + 1 : undefined,
    } : {}),
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.endereco,
      addressLocality: property.cidade,
      addressRegion: property.provincia,
      addressCountry: 'AO',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbListJsonLd({ items }: { items: { name: string; url: string }[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ArticleJsonLd({ title, description, image, url, datePublished, author }: {
  title: string;
  description: string;
  image?: string;
  url: string;
  datePublished?: string;
  author?: string;
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    image,
    url,
    datePublished,
    author: author ? { '@type': 'Person', name: author } : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'Kercasa',
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://kercasa.com',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FaqPageJsonLd({ items }: { items: { question: string; answer: string }[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
