'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FiBarChart2, FiCheckCircle, FiChevronDown, FiGrid, FiInbox, FiMenu, FiSettings, FiX } from 'react-icons/fi';
import BrandLogo from '../BrandLogo';
import LogoutButton from '../auth/LogoutButton';
import { hasFeature } from '../../lib/entitlements';
import { useUserPlan } from '../../hooks/useUserPlan';

export default function MobileMenu({ isAdmin = false }: { isAdmin?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const { plan, isLoading: isPlanLoading } = useUserPlan();
  const close = () => setIsOpen(false);
  const canViewInsights = !isPlanLoading && hasFeature(plan, 'productivity_insights');

  return (
    <>
      <button type="button" className="mobile-menu-button" onClick={() => setIsOpen(true)} aria-label="Abrir menu"><FiMenu /></button>
      {isOpen && <button type="button" className="mobile-menu-overlay" aria-label="Fechar menu" onClick={close} />}
      <aside className={`mobile-drawer sidebar ${isOpen ? 'open' : ''}`}>
        <Link href="/dashboard" className="sidebar-logo" onClick={close}>
          <BrandLogo />
        </Link>
        <button type="button" className="mobile-menu-close" onClick={close} aria-label="Fechar menu"><FiX /></button>
        <div className="workspace-switcher">
          <span className="workspace-avatar">S</span>
          <span><strong>Meu workspace</strong><small>Plano pessoal</small></span>
          <FiChevronDown className="workspace-chevron" aria-hidden="true" />
        </div>
        <nav className="sidebar-nav" aria-label="Navegação principal">
          <span className="nav-label">Workspace</span>
          <Link href="/dashboard" className="nav-item" onClick={close}><FiGrid /> Visão geral</Link>
          <Link href="/dashboard/tasks" className="nav-item" onClick={close}><FiInbox /> Minhas tarefas</Link>
          <Link href="/dashboard/tasks" className="nav-item" onClick={close}><FiCheckCircle /> Concluídas</Link>
          <span className="nav-label nav-label-spaced">Insights</span>
          {canViewInsights && <Link href="/dashboard" className="nav-item" onClick={close}><FiBarChart2 /> Produtividade</Link>}
          <Link href="/dashboard/settings" className="nav-item" onClick={close}><FiSettings /> Configurações</Link>
          {isAdmin && <Link href="/admin" className="nav-item" onClick={close}><FiBarChart2 /> Administração</Link>}
        </nav>
        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <span className="upgrade-star">✦</span>
            <strong>Faça seu dia<br />brilhar mais</strong>
            <small>Desbloqueie todo o potencial do starTodo.</small>
            <Link href="/plans" className="upgrade-link" onClick={close}>Conhecer planos <span>↗</span></Link>
          </div>
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}
