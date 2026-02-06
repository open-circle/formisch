<script lang="ts">
  import { Field, Form, createForm, getInput } from '@formisch/svelte';
  import * as v from 'valibot';
  import { FormFooter, FormHeader, Select, TextInput } from '$lib/components';

  const PaymentFormSchema = v.intersect([
    v.object({
      owner: v.pipe(
        v.string('Please enter your name.'),
        v.nonEmpty('Please enter your name.')
      ),
    }),
    v.variant(
      'type',
      [
        v.object({
          type: v.literal('card'),
          card: v.object({
            number: v.pipe(
              v.string('Please enter your card number.'),
              v.nonEmpty('Please enter your card number.'),
              v.creditCard('The card number is badly formatted.')
            ),
            expiration: v.pipe(
              v.string('Please enter the expiration date.'),
              v.nonEmpty('Please enter the expiration date.'),
              v.regex(
                /^(?:0[1-9]|1[0-2])\/(?:2[5-9]|3[0-9])$/,
                'The expiration date is badly formatted.'
              )
            ),
          }),
        }),
        v.object({
          type: v.literal('paypal'),
          paypal: v.object({
            email: v.pipe(
              v.string('Please enter your PayPal email.'),
              v.nonEmpty('Please enter your PayPal email.'),
              v.email('The email address is badly formatted.')
            ),
          }),
        }),
      ],
      'Please select the payment type.'
    ),
  ]);

  const paymentForm = createForm({
    schema: PaymentFormSchema,
  });

  const type = $derived(getInput(paymentForm, { path: ['type'] }));
</script>

<svelte:head>
  <title>Payment form</title>
</svelte:head>

<Form of={paymentForm} onsubmit={(output, _) => console.log(output)}>
  <div class="space-y-12 md:space-y-14 lg:space-y-16">
    <FormHeader of={paymentForm} heading="Payment form" />
    <div class="space-y-8 md:space-y-10 lg:space-y-12">
      <Field of={paymentForm} path={['owner']}>
        {#snippet children(field)}
          <TextInput
            {...field.props}
            input={field.input}
            errors={field.errors}
            type="text"
            label="Owner"
            placeholder="John Doe"
            required
          />
        {/snippet}
      </Field>
      <Field of={paymentForm} path={['type']}>
        {#snippet children(field)}
          <Select
            {...field.props}
            input={field.input}
            options={[
              { label: 'Card', value: 'card' },
              { label: 'PayPal', value: 'paypal' },
            ]}
            errors={field.errors}
            label="Type"
            placeholder="Card or PayPal?"
            required
          />
        {/snippet}
      </Field>
      {#if type === 'card'}
        <Field of={paymentForm} path={['card', 'number']}>
          {#snippet children(field)}
            <TextInput
              {...field.props}
              input={field.input}
              errors={field.errors}
              type="text"
              label="Number"
              placeholder="1234 1234 1234 1234"
              required
            />
          {/snippet}
        </Field>
        <Field of={paymentForm} path={['card', 'expiration']}>
          {#snippet children(field)}
            <TextInput
              {...field.props}
              input={field.input}
              errors={field.errors}
              type="text"
              label="Expiration"
              placeholder="MM/YY"
              required
            />
          {/snippet}
        </Field>
      {/if}
      {#if type === 'paypal'}
        <Field of={paymentForm} path={['paypal', 'email']}>
          {#snippet children(field)}
            <TextInput
              {...field.props}
              input={field.input}
              errors={field.errors}
              type="email"
              label="Email"
              placeholder="example@email.com"
              required
            />
          {/snippet}
        </Field>
      {/if}
    </div>
    <FormFooter of={paymentForm} />
  </div>
</Form>
