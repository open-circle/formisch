# Dynamic Invoice Form — Formisch + Svelte 5

A minimal, standalone [Vite](https://vite.dev) + [Svelte 5](https://svelte.dev) example that builds a dynamic invoice form with [Formisch](https://formisch.dev) and [Valibot](https://valibot.dev).

It demonstrates the ideas from the guide [_Building a Dynamic Invoice Form in Svelte 5 with Formisch_](https://formisch.dev/blog/dynamic-invoice-form-svelte/):

- A single Valibot schema as the source of truth for structure, validation and typed output
- Nested fields (`client.name`, `client.email`) wired with `Field`
- Dynamic line items with `FieldArray`, plus `insert` / `remove`
- Live totals derived from the form input with Svelte 5's `$derived`
- Typed, validated output on submit and one-call `reset`

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL.

## Scripts

| Command           | Description                              |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Start the Vite dev server                |
| `npm run build`   | Build for production into `dist/`        |
| `npm run preview` | Preview the production build             |
| `npm run check`   | Type-check the project with svelte-check |

## Project structure

```
src/
├── App.svelte        # The invoice form (fields, array, totals, submit)
├── schema.ts         # Valibot InvoiceSchema + inferred InvoiceOutput type
├── main.ts           # App entry point
└── app.css           # Minimal styling
```
