'use client';

import Link from 'next/link';
import { FiBarChart2, FiCheckCircle, FiChevronDown, FiGrid, FiInbox, FiSettings } from 'react-icons/fi';
import AuthGuard from '../../../components/auth/AuthGuard';
import LogoutButton from '../../../components/auth/LogoutButton';
import TasksOverview from '../../../components/todo/TasksOverview';
import BrandLogo from '../../../components/BrandLogo';
import PlanBadge from '../../../components/billing/PlanBadge';

export default function TasksPage() {
  return (
    <AuthGuard>
      <main className="dashboard-shell">
        <aside className="sidebar">
          <Link href="/dashboard" className="sidebar-logo">
            <BrandLogo />
          </Link>
          <div className="workspace-switcher">
            <span className="workspace-avatar">S</span>
            <span><strong>Meu workspace</strong><small>Plano pessoal</small></span>
            <FiChevronDown className="workspace-chevron" aria-hidden="true" />
          </div>
          <nav className="sidebar-nav" aria-label="Navegação principal">
            <span className="nav-label">Workspace</span>
            <Link href="/dashboard" className="nav-item"><FiGrid /> Visão geral</Link>
            <Link href="/dashboard/tasks" className="nav-item active"><FiInbox /> Minhas tarefas</Link>
            <Link href="/dashboard/tasks" className="nav-item"><FiCheckCircle /> Concluídas</Link>
            <span className="nav-label nav-label-spaced">Insights</span>
            <Link href="/dashboard/tasks" className="nav-item"><FiBarChart2 /> Produtividade</Link>
            <Link href="/dashboard/tasks" className="nav-item"><FiSettings /> Configurações</Link>
          </nav>
          <div className="sidebar-bottom"><LogoutButton /></div>
        </aside>
        <section className="dashboard-content">
          <header className="dashboard-topbar">
            <div className="breadcrumb"><span>Workspace</span><b>/</b> Minhas tarefas</div>
            <div className="topbar-actions"><span className="status-dot" /> Tudo sincronizado <PlanBadge /> <span className="topbar-divider" /><span className="profile-avatar">CL</span></div>
          </header>
          <div className="dashboard-main"><TasksOverview /></div>
        </section>
      </main>
    </AuthGuard>
  );
}
