---
name: repo-source-code-review
description: Review PRs and source code changes in Formisch packages/ and frameworks/. Use when reviewing pull requests, validating implementation patterns, or checking code quality before merging.
metadata:
  author: formisch
  version: '1.0'
---

# Reviewing Source Code Changes

Guide for reviewing PRs and source code changes in `packages/` and `frameworks/`.

## When to Use This Guide

- Reviewing pull requests modifying library source
- Validating implementation patterns before merging
- Checking code quality, types, documentation, and tests

## Review Process

1. **Understand the change** — Read PR description, identify affected files
2. **Check patterns** — Verify code follows existing conventions
3. **Verify types** — Ensure type safety and proper inference
4. **Review docs** — Confirm JSDoc is complete and accurate
5. **Check tests** — Validate runtime and type test coverage

## What to Review

### Code Quality

| Check             | Requirement                                                           |
| ----------------- | --------------------------------------------------------------------- |
| Naming            | Matches existing patterns (`FormStore`, `useField`, `createForm`)     |
| Purity annotation | `// @__NO_SIDE_EFFECTS__` before pure factory functions               |
| Import extensions | All imports use `.ts` extension                                       |
| Interface vs type | Use `interface` for object shapes, `type` for unions/aliases          |
| Folder structure  | Methods: `name.ts`, `index.ts`. Primitives/components in their folder |

**Good — purity annotation:**

```typescript
// @__NO_SIDE_EFFECTS__
export function useField<TSchema, TFieldPath>(
  form: FormStore<TSchema>,
  config: UseFieldConfig<TSchema, TFieldPath>
): FieldStore<TSchema, TFieldPath> {
  return {
    /* ... */
  };
}
```

**Bad — missing annotation:**

```typescript
export function useField<TSchema, TFieldPath>(
  form: FormStore<TSchema>,
  config: UseFieldConfig<TSchema, TFieldPath>
): FieldStore<TSchema, TFieldPath> {
  return {
    /* ... */
  };
}
```

### Type Safety

| Check             | Requirement                                           |
| ----------------- | ----------------------------------------------------- |
| Generic inference | Types infer correctly without explicit annotations    |
| Constraints       | Generic parameters have appropriate `extends` clauses |
| Return types      | Explicit return types on exported functions           |
| Type tests        | `.test-d.ts` file covers type inference scenarios     |

**Good — constrained generic:**

```typescript
export function useField<
  TSchema extends Schema,
  TFieldPath extends RequiredPath<TSchema>,
>(
  form: FormStore<TSchema>,
  config: UseFieldConfig<TSchema, TFieldPath>
): FieldStore<TSchema, TFieldPath>;
```

### Documentation

| Check          | Requirement                                       |
| -------------- | ------------------------------------------------- |
| JSDoc present  | All exported functions have JSDoc                 |
| First line     | Action verb matching function purpose (see below) |
| `@param` tags  | Every parameter documented                        |
| `@returns` tag | Return value documented                           |
| Overloads      | Every overload has its own complete JSDoc block   |

**First line patterns by category:**

| Category   | Pattern                                      |
| ---------- | -------------------------------------------- |
| Primitives | `Creates a ...`                              |
| Methods    | `Focuses ...`, `Resets ...`, `Validates ...` |
| Components | `Renders a ...`                              |
| Utilities  | `Returns ...`, `Gets ...`, `Sets ...`        |

### Tests

| Check          | Requirement                                                |
| -------------- | ---------------------------------------------------------- |
| Runtime tests  | `.test.ts` covers success cases, failure cases, edge cases |
| Type tests     | `.test-d.ts` validates type inference with `expectTypeOf`  |
| Error handling | Tests verify correct error messages and validation         |

## Common Issues

| Issue                     | What to Look For                                               |
| ------------------------- | -------------------------------------------------------------- |
| Missing purity annotation | Factory function without `// @__NO_SIDE_EFFECTS__`             |
| Incomplete JSDoc          | Missing `@param` or `@returns`, wrong description format       |
| No type tests             | New API without `.test-d.ts` file                              |
| Wrong import extension    | Imports without `.ts` suffix                                   |
| Inconsistent naming       | Primitives not using `create`/`use` prefix, wrong Store suffix |
| Side effects in pure code | Mutations, I/O, or global state in primitive/method creation   |

## Checklist

- [ ] Implementation follows existing patterns in similar files
- [ ] `// @__NO_SIDE_EFFECTS__` on pure factory functions
- [ ] All imports use `.ts` extension
- [ ] `interface` used for object shapes
- [ ] JSDoc complete on all exports
- [ ] Runtime tests in `.test.ts`
- [ ] Type tests in `.test-d.ts`
- [ ] Naming conventions followed
- [ ] Cross-framework consistency for shared APIs

## Related Skills

- `repo-structure-navigate` — Navigate the codebase
- `repo-source-code-document` — JSDoc requirements
