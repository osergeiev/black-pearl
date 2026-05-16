import { redirect } from 'next/navigation';
import { getSessionAndProfile } from '@/lib/auth';

export default async function RootPage() {
  const session = await getSessionAndProfile();
  if (!session) redirect('/login');
  redirect(session.profile.role === 'admin' ? '/admin' : '/home');
}
