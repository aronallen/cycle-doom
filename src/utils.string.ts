export function trim(a: string) {
  return a.trim();
}

export function combineSelectors(a: string, b: string) {
  return trim(`${trim(a)} ${trim(b)}`);
}