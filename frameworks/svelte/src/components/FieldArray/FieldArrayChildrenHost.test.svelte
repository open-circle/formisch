<script lang="ts">
  import * as v from 'valibot';
  import { createForm } from '../../runes/createForm/createForm.svelte.ts';
  import { FieldArray } from './index.ts';

  const schema = v.object({ items: v.array(v.string()) });
  const form = createForm({ schema });
</script>

<FieldArray of={form} path={['items']}>
  {#snippet children()}
    <span data-testid="content">hello</span>
  {/snippet}
</FieldArray>
