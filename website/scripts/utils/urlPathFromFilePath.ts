/**
 * Returns the URL path of a route file without leading slash, so that
 * `src/routes/(docs)/react/api/(hooks)/useForm/index.mdx` becomes
 * `react/api/useForm/`.
 *
 * @param filePath The file path of the route file.
 *
 * @returns The URL path.
 */
export function urlPathFromFilePath(filePath: string): string {
  return filePath
    .replace(/\\/g, '/')
    .replace(/src\/routes\//, '')
    .replace(/\(.+?\)\//g, '')
    .replace(/index\.(tsx|mdx)$/, '');
}
