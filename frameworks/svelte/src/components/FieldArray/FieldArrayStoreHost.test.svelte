<script lang="ts">
  import * as v from 'valibot';
  import { createForm } from '../../runes/createForm/createForm.svelte.ts';
  import type { FieldArrayStore } from '../../types/index.ts';
  import { FieldArray } from './index.ts';

  const schema = v.object({ items: v.array(v.string()) });
  type FormSchema = typeof schema;

  let {
    onField,
  }: {
    onField: (field: FieldArrayStore<FormSchema, ['items']>) => void;
  } = $props();

  const form = createForm({ schema, initialInput: { items: ['a', 'b'] } });
</script>

<FieldArray of={form} path={['items']}>
  {#snippet children(field)}
    <!-- Snippets cannot run statements directly, so the only way to forward
         `field` to the test is to invoke `onField` from a {@const} expression. -->
    {@const _ = onField(field)}
    <span data-testid="count">{field.items.length}</span>
  {/snippet}
</FieldArray>
