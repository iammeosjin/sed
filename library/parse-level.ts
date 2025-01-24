export function parseLevel(level: number) {
  if (level === 1) {
    return '1st';
  } else if (level === 2) {
    return '2nd';
  } else if (level === 3) {
    return '3rd';
  } else {
    return `${level}th`;
  }
}
