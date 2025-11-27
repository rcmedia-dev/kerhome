import { notFound } from 'next/navigation';
import { getUsersById } from '@/app/admin/dashboard/actions/get-users';
import { UserProfile } from '@/app/admin/dashboard/users/[id]/client-component';

export default async function UserPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // Desestruturação correta com await
  const { id } = await params;
  const user = await getUsersById(id);

  if (!user) {
    notFound();
  }

  return <UserProfile user={user} />;
}