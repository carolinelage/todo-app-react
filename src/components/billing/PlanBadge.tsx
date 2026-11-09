'use client';

import Link from 'next/link';
import { planDetails } from '../../lib/entitlements';
import { useUserPlan } from '../../hooks/useUserPlan';

export default function PlanBadge() {
  const { plan, isLoading } = useUserPlan();

  if (isLoading) return <span className="plan-badge">...</span>;

  return (
    <Link href="/plans" className={`plan-badge plan-${plan}`}>
      {planDetails[plan].name}
    </Link>
  );
}
