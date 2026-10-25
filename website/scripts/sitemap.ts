import fs from 'node:fs';
import path from 'node:path';
import { findNestedFiles, urlPathFromFilePath } from './utils/index';

const ORIGIN = 'https://formisch.dev';

// Find all route index files
const filePaths = findNestedFiles(
  [path.join('src', 'routes')],
  (fileName) => fileName === 'index.tsx' || fileName === 'index.mdx'
);

// Create URL paths and sort them
const urlSet = filePaths
  // Transform file paths to URL paths
  .map(urlPathFromFilePath)
  // Sort URL paths alphabetically
  .sort()
  // Reduce URL paths to URL set
  .reduce(
    (urlPaths, urlPath) =>
      `${urlPaths}<url><loc>${ORIGIN}/${urlPath}</loc></url>`,
    ''
  );

// Write sitemap.xml to public directory
fs.writeFileSync(
  path.join('public', 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlSet}</urlset>`
);
