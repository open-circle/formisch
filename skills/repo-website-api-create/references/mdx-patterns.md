# MDX Patterns Reference

Structure and patterns for API documentation MDX files.

## Front Matter

```yaml
---
title: functionName
description: Brief one-line description ending with a period.
source: /path/to/source/file.ts
contributors:
  - github-username
---
```

- **title**: Exact function/type name (case-sensitive)
- **description**: One concise sentence with period
- **source**: Relative path from monorepo root
- **contributors**: GitHub usernames

## Imports

```typescript
import { ApiList, Link, Property } from '~/components';
import { properties } from './properties';
```

Only import what you use.

## Function Documentation Structure

```mdx
# functionName

Full description of what this function does.

\`\`\`ts
const result = functionName<TGeneric>(param1, param2);
\`\`\`

## Generics

- `TGeneric` <Property {...properties.TGeneric} />

## Parameters

- `param1` <Property {...properties.param1} />
- `param2` <Property {...properties.param2} />

### Explanation

Detailed explanation referencing specific parameters by name.

## Returns

- `result` <Property {...properties.result} />

## Examples

The following examples show how `functionName` can be used.

### Example name

Brief description.

\`\`\`ts
// Code example
\`\`\`

## Related

### Primitives

<ApiList items={[{ text: 'createForm', href: '../createForm/' }]} />

### Components

<ApiList items={[{ text: 'Field', href: '../Field/' }]} />

### Methods

<ApiList items={[{ text: 'validate', href: '/methods/api/validate/' }]} />
```

## Component Documentation Structure

Components use **Properties** heading (not Parameters) and have NO Returns/Examples sections:

```mdx
# Field

Renders a form field with reactive state.

\`\`\`tsx
<Field of={form} path={['email']}>
  {(field) => <input {...field.props} />}
</Field>
\`\`\`

## Generics

- `TSchema` <Property {...properties.TSchema} />

## Properties

- `of` <Property {...properties.of} />
- `path` <Property {...properties.path} />
- `children` <Property {...properties.children} />

### Explanation

The `Field` component provides a render prop function via the `children` prop...

## Related

### Primitives

<ApiList items={[{ text: 'useField', href: '../useField/' }]} />
```

## Type Documentation Structure

Types have Definition section (not Parameters), minimal content:

```mdx
# FormStore

Form store interface.

## Generics

- `TSchema` <Property {...properties.TSchema} />

## Definition

- `FormStore` <Property {...properties.FormStore} />
  - `isSubmitting` <Property {...properties.isSubmitting} />
  - `errors` <Property {...properties.errors} />

## Related

### Primitives

<ApiList items={[{ text: 'createForm', href: '../createForm/' }]} />
```

## Overloaded Function Signatures

List each overload on separate lines:

```mdx
\`\`\`ts
const input = getInput<TSchema>(form);
const input = getInput<TSchema, TFieldPath>(form, config);
\`\`\`
```

Do NOT include implementation signatures.

## Related Section Rules

1. **Follow menu.md order**: Primitives → Components → Methods
2. **Never include Types** in Related sections
3. **Use correct framework heading**: Primitives/Hooks/Composables/Runes
4. **Alphabetical order** within each category

### Framework-Specific Headings

| Framework | Heading |
|-----------|---------|
| Solid | `### Primitives` |
| Qwik | `### Hooks` |
| Preact | `### Hooks` |
| Vue | `### Composables` |
| Svelte | `### Runes` |

## ApiList Component

```mdx
<ApiList
  items={[
    { text: 'createForm', href: '../createForm/' },
    { text: 'validate', href: '/methods/api/validate/' },
  ]}
/>
```

Use absolute paths for cross-package links.

## Link Component

```mdx
See <Link href="../FormStore/">`FormStore`</Link> for details.
```

## Blockquotes for Notes

```mdx
> This function throws an error if validation fails.
```

## Complex Types Note

For types too complex to display:

```mdx
> This type is too complex to display. Please refer to the [source code](https://github.com/...).
```
