import {
  EIS_AGE_CUTOFF,
  EIS_CEILING,
  EIS_RATE,
  EPF_FOREIGN_WORKER_EMPLOYER_FLAT,
  EPF_STATUTORY_EMPLOYEE_RATE,
  LINDUNG24_PREMIUM_SCHEDULE,
  PCB_FOREIGN_WORKER_FLAT_RATE,
  PCB_MONTHLY_EPF_RELIEF_CAP,
  PCB_MONTHLY_SCHEDULE,
  SOCSO_CEILING,
  SOCSO_EIS_ONLY_SCHEDULE,
  SOCSO_FIRST_CATEGORY_SCHEDULE,
  SOCSO_INVALIDITY_AGE_CUTOFF,
  type SalaryAnnualProjection,
  type SalaryBreakdownResult,
  type SalaryCalculatorFormValues,
  type SalaryDeductionLine,
} from "@/features/salary-calculator/types/salary-calculator";

const DEFAULT_AGE = 30;

interface EpfContribution {
  employeeAmount: number;
  employerAmount: number;
}

function normalizeEpfRate(rate: number | undefined, statutoryRate: number): number {
  if (rate === undefined) return statutoryRate;
  return rate > 1 ? rate / 100 : rate;
}

function calculateEpf(values: SalaryCalculatorFormValues): EpfContribution {
  const { grossMonthlySalary, workerCategory, foreignWorkerEpfOptIn, employeeEpfRate, employerEpfRate } = values;
  const isForeign = workerCategory === "foreign-worker";

  if (isForeign && !foreignWorkerEpfOptIn) {
    return { employeeAmount: 0, employerAmount: 0 };
  }

  if (isForeign) {
    const empRate = normalizeEpfRate(employeeEpfRate, EPF_STATUTORY_EMPLOYEE_RATE);
    const employerFlat = employerEpfRate !== undefined
      ? grossMonthlySalary * normalizeEpfRate(employerEpfRate, 0.12)
      : EPF_FOREIGN_WORKER_EMPLOYER_FLAT;
    return {
      employeeAmount: grossMonthlySalary * empRate,
      employerAmount: employerFlat,
    };
  }

  const empRate = normalizeEpfRate(employeeEpfRate, EPF_STATUTORY_EMPLOYEE_RATE);
  const empRateEmployer = normalizeEpfRate(employerEpfRate, grossMonthlySalary <= 5000 ? 0.13 : 0.12);

  return {
    employeeAmount: grossMonthlySalary * empRate,
    employerAmount: grossMonthlySalary * empRateEmployer,
  };
}

interface SocsoEntry {
  employeeEmploymentInjury: number;
  employerEmploymentInjury: number;
  employeeInvalidity: number;
  employerInvalidity: number;
}

function calculateSocso(values: SalaryCalculatorFormValues): SocsoEntry {
  const { grossMonthlySalary, workerCategory } = values;
  const isForeign = workerCategory === "foreign-worker";
  const cappedSalary = Math.min(grossMonthlySalary, SOCSO_CEILING);
  const schedule = isForeign || DEFAULT_AGE >= SOCSO_INVALIDITY_AGE_CUTOFF
    ? SOCSO_EIS_ONLY_SCHEDULE
    : SOCSO_FIRST_CATEGORY_SCHEDULE;

  const bracket = schedule.find(
    (b) => cappedSalary >= b.salaryMin && cappedSalary <= b.salaryMax,
  );

  if (!bracket) {
    return { employeeEmploymentInjury: 0, employerEmploymentInjury: 0, employeeInvalidity: 0, employerInvalidity: 0 };
  }

  if (isForeign || DEFAULT_AGE >= SOCSO_INVALIDITY_AGE_CUTOFF) {
    return {
      employeeEmploymentInjury: bracket.employeeShare,
      employerEmploymentInjury: bracket.employerShare,
      employeeInvalidity: 0,
      employerInvalidity: 0,
    };
  }

  return {
    employeeEmploymentInjury: 0,
    employerEmploymentInjury: 0,
    employeeInvalidity: bracket.employeeShare,
    employerInvalidity: bracket.employerShare,
  };
}

interface EisContribution {
  employeeAmount: number;
  employerAmount: number;
}

function calculateEis(values: SalaryCalculatorFormValues): EisContribution {
  const { grossMonthlySalary, workerCategory } = values;
  const isForeign = workerCategory === "foreign-worker";

  if (isForeign || DEFAULT_AGE >= EIS_AGE_CUTOFF) {
    return { employeeAmount: 0, employerAmount: 0 };
  }

  const cappedSalary = Math.min(grossMonthlySalary, EIS_CEILING);
  const amount = cappedSalary * EIS_RATE;

  return { employeeAmount: amount, employerAmount: amount };
}

