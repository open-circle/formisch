<script lang="ts">
  import type {
    FormConfig,
    RequiredPath,
    FormSchema,
    SubmitHandler,
  } from '@formisch/core/svelte';
  import { Form } from '../components/Form/index.ts';
  import { createForm } from '../runes/createForm/createForm.svelte.ts';
  import { useField } from '../runes/useField/useField.svelte.ts';
  // Test fixture: generic parameters are deliberately untyped because Svelte
  // component generics don't survive @testing-library/svelte's `render()`
  // signature. We accept a permissive `RequiredPath` and cast internally.

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const noop: SubmitHandler<any> = () => {};

  let {
    config,
    path,
    onMounted,
    onsubmit = noop,
  }: {
    config: FormConfig<FormSchema>;
    path: RequiredPath;
    onMounted?: (form: any, field: any) => void;
    onsubmit?: SubmitHandler<any>;
  } = $props();
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const form = createForm(config);
  const field = useField(
    () => form,
    () => ({ path: path as never })
  );

  onMounted?.(form, field);
</script>

<Form of={form} {onsubmit} aria-label="Test">
  <input data-testid="input" {...field.props} value={field.input ?? ''} />
  <span data-testid="touched">{String(field.isTouched)}</span>
  <span data-testid="dirty">{String(field.isDirty)}</span>
  <span data-testid="valid">{String(field.isValid)}</span>
  {#if field.errors}
    <span data-testid="error">{field.errors[0]}</span>
  {/if}
  <button type="submit">Submit</button>
</Form>
