import { ssgAdapter } from '@qwik.dev/router/adapters/ssg/vite';
import { extendConfig } from '@qwik.dev/router/vite';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import type { Plugin } from 'vite';
import { findNestedFiles } from '../../scripts/utils/findNestedFiles.ts';
import { urlPathFromFilePath } from '../../scripts/utils/urlPathFromFilePath.ts';
import baseConfig from '../../vite.config.ts';

/**
 * Returns the hash of the client manifest created by the client build.
 *
 * Note: SSG needs this hash to write `routeLoader$` data files that match the
 * URLs requested during client navigation. Qwik Router currently does not pass
 * it to SSG automatically and falls back to `dev` instead.
 *
 * @returns The manifest hash.
 */
function getManifestHash(): string {
  const manifestPath = 'dist/q-manifest.json';
  if (!existsSync(manifestPath)) {
    throw new Error(
      `Missing ${manifestPath}. Run the client build before the server build.`
    );
  }
  return JSON.parse(readFileSync(manifestPath, 'utf8')).manifestHash;
}

/**
 * Adds permanent redirects from the lowercase to the original casing of all
 * routes with uppercase letters to the `_redirects` file of the static build.
 *
 * Note: Qwik Router used to generate the static pages of these routes at
 * lowercase paths, which may still be linked or indexed by search engines.
 *
 * @returns The Vite plugin.
 */
function caseRedirects(): Plugin {
  return {
    name: 'case-redirects',
    closeBundle() {
      // Create redirect rules for all routes with uppercase letters
      const rules = findNestedFiles(
        ['src/routes'],
        (fileName) => fileName === 'index.tsx' || fileName === 'index.mdx'
      )
        .map((filePath) => `/${urlPathFromFilePath(filePath)}`)
        .filter((urlPath) => urlPath !== urlPath.toLowerCase())
        .sort()
        // Hint: Paths without trailing slash need their own rule, because
        // there is no lowercase page anymore that the slash could be added to
        .flatMap((urlPath) => {
          const lowerPath = urlPath.toLowerCase();
          return [
            `${lowerPath} ${urlPath} 301`,
            `${lowerPath.slice(0, -1)} ${urlPath} 301`,
          ];
        });

      // Write manual and generated rules to build output
      writeFileSync(
        'dist/_redirects',
        `${readFileSync('public/_redirects', 'utf8').trimEnd()}\n\n# Lowercase paths of routes with uppercase letters\n${rules.join('\n')}\n`
      );
    },
  };
}

export default extendConfig(
  // @ts-ignore
  baseConfig,
  () => {
    return {
      build: {
        ssr: true,
        rollupOptions: {
          input: ['src/entry.ssr.tsx'],
        },
      },
      plugins: [
        ssgAdapter({
          origin: 'https://formisch.dev',
          sitemapOutFile: null,
          // @ts-ignore
          manifest: { manifestHash: getManifestHash() },
        }),
        caseRedirects(),
      ],
    };
  }
);
