'use client';

import { signOut } from 'firebase/auth';
import { FiLogOut } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { getFirebaseAuth } from '../../lib/firebase';

export default function LogoutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();

  async function handleLogout() {
    await signOut(getFirebaseAuth());
    router.replace('/auth/login');
  }

  return (
    <button type="button" className={`logout-button${compact ? ' compact' : ''}`} onClick={handleLogout}>
      <FiLogOut /> Sair
    </button>
  );
}
