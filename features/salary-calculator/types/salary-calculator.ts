import type { MessageKey } from "@/lib/i18n/messages";

export const WORKER_CATEGORIES = [
  "malaysian",
  "permanent-resident",
  "foreign-worker",
] as const;

export type WorkerCategory = (typeof WORKER_CATEGORIES)[number];

export interface SalaryCalculatorFormValues {
  grossMonthlySalary: number;
  workerCategory: WorkerCategory;
  foreignWorkerEpfOptIn: boolean;
  lindung24OptIn: boolean;
  employeeEpfRate?: number;
  employerEpfRate?: number;
}

export interface SalaryDeductionLine {
  labelKey: MessageKey;
  employeeAmount: number;
  employerAmount: number;
}

export interface SalaryBreakdownResult {
  grossMonthlySalary: number;
  employeeDeductions: SalaryDeductionLine[];
  totalEmployeeDeductions: number;
  netMonthlySalary: number;
  employerContributions: SalaryDeductionLine[];
  totalEmployerCost: number;
}

export interface SalaryAnnualProjection {
  grossAnnualSalary: number;
  employeeDeductions: SalaryDeductionLine[];
  totalEmployeeDeductions: number;
  netAnnualSalary: number;
  employerContributions: SalaryDeductionLine[];
  totalEmployerCost: number;
}

export const SALARY_INCREMENT_MODES = [
  "percentage",
  "fixed-amount",
  "none",
] as const;

export type SalaryIncrementMode = (typeof SALARY_INCREMENT_MODES)[number];

export const ONE_OFF_INCREMENT_TYPES = ["amount", "percentage"] as const;

export type OneOffIncrementType = (typeof ONE_OFF_INCREMENT_TYPES)[number];

export interface OneOffIncrement {
  year: number;
  type: OneOffIncrementType;
  value: number;
}

export interface SalaryProjectionFormValues {
  projectionYears: number;
  incrementMode: SalaryIncrementMode;
  annualIncrementRate: number;
  fixedAnnualIncrement: number;
  oneOffIncrements: OneOffIncrement[];
}

export interface SalaryProjectionYearRow {
  year: number;
  grossMonthlySalary: number;
  netMonthlySalary: number;
  totalEmployeeDeductions: number;
  totalEmployerCost: number;
}

export interface SalaryProjectionResult {
  finalGrossMonthlySalary: number;
  finalNetMonthlySalary: number;
  cumulativeNetSalary: number;
  cumulativeEmployerCost: number;
  yearlyProjection: SalaryProjectionYearRow[];
}

export const EPF_STATUTORY_EMPLOYEE_RATE = 0.11;
export const EPF_SENIOR_EMPLOYEE_RATE = 0.055;
export const EPF_FOREIGN_WORKER_EMPLOYER_FLAT = 5;

export const SOCSO_CEILING = 5000;
export const EIS_CEILING = 4000;
export const EIS_RATE = 0.002;

export const PCB_MONTHLY_EPF_RELIEF_CAP = 4000 / 12;
export const PCB_FOREIGN_WORKER_FLAT_RATE = 0.3;

export const MINIMUM_WORKING_AGE = 16;
export const SOCSO_INVALIDITY_AGE_CUTOFF = 60;
export const EIS_AGE_CUTOFF = 60;

interface EpfRateRow {
  ageMin: number;
  ageMax: number;
  salaryCeiling: number;
  employeeRate: number;
  employerRate: number;
}

export const EPF_RATE_SCHEDULE: EpfRateRow[] = [
  {
    ageMin: 0,
    ageMax: 59,
    salaryCeiling: 5000,
    employeeRate: 0.11,
    employerRate: 0.13,
  },
  {
    ageMin: 0,
    ageMax: 59,
    salaryCeiling: Infinity,
    employeeRate: 0.11,
    employerRate: 0.12,
  },
  {
    ageMin: 60,
    ageMax: Infinity,
    salaryCeiling: 5000,
    employeeRate: 0.055,
    employerRate: 0.065,
  },
  {
    ageMin: 60,
    ageMax: Infinity,
    salaryCeiling: Infinity,
    employeeRate: 0.055,
    employerRate: 0.06,
  },
];

