export function formatCurrency(value: number, locale = "en-MY"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
