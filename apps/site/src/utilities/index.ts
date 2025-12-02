export function latestIndex<T>(array: Array<T>): number {
  return size(array) - 1;
}

export function findOrThrow<T>(array: Array<T>, f: (arg: T) => {}): T {
  const r = array.find(f);
  if (!r) {
    throw new Error('not found');
  }
  return r;
}
