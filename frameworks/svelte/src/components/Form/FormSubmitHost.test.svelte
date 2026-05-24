<script lang="ts" generics="TSchema extends FormSchema">
  import type {
    DeepPartial,
    FormSchema,
    SubmitEventHandler,
  } from '@formisch/core/svelte';
  import type * as v from 'valibot';
  import { createForm } from '../../runes/createForm/createForm.svelte.ts';
  import { Form } from './index.ts';

  let {
    schema,
    initialInput,
    onsubmit,
  }: {
    schema: TSchema;
    initialInput?: DeepPartial<v.InferInput<TSchema>>;
    onsubmit: SubmitEventHandler<TSchema>;
  } = $props();

  const form = createForm({ schema, initialInput });
</script>

<Form of={form} {onsubmit} aria-label="Test">
  <span data-testid="valid">{String(form.isValid)}</span>
  <button type="submit">Submit</button>
</Form>
