'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FiBarChart2, FiCheckCircle, FiGrid, FiInbox, FiMenu, FiSettings, FiX } from 'react-icons/fi';

export default function MobileMenu({ isAdmin = false }: { isAdmin?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);

  return (
    <>
      <button type="button" className="mobile-menu-button" onClick={() => setIsOpen(true)} aria-label="Abrir menu"><FiMenu /></button>
      {isOpen && <button type="button" className="mobile-menu-overlay" aria-label="Fechar menu" onClick={close} />}
      <aside className={`mobile-drawer ${isOpen ? 'open' : ''}`}>
        <button type="button" className="mobile-menu-close" onClick={close} aria-label="Fechar menu"><FiX /></button>
        <span className="nav-label">Workspace</span>
        <Link href="/dashboard" onClick={close}><FiGrid /> Visão geral</Link>
        <Link href="/dashboard/tasks" onClick={close}><FiInbox /> Minhas tarefas</Link>
        <Link href="/dashboard/tasks" onClick={close}><FiCheckCircle /> Concluídas</Link>
        <span className="nav-label nav-label-spaced">Insights</span>
        <Link href="/dashboard" onClick={close}><FiBarChart2 /> Produtividade</Link>
        <Link href="/dashboard/settings" onClick={close}><FiSettings /> Configurações</Link>
        {isAdmin && <Link href="/admin" onClick={close}><FiBarChart2 /> Administração</Link>}
      </aside>
    </>
  );
}
