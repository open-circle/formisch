<script lang="ts" generics="TSchema extends Schema">
  import type { Schema, SubmitEventHandler } from '@formisch/core/svelte';
  import * as v from 'valibot';
  import { createForm } from '../../runes/createForm/createForm.svelte.ts';
  import { Form } from './index.ts';

  let {
    schema,
    onsubmit,
  }: {
    schema: TSchema;
    onsubmit: SubmitEventHandler<TSchema>;
  } = $props();

  void v;
  const form = createForm({ schema });
</script>

<Form of={form} {onsubmit} aria-label="Test" class="my-form" id="signup">
  <span data-testid="child">child</span>
</Form>
