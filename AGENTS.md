# Copilot Instructions

Formisch is a schema-based, headless form library with a framework-agnostic core supporting multiple frameworks (Preact, Qwik, React, Solid, Svelte, Vue).

## Planning Mode

When in planning mode and something is unclear, ask questions **one at a time** (like a quiz). Wait for each answer before asking the next question. Only after all questions are answered and you have no remaining uncertainties, present the final plan.

## Monorepo Layout

| Directory           | Purpose                                             |
| ------------------- | --------------------------------------------------- |
| `packages/core/`    | Framework-agnostic form logic                       |
| `packages/methods/` | Form manipulation methods (focus, reset, validate…) |
| `frameworks/`       | Framework-specific wrappers (solid, qwik, react…)   |
| `playgrounds/`      | Testing environments per framework                  |
| `website/`          | formisch.dev (Qwik + Vite)                          |

## Essential Commands

```bash
pnpm install                    # Install dependencies
pnpm -C packages/core test      # Run core tests
pnpm -C packages/core lint      # ESLint + tsc
pnpm -C packages/core build     # Build core package
pnpm -C website dev             # Start docs site
```

## Code Conventions

- **ESM with `.ts` extensions** in imports (enforced by ESLint)
- **`interface` over `type`** for object shapes
- **JSDoc required** on exported functions (first overload only for overload sets)
- **`// @__NO_SIDE_EFFECTS__`** before pure factory functions for tree-shaking

## Library Architecture

Framework-agnostic core with framework-specific reactivity injected at build time:

```
packages/core/src/
├── array/     → Array field utilities
├── field/     → Field management
├── form/      → Form state management
├── framework/ → Framework reactivity (injected at build)
├── types/     → TypeScript definitions
└── values.ts  → Value utilities

packages/methods/src/
├── focus/     → Focus management
├── validate/  → Validation triggers
├── reset/     → Form/field reset
└── ...        → Other form methods

frameworks/{framework}/src/
├── primitives/ → createForm, useField, useFieldArray
├── components/ → Form, Field, FieldArray
└── types/      → Framework-specific types
```

Each method has its own folder: `name.ts`, `index.ts`.

## Changelog Format

- Use `## vX.X.X (Month DD, YYYY)` for version headings
- For unreleased changes use the literal `## vX.X.X (Month DD, YYYY)` as a placeholder

## Agent Skills

This repository includes agent skills in `/skills/` following the [Agent Skills](https://agentskills.io) open standard.

**Naming:** Skills prefixed with `repo-` are local repository skills
