---
name: repo-website-guide-create
description: Add new documentation guides and tutorials to the Formisch website. Use when creating guides about form concepts, features, or techniques that aren't covered by existing documentation.
metadata:
  author: formisch
  version: '1.0'
---

# Adding Documentation Guides

This skill provides instructions for adding new documentation guides to the Formisch website.

## Directory Structure

Guides are organized under `website/src/routes/{framework}/guides/`:

```
website/src/routes/{framework}/guides/
├── menu.md                           # Navigation menu
├── layout.tsx                        # Layout wrapper
├── (category-name)/                  # Route group (with parentheses)
│   └── guide-name/                   # Individual guide folder
│       └── index.mdx                 # Guide content
```

**Categories**:

- `(get-started)` - Introductory content
- `(main-concepts)` - Core library concepts
- `(advanced-guides)` - Advanced features

## Step-by-Step Process

### Step 1: Choose Category

Determine the appropriate category:

- **(get-started)**: Introduction, Installation, LLMs.txt
- **(main-concepts)**: Define form, Create form, Add fields, Handle submission
- **(advanced-guides)**: Controlled fields, Field arrays, TypeScript

### Step 2: Create Guide Directory

```bash
mkdir -p website/src/routes/{framework}/guides/(category-name)/guide-slug/
```

- `{framework}` = solid, qwik, preact, svelte, or vue
- Use kebab-case for guide-slug

### Step 3: Create index.mdx

```mdx
---
title: Guide Title
description: >-
  A concise description of what this guide covers.
contributors:
  - github-username
---

import { Link } from '~/components';

# Guide Title

Opening paragraph explaining what the reader will learn.

## Section Heading

Content explaining the topic with clear, concise language.

\`\`\`tsx
// Code example with proper framework imports
import { createForm, Field, Form } from '@formisch/solid';
import \* as v from 'valibot';

const Schema = v.object({
email: v.pipe(v.string(), v.email()),
});

export default function Example() {
  const form = createForm({ schema: Schema });
  return (
    <Form of={form}>
      <Field of={form} path={['email']}>
        {(field) => <input {...field.props} value={field.input} />}
      </Field>
    </Form>
  );
}
\`\`\`

## Another Section

Continue with additional sections as needed.
```

### Step 4: Update menu.md

Add to `website/src/routes/{framework}/guides/menu.md`:

```markdown
## Category Name

- [Existing Guide](/{framework}/guides/existing/)
- [New Guide Title](/{framework}/guides/guide-slug/)
```

## Content Guidelines

### Front Matter

```yaml
---
title: Guide Title
description: >-
  Multi-line descriptions use >- syntax.
contributors:
  - github-username
---
```

### Internal Links

Use `Link` component with framework prefix:

```mdx
import { Link } from '~/components';

See <Link href="/solid/guides/define-your-form/">define your form</Link>.
See <Link href="/solid/api/createForm/">`createForm`</Link>.
```

### Code Examples

- Use `tsx` for components, `ts` for utilities
- Import from `@formisch/{framework}`
- Import Valibot as `import * as v from 'valibot'`
- Use `v.nonEmpty()` for non-empty validation (not `v.minLength(1)`)

### Framework Terminology

| Framework | API Category |
| --------- | ------------ |
| Solid     | "primitive"  |
| Qwik      | "hook"       |
| Preact    | "hook"       |
| Vue       | "composable" |
| Svelte    | "rune"       |

### Formatting

- **Bold** for emphasis
- `inline code` for API names, variables, files
- Proper heading hierarchy (h1 → h2 → h3)
- Concise, focused paragraphs

## Guide Structure Patterns

### Get Started Guide

```mdx
# Introduction

Opening explanation.

## Highlights

Key features with brief descriptions.

## Basic Example

Simple working code.

## Comparison

Advantages over alternatives.

## Next Steps

Links to related guides.
```

### Main Concepts Guide

```mdx
# Define Your Form

Explains what the guide covers.

## Step 1: Create Schema

Explanation with code.

## Step 2: Create Form Store

Explanation with code.

## Common Patterns

Variations and alternatives.

## Related

Links to API docs and other guides.
```

### Advanced Guide

```mdx
# Field Arrays

Overview of the feature.

## When to Use

Scenarios where this applies.

## Implementation

Detailed code examples.

## Edge Cases

Special considerations.

## Performance

Optimization tips.
```

## Code Example Patterns

### Basic Form

```tsx
import { createForm, Field, Form, type SubmitHandler } from '@formisch/solid';
import * as v from 'valibot';

const LoginSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  password: v.pipe(v.string(), v.minLength(8)),
});

export default function LoginPage() {
  const loginForm = createForm({
    schema: LoginSchema,
  });

  const handleSubmit: SubmitHandler<typeof LoginSchema> = (output) => {
    console.log(output);
  };

  return (
    <Form of={loginForm} onSubmit={handleSubmit}>
      <Field of={loginForm} path={['email']}>
        {(field) => (
          <div>
            <input {...field.props} value={field.input} type="email" />
            {field.errors && <div>{field.errors[0]}</div>}
          </div>
        )}
      </Field>
      <button type="submit" disabled={loginForm.isSubmitting}>
        Login
      </button>
    </Form>
  );
}
```

### Using Primitive vs Component

```mdx
### Using Field component

\`\`\`tsx

<Field of={form} path={['email']}>
  {(field) => <input {...field.props} value={field.input} />}
</Field>
\`\`\`

### Using useField primitive

\`\`\`tsx
const field = useField(form, { path: ['email'] });
return <input {...field.props} value={field.input} />;
\`\`\`
```

## Checklist

Before submitting:

- [ ] Directory follows pattern: `{framework}/guides/(category)/guide-slug/index.mdx`
- [ ] Front matter has title, description, contributors
- [ ] All internal links use `Link` component with framework prefix
- [ ] Code examples use correct framework package
- [ ] Guide added to menu.md in correct category
- [ ] TypeScript examples properly typed
- [ ] No spelling/grammar errors

## Source Code Verification

When guides include Formisch APIs, verify correct usage:

- **Framework APIs**: Check `frameworks/{framework}/src/`
- **Methods**: Check `packages/methods/src/`
- **Core types**: Check `packages/core/src/`
- **Examples**: Check `playgrounds/{framework}/src/`
