import { notFound } from 'next/navigation';
import { getUsersById } from '../../actions/get-users';
import { UserProfile } from './client-component';
import React from 'react';

export default async function UserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const user = await getUsersById(id);

  if (!user) {
    notFound();
  }

  return <UserProfile user={user} />;
}