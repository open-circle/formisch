---
name: repo-source-code-document
description: Document Formisch source code with JSDoc and inline comments. Use when writing or updating documentation comments in packages/core, packages/methods, or frameworks/* source files.
metadata:
  author: formisch
  version: '1.0'
---

# Source Code Documentation

A concise guide for documenting Formisch source code with JSDoc and inline comments.

## Core Principles

1. **Clarity over verbosity** - Be precise and concise
2. **Consistency is critical** - Same APIs use identical documentation across all frameworks
3. **User-focused** - Documentation enhances TypeScript IntelliSense
4. **Group related code** - Comment logical blocks, not every line

## JSDoc Patterns

### Interfaces and Types

**First line format:**

- `[Name] [category] interface.` → "Form store interface."
- `[Name] [category] type.` → "Validation mode type."

**Special cases:**

- Config: "Use field config interface."
- Store: "Form store interface."
- Props: "Field element props interface."

```typescript
/**
 * Form store interface.
 */
export interface FormStore<TSchema extends Schema> {
  /**
   * Whether the form is currently submitting.
   */
  readonly isSubmitting: ReadonlySignal<boolean>;
  /**
   * The current error messages of the form.
   */
  readonly errors: ReadonlySignal<[string, ...string[]] | null>;
}
```

**Property patterns:**

- Boolean state: `Whether the [subject] [condition].`
- Data properties: `The current [description].`
- Path properties: `The path to the [description] within the form.`
- Element props: `The [description] of the field element.`

### Functions

**Overload signatures only** (no JSDoc on implementation):

```typescript
/**
 * Creates a reactive field store of a specific field within a form store.
 *
 * @param form The form store instance.
 * @param config The field configuration.
 *
 * @returns The field store with reactive properties and element props.
 */
export function useField<TSchema, TFieldPath>(
  form: FormStore<TSchema>,
  config: UseFieldConfig<TSchema, TFieldPath>
): FieldStore<TSchema, TFieldPath>;

// @__NO_SIDE_EFFECTS__
export function useField(form: FormStore, config: UseFieldConfig): FieldStore {
  // Implementation (no JSDoc)
}
```

**Rules:**

- First line: Action-focused description (present tense, third person)
- Start with verbs: "Creates", "Initializes", "Resets", "Validates"
- `@param`: `The [description].` (start with "The", end with period)
- `@returns`: `The [description].` (describe what is returned)
- Add `// @__NO_SIDE_EFFECTS__` for pure functions only

### Constants

```typescript
/**
 * Internal symbol constant.
 */
export const INTERNAL = '~internal' as const;
```

### Barrel Files

No JSDoc and inline comments needed - keep clean.

## Inline Comments

### Style Rules

- **No articles** ("the", "a", "an") except in Hints
- **No periods** at end except in Hints and TODOs
- Use present tense verbs
- Blank line before comment, none after

### Section Headers

Mark major logic blocks:

```typescript
// Get input value from field store
const input = getFieldInput(internalFieldStore);

// If validation is required, perform validation
if (shouldValidate) {
  // implementation
}
```

### Conditionals

```typescript
// If field is touched, validate
if (isTouched) {
  validate();
}

// Otherwise, if validation mode is initial, validate
else if (validate === 'initial') {
  performValidation();
}

// Otherwise, skip validation
else {
  return;
}
```

### Operations

Group related operations under one comment:

```typescript
// Set validation configuration
store.validators = 0;
store.validate = config.validate ?? 'submit';
store.revalidate = config.revalidate ?? 'input';
```

### Hints

Explain WHY, not WHAT. Can use articles and periods:

```typescript
// Hint: The object is deliberately not constructed with spread operator
// for performance reasons
const obj = { prop: value };
```

In JSDoc:

```typescript
/**
 * The initial input of the field.
 *
 * Hint: The initial input is used for resetting and may only be changed
 * during this process. It does not move when a field is moved.
 */
initialInput: Signal<unknown>;
```

## Cross-Framework Consistency

**Same properties/functions across frameworks must use identical documentation text.**

Check documentation in other frameworks before adding or modifying.

## What to Document

### ✅ Document

- Public interfaces and types
- Exported function overloads
- Exported constants
- Interface properties
- Section headers for major logic blocks
- Each branch in long if-else chains
- Non-obvious logic (with Hints)

### ❌ Don't Document

- Function implementations
- Barrel/index files
- Standard loop variables (`index`, `key`, `item`)
- Every single line
- Obvious operations
- `@ts-expect-error` when context is clear

## Quick Reference

### JSDoc First Lines

- Interface: `[Name] [category] interface.`
- Type: `[Name] [category] type.`
- Function: Descriptive action sentence
- Constant: Brief description

### JSDoc Tags

```
@param name The [description].
@returns The [description].
@internal (for internal APIs only)
```

### Inline Patterns

```
// Get [what]
// Set [what] to [value]
// If [condition], [action]
// Otherwise, [action]
// Hint: [explanation with articles and period]
// TODO: [task]
```
