'use client';

import { onAuthStateChanged, User } from 'firebase/auth';
import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getFirebaseAuth } from '../../lib/firebase';

export default function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(
        getFirebaseAuth(),
        (currentUser) => {
          if (!currentUser) {
            router.replace('/auth/login');
            return;
          }

          if (!currentUser.emailVerified) {
            router.replace('/auth/login?verification=required');
            return;
          }

          setUser(currentUser);
          setIsLoading(false);
        },
        () => {
          setError('Não foi possível validar sua sessão. Tente novamente.');
          setIsLoading(false);
        },
      );

      return unsubscribe;
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Firebase não configurado.');
      setIsLoading(false);
      return undefined;
    }
  }, [router]);

  if (error) {
    return <main className="auth-loading"><p role="alert">{error}</p></main>;
  }

  if (isLoading || !user) {
    return <main className="auth-loading"><p>Validando sua sessão...</p></main>;
  }

  return children;
}
