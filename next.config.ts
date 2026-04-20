import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cqudsxxvpgkzsnwyuorq.supabase.co',
        port: '',
        pathname: '/storage/v1/object/**', // cobre public/**, signed e uploads diretos
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '128mb', // 🚀 aumenta o limite (podes usar '5mb', '20mb', etc.)
    },
  },
};

export default nextConfig;
