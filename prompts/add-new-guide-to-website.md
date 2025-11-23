# Guide: Adding a New Documentation Guide

This document provides instructions for AI agents on how to add a new documentation guide to the Formisch website.

## Prerequisites

Before adding a new guide:

1. Read the `menu.md` file at `website/src/routes/{framework}/guides/menu.md` to understand the current structure (where `{framework}` is `solid`, `qwik`, `preact`, `svelte`, or `vue`)
2. Understand which category the new guide belongs to (Get started, Main concepts, Advanced guides, or a new category)
3. Review similar existing guides to understand the style and structure

## Directory Structure

Guides are organized under `website/src/routes/{framework}/guides/` (where `{framework}` is `solid`, `qwik`, `preact`, `svelte`, or `vue`) with the following structure:

```
website/src/routes/{framework}/guides/
├── menu.md                           # Navigation menu definition
├── layout.tsx                        # Layout wrapper for all guides
├── index.tsx                         # Root redirect
├── (category-name)/                  # Route group folder (with parentheses)
│   └── guide-name/                   # Individual guide folder
│       └── index.mdx                 # Guide content (MDX format)
│       └── [additional-assets]       # Optional: images, etc.
```

**Important**: Category folders use Qwik's route grouping syntax with parentheses, e.g., `(get-started)`, `(main-concepts)`, `(advanced-guides)`.

## Step-by-Step Process

### 1. Choose the Category

Determine which category the guide belongs to:

- **(get-started)**: Introductory content for new users (Introduction, Installation, LLMs.txt)
- **(main-concepts)**: Core concepts of the library (Define your form, Create your form, Add form fields, Input components, Handle submission, Form methods)
- **(advanced-guides)**: Advanced features and techniques (Controlled fields, Special inputs, Nested fields, Field arrays, TypeScript)

If none fit, you may need to create a new category folder.

### 2. Create the Guide Directory

Create a new folder structure:

```
website/src/routes/{framework}/guides/(category-name)/guide-slug/
```

Where:

- `{framework}` is `solid`, `qwik`, `preact`, `svelte`, or `vue`
- `category-name` is an existing category or new category (with parentheses)
- `guide-slug` is a kebab-case URL-friendly name for the guide

### 3. Create the MDX File

Create an `index.mdx` file in the guide directory with the following structure:

````mdx
---
title: Guide Title
description: >-
  A concise description of what this guide covers. Can span multiple lines.
  Use the `>-` syntax for multi-line descriptions.
contributors:
  - github-username
---

import { Link } from '~/components';

# Guide Title

Opening paragraph that introduces the topic and explains what the reader will learn.

## Section Heading

Content explaining the topic. Use clear, concise language.

### Subsection Heading

More detailed content.

```ts
// Code example ...
```

## Another Section

Continue with additional sections as needed.
````

#### Frontmatter Requirements

The frontmatter (between `---` markers) must include:

- **title**: The guide title (appears in navigation and page header)
- **description**: A brief description (for SEO and previews, use `>-` for multi-line)
- **contributors**: Array of GitHub usernames (use a placeholder if unknown)

### 4. Content Guidelines

Follow these guidelines when writing content:

#### Imports

- Always import `Link` from `~/components` for internal links
- Import other components as needed (e.g., `ApiList` from `~/components`)

#### Internal Links

Use the `Link` component for linking to other documentation:

```mdx
<Link href="/{framework}/guides/define-your-form/">define your form guide</Link>
<Link href="/{framework}/api/createForm/">`createForm`</Link>
```

Replace `{framework}` with the appropriate framework name (`solid`, `qwik`, `preact`, `svelte`, or `vue`).`

#### Code Blocks

- Use TypeScript (`tsx` for framework components, `ts` for utilities) for code examples
- Import Formisch from `@formisch/{framework}` (e.g., `@formisch/solid`)
- Import Valibot as `import * as v from 'valibot';` when showing schemas
- Include comments to explain complex code
- Use proper syntax highlighting with triple backticks

#### Formatting

- Use **bold** for emphasis
- Use `inline code` for API names, variables, file names
- Use proper heading hierarchy (h1 for title, h2 for sections, h3 for subsections)
- Keep paragraphs concise and focused

#### Structure

- Start with an introduction explaining the topic
- Break content into logical sections with clear headings
- Include practical examples throughout
- Consider adding subsections for variations or special cases
- End with related links or next steps when appropriate

#### Special Components

You may use special documentation components:

```mdx
<ApiList label="Description" items={['apiName1', 'apiName2']} />
```

### 5. Add Assets (Optional)

If your guide needs images or other assets:

- Place them in the same directory as `index.mdx`
- Use descriptive filenames (e.g., `mental-model-light.jpg`)
- Consider light/dark theme variants if applicable
- Reference them in the MDX file:

```mdx
![Alt text](./image-name.jpg)
```

### 6. Update the Menu

Add an entry to `website/src/routes/{framework}/guides/menu.md`:

```markdown
## Category Name

- [Existing Guide](/{framework}/guides/existing/)
- [New Guide Title](/{framework}/guides/guide-slug/)
```

Important:

- Add the new guide in the appropriate category section
- Use the correct URL path (must match the folder structure and include the framework prefix)
- Maintain alphabetical or logical ordering within the category
- If creating a new category, add a new `## Category Name` heading

### 7. Alternative: Redirect Files

If you need to create a redirect (e.g., when a guide is moved or renamed):

Create an `index.tsx` file instead of `index.mdx`:

