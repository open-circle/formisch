# Code Example Conventions

Guidelines for writing code examples in API documentation.

## Naming Conventions

| Type | Pattern | Examples |
|------|---------|----------|
| Schema | `PascalCase` + `Schema` | `EmailSchema`, `UserSchema`, `PasswordSchema` |
| Form | `camelCase` + `Form` | `loginForm`, `registerForm` |
| Specific purpose | Descriptive + `Schema` | `MinStringSchema`, `UrlSchema` |
| Multiple related | Numbered | `ObjectSchema1`, `ObjectSchema2` |

## Example Structure

### Basic Pattern

```typescript
import { createForm } from '@formisch/solid';
import * as v from 'valibot';

const LoginSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  password: v.pipe(v.string(), v.minLength(8)),
});

const loginForm = createForm({ schema: LoginSchema });
```

### With Error Messages

Always include error messages for validations:

```typescript
// ✅ Good
const PasswordSchema = v.pipe(
  v.string(),
  v.minLength(8, 'Your password is too short.'),
  v.regex(/[A-Z]/, 'Your password must contain an uppercase letter.')
);

// ❌ Bad - no error messages
const PasswordSchema = v.pipe(
  v.string(),
  v.minLength(8),
  v.regex(/[A-Z]/)
);
```

## Progressive Complexity

Examples should progress from simple to complex:

1. **Basic example**: Simplest possible usage
2. **Common pattern**: Most typical use case
3. **Advanced usage**: Complex but realistic scenario

### Example Progression

```mdx
### Basic form

Simple login form with email and password.

\`\`\`ts
const LoginSchema = v.object({
  email: v.string(),
  password: v.string(),
});

const loginForm = createForm({ schema: LoginSchema });
\`\`\`

### Form with validation

Login form with validation rules.

\`\`\`ts
const LoginSchema = v.object({
  email: v.pipe(
    v.string(),
    v.nonEmpty('Please enter your email.'),
    v.email('The email is badly formatted.')
  ),
  password: v.pipe(
    v.string(),
    v.minLength(8, 'Password must be at least 8 characters.')
  ),
});

const loginForm = createForm({ schema: LoginSchema });
\`\`\`

### Form with initial values

Login form with pre-filled values.

\`\`\`ts
const loginForm = createForm({
  schema: LoginSchema,
  initialInput: {
    email: 'user@example.com',
    password: '',
  },
});
\`\`\`
```

## Descriptive Headings

Use descriptive headings for examples:

✅ Good:
- "Email schema"
- "Password validation"
- "Form with nested fields"
- "Array field operations"

❌ Bad:
- "Example 1"
- "Usage"
- "Basic"

## Error Messages

Error messages should be:

- Clear and actionable
- User-friendly tone
- Start with articles ("The email...", "Your password...")

✅ Good error messages:
- "Your password is too short."
- "The email is badly formatted."
- "Please enter your email."

❌ Bad error messages:
- "Invalid"
- "Error"
- "Wrong format"

## Show Full Context

Don't truncate examples:

```typescript
// ✅ Good - complete example
const EmailSchema = v.pipe(
  v.string(),
  v.nonEmpty('Please enter your email.'),
  v.email('The email is badly formatted.'),
  v.maxLength(30, 'Your email is too long.')
);

// ❌ Bad - truncated
const EmailSchema = v.pipe(
  v.string()
  // ... validation
);
```

## Comments

Add comments to clarify non-obvious code:

```typescript
const UserSchema = v.pipe(
  v.object({
    name: v.string(),
    age: v.number(),
  }),
  v.transform((input) => ({
    ...input,
    created: new Date().toISOString(), // Add creation timestamp
  }))
);
```

## Framework Imports

Use correct import for each framework:

```typescript
// SolidJS
import { createForm, Field, Form } from '@formisch/solid';

// Qwik
import { useForm$, Field, Form } from '@formisch/qwik';

// Preact
import { useForm, Field, Form } from '@formisch/preact';

// Vue
import { useForm, Field, Form } from '@formisch/vue';

// Svelte
import { createForm, Field, Form } from '@formisch/svelte';
```

## Valibot Import

Always import Valibot as namespace:

```typescript
import * as v from 'valibot';
```
