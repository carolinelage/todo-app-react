'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { FiArrowUpRight, FiEye, FiEyeOff, FiLock, FiMail } from 'react-icons/fi';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { getFirebaseAuth } from '../../lib/firebase';
import BrandLogo from '../BrandLogo';

type AuthMode = 'login' | 'register';

const firebaseErrorMessages: Record<string, string> = {
  'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
  'auth/invalid-email': 'Informe um e-mail válido.',
  'auth/invalid-credential': 'E-mail ou senha inválidos.',
  'auth/operation-not-allowed': 'O cadastro por e-mail está desativado no Firebase.',
  'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
    'A chave da API do Firebase é inválida. Confira o arquivo .env.local.',
  'auth/app-not-authorized':
    'Este domínio não está autorizado no Firebase. Adicione localhost em Authentication > Settings > Authorized domains.',
  'auth/network-request-failed':
    'Não foi possível conectar ao Firebase. Verifique sua internet e tente novamente.',
  'auth/configuration-not-found':
    'A configuração de autenticação não foi encontrada no projeto Firebase.',
  'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
  'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
};

function getErrorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
    return firebaseErrorMessages[error.code] ??
      `O Firebase recusou a operação (${error.code}). Confira se E-mail/senha está ativado no Firebase.`;
  }
  return error instanceof Error ? error.message : 'Não foi possível concluir a operação.';
}

export default function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const isRegister = mode === 'register';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (isRegister && password !== confirmPassword) {
      setError('As senhas precisam ser iguais.');
      return;
    }
    setIsSubmitting(true);
    try {
      const auth = getFirebaseAuth();
      if (isRegister) {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(credential.user);
        router.push('/auth/verify-email');
        return;
      }

      const credential = await signInWithEmailAndPassword(auth, email, password);
      if (!credential.user.emailVerified) {
        await signOut(auth);
        setError('Verifique seu e-mail antes de entrar.');
        return;
      }
      router.push('/dashboard');
    } catch (authError) {
      setError(getErrorMessage(authError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-orb auth-orb-one" />
      <div className="auth-orb auth-orb-two" />
      <section className="auth-showcase" aria-label="Sobre o starTodo">
        <Link href="/" className="brand-lockup">
          <BrandLogo className="brand-logo-showcase" />
        </Link>
        <div className="showcase-copy">
          <span className="eyebrow">seu espaço para focar</span>
          <h1>Que seus sonhos<br /><em>encontrem seu caminho.</em></h1>
          <p>Reúna seus planos, honre seus recomeços e transforme cada intenção em uma conquista.</p>
        </div>
        <div className="showcase-note"><span className="sparkle">✦</span><span>clareza para o seu dia</span></div>
      </section>

      <section className="auth-card" aria-labelledby="auth-title">
        <div className="mobile-brand">
          <Link href="/" className="brand-lockup">
            <BrandLogo className="brand-logo-mobile" />
          </Link>
        </div>
        <h1 id="auth-title">{isRegister ? 'Criar sua conta' : 'Bem-vindo de volta'}</h1>
        <p className="auth-subtitle">
          {isRegister ? 'Crie sua conta para organizar suas tarefas.' : 'Entre para acessar suas tarefas.'}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="email">E-mail</label>
          <div className="input-wrap">
            <FiMail aria-hidden="true" />
            <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@email.com" autoComplete="email" required />
          </div>
          <label htmlFor="password">Senha</label>
          <div className="input-wrap">
            <FiLock aria-hidden="true" />
            <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo de 6 caracteres" autoComplete={isRegister ? 'new-password' : 'current-password'} minLength={6} required />
            <button type="button" className="password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {isRegister && (
            <>
              <label htmlFor="confirm-password">Confirmar senha</label>
              <div className="input-wrap">
                <FiLock aria-hidden="true" />
                <input id="confirm-password" type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repita sua senha" autoComplete="new-password" minLength={6} required />
              </div>
            </>
          )}
          {error && <p className="auth-error" role="alert">{error}</p>}
          {success && <p className="auth-success" role="status">{success}</p>}
          <button type="submit" className="auth-button" disabled={isSubmitting}>
            {isSubmitting ? 'Aguarde...' : isRegister ? <>Começar agora <FiArrowUpRight /></> : <>Entrar no starTodo <FiArrowUpRight /></>}
          </button>
        </form>
        <p className="auth-switch">
          {isRegister ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'}{' '}
          <Link href={isRegister ? '/auth/login' : '/auth/register'}>{isRegister ? 'Entrar' : 'Cadastre-se'}</Link>
        </p>
      </section>
    </main>
  );
}
