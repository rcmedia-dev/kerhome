import { notFound } from 'next/navigation';
import { getUsersById } from '../../actions/get-users';
import { UserProfile } from './client-component';

export default async function UserPage({ params }: { params: { id: string } }) {
  const user = await getUsersById(params.id);

  if (!user) {
    notFound();
  }

  return <UserProfile user={user} />;
}