# Formisch for Vue

Formisch is a schema-based, headless form library for Vue. It manages form state and validation. It is type-safe, fast by default and its bundle size is small due to its modular design. Try it out in our [playground](https://stackblitz.com/edit/formisch-playground-vue)!

Formisch is also available for [Preact][formisch-preact], [Qwik][formisch-qwik], [React][formisch-react], [SolidJS][formisch-solid] and [Svelte][formisch-svelte].

## Highlights

- Small bundle size starting at 2.5 kB
- Schema-based validation with Valibot
- Type safety with autocompletion in editor
- It's fast – DOM updates are fine-grained
- Minimal, readable and well thought out API
- Supports all native HTML form fields

## Example

Every form starts with the `useForm` composable. It initializes your form's store based on the provided Valibot schema and infers its types. Next, wrap your form in the `<Form />` component. It's a thin layer around the native `<form />` element that handles form validation and submission. Then, you can access the state of a field with the `useField` composable or the `<Field />` component to connect your inputs.

```vue
<script setup lang="ts">
import { Field, Form, useForm } from '@formisch/vue';
import * as v from 'valibot';

const LoginSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  password: v.pipe(v.string(), v.minLength(8)),
});

const loginForm = useForm({ schema: LoginSchema });
</script>

<template>
  <Form :of="loginForm" @submit="(output) => console.log(output)">
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

In addition, Formisch offers several functions (we call them "methods") that can be used to read and manipulate the form state. These include `focus`, `getErrors`, `getAllErrors`, `getInput`, `insert`, `move`, `remove`, `replace`, `reset`, `setErrors`, `setInput`, `submit`, `swap` and `validate`. These methods allow you to control the form programmatically.

## Comparison

What makes Formisch unique is its framework-agnostic core, which is fully native to the framework you are using. It works by inserting framework-specific reactivity blocks when the core package is built. The result is a small bundle size and native performance for any UI update. This feature, along with a few others, distinguishes Formisch from other form libraries. My vision for Formisch is to create a framework-agnostic platform similar to [Vite](https://vite.dev/), but for forms.

## Partners

Thanks to our partners who support the development! [Join them](https://github.com/sponsors/fabian-hiller) and contribute to the sustainability of open source software!

![Partners of Formisch](https://github.com/open-circle/formisch/blob/main/partners.webp?raw=true)

## Feedback

Find a bug or have an idea how to improve the library? Please fill out an [issue](https://github.com/open-circle/formisch/issues/new). Together we can make forms even better!

## License

This project is available free of charge and licensed under the [MIT license](https://github.com/open-circle/formisch/blob/main/LICENSE.md).

[formisch-preact]: https://github.com/open-circle/formisch/tree/main/frameworks/preact
[formisch-qwik]: https://github.com/open-circle/formisch/tree/main/frameworks/qwik
[formisch-react]: https://github.com/open-circle/formisch/tree/main/frameworks/react
[formisch-solid]: https://github.com/open-circle/formisch/tree/main/frameworks/solid
[formisch-svelte]: https://github.com/open-circle/formisch/tree/main/frameworks/svelte
