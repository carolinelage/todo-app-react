'use client';

import TodoWorkspace from '../../components/todo/TodoWorkspace';
import Link from 'next/link';
import { getIdTokenResult, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FiBarChart2, FiCheckCircle, FiChevronDown, FiGrid, FiInbox, FiMenu, FiPlus, FiSettings, FiX } from 'react-icons/fi';
import AuthGuard from '../../components/auth/AuthGuard';
import LogoutButton from '../../components/auth/LogoutButton';
import BrandLogo from '../../components/BrandLogo';
import PlanBadge from '../../components/billing/PlanBadge';
import { getFirebaseAuth, getFirebaseDb } from '../../lib/firebase';

export default function HomePage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [workspaceName, setWorkspaceName] = useState('Meu workspace');
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(getFirebaseAuth(), (user) => {
      if (!user) return;
      void getIdTokenResult(user).then((token) => setIsAdmin(token.claims.admin === true));
      return onSnapshot(doc(getFirebaseDb(), 'users', user.uid), (snapshot) => {
        const profile = snapshot.data() ?? {};
        setProfileName(typeof profile.name === 'string' ? profile.name : '');
        setWorkspaceName(typeof profile.workspaceName === 'string' ? profile.workspaceName : 'Meu workspace');
      });
    });
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentDate(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const hour = currentDate.getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(currentDate);

  return (
    <AuthGuard>
    <main className="dashboard-shell">
      {isMobileMenuOpen && <button type="button" className="mobile-menu-overlay" aria-label="Fechar menu" onClick={() => setIsMobileMenuOpen(false)} />}
      <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <Link href="/dashboard" className="sidebar-logo">
          <BrandLogo />
        </Link>
        <button type="button" className="mobile-menu-close" onClick={() => setIsMobileMenuOpen(false)} aria-label="Fechar menu"><FiX /></button>
        <div className="workspace-switcher">
          <span className="workspace-avatar">S</span>
          <span><strong>{workspaceName}</strong><small>Plano pessoal</small></span>
          <FiChevronDown className="workspace-chevron" aria-hidden="true" />
        </div>
        <nav className="sidebar-nav" aria-label="Navegação principal">
          <span className="nav-label">Workspace</span>
          <Link href="/dashboard" className="nav-item active" onClick={() => setIsMobileMenuOpen(false)}><FiGrid /> Visão geral</Link>
          <Link href="/dashboard/tasks" className="nav-item" onClick={() => setIsMobileMenuOpen(false)}><FiInbox /> Minhas tarefas <span className="nav-count">3</span></Link>
          <Link href="/dashboard/tasks" className="nav-item" onClick={() => setIsMobileMenuOpen(false)}><FiCheckCircle /> Concluídas</Link>
          <span className="nav-label nav-label-spaced">Insights</span>
          <Link href="/dashboard" className="nav-item" onClick={() => setIsMobileMenuOpen(false)}><FiBarChart2 /> Produtividade</Link>
          <Link href="/dashboard/settings" className="nav-item" onClick={() => setIsMobileMenuOpen(false)}><FiSettings /> Configurações</Link>
          {isAdmin && <Link href="/admin" className="nav-item" onClick={() => setIsMobileMenuOpen(false)}><FiBarChart2 /> Administração</Link>}
        </nav>
        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <span className="upgrade-star">✦</span>
            <strong>Faça seu dia<br />brilhar mais</strong>
            <small>Desbloqueie todo o potencial do starTodo.</small>
            <Link href="/plans" className="upgrade-link">Conhecer planos <span>↗</span></Link>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <section className="dashboard-content">
        <header className="dashboard-topbar">
          <button type="button" className="mobile-menu-button" onClick={() => setIsMobileMenuOpen(true)} aria-label="Abrir menu"><FiMenu /></button>
          <div className="breadcrumb"><span>Workspace</span><b>/</b> Visão geral</div>
          <div className="topbar-actions">
            <span className="status-dot" /> Tudo sincronizado
            <PlanBadge />
            <span className="topbar-divider" />
            <span className="profile-avatar">{(profileName || 'Você').slice(0, 2).toUpperCase()}</span>
          </div>
        </header>
        <div className="dashboard-main">
          <div className="dashboard-heading">
            <div>
              <span className="dashboard-eyebrow">{formattedDate}</span>
              <h1>{greeting}, {profileName || 'por aqui'} <span>✦</span></h1>
              <p>Um passo de cada vez. Você está construindo algo incrível.</p>
            </div>
            <Link href="#task-input" className="new-task-button"><FiPlus /> Nova tarefa</Link>
          </div>

          <div className="stats-grid">
            <article className="stat-card stat-card-primary">
              <div className="stat-icon"><FiCheckCircle /></div>
              <span>Tarefas concluídas</span>
              <strong>12 <small>esta semana</small></strong>
              <div className="stat-progress"><i /></div>
            </article>
            <article className="stat-card">
              <div className="stat-icon muted-icon"><FiInbox /></div>
              <span>Em andamento</span>
              <strong>03 <small>tarefas ativas</small></strong>
              <div className="stat-caption">Continue no seu ritmo ✦</div>
            </article>
            <article className="stat-card">
              <div className="stat-icon mauve-icon"><FiBarChart2 /></div>
              <span>Foco da semana</span>
              <strong>78% <small>+12% vs. anterior</small></strong>
              <div className="stat-caption positive">Você está evoluindo</div>
            </article>
          </div>

          <section className="tasks-panel">
            <div className="panel-heading">
              <div><h2>Suas tarefas</h2><p>O que precisa da sua atenção hoje?</p></div>
              <Link href="/plans" className="view-all">Ver planos <span>↗</span></Link>
            </div>
            <TodoWorkspace />
          </section>
        </div>
      </section>
    </main>
    </AuthGuard>
  );
}