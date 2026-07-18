<script lang="ts">
  import {
    createForm,
    Field,
    FieldArray,
    Form,
    getInput,
    insert,
    remove,
    reset,
    type SubmitHandler,
  } from '@formisch/svelte';
  import { InvoiceSchema, type InvoiceOutput } from './schema';

  // Create the form from the schema. The initial input holds the editable
  // input state, so numeric fields start as strings — the schema transforms
  // them into numbers when the form is validated.
  const invoiceForm = createForm({
    schema: InvoiceSchema,
    initialInput: {
      invoiceNumber: 'INV-001',
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: '',
      client: { name: '', email: '' },
      lineItems: [{ description: '', quantity: '1', unitPrice: '0' }],
      taxRate: '7.5',
      discount: '0',
      notes: '',
    },
  });

  // Add and remove dynamic line items.
  function addLineItem() {
    insert(invoiceForm, {
      path: ['lineItems'],
      initialInput: { description: '', quantity: '1', unitPrice: '0' },
    });
  }

  function removeLineItem(index: number) {
    remove(invoiceForm, { path: ['lineItems'], at: index });
  }

  // Coerce a raw input string to a finite number, falling back to 0 while a
  // field is empty or mid-edit so the live totals never flash "NaN".
  function toNumber(value: unknown): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  // Derive each input the totals depend on individually, so every value stays
  // reactive and only recomputes when its own field changes.
  const taxRate = $derived(getInput(invoiceForm, { path: ['taxRate'] }));
  const discount = $derived(getInput(invoiceForm, { path: ['discount'] }));
  const lineItems = $derived(getInput(invoiceForm, { path: ['lineItems'] }));

  const totals = $derived.by(() => {
    const subtotal = lineItems.reduce(
      (sum, item) => sum + toNumber(item.quantity) * toNumber(item.unitPrice),
      0
    );
    const tax = subtotal * (toNumber(taxRate) / 100);
    const discountAmount = toNumber(discount);
    const total = Math.max(subtotal + tax - discountAmount, 0);
    return { subtotal, tax, discount: discountAmount, total };
  });

  function getLineTotal(index: number): number {
    const item = lineItems[index];
    if (!item) return 0;
    return toNumber(item.quantity) * toNumber(item.unitPrice);
  }

  // The value passed here is the validated, transformed schema output, not the
  // raw input — numeric fields are already numbers.
  let submittedInvoice = $state<InvoiceOutput | null>(null);

  const submitInvoice: SubmitHandler<typeof InvoiceSchema> = (output) => {
    submittedInvoice = output;
    console.log('Invoice submitted:', output);
  };

  function resetInvoice() {
    submittedInvoice = null;
    reset(invoiceForm);
  }

  const currency = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });
</script>

