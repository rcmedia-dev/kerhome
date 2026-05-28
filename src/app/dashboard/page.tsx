'use client';

// app/dashboard/page.tsx
import dynamic from 'next/dynamic';
import SoftLoading from '@/components/soft-loading';

const Dashboard = dynamic(() => import('@/components/dashboard'), {
  ssr: false,
  loading: () => <SoftLoading />
});

export default function DashboardPage() {
  return <Dashboard />;
}
