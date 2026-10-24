import fs from 'node:fs';

/**
 * Package JSON type.
 */
export type PackageJson = {
  name: string;
  version: string;
  description?: string;
  private?: boolean;
};

/**
 * Reads and parses a package.json file.
 *
 * @param filePath The path to the package.json file.
 *
 * @returns Parsed package.json object or null.
 */
export function readPackageJson(filePath: string): PackageJson | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}