```tsx
import { component$ } from '@qwik.dev/core';
import { routeLoader$ } from '@qwik.dev/router';

export const useRedirect = routeLoader$(({ redirect }) => {
  throw redirect(302, '/{framework}/guides/new-location/');
});

export default component$(() => {
  useRedirect();
  return null;
});
```

## Verification Checklist

Before submitting, verify:

- [ ] Directory structure follows the pattern: `{framework}/guides/(category-name)/guide-slug/index.mdx`
- [ ] Frontmatter includes title, description, and contributors
- [ ] All internal links use the `Link` component with framework prefix
- [ ] Code examples follow Formisch conventions and use the correct framework package
- [ ] Guide is added to `menu.md` in the correct category
- [ ] Content is clear, concise, and follows existing guide patterns
- [ ] TypeScript code examples are properly typed
- [ ] No spelling or grammatical errors

## Common Patterns

### Linking to API Documentation

```mdx
<Link href="/{framework}/api/createForm/">`createForm`</Link>
<Link href="/{framework}/api/Field/">`Field`</Link>
```

### Code Examples with Explanations

`````mdx
The following example shows how to create a form:

````tsx
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
      <Field of={loginForm} path={['password']}>
        {(field) => (
          <div>
            <input {...field.props} value={field.input} type="password" />
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
\```

This creates a form with email and password fields.
````
`````

### Multiple Code Variations

When showing alternatives, use clear headings:

````mdx
### Using Field component

\```tsx

<Field of={form} path={['email']}>
  {(field) => <input {...field.props} value={field.input} />}
</Field>
\```

### Using useField primitive

\```tsx
const field = useField(form, { path: ['email'] });
return <input {...field.props} value={field.input} />;
\```
````

## Examples from Existing Guides

### Simple Guide Structure

See `(get-started)/introduction/index.mdx`:

- Clear introduction
- Highlights section
- Basic example with code
- Comparison with other libraries
- Links to related content

### Main Concepts Guide Structure

Example patterns for guides like `define-your-form`, `create-your-form`, etc.:

- Introduction explaining the concept
- Step-by-step instructions
- Code examples for each step
- Common patterns and variations
- Links to related guides and API docs

### Advanced Guide Structure

Example patterns for guides like `controlled-fields`, `field-arrays`, etc.:

- Overview of the advanced feature
- When to use it
- Detailed implementation examples
- Edge cases and gotchas
- Performance considerations
- Links to related content

## Tips for AI Agents

1. **Read existing guides first**: Always examine 2-3 similar guides to understand the style and patterns
2. **Verify API usage**: When a guide includes specific Formisch APIs, check the source code in:
   - `packages/methods/src/` for methods (getInput, setInput, reset, etc.)
   - `frameworks/{framework}/src/` for framework-specific APIs (Field, Form, useField, etc.)
   - `playgrounds/{framework}/src/` for real-world implementation examples
3. **Follow conventions**: Use the established patterns for imports, links, and code examples
4. **Be consistent**: Match the tone, structure, and terminology of existing documentation
5. **Keep it focused**: Each guide should cover one main topic thoroughly
6. **Include practical examples**: Show real, runnable code that users can adapt
7. **Cross-reference**: Link to related guides and API documentation
8. **Consider the audience**: Write for users at the appropriate skill level for the category

## Formisch API Conventions

When writing guides that include specific Formisch APIs, **always verify the correct usage by checking the source code**:

### Source Code References

- **Framework-specific APIs** (Field, Form, useField, etc.): Check `frameworks/{framework}/src/`
  - Example: For SolidJS, check `frameworks/solid/src/`
  - Look at type definitions, component props, and primitive signatures

- **Methods** (getInput, setInput, reset, validate, etc.): Check `packages/methods/src/`
  - Each method has its own folder with implementation and types
  - Verify parameter names, config object structure, and return types

- **Core types and utilities**: Check `packages/core/src/`

- **Implementation examples**: Check `playgrounds/{framework}/src/`
  - Real-world usage examples of APIs and patterns
  - Component implementations and best practices
  - Helpful for understanding how different features work together

### General Patterns to Follow

1. **Schema-first approach**: Formisch uses Valibot schemas for validation and type inference

   ```tsx
   import * as v from 'valibot';

   const LoginSchema = v.object({
     email: v.pipe(v.string(), v.email()),
     password: v.pipe(v.string(), v.nonEmpty('Password is required.')),
   });
   ```

   **Note**: Use `v.nonEmpty()` instead of `v.minLength(1)` to check for non-empty strings.

2. **Framework-specific terminology**:
   - **SolidJS**: Use "primitive" (e.g., "`useField` primitive")
   - **React/Preact**: Use "hook" (e.g., "`useField` hook")
   - **Qwik**: Use "hook" (e.g., "`useField` hook")

3. **Playground references**: Link to relevant playground examples when appropriate:
   ```mdx
   > In our <Link href="/playground/login">login playground</Link> you can see this in action.
   ```

### When Writing Guides

1. **Check existing similar guides first** to understand established patterns
2. **Verify API usage** by reading the source code in `packages/`, `frameworks/`, and `playgrounds/`
3. **Use TypeScript types** from the source to ensure correct prop names and signatures
4. **Reference playground implementations** for practical examples of how features work together
5. **Test code examples** mentally against the source code to avoid mistakes
6. **Be consistent** with terminology and patterns used in other guides

## Notes

- The website uses Qwik framework with file-based routing
- Route groups (folders with parentheses) don't affect the URL structure
- MDX files support JSX components alongside Markdown
- The `layout.tsx` file provides consistent styling for all guides
- The `menu.md` file is used to generate the navigation sidebar
