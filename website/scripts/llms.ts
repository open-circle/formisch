import graymatter from 'gray-matter';
import fs from 'node:fs';
import path from 'node:path';

// Define available frameworks
const frameworks = [
  'preact',
  'qwik',
  'react',
  'solid',
  'svelte',
  'vue',
] as const;
type Framework = (typeof frameworks)[number];

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
      // Replace relative paths with URLs to MD files
      .replaceAll(
        /\(\/([\w-]+)\/([\w-]+)\/([\w-]+)\/\)/gm,
        '(https://formisch.dev/$1/$2/$3.md)'
      )
  );
}

// Mapping of framework identifiers to display names
const FRAMEWORK_NAME_MAP: Record<Framework, string> = {
  preact: 'Preact',
  qwik: 'Qwik',
  react: 'React',
  solid: 'SolidJS',
  svelte: 'Svelte',
  vue: 'Vue',
};

/**
 * Gets the display name for a framework.
 *
 * @param framework The framework identifier.
 *
 * @returns The display name.
 */
function getFrameworkName(framework: Framework): string {
  return FRAMEWORK_NAME_MAP[framework];
}

/**
 * Extracts grouped file paths from a markdown menu.
 *
 * @param markdown The markdown menu string.
 *
 * @returns A grouped array of file paths.
 */
function extractFilePathsOfMenu(
  markdown: string
): { title: string; files: { name: string; path: string }[] }[] {
  // Split menu into groups based on level 2 headings
  const groups = markdown.split(/^## /gm).slice(1);

  // Convert groups into an array of MDX file paths
  return groups.map((group) => {
    // Extract title and create slug
    const groupTitle = group.match(/(^.+)\n/)![1];
    const groupSlug = groupTitle.toLowerCase().replace(/\s+/g, '-');

    // Create object to hold title and file data
    const groupData: {
      title: string;
      files: { name: string; path: string }[];
    } = { title: groupTitle, files: [] };

    // Extract file paths from group using regex
    const filePaths = group.matchAll(/\(\/([\w-]+)\/([\w-]+)\/([\w-]+)\/\)/gm);

    // Add data of each file path to group data
    for (const regexMatch of filePaths) {
      const area = regexMatch[1]; // framework, methods, or core
      const type = regexMatch[2]; // guides or api
      const fileName = regexMatch[3];

      // All routes follow the same pattern: src/routes/(docs)/{area}/{type}/({group})/{name}/index.mdx
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
      });
    }

    // Return final group data
    return groupData;
  });
}

// Create llms.txt intro text
const introText =
  '# Formisch\n\nThe lightweight, schema-first, and fully type-safe form library for React, Solid, Vue, Svelte and more.\n';

// Define output directories for shared content
const publicCoreDir = path.join('public', 'core', 'api');
const publicMethodsDir = path.join('public', 'methods', 'api');

// Ensure shared directories exist
if (!fs.existsSync(publicCoreDir)) {
  fs.mkdirSync(publicCoreDir, { recursive: true });
}
if (!fs.existsSync(publicMethodsDir)) {
  fs.mkdirSync(publicMethodsDir, { recursive: true });
}

// Build main llms.txt with table of contents for all frameworks
let mainLlmsTxt = introText;

// Process each framework
for (const framework of frameworks) {
  // Read menu.md files for this framework
  const menuOfGuides = fs.readFileSync(
    path.join('src', 'routes', '(docs)', framework, 'guides', 'menu.md'),
    'utf-8'
  );
  const menuOfApi = fs.readFileSync(
    path.join('src', 'routes', '(docs)', framework, 'api', 'menu.md'),
    'utf-8'
  );

  // Create framework-specific llms.txt with table of contents
  const frameworkLlmsTxt = `${introText}\n## ${getFrameworkName(framework)}\n\n${convertMenuToLlms(menuOfGuides)}\n${convertMenuToLlms(menuOfApi)}`;

  // Write framework-specific table of contents file
  fs.writeFileSync(
    path.join('public', `llms-${framework}.txt`),
    frameworkLlmsTxt
  );

  // Add to main llms.txt
  mainLlmsTxt += `\n## ${getFrameworkName(framework)}\n\n${convertMenuToLlms(menuOfGuides)}\n${convertMenuToLlms(menuOfApi)}`;

  // Create object to hold content for specific llms files
  const llms: Record<'full' | 'guides' | 'api', string> = {
    full: introText,
    guides: introText,
    api: introText,
  };

  // Define content areas with all necessary data
  const contentAreas = [
    {
      id: 'guides' as const,
      name: 'guides',
      publicDir: path.join('public', framework, 'guides'),
      groups: extractFilePathsOfMenu(menuOfGuides),
    },
    {
      id: 'api' as const,
      name: 'API',
      publicDir: path.join('public', framework, 'api'),
      groups: extractFilePathsOfMenu(menuOfApi),
    },
  ];

  // Copy content of MDX files to public dir and add it to llms files
  for (const contentArea of contentAreas) {
    // Ensure directory of content area exists
    if (!fs.existsSync(contentArea.publicDir)) {
      fs.mkdirSync(contentArea.publicDir, { recursive: true });
    }

    // Add group title to llms files and process its files
    for (const areaGroup of contentArea.groups) {
      // Create level 2 heading for group
      const heading = `## ${areaGroup.title}`;

      // Add heading to specific llms files
      llms.full += `\n${heading} (${contentArea.name})\n`;
      llms[contentArea.id] += `\n${heading}\n`;

      // Copy content of MDX files to public dir and add content to llms files
      for (const mdxFile of areaGroup.files) {
        // Read MDX file and extract frontmatter
        const frontmatter = graymatter.read(mdxFile.path);

        // Remove MDX import statements from MDX content
        const mdxContent = frontmatter.content.slice(
          frontmatter.content.indexOf('# ') // Index of first heading
        );

        // Determine output path based on whether file is from methods/core or framework-specific
        let outputPath: string;
        if (mdxFile.path.includes(path.join('(docs)', 'core', 'api'))) {
          // For core types, use the core directory
          outputPath = path.join(publicCoreDir, `${mdxFile.name}.md`);
        } else if (
          mdxFile.path.includes(path.join('(docs)', 'methods', 'api'))
        ) {
          // For methods, use the methods directory
          outputPath = path.join(publicMethodsDir, `${mdxFile.name}.md`);
        } else {
          // For framework-specific files, use the content area's public directory
          outputPath = path.join(contentArea.publicDir, `${mdxFile.name}.md`);
        }

        // Copy MDX content into public directory
        fs.writeFileSync(outputPath, mdxContent);

        // Change level of headings two levels down
        const llmsContent = mdxContent.replaceAll(/^#/gm, '###');

        // Add content to specific llms files
        llms.full += `\n${llmsContent}`;
        llms[contentArea.id] += `\n${llmsContent}`;
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

// Write main llms.txt file to public directory
fs.writeFileSync(path.join('public', 'llms.txt'), mainLlmsTxt);
