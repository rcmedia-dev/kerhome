import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Kercasa - Imóveis em Angola',
    short_name: 'Kercasa',
    description: 'Plataforma imobiliária para comprar, vender e arrendar imóveis em Angola.',
    id: '/dashboard',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#6d35d4',
    lang: 'pt-AO',
    icons: [
      {
        src: '/favicon.ico',
        sizes: '32x32',
        type: 'image/x-icon',
        purpose: 'any',
      },
    ],
    screenshots: [
      {
        src: '/pwa-dashboard-mobile.png',
        sizes: '390x844',
        type: 'image/png',
        label: 'Dashboard Kercasa no telemóvel',
      },
      {
        src: '/pwa-dashboard-wide.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Dashboard Kercasa no desktop',
      },
    ],
  };
}
