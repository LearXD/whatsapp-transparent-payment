export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export const isExpired = (date: Date) => new Date(date) < new Date();

export function formatDate(date: Date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year} ${hour}:${minute}`;
}