export const COMPOUNDING_FREQUENCIES = [
  "annually",
  "quarterly",
  "monthly",
] as const;

export type CompoundingFrequency = (typeof COMPOUNDING_FREQUENCIES)[number];

export interface CompoundInterestFormValues {
  startingPrincipal: number;
  annualRate: number;
  durationYears: number;
  compoundingFrequency: CompoundingFrequency;
  monthlyContribution: number;
}

export interface CompoundInterestProjection {
  period: number;
  year: number;
  totalContributions: number;
  totalGrowth: number;
  endingBalance: number;
}

export interface CompoundInterestSummary {
  finalProjectedBalance: number;
  totalContributions: number;
  totalGrowth: number;
  projection: CompoundInterestProjection[];
}
