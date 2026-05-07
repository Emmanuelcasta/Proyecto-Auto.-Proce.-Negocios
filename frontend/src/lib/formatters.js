export function formatCOP(n) {
  if (n === null || n === undefined) return '—';
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(Math.round(n));
  const s = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${sign}$${s}`;
}

export function formatHrs(n) {
  if (n === null || n === undefined) return '—';
  return n.toFixed(2).replace('.', ',');
}