interface SocsoBracket {
  salaryMin: number;
  salaryMax: number;
  employeeShare: number;
  employerShare: number;
}

export const SOCSO_FIRST_CATEGORY_SCHEDULE: SocsoBracket[] = [
  { salaryMin: 0, salaryMax: 30, employeeShare: 0.1, employerShare: 0.4 },
  { salaryMin: 30.01, salaryMax: 50, employeeShare: 0.2, employerShare: 0.7 },
  { salaryMin: 50.01, salaryMax: 70, employeeShare: 0.3, employerShare: 1.1 },
  { salaryMin: 70.01, salaryMax: 100, employeeShare: 0.4, employerShare: 1.5 },
  { salaryMin: 100.01, salaryMax: 140, employeeShare: 0.6, employerShare: 2.1 },
  { salaryMin: 140.01, salaryMax: 200, employeeShare: 0.85, employerShare: 2.95 },
  { salaryMin: 200.01, salaryMax: 300, employeeShare: 1.25, employerShare: 4.35 },
  { salaryMin: 300.01, salaryMax: 400, employeeShare: 1.75, employerShare: 6.15 },
  { salaryMin: 400.01, salaryMax: 500, employeeShare: 2.25, employerShare: 7.85 },
  { salaryMin: 500.01, salaryMax: 600, employeeShare: 2.75, employerShare: 9.65 },
  { salaryMin: 600.01, salaryMax: 700, employeeShare: 3.25, employerShare: 11.35 },
  { salaryMin: 700.01, salaryMax: 800, employeeShare: 3.75, employerShare: 13.15 },
  { salaryMin: 800.01, salaryMax: 900, employeeShare: 4.25, employerShare: 14.85 },
  { salaryMin: 900.01, salaryMax: 1000, employeeShare: 4.75, employerShare: 16.65 },
  { salaryMin: 1000.01, salaryMax: 1100, employeeShare: 5.25, employerShare: 18.35 },
  { salaryMin: 1100.01, salaryMax: 1200, employeeShare: 5.75, employerShare: 20.15 },
  { salaryMin: 1200.01, salaryMax: 1300, employeeShare: 6.25, employerShare: 21.85 },
  { salaryMin: 1300.01, salaryMax: 1400, employeeShare: 6.75, employerShare: 23.65 },
  { salaryMin: 1400.01, salaryMax: 1500, employeeShare: 7.25, employerShare: 25.35 },
  { salaryMin: 1500.01, salaryMax: 1600, employeeShare: 7.75, employerShare: 27.15 },
  { salaryMin: 1600.01, salaryMax: 1700, employeeShare: 8.25, employerShare: 28.85 },
  { salaryMin: 1700.01, salaryMax: 1800, employeeShare: 8.75, employerShare: 30.65 },
  { salaryMin: 1800.01, salaryMax: 1900, employeeShare: 9.25, employerShare: 32.35 },
  { salaryMin: 1900.01, salaryMax: 2000, employeeShare: 9.75, employerShare: 34.15 },
  { salaryMin: 2000.01, salaryMax: 2100, employeeShare: 10.25, employerShare: 35.85 },
  { salaryMin: 2100.01, salaryMax: 2200, employeeShare: 10.75, employerShare: 37.65 },
  { salaryMin: 2200.01, salaryMax: 2300, employeeShare: 11.25, employerShare: 39.35 },
  { salaryMin: 2300.01, salaryMax: 2400, employeeShare: 11.75, employerShare: 41.15 },
  { salaryMin: 2400.01, salaryMax: 2500, employeeShare: 12.25, employerShare: 42.85 },
  { salaryMin: 2500.01, salaryMax: 2600, employeeShare: 12.75, employerShare: 44.65 },
  { salaryMin: 2600.01, salaryMax: 2700, employeeShare: 13.25, employerShare: 46.35 },
  { salaryMin: 2700.01, salaryMax: 2800, employeeShare: 13.75, employerShare: 48.15 },
  { salaryMin: 2800.01, salaryMax: 2900, employeeShare: 14.25, employerShare: 49.85 },
  { salaryMin: 2900.01, salaryMax: 3000, employeeShare: 14.75, employerShare: 51.65 },
  { salaryMin: 3000.01, salaryMax: 3100, employeeShare: 15.25, employerShare: 53.35 },
  { salaryMin: 3100.01, salaryMax: 3200, employeeShare: 15.75, employerShare: 55.15 },
  { salaryMin: 3200.01, salaryMax: 3300, employeeShare: 16.25, employerShare: 56.85 },
  { salaryMin: 3300.01, salaryMax: 3400, employeeShare: 16.75, employerShare: 58.65 },
  { salaryMin: 3400.01, salaryMax: 3500, employeeShare: 17.25, employerShare: 60.35 },
  { salaryMin: 3500.01, salaryMax: 3600, employeeShare: 17.75, employerShare: 62.15 },
  { salaryMin: 3600.01, salaryMax: 3700, employeeShare: 18.25, employerShare: 63.85 },
  { salaryMin: 3700.01, salaryMax: 3800, employeeShare: 18.75, employerShare: 65.65 },
  { salaryMin: 3800.01, salaryMax: 3900, employeeShare: 19.25, employerShare: 67.35 },
  { salaryMin: 3900.01, salaryMax: 4000, employeeShare: 19.75, employerShare: 69.15 },
  { salaryMin: 4000.01, salaryMax: 4100, employeeShare: 20.25, employerShare: 70.85 },
  { salaryMin: 4100.01, salaryMax: 4200, employeeShare: 20.75, employerShare: 72.65 },
  { salaryMin: 4200.01, salaryMax: 4300, employeeShare: 21.25, employerShare: 74.35 },
  { salaryMin: 4300.01, salaryMax: 4400, employeeShare: 21.75, employerShare: 76.15 },
  { salaryMin: 4400.01, salaryMax: 4500, employeeShare: 22.25, employerShare: 77.85 },
  { salaryMin: 4500.01, salaryMax: 4600, employeeShare: 22.75, employerShare: 79.65 },
  { salaryMin: 4600.01, salaryMax: 4700, employeeShare: 23.25, employerShare: 81.35 },
  { salaryMin: 4700.01, salaryMax: 4800, employeeShare: 23.75, employerShare: 83.15 },
  { salaryMin: 4800.01, salaryMax: 4900, employeeShare: 24.25, employerShare: 84.85 },
  { salaryMin: 4900.01, salaryMax: 5000, employeeShare: 24.75, employerShare: 86.65 },
  { salaryMin: 5000.01, salaryMax: Infinity, employeeShare: 24.75, employerShare: 86.65 },
];

