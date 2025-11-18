export type PlanTier = 'FREE' | 'PRO' | 'ENTERPRISE'

export interface PlanFeature {
  name: string
  description: string
  included: boolean
  limit?: string
}

export interface PlanConfig {
  id: PlanTier
  name: string
  tagline: string
  description: string
  monthlyPrice: number
  annualPrice: number
  annualDiscount: number // percentage
  features: PlanFeature[]
  limits: {
    events: number | 'unlimited'
    categories: number | 'unlimited'
    eventsPerMonth: number | 'unlimited'
    apiCalls: number | 'unlimited'
    teamMembers: number | 'unlimited'
    dataRetention: string
    support: string
  }
  popular?: boolean
  cta: string
  color: string
}

export const PLANS: Record<PlanTier, PlanConfig> = {
  FREE: {
    id: 'FREE',
    name: 'Free',
    tagline: 'Perfect for getting started',
    description: 'Everything you need to start tracking events',
    monthlyPrice: 0,
    annualPrice: 0,
    annualDiscount: 0,
    features: [
      {
        name: 'Basic Event Tracking',
        description: 'Track up to 100 events per month',
        included: true,
        limit: '100 events/month',
      },
      {
        name: 'Discord Notifications',
        description: 'Real-time alerts via Discord webhook',
        included: true,
      },
      {
        name: 'Categories',
        description: 'Organize events into categories',
        included: true,
        limit: '3 categories',
      },
      {
        name: 'Email Support',
        description: 'Get help via email',
        included: true,
        limit: '48h response time',
      },
      {
        name: 'Data Retention',
        description: 'Access to historical data',
        included: true,
        limit: '7 days',
      },
      {
        name: 'Advanced Analytics',
        description: 'Detailed insights and charts',
        included: false,
      },
      {
        name: 'API Access',
        description: 'Programmatic event creation',
        included: false,
      },
      {
        name: 'Team Collaboration',
        description: 'Invite team members',
        included: false,
      },
      {
        name: 'Custom Webhooks',
        description: 'Send events to any endpoint',
        included: false,
      },
      {
        name: 'Priority Support',
        description: '24/7 support with fast response',
        included: false,
      },
    ],
    limits: {
      events: 100,
      categories: 3,
      eventsPerMonth: 100,
      apiCalls: 0,
      teamMembers: 1,
      dataRetention: '7 days',
      support: 'Email (48h response)',
    },
    cta: 'Get Started Free',
    color: 'gray',
  },

  PRO: {
    id: 'PRO',
    name: 'Pro',
    tagline: 'Most popular for growing teams',
    description: 'Advanced features for serious event tracking',
    monthlyPrice: 19.99,
    annualPrice: 191.88, // $15.99/month - 20% off
    annualDiscount: 20,
    popular: true,
    features: [
      {
        name: 'Unlimited Events',
        description: 'Track as many events as you need',
        included: true,
        limit: 'unlimited',
      },
      {
        name: 'Discord Notifications',
        description: 'Real-time alerts via Discord webhook',
        included: true,
      },
      {
        name: 'Unlimited Categories',
        description: 'Create as many categories as needed',
        included: true,
        limit: 'unlimited',
      },
      {
        name: 'Advanced Analytics',
        description: 'Detailed insights, charts, and trends',
        included: true,
      },
      {
        name: 'API Access',
        description: 'Full REST API with documentation',
        included: true,
        limit: '10,000 calls/month',
      },
      {
        name: 'Data Retention',
        description: 'Access to historical data',
        included: true,
        limit: '90 days',
      },
      {
        name: 'Email Reminders',
        description: 'Get notified before billing',
        included: true,
      },
      {
        name: 'Custom Webhooks',
        description: 'Send events to multiple endpoints',
        included: true,
        limit: '5 webhooks',
      },
      {
        name: 'Priority Email Support',
        description: 'Priority assistance via email',
        included: true,
        limit: '12h response time',
      },
      {
        name: 'Team Collaboration',
        description: 'Invite up to 5 team members',
        included: true,
        limit: '5 members',
      },
      {
        name: 'Custom Branding',
        description: 'Remove "Powered by" badge',
        included: true,
      },
      {
        name: 'Dedicated Support',
        description: 'Phone & video call support',
        included: false,
      },
      {
        name: 'SLA Guarantee',
        description: '99.9% uptime guarantee',
        included: false,
      },
      {
        name: 'Custom Integrations',
        description: 'Build custom integrations',
        included: false,
      },
    ],
    limits: {
      events: 'unlimited',
      categories: 'unlimited',
      eventsPerMonth: 'unlimited',
      apiCalls: 10000,
      teamMembers: 5,
      dataRetention: '90 days',
      support: 'Priority Email (12h response)',
    },
    cta: 'Start 14-Day Trial',
    color: 'indigo',
  },

  ENTERPRISE: {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    tagline: 'For large-scale operations',
    description: 'Custom solutions with dedicated support',
    monthlyPrice: 99.99,
    annualPrice: 959.88, // $79.99/month - 20% off
    annualDiscount: 20,
    features: [
      {
        name: 'Everything in Pro',
        description: 'All Pro features included',
        included: true,
      },
      {
        name: 'Unlimited Everything',
        description: 'No limits on any feature',
        included: true,
      },
      {
        name: 'Advanced Analytics & Reporting',
        description: 'Custom dashboards and exports',
        included: true,
      },
      {
        name: 'Unlimited API Access',
        description: 'No rate limits',
        included: true,
        limit: 'unlimited calls',
      },
      {
        name: 'Unlimited Team Members',
        description: 'Add your entire organization',
        included: true,
        limit: 'unlimited',
      },
      {
        name: 'Lifetime Data Retention',
        description: 'Never lose your data',
        included: true,
        limit: 'unlimited',
      },
      {
        name: 'Dedicated Account Manager',
        description: 'Personal point of contact',
        included: true,
      },
      {
        name: '24/7 Priority Support',
        description: 'Phone, video, email & chat',
        included: true,
        limit: '1h response time',
      },
      {
        name: '99.9% SLA Guarantee',
        description: 'Uptime guarantee with credits',
        included: true,
      },
      {
        name: 'Custom Integrations',
        description: 'We build custom integrations for you',
        included: true,
      },
      {
        name: 'Unlimited Webhooks',
        description: 'Connect to any number of endpoints',
        included: true,
        limit: 'unlimited',
      },
      {
        name: 'White-Label Solution',
        description: 'Fully branded for your company',
        included: true,
      },
      {
        name: 'On-Premise Deployment',
        description: 'Host on your own infrastructure',
        included: true,
      },
      {
        name: 'Advanced Security',
        description: 'SSO, 2FA, audit logs, compliance',
        included: true,
      },
      {
        name: 'Custom Training',
        description: 'Onboarding for your team',
        included: true,
      },
    ],
    limits: {
      events: 'unlimited',
      categories: 'unlimited',
      eventsPerMonth: 'unlimited',
      apiCalls: 'unlimited',
      teamMembers: 'unlimited',
      dataRetention: 'unlimited',
      support: '24/7 Dedicated (1h response)',
    },
    cta: 'Contact Sales',
    color: 'purple',
  },
}

