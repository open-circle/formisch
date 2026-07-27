/**
 * Shared knowledge about our documentation pages and their Markdown mirrors
 * that is used by the Worker and our build scripts.
 */

// Frameworks that Formisch supports, each with its own guides and API reference
export const FRAMEWORKS = [
  'angular',
  'preact',
  'qwik',
  'react',
  'solid',
  'svelte',
  'vue',
] as const;
export type Framework = (typeof FRAMEWORKS)[number];

// Framework used to resolve documentation pages that exist for every framework
// when no framework is specified (matches the default framework of our website)
export const DEFAULT_FRAMEWORK: Framework = 'react';

// Display names of the frameworks as used in tool outputs
export const FRAMEWORK_TITLES: Record<Framework, string> = {
  angular: 'Angular',
  preact: 'Preact',
  qwik: 'Qwik',
  react: 'React',
  solid: 'SolidJS',
  svelte: 'Svelte',
  vue: 'Vue',
};

// Content areas of the website (every documentation page is either a guide, an
// API reference page or a blog post)
export const CONTENT_AREAS = ['guides', 'api', 'blog'] as const;
export type ContentArea = (typeof CONTENT_AREAS)[number];

// URL path prefixes under which a Markdown version exists for every page. The
// framework guides and API reference live under `/{framework}/{guides|api}/`,
// the shared form methods and core types under `/methods/api/` and `/core/api/`
// and the blog posts directly under `/blog/`.
export const DOC_PATHS = [
  ...FRAMEWORKS.flatMap((framework) => [
    `${framework}/guides`,
    `${framework}/api`,
  ]),
  'methods/api',
  'core/api',
  'blog',
] as const;
export type DocPath = (typeof DOC_PATHS)[number];

// Alternation of all path prefixes with escaped slashes for regular expressions
const DOC_PATHS_PATTERN = DOC_PATHS.map((docPath) =>
  docPath.replaceAll('/', '\\/')
).join('|');

// Characters allowed in a page name. Besides word characters, dots and
// hyphens, this includes `$` so that Qwik pages such as `useForm$` are matched.
const PAGE_NAME = '[\\w$.-]';

// Path of documentation pages and their Markdown version. The first group
// captures the path prefix (e.g. `react/api` or `blog`), the second the page
// name and the third the optional ".md" suffix, including the naive "/.md"
// suffix that agents produce by appending ".md" to a page URL that ends with a
// trailing slash.
export const DOCS_PATH_REGEX = new RegExp(
  `^\\/(${DOC_PATHS_PATTERN})\\/(${PAGE_NAME}+?)(\\.md|\\/\\.md)?\\/?$`
);

// Path prefix and page name of a documentation page. Matched case-insensitively
// as our static assets are case-sensitive but agents may guess the casing.
export const AREA_PATH_REGEX = new RegExp(
  `^(${DOC_PATHS_PATTERN})\\/(${PAGE_NAME}+)$`,
  'i'
);

/**
 * An entry of the search index that our build process generates and our MCP
 * server consumes.
 */
export interface SearchEntry {
  path: DocPath;
  framework: Framework | null;
  area: ContentArea;
  group: string;
  name: string;
  title: string;
  description: string;
  excerpt: string;
  headings: string[];
}

/**
 * Returns the display title of a documentation path prefix.
 *
 * @param docPath The path prefix of the documentation page.
 *
 * @returns The display title of the path prefix.
 */
export function getDocPathTitle(docPath: DocPath): string {
  if (docPath === 'blog') {
    return 'Blog';
  }
  if (docPath === 'methods/api') {
    return 'Methods';
  }
  if (docPath === 'core/api') {
    return 'Core types';
  }
  const [framework, area] = docPath.split('/') as [Framework, ContentArea];
  return `${FRAMEWORK_TITLES[framework]} ${area === 'api' ? 'API reference' : 'guides'}`;
}

/**
 * Creates the URLs of the HTML page and Markdown version of a documentation
 * page.
 *
 * @param origin The origin of the website.
 * @param docPath The path prefix of the page.
 * @param name The name of the page.
 *
 * @returns The URLs of the page.
 */
export function getDocUrls(origin: string, docPath: string, name: string) {
  return {
    url: `${origin}/${docPath}/${name}/`,
    markdownUrl: `${origin}/${docPath}/${name}.md`,
  };
}
