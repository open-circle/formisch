---
name: formisch
description: Form handling with Formisch, the schema-first and type-safe form library for Angular, Preact, Qwik, React, React Native, Solid, Svelte, and Vue. Use when creating forms, handling form state, validating inputs, working with field arrays, or using @formisch/* packages.
license: MIT
metadata:
  author: open-circle
  version: "1.3"
---

# Formisch

This skill helps AI agents work effectively with [Formisch](https://formisch.dev/), the schema-based, headless form library for modern frameworks.

## When to Use This Skill

- When the user asks about form handling with Formisch
- When managing form state and validation
- When working with Angular, Preact, Qwik, React, React Native, Solid, Svelte, or Vue forms
- When integrating Valibot schemas with forms

## Introduction

Formisch is a schema-based, headless form library that works across multiple frameworks. Key highlights:

- **Small bundle size** — Starting at ~2.5 kB
- **Schema-based validation** — Uses Valibot for type-safe validation
- **Headless design** — You control the UI completely
- **Type safety** — Full TypeScript support with autocompletion
- **Framework-native** — Native performance for each supported framework

### Supported Frameworks

| Framework    | Package                  | Hook/Primitive |
| ------------ | ------------------------ | -------------- |
| Angular      | `@formisch/angular`      | `injectForm`   |
| Preact       | `@formisch/preact`       | `useForm`      |
| Qwik         | `@formisch/qwik`         | `useForm$`     |
| React        | `@formisch/react`        | `useForm`      |
| React Native | `@formisch/react-native` | `useForm`      |
| SolidJS      | `@formisch/solid`        | `createForm`   |
| Svelte       | `@formisch/svelte`       | `createForm`   |
| Vue          | `@formisch/vue`          | `useForm`      |

## Installation

### 1. Install Valibot (peer dependency)

```bash
npm install valibot
```

### 2. Install Formisch for your framework

```bash
npm install @formisch/react         # React
npm install @formisch/angular       # Angular
npm install @formisch/vue           # Vue
npm install @formisch/solid         # SolidJS
npm install @formisch/preact        # Preact
npm install @formisch/svelte        # Svelte
npm install @formisch/qwik          # Qwik
npm install @formisch/react-native  # React Native
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
- `isSubmitted` — Form submission has been attempted
- `isValidating` — Validation is in progress
- `isTouched` — At least one field has been touched
- `isEdited` — At least one field has been edited
- `isDirty` — At least one field differs from initial value
- `isValid` — All fields pass validation
- `errors` — Root-level validation errors

### Field Store

Each field has its own reactive store with:

- `path` — Path array to the field
- `input` — Current field value
- `errors` — Field-specific errors
- `isTouched` — Field has been focused
- `isEdited` — Field value has been edited
- `isDirty` — Field value differs from initial value
- `isValid` — Field passes validation
- `props` — Props to spread onto native elements (Angular connects controls with `[formischControl]` instead)
- `onChange` (React and React Native) / `onInput` (Solid, Svelte, Preact, and Qwik) / `setInput` (Angular) — Sets the field input value programmatically. Use this when the field cannot be connected to a native element. In Vue, set `field.input` directly (for example with `v-model`).

Store reactivity is framework-specific. React, React Native, Solid, Svelte, and Vue expose plain reactive properties. Angular properties are signals and are called like `field.errors()`, except `path`, which is a plain value. Preact and Qwik properties are signals; use `.value` in conditions and ordinary TypeScript logic. Do not copy one framework's access syntax into another.

### Dirty Tracking

Formisch tracks two inputs per field:

- **Initial input** — Baseline for dirty tracking (server state)
- **Current input** — What the user is editing (client state)

`isDirty` becomes `true` when current input differs from initial input.

## Framework Examples

### Angular Example

Angular uses signals, dependency injection, and directives instead of a JSX component API.

```ts
import { Component } from "@angular/core";
import {
  FormischControl,
  FormischField,
  FormischForm,
  injectForm,
  type SubmitHandler,
} from "@formisch/angular";
import * as v from "valibot";

const LoginSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  password: v.pipe(v.string(), v.minLength(8)),
});

@Component({
  selector: "app-login",
  imports: [FormischForm, FormischField, FormischControl],
  template: `
    <form [formischForm]="loginForm" [formischSubmit]="handleSubmit">
      <ng-container *formischField="['email'] of loginForm; let field">
        <input [formischControl]="field" type="email" />
        @if (field.errors(); as errors) {
          <div>{{ errors[0] }}</div>
        }
      </ng-container>
      <button type="submit" [disabled]="loginForm.isSubmitting()">Login</button>
    </form>
  `,
})
export class LoginComponent {
  readonly loginForm = injectForm({ schema: LoginSchema });

  readonly handleSubmit: SubmitHandler<typeof LoginSchema> = (output) => {
    console.log(output);
  };
}
```

Let `[formischControl]` synchronize the native control. Do not add competing `[value]` or `[checked]` bindings except when `value` identifies an option in a radio or checkbox group.

### React Native Example

React Native has no DOM `<form>` element or Formisch `Form` component. Use `handleSubmit` and bind `field.props` to `TextInput`.

```tsx
import { Field, handleSubmit, useForm } from "@formisch/react-native";
import { Button, TextInput, View } from "react-native";
import * as v from "valibot";

const LoginSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  password: v.pipe(v.string(), v.minLength(8)),
});

export default function LoginScreen() {
  const loginForm = useForm({ schema: LoginSchema });
  const submitForm = handleSubmit(loginForm, (output) => console.log(output));

  return (
    <View>
      <Field of={loginForm} path={["email"]}>
        {(field) => (
          <TextInput
            {...field.props}
            value={field.input}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        )}
      </Field>
      <Field of={loginForm} path={["password"]}>
        {(field) => (
          <TextInput {...field.props} value={field.input} secureTextEntry />
        )}
      </Field>
      <Button title="Login" onPress={submitForm} />
    </View>
  );
}
```

React Native text inputs are controlled, so always pass `value={field.input}`. Use `field.onChange(value)` for switches, sliders, pickers, and non-string values.

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
        <input v-model="field.input" v-bind="field.props" type="email" />
        <div v-if="field.errors">{{ field.errors[0] }}</div>
      </div>
    </Field>
    <Field :of="loginForm" :path="['password']" v-slot="field">
      <div>
        <input v-model="field.input" v-bind="field.props" type="password" />
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
  const loginForm = useForm$(() => ({
    schema: LoginSchema,
  }));

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

  // Optional: Empty values for required fields without initial input
  // Required strings default to ''; number, boolean, and date to undefined
  emptyInput: {
    number: 0,
  },

  // Optional: When first validation occurs
  // Options: 'initial' | 'touch' | 'input' | 'change' | 'blur' | 'submit' (default)
  validate: "submit",

  // Optional: When a field is validated again once it already has an
  // error or the form has been submitted
  // Options: 'touch' | 'input' (default) | 'change' | 'blur' | 'submit'
  revalidate: "input",
});
```

In Qwik, `useForm$` must receive a function that returns the config, e.g. `useForm$(() => ({ schema: MySchema }))`. This allows Qwik to convert the config into a QRL.

Optional and nullable fields remain `undefined`. `emptyInput` only supplies fallbacks for required fields whose input is `undefined`.

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
import {
  getDeepError,
  getDeepErrorEntries,
  getDeepErrorEntry,
  getDeepErrors,
  getErrors,
  getInput,
} from "@formisch/react";

// Get field value
const email = getInput(form, { path: ["email"] });

// Get entire form input
const allInputs = getInput(form);

// Get field errors
const emailErrors = getErrors(form, { path: ["email"] });

// Get all errors across all fields (including form-level errors)
const allErrors = getDeepErrors(form);

// Get all errors of a field and its descendants
const todoErrors = getDeepErrors(form, { path: ["todos"] });

// Get every error together with its field path
const errorEntries = getDeepErrorEntries(form);

// Get only the first error of a field and its descendants
const firstTodoError = getDeepError(form, { path: ["todos"] });

// Get only the first error together with its field path
const firstErrorEntry = getDeepErrorEntry(form);
```

Form-level `form.errors` and `getErrors(form)` contain only root-level errors. Use the deep-error methods when descendant field errors are needed. The singular variants `getDeepError` and `getDeepErrorEntry` stop at the first field with errors, which is useful for showing a single message for a nested structure.

### Reading Dirty State

```ts
import {
  getDirtyInput,
  getDirtyPaths,
  isDirty,
  pickDirty,
} from "@formisch/react";

// Raw dirty form input, or undefined when nothing is dirty
const dirtyInput = getDirtyInput(form);

// Paths of dirty fields (arrays are treated as atomic values)
const dirtyPaths = getDirtyPaths(form);

// Cheap boolean check when the dirty values are not needed
const hasChanges = isDirty(form);

// Boolean check scoped to a field and its descendants
const emailChanged = isDirty(form, { path: ["email"] });

// In a submit handler, keep transformed output only where fields are dirty
const dirtyOutput = pickDirty(form, { from: output });
```

`getDirtyInput` returns raw form input. `pickDirty` applies the form's dirty mask to a supplied value, which is useful for validated and transformed submit output.

The sibling methods `isTouched`, `isEdited`, and `isValid` follow the same pattern as `isDirty`. Each checks the entire form when called without a config, or a specific field and its descendants when called with a `path`.

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

// Reset a single field
reset(form, { path: ["email"] });

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

`reset` also accepts the flags `keepTouched`, `keepEdited`, and `keepErrors`. The form-level reset additionally accepts `keepSubmitted`. All flags default to `false`.

### Form Control

```ts
import { validate, focus, submit, handleSubmit } from "@formisch/react";

// Validate form manually (returns a Promise of a Valibot SafeParseResult)
const result = await validate(form);
if (result.success) {
  console.log(result.output);
} else {
  console.log(result.issues);
}

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

`submit` requires a registered DOM form and is not exported by `@formisch/react-native`. In React Native and in layouts without a `<form>` element, call the function returned by `handleSubmit` instead.

## Field Arrays

For dynamic lists of fields, use `FieldArray` with array manipulation methods.

The field array store exposes `path`, `items` (stable item IDs for use as keys), `errors`, `isTouched`, `isEdited`, `isDirty`, and `isValid`.

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
import { Form, type FormStore, useForm } from "@formisch/react";

export default function LoginPage() {
  const loginForm = useForm({ schema: LoginSchema });
  return <FormContent of={loginForm} />;
}

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

The `v.GenericSchema<{ email: string }>` constraint accepts any form whose schema contains an `email` field of type `string`. TypeScript catches mismatches at compile time.

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

| Value       | Description                                    |
| ----------- | ---------------------------------------------- |
| `'initial'` | Validate immediately on form creation          |
| `'touch'`   | Validate when a field is first focused         |
| `'input'`   | Validate on every input event                  |
| `'change'`  | Validate on change events (value is committed) |
| `'blur'`    | Validate when field loses focus                |
| `'submit'`  | Validate only on form submission (default)     |

### revalidate Option

Controls when a field is validated **again**, once it already has an error or the form has been submitted:

| Value      | Description                                      |
| ---------- | ------------------------------------------------ |
| `'touch'`  | Revalidate when a field is first focused         |
| `'input'`  | Revalidate on every input event (default)        |
| `'change'` | Revalidate on change events (value is committed) |
| `'blur'`   | Revalidate when field loses focus                |
| `'submit'` | Revalidate only on form submission               |

## Special Inputs

### Select (Single)

```tsx
<Field of={form} path={["framework"]}>
  {(field) => (
    <select {...field.props} value={field.input ?? ""}>
      {options.map(({ label, value }) => (
        <option key={value} value={value}>
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
    <select {...field.props} value={field.input ?? []} multiple>
      {options.map(({ label, value }) => (
        <option key={value} value={value}>
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
import { useEffect } from "react";

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

The `useFieldArray` hook is the equivalent counterpart of the `FieldArray` component. In Angular, use the `injectField` and `injectFieldArray` functions or the `*formischField` and `*formischFieldArray` directives.

## Using Component Libraries

When using component libraries that don't expose their underlying native elements, you cannot spread `field.props` directly. Instead, update the value programmatically with `field.onChange` (React and React Native), `field.onInput` (Solid, Svelte, Preact, and Qwik), `field.setInput` (Angular), or by assigning to `field.input` (Vue):

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

These setters update the field value and trigger validation, just like a native input would.

This is useful for:

- **Component libraries** that wrap native elements without exposing them
- **Complex custom inputs** like date pickers, rich text editors, or color pickers

## Async Submission

```tsx
import { setErrors, useForm } from "@formisch/react";
import type { SubmitHandler } from "@formisch/react";

const loginForm = useForm({ schema: LoginSchema });

const handleSubmit: SubmitHandler<typeof LoginSchema> = async (output) => {
  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(output),
    });

    if (!response.ok) {
      // Set server-side errors
      const data = await response.json();
      setErrors(loginForm, { path: ["email"], errors: [data.error] });
    }
  } catch (error) {
    console.error("Submission failed:", error);
  }
};
```

The form's `isSubmitting` state stays `true` until the async handler resolves. If the handler throws, Formisch catches the error and sets its message as a root-level form error on `form.errors`.

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
const handleSubmit: SubmitHandler<typeof Schema> = async (output) => {
  await saveData(output);

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
<Form of={form} onSubmit={handleSubmit}>
  <Field of={form} path={["hasAccount"]}>
    {(field) => (
      <input {...field.props} type="checkbox" checked={field.input} />
    )}
  </Field>
  {getInput(form, { path: ["hasAccount"] }) && (
    <Field of={form} path={["accountId"]}>
      {(field) => <input {...field.props} value={field.input} />}
    </Field>
  )}
</Form>
```

In React, calling `getInput` during render is reactive because `useForm` and `useField` enable signal tracking in the component that calls them. In the other frameworks, the read is tracked by their own reactive scopes.

## Additional Resources

- [Formisch Documentation](https://formisch.dev/)
- [Formisch Coding Agents Guide](https://formisch.dev/react/guides/coding-agents/)
- Formisch MCP server: `https://formisch.dev/mcp` (`search_docs`, `get_doc`, and `list_docs`)
- Append `.md` to any documentation URL for agent-friendly Markdown, or use `https://formisch.dev/llms-{framework}.txt` for a framework-specific index
- [Formisch GitHub](https://github.com/open-circle/formisch)
- [Valibot Documentation](https://valibot.dev/)
