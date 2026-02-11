export function formatPula(amount: number): string {
  return `P${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}