// Helper functions
export function getPlanConfig(plan: PlanTier): PlanConfig {
  return PLANS[plan]
}

export function canUpgradeTo(currentPlan: PlanTier, targetPlan: PlanTier): boolean {
  const hierarchy: Record<PlanTier, number> = {
    FREE: 0,
    PRO: 1,
    ENTERPRISE: 2,
  }

  return hierarchy[targetPlan] > hierarchy[currentPlan]
}

export function canDowngradeTo(currentPlan: PlanTier, targetPlan: PlanTier): boolean {
  const hierarchy: Record<PlanTier, number> = {
    FREE: 0,
    PRO: 1,
    ENTERPRISE: 2,
  }

  return hierarchy[targetPlan] < hierarchy[currentPlan]
}

export function calculateAnnualSavings(plan: PlanConfig): number {
  const monthlyTotal = plan.monthlyPrice * 12
  const annualTotal = plan.annualPrice
  return monthlyTotal - annualTotal
}

export function getMonthlyPriceFromAnnual(annualPrice: number): number {
  return annualPrice / 12
}

// Feature comparison for UI
export const FEATURE_COMPARISON = [
  {
    category: 'Events',
    features: [
      { name: 'Monthly events', free: '100', pro: 'Unlimited', enterprise: 'Unlimited' },
      { name: 'Event history', free: '7 days', pro: '90 days', enterprise: 'Unlimited' },
      { name: 'Event categories', free: '3', pro: 'Unlimited', enterprise: 'Unlimited' },
    ],
  },
  {
    category: 'Notifications',
    features: [
      { name: 'Discord alerts', free: true, pro: true, enterprise: true },
      { name: 'Email notifications', free: false, pro: true, enterprise: true },
      { name: 'Custom webhooks', free: false, pro: '5', enterprise: 'Unlimited' },
      { name: 'SMS alerts', free: false, pro: false, enterprise: true },
    ],
  },
  {
    category: 'Analytics',
    features: [
      { name: 'Basic analytics', free: true, pro: true, enterprise: true },
      { name: 'Advanced charts', free: false, pro: true, enterprise: true },
      { name: 'Custom dashboards', free: false, pro: false, enterprise: true },
      { name: 'Data export', free: false, pro: 'CSV', enterprise: 'CSV, JSON, Excel' },
    ],
  },
  {
    category: 'Collaboration',
    features: [
      { name: 'Team members', free: '1', pro: '5', enterprise: 'Unlimited' },
      { name: 'Role-based access', free: false, pro: true, enterprise: true },
      { name: 'Audit logs', free: false, pro: false, enterprise: true },
    ],
  },
  {
    category: 'API & Integrations',
    features: [
      { name: 'REST API', free: false, pro: '10K calls/mo', enterprise: 'Unlimited' },
      { name: 'Webhooks', free: false, pro: '5', enterprise: 'Unlimited' },
      { name: 'Custom integrations', free: false, pro: false, enterprise: true },
    ],
  },
  {
    category: 'Support',
    features: [
      { name: 'Email support', free: '48h', pro: '12h', enterprise: '1h' },
      { name: 'Priority support', free: false, pro: true, enterprise: true },
      { name: 'Phone & video', free: false, pro: false, enterprise: true },
      { name: 'Dedicated manager', free: false, pro: false, enterprise: true },
    ],
  },
]
