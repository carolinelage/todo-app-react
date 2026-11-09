'use client';

import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import AuthGuard from '../../../components/auth/AuthGuard';
import BrandLogo from '../../../components/BrandLogo';
import LogoutButton from '../../../components/auth/LogoutButton';
import ProfileSettings from '../../../components/profile/ProfileSettings';

export default function SettingsPage() {
  return (
    <AuthGuard>
      <main className="settings-shell">
        <header className="settings-topbar"><Link href="/dashboard"><BrandLogo /></Link><Link href="/dashboard" className="settings-back"><FiArrowLeft /> Voltar ao dashboard</Link><LogoutButton compact /></header>
        <ProfileSettings />
      </main>
    </AuthGuard>
  );
}
