---
name: formisch
description: Form handling with Formisch, the type-safe form library for modern frameworks. Use when the user needs to create forms, handle form state, validate form inputs, or work with Formisch.
license: MIT
metadata:
  author: open-circle
  version: "1.1"
---

# Formisch

This skill helps AI agents work effectively with [Formisch](https://formisch.dev/), the schema-based, headless form library for modern frameworks.

## When to Use This Skill

- When the user asks about form handling with Formisch
- When managing form state and validation
- When working with React, Vue, Solid, Preact, Svelte, or Qwik forms
- When integrating Valibot schemas with forms

## Introduction

Formisch is a schema-based, headless form library that works across multiple frameworks. Key highlights:

- **Small bundle size** — Starting at ~2.5 kB
- **Schema-based validation** — Uses Valibot for type-safe validation
- **Headless design** — You control the UI completely
- **Type safety** — Full TypeScript support with autocompletion
- **Framework-native** — Native performance for each supported framework

### Supported Frameworks

| Framework | Package            | Hook/Primitive |
| --------- | ------------------ | -------------- |
| React     | `@formisch/react`  | `useForm`      |
| Vue       | `@formisch/vue`    | `useForm`      |
| SolidJS   | `@formisch/solid`  | `createForm`   |
| Preact    | `@formisch/preact` | `useForm`      |
| Svelte    | `@formisch/svelte` | `createForm`   |
| Qwik      | `@formisch/qwik`   | `useForm$`     |

## Installation

### 1. Install Valibot (peer dependency)

```bash
npm install valibot
```

### 2. Install Formisch for your framework

```bash
npm install @formisch/react   # React
npm install @formisch/vue     # Vue
npm install @formisch/solid   # SolidJS
npm install @formisch/preact  # Preact
npm install @formisch/svelte  # Svelte
npm install @formisch/qwik    # Qwik
```

## Core Concepts

### Schema-First Design

Every form starts with a Valibot schema. Types are automatically inferred from the schema.

```ts
import * as v from "valibot";

const LoginSchema = v.object({
  email: v.pipe(
    v.string("Please enter your email."),
    v.nonEmpty("Please enter your email."),
    v.email("The email address is badly formatted."),
  ),
  password: v.pipe(
    v.string("Please enter your password."),
    v.nonEmpty("Please enter your password."),
    v.minLength(8, "Your password must have 8 characters or more."),
  ),
});
```

### Form Store

The form store manages all form state. Access it via the framework-specific hook/primitive.

**Form Store Properties:**

- `isSubmitting` — Form is currently being submitted
- `isSubmitted` — Form has been successfully submitted
- `isValidating` — Validation is in progress
- `isTouched` — At least one field has been touched
- `isDirty` — At least one field differs from initial value
- `isValid` — All fields pass validation
- `errors` — Root-level validation errors

### Field Store

Each field has its own reactive store with:

- `path` — Path array to the field
- `input` — Current field value
- `errors` — Field-specific errors
- `isTouched` — Field has been focused and blurred
- `isDirty` — Field value differs from initial value
- `isValid` — Field passes validation
- `props` — Props to spread onto input elements
- `onChange` (React) / `onInput` (other frameworks) — Sets the field input value programmatically. Use this when the field cannot be connected to a native HTML element.

### Dirty Tracking

Formisch tracks two inputs per field:

- **Initial input** — Baseline for dirty tracking (server state)
- **Current input** — What the user is editing (client state)

`isDirty` becomes `true` when current input differs from initial input.

## Framework Examples

### React Example

```tsx
import { Field, Form, useForm } from "@formisch/react";
import type { SubmitHandler } from "@formisch/react";
import * as v from "valibot";

const LoginSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  password: v.pipe(v.string(), v.minLength(8)),
});

export default function LoginPage() {
  const loginForm = useForm({
    schema: LoginSchema,
  });

  const handleSubmit: SubmitHandler<typeof LoginSchema> = (output) => {
    console.log(output); // { email: string, password: string }
  };

  return (
    <Form of={loginForm} onSubmit={handleSubmit}>
      <Field of={loginForm} path={["email"]}>
        {(field) => (
          <div>
            <input {...field.props} value={field.input} type="email" />
            {field.errors && <div>{field.errors[0]}</div>}
          </div>
        )}
      </Field>
      <Field of={loginForm} path={["password"]}>
        {(field) => (
          <div>
            <input {...field.props} value={field.input} type="password" />
            {field.errors && <div>{field.errors[0]}</div>}
          </div>
        )}
      </Field>
      <button type="submit" disabled={loginForm.isSubmitting}>
        {loginForm.isSubmitting ? "Submitting..." : "Login"}
      </button>
    </Form>
  );
}
```

### Vue Example

```vue
<script setup lang="ts">
import { Field, Form, useForm } from "@formisch/vue";
import type { SubmitHandler } from "@formisch/vue";
import * as v from "valibot";

const LoginSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  password: v.pipe(v.string(), v.minLength(8)),
});

const loginForm = useForm({
  schema: LoginSchema,
});

const handleSubmit: SubmitHandler<typeof LoginSchema> = (output) => {
  console.log(output);
};
</script>

<template>
  <Form :of="loginForm" @submit="handleSubmit">
    <Field :of="loginForm" :path="['email']" v-slot="field">
      <div>
        <input v-bind="field.props" v-model="field.input" type="email" />
        <div v-if="field.errors">{{ field.errors[0] }}</div>
      </div>
    </Field>
    <Field :of="loginForm" :path="['password']" v-slot="field">
      <div>
        <input v-bind="field.props" v-model="field.input" type="password" />
        <div v-if="field.errors">{{ field.errors[0] }}</div>
      </div>
    </Field>
    <button type="submit">Login</button>
  </Form>
</template>
```

### SolidJS Example

```tsx
import { Field, Form, createForm } from "@formisch/solid";
import type { SubmitHandler } from "@formisch/solid";
import * as v from "valibot";

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
      <Field of={loginForm} path={["email"]}>
        {(field) => (
          <div>
            <input {...field.props} value={field.input} type="email" />
            {field.errors && <div>{field.errors[0]}</div>}
          </div>
        )}
      </Field>
      <Field of={loginForm} path={["password"]}>
        {(field) => (
          <div>
            <input {...field.props} value={field.input} type="password" />
            {field.errors && <div>{field.errors[0]}</div>}
          </div>
        )}
      </Field>
      <button type="submit">Login</button>
    </Form>
  );
}
```

### Svelte Example

```svelte
<script lang="ts">
  import { createForm, Field, Form } from '@formisch/svelte';
  import type { SubmitHandler } from '@formisch/svelte';
  import * as v from 'valibot';

  const LoginSchema = v.object({
    email: v.pipe(v.string(), v.email()),
    password: v.pipe(v.string(), v.minLength(8)),
  });

  const loginForm = createForm({
    schema: LoginSchema,
  });

  const handleSubmit: SubmitHandler<typeof LoginSchema> = (output) => {
    console.log(output);
  };
</script>

<Form of={loginForm} onsubmit={handleSubmit}>
  <Field of={loginForm} path={['email']}>
    {#snippet children(field)}
      <div>
        <input {...field.props} value={field.input} type="email" />
        {#if field.errors}
          <div>{field.errors[0]}</div>
        {/if}
      </div>
    {/snippet}
  </Field>
  <Field of={loginForm} path={['password']}>
    {#snippet children(field)}
      <div>
        <input {...field.props} value={field.input} type="password" />
        {#if field.errors}
          <div>{field.errors[0]}</div>
        {/if}
      </div>
    {/snippet}
  </Field>
  <button type="submit">Login</button>
</Form>
```

### Qwik Example

```tsx
import { Field, Form, useForm$ } from "@formisch/qwik";
import { component$ } from "@qwik.dev/core";
import * as v from "valibot";

const LoginSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  password: v.pipe(v.string(), v.minLength(8)),
});

export default component$(() => {
  const loginForm = useForm$({
    schema: LoginSchema,
  });

  return (
    <Form of={loginForm} onSubmit$={(output) => console.log(output)}>
      <Field
        of={loginForm}
        path={["email"]}
        render$={(field) => (
          <div>
            <input {...field.props} value={field.input.value} type="email" />
            {field.errors.value && <div>{field.errors.value[0]}</div>}
          </div>
        )}
      />
      <Field
        of={loginForm}
        path={["password"]}
        render$={(field) => (
          <div>
            <input {...field.props} value={field.input.value} type="password" />
            {field.errors.value && <div>{field.errors.value[0]}</div>}
          </div>
        )}
      />
      <button type="submit">Login</button>
    </Form>
  );
});
```

## Form Configuration

```ts
const form = useForm({
  // Required: Valibot schema
  schema: MySchema,

  // Optional: Initial values (partial allowed)
  initialInput: {
    email: "user@example.com",
  },

  // Optional: When first validation occurs
  // Options: 'initial' | 'blur' | 'input' | 'submit' (default)
  validate: "submit",

  // Optional: When revalidation occurs after first validation
  // Options: 'blur' | 'input' (default) | 'submit'
  revalidate: "input",
});
```

## Field Paths

Paths are type-safe arrays that reference fields in your schema.

```tsx
// Top-level field
<Field of={form} path={['email']} />

// Nested field (schema: { user: { email: string } })
<Field of={form} path={['user', 'email']} />

// Array item field (schema: { todos: [{ label: string }] })
<Field of={form} path={['todos', 0, 'label']} />

// Dynamic array index
{items.map((item, index) => (
  <Field of={form} path={['todos', index, 'label']} key={item} />
))}
```

## Form Methods

All methods follow a consistent API pattern:

- **First parameter**: Form store
- **Second parameter**: Config object

### Reading Values

```ts
import { getInput, getErrors, getAllErrors } from "@formisch/react";

// Get field value
const email = getInput(form, { path: ["email"] });

// Get entire form input
const allInputs = getInput(form);

// Get field errors
const emailErrors = getErrors(form, { path: ["email"] });

// Get all errors across all fields
const allErrors = getAllErrors(form);
```

### Setting Values

```ts
import { setInput, setErrors, reset } from "@formisch/react";

// Set field value (updates current input, not initial)
setInput(form, { path: ["email"], input: "new@example.com" });

// Set field errors manually
setErrors(form, { path: ["email"], errors: ["Email already taken"] });

// Clear errors
setErrors(form, { path: ["email"], errors: null });

// Reset entire form
reset(form);

// Reset with new initial values
reset(form, {
  initialInput: { email: "", password: "" },
});

// Reset but keep current input
reset(form, {
  initialInput: newServerData,
  keepInput: true,
});
```

### Form Control

```ts
import { validate, focus, submit, handleSubmit } from "@formisch/react";

// Validate form manually
const isValid = await validate(form);

// Validate and focus first error field
await validate(form, { shouldFocus: true });

// Focus a specific field
focus(form, { path: ["email"] });

// Programmatically submit form
submit(form);

// Create submit handler for external buttons
const onExternalSubmit = handleSubmit(form, (output) => {
  console.log(output);
});
```

## Field Arrays

For dynamic lists of fields, use `FieldArray` with array manipulation methods.

### Schema

```ts
const TodoSchema = v.object({
  heading: v.pipe(v.string(), v.nonEmpty()),
  todos: v.pipe(
    v.array(
      v.object({
        label: v.pipe(v.string(), v.nonEmpty()),
        deadline: v.pipe(v.string(), v.nonEmpty()),
      }),
    ),
    v.nonEmpty(),
    v.maxLength(10),
  ),
});
```

### React Example

```tsx
import {
  Field,
  FieldArray,
  Form,
  useForm,
  insert,
  remove,
  move,
  swap,
} from "@formisch/react";

export default function TodoPage() {
  const todoForm = useForm({
    schema: TodoSchema,
    initialInput: {
      heading: "",
      todos: [{ label: "", deadline: "" }],
    },
  });

  return (
    <Form of={todoForm} onSubmit={(output) => console.log(output)}>
      <Field of={todoForm} path={["heading"]}>
        {(field) => <input {...field.props} value={field.input} type="text" />}
      </Field>

      <FieldArray of={todoForm} path={["todos"]}>
        {(fieldArray) => (
          <div>
            {fieldArray.items.map((item, index) => (
              <div key={item}>
                <Field of={todoForm} path={["todos", index, "label"]}>
                  {(field) => (
                    <input {...field.props} value={field.input} type="text" />
                  )}
                </Field>
                <Field of={todoForm} path={["todos", index, "deadline"]}>
                  {(field) => (
                    <input {...field.props} value={field.input} type="date" />
                  )}
                </Field>
                <button
                  type="button"
                  onClick={() =>
                    remove(todoForm, { path: ["todos"], at: index })
                  }
                >
                  Delete
                </button>
              </div>
            ))}
            {fieldArray.errors && <div>{fieldArray.errors[0]}</div>}
          </div>
        )}
      </FieldArray>

      <button
        type="button"
        onClick={() =>
          insert(todoForm, {
            path: ["todos"],
            initialInput: { label: "", deadline: "" },
          })
        }
      >
        Add Todo
      </button>

      <button type="submit">Submit</button>
    </Form>
  );
}
```

### Array Methods

```ts
import { insert, remove, move, swap, replace } from "@formisch/react";

// Add item at end
insert(form, { path: ["todos"], initialInput: { label: "", deadline: "" } });

// Add item at specific index
insert(form, {
  path: ["todos"],
  at: 0,
  initialInput: { label: "", deadline: "" },
});

// Remove item at index
remove(form, { path: ["todos"], at: index });

// Move item from one index to another
move(form, { path: ["todos"], from: 0, to: 3 });

// Swap two items
swap(form, { path: ["todos"], at: 0, and: 1 });

// Replace item at index
replace(form, {
  path: ["todos"],
  at: 0,
  initialInput: { label: "New task", deadline: "2024-12-31" },
});
```

## TypeScript Integration

### Type Inference

Types are automatically inferred from your Valibot schema:

```ts
const LoginSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  password: v.pipe(v.string(), v.minLength(8)),
});

const form = useForm({ schema: LoginSchema });
// form is FormStore<typeof LoginSchema>

// Submit handler receives typed output
const handleSubmit: SubmitHandler<typeof LoginSchema> = (output) => {
  output.email; // ✓ string
  output.password; // ✓ string
  output.username; // ✗ TypeScript error
};
```

### Input vs Output Types

Schemas with transformations have different input and output types:

```ts
const ProfileSchema = v.object({
  age: v.pipe(
    v.string(), // Input: string
    v.transform((input) => Number(input)), // Output: number
    v.number(),
  ),
  birthDate: v.pipe(
    v.string(), // Input: string
    v.transform((input) => new Date(input)), // Output: Date
    v.date(),
  ),
});

// In Field: field.input is string
// In onSubmit: output.age is number, output.birthDate is Date
```

### Type-Safe Props

Pass forms to child components with proper typing:

```tsx
import type { FormStore } from "@formisch/react";

type FormContentProps = {
  of: FormStore<typeof LoginSchema>;
};

function FormContent({ of }: FormContentProps) {
  return (
    <Form of={of} onSubmit={(output) => console.log(output)}>
      {/* ... */}
    </Form>
  );
}
```

### Generic Field Components

Create reusable field components with proper typing:

```tsx
import { useField, type FormStore } from "@formisch/react";
import * as v from "valibot";

type EmailInputProps = {
  of: FormStore<v.GenericSchema<{ email: string }>>;
};

function EmailInput({ of }: EmailInputProps) {
  const field = useField(of, { path: ["email"] });

  return (
    <div>
      <input {...field.props} value={field.input} type="email" />
      {field.errors && <div>{field.errors[0]}</div>}
    </div>
  );
}
```

### Available Types

```ts
import type {
  FormStore, // Form store type
  FieldStore, // Field store type
  FieldArrayStore, // Field array store type
  SubmitHandler, // Submit handler function type
  ValidPath, // Valid field path type
  ValidArrayPath, // Valid array field path type
  Schema, // Base schema type from Valibot
} from "@formisch/react";
```

## Validation Timing

### validate Option

Controls when the **first** validation occurs:

| Value       | Description                                |
| ----------- | ------------------------------------------ |
| `'initial'` | Validate immediately on form creation      |
| `'blur'`    | Validate when field loses focus            |
| `'input'`   | Validate on every input change             |
| `'submit'`  | Validate only on form submission (default) |

### revalidate Option

Controls when validation runs **after** the first validation:

| Value      | Description                                |
| ---------- | ------------------------------------------ |
| `'blur'`   | Revalidate when field loses focus          |
| `'input'`  | Revalidate on every input change (default) |
| `'submit'` | Revalidate only on form submission         |

## Special Inputs

### Select (Single)

```tsx
<Field of={form} path={["framework"]}>
  {(field) => (
    <select {...field.props}>
      {options.map(({ label, value }) => (
        <option key={value} value={value} selected={field.input === value}>
          {label}
        </option>
      ))}
    </select>
  )}
</Field>
```

### Select (Multiple)

```tsx
<Field of={form} path={["frameworks"]}>
  {(field) => (
    <select {...field.props} multiple>
      {options.map(({ label, value }) => (
        <option
          key={value}
          value={value}
          selected={field.input?.includes(value)}
        >
          {label}
        </option>
      ))}
    </select>
  )}
</Field>
```

### Checkbox

```tsx
<Field of={form} path={["acceptTerms"]}>
  {(field) => <input {...field.props} type="checkbox" checked={field.input} />}
</Field>
```

### File Input

File inputs cannot be controlled. Handle via UI around them:

```tsx
<Field of={form} path={["avatar"]}>
  {(field) => (
    <div>
      <input {...field.props} type="file" />
      {field.input && <span>{field.input.name}</span>}
    </div>
  )}
</Field>
```

## useField Hook

For complex field components, use the `useField` hook instead of the `Field` component:

```tsx
import { useField } from "@formisch/react";

function EmailInput({ form }) {
  const field = useField(form, { path: ["email"] });

  // Access field state in component logic
  useEffect(() => {
    if (field.errors) {
      console.log("Email has errors:", field.errors);
    }
  }, [field.errors]);

  return (
    <div>
      <input {...field.props} value={field.input} type="email" />
      {field.errors && <div>{field.errors[0]}</div>}
    </div>
  );
}
```

**When to use which:**

- **`Field` component** — Multiple fields in the same component
- **`useField` hook** — Single field with component logic access

## Using Component Libraries

When using component libraries that don't expose their underlying native HTML elements, you cannot spread `field.props` directly. Instead, use `field.onChange` (React) or `field.onInput` (other frameworks) to update the value programmatically:

```tsx
import { DatePicker } from "some-component-library";

<Field of={form} path={["date"]}>
  {(field) => (
    <DatePicker
      value={field.input}
      onChange={(newDate) => field.onChange(newDate)}
    />
  )}
</Field>;
```

The `field.onChange` method updates the field value and triggers validation, just like a native input would.

This is useful for:

- **Component libraries** that wrap native elements without exposing them
- **Complex custom inputs** like date pickers, rich text editors, or color pickers

## Async Submission

```tsx
const handleSubmit: SubmitHandler<typeof LoginSchema> = async (values) => {
  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      // Set server-side errors
      const data = await response.json();
      setErrors(form, { path: ["email"], errors: [data.error] });
    }
  } catch (error) {
    console.error("Submission failed:", error);
  }
};
```

## Common Patterns

### Loading State

```tsx
<button type="submit" disabled={form.isSubmitting}>
  {form.isSubmitting ? "Submitting..." : "Submit"}
</button>
```

### Submit on Enter

Formisch handles this automatically via the native `<form>` element.

### Reset After Success

```tsx
const handleSubmit: SubmitHandler<typeof Schema> = async (values) => {
  await saveData(values);

  // Full reset to initial state
  reset(form);

  // Or reset but keep current input values
  reset(form, { keepInput: true });
};
```

### Server Data Sync

When server data changes, update the baseline without losing user edits:

```tsx
// After refetching data from server
reset(form, {
  initialInput: newServerData,
  keepInput: true, // Keep user's current edits
  keepTouched: true, // Keep touched state (optional)
});
```

### Conditional Fields

```tsx
<Field of={form} path={["hasAccount"]}>
  {(field) => <input {...field.props} type="checkbox" checked={field.input} />}
</Field>;

{
  getInput(form, { path: ["hasAccount"] }) && (
    <Field of={form} path={["accountId"]}>
      {(field) => <input {...field.props} value={field.input} />}
    </Field>
  );
}
```

## Additional Resources

- [Formisch Documentation](https://formisch.dev/)
- [Formisch GitHub](https://github.com/open-circle/formisch)
- [Valibot Documentation](https://valibot.dev/)
