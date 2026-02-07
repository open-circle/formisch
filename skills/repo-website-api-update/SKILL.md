---
name: repo-website-api-update
description: Update existing API documentation when Formisch source code changes. Use when function signatures, types, interfaces, or JSDoc comments change in the library source.
metadata:
  author: formisch
  version: '1.0'
---

# Updating API Documentation

API documentation must stay synchronized with source code. When functions, types, or interfaces change in the Formisch packages, update the corresponding documentation.

**Key Principle**: Source code is the single source of truth. Documentation must never deviate from what's actually implemented.

## When to Update

Update documentation when:

- **Function signatures change** - New/removed parameters, type changes, generic constraints
- **Interfaces change** - New/modified/removed properties
- **JSDoc comments change** - Descriptions, param docs, hints
- **Behavior changes** - Validation logic, error messages, defaults
- **Deprecations or renames** - Functions deprecated or renamed

**Do NOT update when**:

- Only internal implementation changes
- Private/internal functions change
- Test files change
- Non-JSDoc comments change

## Update Process

### Step 1: Understand the Changes

Compare source code changes:

```bash
git diff HEAD~1 packages/core/src/path/to/file.ts
```

Categorize changes:

- **Breaking changes**: Signature changes, removed parameters
- **Additions**: New parameters, overloads, properties
- **Documentation changes**: JSDoc updates
- **Behavioral changes**: Logic affecting usage

### Step 2: Find Affected Documentation

Locate files to update:

```
/website/src/routes/(docs)/{framework}/api/{category}/{ApiName}/
├── index.mdx
└── properties.ts
```

### Step 3: Update properties.ts

Ensure types match new source code:

```typescript
// If generic constraint changed from:
TInput
// To:
TInput extends string | number

// Update properties.ts:
TInput: {
  modifier: 'extends',
  type: {
    type: 'union',
    options: ['string', 'number'],
  },
},
```

### Step 4: Update index.mdx

1. **Front matter**: Update `source` path if file moved
2. **Function signature**: Match new signature exactly
3. **Generics section**: Add/remove/update generics
4. **Parameters section**: Add/remove/update parameters
5. **Explanation**: Update if behavior changed
6. **Examples**: Update to use new API correctly
7. **Related section**: Update cross-references

### Step 5: Update Related Files

- **Type documentation**: If interfaces changed
- **menu.md**: If function renamed/moved
- **Guide files**: If usage patterns changed

## Common Change Scenarios

### Adding a Parameter

**Source change**:

```typescript
// Before
export function validate(form: FormStore): void;

// After (added config)
export function validate(form: FormStore, config?: ValidateConfig): void;
```

**properties.ts update**:

```typescript
// Add new parameter
config: {
  type: {
    type: 'union',
    options: [
      { type: 'custom', name: 'ValidateConfig', href: '../ValidateConfig/' },
      'undefined',
    ],
  },
},
```

**index.mdx update**:

- Update function signature
- Add to Parameters section
- Update Explanation to mention new parameter
- Add examples using new parameter

### Removing a Parameter (Breaking)

1. Remove from properties.ts
2. Update function signature in index.mdx
3. Remove from Parameters section
4. Update all examples
5. Consider adding migration note

### Changing Types

**Source change**:

```typescript
// Before
TRequirement extends number

// After
TRequirement extends number | string
```

**properties.ts update**:

```typescript
TRequirement: {
  modifier: 'extends',
  type: {
    type: 'union',
    options: ['number', 'string'],
  },
},
```

### Adding Interface Properties

Update type documentation:

```typescript
// In properties.ts, add new property
received: {
  type: 'string',
},
```

Update index.mdx Definition section:

```mdx
- `StringIssue` <Property {...properties.BaseIssue} />
  - `kind` <Property {...properties.kind} />
  - `type` <Property {...properties.type} />
  - `received` <Property {...properties.received} /> <!-- Added -->
```

### Function Renamed

1. Rename folder: `mv /api/oldName /api/newName`
2. Update properties.ts references
3. Update all occurrences in index.mdx
4. Update menu.md (maintain alphabetical order)
5. Update guide files
6. Update related API docs that reference this function

### Deprecation

Add deprecation notice after description:

```mdx
# oldFunction

Creates a form store.

> **⚠️ Deprecated**: Use <Link href="../newFunction/">`newFunction`</Link> instead. This function will be removed in v2.0.
```

## Link Updates

### Cross-Package Links (Use Absolute)

```typescript
// ✅ Correct
href: '/core/api/Schema/';

// ❌ Wrong - relative won't work across packages
href: '../../../core/api/Schema/';
```

### Qwik Routing (Exclude Parentheses)

```typescript
// ✅ Correct
href: '../FormStore/';

// ❌ Wrong - Qwik ignores (types) segment
href: '../(types)/FormStore/';
```

## Verification Checklist

### Source Code Accuracy

- [ ] All generic constraints match source exactly
- [ ] All parameter types match source exactly
- [ ] Return type matches source exactly
- [ ] Function signature identical to source

### Type Links

- [ ] All `href` links point to existing documentation
- [ ] Generic references use correct names
- [ ] No broken links to removed types

### Examples

- [ ] All examples use updated API correctly
- [ ] Examples compile with new signature
- [ ] New features demonstrated in examples

### Consistency

- [ ] Tone and style match existing docs
- [ ] Naming conventions maintained
- [ ] Related section accurate

### Cleanup

- [ ] All properties in properties.ts are actually used
- [ ] Remove any unused properties
- [ ] No orphaned references

## Quick Reference

### Properties.ts Pattern for Optional Parameter

```typescript
// Optional = union with undefined
config: {
  type: {
    type: 'union',
    options: [
      { type: 'custom', name: 'Config', href: '../Config/' },
      'undefined',
    ],
  },
},
```

### Multiple Overloads in Signature

```mdx
\`\`\`ts
const result = fn<TSchema>(form);
const result = fn<TSchema, TPath>(form, config);
\`\`\`
```

### Type Reference Rules

Reference generic parameter names, not base types:

```typescript
// ✅ Correct - use parameter name
generics: [{ type: 'custom', name: 'TFieldPath' }];

// ❌ Wrong - using constraint type
generics: [{ type: 'custom', name: 'RequiredPath' }];
```
