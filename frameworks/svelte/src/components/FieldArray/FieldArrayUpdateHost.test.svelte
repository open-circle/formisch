<script lang="ts">
  import { insert } from '@formisch/methods/svelte';
  import * as v from 'valibot';
  import { createForm } from '../../runes/createForm/createForm.svelte.ts';
  import { FieldArray } from './index.ts';

  const schema = v.object({ items: v.array(v.string()) });
  const form = createForm({ schema, initialInput: { items: ['a', 'b'] } });
</script>

<div>
  <button
    type="button"
    onclick={() => insert(form, { path: ['items'], initialInput: 'c' })}
  >
    Add
  </button>
  <FieldArray of={form} path={['items']}>
    {#snippet children(field)}
      <span data-testid="count">{field.items.length}</span>
    {/snippet}
  </FieldArray>
</div>
