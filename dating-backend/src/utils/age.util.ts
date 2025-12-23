export function calcAge(birthday?: Date): number {
  if (!birthday) return 22;

  const diff = Date.now() - new Date(birthday).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}
