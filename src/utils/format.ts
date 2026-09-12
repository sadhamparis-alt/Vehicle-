/**
 * Formatting utilities for Currency (INR ₹) and Fleet Telemetry
 */

export function formatCurrency(amount: number = 0): string {
  const safeAmount = isNaN(amount) ? 0 : amount;
  return `₹${safeAmount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatKm(km: number = 0): string {
  const safeKm = isNaN(km) ? 0 : km;
  return `${safeKm.toLocaleString('en-IN')} KM`;
}

export function formatHours(hours: number = 0): string {
  const safeHours = isNaN(hours) ? 0 : hours;
  return `${safeHours.toLocaleString('en-IN')} hrs`;
}
