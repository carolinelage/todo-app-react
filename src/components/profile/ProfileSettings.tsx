'use client';

import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { FormEvent, useEffect, useState } from 'react';
import { FiSave, FiUser } from 'react-icons/fi';
import { getFirebaseAuth, getFirebaseDb } from '../../lib/firebase';

export default function ProfileSettings() {
  const [name, setName] = useState('');
  const [workspaceName, setWorkspaceName] = useState('Meu workspace');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const user = getFirebaseAuth().currentUser;
    if (!user) return undefined;
    setEmail(user.email ?? '');
    const profileRef = doc(getFirebaseDb(), 'users', user.uid);
    return onSnapshot(profileRef, (snapshot) => {
      const profile = snapshot.data() ?? {};
      setName(typeof profile.name === 'string' ? profile.name : '');
      setWorkspaceName(typeof profile.workspaceName === 'string' ? profile.workspaceName : 'Meu workspace');
      setBio(typeof profile.bio === 'string' ? profile.bio : '');
      setIsLoading(false);
    }, () => {
      setError('Não foi possível carregar seu perfil.');
      setIsLoading(false);
    });
  }, []);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const user = getFirebaseAuth().currentUser;
    if (!user) return;
    setIsSaving(true);
    setError('');
    setMessage('');
    try {
      await setDoc(doc(getFirebaseDb(), 'users', user.uid), {
        email: user.email ?? null,
        emailVerified: user.emailVerified,
        name: name.trim().slice(0, 80),
        workspaceName: workspaceName.trim().slice(0, 80) || 'Meu workspace',
        bio: bio.trim().slice(0, 180),
      }, { merge: true });
      setMessage('Perfil atualizado com sucesso.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Não foi possível salvar seu perfil.');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <p className="tasks-loading">Carregando configurações...</p>;

  return (
    <section className="settings-panel">
      <div className="settings-heading">
        <div className="settings-avatar"><FiUser /></div>
        <div><span className="dashboard-eyebrow">Seu perfil</span><h1>Configurações</h1><p>Personalize seu espaço no starTodo.</p></div>
      </div>
      <form className="settings-form" onSubmit={saveProfile}>
        <label htmlFor="profile-name">Como podemos chamar você?</label>
        <input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Seu nome" maxLength={80} />
        <label htmlFor="workspace-name">Nome do workspace</label>
        <input id="workspace-name" value={workspaceName} onChange={(event) => setWorkspaceName(event.target.value)} placeholder="Meu workspace" maxLength={80} />
        <label htmlFor="profile-email">E-mail</label>
        <input id="profile-email" value={email} readOnly aria-describedby="email-help" />
        <small id="email-help">O e-mail é gerenciado pelo Firebase Authentication.</small>
        <label htmlFor="profile-bio">Sobre você <span>(opcional)</span></label>
        <textarea id="profile-bio" value={bio} onChange={(event) => setBio(event.target.value)} placeholder="Uma frase sobre seu momento..." maxLength={180} rows={4} />
        {error && <p className="auth-error" role="alert">{error}</p>}
        {message && <p className="auth-success" role="status">{message}</p>}
        <button type="submit" className="auth-button" disabled={isSaving}><FiSave /> {isSaving ? 'Salvando...' : 'Salvar alterações'}</button>
      </form>
    </section>
  );
}
