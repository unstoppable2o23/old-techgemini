export function formatUsageMinutes(totalMinutes: number): string {
  if (!totalMinutes) return "0m";
  if (totalMinutes < 60) return `${totalMinutes}m`;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${m}m`;
}
