export function formatCurrencyCompactVnd(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} tr`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toLocaleString("vi-VN", { maximumFractionDigits: 0 })} k`;
  }
  return value.toLocaleString("vi-VN");
}

export function formatAreaM2(value: number): string {
  return `${value.toLocaleString("vi-VN", { maximumFractionDigits: 1 })} m²`;
}
