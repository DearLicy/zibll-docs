const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, '') || '';

export function withBasePath(path: string) {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  return `${basePath}${path}` || '/';
}
