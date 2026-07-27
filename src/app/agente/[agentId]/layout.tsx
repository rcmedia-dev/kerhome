import type { Metadata } from 'next';
import { createServiceClient } from '@/lib/supabase/server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kercasa.com';

type Props = {
  params: Promise<{ agentId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { agentId } = await params;
  const supabase = await createServiceClient();

  const { data: profile } = await supabase
    .from('agent_profiles')
    .select('full_name, bio, avatar_url')
    .eq('user_id', agentId)
    .single();

  const name = profile?.full_name || 'Agente Imobiliário';
  const bio = profile?.bio || 'Especialista imobiliário verificado na Kercasa';
  const avatar = profile?.avatar_url || `${SITE_URL}/kercasa_logo.png`;
  const fullDescription = `${bio} — Contacte ${name} na Kercasa para comprar, vender ou arrendar imóveis em Angola.`;
  const description = fullDescription.length > 155
    ? fullDescription.substring(0, 152).replace(/\s\S*$/, '') + '...'
    : fullDescription;

  return {
    title: `${name} — Agente Imobiliário | Kercasa`,
    description,
    openGraph: {
      title: `${name} — Agente Imobiliário | Kercasa`,
      description,
      url: `${SITE_URL}/agente/${agentId}`,
      siteName: 'Kercasa',
      locale: 'pt_AO',
      type: 'profile',
      images: [{ url: avatar, width: 400, height: 400, alt: name }],
    },
    twitter: {
      card: 'summary',
      title: `${name} — Kercasa`,
      description,
      images: [avatar],
    },
    alternates: { canonical: `${SITE_URL}/agente/${agentId}` },
    other: {
      'X-Robots-Tag': 'index, follow',
    },
  };
}

export default function AgenteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
