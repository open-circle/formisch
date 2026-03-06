---
name: repo-structure-navigate
description: Navigate the Formisch monorepo structure. Use when finding code locations, understanding architecture, locating source files, or implementing features across packages and frameworks.
metadata:
  author: formisch
  version: '1.0'
---

# Repository Navigation

Quick reference for understanding and navigating the Formisch repository structure.

## Overview

**Formisch** is a schema-based, headless form library with a framework-agnostic core supporting multiple frameworks (Preact, Qwik, React, Solid, Svelte, Vue). Framework-specific reactivity is injected at build time for native performance.

**Architecture:**

- Monorepo with pnpm workspaces
- Framework-agnostic core + framework-specific wrappers
- TypeScript throughout with Valibot schemas

## Directory Structure

```
formisch/
├── packages/         # Core packages
│   ├── core/         # Framework-agnostic form logic
│   └── methods/      # Form manipulation methods
├── frameworks/       # Framework-specific wrappers (preact, qwik, react, solid, svelte, vue)
├── playgrounds/      # Testing environments per framework
├── scripts/          # Automation scripts
├── website/          # Documentation site
├── skills/           # Agent skills (this folder)
└── prompts/          # Legacy AI agent guides (deprecated)
```

## Core Packages

### `/packages/core/` → `@formisch/core`

Framework-agnostic form logic. Builds to framework-specific outputs via `tsdown.config.ts`.

**Key directories:**

- `src/array/` - Array field utilities
- `src/field/` - Field management
- `src/form/` - Form state management
- `src/framework/` - Framework reactivity integration (injected at build time)
- `src/types/` - TypeScript types

### `/packages/methods/` → `@formisch/methods`

Form manipulation utilities. Each method in its own directory (`src/{method-name}/`).

**Available methods:** focus, getAllErrors, getErrors, getInput, handleSubmit, insert, move, remove, replace, reset, setErrors, setInput, submit, swap, validate

## Framework Packages

### `/frameworks/{framework}/` → `@formisch/{framework}`

Thin wrappers that:

1. Export framework-specific core build
2. Provide framework-native components/primitives
3. Re-export methods

**Structure:**

```
frameworks/{framework}/
├── src/
│   ├── components/    # Form, Field components
│   ├── primitives/    # createForm/useForm, useField, useFieldArray
│   ├── types/         # Framework-specific types
│   └── index.tsx      # Main export
```

## Playgrounds

### `/playgrounds/{framework}/`

Minimal apps for testing. Use workspace dependencies (`workspace:*`). Run with `pnpm dev`.

## Website

### `/website/`

Documentation site built with Qwik. Update when APIs change.

## Quick Reference

### Finding Code

| Looking for...                | Location                                  |
| ----------------------------- | ----------------------------------------- |
| Form state logic              | `/packages/core/src/form/`                |
| Field management              | `/packages/core/src/field/`               |
| Array utilities               | `/packages/core/src/array/`               |
| Methods (submit, reset, etc.) | `/packages/methods/src/{method-name}/`    |
| Framework components          | `/frameworks/{framework}/src/components/` |
| Framework primitives          | `/frameworks/{framework}/src/primitives/` |
| Type definitions              | `/packages/core/src/types/`               |
| Usage examples                | `/playgrounds/{framework}/src/`           |
| Documentation                 | `/website/src/routes/`                    |

### Commands

```bash
pnpm install  # Install dependencies
pnpm build    # Build a package
pnpm test     # Run tests
pnpm lint     # Lint and type check
```

## Common Workflows

### Adding a Core Feature

1. Implement in `/packages/core/src/`
2. Add framework-specific code in `/packages/core/src/framework/`
3. Update exports in index files
4. Test in playgrounds
5. Update docs in `/website/`

### Adding a Method

1. Create `/packages/methods/src/{method-name}/`
2. Export from `/packages/methods/src/index.ts`
3. Test in playground and document on website

### Adding Framework Support

1. Create `/packages/core/src/framework/{framework}.ts`
2. Configure build in `tsdown.config.ts`
3. Create `/frameworks/{framework}/` package
4. Create playground in `/playgrounds/{framework}/`

## Important Rules

### Code Style

- TypeScript throughout
- Use Prettier and ESLint
- Add JSDoc for public APIs
- camelCase for functions/variables, PascalCase for components/types

### Imports

- Relative imports within packages
- Package imports across packages
- Prefer named exports

### Testing

- Tests next to implementation (`.test.ts`)
- Use Vitest
- Run: `pnpm test`

## Architecture

**Framework-agnostic core** - Written once, compiled to framework-specific versions via `tsdown.config.ts`. Framework reactivity is injected at build time from `/packages/core/src/framework/{framework}.ts`. This ensures:

- Native performance per framework
- Consistent behavior across frameworks
- Minimal bundle size

## Best Practices

- Code differs between frameworks - always check the target framework
- Check playgrounds for real-world usage examples
- TypeScript types are the source of truth
- Follow existing patterns in the codebase
- Test incrementally (build → test → playground)
- Update website docs when changing APIs
- Use `workspace:*` dependencies in playgrounds
