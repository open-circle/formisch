---
name: repo-source-code-test
description: Write unit tests for Formisch packages/core with proper TypeScript types. Use when creating new tests, fixing type errors in tests, or adding test coverage for core functions.
metadata:
  author: formisch
  version: '1.0'
---

# Writing Unit Tests

Guide for writing high-quality unit tests in `packages/core/` with proper TypeScript types.

## When to Use This Guide

- Creating new unit tests for core functions
- Fixing type errors in existing tests
- Adding test coverage for new features

## Core Principles

1. **No type casts** — Get types right, don't use `as` assertions
2. **Type guards only when needed** — Use `if` blocks to narrow types only when TypeScript reports an error
3. **Real DOM elements** — Use `document.createElement()`, not mock objects

## Test File Structure

### File Location

Tests live next to their implementation:

```
packages/core/src/
├── form/
│   └── validateFormInput/
│       ├── validateFormInput.ts
│       └── validateFormInput.test.ts
├── field/
│   └── getFieldInput/
│       ├── getFieldInput.ts
│       └── getFieldInput.test.ts
```

### Basic Template

The global setup file (`src/vitest/setup.ts`) automatically calls `mockFramework()` and sets up `beforeEach` with `resetIdCounter()`. Use the shared `createTestStore` helper:

```typescript
import * as v from 'valibot';
import { describe, expect, test } from 'vitest';
import { createTestStore } from '../../vitest/index.ts';

describe('functionName', () => {
  test('should do something', () => {
    const store = createTestStore(v.object({ name: v.string() }));
    // Test logic
  });

  test('should handle initial input', () => {
    const store = createTestStore(v.object({ name: v.string() }), {
      initialInput: { name: 'John' },
    });
    // Test logic
  });
});
```

The `createTestStore` helper accepts a schema and an optional config object:

```typescript
createTestStore(schema, {
  initialInput?: unknown,      // Initial form values
  validate?: ValidationMode,   // 'initial' | 'touch' | 'input' | 'change' | 'blur' | 'submit'
  revalidate?: ValidationMode, // Same options except 'initial'
  issues?: [...],              // Mock validation issues
});
```

### JSDOM Environment

For tests that need DOM APIs (focus, createElement, etc.), add the directive:

```typescript
// @vitest-environment jsdom
import { describe, expect, test } from 'vitest';
```

## Type-Safe Patterns

### Accessing Union Type Properties

`InternalFieldStore` is a union type:

```typescript
type InternalFieldStore =
  | InternalArrayStore // has: kind: 'array', children: InternalFieldStore[]
  | InternalObjectStore // has: kind: 'object', children: Record<string, InternalFieldStore>
  | InternalValueStore; // has: kind: 'value', NO children property
```

**When to use type guards:** Only use `if` blocks for type narrowing when TypeScript reports an error.

**❌ Bad — Type cast:**

```typescript
expect(store.children.items.children[0].input.value).toBe('a');
// Error: Property 'children' does not exist on type 'InternalFieldStore'
// Wrong fix:
expect(
  (store.children.items as InternalArrayStore).children[0].input.value
).toBe('a');
```

**✅ Good — Type guard with assertion:**

```typescript
const itemsStore = store.children.items;
expect(itemsStore.kind).toBe('array');
if (itemsStore.kind === 'array') {
  expect(itemsStore.children[0].input.value).toBe('a');
}
```

The pattern:

1. **Extract to variable** — `const itemsStore = store.children.items;`
2. **Assert the kind** — `expect(itemsStore.kind).toBe('array');` (test fails if wrong)
3. **Narrow with if** — `if (itemsStore.kind === 'array') { ... }` (TypeScript narrows type)

### Required Imports

```typescript
import type {
  InternalArrayStore,
  InternalFormStore,
  InternalObjectStore,
} from '../../types/index.ts';
```

### Complete Example

```typescript
test('should initialize array schema', () => {
  const store = createTestStore(v.object({ items: v.array(v.string()) }), {
    initialInput: { items: ['a', 'b'] },
  });

  const itemsStore = store.children.items;
  expect(itemsStore.kind).toBe('array');
  if (itemsStore.kind === 'array') {
    expect(itemsStore.children).toHaveLength(2);
    expect(itemsStore.children[0].input.value).toBe('a');
    expect(itemsStore.children[1].input.value).toBe('b');
  }
});
```

