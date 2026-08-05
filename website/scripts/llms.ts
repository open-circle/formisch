import 'dotenv/config';
import graymatter from 'gray-matter';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { PropertyProps } from '~/components';
import {
  type ContentArea,
  DOC_PATHS,
  type DocPath,
  type Framework,
  FRAMEWORK_TITLES,
  FRAMEWORKS,
  type SearchEntry,
} from '../worker/docs';
import { serializeProperty, transformTextSegments } from './utils/index';

// Origin of the website used to build absolute URLs
const ORIGIN = 'https://formisch.dev';

// GitHub URL used to resolve the dynamic source links of our docs to the same
// absolute URLs that the website renders
const GITHUB_URL =
  process.env.PUBLIC_GITHUB_URL ?? 'https://github.com/open-circle/formisch';

// Remove previously generated Markdown mirrors and llms files so that pages
// that were renamed or removed do not linger in the output directory
for (const entry of ['blog', 'core', 'methods', ...FRAMEWORKS]) {
  fs.rmSync(path.join('public', entry), { recursive: true, force: true });
}
for (const file of fs.readdirSync('public')) {
  if (/^llms.*\.txt$/.test(file) || file === 'search-index.json') {
    fs.rmSync(path.join('public', file), { force: true });
  }
}

// Create intro text with title and summary for llms files
const introText =
  '# Formisch\n\n> The lightweight, schema-first and fully type-safe form library for Angular, Preact, Qwik, React, React Native, Solid, Svelte and Vue.\n';

// Create details text with pointers to other resources for the llms.txt file
const detailsText =
  'Every link below points to the Markdown version of a documentation page. The same page is served as HTML at the same URL without the `.md` extension. The full documentation of each framework is available as a single file (e.g. [llms-react-full.txt](https://formisch.dev/llms-react-full.txt), with `-guides` and `-api` variants for every framework), and the blog posts are available at [llms-blog.txt](https://formisch.dev/llms-blog.txt). An MCP server with tools to search and read this documentation is available at https://formisch.dev/mcp (see [server card](https://formisch.dev/.well-known/mcp/server-card.json) and [coding agents guide](https://formisch.dev/react/guides/coding-agents.md)).\n';

// Regular expression to rewrite links to documentation pages to their Markdown
// version so that AI agents stay within the Markdown context
const DOC_LINK_REGEX = new RegExp(
  `\\]\\(\\/(${DOC_PATHS.map((docPath) => docPath.replaceAll('/', '\\/')).join('|')})\\/([\\w$.-]+?)\\/(#[^)]*)?\\)`,
  'g'
);

/**
 * Converts a markdown menu to a string suitable for our llms.txt file.
 *
 * @param markdown The markdown string to convert.
 *
 * @returns A llms.txt compatible string.
 */
