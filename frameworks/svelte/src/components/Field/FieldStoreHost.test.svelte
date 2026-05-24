<script lang="ts">
  import * as v from 'valibot';
  import { createForm } from '../../runes/createForm/createForm.svelte.ts';
  import type { FieldStore } from '../../types/index.ts';
  import { Field } from './index.ts';

  const schema = v.object({ name: v.string() });
  type FormSchema = typeof schema;

  let {
    onField,
  }: {
    onField: (field: FieldStore<FormSchema, ['name']>) => void;
  } = $props();

  const form = createForm({ schema, initialInput: { name: 'John' } });
</script>

<Field of={form} path={['name']}>
  {#snippet children(field)}
    <!-- Snippets cannot run statements directly, so the only way to forward
         `field` to the test is to invoke `onField` from a {@const} expression. -->
    {@const _ = onField(field)}
    <span data-testid="name">{field.props.name}</span>
  {/snippet}
</Field>
