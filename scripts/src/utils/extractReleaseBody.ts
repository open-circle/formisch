/**
 * Extracts a version's release body from changelog content.
 *
 * @param changelogContent The full changelog content.
 * @param version The version whose release body should be extracted.
 *
 * @returns The release body content or null.
 */
export function extractReleaseBody(
  changelogContent: string,
  version: string
): string | null {
  const versionHeadings = [
    ...changelogContent.matchAll(/^## v(\S+)(?:\s.*)?$/gm),
  ];
  const versionHeadingIndex = versionHeadings.findIndex(
    (match) => match[1] === version
  );

  if (versionHeadingIndex === -1) {
    return null;
  }

  const versionHeading = versionHeadings[versionHeadingIndex];
  const nextVersionHeading = versionHeadings[versionHeadingIndex + 1];
  const versionContent = changelogContent
    .slice(
      versionHeading.index! + versionHeading[0].length,
      nextVersionHeading?.index
    )
    .trim();

  return versionContent || null;
}