<main class="page">
  <h1>Dynamic Invoice Form</h1>
  <p class="subtitle">Built with Formisch, Valibot and Svelte 5 runes.</p>

  <Form of={invoiceForm} onsubmit={submitInvoice}>
    <fieldset>
      <legend>Invoice details</legend>
      <div class="grid">
        <Field of={invoiceForm} path={['invoiceNumber']}>
          {#snippet children(field)}
            <div class="field">
              <label>
                Invoice number
                <input {...field.props} value={field.input} type="text" />
              </label>
              {#if field.errors}
                <p class="error">{field.errors[0]}</p>
              {/if}
            </div>
          {/snippet}
        </Field>

        <div></div>

        <Field of={invoiceForm} path={['issueDate']}>
          {#snippet children(field)}
            <div class="field">
              <label>
                Issue date
                <input {...field.props} value={field.input} type="date" />
              </label>
              {#if field.errors}
                <p class="error">{field.errors[0]}</p>
              {/if}
            </div>
          {/snippet}
        </Field>

        <Field of={invoiceForm} path={['dueDate']}>
          {#snippet children(field)}
            <div class="field">
              <label>
                Due date
                <input {...field.props} value={field.input} type="date" />
              </label>
              {#if field.errors}
                <p class="error">{field.errors[0]}</p>
              {/if}
            </div>
          {/snippet}
        </Field>
      </div>
    </fieldset>

    <fieldset>
      <legend>Client</legend>
      <div class="grid">
        <Field of={invoiceForm} path={['client', 'name']}>
          {#snippet children(field)}
            <div class="field">
              <label>
                Name
                <input {...field.props} value={field.input} type="text" />
              </label>
              {#if field.errors}
                <p class="error">{field.errors[0]}</p>
              {/if}
            </div>
          {/snippet}
        </Field>

        <Field of={invoiceForm} path={['client', 'email']}>
          {#snippet children(field)}
            <div class="field">
              <label>
                Email
                <input {...field.props} value={field.input} type="email" />
              </label>
              {#if field.errors}
                <p class="error">{field.errors[0]}</p>
              {/if}
            </div>
          {/snippet}
        </Field>
      </div>
    </fieldset>

    <fieldset>
      <legend>Line items</legend>
      <FieldArray of={invoiceForm} path={['lineItems']}>
        {#snippet children(fieldArray)}
          {#each fieldArray.items as item, index (item)}
            <div class="line-item">
              <div class="line-item-header">
                <strong>Item {index + 1}</strong>
                <button
                  type="button"
                  class="btn-ghost"
                  onclick={() => removeLineItem(index)}
                  disabled={fieldArray.items.length === 1}
                >
                  Remove
                </button>
              </div>

              <div class="line-item-fields">
                <Field
                  of={invoiceForm}
                  path={['lineItems', index, 'description']}
                >
                  {#snippet children(field)}
                    <div class="field">
                      <label>
                        Description
                        <input
                          {...field.props}
                          value={field.input}
                          type="text"
                        />
                      </label>
                      {#if field.errors}
                        <p class="error">{field.errors[0]}</p>
                      {/if}
                    </div>
                  {/snippet}
                </Field>

                <Field of={invoiceForm} path={['lineItems', index, 'quantity']}>
                  {#snippet children(field)}
                    <div class="field">
                      <label>
                        Quantity
                        <input
                          {...field.props}
                          value={field.input}
                          type="number"
                          min="1"
                        />
                      </label>
                      {#if field.errors}
                        <p class="error">{field.errors[0]}</p>
                      {/if}
                    </div>
                  {/snippet}
                </Field>

                <Field
                  of={invoiceForm}
                  path={['lineItems', index, 'unitPrice']}
                >
                  {#snippet children(field)}
                    <div class="field">
                      <label>
                        Unit price
                        <input
                          {...field.props}
                          value={field.input}
                          type="number"
                          min="0"
                          step="0.01"
                        />
                      </label>
                      {#if field.errors}
                        <p class="error">{field.errors[0]}</p>
                      {/if}
                    </div>
                  {/snippet}
                </Field>
              </div>

              <p class="line-total">
                Line total: {currency.format(getLineTotal(index))}
              </p>
            </div>
          {/each}

          {#if fieldArray.errors}
            <p class="error">{fieldArray.errors[0]}</p>
          {/if}

          <button
            type="button"
            class="btn-secondary"
            onclick={addLineItem}
            disabled={fieldArray.items.length >= 10}
          >
            Add item
          </button>
        {/snippet}
      </FieldArray>
    </fieldset>

    <fieldset>
      <legend>Summary</legend>
      <div class="grid">
        <Field of={invoiceForm} path={['taxRate']}>
          {#snippet children(field)}
            <div class="field">
              <label>
                Tax rate (%)
                <input
                  {...field.props}
                  value={field.input}
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </label>
              {#if field.errors}
                <p class="error">{field.errors[0]}</p>
              {/if}
            </div>
          {/snippet}
        </Field>

        <Field of={invoiceForm} path={['discount']}>
          {#snippet children(field)}
            <div class="field">
              <label>
                Discount
                <input
                  {...field.props}
                  value={field.input}
                  type="number"
                  min="0"
                  step="0.01"
                />
              </label>
              {#if field.errors}
                <p class="error">{field.errors[0]}</p>
              {/if}
            </div>
          {/snippet}
        </Field>
      </div>

      <div class="totals">
        <div class="totals-row">
          <span>Subtotal</span><span>{currency.format(totals.subtotal)}</span>
        </div>
        <div class="totals-row">
          <span>Tax</span><span>{currency.format(totals.tax)}</span>
        </div>
        <div class="totals-row">
          <span>Discount</span><span>-{currency.format(totals.discount)}</span>
        </div>
        <div class="totals-row grand">
          <span>Total</span><span>{currency.format(totals.total)}</span>
        </div>
      </div>
    </fieldset>

    <fieldset>
      <legend>Notes</legend>
      <Field of={invoiceForm} path={['notes']}>
        {#snippet children(field)}
          <div class="field">
            <label>
              Optional notes
              <textarea {...field.props} value={field.input} rows="3"></textarea>
            </label>
            {#if field.errors}
              <p class="error">{field.errors[0]}</p>
            {/if}
          </div>
        {/snippet}
      </Field>
    </fieldset>

    <div class="actions">
      <button
        type="submit"
        class="btn-primary"
        disabled={invoiceForm.isSubmitting || invoiceForm.isValidating}
      >
        {invoiceForm.isSubmitting ? 'Submitting...' : 'Submit invoice'}
      </button>
      <button type="button" class="btn-secondary" onclick={resetInvoice}>
        Reset
      </button>
    </div>
  </Form>

  {#if submittedInvoice}
    <div class="submitted">
      <h2>Submitted invoice</h2>
      <p class="subtitle">
        Typed, validated schema output (also logged to the console).
      </p>
      <pre>{JSON.stringify(submittedInvoice, null, 2)}</pre>
    </div>
  {/if}
</main>
