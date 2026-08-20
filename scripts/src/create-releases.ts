import { execSync } from 'child_process';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import {
  createGitHubRelease,
  extractReleaseBody,
  getFolderNames,
  getProjectRoot,
  hasGitHubRelease,
  readPackageJson,
} from './utils';

// Load environment variables
dotenv.config({ path: '.env.local', override: true });

// Get the root directory
const ROOT_DIR = getProjectRoot();

// Rate limiting delay between API calls (ms)
const API_DELAY_MS = 1000;

// Create core package path
const CORE_PACKAGE_PATH = path.join(
  ROOT_DIR,
  'packages',
  'core',
  'package.json'
);

// Create methods package path
const METHODS_PACKAGE_PATH = path.join(
  ROOT_DIR,
  'packages',
  'methods',
  'package.json'
);

// Create frameworks directory path
const FRAMEWORKS_DIR = path.join(ROOT_DIR, 'frameworks');

/**
 * Generates release body for a framework package by reading its changelog.
 *
 * @param frameworkName The name of the framework.
 * @param frameworkVersion The version of the framework.
 *
 * @returns The release body content or null.
 */
function generateReleaseBody(
  frameworkName: string,
  frameworkVersion: string
): string | null {
  try {
    // Create changelog path
    const changelogPath = path.join(
      FRAMEWORKS_DIR,
      frameworkName,
      'CHANGELOG.md'
    );

    // Check if changelog exists
    if (!fs.existsSync(changelogPath)) {
      console.log(`⚠️  Skipping ${frameworkName}: CHANGELOG.md not found`);
      return null;
    }

    // Read changelog content
    const changelogContent = fs.readFileSync(changelogPath, 'utf-8');

    // Extract version content from changelog
    const versionContent = extractReleaseBody(
      changelogContent,
      frameworkVersion
    );

    // If no version content found, return null
    if (versionContent === null) {
      console.log(
        `⚠️  Skipping ${frameworkName}: Version ${frameworkVersion} not found or empty in changelog`
      );
      return null;
    }

    // Return extracted version content
    return versionContent;

    // Handle unexpected errors
  } catch (error) {
    console.warn(
      `⚠️  Skipping ${frameworkName}: Could not read changelog: ${error}`
    );
    return null;
  }
}

/**
 * Creates framework releases.
 */
async function createReleases() {
  console.log('🚀 Starting framework release creation...\n');

  // Check if all local commits are pushed
  const unpushed = execSync('git log --oneline origin/main..HEAD', {
    cwd: ROOT_DIR,
    encoding: 'utf-8',
  });
  if (unpushed.trim()) {
    console.log(
      '⚠️  There are local commits that are not pushed to GitHub.\n   Please push all commits before creating releases.\n'
    );
    return;
  }

  // Read package versions
  const corePackage = readPackageJson(CORE_PACKAGE_PATH);
  const methodsPackage = readPackageJson(METHODS_PACKAGE_PATH);

  // If core or methods package cannot be read, throw error
  if (!corePackage || !methodsPackage) {
    throw new Error('Could not read core or methods package.json files');
  }

  console.log(`📦 Core version: ${corePackage.version}`);
  console.log(`📦 Methods version: ${methodsPackage.version}\n`);

  // Discover framework packages
  const frameworks = getFolderNames(FRAMEWORKS_DIR);
  console.log(
    `🔍 Found ${frameworks.length} framework(s): ${frameworks.join(', ')}\n`
  );

  let createdCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  // Process each framework release sequentially
  for (const framework of frameworks) {
    // Create framework package path
    const frameworkPackagePath = path.join(
      FRAMEWORKS_DIR,
      framework,
      'package.json'
    );

    // If package.json does not exist, skip release
    if (!fs.existsSync(frameworkPackagePath)) {
      console.log(`⚠️  Skipping ${framework}: package.json not found`);
      skippedCount++;
      continue;
    }

    // Read framework package.json
    const frameworkPackage = readPackageJson(frameworkPackagePath);

    // If framework package.json cannot be read, skip release
    if (!frameworkPackage) {
      console.log(`⚠️  Skipping ${framework}: Could not read package.json`);
      skippedCount++;
      continue;
    }

    // Construct tag name for release
    const tagName = `v${frameworkPackage.version}-${framework}`;

    // If release already exists, skip release
    const exists = await hasGitHubRelease(tagName);
    if (exists) {
      console.log(`⏭️  Skipping ${tagName}: Release already exists`);
      skippedCount++;
      continue;
    }

    // Extract release notes from changelog
    const releaseBody = generateReleaseBody(
      framework,
      frameworkPackage.version
    );

    // If release notes could not be extracted, skip release
    if (!releaseBody) {
      console.log(
        `⏭️  Skipping ${tagName}: Could not extract release notes from changelog`
      );
      skippedCount++;
      continue;
    }

    // Finally, create GitHub release
    const success = await createGitHubRelease({
      packageName: frameworkPackage.name,
      version: frameworkPackage.version,
      tagName,
      releaseName: `v${frameworkPackage.version} (@formisch/${framework})`,
      body: releaseBody,
    });

    // Track results of release creation
    if (success) {
      createdCount++;
    } else {
      failedCount++;
    }

    // Wait to respect API rate limits
    await new Promise((resolve) => setTimeout(resolve, API_DELAY_MS));
  }

  // Display final results
  console.log('\n📊 Summary:');
  console.log(`   ✅ Created: ${createdCount}`);
  console.log(`   ⏭️  Skipped: ${skippedCount}`);
  console.log(`   ❌ Failed: ${failedCount}`);
  console.log('\n✨ Done!');
}

// Run release creation script
createReleases();