export const SOCSO_EIS_ONLY_SCHEDULE: SocsoBracket[] = [
  { salaryMin: 0, salaryMax: 30, employeeShare: 0.05, employerShare: 0.25 },
  { salaryMin: 30.01, salaryMax: 50, employeeShare: 0.15, employerShare: 0.45 },
  { salaryMin: 50.01, salaryMax: 70, employeeShare: 0.2, employerShare: 0.7 },
  { salaryMin: 70.01, salaryMax: 100, employeeShare: 0.25, employerShare: 1.0 },
  { salaryMin: 100.01, salaryMax: 140, employeeShare: 0.35, employerShare: 1.4 },
  { salaryMin: 140.01, salaryMax: 200, employeeShare: 0.5, employerShare: 1.9 },
  { salaryMin: 200.01, salaryMax: 300, employeeShare: 0.8, employerShare: 2.85 },
  { salaryMin: 300.01, salaryMax: 400, employeeShare: 1.1, employerShare: 4.0 },
  { salaryMin: 400.01, salaryMax: 500, employeeShare: 1.45, employerShare: 5.1 },
  { salaryMin: 500.01, salaryMax: 600, employeeShare: 1.75, employerShare: 6.25 },
  { salaryMin: 600.01, salaryMax: 700, employeeShare: 2.1, employerShare: 7.35 },
  { salaryMin: 700.01, salaryMax: 800, employeeShare: 2.45, employerShare: 8.5 },
  { salaryMin: 800.01, salaryMax: 900, employeeShare: 2.75, employerShare: 9.6 },
  { salaryMin: 900.01, salaryMax: 1000, employeeShare: 3.1, employerShare: 10.8 },
  { salaryMin: 1000.01, salaryMax: 1100, employeeShare: 3.4, employerShare: 11.9 },
  { salaryMin: 1100.01, salaryMax: 1200, employeeShare: 3.75, employerShare: 13.05 },
  { salaryMin: 1200.01, salaryMax: 1300, employeeShare: 4.05, employerShare: 14.15 },
  { salaryMin: 1300.01, salaryMax: 1400, employeeShare: 4.4, employerShare: 15.3 },
  { salaryMin: 1400.01, salaryMax: 1500, employeeShare: 4.7, employerShare: 16.45 },
  { salaryMin: 1500.01, salaryMax: 1600, employeeShare: 5.05, employerShare: 17.55 },
  { salaryMin: 1600.01, salaryMax: 1700, employeeShare: 5.35, employerShare: 18.75 },
  { salaryMin: 1700.01, salaryMax: 1800, employeeShare: 5.7, employerShare: 19.85 },
  { salaryMin: 1800.01, salaryMax: 1900, employeeShare: 6.0, employerShare: 21.05 },
  { salaryMin: 1900.01, salaryMax: 2000, employeeShare: 6.35, employerShare: 22.15 },
  { salaryMin: 2000.01, salaryMax: 2100, employeeShare: 6.65, employerShare: 23.3 },
  { salaryMin: 2100.01, salaryMax: 2200, employeeShare: 7.0, employerShare: 24.45 },
  { salaryMin: 2200.01, salaryMax: 2300, employeeShare: 7.3, employerShare: 25.65 },
  { salaryMin: 2300.01, salaryMax: 2400, employeeShare: 7.65, employerShare: 26.8 },
  { salaryMin: 2400.01, salaryMax: 2500, employeeShare: 7.95, employerShare: 27.95 },
  { salaryMin: 2500.01, salaryMax: 2600, employeeShare: 8.3, employerShare: 29.1 },
  { salaryMin: 2600.01, salaryMax: 2700, employeeShare: 8.6, employerShare: 30.25 },
  { salaryMin: 2700.01, salaryMax: 2800, employeeShare: 8.95, employerShare: 31.4 },
  { salaryMin: 2800.01, salaryMax: 2900, employeeShare: 9.25, employerShare: 32.55 },
  { salaryMin: 2900.01, salaryMax: 3000, employeeShare: 9.6, employerShare: 33.7 },
  { salaryMin: 3000.01, salaryMax: 3100, employeeShare: 9.9, employerShare: 34.85 },
  { salaryMin: 3100.01, salaryMax: 3200, employeeShare: 10.25, employerShare: 36.05 },
  { salaryMin: 3200.01, salaryMax: 3300, employeeShare: 10.55, employerShare: 37.2 },
  { salaryMin: 3300.01, salaryMax: 3400, employeeShare: 10.9, employerShare: 38.35 },
  { salaryMin: 3400.01, salaryMax: 3500, employeeShare: 11.2, employerShare: 39.5 },
  { salaryMin: 3500.01, salaryMax: 3600, employeeShare: 11.55, employerShare: 40.65 },
  { salaryMin: 3600.01, salaryMax: 3700, employeeShare: 11.85, employerShare: 41.8 },
  { salaryMin: 3700.01, salaryMax: 3800, employeeShare: 12.2, employerShare: 42.95 },
  { salaryMin: 3800.01, salaryMax: 3900, employeeShare: 12.5, employerShare: 44.1 },
  { salaryMin: 3900.01, salaryMax: 4000, employeeShare: 12.85, employerShare: 45.3 },
  { salaryMin: 4000.01, salaryMax: 4100, employeeShare: 13.15, employerShare: 46.45 },
  { salaryMin: 4100.01, salaryMax: 4200, employeeShare: 13.5, employerShare: 47.6 },
  { salaryMin: 4200.01, salaryMax: 4300, employeeShare: 13.8, employerShare: 48.75 },
  { salaryMin: 4300.01, salaryMax: 4400, employeeShare: 14.15, employerShare: 49.9 },
  { salaryMin: 4400.01, salaryMax: 4500, employeeShare: 14.5, employerShare: 51.05 },
  { salaryMin: 4500.01, salaryMax: 4600, employeeShare: 14.8, employerShare: 52.2 },
  { salaryMin: 4600.01, salaryMax: 4700, employeeShare: 15.15, employerShare: 53.35 },
  { salaryMin: 4700.01, salaryMax: 4800, employeeShare: 15.45, employerShare: 54.55 },
  { salaryMin: 4800.01, salaryMax: 4900, employeeShare: 15.8, employerShare: 55.7 },
  { salaryMin: 4900.01, salaryMax: 5000, employeeShare: 16.1, employerShare: 56.85 },
  { salaryMin: 5000.01, salaryMax: Infinity, employeeShare: 16.1, employerShare: 56.85 },
];

