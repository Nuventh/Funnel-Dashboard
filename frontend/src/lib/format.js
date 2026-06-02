export function formatPct(fraction) {
  const percent = fraction * 100;
  const rounded = Math.round(percent * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}%`;
}

export function formatInt(value) {
  return new Intl.NumberFormat('en-US').format(value);
}
