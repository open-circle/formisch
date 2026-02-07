---
name: repo-prepare-release
description: Prepare releases by analyzing changelogs, determining version bumps, and updating package.json and changelog files.
metadata:
  author: formisch
  version: '1.0'
---

# Prepare Release

## Packages to Check

Scan these for unreleased changes (placeholder: `## vX.X.X (Month DD, YYYY)`):

- `packages/core/CHANGELOG.md` and `packages/methods/CHANGELOG.md`
- `frameworks/{preact,qwik,react,solid,svelte,vue}/CHANGELOG.md`

## Version Bump Rules

| Prefix                          | Bump  | Examples                                |
| ------------------------------- | ----- | --------------------------------------- |
| `Add`, `Change` (API), `Rename` | Minor | New feature, API change, renamed export |
| `Fix`, `Change @formisch/*`     | Patch | Bug fix, dependency update              |

## Release Process

### 1. Process in Order

1. `@formisch/core` → 2. `@formisch/methods` → 3. All frameworks

### 2. For Each Package with Changes

**Update `package.json`:** Bump `"version"` field

**Update `CHANGELOG.md`:**

- Replace `## vX.X.X (Month DD, YYYY)` with actual version and date
- Date format: `Month DD, YYYY` (e.g., `January 31, 2026`)

### 3. Framework Dependency Updates

Core/methods are bundled per framework target (`/react`, `/solid`, etc.):

- **Framework-specific changes** → update only that framework
- **Shared changes** → update all frameworks
- **Bump matches** core/methods (minor→minor, patch→patch)

Add to affected changelogs:

```markdown
- Change `@formisch/core` to vX.X.X
- Change `@formisch/methods` to vX.X.X
```

## Checklist

- [ ] Identify all packages with unreleased changelog entries
- [ ] Determine bump type (patch/minor) for each
- [ ] Add dependency update entries to framework changelogs
- [ ] Update all `package.json` versions
- [ ] Update all changelog version headers and dates
- [ ] Run `pnpm check-versions` to verify consistency
