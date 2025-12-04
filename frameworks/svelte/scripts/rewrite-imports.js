import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Get current directory equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define source and destination paths
const coreDist = path.join(__dirname, '../../../packages/core/dist');
const methodsDist = path.join(__dirname, '../../../packages/methods/dist');
const svelteDist = path.join(__dirname, '../dist');
const coreDestDir = path.join(svelteDist, 'core');
const methodsDestDir = path.join(svelteDist, 'methods');

// Create destination directories
fs.mkdirSync(coreDestDir);
fs.mkdirSync(methodsDestDir);

// Copy @formisch/core to dist
fs.copyFileSync(
  path.join(coreDist, 'index.svelte.js'),
  path.join(coreDestDir, 'index.svelte.js')
);
fs.copyFileSync(
  path.join(coreDist, 'index.svelte.d.ts'),
  path.join(coreDestDir, 'index.svelte.d.ts')
);
console.log('Copied @formisch/core to /dist');

// Copy @formisch/methods to dist
fs.copyFileSync(
  path.join(methodsDist, 'index.svelte.js'),
  path.join(methodsDestDir, 'index.svelte.js')
);
fs.copyFileSync(
  path.join(methodsDist, 'index.svelte.d.ts'),
  path.join(methodsDestDir, 'index.svelte.d.ts')
);
console.log('Copied @formisch/methods to /dist');

// Function to recursively find all .js, .d.ts, and .svelte files

/**
 * Recursively finds all `.js`, `.d.ts`, and `.svelte` files in a directory.
 * @param {string} dir - The directory to search.
 * @returns {string[]} - An array of file paths.
 */
function findFiles(dir) {
  let files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files = files.concat(findFiles(fullPath));
    } else if (
      item.endsWith('.js') ||
      item.endsWith('.d.ts') ||
      item.endsWith('.svelte')
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Formats a file path to ensure it is a relative import path.
 * @param {string} path - The file path to format.
 * @returns {string} - The formatted file path.
 */
function formatImportPath(path) {
  if (!path.startsWith('.')) {
    path = './' + path;
  }
  return path.replace(/(\.js|\.d\.ts)$/, '');
}

/**
 * Updates the import paths of a file.
 * @param {string} filePath - The path to the file to update.
 * @returns {boolean} - Whether the file was updated.
 */
function updateImportPaths(filePath) {
  // Read file content and create variables
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  let updated = false;

  // Calculate relative paths to core and methods directories
  const relativeToCoreJs = path.relative(
    path.dirname(filePath),
    path.join(coreDestDir, 'index.svelte.js')
  );
  const relativeToCoreDts = path.relative(
    path.dirname(filePath),
    path.join(coreDestDir, 'index.svelte.d.ts')
  );
  const relativeToMethodsJs = path.relative(
    path.dirname(filePath),
    path.join(methodsDestDir, 'index.svelte.js')
  );
  const relativeToMethodsDts = path.relative(
    path.dirname(filePath),
    path.join(methodsDestDir, 'index.svelte.d.ts')
  );

  // Remove `.ts` extension from imports
  if (
    filePath.endsWith('.js') ||
    filePath.endsWith('.svelte') ||
    filePath.endsWith('.d.ts')
  ) {
    newContent = newContent.replace(
      /((?:import|export) .* from ['"].*)\.ts(['"])/g,
      '$1$2'
    );
  }

  // Replace @formisch/core/svelte imports
  if (filePath.endsWith('.d.ts')) {
    newContent = newContent.replace(
      /@formisch\/core\/svelte/g,
      formatImportPath(relativeToCoreDts)
    );
  } else {
    newContent = newContent.replace(
      /@formisch\/core\/svelte/g,
      formatImportPath(relativeToCoreJs)
    );
  }

  // Replace @formisch/methods/svelte imports
  if (filePath.endsWith('.d.ts')) {
    newContent = newContent.replace(
      /@formisch\/methods\/svelte/g,
      formatImportPath(relativeToMethodsDts)
    );
  } else {
    newContent = newContent.replace(
      /@formisch\/methods\/svelte/g,
      formatImportPath(relativeToMethodsJs)
    );
  }

  // Overwrite file if content has changed
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    updated = true;
  }

  // Return whether file was updated
  return updated;
}

// Find all files in dist directory and update import paths
let updatedCount = 0;
findFiles(svelteDist).forEach((filePath) => {
  const wasUpdated = updateImportPaths(filePath);
  if (wasUpdated) {
    updatedCount++;
  }
});

console.log(`Import paths updated in ${updatedCount} files`);