interface PcbBracket {
  chargeableIncomeMin: number;
  chargeableIncomeMax: number;
  baseTax: number;
  rateAboveMin: number;
}

export const PCB_MONTHLY_SCHEDULE: PcbBracket[] = [
  { chargeableIncomeMin: 0, chargeableIncomeMax: 417, baseTax: 0, rateAboveMin: 0 },
  { chargeableIncomeMin: 418, chargeableIncomeMax: 1667, baseTax: 0, rateAboveMin: 0.01 },
  { chargeableIncomeMin: 1668, chargeableIncomeMax: 2917, baseTax: 12.5, rateAboveMin: 0.03 },
  { chargeableIncomeMin: 2918, chargeableIncomeMax: 4167, baseTax: 50.0, rateAboveMin: 0.08 },
  { chargeableIncomeMin: 4168, chargeableIncomeMax: 5833, baseTax: 150.0, rateAboveMin: 0.13 },
  { chargeableIncomeMin: 5834, chargeableIncomeMax: 8333, baseTax: 366.67, rateAboveMin: 0.21 },
  { chargeableIncomeMin: 8334, chargeableIncomeMax: 20833, baseTax: 891.67, rateAboveMin: 0.24 },
  { chargeableIncomeMin: 20834, chargeableIncomeMax: 33333, baseTax: 3891.67, rateAboveMin: 0.245 },
  { chargeableIncomeMin: 33334, chargeableIncomeMax: 50000, baseTax: 6954.17, rateAboveMin: 0.25 },
  { chargeableIncomeMin: 50001, chargeableIncomeMax: 83333, baseTax: 11120.92, rateAboveMin: 0.26 },
  { chargeableIncomeMin: 83334, chargeableIncomeMax: 166667, baseTax: 19787.5, rateAboveMin: 0.28 },
  { chargeableIncomeMin: 166668, chargeableIncomeMax: Infinity, baseTax: 43121.08, rateAboveMin: 0.30 },
];

interface Lindung24Bracket {
  salaryMin: number;
  salaryMax: number;
  premium: number;
}

// Lindung24 (Skim Lindung Pekerja) - Voluntary PERKESO scheme
// Coverage up to RM6,000 monthly salary (maximum insurable wage)
export const LINDUNG24_PREMIUM_SCHEDULE: Lindung24Bracket[] = [
  { salaryMin: 0, salaryMax: 1000, premium: 5 },
  { salaryMin: 1000.01, salaryMax: 2000, premium: 10 },
  { salaryMin: 2000.01, salaryMax: 3000, premium: 15 },
  { salaryMin: 3000.01, salaryMax: 4000, premium: 20 },
  { salaryMin: 4000.01, salaryMax: 5000, premium: 25 },
  { salaryMin: 5000.01, salaryMax: 6000, premium: 30 },
  // RM6,000 is the maximum insurable wage - salaries above use this bracket
  { salaryMin: 6000.01, salaryMax: Infinity, premium: 30 },
];
