<script
  lang="ts"
  generics="TSchema extends Schema, TFieldPath extends RequiredPath"
>
  import type {
    FormConfig,
    RequiredPath,
    Schema,
    SubmitHandler,
    ValidPath,
  } from '@formisch/core/svelte';
  import type * as v from 'valibot';
  import { Form } from '../components/Form/index.ts';
  import { createForm } from '../runes/createForm/createForm.svelte.ts';
  import { useField } from '../runes/useField/useField.svelte.ts';
  import type { FieldStore, FormStore } from '../types/index.ts';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const noop: SubmitHandler<any> = () => {};

  let {
    config,
    path,
    onMounted,
    onsubmit = noop,
  }: {
    config: FormConfig<TSchema>;
    path: ValidPath<v.InferInput<TSchema>, TFieldPath>;
    onMounted?: (
      form: FormStore<TSchema>,
      field: FieldStore<TSchema, TFieldPath>
    ) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onsubmit?: SubmitHandler<any>;
  } = $props();

  const form = createForm(config);
  const field = useField(
    () => form,
    () => ({ path })
  );

  onMounted?.(form, field);
</script>

<Form of={form} {onsubmit} aria-label="Test">
  <input
    data-testid="input"
    {...field.props}
    value={field.input ?? ''}
  />
  <span data-testid="touched">{String(field.isTouched)}</span>
  <span data-testid="dirty">{String(field.isDirty)}</span>
  <span data-testid="valid">{String(field.isValid)}</span>
  {#if field.errors}
    <span data-testid="error">{field.errors[0]}</span>
  {/if}
  <button type="submit">Submit</button>
</Form>
