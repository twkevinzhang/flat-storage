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

export function joinPath(...paths: string[]): string {
  return paths.join('/').replace(/\/+/g, '/');
}

export function count(a: string, target: string): number {
  return a.split(target).length -1;
}

export function normalizePath(path: string | string[] | undefined | null): string {
  if (!path || (Array.isArray(path) && path.length === 0)) return '/';
  let pathStr = Array.isArray(path) ? '/' + path.join('/') : (path as string);
  if (!pathStr.startsWith('/')) pathStr = '/' + pathStr;
  return pathStr.replace(/\/+/g, '/');
}
