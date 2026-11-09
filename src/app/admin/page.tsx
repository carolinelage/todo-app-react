'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, collectionGroup, getDocs } from 'firebase/firestore';
import { getIdTokenResult, onAuthStateChanged, User } from 'firebase/auth';
import { FiArrowLeft, FiBarChart2, FiCheckCircle, FiInbox, FiUsers } from 'react-icons/fi';
import BrandLogo from '../../components/BrandLogo';
import LogoutButton from '../../components/auth/LogoutButton';
import { getFirebaseAuth, getFirebaseDb } from '../../lib/firebase';

type Metrics = { users: number; verified: number; lists: number; tasks: number; plans: Record<string, number> };

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [error, setError] = useState('');

  useEffect(() => onAuthStateChanged(getFirebaseAuth(), async (currentUser) => {
    if (!currentUser) { setError('Faça login para acessar o painel administrativo.'); return; }
    const token = await getIdTokenResult(currentUser, true);
    if (token.claims.admin !== true) { setError('Esta área é restrita a administradores.'); return; }
    setUser(currentUser);
    try {
      const [usersSnapshot, listsSnapshot] = await Promise.all([
        getDocs(collection(getFirebaseDb(), 'users')),
        getDocs(collectionGroup(getFirebaseDb(), 'lists')),
      ]);
      const plans: Record<string, number> = {};
      usersSnapshot.forEach((item) => { const plan = item.data().plan ?? 'free'; plans[plan] = (plans[plan] ?? 0) + 1; });
      setMetrics({
        users: usersSnapshot.size,
        verified: usersSnapshot.docs.filter((item) => item.data().emailVerified === true).length,
        lists: listsSnapshot.size,
        tasks: listsSnapshot.docs.reduce((total, item) => total + (Array.isArray(item.data().todos) ? item.data().todos.length : 0), 0),
        plans,
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar as métricas.');
    }
  }), []);

  if (error) return <main className="auth-loading"><p role="alert">{error}</p><Link href="/dashboard">Voltar ao dashboard</Link></main>;
  if (!user || !metrics) return <main className="auth-loading"><p>Carregando painel administrativo...</p></main>;

  return (
    <main className="admin-shell">
      <header className="admin-header"><Link href="/dashboard"><BrandLogo /></Link><div><span className="dashboard-eyebrow">Administração</span><h1>Visão do produto</h1></div><LogoutButton compact /></header>
      <section className="admin-content">
        <p className="admin-intro">Acompanhe a saúde do starTodo com dados reais do Firebase.</p>
        <div className="stats-grid admin-stats">
          <article className="stat-card"><div className="stat-icon"><FiUsers /></div><span>Usuários cadastrados</span><strong>{metrics.users}</strong></article>
          <article className="stat-card"><div className="stat-icon"><FiCheckCircle /></div><span>E-mails verificados</span><strong>{metrics.verified}</strong></article>
          <article className="stat-card"><div className="stat-icon"><FiInbox /></div><span>Listas criadas</span><strong>{metrics.lists}</strong></article>
          <article className="stat-card"><div className="stat-icon"><FiBarChart2 /></div><span>Tarefas salvas</span><strong>{metrics.tasks}</strong></article>
        </div>
        <section className="admin-panel"><h2>Distribuição por plano</h2><div className="admin-plan-list">{Object.entries(metrics.plans).map(([plan, count]) => <div key={plan}><span>{plan === 'free' ? 'Grátis' : plan}</span><strong>{count}</strong></div>)}</div></section>
      </section>
    </main>
  );
}
