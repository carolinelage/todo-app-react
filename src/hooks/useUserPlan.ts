'use client';

import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { getFirebaseAuth, getFirebaseDb } from '../lib/firebase';
import { normalizePlan, PlanId } from '../lib/entitlements';

export function useUserPlan() {
  const [plan, setPlan] = useState<PlanId>('free');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let unsubscribe = () => {};

    try {
      const user = getFirebaseAuth().currentUser;
      if (!user) {
        setIsLoading(false);
        return;
      }

      const profileRef = doc(getFirebaseDb(), 'users', user.uid);
      unsubscribe = onSnapshot(
        profileRef,
        (snapshot) => {
          if (!snapshot.exists()) {
            void setDoc(profileRef, {
              email: user.email ?? null,
              emailVerified: user.emailVerified,
              plan: 'free',
              createdAt: new Date().toISOString(),
            }, { merge: true });
            setPlan('free');
          } else {
            setPlan(normalizePlan(snapshot.data().plan));
          }
          setIsLoading(false);
        },
        () => {
          setError('Não foi possível carregar o plano da sua conta.');
          setIsLoading(false);
        },
      );
    } catch (planError) {
      setError(planError instanceof Error ? planError.message : 'Firebase não configurado.');
      setIsLoading(false);
    }

    return () => unsubscribe();
  }, []);

  return { plan, isLoading, error };
}
