import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['images.unsplash.com', 'cqudsxxvpgkzsnwyuorq.supabase.co', 'lh3.googleusercontent.com'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '128mb', // 🚀 aumenta o limite (podes usar '5mb', '20mb', etc.)
    },
  },
};

export default nextConfig;
