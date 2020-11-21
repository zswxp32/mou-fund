export const toPercentString = (value: string | number, percent = false): string => {
  if (value === '--') return value;
  const temp: number = typeof value === 'string' ? parseFloat(value) : value;
  if (temp == 0) return percent ? '0.00%' : '0.00';
  const result = temp > 0 ? `+${temp.toFixed(2)}` : temp.toFixed(2);
  return percent ? `${result}%` : result;
};

export const toPercentColor = (value: string | number): string => {
  if (value === '--' || value === null) return 'grey';
  const temp: number = typeof value === 'string' ? parseFloat(value) : value;
  if (temp == 0) return 'grey';
  return temp > 0 ? 'red' : 'green';
};

export const toNumberColor = (value: number): string => {
  if (value == null || value == 0) return 'grey';
  return value > 0 ? 'red' : 'green';
}

export const toNumberPN = (value: number): string => {
  return value > 0 ? `+${value.toFixed(2)}` : `${value.toFixed(2)}`;
}