## DOM Element Mocking

### ❌ Bad — Mock object with cast:

```typescript
const mockFocus = vi.fn();
store.children.name.elements = [{ focus: mockFocus } as HTMLElement];
// Error: Type '{ focus: Mock }' is not assignable to type 'FieldElement'
```

### ✅ Good — Real DOM element with spy:

```typescript
const inputElement = document.createElement('input');
const mockFocus = vi.spyOn(inputElement, 'focus');
store.children.name.elements = [inputElement];

await validateFormInput(store, { shouldFocus: true });

expect(mockFocus).toHaveBeenCalledOnce();
```

**Note:** Requires `// @vitest-environment jsdom` at file top.

## Valibot Issue Helpers

When testing validation, create properly typed issue helpers:

```typescript
function objectPath(key: string, value: unknown = ''): v.ObjectPathItem {
  return { type: 'object', origin: 'value', input: {}, key, value };
}

function arrayPath(key: number, value: unknown = ''): v.ArrayPathItem {
  return { type: 'array', origin: 'value', input: [], key, value };
}

function validationIssue(
  message: string,
  path?: [v.IssuePathItem, ...v.IssuePathItem[]]
): v.BaseIssue<unknown> {
  return {
    kind: 'validation',
    type: 'check',
    input: '',
    expected: null,
    received: 'unknown',
    message,
    path,
  };
}
```

**Note:** The `path` type is `[v.IssuePathItem, ...v.IssuePathItem[]]` (tuple with at least one item).

## Common Type Errors and Fixes

### Error: Property 'children' does not exist

```
Property 'children' does not exist on type 'InternalFieldStore'.
```

**Fix:** Use type guard pattern (see above).

### Error: Type is not assignable to 'FieldElement'

```
Type '{ focus: Mock }' is not assignable to type 'FieldElement'.
```

**Fix:** Use real DOM elements with `document.createElement()`.

### Error: Type not assignable with exactOptionalPropertyTypes

```
Type 'IssuePathItem[]' is not assignable to type '[IssuePathItem, ...IssuePathItem[]]'.
```

**Fix:** Use tuple type `[v.IssuePathItem, ...v.IssuePathItem[]]` for path arrays.

## Test Organization

### Describe Blocks

Group tests by functionality:

```typescript
describe('functionName', () => {
  describe('basic behavior', () => {
    test('should handle simple case', () => {});
  });

  describe('error handling', () => {
    test('should return errors for invalid input', () => {});
  });

  describe('nested fields', () => {
    test('should handle nested objects', () => {});
  });
});
```

### Test Naming

- Start with "should"
- Describe the expected behavior
- Be specific about the scenario

```typescript
// ✅ Good
test('should focus first error field when shouldFocus is true', () => {});

// ❌ Bad
test('focus test', () => {});
```

## Running Tests

```bash
# Run all tests
pnpm -C packages/core test

# Run tests in watch mode
pnpm -C packages/core test --watch

# Run specific test file
pnpm -C packages/core test validateFormInput

# Run with coverage
pnpm -C packages/core test --coverage
```

## Checklist

Before committing tests:

- [ ] No type casts (`as SomeType`) — use type guards instead
- [ ] All imports use `.ts` extension
- [ ] Type imports use `import type { ... }`
- [ ] DOM tests have `// @vitest-environment jsdom` directive
- [ ] DOM elements created with `document.createElement()`
- [ ] Union types narrowed with `expect(...).toBe(...)` + `if` guards
- [ ] All tests pass: `pnpm test`
- [ ] No lint errors: `pnpm lint`

## Quick Reference

### Type Guard Pattern

```typescript
const fieldStore = store.children.fieldName;
expect(fieldStore.kind).toBe('array');
if (fieldStore.kind === 'array') {
  expect(fieldStore.children).toHaveLength(2);
}
```

### DOM Element Pattern

```typescript
const input = document.createElement('input');
const spy = vi.spyOn(input, 'focus');
store.children.name.elements = [input];
```

### Issue Helper Pattern

```typescript
validationIssue('Error message', [objectPath('field'), arrayPath(0)]);
```
