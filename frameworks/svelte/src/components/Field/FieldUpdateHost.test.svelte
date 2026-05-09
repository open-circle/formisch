<script lang="ts">
  import * as v from 'valibot';
  import { createForm } from '../../runes/createForm/createForm.svelte.ts';
  import { Field } from './index.ts';

  const schema = v.object({ name: v.string() });
  const form = createForm({ schema, initialInput: { name: 'initial' } });
</script>

<Field of={form} path={['name']}>
  {#snippet children(field)}
    <input data-testid="input" {...field.props} value={field.input ?? ''} />
    <span data-testid="dirty">{String(field.isDirty)}</span>
  {/snippet}
</Field>
