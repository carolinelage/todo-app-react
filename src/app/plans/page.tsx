'use client';

import Link from 'next/link';
import { FiArrowUpRight, FiCheck, FiZap } from 'react-icons/fi';
import BrandLogo from '../../components/BrandLogo';

const plans = [
  { name: 'Grátis', price: 'R$ 0', description: 'Para começar a organizar seus dias.', features: ['Até 3 listas', 'Tarefas ilimitadas', 'Sincronização local'], button: 'Plano atual' },
  { name: 'Pro', price: 'R$ 19', description: 'Para quem quer transformar intenção em ritmo.', features: ['Listas ilimitadas', 'Sincronização em todos os dispositivos', 'Insights de produtividade', 'Temas e personalização'], button: 'Escolher Pro', featured: true },
  { name: 'Business', price: 'R$ 49', description: 'Para equipes que constroem juntas.', features: ['Tudo do Pro', 'Listas compartilhadas', 'Colaboração em equipe', 'Suporte prioritário'], button: 'Escolher Business' },
];

export default function PlansPage() {
  return (
    <main className="plans-page">
      <header className="plans-header">
        <Link href="/dashboard" className="plans-logo"><BrandLogo /></Link>
        <Link href="/dashboard" className="plans-back">← Voltar ao dashboard</Link>
      </header>
      <section className="plans-intro">
        <span className="dashboard-eyebrow"><FiZap /> escolha seu ritmo</span>
        <h1>Mais clareza para<br /><em>grandes caminhos.</em></h1>
        <p>Comece grátis. Evolua quando sentir que é hora de ir além.</p>
      </section>
      <section className="plans-grid">
        {plans.map((plan) => (
          <article className={`plan-card ${plan.featured ? 'featured-plan' : ''}`} key={plan.name}>
            {plan.featured && <span className="popular-badge">Mais escolhido</span>}
            <h2>{plan.name}</h2>
            <p>{plan.description}</p>
            <strong>{plan.price}<small>{plan.name !== 'Grátis' && '/mês'}</small></strong>
            <ul>{plan.features.map((feature) => <li key={feature}><FiCheck /> {feature}</li>)}</ul>
            <button type="button" disabled={plan.name === 'Grátis'}>{plan.button} {plan.name !== 'Grátis' && <FiArrowUpRight />}</button>
          </article>
        ))}
      </section>
      <p className="plans-note">Checkout em modo demonstração. Nenhuma cobrança será realizada.</p>
    </main>
  );
}