function calculatePcb(
  values: SalaryCalculatorFormValues,
  employeeEpf: number,
): number {
  const { grossMonthlySalary, workerCategory } = values;

  if (workerCategory === "foreign-worker") {
    return grossMonthlySalary * PCB_FOREIGN_WORKER_FLAT_RATE;
  }

  const allowableEpfRelief = Math.min(employeeEpf, PCB_MONTHLY_EPF_RELIEF_CAP);
  const chargeableIncome = grossMonthlySalary - allowableEpfRelief;

  if (chargeableIncome <= 0) {
    return 0;
  }

  const bracket = PCB_MONTHLY_SCHEDULE.find(
    (b) => chargeableIncome >= b.chargeableIncomeMin && chargeableIncome <= b.chargeableIncomeMax,
  );

  if (!bracket) {
    return 0;
  }

  return bracket.baseTax + (chargeableIncome - (bracket.chargeableIncomeMin - 1)) * bracket.rateAboveMin;
}

function calculateLindung24(values: SalaryCalculatorFormValues): number {
  const { grossMonthlySalary, lindung24OptIn } = values;

  if (!lindung24OptIn) {
    return 0;
  }

  const bracket = LINDUNG24_PREMIUM_SCHEDULE.find(
    (b) => grossMonthlySalary >= b.salaryMin && grossMonthlySalary <= b.salaryMax,
  );

  return bracket ? bracket.premium : 0;
}

export function calculateSalaryBreakdown(
  values: SalaryCalculatorFormValues,
): SalaryBreakdownResult {
  const { grossMonthlySalary, workerCategory } = values;

  const epf = calculateEpf(values);
  const socso = calculateSocso(values);
  const eis = calculateEis(values);
  const pcbAmount = calculatePcb(values, epf.employeeAmount);
  const lindung24Amount = calculateLindung24(values);

  const employeeDeductions: SalaryDeductionLine[] = [];
  const employerContributions: SalaryDeductionLine[] = [];

  if (epf.employeeAmount > 0) {
    employeeDeductions.push({ label: "EPF (Employee)", employeeAmount: epf.employeeAmount, employerAmount: 0 });
    employerContributions.push({ label: "EPF (Employer)", employeeAmount: 0, employerAmount: epf.employerAmount });
  }

  const socsoEmployeeTotal = socso.employeeEmploymentInjury + socso.employeeInvalidity;
  const socsoEmployerTotal = socso.employerEmploymentInjury + socso.employerInvalidity;

  if (workerCategory === "foreign-worker" || socso.employeeInvalidity > 0) {
    const socsoLabel = socso.employeeInvalidity > 0 ? "SOCSO" : "SOCSO (Employment Injury)";
    employeeDeductions.push({ label: socsoLabel, employeeAmount: socsoEmployeeTotal, employerAmount: 0 });
    employerContributions.push({ label: "SOCSO (Employer)", employeeAmount: 0, employerAmount: socsoEmployerTotal });
  }

  if (eis.employeeAmount > 0) {
    employeeDeductions.push({ label: "EIS (SIP)", employeeAmount: eis.employeeAmount, employerAmount: 0 });
    employerContributions.push({ label: "EIS (Employer)", employeeAmount: 0, employerAmount: eis.employerAmount });
  }

  employeeDeductions.push({ label: "PCB (MTD)", employeeAmount: pcbAmount, employerAmount: 0 });

  if (lindung24Amount > 0) {
    employeeDeductions.push({ label: "Lindung24", employeeAmount: lindung24Amount, employerAmount: 0 });
  }

  const totalEmployeeDeductions = employeeDeductions.reduce(
    (sum, d) => sum + d.employeeAmount,
    0,
  );

  const totalEmployerContributions = employerContributions.reduce(
    (sum, c) => sum + c.employerAmount,
    0,
  );

  return {
    grossMonthlySalary,
    employeeDeductions,
    totalEmployeeDeductions,
    netMonthlySalary: grossMonthlySalary - totalEmployeeDeductions,
    employerContributions,
    totalEmployerCost: grossMonthlySalary + totalEmployerContributions,
  };
}

export function calculateAnnualProjection(
  result: SalaryBreakdownResult,
): SalaryAnnualProjection {
  const multiply = (line: SalaryDeductionLine): SalaryDeductionLine => ({
    ...line,
    employeeAmount: line.employeeAmount * 12,
    employerAmount: line.employerAmount * 12,
  });

  return {
    grossAnnualSalary: result.grossMonthlySalary * 12,
    employeeDeductions: result.employeeDeductions.map(multiply),
    totalEmployeeDeductions: result.totalEmployeeDeductions * 12,
    netAnnualSalary: result.netMonthlySalary * 12,
    employerContributions: result.employerContributions.map(multiply),
    totalEmployerCost: result.totalEmployerCost * 12,
  };
}