function convertMenuToLlms(markdown: string): string {
  return (
    markdown
      // Change levels of headings to one level down
      .replaceAll(/^#/gm, '##')
      // Replace relative paths with URLs to Markdown files
      .replaceAll(
        /\(\/([\w-]+)\/([\w-]+)\/([\w$-]+)\/\)/gm,
        `(${ORIGIN}/$1/$2/$3.md)`
      )
  );
}

interface MenuFile {
  name: string;
  path: string;
  docPath: DocPath;
  framework: Framework | null;
  area: ContentArea;
}

/**
 * Extracts grouped file paths from a markdown menu. Every file is annotated
 * with its URL path prefix, owning framework and content area based on the
 * link target so that framework-specific and shared pages are handled alike.
 *
 * @param markdown The markdown menu string.
 *
 * @returns A grouped array of menu files.
 */
function extractFilePathsOfMenu(
  markdown: string
): { title: string; files: MenuFile[] }[] {
  // Split menu into groups based on level 2 headings
  const groups = markdown.split(/^## /gm).slice(1);

  // Convert groups into an array of menu files
  return groups.map((group) => {
    // Extract title and create slug
    const groupTitle = group.match(/(^.+)\n/)![1];
    const groupSlug = groupTitle.toLowerCase().replace(/\s+/g, '-');

    // Create object to hold title and file data
    const groupData: { title: string; files: MenuFile[] } = {
      title: groupTitle,
      files: [],
    };

    // Extract file paths from group using regex
    const filePaths = group.matchAll(/\(\/([\w-]+)\/([\w-]+)\/([\w$-]+)\/\)/gm);

    // Add data of each file path to group data
    for (const regexMatch of filePaths) {
      const area = regexMatch[1]; // framework, methods or core
      const type = regexMatch[2] as ContentArea; // guides or api
      const fileName = regexMatch[3];

      // Determine URL path prefix and owning framework of the page
      const framework = FRAMEWORKS.includes(area as Framework)
        ? (area as Framework)
        : null;
      const docPath = `${area}/${type}` as DocPath;

      // All routes follow the pattern:
      // src/routes/(docs)/{area}/{type}/({group})/{name}/index.mdx
      const filePath = path.join(
        'src',
        'routes',
        '(docs)',
        area,
        type,
        `(${groupSlug})`,
        fileName,
        'index.mdx'
      );

      // Throw error if file does not exist
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      // Add file data to files of group data
      groupData.files.push({
        name: fileName,
        path: filePath,
        docPath,
        framework,
        area: type,
      });
    }

    // Return final group data
    return groupData;
  });
}

/**
 * Formats the publication date of a blog post the same way as our website.
 *
 * @param published The publication date of the post.
 *
 * @returns A formatted date string.
 */
function formatPublished(published: Date): string {
  return published.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

interface BlogFile {
  name: string;
  path: string;
  title: string;
  published: Date;
}

/**
 * Extracts grouped file paths of our blog posts from the file system. The
 * posts are sorted by publication date and grouped by year, similar to the
 * sections of our blog page.
 *
 * @returns A grouped array of blog files.
 */
function extractFilePathsOfBlog(): { title: string; files: BlogFile[] }[] {
  // Read metadata of every blog post from its frontmatter
  const postsDir = path.join('src', 'routes', 'blog', '(posts)');
  const posts = fs
    .readdirSync(postsDir)
    .map((dirName) => ({
      name: dirName,
      path: path.join(postsDir, dirName, 'index.mdx'),
    }))
    .filter((post) => fs.existsSync(post.path))
    .map((post) => {
      const frontmatter = graymatter.read(post.path);
      return {
        ...post,
        title: frontmatter.data.title as string,
        published: new Date(frontmatter.data.published),
      };
    })
    .sort(
      (post1, post2) => post2.published.getTime() - post1.published.getTime()
    );

  // Group posts by publication year with the latest year first
  const blogGroups: { title: string; files: BlogFile[] }[] = [];
  for (const post of posts) {
    const groupTitle = `Posts of ${post.published.getUTCFullYear()}`;
    let blogGroup = blogGroups.find((group) => group.title === groupTitle);
    if (!blogGroup) {
      blogGroup = { title: groupTitle, files: [] };
      blogGroups.push(blogGroup);
    }
    blogGroup.files.push(post);
  }
  return blogGroups;
}

/**
 * Converts the MDX components of our docs to plain Markdown so that the
 * content of the generated Markdown files matches the rendered HTML output.
 *
 * @param mdxContent The MDX content to convert.
 * @param dirPath The directory path of the MDX file.
 * @param pageUrl The URL of the documentation page.
 *
 * @returns A plain Markdown string.
 */
async function convertMdxToMd(
  mdxContent: string,
  dirPath: string,
  pageUrl: string
): Promise<string> {
  // Import property data if MDX content uses spread Property components
  let properties: Record<string, PropertyProps> = {};
  if (mdxContent.includes('{...properties')) {
    properties = (
      await import(pathToFileURL(path.join(dirPath, 'properties.ts')).href)
    ).properties;
  }

  // Transform text outside of code blocks to plain Markdown
  return transformTextSegments(mdxContent, (segment) =>
    segment
      // Replace spread Property components with serialized type
      .replaceAll(
        /<Property\s+\{\.\.\.properties(?:\.([\w$]+)|\['([^']+)'\])\}\s*\/>/g,
        (_match, dotName: string | undefined, bracketName: string) => {
          const name = dotName ?? bracketName;
          const data = properties[name] as PropertyProps | undefined;
          if (!data) {
            throw new Error(`Missing property "${name}" in ${dirPath}`);
          }
          return serializeProperty(data);
        }
      )

      // Replace literal Property components with inline code
      .replaceAll(/<Property\s+type=["']([^"']+)["']\s*\/>/g, '`$1`')

      // Replace Link components with Markdown links
      .replaceAll(
        /<Link\s+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/Link>/g,
        '[$2]($1)'
      )

      // Replace inline GitHub source links that use a dynamic href with
      // Markdown links to the same absolute URL the website renders
      .replaceAll(
        /<a\s+href=\{`\$\{import\.meta\.env\.PUBLIC_GITHUB_URL\}([^`]*)`\}[^>]*>([\s\S]*?)<\/a>/g,
        (_match, rest: string, text: string) =>
          `[${text}](${GITHUB_URL}${rest})`
      )

      // Replace inline HTML anchor elements with Markdown links
      .replaceAll(
        /<a\s+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/g,
        '[$2]($1)'
      )

      // Replace ApiList components with a list of Markdown links. The items
      // are `{ text, href }` objects and their hrefs are resolved to their
      // Markdown version by the following two transformations.
      .replaceAll(/<ApiList\s+([\s\S]*?)\/>/g, (_match, attrs: string) => {
        const label = attrs.match(/label=["']([^"']+)["']/)?.[1];
        const items = [...attrs.matchAll(/\{([^{}]*)\}/g)]
          .map(([, entry]) => {
            const text = entry.match(/text:\s*['"]([^'"]+)['"]/)?.[1];
            const href = entry.match(/href:\s*['"]([^'"]+)['"]/)?.[1];
            return text && href ? `[\`${text}\`](${href})` : '';
          })
          .filter(Boolean);
        return `${label ? `${label}: ` : ''}${items.join(', ')}`;
      })

      // Resolve relative link paths to absolute link paths so that
      // links work outside the HTML context of the page
      .replaceAll(/\]\((\.\.?\/[^)]+)\)/g, (_match, target: string) => {
        const resolvedUrl = new URL(target, pageUrl);
        return `](${resolvedUrl.pathname}${resolvedUrl.hash})`;
      })

      // Rewrite links to documentation pages to their Markdown version
      .replaceAll(DOC_LINK_REGEX, '](/$1/$2.md$3)')

      // Remove MDX comments (e.g. prettier-ignore) as they only matter for
      // the source code
      .replaceAll(/\{\/\*[\s\S]*?\*\/\}\n?/g, '')

      // Remove raw HTML blocks (e.g. embedded images and logo lists) as
      // they cannot be converted to plain Markdown
      .replaceAll(/^<([a-z]+)[^>\n]*>[\s\S]*?^<\/\1>\n?/gm, '')

      // Remove remaining components (e.g. images and interactive
      // elements) as they cannot be converted to plain Markdown
      .replaceAll(/^<[A-Z][\s\S]*?\/>\n?/gm, '')
  );
}

