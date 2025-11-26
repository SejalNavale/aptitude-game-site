export type SupportedDomain = 'Verbal' | 'Logical' | 'Quant' | 'Mixed';

export interface CategoryTimerRule {
  key: SupportedDomain | 'Mixed';
  label: string;
  seconds: number;
  description: string;
}

export const MIN_ROOM_PLAYERS = 2;
export const MAX_ROOM_PLAYERS = 15;
export const DEFAULT_MIXED_TIMER_SECONDS = 60;

const BASE_TIMER_RULES: CategoryTimerRule[] = [
  {
    key: 'Verbal',
    label: 'Verbal Ability',
    seconds: 30,
    description: 'Fast-paced vocabulary and comprehension prompts. You get 30 seconds to answer.',
  },
  {
    key: 'Quant',
    label: 'Quantitative Aptitude',
    seconds: 90,
    description: 'Computation heavy problems. You have up to 90 seconds to crunch the numbers.',
  },
  {
    key: 'Logical',
    label: 'Logical Reasoning',
    seconds: 60,
    description: 'Pattern and deduction challenges give you 60 seconds per attempt.',
  },
];

export const CATEGORY_TIMER_RULES: CategoryTimerRule[] = [
  ...BASE_TIMER_RULES,
  {
    key: 'Mixed',
    label: 'Mixed Mode',
    seconds: DEFAULT_MIXED_TIMER_SECONDS,
    description: 'Mixed playlists inherit each question’s native timer. When unknown, 60 seconds are applied.',
  },
];

const TIMER_LOOKUP = BASE_TIMER_RULES.reduce<Record<string, CategoryTimerRule>>((lookup, rule) => {
  lookup[rule.key.toLowerCase()] = rule;
  lookup[rule.label.toLowerCase()] = rule;
  return lookup;
}, {});

function normalizeDomain(domain?: string): string {
  if (!domain) {
    return '';
  }
  const trimmed = domain.trim().toLowerCase();
  if (trimmed.includes('verbal')) return 'verbal';
  if (trimmed.includes('logic')) return 'logical';
  if (trimmed.includes('quant')) return 'quant';
  return trimmed;
}

export function getTimerRuleForDomain(domain?: string): CategoryTimerRule {
  const normalized = normalizeDomain(domain);
  if (normalized === 'mixed') {
    return CATEGORY_TIMER_RULES.find((rule) => rule.key === 'Mixed')!;
  }
  return TIMER_LOOKUP[normalized] || {
    key: 'Mixed',
    label: 'Mixed Mode',
    seconds: DEFAULT_MIXED_TIMER_SECONDS,
    description: 'Default mixed timer rule',
  };
}

export function getTimerSecondsForDomain(domain?: string): number {
  return getTimerRuleForDomain(domain).seconds;
}

export function getTimerLabelForDomain(domain?: string): string {
  return getTimerRuleForDomain(domain).label;
}

