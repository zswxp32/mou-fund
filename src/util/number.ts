export const toPercentString = (value, percent = false) => {
  if (value === '--') return value;
  let num = value;
  if (typeof value !== 'number') num = parseFloat(value);
  num = num.toFixed(2);
  const str = num > 0 ? `+${num}` : num;
  return percent ? `${str}%` : str;
};

export const toPercentColor = (value) => {
  if (value === '--') return 'grey';
  let num = value;
  if (typeof value !== 'number') num = parseFloat(value);
  if (num.toFixed(2) === 0) return 'grey';
  return num > 0 ? 'red' : 'green';
}