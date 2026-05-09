<script lang="ts">
  import * as v from 'valibot';
  import { createForm } from '../../runes/createForm/createForm.svelte.ts';
  import { Field } from './index.ts';

  const schema = v.object({ name: v.string() });
  const form = createForm({ schema });
</script>

<Field of={form} path={['name']}>
  {#snippet children()}
    <span data-testid="content">hello</span>
  {/snippet}
</Field>
