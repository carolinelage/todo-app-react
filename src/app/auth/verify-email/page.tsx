'use client';

import Link from 'next/link';
import { reload, sendEmailVerification } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowUpRight, FiMail, FiRefreshCw } from 'react-icons/fi';
import { getFirebaseAuth } from '../../../lib/firebase';
import BrandLogo from '../../../components/BrandLogo';

export default function VerifyEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const user = auth.currentUser;

    if (!user) {
      router.replace('/auth/login');
      return;
    }

    setEmail(user.email ?? '');
  }, [router]);

  async function checkVerification() {
    setError('');
    setMessage('');
    setIsChecking(true);

    try {
      const auth = getFirebaseAuth();
      const user = auth.currentUser;

      if (!user) {
        router.replace('/auth/login');
        return;
      }

      await reload(user);

      if (user.emailVerified) {
        router.replace('/dashboard');
        return;
      }

      setMessage('Ainda não identificamos a confirmação. Abra o link no seu e-mail e tente novamente.');
    } catch {
      setError('Não foi possível verificar agora. Tente novamente.');
    } finally {
      setIsChecking(false);
    }
  }

  async function resendVerification() {
    setError('');
    setMessage('');

    try {
      const user = getFirebaseAuth().currentUser;
      if (!user) {
        router.replace('/auth/login');
        return;
      }

      await sendEmailVerification(user);
      setMessage('Enviamos um novo e-mail de verificação.');
    } catch {
      setError('Não foi possível reenviar o e-mail agora.');
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card verification-card" aria-labelledby="verify-title">
        <Link href="/" className="brand-lockup verification-brand">
          <BrandLogo className="brand-logo-mobile" />
        </Link>
        <div className="verification-icon"><FiMail /></div>
        <h1 id="verify-title">Confirme seu e-mail</h1>
        <p className="auth-subtitle">
          Enviamos um link de confirmação para <strong>{email || 'seu e-mail'}.</strong>{' '}
          Depois de confirmar, volte para cá e entraremos automaticamente.
        </p>
        {error && <p className="auth-error" role="alert">{error}</p>}
        {message && <p className="auth-success" role="status">{message}</p>}
        <button type="button" className="auth-button" onClick={checkVerification} disabled={isChecking}>
          {isChecking ? 'Verificando...' : <>Já confirmei meu e-mail <FiArrowUpRight /></>}
        </button>
        <button type="button" className="verification-resend" onClick={resendVerification}>
          <FiRefreshCw /> Reenviar e-mail
        </button>
        <Link href="/auth/login" className="verification-back">Voltar para o login</Link>
      </section>
    </main>
  );
}
