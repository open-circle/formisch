# Formisch for Angular

Formisch is a schema-based, headless form library for Angular. It manages form state and validation. It is type-safe, fast by default and its bundle size is small due to its modular design.

Formisch is also available for [Preact][formisch-preact], [Qwik][formisch-qwik], [React][formisch-react], [React Native][formisch-react-native], [SolidJS][formisch-solid], [Svelte][formisch-svelte] and [Vue][formisch-vue].

## Highlights

- Small bundle size due to modular design
- Schema-based validation with Valibot
- Type safety with autocompletion in editor, including fully typed templates
- Open source and fully tested with 100 % coverage
- It's fast – fine-grained updates powered by Angular Signals
- Works with zoneless change detection and `OnPush` components
- Minimal, readable and well thought out API
- Supports all native HTML form fields

## Example

Every form starts with the `injectForm` function. It initializes your form's store based on the provided Valibot schema and infers its types. Next, add the `[formischForm]` directive to your native `<form>` element. It handles form validation and submission. Then, create a field with the `*formischField` directive (or the `injectField` function in your component class) and bind it to your input with the `[formischControl]` directive, which syncs the value, the `name` and `aria-invalid` attributes, and all event handlers for you.

```ts
import { Component } from '@angular/core';
import {
  FormischControl,
  FormischField,
  FormischForm,
  injectForm,
} from '@formisch/angular';
import * as v from 'valibot';

const LoginSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  password: v.pipe(v.string(), v.minLength(8)),
});

@Component({
  selector: 'app-login',
  imports: [FormischForm, FormischField, FormischControl],
  template: `
    <form [formischForm]="loginForm" [formischSubmit]="handleSubmit">
      <div *formischField="['email'] of loginForm; let field">
        <input [formischControl]="field" type="email" />
        @if (field.errors(); as errors) {
          <div>{{ errors[0] }}</div>
        }
      </div>
      <div *formischField="['password'] of loginForm; let field">
        <input [formischControl]="field" type="password" />
        @if (field.errors(); as errors) {
          <div>{{ errors[0] }}</div>
        }
      </div>
      <button type="submit">Login</button>
    </form>
  `,
})
export class LoginComponent {
  readonly loginForm = injectForm({ schema: LoginSchema });

  readonly handleSubmit = (output: v.InferOutput<typeof LoginSchema>) => {
    console.log(output);
  };
}
```

In addition, Formisch offers several functions (we call them "methods") that can be used to read and manipulate the form state. These include `focus`, `getDeepErrorEntries`, `getDeepErrors`, `getDirtyInput`, `getDirtyPaths`, `getErrors`, `getInput`, `handleSubmit`, `insert`, `isDirty`, `isEdited`, `isTouched`, `isValid`, `move`, `pickDirty`, `remove`, `replace`, `reset`, `setErrors`, `setInput`, `submit`, `swap` and `validate`. These methods allow you to control the form programmatically.

## Coming from Angular forms

Formisch maps naturally onto what you already know from Reactive Forms and Signal Forms:

| Reactive Forms         | Signal Forms             | Formisch                             |
| ---------------------- | ------------------------ | ------------------------------------ |
| `[formGroup]="form"`   | –                        | `[formischForm]="form"`              |
| `[formControl]="ctrl"` | `[formField]="f.email"`  | `[formischControl]="field"`          |
| `(ngSubmit)="save()"`  | `submit(form, action)`   | `[formischSubmit]="handleSubmit"`    |
| `new FormControl('')`  | `form(model).email`      | `injectField(form, { path: [...] })` |
| `form.valid`           | `form().valid()`         | `form.isValid()`                     |
| `Validators.required`  | schema fn / Zod, Valibot | Valibot schema                       |

Like Reactive Forms' `[formControl]` and Signal Forms' `[formField]`, the `[formischControl]` directive writes the field state into the element – there is no manual `[value]` or `[checked]` binding. Validation lives in one place, your Valibot schema, from which all input, output and path types are inferred.

Unlike `(ngSubmit)="save()"`, `[formischSubmit]` takes your handler instead of calling it. This allows Formisch to await it and keep `form.isSubmitting()` up to date while an async submit is pending. Make sure to declare your handler as an arrow function property, like in the example above. A regular class method would lose its `this`.

## Comparison

What makes Formisch unique is its framework-agnostic core, which is fully native to the framework you are using. It works by inserting framework-specific reactivity blocks when the core package is built, giving you native performance for any UI update. A modular methods API keeps bundles small by only including the methods you import, and end-to-end type safety covers deeply nested paths and field arrays with TypeScript inference that stays fast even as forms grow.

For a side-by-side look at how Formisch compares to Reactive Forms, Signal Forms and TanStack Form, see the [comparison guide](https://formisch.dev/angular/guides/comparison/).

## Vision

My vision for Formisch is to create a framework-agnostic platform similar to [Vite](https://vite.dev/), but for forms — a shared core that lets the same mental model and codebase work natively across every modern UI framework.

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
[formisch-react-native]: https://github.com/open-circle/formisch/tree/main/frameworks/react-native
[formisch-solid]: https://github.com/open-circle/formisch/tree/main/frameworks/solid
[formisch-svelte]: https://github.com/open-circle/formisch/tree/main/frameworks/svelte
[formisch-vue]: https://github.com/open-circle/formisch/tree/main/frameworks/vue
