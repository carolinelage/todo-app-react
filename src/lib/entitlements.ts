export type PlanId = 'free' | 'pro' | 'business';

export type Feature =
  | 'unlimited_lists'
  | 'cross_device_sync'
  | 'productivity_insights'
  | 'custom_themes'
  | 'shared_lists'
  | 'team_collaboration'
  | 'priority_support';

export const planDetails: Record<PlanId, {
  name: string;
  maxLists: number | null;
  features: Feature[];
}> = {
  free: {
    name: 'Grátis',
    maxLists: 3,
    features: [],
  },
  pro: {
    name: 'Pro',
    maxLists: null,
    features: ['unlimited_lists', 'cross_device_sync', 'productivity_insights', 'custom_themes'],
  },
  business: {
    name: 'Business',
    maxLists: null,
    features: ['unlimited_lists', 'cross_device_sync', 'productivity_insights', 'custom_themes', 'shared_lists', 'team_collaboration', 'priority_support'],
  },
};

export function normalizePlan(value: unknown): PlanId {
  return value === 'pro' || value === 'business' ? value : 'free';
}

export function hasFeature(plan: PlanId, feature: Feature) {
  return planDetails[plan].features.includes(feature);
}
