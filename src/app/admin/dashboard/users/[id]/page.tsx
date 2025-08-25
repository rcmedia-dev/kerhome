import { notFound } from 'next/navigation';
import { getUsersById } from '../../actions/get-users';
import { UserProfile } from './client-component';

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