---
name: repo-website-api-create
description: Create new API documentation routes for the Formisch website. Use when adding documentation for new exported functions, types, components, or methods that don't yet have website documentation.
metadata:
  author: formisch
  version: '1.0'
---

# Adding New API Documentation

This skill provides instructions for adding new API reference routes to the Formisch website. Consistency and uniformity across all API documentation is critical.

**Key Principle**: Source code is the single source of truth. All documentation is derived directly from the source code.

## Quick Overview

Each API function or type needs its own folder containing:

- `index.mdx` - The main documentation file with MDX content
- `properties.ts` - TypeScript definitions that map to the Property component

## Step-by-Step Process

### Step 1: Identify the API

Before creating documentation:

1. **Category**: Is it a core type, framework primitive/hook/composable/rune, framework type, component, or method?
2. **Name**: The exact function/type name (camelCase for functions, PascalCase for types/components)
3. **Source file**: Path to the source code in the monorepo
4. **Dependencies**: Related types, primitives, or methods

### Step 2: Read the Source Code

**This is the most critical step.** Read the entire source file and extract:

1. **Interfaces and Types** - Exported type definitions with generic parameters
2. **Function Signatures** - All overloads (not implementations)
3. **JSDoc Comments** - Descriptions, param tags, hints
4. **Generic Constraints** - `extends` clauses
5. **Return Types** - Interface names with generics

### Step 3: Create the Documentation Folder

Create folder in the appropriate category:

```
/website/src/routes/(docs)/{framework}/api/(category)/{ApiName}/
├── index.mdx
└── properties.ts
```

**Categories by framework:**

- `core/api/(types)` - Core/shared type definitions
- `methods/api/` - Global methods (focus, validate, reset, etc.)
- `solid/api/(primitives)` - SolidJS primitives (createForm, useField)
- `solid/api/(components)` - SolidJS components (Field, Form)
- `solid/api/(types)` - SolidJS-specific types
- `qwik/api/(hooks)` - Qwik hooks (useForm$, useField)
- `preact/api/(hooks)` - Preact hooks
- `svelte/api/(runes)` - Svelte 5 runes
- `vue/api/(composables)` - Vue composables

### Step 4: Create properties.ts

See [references/property-component.md](references/property-component.md) for the Property component specification and type mapping patterns.

```typescript
import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  // 1. GENERICS - with modifier: 'extends'
  TSchema: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'Schema',
      href: '/core/api/Schema/',
    },
  },

  // 2. PARAMETERS - matching function signature
  config: {
    type: {
      type: 'custom',
      name: 'FormConfig',
      href: '../FormConfig/',
      generics: [{ type: 'custom', name: 'TSchema' }],
    },
  },

  // 3. RETURN TYPE
  Store: {
    type: {
      type: 'custom',
      name: 'FormStore',
      href: '../FormStore/',
      generics: [{ type: 'custom', name: 'TSchema' }],
    },
  },
};
```

### Step 5: Create index.mdx

See [references/mdx-patterns.md](references/mdx-patterns.md) for detailed MDX structure and patterns.

```mdx
---
title: createForm
description: Creates a reactive form store from a form configuration.
source: /frameworks/solid/src/primitives/createForm/createForm.ts
contributors:
  - fabian-hiller
---

import { ApiList, Property } from '~/components';
import { properties } from './properties';

# createForm

Creates a reactive form store from a form configuration.

\`\`\`ts
const form = createForm<TSchema>(config);
\`\`\`

## Generics

- `TSchema` <Property {...properties.TSchema} />

## Parameters

- `config` <Property {...properties.config} />

### Explanation

With `createForm` you can create a reactive form store...

## Returns

- `form` <Property {...properties.Store} />

## Examples

The following examples show how `createForm` can be used.

### Basic form

\`\`\`ts
import { createForm } from '@formisch/solid';
import \* as v from 'valibot';

const LoginSchema = v.object({
email: v.pipe(v.string(), v.email()),
password: v.pipe(v.string(), v.minLength(8)),
});

const loginForm = createForm({ schema: LoginSchema });
\`\`\`

## Related

### Primitives

<ApiList
  items={[
    { text: 'useField', href: '../useField/' },
    { text: 'useFieldArray', href: '../useFieldArray/' },
  ]}
/>

### Components

<ApiList
  items={[
    { text: 'Form', href: '../Form/' },
    { text: 'Field', href: '../Field/' },
  ]}
/>
```

### Step 6: Update menu.md

Add to the appropriate `menu.md` file in alphabetical order:

```markdown
## Primitives

- [createForm](/solid/api/createForm/)
- [useField](/solid/api/useField/)
```

## Documentation Types

### Function Documentation

- Function signature code block
- Generics section (if applicable)
- **Parameters section** (use "Parameters" heading)
- Explanation section (required)
- **Returns section** (if not void)
- Examples section (required, 2-4 progressive examples)
- Related section

### Component Documentation

- Component signature code block
- Generics section (if applicable)
- **Properties section** (use "Properties" heading)
- Explanation section (required)
- **NO Returns section**
- **NO Examples section**
- Related section

### Type Documentation

- Type name and description
- Generics section (if applicable)
- Definition section listing properties
- Explanation section (only if semantically important)
- NO Examples section
- Related section (Primitives/Components/Methods only, never Types)

## Important Rules

### URL Patterns

Parentheses folders don't appear in URLs:

- `/solid/api/createForm/` (not `/solid/api/(primitives)/createForm/`)

### Link Patterns

- **Relative paths within same section**: `../FormStore/`
- **Absolute paths for cross-package**: `/core/api/Schema/`
- **External links for Valibot**: `https://valibot.dev/api/InferInput/`

### Framework-Specific Terminology

| Framework | Category Term | Example API          |
| --------- | ------------- | -------------------- |
| Solid     | Primitives    | createForm, useField |
| Qwik      | Hooks         | useForm$, useField   |
| Preact    | Hooks         | useForm, useField    |
| Vue       | Composables   | useForm, useField    |
| Svelte    | Runes         | createForm, useField |

## References

For detailed patterns and examples, see:

- [references/property-component.md](references/property-component.md) - Property component and type mapping
- [references/mdx-patterns.md](references/mdx-patterns.md) - MDX structure and patterns
- [references/examples.md](references/examples.md) - Code example conventions

## Checklist

Before submitting:

- [ ] Read source file completely
- [ ] All generics documented with correct constraints
- [ ] All parameters documented with correct types
- [ ] Return type documented
- [ ] Custom types link to their documentation (href)
- [ ] Function signature matches source exactly
- [ ] Examples are realistic and follow naming conventions
- [ ] Related section uses correct framework terminology
- [ ] `menu.md` updated in alphabetical order
- [ ] No typos or grammatical errors