/**
 * Warns about component markup that our MDX to Markdown conversion did not
 * catch so that new components are noticed and handled.
 *
 * @param mdContent The converted Markdown content.
 * @param filePath The path of the source MDX file.
 */
function warnAboutUnknownComponents(mdContent: string, filePath: string) {
  transformTextSegments(mdContent, (segment) => {
    const componentMatch = segment
      // Remove inline code as it can contain generic type arguments
      .replaceAll(/(`+)[\s\S]*?\1/g, '')
      .match(/<[A-Z]\w*[\s/]/);
    if (componentMatch) {
      console.warn(
        `Unknown component "${componentMatch[0].trim()}" in Markdown output of ${filePath}`
      );
    }
    return segment;
  });
}

/**
 * Extracts the second and third level headings of Markdown content outside of
 * code blocks.
 *
 * @param mdContent The Markdown content.
 *
 * @returns A list of headings.
 */
function extractHeadings(mdContent: string): string[] {
  const headings: string[] = [];
  transformTextSegments(mdContent, (segment) => {
    for (const regexMatch of segment.matchAll(/^#{2,3} (.+)$/gm)) {
      headings.push(regexMatch[1]);
    }
    return segment;
  });
  return headings;
}

/**
 * Writes a Markdown file to the public directory, creating the directory of
 * its path prefix if necessary.
 *
 * @param docPath The path prefix of the page.
 * @param name The name of the page.
 * @param content The Markdown content of the page.
 */
function writeMarkdownMirror(docPath: string, name: string, content: string) {
  const outputDir = path.join('public', ...docPath.split('/'));
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, `${name}.md`), content);
}

/**
 * Creates the agent directive that is added below the first heading of every
 * Markdown mirror.
 *
 * @param docPath The path prefix of the page.
 * @param name The name of the page.
 * @param pageUrl The URL of the documentation page.
 *
 * @returns The agent directive.
 */
function createDirective(
  docPath: string,
  name: string,
  pageUrl: string
): string {
  return `> This document is the Markdown version of [formisch.dev/${docPath}/${name}/](${pageUrl}). For the complete documentation index, see [llms.txt](${ORIGIN}/llms.txt).`;
}

// Create list to hold search index entries for our MCP server
const searchIndex: SearchEntry[] = [];

// Track shared pages (methods and core types) that have already been mirrored
// and indexed as they are referenced from every framework's API menu
const sharedPages = new Map<string, string>();
const writtenPages = new Set<string>();

// Start the main llms.txt file with a table of contents for all frameworks
let mainLlmsTxt = `${introText}\n${detailsText}`;

// Process the documentation of every framework
for (const framework of FRAMEWORKS) {
  // Read menu.md files of the framework's guides and API reference
  const menuOfGuides = fs.readFileSync(
    path.join('src', 'routes', '(docs)', framework, 'guides', 'menu.md'),
    'utf-8'
  );
  const menuOfApi = fs.readFileSync(
    path.join('src', 'routes', '(docs)', framework, 'api', 'menu.md'),
    'utf-8'
  );

  // Add framework table of contents to the main llms.txt file and write a
  // framework-specific table of contents file
  const tableOfContents = `## ${FRAMEWORK_TITLES[framework]}\n\n${convertMenuToLlms(menuOfGuides)}\n${convertMenuToLlms(menuOfApi)}`;
  mainLlmsTxt += `\n${tableOfContents}\n`;
  fs.writeFileSync(
    path.join('public', `llms-${framework}.txt`),
    `${introText}\n${tableOfContents}`
  );

  // Create object to hold content for framework-specific llms files
  const llms: Record<'full' | 'guides' | 'api', string> = {
    full: introText,
    guides: introText,
    api: introText,
  };

  // Process the guides and API reference of the framework
  const areas = [
    { id: 'guides' as const, groups: extractFilePathsOfMenu(menuOfGuides) },
    { id: 'api' as const, groups: extractFilePathsOfMenu(menuOfApi) },
  ];
  for (const area of areas) {
    for (const areaGroup of area.groups) {
      // Add group heading to framework-specific llms files
      const heading = `## ${areaGroup.title}`;
      llms.full += `\n${heading} (${area.id})\n`;
      llms[area.id] += `\n${heading}\n`;

      // Process every file of the group
      for (const file of areaGroup.files) {
        const pageKey = `${file.docPath}/${file.name}`;

        // Reuse the converted content of shared pages that were already
        // processed for a previously handled framework
        const cached = sharedPages.get(pageKey);
        if (cached) {
          llms.full += `\n${cached}`;
          llms[area.id] += `\n${cached}`;
          continue;
        }

        // Read MDX file and slice its content from the first heading to
        // remove the frontmatter and import statements
        const frontmatter = graymatter.read(file.path);
        const mdxContent = frontmatter.content.slice(
          frontmatter.content.indexOf('# ')
        );

        // Convert MDX components of content to plain Markdown
        const pageUrl = `${ORIGIN}/${file.docPath}/${file.name}/`;
        const mdContent = await convertMdxToMd(
          mdxContent,
          path.dirname(file.path),
          pageUrl
        );

        // Warn about component markup that was not converted
        warnAboutUnknownComponents(mdContent, file.path);

        // Mirror and index the page only once even if it is shared across
        // frameworks (methods and core types)
        if (!writtenPages.has(pageKey)) {
          writtenPages.add(pageKey);

          // Add entry with metadata of page to search index. The excerpt is
          // the intro paragraph that follows the heading of the page.
          const paragraphs = mdContent.split('\n\n');
          searchIndex.push({
            path: file.docPath,
            framework: file.framework,
            area: file.area,
            group: areaGroup.title,
            name: file.name,
            title: (frontmatter.data.title as string | undefined) ?? file.name,
            description:
              (frontmatter.data.description as string | undefined) ?? '',
            excerpt: paragraphs[1]?.slice(0, 400) ?? '',
            headings: extractHeadings(mdContent),
          });

          // Add agent directive below first heading and write the mirror
          const directive = createDirective(file.docPath, file.name, pageUrl);
          const headingEnd = mdContent.indexOf('\n');
          const pageContent = `${mdContent.slice(0, headingEnd)}\n\n${directive}${mdContent.slice(headingEnd)}`;
          writeMarkdownMirror(file.docPath, file.name, pageContent);
        }

        // Change level of headings two levels down without touching `#`
        // comments within code blocks
        const llmsContent = transformTextSegments(mdContent, (segment) =>
          segment.replaceAll(/^#/gm, '###')
        );

        // Add content to framework-specific llms files
        llms.full += `\n${llmsContent}`;
        llms[area.id] += `\n${llmsContent}`;

        // Cache converted content of shared pages for the next frameworks
        if (file.framework === null) {
          sharedPages.set(pageKey, llmsContent);
        }
      }
    }
  }

  // Write framework-specific llms files to public directory
  fs.writeFileSync(
    path.join('public', `llms-${framework}-full.txt`),
    llms.full
  );
  fs.writeFileSync(
    path.join('public', `llms-${framework}-guides.txt`),
    llms.guides
  );
  fs.writeFileSync(path.join('public', `llms-${framework}-api.txt`), llms.api);
}

// Process our blog posts grouped by publication year
const groupsOfBlog = extractFilePathsOfBlog();

// Create menu of our blog posts with links to their Markdown version
const menuOfBlog = `## Blog\n${groupsOfBlog
  .map(
    (blogGroup) =>
      `\n### ${blogGroup.title}\n\n${blogGroup.files
        .map(
          (file) =>
            `- [${file.title}](${ORIGIN}/blog/${file.name}.md) (${formatPublished(file.published)})\n`
        )
        .join('')}`
  )
  .join('')}`;
mainLlmsTxt += `\n${menuOfBlog}`;

// Convert blog posts to Markdown and collect them in a dedicated llms file.
// The blog is excluded from the framework-specific full files, as its posts
// are dated announcements that may describe previous versions of the API.
let llmsBlog = introText;
for (const blogGroup of groupsOfBlog) {
  llmsBlog += `\n## ${blogGroup.title}\n`;
  for (const post of blogGroup.files) {
    // Read frontmatter and recreate the title and publication meta line the
    // same way as our website, as blog posts have no heading in their body
    const frontmatter = graymatter.read(post.path);
    const authors = (frontmatter.data.authors as string[])
      .map((author) => `[${author}](https://github.com/${author})`)
      .join(', ');
    const postContent = frontmatter.content
      .replace(/^\s*(?:import[\s\S]*?from\s+'[^']+';\s*)+/, '')
      .trimStart();
    const mdxContent = `# ${frontmatter.data.title}\n\nPublished on ${formatPublished(new Date(frontmatter.data.published))} by ${authors}\n\n${postContent}`;

    // Convert MDX components of content to plain Markdown
    const pageUrl = `${ORIGIN}/blog/${post.name}/`;
    const mdContent = await convertMdxToMd(
      mdxContent,
      path.dirname(post.path),
      pageUrl
    );

    // Warn about component markup that was not converted
    warnAboutUnknownComponents(mdContent, post.path);

    // Add entry with metadata of post to search index. The excerpt is the
    // intro paragraph that follows the heading and publication meta line.
    const paragraphs = mdContent.split('\n\n');
    searchIndex.push({
      path: 'blog',
      framework: null,
      area: 'blog',
      group: blogGroup.title,
      name: post.name,
      title: (frontmatter.data.title as string | undefined) ?? post.name,
      description: (frontmatter.data.description as string | undefined) ?? '',
      excerpt: paragraphs[2]?.slice(0, 400) ?? '',
      headings: extractHeadings(mdContent),
    });

    // Add agent directive below first heading and write the mirror
    const directive = createDirective('blog', post.name, pageUrl);
    const headingEnd = mdContent.indexOf('\n');
    const pageContent = `${mdContent.slice(0, headingEnd)}\n\n${directive}${mdContent.slice(headingEnd)}`;
    writeMarkdownMirror('blog', post.name, pageContent);

    // Change level of headings two levels down and add content to llms file
    const llmsContent = transformTextSegments(mdContent, (segment) =>
      segment.replaceAll(/^#/gm, '###')
    );
    llmsBlog += `\n${llmsContent}`;
  }
}

// Write blog, main llms.txt and search index files to public directory
fs.writeFileSync(path.join('public', 'llms-blog.txt'), llmsBlog);
fs.writeFileSync(path.join('public', 'llms.txt'), mainLlmsTxt);
fs.writeFileSync(
  path.join('public', 'search-index.json'),
  JSON.stringify(searchIndex)
);
